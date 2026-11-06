/* ==========================================================================
   BIST MOBİL — mobil.js
   Masaüstü sürümle aynı Worker, aynı şifre, aynı portföy/takip verisi.
   Göstergeler ve AL/TUT/SAT skoru app.js'teki mantığın aynısıdır.
   ========================================================================== */
(() => {
"use strict";

const APP_VER = "2026-11-06 · v9"; // her pakette değiştir
const LS_PASS_KEY = "bist_terminal_pass"; // masaüstü sürümle aynı anahtar
const LS_SIG_KEY = "bist_mobil_signals";
const TTL_ANALYSIS = 10 * 60 * 1000;
const TTL_QUOTE = 60 * 1000;

// Endeks bileşimleri app.js ile aynı. Endeks değişirse iki dosyada da güncelle.
const BIST100 = [
  "BINHO","AGHOL","AHGAZ","AKBNK","AKCNS","AKFYE","AKSA","AKSEN","ALARK","ALBRK",
  "ALTNY","ANSGR","AEFES","ANHYT","ARCLK","ASELS","ASTOR","AYGAZ","BTCIM","BERA",
  "BIMAS","BRSAN","BRYAT","CCOLA","CVKMD","CWENE","CANTE","CIMSA","DOHOL","DOAS",
  "ECZYT","EGEEN","EGGUB","ECILC","EKGYO","ENJSA","ENERY","ENKAI","EREGL","EUREN",
  "FENER","FROTO","GWIND","GLYHO","GUBRF","GLRMK","GRSEL","SAHOL","HEKTS","ENTRA",
  "ISDMR","ISMEN","KRDMD","KARSN","KATMR","TCKRC","KCAER","KCHOL","KORDS","LMKDC",
  "MAVI","MGROS","MPARK","OBAMS","ODAS","OTKAR","OYAKC","PAHOL","PGSUS","PETKM",
  "RYSAS","RGYAS","SASA","SNGYO","SOKM","TABGD","TAVHL","TKFEN","TOASO","TRGYO",
  "TRMET","TRENJ","TUKAS","TCELL","TUPRS","TRALT","THYAO","GARAN","HALKB","ISCTR",
  "TSKB","TURSG","SISE","VAKBN","TTKOM","TTRAK","ULKER","VESTL","YKBNK","ZOREN",
];
const BIST30 = [
  "AKBNK","AEFES","ASELS","ASTOR","BIMAS","EKGYO","ENKAI","EREGL","FROTO","GUBRF",
  "SAHOL","KRDMD","KCHOL","MGROS","PGSUS","PETKM","SASA","TAVHL","TOASO","TRMET",
  "TCELL","TUPRS","TRALT","THYAO","GARAN","ISCTR","SISE","VAKBN","TTKOM","YKBNK",
];
const INDEX_INFO = {
  "100": { label: "BIST 100", sub: "100 hisse", list: BIST100, sym: "XU100" },
  "30": { label: "BIST 30", sub: "30 hisse", list: BIST30, sym: "XU030" },
};

// ---------- küçük yardımcılar ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nfCache = {};
const nf = (d) => nfCache[d] || (nfCache[d] = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d }));
const fmt = (n, d = 2) => (n == null || isNaN(n) ? "—" : nf(d).format(n));
const pct = (n, d = 2) => (n == null || isNaN(n) ? "—" : (n > 0 ? "+" : "") + nf(d).format(n) + "%");
const sgn = (n, d = 0) => (n == null || isNaN(n) ? "—" : (n > 0 ? "+" : "") + nf(d).format(n));
const cls = (n) => (n > 0.001 ? "up" : n < -0.001 ? "down" : "flat");
const compact = (n) => {
  if (n == null || isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e12) return fmt(n / 1e12, 1) + " tr";
  if (a >= 1e9) return fmt(n / 1e9, 1) + " mr";
  if (a >= 1e6) return fmt(n / 1e6, 1) + " mn";
  if (a >= 1e3) return fmt(n / 1e3, 1) + " bin";
  return fmt(n, 0);
};
const cleanSym = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const parseNum = (s) => parseFloat(String(s).trim().replace(",", "."));
const fold = (s) => String(s || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u");
const nowHM = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
const todayTR = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

const ICON = {
  refresh: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><polyline points="20 4 20 11 13 11"/></svg>',
  back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 5 8 12 15 19"/></svg>',
  chev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 12 10 17 19 7"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 3 14.8 9 21 9.7 16.4 14 17.7 20.5 12 17.2 6.3 20.5 7.6 14 3 9.7 9.2 9"/></svg>',
  starO: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 3 14.8 9 21 9.7 16.4 14 17.7 20.5 12 17.2 6.3 20.5 7.6 14 3 9.7 9.2 9"/></svg>',
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A94A3" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
  grip: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="8" x2="19" y2="8"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="16" x2="19" y2="16"/></svg>',
};

// ==========================================================================
// 1) Worker erişimi
// ==========================================================================
const getPass = () => localStorage.getItem(LS_PASS_KEY) || "";

function authFail() {
  localStorage.removeItem(LS_PASS_KEY);
  showLock("Şifre hatalı.");
  const e = new Error("Şifre hatalı.");
  e.auth = true;
  return e;
}

async function api(path, params = {}) {
  const q = new URLSearchParams({ ...params, pass: getPass() });
  let r, d;
  try {
    r = await fetch(`${WORKER_URL}${path}?${q}`, { signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(25000) : undefined });
    d = await r.json();
  } catch (e) {
    throw new Error("Sunucuya ulaşılamadı.");
  }
  if (r.status === 401) throw authFail();
  if (!r.ok) throw new Error(d.error || "Veri alınamadı.");
  return d;
}
const kvGet = (key) => api("/api/" + key);
async function kvPost(key, body) {
  let r, d;
  try {
    r = await fetch(`${WORKER_URL}/api/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass: getPass(), ...body }),
    });
    d = await r.json();
  } catch (e) {
    throw new Error("Sunucuya ulaşılamadı.");
  }
  if (r.status === 401) throw authFail();
  if (!r.ok) throw new Error(d.error || "Kaydedilemedi.");
  return d;
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      try { out[k] = { ok: true, v: await fn(items[k], k) }; } catch (e) { out[k] = { ok: false, e }; }
    }
  });
  await Promise.all(workers);
  return out;
}

// ---------- anlık fiyatlar (toplu) ----------
const QC = new Map(); // sembol -> { t, q }
async function getQuotes(symbols, force = false) {
  const need = symbols.filter((s) => force || !QC.has(s) || Date.now() - QC.get(s).t > TTL_QUOTE);
  const chunks = [];
  for (let i = 0; i < need.length; i += 25) chunks.push(need.slice(i, i + 25));
  let firstErr = null;
  const res = await pool(chunks, 2, async (chunk) => {
    let d;
    try { d = await api("/api/quotebatch", { symbols: chunk.join(",") }); }
    catch (e) { if (e.auth) throw e; await new Promise((r) => setTimeout(r, 1200)); d = await api("/api/quotebatch", { symbols: chunk.join(",") }); } // geçici Yahoo hatasına karşı bir kez daha dene
    (d.quoteResponse?.result || []).forEach((q) => {
      const s = (q.symbol || "").replace(".IS", "");
      if (q.regularMarketPrice == null) return;
      QC.set(s, {
        t: Date.now(),
        q: {
          symbol: s,
          name: q.shortName || q.longName || "",
          price: q.regularMarketPrice,
          changePct: q.regularMarketChangePercent,
          prevClose: q.regularMarketPreviousClose,
          volumeTL: (q.regularMarketVolume || 0) * q.regularMarketPrice,
        },
      });
    });
  });
  res.forEach((r) => { if (!r.ok && !firstErr) firstErr = r.e; });
  if (firstErr && firstErr.auth) throw firstErr;
  const out = {};
  symbols.forEach((s) => { if (QC.has(s)) out[s] = QC.get(s).q; });
  if (firstErr && Object.keys(out).length === 0 && symbols.length) throw firstErr;
  if (!firstErr && Object.keys(out).length === 0 && symbols.length) throw new Error("Fiyat verisi alınamadı (Yahoo boş döndü). Birazdan tekrar dene.");
  return out;
}

// ==========================================================================
// 2) Göstergeler ve skor (app.js ile aynı)
// ==========================================================================
function sma(arr, p) { const o = []; for (let i = 0; i < arr.length; i++) { if (i < p - 1) { o.push(null); continue; } let s = 0; for (let j = i - p + 1; j <= i; j++) s += arr[j]; o.push(s / p); } return o; }
function ema(arr, p) { const k = 2 / (p + 1), o = []; let prev = null; for (let i = 0; i < arr.length; i++) { if (arr[i] == null) { o.push(null); continue; } if (prev == null) { prev = arr[i]; o.push(prev); continue; } prev = arr[i] * k + prev * (1 - k); o.push(prev); } return o; }
function calcRSI(cl, p = 14) { const o = new Array(cl.length).fill(null); if (cl.length <= p) return o; let g = 0, l = 0; for (let i = 1; i <= p; i++) { const d = cl[i] - cl[i - 1]; if (d >= 0) g += d; else l -= d; } let ag = g / p, al = l / p; o[p] = 100 - 100 / (1 + (al === 0 ? 100 : ag / al)); for (let i = p + 1; i < cl.length; i++) { const d = cl[i] - cl[i - 1]; ag = (ag * (p - 1) + (d > 0 ? d : 0)) / p; al = (al * (p - 1) + (d < 0 ? -d : 0)) / p; o[i] = 100 - 100 / (1 + (al === 0 ? 100 : ag / al)); } return o; }
function calcMACD(cl) { const e12 = ema(cl, 12), e26 = ema(cl, 26); const ml = cl.map((_, i) => (e12[i] != null && e26[i] != null ? e12[i] - e26[i] : null)); return { macdLine: ml, signalLine: ema(ml.map((v) => (v == null ? 0 : v)), 9) }; }
function calcBollinger(cl, p = 20, m = 2) { const mid = sma(cl, p), up = [], lo = []; for (let i = 0; i < cl.length; i++) { if (mid[i] == null) { up.push(null); lo.push(null); continue; } let ss = 0; for (let j = i - p + 1; j <= i; j++) ss += Math.pow(cl[j] - mid[i], 2); const sd = Math.sqrt(ss / p); up.push(mid[i] + m * sd); lo.push(mid[i] - m * sd); } return { mid, upper: up, lower: lo }; }

function processChart(r) {
  const ts = r.timestamp, q = r.indicators.quote[0], meta = r.meta || {};
  const candles = [];
  for (let i = 0; i < ts.length; i++) {
    if (q.close[i] == null) continue;
    const c = q.close[i];
    candles.push({ time: ts[i], open: q.open[i] ?? c, high: q.high[i] ?? c, low: q.low[i] ?? c, close: c, volume: q.volume[i] ?? 0 });
  }
  if (candles.length < 2) throw new Error("Yeterli veri yok.");
  const trDate = (u) => new Date((u + 3 * 3600) * 1000).toISOString().slice(0, 10);
  const lastDate = trDate(candles[candles.length - 1].time);
  const metaDate = meta.regularMarketTime != null ? trDate(meta.regularMarketTime) : null;
  if (metaDate != null && metaDate !== lastDate && meta.regularMarketPrice != null) {
    const prevC = candles[candles.length - 1].close;
    candles.push({
      time: meta.regularMarketTime, open: prevC,
      high: meta.regularMarketDayHigh ?? Math.max(prevC, meta.regularMarketPrice),
      low: meta.regularMarketDayLow ?? Math.min(prevC, meta.regularMarketPrice),
      close: meta.regularMarketPrice, volume: meta.regularMarketVolume ?? 0,
    });
  }
  const closes = candles.map((c) => c.close);
  const lc = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const pc = closes[closes.length - 2] ?? lc;
  const bd = (n) => { const i = closes.length - 1 - n; return i >= 0 ? closes[i] : closes[0]; };
  const ch = (f) => (f ? ((lc - f) / f) * 100 : 0);
  const changes = { daily: ch(pc), weekly: ch(bd(5)), monthly: ch(bd(21)), sixMonth: ch(bd(126)), yearly: ch(closes[0]) };
  const rsiA = calcRSI(closes, 14), ma50s = sma(closes, 50), ma200s = sma(closes, 200), macd = calcMACD(closes), boll = calcBollinger(closes, 20, 2);
  const last = (a) => a[a.length - 1];
  const lastC = candles[candles.length - 1];
  return {
    candles, closes, lastClose: lc, prevClose: pc, changes,
    week52Low: Math.min(...candles.map((c) => c.low)), week52High: Math.max(...candles.map((c) => c.high)),
    dayHigh: meta.regularMarketDayHigh ?? lastC.high, dayLow: meta.regularMarketDayLow ?? lastC.low,
    dayVolume: meta.regularMarketVolume ?? lastC.volume,
    rsi: last(rsiA), ma50: last(ma50s), ma200: last(ma200s), ma50s, ma200s,
    macd: last(macd.macdLine), macdSignal: last(macd.signalLine),
    bollingerUpper: last(boll.upper), bollingerMid: last(boll.mid), bollingerLower: last(boll.lower),
  };
}

function processFund(raw) {
  const r = raw?.quoteSummary?.result?.[0] || {};
  const sd = r.summaryDetail || {}, dks = r.defaultKeyStatistics || {}, fd = r.financialData || {}, price = r.price || {}, prof = r.assetProfile || {};
  const g = (o, k) => {
    const v = o?.[k];
    if (v == null) return null;
    if (typeof v === "object") return ("raw" in v && v.raw != null) ? v.raw : null;
    return v;
  };
  return {
    companyName: price.longName || price.shortName || "",
    marketCap: g(price, "marketCap"), trailingPE: g(sd, "trailingPE"), priceToBook: g(dks, "priceToBook"),
    recommendationMean: g(fd, "recommendationMean"), targetMeanPrice: g(fd, "targetMeanPrice"),
    fiftyTwoWeekLow: g(sd, "fiftyTwoWeekLow"), fiftyTwoWeekHigh: g(sd, "fiftyTwoWeekHigh"),
    previousClose: g(sd, "previousClose") ?? g(price, "regularMarketPreviousClose"),
    sector: prof.sector || null,
  };
}

function computeRecommendation(d, f) {
  let s = 50; const fa = [];
  const trendUp = d.ma50 != null && d.ma200 != null && d.lastClose > d.ma50 && d.ma50 > d.ma200;
  const trendDown = d.ma50 != null && d.ma200 != null && d.lastClose < d.ma50 && d.ma50 < d.ma200;
  if (d.rsi != null) {
    if (d.rsi < 30) {
      if (trendDown) { s += 3; fa.push(["RSI aşırı satım (düşüş trendinde, sınırlı)", "+3"]); }
      else { s += 10; fa.push(["RSI aşırı satım", "+10"]); }
    } else if (d.rsi < 45) { s += 4; fa.push(["RSI zayıf", "+4"]); }
    else if (d.rsi <= 55) { fa.push(["RSI nötr", "0"]); }
    else if (d.rsi <= 70) { s -= 4; fa.push(["RSI güçlü", "-4"]); }
    else {
      if (trendUp) { s -= 3; fa.push(["RSI aşırı alım (yükseliş trendinde, sınırlı)", "-3"]); }
      else { s -= 10; fa.push(["RSI aşırı alım", "-10"]); }
    }
  }
  if (d.ma50 != null && d.ma200 != null) { if (trendUp) { s += 18; fa.push(["Trend yükseliş", "+18"]); } else if (trendDown) { s -= 18; fa.push(["Trend düşüş", "-18"]); } else { fa.push(["Trend karışık", "0"]); } }
  if (d.macd != null && d.macdSignal != null) { if (d.macd > d.macdSignal) { s += 12; fa.push(["MACD pozitif", "+12"]); } else { s -= 12; fa.push(["MACD negatif", "-12"]); } }
  if (d.changes.yearly > 25) { s += 8; fa.push(["Yıllık momentum", "+8"]); } else if (d.changes.yearly < -25) { s -= 8; fa.push(["Yıllık momentum", "-8"]); }
  if (typeof f.recommendationMean === "number" && !isNaN(f.recommendationMean)) { const as = ((3 - f.recommendationMean) / 2) * 15; s += as; fa.push(["Analist ortalaması", (as >= 0 ? "+" : "") + fmt(as, 0)]); }
  if (isNaN(s)) s = 50;
  s = Math.max(0, Math.min(100, s));
  return { score: s, factors: fa };
}
// Masaüstündeki 5 kademeyi 3'e indirger: GÜÇLÜ AL/AL -> AL, NÖTR -> TUT, SAT/GÜÇLÜ SAT -> SAT
function sigOf(rec) {
  const s = rec.score;
  return { key: s >= 60 ? "AL" : s >= 40 ? "TUT" : "SAT", strong: s >= 80 || s < 20, score: Math.round(s) };
}

// ---------- tek hisse analizi (önbellekli) ----------
const AC = new Map();
async function analyze(sym, force = false) {
  const c = AC.get(sym);
  if (!force && c && Date.now() - c.t < TTL_ANALYSIS) return c.v;
  // temel veri (analist ortalaması) geçici hata verirse bir kez daha dene; yine olmazsa teknik skorla devam et
  const quoteTry = async () => {
    for (let k = 0; k < 2; k++) {
      try { return await api("/api/quote", { symbol: sym }); }
      catch (e) { if (e.auth) throw e; if (k === 0) await new Promise((r) => setTimeout(r, 400)); }
    }
    return null;
  };
  const [cr, qr] = await Promise.all([
    api("/api/chart", { symbol: sym, range: "1y", interval: "1d" }),
    quoteTry(),
  ]);
  const res = cr.chart?.result?.[0];
  if (!res || !res.timestamp) throw new Error(`"${sym}" bulunamadı.`);
  const d = processChart(res);
  const f = processFund(qr);
  if (f.previousClose != null && f.previousClose > 0) d.changes.daily = ((d.lastClose - f.previousClose) / f.previousClose) * 100;
  const rec = computeRecommendation(d, f);
  const v = { sym, d, f, rec, sig: sigOf(rec), partial: !qr, raw: res };
  AC.set(sym, { t: Date.now(), v });
  recordSignal(sym, v.sig.key);
  return v;
}

// ---------- sinyal değişimi takibi (son ziyarete göre) ----------
let SS = loadSS();
function loadSS() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(LS_SIG_KEY) || "null"); } catch (e) { s = null; }
  const today = todayTR();
  if (!s || typeof s !== "object") return { day: today, labels: {}, prev: {} };
  if (s.day !== today) return { day: today, labels: {}, prev: s.labels || {} };
  return { day: today, labels: s.labels || {}, prev: s.prev || {} };
}
function recordSignal(sym, key) {
  SS.labels[sym] = key;
  try { localStorage.setItem(LS_SIG_KEY, JSON.stringify(SS)); } catch (e) { /* önemsiz */ }
}
const changedSignals = (syms) => syms.filter((s) => SS.prev[s] && SS.labels[s] && SS.prev[s] !== SS.labels[s]).map((s) => ({ sym: s, from: SS.prev[s], to: SS.labels[s] }));

// ==========================================================================
// 3) Takip listesi ve portföy işlemleri (masaüstüyle aynı veri biçimi)
// ==========================================================================
// ---- Elle sıralama (Düzenle modu): sıra, kayıttaki dizi sırasıdır ----
let saveQ = Promise.resolve();
function saveOrder(kind, order) {
  const isWL = kind === "watchlist";
  const key = isWL ? "watchlist" : "portfolio";
  const bodyKey = isWL ? "items" : "positions";
  saveQ = saveQ.then(async () => {
    const cur = await kvGet(key); // yazmadan önce taze oku; başka cihazdaki değişiklik kaybolmasın
    const picked = order.map((s) => cur.find((x) => x.symbol === s)).filter(Boolean);
    const rest = cur.filter((x) => !order.includes(x.symbol));
    const next = [...picked, ...rest];
    await kvPost(key, { [bodyKey]: next });
    if (isWL) WL = next;
  }).catch((e) => { if (!e.auth) toast("Sıralama kaydedilemedi: " + e.message); });
  return saveQ;
}

// Tutamacı (.handle) tutup sürükleyerek satırların (.row[data-sym]) yerini değiştirir.
// Sürüklenen satırın kendisi DOM'da taşınmaz (işaretçi yakalaması kopmasın diye), komşusu taşınır.
function makeSortable(list, onDrop) {
  const view = $("#view");
  const isRow = (el) => el && el.classList && el.classList.contains("row");
  const order = () => Array.from(list.children).filter(isRow).map((r) => r.dataset.sym);
  const mid = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
  $$(".handle", list).forEach((h) => {
    const row = h.closest(".row");
    h.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button > 0) return;
      e.preventDefault();
      try { h.setPointerCapture(e.pointerId); } catch (err) { /* önemsiz */ }
      const grab = e.clientY - row.getBoundingClientRect().top;
      let cy = e.clientY;
      const place = () => {
        row.style.transform = "";
        const top = cy - grab;
        for (let g = 0; g < 200; g++) {
          const c = top + row.getBoundingClientRect().height / 2;
          const prev = row.previousElementSibling, next = row.nextElementSibling;
          if (isRow(prev) && c < mid(prev)) list.insertBefore(prev, row.nextSibling);
          else if (isRow(next) && c > mid(next)) list.insertBefore(next, row);
          else break;
        }
        row.style.transform = `translateY(${top - row.getBoundingClientRect().top}px)`;
      };
      const tick = () => {
        const vr = view.getBoundingClientRect();
        if (cy < vr.top + 70) view.scrollTop -= 14;
        else if (cy > vr.bottom - 70) view.scrollTop += 14;
        place();
      };
      const move = (ev) => { cy = ev.clientY; place(); };
      const timer = setInterval(tick, 16);
      const end = () => {
        clearInterval(timer);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        row.style.transform = "";
        row.classList.remove("dragging");
        document.body.classList.remove("sorting");
        onDrop(order());
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      row.classList.add("dragging");
      document.body.classList.add("sorting");
      place();
    });
    // Klavye / erişilebilirlik: tutamaçta yukarı-aşağı ok tuşları
    h.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      if (e.key === "ArrowUp") { const p = row.previousElementSibling; if (!isRow(p)) return; list.insertBefore(p, row.nextSibling); }
      else { const n = row.nextElementSibling; if (!isRow(n)) return; list.insertBefore(n, row); }
      onDrop(order());
    });
  });
}
function editRowHTML(sym, name, sub) {
  return `<div class="row edit" data-sym="${esc(sym)}"><div class="id"><span class="code">${esc(sym)}</span><span class="name">${esc(name || "")}${sub ? `<span class="num">${esc(sub)}</span>` : ""}</span></div>
    <button type="button" class="handle" aria-label="${esc(sym)} sırasını değiştir. Sürükle veya yukarı aşağı ok tuşlarını kullan">${ICON.grip}</button></div>`;
}

let WL = null;
async function getWL(force = false) { if (WL && !force) return WL; WL = await kvGet("watchlist"); return WL; }
async function wlToggle(sym, price) {
  const items = await kvGet("watchlist"); // yazmadan önce taze oku
  const i = items.findIndex((x) => x.symbol === sym);
  if (i >= 0) items.splice(i, 1);
  else items.push({ symbol: sym, addedAt: Date.now(), addedPrice: price });
  await kvPost("watchlist", { items });
  WL = items;
  return i < 0;
}
async function addBuy(sym, qty, cost) {
  const pos = await kvGet("portfolio");
  const ex = pos.find((p) => p.symbol === sym);
  if (ex) { const tq = ex.qty + qty; ex.cost = (ex.qty * ex.cost + qty * cost) / tq; ex.qty = tq; }
  else pos.push({ symbol: sym, qty, cost });
  await kvPost("portfolio", { positions: pos });
}
async function addSell(sym, qty, sellPrice) {
  const pos = await kvGet("portfolio");
  const p = pos.find((x) => x.symbol === sym);
  if (!p) throw new Error(sym + " portföyünde yok.");
  if (qty > p.qty + 1e-9) throw new Error(`En fazla ${fmt(p.qty, 0)} adet satabilirsin.`);
  const realized = await kvGet("realized");
  realized.push({ symbol: sym, qty, buyCost: p.cost, sellPrice, date: Date.now(), realizedPnL: qty * (sellPrice - p.cost), realizedPct: p.cost ? ((sellPrice - p.cost) / p.cost) * 100 : 0 });
  await kvPost("realized", { items: realized });
  p.qty -= qty;
  const next = p.qty <= 0.0001 ? pos.filter((x) => x.symbol !== sym) : pos;
  await kvPost("portfolio", { positions: next });
}

// ==========================================================================
// 4) Arayüz iskeleti: yönlendirme, bildirim, kilit ekranı
// ==========================================================================
const view = $("#view");
let RID = 0;
let lastTab = "takip";

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}
function setView(html) { view.innerHTML = html; }
function skeleton(n = 6) { return Array.from({ length: n }, () => '<div class="sk skrow"></div>').join(""); }
function errBlock(msg, retryId = "retry") {
  return `<div class="errblock"><div>${esc(msg)}</div><button type="button" class="ghost" id="${retryId}">Tekrar dene</button></div>`;
}
function setNav(tab) {
  $$("#nav a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
}
function showLock(msg = "") {
  setLive(null);
  $("#app").hidden = true;
  $("#lock").hidden = false;
  $("#lockErr").textContent = msg;
}
function showApp() {
  $("#lock").hidden = true;
  $("#app").hidden = false;
}

$("#lockForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = $("#lockPass").value.trim();
  if (!v) return;
  localStorage.setItem(LS_PASS_KEY, v);
  $("#lockErr").textContent = "Kontrol ediliyor…";
  try {
    await kvGet("watchlist");
    $("#lockPass").value = "";
    $("#lockErr").textContent = "";
    showApp();
    route();
  } catch (err) {
    if (!err.auth) { localStorage.removeItem(LS_PASS_KEY); $("#lockErr").textContent = err.message; }
  }
});

function route() {
  if (!getPass()) { showLock(); return; }
  showApp();
  const id = ++RID;
  setLive(null); // önceki sayfanın canlı yenilemesini durdur; yeni sayfa kendisi başlatır
  const h = location.hash.replace(/^#\/?/, "");
  const [p, arg] = h.split("/");
  view.scrollTop = 0;
  if (p === "hisse" && arg) { setNav(lastTab); viewHisse(id, cleanSym(arg)); return; }
  if (p === "kripto" && arg) { setNav("bist"); viewKriptoDetay(id, String(arg).toLowerCase().replace(/[^a-z0-9-]/g, "")); return; }
  if (p === "karsilastir" && arg) { setNav(lastTab); viewKarsilastir(id, cleanSym(arg), cleanSym(h.split("/")[2])); return; }
  const tab = ["takip", "portfoy", "bist", "harita", "sinyaller"].includes(p) ? p : "takip";
  lastTab = tab;
  setNav(tab);
  ({ takip: viewTakip, portfoy: viewPortfoy, bist: viewBist, harita: viewHarita, sinyaller: viewSinyaller })[tab](id);
}
window.addEventListener("hashchange", route);

// ---- Canlı güncelleme (masaüstündeki gibi 15 sn) ----
// Sadece açık sayfa için çalışır. Sekme arka plandaysa durur, öne gelince hemen yeniler.
const LIVE_MS = 15000;
const LIVE = { timer: 0, fn: null, busy: false };
const nowHMS = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
function setLive(fn) {
  clearInterval(LIVE.timer);
  LIVE.timer = 0;
  LIVE.fn = fn;
  if (fn) LIVE.timer = setInterval(liveTick, LIVE_MS);
}
async function liveTick() {
  if (!LIVE.fn || LIVE.busy || document.hidden || !getPass()) return;
  if (!$("#sheet").hidden) return; // alım/satım penceresi açıkken ekranı değiştirme
  LIVE.busy = true;
  try { await LIVE.fn(); } catch (e) { /* bir sonraki turda yeniden dener */ } finally { LIVE.busy = false; }
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) liveTick(); });

// ortak parçalar
function badgeHTML(sig) { return sig ? `<span class="badge ${sig.key}">${sig.key}</span>` : '<span class="badge ghost">…</span>'; }
function sparkHTML(closes, up) {
  if (!closes || closes.length < 2) return '<span class="spark-ph"></span>';
  const a = closes.slice(-30);
  const mn = Math.min(...a), mx = Math.max(...a);
  const pts = a.map((v, i) => (i * (64 / (a.length - 1))).toFixed(1) + "," + (26 - ((v - mn) / (mx - mn || 1)) * 24).toFixed(1)).join(" ");
  return `<svg class="spark" viewBox="0 0 64 28" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${up ? "#2ECC8F" : "#FF6B70"}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function reasonText(rec) {
  const top = rec.factors.filter((x) => parseFloat(x[1]) !== 0).sort((a, b) => Math.abs(parseFloat(b[1])) - Math.abs(parseFloat(a[1]))).slice(0, 2).map((x) => x[0]);
  return top.length ? top.join(", ") : "Göstergeler nötr";
}
function idxSpark(cs, prev, up) {
  const a = cs.map((c) => c.close);
  let mn = Math.min(...a), mx = Math.max(...a);
  if (prev != null) { mn = Math.min(mn, prev); mx = Math.max(mx, prev); }
  const y = (v) => 4 + (1 - (v - mn) / (mx - mn || 1)) * 56;
  const slots = Math.max(a.length, 96);
  const pts = a.map((v, i) => ((150 * i) / (slots - 1)).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
  const base = prev != null ? `<line x1="0" x2="150" y1="${y(prev).toFixed(1)}" y2="${y(prev).toFixed(1)}" stroke="#8A94A3" stroke-width="1" stroke-dasharray="3 4"/>` : "";
  return `<svg class="idxspark" viewBox="0 0 150 64" role="img" aria-label="Endeks gün içi grafiği">${base}<polyline points="${pts}" fill="none" stroke="${up ? "#2ECC8F" : "#FF6B70"}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function indexCardHTML(key, q, spark = "") {
  if (!q) return "";
  return `<div class="card index-card"><div class="l"><span>${esc(INDEX_INFO[key].label)}</span><span class="v num">${fmt(q.price)}</span><span class="p num pctbox ${cls(q.changePct)}">${pct(q.changePct)}</span></div>${spark}</div>`;
}
async function loadIndexCard(id, key, el) {
  try {
    const sym = INDEX_INFO[key].sym;
    const q = (await getQuotes([sym]))[sym];
    if (id === RID && el) el.innerHTML = indexCardHTML(key, q);
    if (!q) return;
    try {
      const it = await loadIntra(sym);
      if (id === RID && el) el.innerHTML = indexCardHTML(key, q, idxSpark(it.cs, it.prev, (q.changePct ?? 0) >= 0));
    } catch (e) { /* gün içi çizgi isteğe bağlı */ }
  } catch (e) { /* endeks kartı isteğe bağlı */ }
}

// ==========================================================================
// 5) TAKİP
// ==========================================================================
const TK = { filter: "all", edit: false };
async function viewTakip(id) {
  TK.edit = false;
  setView(`<header class="top"><div><h1>Takip</h1><div class="sub" id="tkSub">Yükleniyor…</div></div>
    <div class="acts"><button type="button" class="txtbtn" id="tkEdit" hidden>Düzenle</button>
    <button type="button" class="icon-btn" id="tkRefresh" aria-label="Yenile">${ICON.refresh}</button></div></header>
    <div id="tkIndex"></div><div id="tkFx"></div>
    <div class="chips" id="tkChips"></div>
    <div class="list" id="tkList">${skeleton()}</div>
    <button type="button" class="logout" id="logout">Çıkış yap</button>
    <div class="ver">Sürüm ${APP_VER}</div>`);
  $("#logout").onclick = () => { localStorage.removeItem(LS_PASS_KEY); location.hash = "#/takip"; showLock(); };
  $("#tkRefresh").onclick = () => { QC.clear(); AC.clear(); viewTakip(++RID); };
  loadIndexCard(id, "100", $("#tkIndex"));
  loadFxStrip(id, $("#tkFx"), true);

  let items;
  try { items = await getWL(true); } catch (e) { if (id === RID && !e.auth) { $("#tkList").innerHTML = errBlock(e.message); $("#retry").onclick = () => viewTakip(++RID); $("#tkSub").textContent = ""; } return; }
  if (id !== RID) return;
  const syms = items.map((i) => i.symbol);
  const held = new Set();
  try { (await kvGet("portfolio")).forEach((x) => held.add(x.symbol)); } catch (e) { if (e.auth) return; }
  if (id !== RID) return;
  if (!syms.length) {
    $("#tkSub").textContent = "";
    $("#tkList").innerHTML = '<div class="empty">Takip listen boş.<br>BIST sekmesinden bir hisseyi + ile ekleyebilirsin.</div>';
    return;
  }
  let quotes = {};
  try { quotes = await getQuotes(syms, true); } catch (e) { if (e.auth) return; }
  if (id !== RID) return;
  const itemOf = {};
  items.forEach((it) => (itemOf[it.symbol] = it));
  const tgLine = (it, price) => {
    if (!it) return "";
    const parts = [];
    if (it.target > 0 && price > 0) {
      const dd = ((it.target - price) / price) * 100;
      parts.push(dd <= 0 ? '<b class="up">Hedefe ulaştı</b>' : `Hedef ${fmt(it.target)} · ${pct(dd, 1)} uzak`);
    }
    if (it.note) parts.push("Not: " + esc(it.note.length > 26 ? it.note.slice(0, 26) + "…" : it.note));
    return parts.length ? `<span class="tg">${parts.join(" · ")}</span>` : "";
  };
  const flash = {};
  const subText = () => `${syms.length} hisse · Her 15 sn yenilenir · Veri gecikmeli olabilir · ${nowHMS()}`;
  let subNormal = subText();
  $("#tkSub").textContent = subNormal;

  const render = () => {
    if (id !== RID) return;
    $("#tkEdit").classList.toggle("on", TK.edit);
    $("#tkEdit").textContent = TK.edit ? "Bitti" : "Düzenle";
    $("#tkChips").hidden = TK.edit;
    $("#tkIndex").hidden = TK.edit;
    if (TK.edit) {
      $("#tkSub").textContent = "Sağdaki tutamacı tutup sürükle. Bırakınca sıra kaydolur.";
      $("#tkList").innerHTML = syms.map((s) => editRowHTML(s, quotes[s]?.name || AC.get(s)?.v.f.companyName || "")).join("");
      makeSortable($("#tkList"), (order) => { syms.splice(0, syms.length, ...order); saveOrder("watchlist", order); });
      return;
    }
    $("#tkSub").textContent = subNormal;
    const ana = {};
    syms.forEach((s) => { const c = AC.get(s); if (c) ana[s] = c.v; });
    const cnt = { AL: 0, TUT: 0, SAT: 0 };
    Object.values(ana).forEach((a) => cnt[a.sig.key]++);
    const chips = [["all", "Tümü " + syms.length, ""], ["AL", "AL " + cnt.AL, "al"], ["TUT", "TUT " + cnt.TUT, "tut"], ["SAT", "SAT " + cnt.SAT, "sat"]];
    $("#tkChips").innerHTML = chips.map(([k, l, c]) => `<button type="button" class="chip ${c} ${TK.filter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("");
    $$("#tkChips .chip").forEach((b) => (b.onclick = () => { TK.filter = b.dataset.f; render(); }));
    const shown = syms.filter((s) => TK.filter === "all" || (ana[s] && ana[s].sig.key === TK.filter));
    const rowHTML = (s) => {
      const q = quotes[s], a = ana[s];
      const price = q ? q.price : a?.d.lastClose;
      const chg = q && q.changePct != null ? q.changePct : a?.d.changes.daily;
      const bd = a ? `<span class="bdg ${a.sig.key}">${a.sig.key} · ${a.sig.score}</span>` : '<span class="bdg ghost">…</span>';
      return `<a class="row" href="#/hisse/${s}">
        <div class="id"><span class="code">${esc(s)}${bd}</span><span class="name">${esc(q?.name || a?.f.companyName || "")}</span>${tgLine(itemOf[s], price)}</div>
        <div class="px num"><b class="${flash[s] ? "fl-" + flash[s] : ""}">${fmt(price)}</b></div>
        <span class="pctbox num ${cls(chg)}">${pct(chg)}</span></a>`;
    };
    const mine = shown.filter((s) => held.has(s)), rest = shown.filter((s) => !held.has(s));
    $("#tkList").innerHTML = !shown.length ? '<div class="empty">Bu filtrede hisse yok.</div>'
      : mine.length ? `<div class="grp">Portföyümdekiler</div>${mine.map(rowHTML).join("")}${rest.length ? `<div class="grp">Takip listesi</div>${rest.map(rowHTML).join("")}` : ""}`
      : shown.map(rowHTML).join("");
  };
  render();
  if (syms.length >= 2) {
    $("#tkEdit").hidden = false;
    $("#tkEdit").onclick = () => { TK.edit = !TK.edit; render(); };
  }
  setLive(async () => {
    if (id !== RID || TK.edit) return;
    const fresh = await getQuotes([...syms, INDEX_INFO["100"].sym], true);
    syms.forEach((s) => {
      const n = fresh[s], o = quotes[s];
      if (n && o && Math.abs(n.price - o.price) > 1e-6) flash[s] = n.price > o.price ? "up" : "down";
      if (n) quotes[s] = n;
    });
    subNormal = subText();
    render();
    Object.keys(flash).forEach((k) => delete flash[k]);
    loadIndexCard(id, "100", $("#tkIndex"));
  });
  let raf = 0;
  await pool(syms, 4, async (s) => { try { await analyze(s); } finally { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!TK.edit) render(); }); } });
  if (!TK.edit) render();
}

// ==========================================================================
// 6) BIST (endeks seçici + tüm hisselerde arama)
// ==========================================================================
const BS = { idx: "100", sort: "az", q: "", menu: false, mode: "bist" };
async function viewBist(id) {
  if (BS.mode === "kripto") return viewKripto(id);
  setView(`${modeSegHTML("bist")}<div id="mkFx" style="margin-top:8px"></div><div class="search">${ICON.search}<input id="bsQ" type="search" enterkeyhint="search" autocapitalize="characters" autocomplete="off" placeholder="Tüm BIST hisselerinde ara" aria-label="Hisse ara" value="${esc(BS.q)}"></div>
    <p class="hint">Kod veya şirket adı yaz. Endeks dışı hisse için kodu yazıp Enter'a bas.</p>
    <div class="titlebar"><button type="button" class="titlebtn" id="bsTitle" aria-haspopup="listbox" aria-expanded="false"><span id="bsTitleTx"></span>${ICON.chev}</button><span class="num" id="bsIdx"></span></div>
    <div class="chips" id="bsChips"></div>
    <div class="list" id="bsList">${skeleton(8)}</div>`);
  modeSegBind(id); loadFxStrip(id, $("#mkFx"));
  const inp = $("#bsQ");
  const draw = async (live = false) => {
    if (id !== RID) return;
    live = live === true;
    const info = INDEX_INFO[BS.idx];
    $("#bsTitleTx").textContent = info.label;
    const sorts = [["az", "A-Z"], ["up", "Yükselen"], ["down", "Düşen"], ["vol", "Hacim"]];
    $("#bsChips").innerHTML = sorts.map(([k, l]) => `<button type="button" class="chip ${BS.sort === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $$("#bsChips .chip").forEach((b) => (b.onclick = () => { BS.sort = b.dataset.s; draw(); }));
    const q = fold(BS.q.trim());
    const base = q ? BIST100 : info.list; // arama yazılınca bilinen 100 hissede ara
    let quotes;
    try { quotes = await getQuotes(base, live); } catch (e) { if (live) throw e; if (id === RID && !e.auth) { $("#bsList").innerHTML = errBlock(e.message); $("#retry").onclick = () => draw(); } return; }
    if (id !== RID) return;
    let rows = base.map((s) => quotes[s]).filter(Boolean);
    if (q) rows = rows.filter((r) => fold(r.symbol).includes(q) || fold(r.name).includes(q));
    const by = { up: (a, b) => (b.changePct ?? -1e9) - (a.changePct ?? -1e9), down: (a, b) => (a.changePct ?? 1e9) - (b.changePct ?? 1e9), vol: (a, b) => b.volumeTL - a.volumeTL, az: (a, b) => (a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0) };
    rows.sort(by[BS.sort]);
    let wl = []; try { wl = (await getWL()).map((x) => x.symbol); } catch (e) { /* yıldızlar boş kalır */ }
    if (id !== RID) return;
    const code = cleanSym(BS.q);
    const exact = code.length >= 3 && code.length <= 6 && !rows.some((r) => r.symbol === code);
    $("#bsIdx").innerHTML = "";
    getQuotes([info.sym], live).then((m) => { const x = m[info.sym]; if (id === RID && x && $("#bsIdx")) $("#bsIdx").innerHTML = `<span class="${cls(x.changePct)}" style="font-size:14px;font-weight:600">${fmt(x.price)} · ${pct(x.changePct)}</span>`; }).catch(() => {});
    $("#bsList").innerHTML = (exact ? `<a class="openrow" href="#/hisse/${code}"><span>“${esc(code)}” kodunu aç</span><span>→</span></a>` : "") +
      (rows.length ? rows.map((r) => {
        const on = wl.includes(r.symbol);
        return `<div class="row"><a class="rowlink" href="#/hisse/${r.symbol}">
          <div class="id"><span class="code">${esc(r.symbol)}</span><span class="name">${esc(r.name)}</span></div>
          <div class="px num"><b>${fmt(r.price)}</b><span class="${cls(r.changePct)}">${pct(r.changePct)}</span></div></a>
          <button type="button" class="star-btn ${on ? "on" : ""}" data-sym="${r.symbol}" data-price="${r.price}" aria-label="${on ? "Takipten çıkar" : "Takibe ekle"}">${on ? ICON.star : ICON.plus}</button></div>`;
      }).join("") : (exact ? "" : '<div class="empty">Sonuç yok.</div>'));
    $$("#bsList .star-btn").forEach((b) => (b.onclick = async () => {
      b.disabled = true;
      try {
        const added = await wlToggle(b.dataset.sym, parseFloat(b.dataset.price));
        b.classList.toggle("on", added); b.innerHTML = added ? ICON.star : ICON.plus;
        b.setAttribute("aria-label", added ? "Takipten çıkar" : "Takibe ekle");
        toast(added ? `${b.dataset.sym} takibe eklendi` : `${b.dataset.sym} takipten çıkarıldı`);
      } catch (e) { toast(e.message); } finally { b.disabled = false; }
    }));
  };
  // endeks seçici
  const closeMenu = () => { BS.menu = false; $("#bsMenu")?.remove(); $("#bsMenuBg")?.remove(); $("#bsTitle")?.setAttribute("aria-expanded", "false"); };
  $("#bsTitle").onclick = () => {
    if (BS.menu) { closeMenu(); return; }
    BS.menu = true;
    $("#bsTitle").setAttribute("aria-expanded", "true");
    const bg = document.createElement("button"); bg.id = "bsMenuBg"; bg.type = "button"; bg.className = "menu-backdrop"; bg.setAttribute("aria-label", "Menüyü kapat"); bg.onclick = closeMenu;
    const m = document.createElement("div"); m.id = "bsMenu"; m.className = "menu"; m.setAttribute("role", "listbox"); m.setAttribute("aria-label", "Endeks seç");
    m.innerHTML = ["100", "30"].map((k) => [k, INDEX_INFO[k]]).map(([k, v]) => `<button type="button" role="option" aria-selected="${BS.idx === k}" data-k="${k}"><span><b>${v.label}</b><small>${v.sub}</small></span>${BS.idx === k ? ICON.check : ""}</button>`).join("");
    $(".titlebar").appendChild(m);
    document.body.appendChild(bg);
    $$("button", m).forEach((b) => (b.onclick = () => { BS.idx = b.dataset.k; closeMenu(); draw(); }));
  };
  let tmr = 0;
  inp.addEventListener("input", () => { BS.q = inp.value; clearTimeout(tmr); tmr = setTimeout(draw, 150); });
  inp.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const code = cleanSym(inp.value);
    if (code.length >= 2) { e.preventDefault(); inp.blur(); location.hash = "#/hisse/" + code; }
  });
  await draw();
  if (id === RID) setLive(async () => { if (id === RID && !BS.menu && document.activeElement !== inp) await draw(true); });
}

// ==========================================================================
// 7) PORTFÖY
// ==========================================================================
const PCOL = ["#5B9DFF", "#2ECC8F", "#F5B942", "#B48CFF", "#FF8A5B", "#4FD1E8", "#E879B9", "#A3B18A"];
const PF = { edit: false, hr: "all", hide: false };
try { PF.hide = localStorage.getItem("bist_mobil_hide") === "1"; } catch (e) { /* tarayıcı depolaması yoksa gizleme açılmaz */ }
ICON.eye = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
async function viewPortfoy(id) {
  PF.edit = false;
  setView(`<header class="top"><div><h1>Portföy</h1><div class="sub" id="pfSub"></div></div>
    <div class="acts"><button type="button" class="txtbtn" id="pfEdit" hidden>Düzenle</button>
    <button type="button" class="icon-btn" id="pfEye" aria-label="Tutarları gizle / göster" aria-pressed="${PF.hide}">${ICON.eye}</button>
    <button type="button" class="icon-btn" id="pfRefresh" aria-label="Yenile">${ICON.refresh}</button></div></header>
    <div id="pfBody" class="${PF.hide ? "hide" : ""}">${skeleton(5)}</div>
    <button type="button" class="fab" id="pfAdd">${ICON.plus} Alım / Satım ekle</button>`);
  $("#pfAdd").onclick = () => openSheet({ mode: "buy" });
  $("#pfEye").onclick = () => {
    PF.hide = !PF.hide;
    $("#pfBody").classList.toggle("hide", PF.hide);
    $("#pfEye").setAttribute("aria-pressed", String(PF.hide));
    try { localStorage.setItem("bist_mobil_hide", PF.hide ? "1" : "0"); } catch (e) { /* kaydedilemese de bu açılışta çalışır */ }
  };
  $("#pfRefresh").onclick = () => { QC.clear(); viewPortfoy(++RID); };
  let pos, realized = [];
  try { pos = await kvGet("portfolio"); try { realized = await kvGet("realized"); } catch (e) { if (e.auth) throw e; } }
  catch (e) { if (id === RID && !e.auth) { $("#pfBody").innerHTML = errBlock(e.message); $("#retry").onclick = () => viewPortfoy(++RID); } return; }
  if (id !== RID) return;
  const realizedTotal = realized.reduce((s, r) => s + (r.realizedPnL || 0), 0);
  if (!pos.length) {
    $("#pfBody").innerHTML = '<div class="empty">Portföyün boş.<br>Sağ alttaki düğmeyle alım ekleyebilirsin.</div>' + (realized.length ? `<div class="card total"><div class="pair"><div><span>Realize kâr/zarar</span><b class="num ${cls(realizedTotal)}">${sgn(realizedTotal)} ₺</b></div></div></div>` : "");
    return;
  }
  let quotes = {};
  try { quotes = await getQuotes(pos.map((p) => p.symbol), true); } catch (e) { if (e.auth) return; }
  if (id !== RID) return;
  let rows = [];
  let subNormal = "";
  let drawList = () => {};
  let HIST = null, TOT = null; // HIST: masaüstüyle ortak günlük kayıtlar {date, value, cost}
  const HR = [["7", "1H"], ["30", "1A"], ["180", "6A"], ["365", "1Y"], ["all", "Tümü"]];
  const paintHist = () => {
    const el = $("#pfHist");
    if (!el || HIST == null) return;
    const all = HIST.filter((x) => x && x.date && x.value > 0).sort((a, b) => (a.date < b.date ? -1 : 1));
    if (all.length < 2) { el.innerHTML = `<div class="sec">Değer geçmişi</div><div class="card"><div class="sub" style="margin:0">Geçmiş birikiyor (${all.length} gün kayıtlı). Portföyü her gün açtıkça grafik oluşur.</div></div>`; return; }
    const lastD = all[all.length - 1];
    const win = (k) => (k === "all" ? all : all.filter((x) => x.date >= new Date(Date.parse(lastD.date) - parseInt(k, 10) * 86400000).toISOString().slice(0, 10)));
    // dönem getirisi: alım/satımla gelen para çıkarılır (değer farkı − maliyet farkı) / başlangıç değeri
    const ret = (a) => {
      if (a.length < 2 || !a[0].value) return null;
      const f = a[0], l = a[a.length - 1];
      return (((l.value - (l.cost || 0)) - (f.value - (f.cost || 0))) / f.value) * 100;
    };
    let h = win(PF.hr);
    if (h.length < 2) h = all.slice(-2);
    const first = h[0], last = h[h.length - 1];
    let hi = -Infinity, lo = Infinity;
    h.forEach((x) => { hi = Math.max(hi, x.value, x.cost || x.value); lo = Math.min(lo, x.value, x.cost || x.value); });
    const padT = 16, padB = 16;
    const y = (v) => padT + ((hi - v) / (hi - lo || 1)) * (CH - padT - padB);
    const x = (i) => (CW * i) / (h.length - 1);
    const pts = (f) => h.map((r, i) => x(i).toFixed(1) + "," + y(f(r)).toFixed(1)).join(" ");
    const col = ret(h) != null && ret(h) < 0 ? "#FF6B70" : "#2ECC8F";
    const svg = `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Portföy değer geçmişi"><defs><linearGradient id="pfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".25"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${CH} ${pts((r) => r.value)} ${CW},${CH}" fill="url(#pfg)"/><polyline points="${pts((r) => r.cost || r.value)}" fill="none" stroke="#8A94A3" stroke-width="1.5" stroke-dasharray="4 4"/><polyline points="${pts((r) => r.value)}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><text x="4" y="11" fill="#8A94A3" font-size="10" class="amt">${fmt(hi, 0)}</text><text x="4" y="${CH - 4}" fill="#8A94A3" font-size="10" class="amt">${fmt(lo, 0)}</text></svg>`;
    const nl = Math.min(5, h.length);
    const labs = Array.from({ length: nl }, (_, i) => dm(h[Math.round((i * (h.length - 1)) / (nl - 1 || 1))].date));
    const r0 = ret(h);
    const idle = `${dm(first.date)} – ${dm(last.date)}${r0 != null ? " · " + pct(r0, 2) : ""}`;
    const chips = HR.map(([k, l]) => { const r = ret(win(k)); return `<button type="button" class="chip pr ${PF.hr === k ? "on" : ""}" data-k="${k}"><b>${l}</b><span class="${r == null ? "flat" : cls(r)}">${r == null ? "—" : pct(r, 1)}</span></button>`; }).join("");
    el.innerHTML = `<div class="ranges pr" id="pfHr">${chips}</div>
      <div class="chart" id="pfChart">${svg}</div>
      <div class="axis">${labs.map((l) => `<span>${l}</span>`).join("")}</div>
      <div class="legend2"><span><i style="background:${col}"></i>Değer</span><span><i style="background:#8A94A3"></i>Maliyet</span><span class="tip num" id="pfTip">${esc(idle)}</span></div>
      <div class="sghnote">Günlük kayıtlardan çizilir (masaüstüyle ortak). Getiri, alım/satımla gelen para çıkarılarak yaklaşık hesaplanır; satış yaptığın dönemlerde sapabilir.</div>`;
    $$("#pfHr .chip").forEach((b) => (b.onclick = () => { PF.hr = b.dataset.k; paintHist(); }));
    const svgEl = $("svg", $("#pfChart")), tip = $("#pfTip");
    const show = (e) => {
      const r = svgEl.getBoundingClientRect();
      const i = Math.max(0, Math.min(h.length - 1, Math.round(((e.clientX - r.left) / r.width) * (h.length - 1))));
      const it = h[i], pl = it.cost ? it.value - it.cost : null;
      tip.innerHTML = `${dm(it.date)} · <span class="amt">${fmt(it.value, 0)} ₺${pl != null ? " · K/Z " + sgn(pl) + " ₺" : ""}</span>`;
    };
    svgEl.addEventListener("pointerdown", show);
    svgEl.addEventListener("pointermove", show);
    svgEl.addEventListener("pointerleave", () => (tip.textContent = idle));
  };
  const paint = () => {
  if (id !== RID) return;
  let totalV = 0, totalC = 0, today = 0;
  rows = pos.map((p) => {
    const q = quotes[p.symbol];
    const price = q ? q.price : null;
    const value = price != null ? p.qty * price : null;
    const cost = p.qty * p.cost;
    const pl = value != null ? value - cost : null;
    if (value != null) {
      totalV += value; totalC += cost;
      if (q.changePct != null) today += value - value / (1 + q.changePct / 100);
    }
    return { p, price, value, cost, pl, plPct: pl != null && cost ? (pl / cost) * 100 : null };
  });
  const totalPL = totalV - totalC;
  const priced = rows.filter((r) => r.value != null).sort((a, b) => b.value - a.value);
  subNormal = `${pos.length} pozisyon · Her 15 sn yenilenir · Veri gecikmeli olabilir · ${nowHMS()}`;
  const unpriced = rows.length - priced.length;
  TOT = { v: totalV, c: totalC, unpriced };
  const tS = fmt(totalV, 2), tI = tS.lastIndexOf(",");
  const todayPct = totalV - today ? (today / (totalV - today)) * 100 : 0;
  const cl = {};
  realized.forEach((r) => { const c = cl[r.symbol] || (cl[r.symbol] = { s: r.symbol, pl: 0, n: 0, cost: 0 }); c.pl += r.realizedPnL || 0; c.n++; c.cost += (r.qty || 0) * (r.buyCost || 0); });
  const closed = Object.values(cl).sort((a, b) => b.pl - a.pl);
  $("#pfBody").innerHTML = `
    <div id="pfTop"><div class="hero">
      <div class="sub" style="margin:0">Toplam değer</div>
      <div class="bigrow amt num"><span class="bigint">${tI > 0 ? tS.slice(0, tI) : tS}</span><span class="bigdec">${tI > 0 ? tS.slice(tI) : ""} ₺</span></div>
      <div class="todayrow"><span class="pill num ${cls(today)}"><span class="amt">${sgn(today)} ₺</span> (${pct(todayPct)})</span><span>bugün</span></div>
    </div>
    <div id="pfHist"></div>
    <div class="card total">
      <div class="pair">
        <div><span>Toplam kâr/zarar</span><b class="num ${cls(totalPL)}"><span class="amt">${sgn(totalPL)} ₺</span> (${pct(totalC ? (totalPL / totalC) * 100 : 0)})</b></div>
        <div><span>Maliyet</span><b class="num amt">${fmt(totalC, 0)} ₺</b></div>
        ${realized.length ? `<div><span>Realize K/Z</span><b class="num ${cls(realizedTotal)} amt">${sgn(realizedTotal)} ₺</b></div>` : ""}
      </div>
      ${unpriced ? `<div class="sub" style="margin:0">${unpriced} hissenin fiyatı alınamadı, toplama dahil değil.</div>` : ""}
    </div>
    <div class="sec">Dağılım</div>
    <div class="alloc">${priced.map((r, i) => `<div style="flex:${(r.value / totalV).toFixed(4)} 1 0;background:${PCOL[i % PCOL.length]}"></div>`).join("")}</div>
    <div class="legend num">${priced.map((r, i) => `<span><i style="background:${PCOL[i % PCOL.length]}"></i>${esc(r.p.symbol)} %${fmt((r.value / totalV) * 100, 1)}</span>`).join("")}</div>
    <div class="sec h">Açık pozisyonlar</div>
    </div>
    <div class="list" id="pfList"></div>
    ${closed.length ? `<div id="pfClosed"><div class="sec h clh"><span>Kapanan pozisyonlar</span><span class="num ${cls(realizedTotal)}"><span class="amt">${sgn(realizedTotal)} ₺</span> gerçekleşen</span></div>
      <div class="list">${closed.map((c) => `<a class="row sm" href="#/hisse/${esc(c.s)}"><div class="id"><span class="code">${esc(c.s)}</span><span class="name">${c.n} satış</span></div>
        <div class="px num" style="width:auto"><b class="${cls(c.pl)} amt">${sgn(c.pl)} ₺</b>${c.cost ? `<span class="${cls(c.pl)}">${pct((c.pl / c.cost) * 100)}</span>` : ""}</div></a>`).join("")}</div></div>` : ""}
    <div style="height:72px"></div>`;
  drawList();
  paintHist();
  };
  drawList = () => {
    if (id !== RID) return;
    $("#pfTop").hidden = PF.edit;
    $("#pfAdd").hidden = PF.edit;
    if ($("#pfClosed")) $("#pfClosed").hidden = PF.edit;
    $("#pfEdit").classList.toggle("on", PF.edit);
    $("#pfEdit").textContent = PF.edit ? "Bitti" : "Düzenle";
    $("#pfSub").textContent = PF.edit ? "Sağdaki tutamacı tutup sürükle. Bırakınca sıra kaydolur." : subNormal;
    const list = $("#pfList");
    if (PF.edit) {
      list.innerHTML = rows.map((r) => editRowHTML(r.p.symbol, "", `${fmt(r.p.qty, 0)} adet · Ort. ${fmt(r.p.cost)}`)).join("");
      makeSortable(list, (order) => {
        const at = new Map(order.map((s, i) => [s, i]));
        rows.sort((a, b) => at.get(a.p.symbol) - at.get(b.p.symbol));
        pos.sort((a, b) => at.get(a.symbol) - at.get(b.symbol));
        saveOrder("portfolio", order);
      });
      return;
    }
    list.innerHTML = rows.map((r) => `<a class="row" href="#/hisse/${esc(r.p.symbol)}">
      <div class="id"><span class="code">${esc(r.p.symbol)}</span><span class="name num">${fmt(r.p.qty, 0)} adet · Ort. ${fmt(r.p.cost)}</span></div>
      <div class="px num" style="width:auto"><b class="amt">${r.value != null ? fmt(r.value, 0) + " ₺" : "—"}</b><span class="${cls(r.pl)}">${r.pl != null ? `<span class="amt">${sgn(r.pl)} ₺</span> · ${pct(r.plPct)}` : ""}</span></div></a>`).join("");
  };
  paint();
  if (rows.length >= 2) {
    $("#pfEdit").hidden = false;
    $("#pfEdit").onclick = () => { PF.edit = !PF.edit; drawList(); };
  }
  (async () => {
    try {
      let h = await kvGet("portfolio_history"); // önce oku; okunamazsa yazma (mevcut geçmişi ezme)
      if (!Array.isArray(h)) h = [];
      if (id !== RID) return;
      if (TOT && TOT.unpriced === 0 && TOT.v > 0) {
        const day = todayTR(), last = h[h.length - 1];
        const v = Math.round(TOT.v * 100) / 100, c = Math.round(TOT.c * 100) / 100;
        if (!last || last.date !== day) h.push({ date: day, value: v, cost: c }); else { last.value = v; last.cost = c; }
        await kvPost("portfolio_history", { snapshots: h });
      }
      HIST = h; paintHist();
    } catch (e) { /* geçmiş okunamadıysa bölüm boş kalır, hiçbir şey yazılmaz */ }
  })();
  setLive(async () => {
    if (id !== RID || PF.edit) return;
    const fresh = await getQuotes(pos.map((p) => p.symbol), true);
    quotes = fresh;
    paint();
  });
}

// ---- Alım / Satım ekranı ----
const SH = { mode: "buy" };
function openSheet({ mode = "buy", symbol = "", price = "" } = {}) {
  SH.mode = mode;
  $("#symList").innerHTML = BIST100.map((s) => `<option value="${s}">`).join("");
  $("#shSym").value = symbol; $("#shQty").value = ""; $("#shPrice").value = price !== "" ? String(price).replace(".", ",") : "";
  $("#shErr").textContent = "";
  syncSheetMode();
  $("#sheetBackdrop").hidden = false; $("#sheet").hidden = false;
  setTimeout(() => (symbol ? $("#shQty") : $("#shSym")).focus(), 50);
}
function closeSheet() { $("#sheet").hidden = true; $("#sheetBackdrop").hidden = true; }
function syncSheetMode() {
  $$("#sheet .seg button").forEach((b) => b.classList.toggle("on", b.dataset.mode === SH.mode));
  $("#shPriceLbl").textContent = SH.mode === "buy" ? "Maliyet (₺)" : "Satış fiyatı (₺)";
}
$$("#sheet .seg button").forEach((b) => (b.onclick = () => { SH.mode = b.dataset.mode; syncSheetMode(); }));
$("#sheetBackdrop").onclick = closeSheet;
$("#shCancel").onclick = closeSheet;
$("#shSave").onclick = async () => {
  const sym = cleanSym($("#shSym").value), qty = parseNum($("#shQty").value), price = parseNum($("#shPrice").value);
  const err = $("#shErr");
  if (!sym) { err.textContent = "Hisse kodu gir."; return; }
  if (!qty || qty <= 0) { err.textContent = "Adet gir."; return; }
  if (!price || price <= 0) { err.textContent = SH.mode === "buy" ? "Maliyet gir." : "Satış fiyatı gir."; return; }
  const btn = $("#shSave");
  btn.disabled = true; err.textContent = "Kaydediliyor…";
  try {
    if (SH.mode === "buy") await addBuy(sym, qty, price); else await addSell(sym, qty, price);
    closeSheet();
    toast(SH.mode === "buy" ? `${sym} alımı eklendi` : `${sym} satışı kaydedildi`);
    if ((location.hash || "").startsWith("#/portfoy")) route(); else location.hash = "#/portfoy";
  } catch (e) { err.textContent = e.message; } finally { btn.disabled = false; }
};

// ==========================================================================
// 8) SİNYALLER
// ==========================================================================
const SG = { filter: "all", mode: "b30", force: false, group: false };
function groupHTML(items, symOf, keyOf, rowOf) {
  const g = {};
  items.forEach((it) => { (g[sectorOf(symOf(it))] = g[sectorOf(symOf(it))] || []).push(it); });
  return Object.entries(g).sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1)).map(([name, arr]) => {
    const c = { AL: 0, TUT: 0, SAT: 0 };
    arr.forEach((it) => c[keyOf(it)]++);
    return `<div class="sec h sgrp"><span>${esc(name)} <small>${arr.length} hisse</small></span><span class="num"><b class="up">AL ${c.AL}</b> <b class="warn">TUT ${c.TUT}</b> <b class="down">SAT ${c.SAT}</b></span></div>` + arr.map(rowOf).join("");
  }).join("");
}
const grpChip = () => `<button type="button" class="chip ${SG.group ? "on" : ""}" data-g="1" aria-pressed="${SG.group}">Sektöre göre</button>`;
const chipClick = (render) => (b) => (b.onclick = () => { if (b.dataset.g) SG.group = !SG.group; else SG.filter = b.dataset.f; render(); });
async function viewSinyaller(id) {
  setView(`<header class="top"><div><h1>Sinyaller</h1><div class="sub" id="sgSub">Yükleniyor…</div></div>
    <button type="button" class="icon-btn" id="sgRefresh" aria-label="Yenile">${ICON.refresh}</button></header>
    <div class="seg" id="sgSeg" role="group" aria-label="Sinyal kaynağı"><button type="button" data-m="b30">BIST 30</button><button type="button" data-m="b100">BIST 100</button></div>
    <div class="prog" id="sgProg" hidden><i></i></div>
    <div class="chips" id="sgChips"></div>
    <div id="sgChanged"></div>
    <div class="list" id="sgList">${skeleton()}</div>
    <div class="disc">Sinyaller teknik göstergelere dayanır (RSI, 50/200 günlük ortalama, MACD, yıllık momentum, analist ortalaması). Bilgi amaçlıdır, yatırım tavsiyesi değildir.</div>`);
  $$("#sgSeg button").forEach((b) => {
    b.classList.toggle("on", b.dataset.m === SG.mode);
    b.setAttribute("aria-pressed", String(b.dataset.m === SG.mode));
    b.onclick = () => { if (SG.mode !== b.dataset.m) { SG.mode = b.dataset.m; SG.filter = "all"; viewSinyaller(++RID); } };
  });
  $("#sgRefresh").onclick = () => { AC.clear(); SG.force = true; viewSinyaller(++RID); };
  if (SG.mode === "b100") return sigScanView(id);
  SG.force = false;
  const syms = BIST30.slice();
  let done = 0;
  const render = () => {
    if (id !== RID) return;
    const ana = syms.map((s) => AC.get(s)?.v).filter(Boolean).sort((a, b) => b.rec.score - a.rec.score);
    const cnt = { AL: 0, TUT: 0, SAT: 0 };
    ana.forEach((a) => cnt[a.sig.key]++);
    $("#sgSub").textContent = done < syms.length ? `Hesaplanıyor ${done}/${syms.length}…` : `${syms.length} hisse · Günlük mumlara göre · ${nowHM()}`;
    const chips = [["all", "Tümü " + ana.length, ""], ["AL", "AL " + cnt.AL, "al"], ["TUT", "TUT " + cnt.TUT, "tut"], ["SAT", "SAT " + cnt.SAT, "sat"]];
    $("#sgChips").innerHTML = chips.map(([k, l, c]) => `<button type="button" class="chip ${c} ${SG.filter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("") + grpChip();
    $$("#sgChips .chip").forEach(chipClick(render));
    const ch = changedSignals(syms);
    $("#sgChanged").innerHTML = ch.length ? `<div class="sec h">Son ziyarete göre değişenler</div><div class="grid2">${ch.map((c) => `<a class="cell" href="#/hisse/${c.sym}"><b style="font-size:15px">${esc(c.sym)}</b><span style="display:flex;align-items:center;gap:6px"><span class="badge ${c.from}" style="width:auto;padding:3px 8px">${c.from}</span>→<span class="badge ${c.to}" style="width:auto;padding:3px 8px">${c.to}</span></span></a>`).join("")}</div>` : "";
    const shown = ana.filter((a) => SG.filter === "all" || a.sig.key === SG.filter);
    const rowOf = (a) => `<a class="row" href="#/hisse/${a.sym}">
      <div class="id"><span class="code">${esc(a.sym)}</span><span class="name">${esc(reasonText(a.rec))}</span></div>
      <span class="sub num" style="margin:0">${a.sig.score}/100</span>${badgeHTML(a.sig)}</a>`;
    $("#sgList").innerHTML = (shown.length ? `<div class="sec h">${SG.filter === "all" ? "BIST 30 sinyalleri" : SG.filter + " sinyali veren hisseler"}</div>` + (SG.group ? groupHTML(shown, (a) => a.sym, (a) => a.sig.key, rowOf) : shown.map(rowOf).join("")) : (done < syms.length ? skeleton(4) : '<div class="empty">Bu filtrede hisse yok.</div>'));
  };
  render();
  let raf = 0;
  await pool(syms, 4, async (s) => { try { await analyze(s); } finally { done++; if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); } });
  render();
}

// ---- BIST 100 taraması: sonuç telefonda saklanır, her açılışta yeniden taranmaz ----
const LS_SCAN_KEY = "bist_mobil_scan";
const SCAN_MAX_AGE = 3 * 3600 * 1000; // bundan eskiyse açılışta otomatik yenilenir
const SCAN = { running: false, done: 0, total: 0, abort: false, err: "", buf: {}, tick: null };
const loadScan = () => { try { const s = JSON.parse(localStorage.getItem(LS_SCAN_KEY) || "null"); return s && s.res && s.t ? s : null; } catch (e) { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const packSig = (a) => ({ sc: a.sig.score, k: a.sig.key, st: a.sig.strong ? 1 : 0, r: reasonText(a.rec), pt: a.partial ? 1 : 0 });
function whenText(t) {
  const hm = new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const sameDay = new Date(t + 3 * 3600 * 1000).toISOString().slice(0, 10) === todayTR();
  return sameDay ? "bugün " + hm : new Date(t).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }) + " " + hm;
}
async function runScan() {
  if (SCAN.running) return;
  Object.assign(SCAN, { running: true, done: 0, total: BIST100.length, abort: false, err: "", buf: {} });
  const tick = () => { if (SCAN.tick) SCAN.tick(); };
  const one = async (s) => {
    if (SCAN.abort) throw new Error("iptal");
    try { SCAN.buf[s] = packSig(await analyze(s)); }
    catch (e) { if (e.auth) SCAN.abort = true; if (!SCAN.err && !e.auth) SCAN.err = e.message; throw e; }
  };
  try {
    const first = await pool(BIST100, 5, async (s) => { try { await one(s); } finally { SCAN.done++; tick(); } });
    const bad = BIST100.filter((s, i) => !first[i].ok);
    if (bad.length && !SCAN.abort) { await sleep(500); await pool(bad, 2, one); }
    if (!SCAN.abort && Object.keys(SCAN.buf).length) {
      const failed = BIST100.filter((s) => !SCAN.buf[s]).length;
      try { localStorage.setItem(LS_SCAN_KEY, JSON.stringify({ t: Date.now(), res: SCAN.buf, failed })); } catch (e) { /* önemsiz */ }
    }
  } finally { SCAN.running = false; tick(); }
}
async function sigScanView(id) {
  const force = SG.force; SG.force = false;
  const render = () => {
    if (id !== RID) return;
    const stored = loadScan();
    const data = SCAN.running ? SCAN.buf : (stored ? stored.res : {});
    const syms = Object.keys(data);
    const cnt = { AL: 0, TUT: 0, SAT: 0 };
    syms.forEach((s) => cnt[data[s].k]++);
    const prog = $("#sgProg");
    prog.hidden = !SCAN.running;
    if (SCAN.running) $("i", prog).style.width = Math.round((SCAN.done / SCAN.total) * 100) + "%";
    if (SCAN.running) $("#sgSub").textContent = `BIST 100 taranıyor ${SCAN.done}/${SCAN.total}…`;
    else if (stored && syms.length) $("#sgSub").textContent = `${syms.length} hisse · Son tarama ${whenText(stored.t)}${stored.failed ? ` · ${stored.failed} hisse alınamadı` : ""}`;
    else $("#sgSub").textContent = "";
    if (!syms.length && !SCAN.running) {
      $("#sgChips").innerHTML = ""; $("#sgChanged").innerHTML = "";
      $("#sgList").innerHTML = SCAN.abort ? "" : errBlock(SCAN.err ? `Tarama yapılamadı: ${SCAN.err}` : "Tarama sonucu yok.");
      const r = $("#retry"); if (r) r.onclick = () => { SG.force = true; viewSinyaller(++RID); };
      return;
    }
    const chips = [["all", "Tümü " + syms.length, ""], ["AL", "AL " + cnt.AL, "al"], ["TUT", "TUT " + cnt.TUT, "tut"], ["SAT", "SAT " + cnt.SAT, "sat"]];
    $("#sgChips").innerHTML = chips.map(([k, l, c]) => `<button type="button" class="chip ${c} ${SG.filter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("") + grpChip();
    $$("#sgChips .chip").forEach(chipClick(render));
    const ch = changedSignals(syms);
    $("#sgChanged").innerHTML = ch.length ? `<div class="sec h">Son ziyarete göre değişenler</div><div class="grid2">${ch.map((c) => `<a class="cell" href="#/hisse/${c.sym}"><b style="font-size:15px">${esc(c.sym)}</b><span style="display:flex;align-items:center;gap:6px"><span class="badge ${c.from}" style="width:auto;padding:3px 8px">${c.from}</span>→<span class="badge ${c.to}" style="width:auto;padding:3px 8px">${c.to}</span></span></a>`).join("")}</div>` : "";
    const dir = SG.filter === "SAT" ? 1 : -1; // SAT'ta en zayıf skor üstte, diğerlerinde en yüksek
    const shown = syms.filter((s) => SG.filter === "all" || data[s].k === SG.filter).sort((a, b) => dir * (data[a].sc - data[b].sc) || (a < b ? -1 : 1));
    const partial = shown.some((s) => data[s].pt);
    const rowScan = (s) => `<a class="row" href="#/hisse/${s}"><div class="id"><span class="code">${esc(s)}</span><span class="name">${esc(data[s].r)}</span></div>
          <span class="sub num" style="margin:0">${data[s].sc}/100${data[s].pt ? "*" : ""}</span><span class="badge ${data[s].k}">${data[s].k}</span></a>`;
    $("#sgList").innerHTML = shown.length
      ? `<div class="sec h">${SG.filter === "all" ? "BIST 100 sinyalleri" : SG.filter + " sinyali veren hisseler"}</div>` +
        (SG.group ? groupHTML(shown, (s) => s, (s) => data[s].k, rowScan) : shown.map(rowScan).join("")) +
        (partial ? '<div class="disc">* Analist verisi alınamadı; skor yalnız teknik göstergelerle hesaplandı.</div>' : "")
      : (SCAN.running ? skeleton(4) : '<div class="empty">Bu filtrede hisse yok.</div>');
  };
  SCAN.tick = render;
  const stored = loadScan();
  if (!SCAN.running && (force || !stored || Date.now() - stored.t > SCAN_MAX_AGE)) runScan();
  render();
}

// ==========================================================================
// 8b) ISI HARİTASI (BIST 30): kutu büyüklüğü = işlem hacmi, renk = günlük değişim
// ==========================================================================
function treemap(items, W, H) {
  const total = items.reduce((s, i) => s + i.v, 0) || 1;
  const k = (W * H) / total;
  const nodes = items.map((i) => ({ ...i, a: i.v * k }));
  const out = [];
  let x = 0, y = 0, w = W, h = H, row = [];
  const worst = (r, side) => {
    const s = r.reduce((t, n) => t + n.a, 0), mx = Math.max(...r.map((n) => n.a)), mn = Math.min(...r.map((n) => n.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  const place = (r) => {
    const s = r.reduce((t, n) => t + n.a, 0);
    if (w >= h) { const cw = s / h; let cy = y; r.forEach((n) => { const ch = n.a / cw; out.push({ ...n, x, y: cy, w: cw, h: ch }); cy += ch; }); x += cw; w -= cw; }
    else { const rh = s / w; let cx = x; r.forEach((n) => { const cw = n.a / rh; out.push({ ...n, x: cx, y, w: cw, h: rh }); cx += cw; }); y += rh; h -= rh; }
  };
  let i = 0;
  while (i < nodes.length) {
    const side = Math.min(w, h), n = nodes[i];
    if (!row.length || worst([...row, n], side) <= worst(row, side)) { row.push(n); i++; }
    else { place(row); row = []; }
  }
  if (row.length) place(row);
  return out;
}
const heatColor = (c) => c == null ? "#2B333E" : c >= 2 ? "#187A55" : c >= 1 ? "#17674A" : c >= 0.25 ? "#1F5A44" : c > -0.25 ? "#2F3742" : c > -1 ? "#5C3A3A" : c > -2 ? "#8A3A3A" : "#A63232";
const HM = { idx: "30", mode: "stock" };
function tileHTML(r, t) {
  const big = t.w >= 74 && t.h >= 54, mid = t.w >= 52 && t.h >= 38;
  const inner = big ? `<b>${esc(r.symbol)}</b><span class="num">${fmt(r.price)}</span><em class="num">${pct(r.changePct)}</em>` : mid ? `<b>${esc(r.symbol)}</b><em class="num">${pct(r.changePct)}</em>` : `<b>${esc(r.symbol)}</b>`;
  return `<a class="tile ${big ? "big" : mid ? "mid" : "sm"}" href="#/hisse/${esc(r.symbol)}" style="left:${t.x.toFixed(1)}px;top:${t.y.toFixed(1)}px;width:${t.w.toFixed(1)}px;height:${t.h.toFixed(1)}px;background:${heatColor(r.changePct)}" aria-label="${esc(r.symbol)} ${fmt(r.price)} ${pct(r.changePct)}">${inner}</a>`;
}
async function viewHarita(id) {
  const list = HM.idx === "100" ? BIST100 : BIST30;
  setView(`<header class="top"><div><h1>Isı Haritası</h1><div class="sub" id="hmSub">Yükleniyor…</div></div>
    <div class="acts"><button type="button" class="icon-btn" id="hmRefresh" aria-label="Yenile">${ICON.refresh}</button></div></header>
    <div class="seg" id="hmIdx" role="group" aria-label="Endeks"><button type="button" data-v="30">BIST 30</button><button type="button" data-v="100">BIST 100</button></div>
    <div class="seg" id="hmMode" role="group" aria-label="Görünüm" style="margin-top:6px"><button type="button" data-v="stock">Hisse</button><button type="button" data-v="sector">Sektör</button></div>
    <div id="hmBox" class="hm" style="margin-top:10px"><div class="sk" style="height:100%"></div></div>
    <div class="hmleg num" aria-hidden="true"><span style="background:#A63232">≤-2</span><span style="background:#8A3A3A">-1</span><span style="background:#5C3A3A">-0,25</span><span style="background:#2F3742">0</span><span style="background:#1F5A44">+0,25</span><span style="background:#17674A">+1</span><span style="background:#187A55">≥+2</span></div>
    <p class="hint">${HM.idx === "100" ? "BIST 100" : "BIST 30"} · Kutu büyüklüğü işlem hacmine, renk günlük değişime göre.${HM.mode === "sector" ? " Sektörler genel sınıflamadır, başlıktaki yüzde hacim ağırlıklı ortalamadır." : ""} Bir kutuya basınca hisse açılır.</p>`);
  [["#hmIdx", "idx"], ["#hmMode", "mode"]].forEach(([sel, key]) => $$(`${sel} button`).forEach((bt) => {
    bt.classList.toggle("on", bt.dataset.v === HM[key]);
    bt.setAttribute("aria-pressed", String(bt.dataset.v === HM[key]));
    bt.onclick = () => { if (HM[key] !== bt.dataset.v) { HM[key] = bt.dataset.v; viewHarita(++RID); } };
  }));
  $("#hmRefresh").onclick = () => { QC.clear(); viewHarita(++RID); };
  const box = $("#hmBox");
  box.style.height = Math.max(360, Math.min(640, window.innerHeight - 430)) + "px";
  const vol = (r) => Math.sqrt(Math.max(r.volumeTL || 0, 1)); // karekök: küçük hisseler görünmez olmasın
  const draw = async (live) => {
    let q;
    try { q = await getQuotes(list, live); } catch (e) { if (live) throw e; if (id === RID && !e.auth) { box.innerHTML = errBlock(e.message); $("#retry").onclick = () => viewHarita(++RID); $("#hmSub").textContent = ""; } return; }
    if (id !== RID) return;
    const rows = list.map((s) => q[s]).filter(Boolean);
    if (!rows.length) { box.innerHTML = '<div class="empty">Veri alınamadı.</div>'; return; }
    const W = box.clientWidth, H = box.clientHeight;
    if (HM.mode === "sector") {
      const groups = {};
      rows.forEach((r) => { (groups[sectorOf(r.symbol)] = groups[sectorOf(r.symbol)] || []).push(r); });
      const gItems = Object.entries(groups).map(([name, arr]) => ({ name, arr, v: arr.reduce((t, r) => t + vol(r), 0) })).sort((x, y) => y.v - x.v);
      box.innerHTML = treemap(gItems, W, H).map((g) => {
        const inset = 2, lab = g.w >= 64 && g.h >= 52 ? 16 : 0;
        const ix = g.x + inset, iy = g.y + inset + lab, iw = g.w - 2 * inset, ih = g.h - 2 * inset - lab;
        if (iw < 10 || ih < 10) return "";
        const wsum = g.arr.reduce((t, r) => t + (r.volumeTL || 1), 0);
        const avg = g.arr.reduce((t, r) => t + (r.changePct || 0) * (r.volumeTL || 1), 0) / wsum;
        const inner = treemap(g.arr.map((r) => ({ r, v: vol(r) })).sort((x, y) => y.v - x.v), iw, ih);
        return `<div class="hmg" style="left:${g.x.toFixed(1)}px;top:${g.y.toFixed(1)}px;width:${g.w.toFixed(1)}px;height:${g.h.toFixed(1)}px">${lab ? `<span class="hmgl">${esc(g.name)} <em class="num ${cls(avg)}">${pct(avg, 1)}</em></span>` : ""}</div>` +
          inner.map((t) => tileHTML(t.r, { x: ix + t.x, y: iy + t.y, w: t.w, h: t.h })).join("");
      }).join("");
    } else {
      box.innerHTML = treemap(rows.map((r) => ({ r, v: vol(r) })).sort((x, y) => y.v - x.v), W, H).map((t) => tileHTML(t.r, t)).join("");
    }
    const up = rows.filter((r) => (r.changePct ?? 0) > 0).length, dn = rows.filter((r) => (r.changePct ?? 0) < 0).length;
    $("#hmSub").textContent = `${up} yükselen · ${dn} düşen · ${rows.length - up - dn} değişmeyen · her 15 sn · ${nowHMS()}`;
  };
  await draw(false);
  if (id === RID) setLive(async () => { if (id === RID) await draw(true); });
}

// ==========================================================================
// 9) HİSSE DETAYI
// ==========================================================================
const DT = { range: 63 };
const RANGES = [["Gün içi", 0], ["1H", 5],["1A", 21], ["3A", 63], ["6A", 126], ["1Y", 9999]];
const CW = 358, CH = 190;

function chartSVG(d, n) {
  const cs = d.candles.slice(-n), off = d.candles.length - cs.length;
  const m50 = d.ma50s.slice(off), m200 = d.ma200s.slice(off);
  let hi = -Infinity, lo = Infinity;
  cs.forEach((c) => { hi = Math.max(hi, c.high); lo = Math.min(lo, c.low); });
  const padT = 16, padB = 16;
  const y = (p) => padT + ((hi - p) / (hi - lo || 1)) * (CH - padT - padB);
  const step = CW / cs.length;
  const x = (i) => step * (i + 0.5);
  let body = "";
  if (cs.length <= 90 && !d.lineOnly) {
    const bw = Math.max(1.5, Math.min(12, step * 0.62));
    body = cs.map((c, i) => {
      const col = c.close >= c.open ? "#2ECC8F" : "#FF6B70";
      const top = y(Math.max(c.open, c.close)), h = Math.max(1.5, Math.abs(y(c.open) - y(c.close)));
      return `<line x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${y(c.high).toFixed(1)}" y2="${y(c.low).toFixed(1)}" stroke="${col}" stroke-width="1.2"/><rect x="${(x(i) - bw / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${col}" rx="1"/>`;
    }).join("");
  } else {
    const pts = cs.map((c, i) => x(i).toFixed(1) + "," + y(c.close).toFixed(1)).join(" ");
    const up = cs[cs.length - 1].close >= cs[0].close;
    body = `<polyline points="${pts}" fill="none" stroke="${up ? "#2ECC8F" : "#FF6B70"}" stroke-width="1.8" stroke-linejoin="round"/>`;
  }
  const path = (arr) => {
    let s = "", pen = false;
    arr.forEach((v, i) => { if (v == null) { pen = false; return; } s += (pen ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1) + " "; pen = true; });
    return s;
  };
  const grid = [0.25, 0.5, 0.75].map((f) => `<line x1="0" x2="${CW}" y1="${(padT + f * (CH - padT - padB)).toFixed(1)}" y2="${(padT + f * (CH - padT - padB)).toFixed(1)}" stroke="#1D232C"/>`).join("");
  const svg = `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Fiyat grafiği"><defs><clipPath id="cp"><rect x="0" y="0" width="${CW}" height="${CH}"/></clipPath></defs>${grid}<g clip-path="url(#cp)">${body}<path d="${path(m200)}" fill="none" stroke="#B48CFF" stroke-width="1.5" stroke-linejoin="round"/><path d="${path(m50)}" fill="none" stroke="#5B9DFF" stroke-width="1.5" stroke-linejoin="round"/></g>
    <text x="4" y="11" fill="#8A94A3" font-size="10">${fmt(hi)}</text><text x="4" y="${CH - 4}" fill="#8A94A3" font-size="10">${fmt(lo)}</text></svg>`;
  return { svg, cs, step };
}
const fmtDay = (t) => new Date(t * 1000).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "2-digit" });

// ---- Gün içi (5 dk'lık mumlar) ----
const IC = new Map(); // sym -> {t, v:{cs, prev}}
const fmtHM = (t) => new Date(t * 1000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
async function loadIntra(sym, force = false) {
  const c = IC.get(sym);
  if (!force && c && Date.now() - c.t < 20000) return c.v;
  const r = await api("/api/chart", { symbol: sym, range: "1d", interval: "5m" });
  const res = r.chart?.result?.[0];
  if (!res || !res.timestamp) throw new Error("Gün içi veri alınamadı.");
  const q = res.indicators.quote[0], cs = [];
  res.timestamp.forEach((t, i) => {
    const c2 = q.close[i];
    if (c2 == null) return;
    cs.push({ time: t, open: q.open[i] ?? c2, high: q.high[i] ?? c2, low: q.low[i] ?? c2, close: c2, volume: q.volume[i] ?? 0 });
  });
  if (!cs.length) throw new Error("Bugün için 5 dk verisi yok (seans kapalı olabilir).");
  const v = { cs, prev: res.meta?.chartPreviousClose ?? res.meta?.previousClose ?? null };
  IC.set(sym, { t: Date.now(), v });
  return v;
}
// ---- Hacim (TL) çubukları + 30 gün ortalaması ----
function volAvg(d) { // son 30 işlem gününün ortalama TL hacmi (bugün yarımsa hariç)
  const cs = d.candles;
  if (!cs.length) return null;
  const today = trDay(cs[cs.length - 1].time) === todayTR();
  const arr = (today ? cs.slice(-31, -1) : cs.slice(-30)).filter((c) => c.volume > 0).map((c) => c.volume * c.close);
  return arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null;
}
function paintVol(cs, slots, withAvg) {
  const el = $("#vol");
  if (!el) return;
  const vals = cs.map((c) => (c.volume || 0) * c.close);
  const mx = Math.max(...vals, DT.avg && withAvg ? DT.avg : 0, 1);
  const H = 64, step = CW / slots, bw = Math.max(1.5, Math.min(12, step * 0.62));
  const bars = cs.map((c, i) => {
    const h = vals[i] > 0 ? Math.max(1, (vals[i] / mx) * (H - 14)) : 0;
    return `<rect x="${(step * (i + 0.5) - bw / 2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${c.close >= c.open ? "#2ECC8F" : "#FF6B70"}" opacity=".6"/>`;
  }).join("");
  const ay = DT.avg && withAvg ? H - (DT.avg / mx) * (H - 14) : null;
  const line = ay != null ? `<line x1="0" x2="${CW}" y1="${ay.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#F5B544" stroke-width="1" stroke-dasharray="4 4"/>` : "";
  el.innerHTML = `<svg viewBox="0 0 ${CW} ${H}" role="img" aria-label="Hacim TL çubuk grafiği">${bars}${line}<text x="4" y="10" fill="#8A94A3" font-size="10">${compact(mx)} ₺</text></svg>`;
}
const volHover = (c) => { const e = $("#volTip"); if (e) e.textContent = "≈ " + compact((c.volume || 0) * c.close) + " ₺"; };
const volIdle = () => { const e = $("#volTip"); if (e) e.textContent = DT.avg ? "30 gün ort. ≈ " + compact(DT.avg) + " ₺" : ""; };

// ---- Saatlik (1H) ve 4 saatlik (1A) mumlar ----
const IX = { 5: { range: "5d", interval: "60m", agg: false, days: 5, label: "1 saatlik" }, 21: { range: "1mo", interval: "60m", agg: true, days: 21, label: "4 saatlik" } };
const trParts = (t) => { const d = new Date((t + 3 * 3600) * 1000); return { day: d.toISOString().slice(0, 10), h: d.getUTCHours() }; };
const fmtDM = (t) => new Date(t * 1000).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", timeZone: "Europe/Istanbul" });
const IXC = new Map();
async function loadIntraX(sym, ix, force = false) {
  const key = sym + "|" + ix.range;
  const c = IXC.get(key);
  if (!force && c && Date.now() - c.t < 60000) return c.v;
  const r = await api("/api/chart", { symbol: sym, range: ix.range, interval: ix.interval });
  const res = r.chart?.result?.[0];
  if (!res || !res.timestamp) throw new Error("Saatlik veri alınamadı.");
  const q = res.indicators.quote[0];
  let cs = [];
  res.timestamp.forEach((t, i) => {
    const c2 = q.close[i];
    if (c2 == null) return;
    cs.push({ time: t, open: q.open[i] ?? c2, high: q.high[i] ?? c2, low: q.low[i] ?? c2, close: c2, volume: q.volume[i] ?? 0 });
  });
  const dl = [...new Set(cs.map((c3) => trParts(c3.time).day))].slice(-ix.days); // yalnızca son N işlem günü
  cs = cs.filter((c3) => dl.includes(trParts(c3.time).day));
  if (ix.agg) { // 4 saatlik: her gün sabah (14:00 öncesi) ve öğleden sonra olarak ikiye bölünür
    const out = []; let cur = null, curKey = "";
    cs.forEach((c3) => {
      const p = trParts(c3.time), k = p.day + (p.h < 14 ? "a" : "b");
      if (k !== curKey) { cur = { ...c3 }; out.push(cur); curKey = k; }
      else { cur.high = Math.max(cur.high, c3.high); cur.low = Math.min(cur.low, c3.low); cur.close = c3.close; cur.volume += c3.volume; }
    });
    cs = out;
  }
  if (cs.length < 3) throw new Error("Saatlik veri yetersiz.");
  const v = { cs };
  IXC.set(key, { t: Date.now(), v });
  return v;
}
async function drawIntraX(a, ix, force = false) {
  const box = $("#chart"), tip = $("#tip"), n = DT.range;
  if (!box) return;
  if (!IXC.has(a.sym + "|" + ix.range)) box.innerHTML = '<div class="empty" style="padding:70px 0">Saatlik veri yükleniyor…</div>';
  let v;
  try { v = await loadIntraX(a.sym, ix, force); }
  catch (e) { if (DT.range === n && $("#chart") === box) drawDaily(a, "Saatlik veri alınamadı, günlük mumlar"); return; }
  if (DT.range !== n || $("#chart") !== box) return;
  const { svg, step } = intraSVG(v.cs, null, { slots: v.cs.length, days: true, aria: ix.label + " mum grafiği" });
  box.innerHTML = svg;
  paintVol(v.cs, v.cs.length, false); volIdle();
  const last = v.cs[v.cs.length - 1];
  const idle = `${ix.label} · ${fmtDM(v.cs[0].time)} – ${fmtDM(last.time)}`;
  tip.textContent = idle;
  const el = $("svg", box);
  const show = (e) => {
    const r = el.getBoundingClientRect();
    const i = Math.max(0, Math.min(v.cs.length - 1, Math.floor(((e.clientX - r.left) / r.width) * CW / step)));
    const c = v.cs[i];
    volHover(c);
    tip.textContent = `${fmtDM(c.time)} ${fmtHM(c.time)} · A ${fmt(c.open)} Y ${fmt(c.high)} D ${fmt(c.low)} K ${fmt(c.close)}`;
  };
  el.addEventListener("pointerdown", show);
  el.addEventListener("pointermove", show);
  el.addEventListener("pointerleave", () => { tip.textContent = idle; volIdle(); });
}
function intraSVG(cs, prev, opt = {}) {
  let hi = -Infinity, lo = Infinity;
  cs.forEach((c) => { hi = Math.max(hi, c.high); lo = Math.min(lo, c.low); });
  if (prev != null) { hi = Math.max(hi, prev); lo = Math.min(lo, prev); }
  const padT = 16, padB = 16;
  const y = (p) => padT + ((hi - p) / (hi - lo || 1)) * (CH - padT - padB);
  const slots = opt.slots || Math.max(cs.length, 96); // seans ~8 saat = 96 mum; erken saatte mumlar soldan dolsun
  const step = CW / slots, x = (i) => step * (i + 0.5);
  const bw = Math.max(1.5, step * 0.62);
  const body = cs.map((c, i) => {
    const col = c.close >= c.open ? "#2ECC8F" : "#FF6B70";
    const top = y(Math.max(c.open, c.close)), h = Math.max(1.2, Math.abs(y(c.open) - y(c.close)));
    return `<line x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${y(c.high).toFixed(1)}" y2="${y(c.low).toFixed(1)}" stroke="${col}" stroke-width="1"/><rect x="${(x(i) - bw / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${col}"/>`;
  }).join("");
  const grid = [0.25, 0.5, 0.75].map((f) => `<line x1="0" x2="${CW}" y1="${(padT + f * (CH - padT - padB)).toFixed(1)}" y2="${(padT + f * (CH - padT - padB)).toFixed(1)}" stroke="#1D232C"/>`).join("");
  const seps = opt.days ? cs.map((c, i) => (i > 0 && trParts(c.time).day !== trParts(cs[i - 1].time).day ? `<line x1="${(step * i).toFixed(1)}" x2="${(step * i).toFixed(1)}" y1="0" y2="${CH}" stroke="#232A33" stroke-dasharray="2 4"/>` : "")).join("") : "";
  const pl = prev != null ? `<line x1="0" x2="${CW}" y1="${y(prev).toFixed(1)}" y2="${y(prev).toFixed(1)}" stroke="#8A94A3" stroke-dasharray="4 4" stroke-width="1"/>` : "";
  const svg = `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="${opt.aria || "Gün içi 5 dakikalık grafik"}">${grid}${seps}${pl}${body}<text x="4" y="11" fill="#8A94A3" font-size="10">${fmt(hi)}</text><text x="4" y="${CH - 4}" fill="#8A94A3" font-size="10">${fmt(lo)}</text></svg>`;
  return { svg, step };
}
async function drawIntra(a, force = false) {
  const box = $("#chart"), tip = $("#tip");
  if (!box) return;
  if (!IC.has(a.sym)) box.innerHTML = '<div class="empty" style="padding:70px 0">Gün içi veri yükleniyor…</div>';
  let v;
  try { v = await loadIntra(a.sym, force); }
  catch (e) { if (DT.range === 0 && $("#chart") === box) { box.innerHTML = `<div class="empty" style="padding:70px 0">${esc(e.message)}</div>`; tip.textContent = ""; } return; }
  if (DT.range !== 0 || $("#chart") !== box) return;
  const { svg, step } = intraSVG(v.cs, v.prev);
  box.innerHTML = svg;
  paintVol(v.cs, Math.max(v.cs.length, 96), false); volIdle();
  const last = v.cs[v.cs.length - 1];
  const idle = `5 dk · ${fmtDay(v.cs[0].time)} · ${fmtHM(v.cs[0].time)}–${fmtHM(last.time)}`;
  tip.textContent = idle;
  const el = $("svg", box);
  const show = (e) => {
    const r = el.getBoundingClientRect();
    const i = Math.max(0, Math.min(v.cs.length - 1, Math.floor(((e.clientX - r.left) / r.width) * CW / step)));
    const c = v.cs[i];
    volHover(c);
    tip.textContent = `${fmtHM(c.time)} · A ${fmt(c.open)} Y ${fmt(c.high)} D ${fmt(c.low)} K ${fmt(c.close)}`;
  };
  el.addEventListener("pointerdown", show);
  el.addEventListener("pointermove", show);
  el.addEventListener("pointerleave", () => { tip.textContent = idle; volIdle(); });
}

function drawChart(a) {
  const box = $("#chart");
  if (!box) return;
  const ix = IX[DT.range];
  if ($("#vol")) $("#vol").innerHTML = "";
  $$(".legend2 span:not(.tip)").forEach((e) => (e.hidden = DT.range === 0 || !!ix));
  if (DT.range === 0) { drawIntra(a); return; }
  if (ix) { drawIntraX(a, ix); return; }
  drawDaily(a, "");
}
function drawDaily(a, note) {
  const box = $("#chart");
  if (!box) return;
  $$(".legend2 span:not(.tip)").forEach((e) => (e.hidden = false));
  const { svg, cs, step } = chartSVG(a.d, DT.range);
  box.innerHTML = svg;
  paintVol(cs, cs.length, true); volIdle();
  const tip = $("#tip");
  const last = cs[cs.length - 1];
  const idle = `${note ? note + " · " : ""}${fmtDay(cs[0].time)} – ${fmtDay(last.time)}`;
  tip.textContent = idle;
  const el = $("svg", box);
  const show = (e) => {
    const r = el.getBoundingClientRect();
    const i = Math.max(0, Math.min(cs.length - 1, Math.floor(((e.clientX - r.left) / r.width) * CW / step)));
    const c = cs[i];
    volHover(c);
    tip.textContent = `${fmtDay(c.time)} · A ${fmt(c.open)} Y ${fmt(c.high)} D ${fmt(c.low)} K ${fmt(c.close)}`;
  };
  el.addEventListener("pointerdown", show);
  el.addEventListener("pointermove", show);
  el.addEventListener("pointerleave", () => { tip.textContent = idle; volIdle(); });
}

// ---------- sektör etiketleri (genel sınıflama; BIST 100 listesi için) ----------
const SECTOR_LISTS = {
  "Bankacılık": ["AKBNK","ALBRK","GARAN","HALKB","ISCTR","TSKB","VAKBN","YKBNK"],
  "Sigorta/Finans": ["ANSGR","ANHYT","TURSG","ISMEN"],
  "Holding": ["AGHOL","ALARK","BERA","BINHO","BRYAT","DOHOL","ECZYT","GLYHO","KCHOL","PAHOL","SAHOL","TKFEN"],
  "Otomotiv": ["DOAS","EGEEN","FROTO","KARSN","OTKAR","TOASO","TTRAK"],
  "Enerji": ["AKFYE","AKSEN","AYGAZ","CANTE","CWENE","ENERY","ENJSA","ENTRA","EUREN","GWIND","ODAS","TRENJ","TUPRS","ZOREN"],
  "Kimya": ["AKSA","EGGUB","GUBRF","HEKTS","PETKM","SASA"],
  "Metal": ["BRSAN","CVKMD","EREGL","ISDMR","KCAER","KRDMD"],
  "Madencilik": ["TRALT","TRMET"],
  "Sanayi": ["ARCLK","ASTOR","KATMR","KORDS","VESTL"],
  "Savunma": ["ASELS"],
  "Perakende": ["BIMAS","MAVI","MGROS","SOKM"],
  "Gıda/İçecek": ["AEFES","CCOLA","OBAMS","TABGD","TUKAS","ULKER"],
  "Ulaştırma": ["GRSEL","PGSUS","RYSAS","TAVHL","THYAO"],
  "İletişim": ["TCELL","TTKOM"],
  "GYO": ["EKGYO","RGYAS","SNGYO","TRGYO"],
  "İnşaat": ["ENKAI","GLRMK"],
  "Çimento/Cam": ["AKCNS","BTCIM","CIMSA","LMKDC","OYAKC","SISE"],
  "Sağlık": ["ECILC","MPARK"],
};
const SECTOR_OF = {};
Object.entries(SECTOR_LISTS).forEach(([k, arr]) => arr.forEach((s) => (SECTOR_OF[s] = k)));
const sectorOf = (sym) => SECTOR_OF[sym] || "Diğer";
const dm = (iso) => iso.slice(8, 10) + "." + iso.slice(5, 7);
const trDay = (u) => new Date((u + 3 * 3600) * 1000).toISOString().slice(0, 10);

// ---------- sinyal geçmişi: her gün, o günkü veriyle yeniden hesaplanır ----------
function sigHistory(a, days = 30) {
  const raw = a.raw;
  if (!raw || !raw.timestamp) return null;
  const ts = raw.timestamp, q = raw.indicators.quote[0], n = ts.length, out = [];
  for (let k = days - 1; k >= 1; k--) {
    const m = n - k;
    if (m < 60) continue;
    try {
      const sl = (arr) => arr.slice(0, m);
      const d = processChart({ timestamp: sl(ts), indicators: { quote: [{ open: sl(q.open), high: sl(q.high), low: sl(q.low), close: sl(q.close), volume: sl(q.volume) }] }, meta: {} });
      const sg = sigOf(computeRecommendation(d, a.f));
      out.push({ date: trDay(ts[m - 1]), key: sg.key, score: sg.score });
    } catch (e) { /* o gün atlanır */ }
  }
  const lastC = a.d.candles[a.d.candles.length - 1];
  out.push({ date: trDay(lastC.time), key: a.sig.key, score: a.sig.score });
  return out;
}
function histHTML(h) {
  if (!h || h.length < 2) return "";
  const col = { AL: "var(--up)", TUT: "var(--warn)", SAT: "var(--down)" };
  let chg = 0, li = -1;
  for (let i = 1; i < h.length; i++) if (h[i].key !== h[i - 1].key) { chg++; li = i; }
  const sum = li < 0 ? `${h.length} işlem günüdür ${h[h.length - 1].key}` : `Son değişim ${dm(h[li].date)}: ${h[li - 1].key} → ${h[li].key} · ${chg} değişim`;
  return `<div class="sec h">Sinyal geçmişi (son ${h.length} işlem günü)</div>
    <div class="card"><div class="sgh" id="sgh" role="img" aria-label="${esc(sum)}">${h.map((x, i) => `<i data-i="${i}" style="background:${col[x.key]};height:${14 + Math.round(x.score * 0.3)}px"></i>`).join("")}</div>
    <div class="sghd num"><span>${dm(h[0].date)}</span><span>${dm(h[h.length - 1].date)}</span></div>
    <div class="sghtip num" id="sghTip">${esc(sum)}</div>
    <div class="sghnote">Her gün, o günün fiyat verisiyle yeniden hesaplanır. Analist ortalaması bugünkü değerle sabit alınır. Çubuk yüksekliği skordur.</div></div>`;
}
function histBind(h) {
  const el = $("#sgh"), tip = $("#sghTip");
  if (!el || !h) return;
  const idle = tip.textContent;
  const show = (e) => {
    const r = el.getBoundingClientRect();
    const i = Math.max(0, Math.min(h.length - 1, Math.floor(((e.clientX - r.left) / r.width) * h.length)));
    tip.textContent = `${dm(h[i].date)} · ${h[i].key} · ${h[i].score}/100`;
  };
  el.addEventListener("pointerdown", show);
  el.addEventListener("pointermove", show);
  el.addEventListener("pointerleave", () => { tip.textContent = idle; volIdle(); });
}

// ---------- not ve hedef fiyat (takip listesi kaydına yazılır) ----------
function noteHTML(item, price) {
  if (!item) return `<div class="sec h">Notum ve hedef</div><div class="card"><div class="sub" style="margin:0">Not ve hedef fiyat takip listendeki hisseler için. Önce yukarıdan takibe ekle.</div></div>`;
  const t = item.target;
  return `<div class="sec h">Notum ve hedef</div><div class="card notecard">
    <div class="two"><label class="field"><span>Hedef fiyat (₺)</span><input id="nTarget" inputmode="decimal" autocomplete="off" placeholder="0,00" value="${t != null ? esc(String(t).replace(".", ",")) : ""}"></label>
    <div class="ndist num" id="nDist">${distText(t, price)}</div></div>
    <label class="field" style="margin-top:12px"><span>Not</span><textarea id="nText" rows="3" maxlength="300" placeholder="Neden takipteyim, ne bekliyorum…">${esc(item.note || "")}</textarea></label>
    <button type="button" class="ghost" id="nSave" style="width:100%;margin-top:12px">Kaydet</button></div>`;
}
function distText(t, price) {
  if (t == null || !(t > 0) || !(price > 0)) return "";
  const d = ((t - price) / price) * 100;
  return d <= 0 ? '<span class="up">Hedefe ulaştı</span>' : `<span>Hedefe ${pct(d, 1)} uzak</span>`;
}
async function saveNote(sym, target, note) {
  const items = await kvGet("watchlist"); // yazmadan önce taze oku
  const it = items.find((x) => x.symbol === sym);
  if (!it) throw new Error(sym + " takip listende değil.");
  if (target != null) it.target = target; else delete it.target;
  if (note) it.note = note; else delete it.note;
  await kvPost("watchlist", { items });
  WL = items;
}

async function viewHisse(id, sym) {
  if (!sym) { location.hash = "#/bist"; return; }
  setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button>
    <div class="t"><h1>${esc(sym)}</h1><div class="n">Yükleniyor…</div></div></div>${skeleton(6)}`);
  $("#dBack").onclick = () => { if (history.length > 1) history.back(); else location.hash = "#/" + lastTab; };
  let a;
  try { a = await analyze(sym); }
  catch (e) {
    if (id === RID && !e.auth) {
      setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(sym)}</h1></div></div>${errBlock(e.message)}`);
      $("#dBack").onclick = () => { if (history.length > 1) history.back(); else location.hash = "#/" + lastTab; };
      $("#retry").onclick = () => viewHisse(++RID, sym);
    }
    return;
  }
  if (id !== RID) return;
  let wlItems = []; try { wlItems = await getWL(); } catch (e) { /* yıldız boş kalır */ }
  if (id !== RID) return;
  const wl = wlItems.map((x) => x.symbol), wlItem = wlItems.find((x) => x.symbol === sym);
  const { d, f, rec, sig } = a;
  const sh = sigHistory(a);
  const prev = f.previousClose != null && f.previousClose > 0 ? f.previousClose : d.prevClose;
  const diff = d.lastClose - prev;
  const dchg = prev ? (diff / prev) * 100 : d.changes.daily;
  const pos = rec.factors.filter((x) => parseFloat(x[1]) > 0).length;
  const neg = rec.factors.filter((x) => parseFloat(x[1]) < 0).length;
  const ntr = rec.factors.length - pos - neg;
  const macdTxt = d.macd == null ? "—" : fmt(d.macd, 2);
  const avg30 = volAvg(d);
  DT.avg = avg30;
  const cells = [
    ["RSI (14)", d.rsi != null ? fmt(d.rsi, 0) : "—"],
    ["MACD / Sinyal", d.macd != null ? `${macdTxt} / ${fmt(d.macdSignal, 2)}` : "—"],
    ["SMA 50 / 200", `${fmt(d.ma50)} / ${fmt(d.ma200)}`],
    ["Bollinger alt–üst", d.bollingerLower != null ? `${fmt(d.bollingerLower)} – ${fmt(d.bollingerUpper)}` : "—"],
    ["Gün aralığı", `${fmt(d.dayLow)} – ${fmt(d.dayHigh)}`],
    ["52 hafta aralığı", `${fmt(f.fiftyTwoWeekLow ?? d.week52Low)} – ${fmt(f.fiftyTwoWeekHigh ?? d.week52High)}`],
    ["Önceki kapanış", fmt(prev)],
    ["Hacim (TL)", d.dayVolume ? "≈ " + compact(d.dayVolume * d.lastClose) + " ₺" : "—"],
    ["Hacim (adet)", compact(d.dayVolume)],
    ["Ort. hacim (30 gün, TL)", avg30 ? "≈ " + compact(avg30) + " ₺" : "—"],
    ["Bugünkü / ortalama hacim", avg30 && d.dayVolume ? "%" + fmt(((d.dayVolume * d.lastClose) / avg30) * 100, 0) : "—"],
  ];
  if (f.trailingPE != null) cells.push(["F/K", fmt(f.trailingPE, 1)]);
  if (f.priceToBook != null) cells.push(["PD/DD", fmt(f.priceToBook, 2)]);
  if (f.marketCap != null) cells.push(["Piyasa değeri", compact(f.marketCap) + " ₺"]);
  if (f.targetMeanPrice != null) cells.push(["Analist hedef fiyat", fmt(f.targetMeanPrice)]);
  const inWL = wl.includes(sym);
  setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button>
      <div class="t"><h1>${esc(sym)}</h1><div class="n">${esc(f.companyName || "")}</div></div>
      <button type="button" class="icon-btn" id="dStar" aria-label="${inWL ? "Takipten çıkar" : "Takibe ekle"}" style="color:${inWL ? "var(--warn)" : "var(--muted)"}">${inWL ? ICON.star : ICON.starO}</button></div>
    <div class="price num"><b>${fmt(d.lastClose)}</b><span class="${cls(diff)}">${sgn(diff, 2)} (${pct(dchg)})</span></div>
    <div class="sub" style="margin:0 0 4px">Veri gecikmeli olabilir</div>
    <div class="ranges" id="ranges">${RANGES.map(([l, n]) => `<button type="button" class="chip ${DT.range === n ? "on" : ""}" data-n="${n}">${l}</button>`).join("")}</div>
    <div class="chart" id="chart"></div>
    <div class="legend2"><span><i style="background:#5B9DFF"></i>SMA 50</span><span><i style="background:#B48CFF"></i>SMA 200</span><span class="tip num" id="tip"></span></div>
    <div class="volhead"><span>Hacim (TL)</span><span class="num" id="volTip"></span></div>
    <div class="chart vol" id="vol"></div>
    <div class="card sigcard"><span class="sigbig ${sig.key}">${sig.key}</span>
      <div class="tx"><b>${sig.strong ? "Güçlü " : ""}${sig.key} · Skor ${sig.score}/100</b><span>${pos} etken AL, ${neg} SAT, ${ntr} nötr yönünde</span></div></div>
    ${histHTML(sh)}
    <div class="sec h">Sinyalin nedeni</div>
    <div>${rec.factors.map(([l, v]) => { const n = parseFloat(v); const k = n > 0 ? "AL" : n < 0 ? "SAT" : "TUT"; return `<div class="frow"><span class="f1">${esc(l)}</span><span class="f2 num">${esc(v)}</span><span class="badge ${k}">${k}</span></div>`; }).join("")}</div>
    <div class="sec h">Göstergeler ve bilgiler</div>
    <div class="grid2 num">${cells.map(([l, v]) => `<div class="cell"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("")}</div>
    ${noteHTML(wlItem, d.lastClose)}
    <div class="sec h">Başka hisseyle karşılaştır</div>
    <div class="card"><div class="cmpgo"><input id="cmpIn" list="cmpList" autocapitalize="characters" autocomplete="off" placeholder="örn. GARAN" aria-label="Karşılaştırılacak hisse kodu"><button type="button" class="primary" id="cmpGo">Karşılaştır</button></div>
    <datalist id="cmpList">${BIST100.filter((x) => x !== sym).map((x) => `<option value="${x}">`).join("")}</datalist></div>
    <div class="actions"><button type="button" class="ghost" id="dWl">${inWL ? "Takipten çıkar" : "Takibe ekle"}</button><button type="button" class="primary" id="dPf">Portföye ekle</button></div>
    <div class="disc">Sinyal; RSI, 50/200 günlük ortalama, MACD, yıllık momentum ve analist ortalamasına dayalı kural tabanlı bir skordur. Bilgi amaçlıdır, yatırım tavsiyesi değildir.</div>`);
  $("#dBack").onclick = () => { if (history.length > 1) history.back(); else location.hash = "#/" + lastTab; };
  drawChart(a);
  $$("#ranges .chip").forEach((b) => (b.onclick = () => {
    DT.range = parseInt(b.dataset.n, 10);
    $$("#ranges .chip").forEach((x) => x.classList.toggle("on", x === b));
    drawChart(a);
  }));
  const toggle = async (btn) => {
    btn.disabled = true;
    try {
      const added = await wlToggle(sym, d.lastClose);
      toast(added ? `${sym} takibe eklendi` : `${sym} takipten çıkarıldı`);
      viewHisse(id, sym);
    } catch (e) { toast(e.message); btn.disabled = false; }
  };
  $("#dStar").onclick = (e) => toggle(e.currentTarget);
  $("#dWl").onclick = (e) => toggle(e.currentTarget);
  $("#dPf").onclick = () => openSheet({ mode: "buy", symbol: sym, price: d.lastClose.toFixed(2) });
  histBind(sh);
  const goCmp = () => {
    const code = cleanSym($("#cmpIn").value);
    if (code.length < 2) { toast("Karşılaştırılacak hisse kodunu yaz."); return; }
    if (code === sym) { toast("Aynı hisseyi seçtin."); return; }
    location.hash = `#/karsilastir/${sym}/${code}`;
  };
  $("#cmpGo").onclick = goCmp;
  $("#cmpIn").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); goCmp(); } });
  if (wlItem) {
    $("#nTarget").addEventListener("input", () => { const v = parseNum($("#nTarget").value); $("#nDist").innerHTML = distText(isNaN(v) ? null : v, d.lastClose); });
    $("#nSave").onclick = async (e) => {
      const btn = e.currentTarget, raw = $("#nTarget").value.trim();
      const t = raw === "" ? null : parseNum(raw);
      if (t != null && (isNaN(t) || t <= 0)) { toast("Hedef fiyat geçerli bir sayı olmalı."); return; }
      btn.disabled = true;
      try { await saveNote(sym, t, $("#nText").value.trim()); toast("Not ve hedef kaydedildi"); }
      catch (err) { toast(err.message); } finally { btn.disabled = false; }
    };
  }
  let lastPx = d.lastClose;
  setLive(async () => {
    if (id !== RID) return;
    const q = (await getQuotes([sym], true))[sym];
    const el = $(".price");
    if (!q || q.price == null || !el) return;
    const p0 = q.previousClose != null && q.previousClose > 0 ? q.previousClose : prev;
    const df = q.price - p0, ch = q.changePct != null ? q.changePct : (p0 ? (df / p0) * 100 : 0);
    const dir = q.price > lastPx ? "up" : q.price < lastPx ? "down" : "";
    lastPx = q.price;
    el.innerHTML = `<b class="${dir ? "fl-" + dir : ""}">${fmt(q.price)}</b><span class="${cls(df)}">${sgn(df, 2)} (${pct(ch)})</span>`;
    if (DT.range === 0) drawIntra(a, true);
    else if (IX[DT.range]) drawIntraX(a, IX[DT.range]);
  });
}

// ==========================================================================
// 9b) İKİ HİSSE KARŞILAŞTIRMA
// ==========================================================================
const CMP = { n: 126 };
const CMP_RANGES = [["1A", 21], ["3A", 63], ["6A", 126], ["1Y", 9999]];
const CMP_COL = ["#5B9DFF", "#FF8A5B"];
function cmpSVG(a, b, n) {
  const m = Math.min(n, a.d.closes.length, b.d.closes.length);
  const ca = a.d.closes.slice(-m), cb = b.d.closes.slice(-m);
  const ra = ca.map((v) => (v / ca[0] - 1) * 100), rb = cb.map((v) => (v / cb[0] - 1) * 100);
  const times = a.d.candles.slice(-m).map((c) => c.time);
  const hi = Math.max(0, ...ra, ...rb), lo = Math.min(0, ...ra, ...rb);
  const padT = 16, padB = 16;
  const y = (v) => padT + ((hi - v) / (hi - lo || 1)) * (CH - padT - padB);
  const x = (i) => (CW * i) / (m - 1 || 1);
  const line = (arr, col) => `<polyline points="${arr.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ")}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  const svg = `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Normalize edilmiş getiri karşılaştırması"><line x1="0" x2="${CW}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="#2B333E" stroke-dasharray="4 4"/>${line(ra, CMP_COL[0])}${line(rb, CMP_COL[1])}<text x="4" y="11" fill="#8A94A3" font-size="10">${pct(hi, 0)}</text><text x="4" y="${CH - 4}" fill="#8A94A3" font-size="10">${pct(lo, 0)}</text></svg>`;
  return { svg, ra, rb, times, m };
}
const trendTxt = (d) => (d.ma50 == null || d.ma200 == null ? "—" : d.lastClose > d.ma50 && d.ma50 > d.ma200 ? "Yükseliş" : d.lastClose < d.ma50 && d.ma50 < d.ma200 ? "Düşüş" : "Karışık");
async function viewKarsilastir(id, A, B) {
  if (!A || !B || A === B) { location.hash = "#/" + lastTab; return; }
  const back = () => { if (history.length > 1) history.back(); else location.hash = "#/" + lastTab; };
  setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(A)} · ${esc(B)}</h1><div class="n">Karşılaştırma</div></div></div>${skeleton(6)}`);
  $("#dBack").onclick = back;
  let a, b;
  try { [a, b] = await Promise.all([analyze(A), analyze(B)]); }
  catch (e) {
    if (id === RID && !e.auth) {
      setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(A)} · ${esc(B)}</h1></div></div>${errBlock(e.message)}`);
      $("#dBack").onclick = back; $("#retry").onclick = () => viewKarsilastir(++RID, A, B);
    }
    return;
  }
  if (id !== RID) return;
  let q = {}; try { q = await getQuotes([A, B]); } catch (e) { /* analiz fiyatı yeter */ }
  if (id !== RID) return;
  const xs = [a, b], names = [A, B];
  const price = xs.map((x, i) => q[names[i]]?.price ?? x.d.lastClose);
  const dchg = xs.map((x, i) => q[names[i]]?.changePct ?? x.d.changes.daily);
  const pos52 = xs.map((x) => { const lo = x.f.fiftyTwoWeekLow ?? x.d.week52Low, hi = x.f.fiftyTwoWeekHigh ?? x.d.week52High; return hi > lo ? ((x.d.lastClose - lo) / (hi - lo)) * 100 : null; });
  const rows = [
    ["Sinyal", xs.map((x) => `${x.sig.strong ? "Güçlü " : ""}${x.sig.key} · ${x.sig.score}/100`), xs.map((x) => (x.sig.key === "AL" ? "up" : x.sig.key === "SAT" ? "down" : "warn"))],
    ["Günlük", dchg.map((v) => pct(v)), dchg.map(cls)],
    ["1 hafta", xs.map((x) => pct(x.d.changes.weekly)), xs.map((x) => cls(x.d.changes.weekly))],
    ["1 ay", xs.map((x) => pct(x.d.changes.monthly)), xs.map((x) => cls(x.d.changes.monthly))],
    ["6 ay", xs.map((x) => pct(x.d.changes.sixMonth)), xs.map((x) => cls(x.d.changes.sixMonth))],
    ["1 yıl", xs.map((x) => pct(x.d.changes.yearly)), xs.map((x) => cls(x.d.changes.yearly))],
    ["RSI (14)", xs.map((x) => (x.d.rsi != null ? fmt(x.d.rsi, 0) : "—"))],
    ["Trend (SMA 50/200)", xs.map((x) => trendTxt(x.d))],
    ["MACD", xs.map((x) => (x.d.macd == null ? "—" : x.d.macd > x.d.macdSignal ? "Pozitif" : "Negatif"))],
    ["52 hf. aralıkta konum", pos52.map((v) => (v == null ? "—" : "%" + fmt(v, 0)))],
    ["F/K", xs.map((x) => (x.f.trailingPE != null ? fmt(x.f.trailingPE, 1) : "—"))],
    ["PD/DD", xs.map((x) => (x.f.priceToBook != null ? fmt(x.f.priceToBook, 2) : "—"))],
    ["Hacim (TL)", xs.map((x) => (x.d.dayVolume ? "≈ " + compact(x.d.dayVolume * x.d.lastClose) + " ₺" : "—"))],
    ["Piyasa değeri", xs.map((x) => (x.f.marketCap != null ? compact(x.f.marketCap) + " ₺" : "—"))],
    ["Analist hedef fiyat", xs.map((x) => (x.f.targetMeanPrice != null ? fmt(x.f.targetMeanPrice) : "—"))],
    ["Sektör", names.map(sectorOf)],
  ];
  const colHead = (i) => `<a href="#/hisse/${names[i]}" class="cmph" style="color:${CMP_COL[i]}"><i style="background:${CMP_COL[i]}"></i>${esc(names[i])}</a>`;
  setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(A)} · ${esc(B)}</h1><div class="n">Karşılaştırma · Veri gecikmeli olabilir</div></div></div>
    <div class="grid2" style="margin-top:12px">${xs.map((x, i) => `<a class="card cmpc" href="#/hisse/${names[i]}"><span class="cmpn" style="color:${CMP_COL[i]}"><i style="background:${CMP_COL[i]}"></i>${esc(names[i])}</span><span class="nm">${esc(q[names[i]]?.name || x.f.companyName || "")}</span><b class="num">${fmt(price[i])}</b><span class="num ${cls(dchg[i])}">${pct(dchg[i])}</span>${badgeHTML(x.sig)}</a>`).join("")}</div>
    <div class="sec h">Getiri karşılaştırması</div>
    <div class="ranges" id="cmpRanges">${CMP_RANGES.map(([l, n]) => `<button type="button" class="chip ${CMP.n === n ? "on" : ""}" data-n="${n}">${l}</button>`).join("")}</div>
    <div class="chart" id="cmpChart"></div>
    <div class="legend2"><span style="color:${CMP_COL[0]}"><i style="background:${CMP_COL[0]}"></i>${esc(A)}</span><span style="color:${CMP_COL[1]}"><i style="background:${CMP_COL[1]}"></i>${esc(B)}</span><span class="tip num" id="cmpTip"></span></div>
    <div class="sec h">Göstergeler</div>
    <div class="card cmpt"><div class="r3 hd"><span></span>${colHead(0)}${colHead(1)}</div>${rows.map(([l, v, c]) => `<div class="r3"><span>${esc(l)}</span><b class="num ${c ? c[0] : ""}">${esc(v[0])}</b><b class="num ${c ? c[1] : ""}">${esc(v[1])}</b></div>`).join("")}</div>
    <div class="disc">Karşılaştırma bilgi amaçlıdır, yatırım tavsiyesi değildir. Getiri grafiği, seçilen dönemin başını %0 kabul eder.</div>`);
  $("#dBack").onclick = back;
  const draw = () => {
    const c = cmpSVG(a, b, CMP.n);
    $("#cmpChart").innerHTML = c.svg;
    const tip = $("#cmpTip"), idle = `${fmtDay(c.times[0])} – ${fmtDay(c.times[c.m - 1])}`;
    tip.textContent = idle;
    const el = $("svg", $("#cmpChart"));
    const show = (e) => {
      const r = el.getBoundingClientRect();
      const i = Math.max(0, Math.min(c.m - 1, Math.round(((e.clientX - r.left) / r.width) * (c.m - 1))));
      tip.textContent = `${fmtDay(c.times[i])} · ${A} ${pct(c.ra[i], 1)} · ${B} ${pct(c.rb[i], 1)}`;
    };
    el.addEventListener("pointerdown", show);
    el.addEventListener("pointermove", show);
    el.addEventListener("pointerleave", () => { tip.textContent = idle; volIdle(); });
  };
  draw();
  $$("#cmpRanges .chip").forEach((bt) => (bt.onclick = () => {
    CMP.n = parseInt(bt.dataset.n, 10);
    $$("#cmpRanges .chip").forEach((x) => x.classList.toggle("on", x === bt));
    draw();
  }));
}

// ==========================================================================
// 10) Başlat
// ==========================================================================
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
// ==========================================================================
// 10) KUR (USD/TRY, EUR/TRY) ve KRİPTO 50
// ==========================================================================
const FXC = { t: 0, v: null };
async function loadFx(force = false) {
  if (!force && FXC.v && Date.now() - FXC.t < 20000) return FXC.v;
  const r = await api("/api/fx");
  FXC.v = r; FXC.t = Date.now();
  return r;
}
const FX_LABEL = { USDTRY: "Dolar / TL", EURTRY: "Euro / TL" };
function fxStripHTML(r) {
  if (!r || !r.rates) return "";
  return `<div class="fxstrip">${r.rates.map((x) => `<div class="fxc"><span>${FX_LABEL[x.pair] || x.pair}</span><b class="num">${fmt(x.price, 4)}</b><i class="num pctbox ${cls(x.changePct)}">${pct(x.changePct)}</i></div>`).join("")}</div>${r.stale ? '<div class="sub" style="margin:-2px 0 8px">Kur eski olabilir (kaynak yanıt vermedi)</div>' : ""}`;
}
async function loadFxStrip(id, el, force = false) {
  try { const r = await loadFx(force); if (id === RID && el) el.innerHTML = fxStripHTML(r); }
  catch (e) { if (e.auth) return; if (id === RID && el) el.innerHTML = ""; }
}

const fmtP = (n) => (n == null || isNaN(n) ? "—" : fmt(n, n >= 1 ? 2 : n >= 0.01 ? 4 : 6));
const fmtUSD = (n) => "$" + fmtP(n);
const CR = { sort: "rank", q: "", cache: null };
async function loadCrypto(force = false) {
  if (!force && CR.cache && Date.now() - CR.cache.t < 20000) return CR.cache.v;
  const v = await api("/api/crypto");
  CR.cache = { t: Date.now(), v };
  return v;
}
function modeSegHTML(mode) {
  return `<div class="seg" id="mkSeg" role="group" aria-label="Piyasa"><button type="button" data-k="bist" class="${mode === "bist" ? "on" : ""}">BIST</button><button type="button" data-k="kripto" class="${mode === "kripto" ? "on" : ""}">Kripto 50</button></div>`;
}
function modeSegBind(id) {
  $$("#mkSeg button").forEach((b) => (b.onclick = () => { BS.mode = b.dataset.k; (BS.mode === "kripto" ? viewKripto : viewBist)(++RID); }));
}
async function viewKripto(id) {
  setView(`${modeSegHTML("kripto")}<div id="mkFx" style="margin-top:8px"></div>
    <div class="search">${ICON.search}<input id="crQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="Kripto ara (BTC, Ethereum…)" aria-label="Kripto ara" value="${esc(CR.q)}"></div>
    <div class="chips" id="crChips"></div>
    <div class="list" id="crList">${skeleton(8)}</div>
    <div class="disc">Fiyatlar CoinGecko'dan (USD), TL karşılığı anlık dolar kuruyla hesaplanır. Piyasa değerine göre ilk 50. Bilgi amaçlıdır.</div>`);
  modeSegBind(id);
  loadFxStrip(id, $("#mkFx"));
  const inp = $("#crQ");
  const draw = async (live = false) => {
    if (id !== RID) return;
    live = live === true;
    const sorts = [["rank", "Değer"], ["up", "Yükselen"], ["down", "Düşen"], ["vol", "Hacim"]];
    $("#crChips").innerHTML = sorts.map(([k, l]) => `<button type="button" class="chip ${CR.sort === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $$("#crChips .chip").forEach((b) => (b.onclick = () => { CR.sort = b.dataset.s; draw(); }));
    let r;
    try { r = await loadCrypto(live); } catch (e) { if (live) throw e; if (id === RID && !e.auth) { $("#crList").innerHTML = errBlock(e.message); $("#retry").onclick = () => draw(); } return; }
    if (id !== RID) return;
    const q = fold(CR.q.trim());
    let rows = r.coins.filter((c) => !q || fold(c.sym).includes(q) || fold(c.name).includes(q));
    const by = { rank: (a, b) => a.rank - b.rank, up: (a, b) => (b.chg24 ?? -1e9) - (a.chg24 ?? -1e9), down: (a, b) => (a.chg24 ?? 1e9) - (b.chg24 ?? 1e9), vol: (a, b) => (b.vol || 0) - (a.vol || 0) };
    rows.sort(by[CR.sort]);
    const tl = r.usdtry;
    $("#crList").innerHTML = (r.stale ? '<div class="sub" style="margin:0 0 6px">Veri eski olabilir (kaynak yanıt vermedi)</div>' : "") +
      (rows.length ? rows.map((c) => `<div class="row"><a class="rowlink" href="#/kripto/${esc(c.id)}">
        <div class="id"><span class="code"><small class="rk num">${c.rank}</small> ${esc(c.sym)}</span><span class="name">${esc(c.name)}</span></div>
        <div class="px num"><b>${fmtUSD(c.price)}</b><span class="${cls(c.chg24)}">${pct(c.chg24)}</span>${tl ? `<small>≈ ${fmtP(c.price * tl)} ₺</small>` : ""}</div></a></div>`).join("") : '<div class="empty">Sonuç yok.</div>');
  };
  let tmr = 0;
  inp.addEventListener("input", () => { CR.q = inp.value; clearTimeout(tmr); tmr = setTimeout(draw, 150); });
  await draw();
  if (id === RID) setLive(async () => { if (id === RID && document.activeElement !== inp) { await draw(true); loadFxStrip(id, $("#mkFx"), true); } });
}

// ---- kripto detay ----
const CRD = { range: 126 };
const CR_RANGES = [["1A", 21], ["3A", 63], ["6A", 126], ["1Y", 9999]];
const CCH = new Map();
async function loadCryptoChart(cid) {
  const c = CCH.get(cid);
  if (c && Date.now() - c.t < 5 * 60000) return c.v;
  const r = await api("/api/cryptochart", { id: cid, days: 365 });
  const res = r.chart?.result?.[0];
  if (!res || !res.timestamp) throw new Error("Grafik verisi alınamadı.");
  const d = processChart(res);
  d.lineOnly = true;
  const rec = computeRecommendation(d, {});
  const v = { d, rec, sig: sigOf(rec), stale: !!r.stale };
  CCH.set(cid, { t: Date.now(), v });
  return v;
}
function cryptoVolSVG(cs) {
  const H = 64, step = CW / cs.length, bw = Math.max(1.5, Math.min(12, step * 0.62));
  const vals = cs.map((c) => c.volume || 0), mx = Math.max(...vals, 1);
  const bars = cs.map((c, i) => { const h = vals[i] > 0 ? Math.max(1, (vals[i] / mx) * (H - 14)) : 0; return `<rect x="${(step * (i + 0.5) - bw / 2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${c.close >= c.open ? "#2ECC8F" : "#FF6B70"}" opacity=".6"/>`; }).join("");
  return `<svg viewBox="0 0 ${CW} ${H}" role="img" aria-label="Hacim (USD) çubuk grafiği">${bars}<text x="4" y="10" fill="#8A94A3" font-size="10">$${compact(mx)}</text></svg>`;
}
async function viewKriptoDetay(id, cid) {
  const back = () => { if (history.length > 1) history.back(); else location.hash = "#/bist"; };
  setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(cid)}</h1><div class="n">Yükleniyor…</div></div></div>${skeleton(6)}`);
  $("#dBack").onclick = back;
  let list, cc;
  try { [list, cc] = await Promise.all([loadCrypto(), loadCryptoChart(cid)]); }
  catch (e) {
    if (id === RID && !e.auth) {
      setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(cid)}</h1></div></div>${errBlock(e.message)}`);
      $("#dBack").onclick = back; $("#retry").onclick = () => viewKriptoDetay(++RID, cid);
    }
    return;
  }
  if (id !== RID) return;
  const coin = list.coins.find((c) => c.id === cid);
  if (!coin) { setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button><div class="t"><h1>${esc(cid)}</h1></div></div><div class="empty">Bu kripto ilk 50 listesinde değil.</div>`); $("#dBack").onclick = back; return; }
  const { d, rec, sig } = cc;
  const tl = list.usdtry;
  const pos = rec.factors.filter((x) => parseFloat(x[1]) > 0).length, neg = rec.factors.filter((x) => parseFloat(x[1]) < 0).length, ntr = rec.factors.length - pos - neg;
  const cells = [
    ["24s değişim", pct(coin.chg24)], ["7 gün değişim", pct(coin.chg7)], ["30 gün değişim", pct(coin.chg30)],
    ["24s aralık", coin.lo24 != null ? `${fmtUSD(coin.lo24)} – ${fmtUSD(coin.hi24)}` : "—"],
    ["Piyasa değeri", "$" + compact(coin.mcap)], ["24s hacim", "$" + compact(coin.vol)],
    ["RSI (14)", d.rsi != null ? fmt(d.rsi, 0) : "—"], ["MACD / Sinyal", d.macd != null ? `${fmtP(d.macd)} / ${fmtP(d.macdSignal)}` : "—"],
    ["SMA 50 / 200", `${fmtUSD(d.ma50)} / ${fmtUSD(d.ma200)}`], ["1 yıllık aralık", `${fmtUSD(d.week52Low)} – ${fmtUSD(d.week52High)}`],
  ];
  const livePrice = (c) => `<b>${fmtUSD(c.price)}</b><span class="${cls(c.chg24)}">${pct(c.chg24)} · 24s</span>${tl ? `<small class="num" style="color:var(--muted);margin-left:8px">≈ ${fmtP(c.price * tl)} ₺</small>` : ""}`;
  setView(`<div class="dhead"><button type="button" class="icon-btn" id="dBack" aria-label="Geri">${ICON.back}</button>
      <div class="t"><h1>${esc(coin.sym)}</h1><div class="n">${esc(coin.name)} · #${coin.rank}</div></div></div>
    <div class="price num" id="crPrice">${livePrice(coin)}</div>
    <div class="sub" style="margin:0 0 4px">Günlük kapanışlara göre · ${cc.stale ? "veri eski olabilir" : "CoinGecko"}</div>
    <div class="ranges" id="ranges">${CR_RANGES.map(([l, n]) => `<button type="button" class="chip ${CRD.range === n ? "on" : ""}" data-n="${n}">${l}</button>`).join("")}</div>
    <div class="chart" id="chart"></div>
    <div class="legend2"><span><i style="background:#5B9DFF"></i>SMA 50</span><span><i style="background:#B48CFF"></i>SMA 200</span><span class="tip num" id="tip"></span></div>
    <div class="volhead"><span>Hacim (USD)</span><span class="num" id="volTip"></span></div>
    <div class="chart vol" id="vol"></div>
    <div class="card sigcard"><span class="sigbig ${sig.key}">${sig.key}</span>
      <div class="tx"><b>${sig.strong ? "Güçlü " : ""}${sig.key} · Skor ${sig.score}/100</b><span>${pos} etken AL, ${neg} SAT, ${ntr} nötr yönünde</span></div></div>
    <div class="sec h">Sinyalin nedeni</div>
    <div>${rec.factors.map(([l, v]) => { const n = parseFloat(v); const k = n > 0 ? "AL" : n < 0 ? "SAT" : "TUT"; return `<div class="frow"><span class="f1">${esc(l)}</span><span class="f2 num">${esc(v)}</span><span class="badge ${k}">${k}</span></div>`; }).join("")}</div>
    <div class="sec h">Göstergeler ve bilgiler</div>
    <div class="grid2 num">${cells.map(([l, v]) => `<div class="cell"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("")}</div>
    <div class="disc">Sinyal; RSI, 50/200 günlük ortalama, MACD ve yıllık momentuma dayalı kural tabanlı bir skordur (kripto için analist verisi yoktur). Grafik günlük kapanışlardan çizilir; mum fitilleri yoktur. Bilgi amaçlıdır, yatırım tavsiyesi değildir.</div>`);
  $("#dBack").onclick = back;
  const drawC = () => {
    const { svg, cs, step } = chartSVG(d, CRD.range);
    $("#chart").innerHTML = svg;
    $("#vol").innerHTML = cryptoVolSVG(cs);
    const tip = $("#tip"), vt = $("#volTip");
    const avg = cs.reduce((s, c) => s + (c.volume || 0), 0) / cs.length;
    const idle = `${fmtDay(cs[0].time)} – ${fmtDay(cs[cs.length - 1].time)}`;
    tip.textContent = idle; vt.textContent = "ort. ≈ $" + compact(avg);
    const el = $("svg", $("#chart"));
    const show = (e) => { const r = el.getBoundingClientRect(); const i = Math.max(0, Math.min(cs.length - 1, Math.floor(((e.clientX - r.left) / r.width) * CW / step))); const c = cs[i]; tip.textContent = `${fmtDay(c.time)} · Kapanış ${fmtUSD(c.close)}`; vt.textContent = "≈ $" + compact(c.volume || 0); };
    el.addEventListener("pointerdown", show); el.addEventListener("pointermove", show);
    el.addEventListener("pointerleave", () => { tip.textContent = idle; vt.textContent = "ort. ≈ $" + compact(avg); });
  };
  drawC();
  $$("#ranges .chip").forEach((b) => (b.onclick = () => { CRD.range = parseInt(b.dataset.n, 10); $$("#ranges .chip").forEach((x) => x.classList.toggle("on", x === b)); drawC(); }));
  setLive(async () => {
    if (id !== RID) return;
    const l = await loadCrypto(true);
    const c = l.coins.find((x) => x.id === cid), el = $("#crPrice");
    if (c && el) { coin.price = c.price; el.innerHTML = livePrice({ ...c }); }
  });
}


route();
})();
