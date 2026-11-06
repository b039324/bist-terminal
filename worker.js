/**
 * BIST Terminal - Cloudflare Worker (KV Destekli)
 * -------------------------------------------------
 * Bu worker şu işleri yapar:
 *  1) Şifre kontrolü (env.AUTH_PASSWORD)
 *  2) Yahoo Finance cookie+crumb bot-koruması akışı
 *  3) Yahoo'nun chart ve quote endpoint'lerine proxy
 *  4) Portföy ve Takip Listesi verilerini KV'de saklama (cihazlar arası senkron)
 *
 * KURULUM:
 *  1) Bu kodu Worker'a yapıştır.
 *  2) Cloudflare Dashboard > Workers & Pages > [Worker Adın] > Settings > Variables
 *     - KV Namespace Bindings → "PORTFOLIO_KV" adında bir KV bağla
 *     - Secret Text → "AUTH_PASSWORD" (şifren)
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}

// ---------------------------------------------------------------------
// Yahoo cookie + crumb (v2): crumb KV'de saklanır, isolate değişse de yeniden alınmaz.
// Yahoo 429/401 verirse önbellek sıfırlanıp bir kez yeniden denenir; crumb hiç
// alınamazsa toplu fiyat için crumb gerektirmeyen chart uç noktasına düşülür.
// ---------------------------------------------------------------------
const AUTH_KV_KEY = "yahoo_auth";
const AUTH_TTL_MS = 6 * 60 * 60 * 1000; // taze sayılma süresi
let authCache = null; // bellek-içi
let authFail = null; // crumb alınamazsa 3 dk boyunca Yahoo'ya tekrar tekrar sorma { until, err }

function extractCookie(res) {
  if (typeof res.headers.getSetCookie === "function") {
    const all = res.headers.getSetCookie();
    if (all && all.length) return all.map((c) => c.split(";")[0]).join("; ");
  }
  const single = res.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

function swapHost(u) {
  return u.includes("//query1.") ? u.replace("//query1.", "//query2.") : u.replace("//query2.", "//query1.");
}

async function fetchAuth() {
  let lastErr = null;
  for (const cookieUrl of ["https://fc.yahoo.com/", "https://finance.yahoo.com/quote/AAPL"]) {
    try {
      const cookieRes = await fetch(cookieUrl, { headers: BROWSER_HEADERS, redirect: "manual" });
      const cookie = extractCookie(cookieRes);
      if (!cookie) { lastErr = new Error("Cookie alınamadı."); continue; }
      for (const host of ["query2", "query1"]) {
        const crumbRes = await fetch(`https://${host}.finance.yahoo.com/v1/test/getcrumb`, {
          headers: { ...BROWSER_HEADERS, Cookie: cookie },
        });
        const crumb = (await crumbRes.text()).trim();
        if (crumbRes.ok && crumb && !crumb.includes("<html")) return { cookie, crumb };
        lastErr = new Error(`Crumb alınamadı (status ${crumbRes.status}).`);
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Crumb alınamadı.");
}

async function getAuth(env, force = false) {
  const now = Date.now();
  if (!force && authCache && authCache.expires > now) return authCache;
  let kvAuth = null;
  if (env && env.PORTFOLIO_KV) {
    try { kvAuth = await env.PORTFOLIO_KV.get(AUTH_KV_KEY, "json"); } catch (e) { /* KV okunamadıysa yeniden al */ }
  }
  if (!force && kvAuth && kvAuth.expires > now) { authCache = kvAuth; return kvAuth; }
  if (authFail && authFail.until > now) {
    const stale0 = authCache || kvAuth;
    if (stale0) return stale0;
    throw authFail.err;
  }
  try {
    const a = await fetchAuth();
    authFail = null;
    const rec = { ...a, expires: now + AUTH_TTL_MS };
    authCache = rec;
    if (env && env.PORTFOLIO_KV) {
      try { await env.PORTFOLIO_KV.put(AUTH_KV_KEY, JSON.stringify(rec)); } catch (e) { /* yazılamadıysa bellekte kalır */ }
    }
    return rec;
  } catch (e) {
    authFail = { until: now + 3 * 60 * 1000, err: e };
    const stale = authCache || kvAuth; // yenisi alınamadıysa eskisini kullan
    if (stale) return stale;
    throw e;
  }
}

async function callWithAuth(url, auth) {
  const sep = url.includes("?") ? "&" : "?";
  return fetch(`${url}${sep}crumb=${encodeURIComponent(auth.crumb)}`, {
    headers: { ...BROWSER_HEADERS, Cookie: auth.cookie },
  });
}

async function yahooFetch(url, env) {
  let auth = await getAuth(env);
  let res = await callWithAuth(url, auth);
  if (res.status === 401 || res.status === 403 || res.status === 429) {
    try {
      auth = await getAuth(env, true);
      const retry = await callWithAuth(swapHost(url), auth);
      if (retry.ok || !res.ok) res = retry;
    } catch (e) { /* ilk yanıt döner */ }
  }
  return res;
}

// crumb gerektirmeyen istek (chart); ana ve yedek sunucu denenir
async function yahooPlain(url) {
  let last = null;
  for (const u of [url, swapHost(url)]) {
    try {
      const res = await fetch(u, { headers: BROWSER_HEADERS });
      if (res.ok) return res;
      last = res;
    } catch (e) { /* diğer sunucuyu dene */ }
  }
  if (last) return last;
  throw new Error("Yahoo'ya ulaşılamadı.");
}

// toplu fiyat yedeği: her hisse için chart meta bilgisinden quote benzeri kayıt üretir
async function quotesFromChart(symbols) {
  const out = [];
  let i = 0;
  const worker = async () => {
    while (i < symbols.length) {
      const s = symbols[i++];
      try {
        const res = await yahooPlain(`https://query1.finance.yahoo.com/v8/finance/chart/${s}.IS?range=1d&interval=1d`);
        if (!res.ok) continue;
        const m = (await res.json())?.chart?.result?.[0]?.meta;
        if (!m || m.regularMarketPrice == null) continue;
        const prev = m.previousClose ?? m.chartPreviousClose ?? null;
        out.push({
          symbol: `${s}.IS`,
          shortName: m.shortName || m.longName || s,
          regularMarketPrice: m.regularMarketPrice,
          regularMarketChangePercent: prev ? ((m.regularMarketPrice - prev) / prev) * 100 : null,
          regularMarketPreviousClose: prev,
          regularMarketVolume: m.regularMarketVolume || 0,
        });
      } catch (e) { /* bu hisse atlanır */ }
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, symbols.length) }, worker));
  return out;
}

// ---------------------------------------------------------------------
// v3: kur (USD/TRY, EUR/TRY) ve kripto (CoinGecko ilk 50) uç noktaları
// Önbellek: isolate belleği (kısa) + KV'de "son bilinen iyi değer" (en fazla 15 dakikada bir yazılır,
// KV yazma kotasını yemesin diye). Kaynak hata verirse eski değer "stale: true" ile döner.
// ---------------------------------------------------------------------
const memCache = new Map();
async function cachedLoad(env, key, ttlMs, loader) {
  const now = Date.now();
  const m = memCache.get(key);
  if (m && now - m.t < ttlMs) return { ...m.data };
  try {
    const data = await loader();
    memCache.set(key, { t: now, data, kv: m ? m.kv : 0 });
    if (env.PORTFOLIO_KV && now - (m ? m.kv || 0 : 0) > 15 * 60 * 1000) {
      try { await env.PORTFOLIO_KV.put("cache_" + key, JSON.stringify({ t: now, data })); memCache.get(key).kv = now; } catch (e) { /* KV yazılamadıysa bellek yeter */ }
    }
    return { ...data };
  } catch (e) {
    if (m) return { ...m.data, stale: true, staleSince: m.t };
    if (env.PORTFOLIO_KV) {
      try {
        const rec = await env.PORTFOLIO_KV.get("cache_" + key, "json");
        if (rec) return { ...rec.data, stale: true, staleSince: rec.t };
      } catch (e2) { /* KV okunamadı */ }
    }
    throw e;
  }
}

async function fxRate(pair) {
  const res = await yahooPlain(`https://query1.finance.yahoo.com/v8/finance/chart/${pair}=X?range=1d&interval=1d`);
  if (!res.ok) throw new Error(`${pair}: status ${res.status}`);
  const m = (await res.json())?.chart?.result?.[0]?.meta;
  if (!m || m.regularMarketPrice == null) throw new Error(`${pair}: veri yok`);
  const prev = m.chartPreviousClose ?? m.previousClose ?? null;
  return { pair, price: m.regularMarketPrice, prev, changePct: prev ? ((m.regularMarketPrice - prev) / prev) * 100 : null, time: m.regularMarketTime || null };
}

async function loadFx(pairs) {
  const out = (await Promise.all(pairs.map((p) => fxRate(p).catch(() => null)))).filter(Boolean);
  if (!out.length) throw new Error("Kur verisi alınamadı.");
  return { rates: out, t: Date.now() };
}

const CG_HEADERS = { "User-Agent": BROWSER_HEADERS["User-Agent"], Accept: "application/json" };
async function cgFetch(path) {
  const res = await fetch(`https://api.coingecko.com/api/v3/${path}`, { headers: CG_HEADERS });
  if (!res.ok) throw new Error(`CoinGecko status ${res.status}`);
  return res.json();
}

async function loadCrypto() {
  const [rows, usd] = await Promise.all([
    cgFetch("coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h%2C7d%2C30d"),
    fxRate("USDTRY").catch(() => null),
  ]);
  if (!Array.isArray(rows) || !rows.length) throw new Error("CoinGecko boş liste döndürdü.");
  const coins = rows.map((r) => ({
    id: r.id, sym: String(r.symbol || "").toUpperCase(), name: r.name, rank: r.market_cap_rank,
    price: r.current_price, chg24: r.price_change_percentage_24h_in_currency ?? r.price_change_percentage_24h ?? null,
    chg7: r.price_change_percentage_7d_in_currency ?? null, chg30: r.price_change_percentage_30d_in_currency ?? null,
    mcap: r.market_cap, vol: r.total_volume, hi24: r.high_24h ?? null, lo24: r.low_24h ?? null,
  }));
  return { coins, usdtry: usd ? usd.price : null, t: Date.now() };
}

// CoinGecko günlük fiyat serisini Yahoo chart biçimine çevirir (uygulamanın göstergeleri aynı kodu kullanır)
async function loadCryptoChart(id, days) {
  const d = await cgFetch(`coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
  const byDay = new Map();
  (d.prices || []).forEach(([ms, p]) => { if (p != null) byDay.set(Math.floor(ms / 86400000), { t: Math.floor(ms / 1000), p }); });
  const vmap = new Map();
  (d.total_volumes || []).forEach(([ms, v]) => { if (v != null) vmap.set(Math.floor(ms / 86400000), v); });
  const keys = [...byDay.keys()].sort((a, b) => a - b);
  if (keys.length < 5) throw new Error("Grafik verisi yetersiz.");
  const ts = [], o = [], h = [], l = [], c = [], v = [];
  keys.forEach((k, i) => {
    const cur = byDay.get(k).p, prev = i ? c[i - 1] : cur;
    ts.push(byDay.get(k).t); o.push(prev); c.push(cur); h.push(Math.max(prev, cur)); l.push(Math.min(prev, cur)); v.push(vmap.get(k) ?? 0);
  });
  return { chart: { result: [{ meta: { currency: "USD", regularMarketPrice: c[c.length - 1], chartPreviousClose: c[c.length - 2], approx: true }, timestamp: ts, indicators: { quote: [{ open: o, high: h, low: l, close: c, volume: v }] } }], error: null } };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // --- Şifre kontrolü (GET ve POST/PUT/DELETE için) ---
    let pass = url.searchParams.get("pass") || "";
    if (!pass && (request.method === "POST" || request.method === "PUT" || request.method === "DELETE")) {
      try {
        const body = await request.clone().json();
        pass = body.pass || "";
      } catch (e) {
        // body JSON değilse boş bırak
      }
    }

    if (!env.AUTH_PASSWORD) {
      return json({ error: "Sunucu yapılandırması eksik: AUTH_PASSWORD tanımlı değil." }, 500);
    }
    if (pass !== env.AUTH_PASSWORD) {
      return json({ error: "Yetkisiz erişim. Şifre hatalı." }, 401);
    }

    // =====================================================================
    // PORTFÖY API'leri (KV tabanlı, cihazlar arası senkron)
    // =====================================================================
    if (url.pathname === "/api/portfolio") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "Portföy KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      // GET → Portföyü oku
      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("portfolio");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Portföy okunamadı.", detail: String(e) }, 500);
        }
      }

      // POST → Portföyü kaydet (tam liste olarak)
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const positions = body.positions || [];
          await env.PORTFOLIO_KV.put("portfolio", JSON.stringify(positions));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Portföy kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // TAKİP LİSTESİ API'leri (KV tabanlı)
    // =====================================================================
    if (url.pathname === "/api/watchlist") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      // GET → Takip listesini oku
      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("watchlist");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Takip listesi okunamadı.", detail: String(e) }, 500);
        }
      }

      // POST → Takip listesini kaydet (tam liste olarak)
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const items = body.items || [];
          await env.PORTFOLIO_KV.put("watchlist", JSON.stringify(items));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Takip listesi kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // REALİZE EDİLMİŞ K/Z GEÇMİŞİ (satış işlemleri, KV tabanlı)
    // =====================================================================
    if (url.pathname === "/api/realized") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("realized");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Realize geçmişi okunamadı.", detail: String(e) }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const items = body.items || [];
          await env.PORTFOLIO_KV.put("realized", JSON.stringify(items));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Realize geçmişi kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // KİŞİSEL NOTLAR (hisse başına, KV tabanlı, cihazlar arası senkron)
    // =====================================================================
    if (url.pathname === "/api/notes") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("notes");
          return json(raw ? JSON.parse(raw) : {});
        } catch (e) {
          return json({ error: "Notlar okunamadı.", detail: String(e) }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const notes = body.notes || {};
          await env.PORTFOLIO_KV.put("notes", JSON.stringify(notes));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Notlar kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // PORTFÖY GEÇMİŞİ (günlük anlık görüntüler — zaman içinde getiri grafiği için)
    // =====================================================================
    if (url.pathname === "/api/portfolio_history") {
      if (!env.PORTFOLIO_KV) {
        return json({ error: "KV veritabanı Worker'a bağlanmamış." }, 500);
      }

      if (request.method === "GET") {
        try {
          const raw = await env.PORTFOLIO_KV.get("portfolio_history");
          return json(raw ? JSON.parse(raw) : []);
        } catch (e) {
          return json({ error: "Portföy geçmişi okunamadı.", detail: String(e) }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const snapshots = body.snapshots || [];
          await env.PORTFOLIO_KV.put("portfolio_history", JSON.stringify(snapshots));
          return json({ ok: true });
        } catch (e) {
          return json({ error: "Portföy geçmişi kaydedilemedi.", detail: String(e) }, 500);
        }
      }

      return json({ error: "Desteklenmeyen metod." }, 405);
    }

    // =====================================================================
    // YAHOO FINANCE API'leri
    // =====================================================================

    // --- Toplu (çoklu hisse) anlık veri: Trendler taramasında kullanılır.
    // Yahoo'nun kendi resmi %değişimini (regularMarketChangePercent) doğrudan döner,
    // bu yüzden grafik verisinden manuel hesaplamaya göre daha güvenilirdir ve
    // 100 ayrı istek yerine tek/birkaç istekte tüm hisseleri döndürür.
    if (url.pathname === "/api/quotebatch") {
      const symbolsParam = (url.searchParams.get("symbols") || "").toUpperCase().trim();
      const symbolsList = symbolsParam
        .split(",")
        .map((s) => s.trim().replace(/[^A-Z0-9]/g, ""))
        .filter(Boolean);
      if (symbolsList.length === 0) {
        return json({ error: "Geçerli hisse kodları girin." }, 400);
      }
      const yahooSymbols = symbolsList.map((s) => `${s}.IS`).join(",");
      let detail = "";
      try {
        const res = await yahooFetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols}`, env);
        const text = await res.text();
        if (res.ok) {
          const data = JSON.parse(text);
          if ((data?.quoteResponse?.result || []).length) return json(data);
          detail = "Yahoo boş liste döndürdü.";
        } else {
          detail = `status ${res.status}: ${text.slice(0, 200)}`;
        }
      } catch (e) {
        detail = String(e && e.message ? e.message : e);
      }
      // yedek yol: crumb gerektirmeyen chart verisinden fiyat üret
      const result = await quotesFromChart(symbolsList);
      if (result.length) return json({ quoteResponse: { result }, fallback: true });
      return json({ error: "Yahoo Finance'ten toplu veri alınamadı.", detail }, 502);
    }

    // --- Kur: USD/TRY, EUR/TRY (Yahoo chart meta) ---
    if (url.pathname === "/api/fx") {
      const pairs = (url.searchParams.get("pairs") || "USDTRY,EURTRY").toUpperCase().split(",").map((p) => p.trim()).filter((p) => /^[A-Z]{6}$/.test(p)).slice(0, 6);
      try { return json(await cachedLoad(env, "fx_" + pairs.join("_"), 30000, () => loadFx(pairs))); }
      catch (e) { return json({ error: "Kur verisi alınamadı.", detail: String(e && e.message ? e.message : e) }, 502); }
    }

    // --- Kripto: piyasa değerine göre ilk 50 (CoinGecko) ---
    if (url.pathname === "/api/crypto") {
      try { return json(await cachedLoad(env, "crypto50", 60000, loadCrypto)); }
      catch (e) { return json({ error: "Kripto verisi alınamadı.", detail: String(e && e.message ? e.message : e) }, 502); }
    }

    // --- Kripto günlük grafik (Yahoo biçiminde) ---
    if (url.pathname === "/api/cryptochart") {
      const id = (url.searchParams.get("id") || "").toLowerCase();
      const days = Math.max(30, Math.min(365, parseInt(url.searchParams.get("days") || "365", 10) || 365));
      if (!/^[a-z0-9-]{1,60}$/.test(id)) return json({ error: "Geçersiz kripto kimliği." }, 400);
      try { return json(await cachedLoad(env, `cc_${id}_${days}`, 10 * 60000, () => loadCryptoChart(id, days))); }
      catch (e) { return json({ error: "Kripto grafiği alınamadı.", detail: String(e && e.message ? e.message : e) }, 502); }
    }

    const rawSymbol = (url.searchParams.get("symbol") || "").toUpperCase().trim();
    const symbol = rawSymbol.replace(/[^A-Z0-9]/g, "");
    if (!symbol) {
      return json({ error: "Geçerli bir hisse kodu girin (örn: ALARK)." }, 400);
    }
    const yahooSymbol = `${symbol}.IS`;

    try {
      // --- Fiyat / hacim / grafik verisi ---
      if (url.pathname === "/api/chart") {
        const range = url.searchParams.get("range") || "1y";
        const interval = url.searchParams.get("interval") || "1d";
        const chartUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=${interval}&includeAdjustedClose=true`;
        let res = null;
        try { res = await yahooPlain(chartUrl); } catch (e) { /* crumb'lı yola düş */ }
        if (!res || !res.ok) res = await yahooFetch(chartUrl, env);
        const text = await res.text();
        if (!res.ok) {
          return json(
            { error: "Yahoo Finance'ten grafik verisi alınamadı.", status: res.status, detail: text.slice(0, 300) },
            502
          );
        }
        return json(JSON.parse(text));
      }

      // --- Temel veriler ---
      if (url.pathname === "/api/quote") {
        const modules = [
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "recommendationTrend",
          "price",
          "earnings",
          "assetProfile",
        ].join(",");
        const res = await yahooFetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${modules}&formatted=false&corsDomain=finance.yahoo.com`,
          env
        );
        const text = await res.text();
        if (!res.ok) {
          return json(
            { error: "Yahoo Finance'ten temel veri alınamadı.", status: res.status, detail: text.slice(0, 300) },
            502
          );
        }
        return json(JSON.parse(text));
      }

      return json({ error: "Bilinmeyen uç nokta." }, 404);
    } catch (err) {
      return json({ error: "Sunucu hatası.", detail: String(err && err.message ? err.message : err) }, 500);
    }
  },
};
