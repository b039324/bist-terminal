/* ==========================================================================
   BIST MOBİL — mobil.js
   Masaüstü sürümle aynı Worker, aynı şifre, aynı portföy/takip verisi.
   Göstergeler ve AL/TUT/SAT skoru app.js'teki mantığın aynısıdır.
   ========================================================================== */
(() => {
"use strict";

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
    r = await fetch(`${WORKER_URL}${path}?${q}`);
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
    const d = await api("/api/quotebatch", { symbols: chunk.join(",") });
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
  const [cr, qr] = await Promise.all([
    api("/api/chart", { symbol: sym, range: "1y", interval: "1d" }),
    api("/api/quote", { symbol: sym }).catch((e) => { if (e.auth) throw e; return null; }),
  ]);
  const res = cr.chart?.result?.[0];
  if (!res || !res.timestamp) throw new Error(`"${sym}" bulunamadı.`);
  const d = processChart(res);
  const f = processFund(qr);
  if (f.previousClose != null && f.previousClose > 0) d.changes.daily = ((d.lastClose - f.previousClose) / f.previousClose) * 100;
  const rec = computeRecommendation(d, f);
  const v = { sym, d, f, rec, sig: sigOf(rec) };
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
  const h = location.hash.replace(/^#\/?/, "");
  const [p, arg] = h.split("/");
  view.scrollTop = 0;
  if (p === "hisse" && arg) { setNav(lastTab); viewHisse(id, cleanSym(arg)); return; }
  const tab = ["takip", "portfoy", "bist", "sinyaller"].includes(p) ? p : "takip";
  lastTab = tab;
  setNav(tab);
  ({ takip: viewTakip, portfoy: viewPortfoy, bist: viewBist, sinyaller: viewSinyaller })[tab](id);
}
window.addEventListener("hashchange", route);

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
function indexCardHTML(key, q) {
  if (!q) return "";
  return `<div class="card index-card"><div class="l"><span>${esc(INDEX_INFO[key].label)}</span><span class="v num">${fmt(q.price)}</span></div><span class="p num ${cls(q.changePct)}">${pct(q.changePct)}</span></div>`;
}
async function loadIndexCard(id, key, el) {
  try {
    const q = (await getQuotes([INDEX_INFO[key].sym]))[INDEX_INFO[key].sym];
    if (id === RID && el) el.innerHTML = indexCardHTML(key, q);
  } catch (e) { /* endeks kartı isteğe bağlı */ }
}

// ==========================================================================
// 5) TAKİP
// ==========================================================================
const TK = { filter: "all" };
async function viewTakip(id) {
  setView(`<header class="top"><div><h1>Takip Listesi</h1><div class="sub" id="tkSub">Yükleniyor…</div></div>
    <button type="button" class="icon-btn" id="tkRefresh" aria-label="Yenile">${ICON.refresh}</button></header>
    <div id="tkIndex"></div>
    <div class="chips" id="tkChips"></div>
    <div class="list" id="tkList">${skeleton()}</div>
    <button type="button" class="logout" id="logout">Çıkış yap</button>`);
  $("#logout").onclick = () => { localStorage.removeItem(LS_PASS_KEY); location.hash = "#/takip"; showLock(); };
  $("#tkRefresh").onclick = () => { QC.clear(); AC.clear(); viewTakip(++RID); };
  loadIndexCard(id, "100", $("#tkIndex"));

  let items;
  try { items = await getWL(true); } catch (e) { if (id === RID && !e.auth) { $("#tkList").innerHTML = errBlock(e.message); $("#retry").onclick = () => viewTakip(++RID); $("#tkSub").textContent = ""; } return; }
  if (id !== RID) return;
  const syms = items.map((i) => i.symbol);
  if (!syms.length) {
    $("#tkSub").textContent = "";
    $("#tkList").innerHTML = '<div class="empty">Takip listen boş.<br>BIST sekmesinden bir hisseyi + ile ekleyebilirsin.</div>';
    return;
  }
  let quotes = {};
  try { quotes = await getQuotes(syms, true); } catch (e) { if (e.auth) return; }
  if (id !== RID) return;
  $("#tkSub").textContent = `${syms.length} hisse · Veri gecikmeli olabilir · ${nowHM()}`;

  const render = () => {
    if (id !== RID) return;
    const ana = {};
    syms.forEach((s) => { const c = AC.get(s); if (c) ana[s] = c.v; });
    const cnt = { AL: 0, TUT: 0, SAT: 0 };
    Object.values(ana).forEach((a) => cnt[a.sig.key]++);
    const chips = [["all", "Tümü " + syms.length, ""], ["AL", "AL " + cnt.AL, "al"], ["TUT", "TUT " + cnt.TUT, "tut"], ["SAT", "SAT " + cnt.SAT, "sat"]];
    $("#tkChips").innerHTML = chips.map(([k, l, c]) => `<button type="button" class="chip ${c} ${TK.filter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("");
    $$("#tkChips .chip").forEach((b) => (b.onclick = () => { TK.filter = b.dataset.f; render(); }));
    const shown = syms.filter((s) => TK.filter === "all" || (ana[s] && ana[s].sig.key === TK.filter));
    $("#tkList").innerHTML = shown.length ? shown.map((s) => {
      const q = quotes[s], a = ana[s];
      const price = q ? q.price : a?.d.lastClose;
      const chg = q && q.changePct != null ? q.changePct : a?.d.changes.daily;
      return `<a class="row" href="#/hisse/${s}">
        <div class="id"><span class="code">${esc(s)}</span><span class="name">${esc(q?.name || a?.f.companyName || "")}</span></div>
        ${a ? sparkHTML(a.d.closes, (chg ?? 0) >= 0) : '<span class="spark-ph"></span>'}
        <div class="px num"><b>${fmt(price)}</b><span class="${cls(chg)}">${pct(chg)}</span></div>
        ${badgeHTML(a?.sig)}</a>`;
    }).join("") : '<div class="empty">Bu filtrede hisse yok.</div>';
  };
  render();
  let raf = 0;
  await pool(syms, 4, async (s) => { try { await analyze(s); } finally { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); } });
  render();
}

// ==========================================================================
// 6) BIST (endeks seçici + tüm hisselerde arama)
// ==========================================================================
const BS = { idx: "100", sort: "up", q: "", menu: false };
async function viewBist(id) {
  setView(`<div class="search">${ICON.search}<input id="bsQ" type="search" enterkeyhint="search" autocapitalize="characters" autocomplete="off" placeholder="Tüm BIST hisselerinde ara" aria-label="Hisse ara" value="${esc(BS.q)}"></div>
    <p class="hint">Kod veya şirket adı yaz. Endeks dışı hisse için kodu yazıp Enter'a bas.</p>
    <div class="titlebar"><button type="button" class="titlebtn" id="bsTitle" aria-haspopup="listbox" aria-expanded="false"><span id="bsTitleTx"></span>${ICON.chev}</button><span class="num" id="bsIdx"></span></div>
    <div class="chips" id="bsChips"></div>
    <div class="list" id="bsList">${skeleton(8)}</div>`);
  const inp = $("#bsQ");
  const draw = async () => {
    if (id !== RID) return;
    const info = INDEX_INFO[BS.idx];
    $("#bsTitleTx").textContent = info.label;
    const sorts = [["up", "Yükselen"], ["down", "Düşen"], ["vol", "Hacim"], ["az", "A-Z"]];
    $("#bsChips").innerHTML = sorts.map(([k, l]) => `<button type="button" class="chip ${BS.sort === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $$("#bsChips .chip").forEach((b) => (b.onclick = () => { BS.sort = b.dataset.s; draw(); }));
    const q = fold(BS.q.trim());
    const base = q ? BIST100 : info.list; // arama yazılınca bilinen 100 hissede ara
    let quotes;
    try { quotes = await getQuotes(base); } catch (e) { if (id === RID && !e.auth) { $("#bsList").innerHTML = errBlock(e.message); $("#retry").onclick = () => draw(); } return; }
    if (id !== RID) return;
    let rows = base.map((s) => quotes[s]).filter(Boolean);
    if (q) rows = rows.filter((r) => fold(r.symbol).includes(q) || fold(r.name).includes(q));
    const by = { up: (a, b) => (b.changePct ?? -1e9) - (a.changePct ?? -1e9), down: (a, b) => (a.changePct ?? 1e9) - (b.changePct ?? 1e9), vol: (a, b) => b.volumeTL - a.volumeTL, az: (a, b) => a.symbol.localeCompare(b.symbol) };
    rows.sort(by[BS.sort]);
    let wl = []; try { wl = (await getWL()).map((x) => x.symbol); } catch (e) { /* yıldızlar boş kalır */ }
    if (id !== RID) return;
    const code = cleanSym(BS.q);
    const exact = code.length >= 3 && code.length <= 6 && !rows.some((r) => r.symbol === code);
    $("#bsIdx").innerHTML = "";
    getQuotes([info.sym]).then((m) => { const x = m[info.sym]; if (id === RID && x && $("#bsIdx")) $("#bsIdx").innerHTML = `<span class="${cls(x.changePct)}" style="font-size:14px;font-weight:600">${fmt(x.price)} · ${pct(x.changePct)}</span>`; }).catch(() => {});
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
  draw();
}

// ==========================================================================
// 7) PORTFÖY
// ==========================================================================
const PCOL = ["#5B9DFF", "#2ECC8F", "#F5B942", "#B48CFF", "#FF8A5B", "#4FD1E8", "#E879B9", "#A3B18A"];
async function viewPortfoy(id) {
  setView(`<header class="top"><div><h1>Portföy</h1><div class="sub" id="pfSub"></div></div>
    <button type="button" class="icon-btn" id="pfRefresh" aria-label="Yenile">${ICON.refresh}</button></header>
    <div id="pfBody">${skeleton(5)}</div>
    <button type="button" class="fab" id="pfAdd">${ICON.plus} Alım / Satım ekle</button>`);
  $("#pfAdd").onclick = () => openSheet({ mode: "buy" });
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
  let totalV = 0, totalC = 0, today = 0;
  const rows = pos.map((p) => {
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
  $("#pfSub").textContent = `${pos.length} pozisyon · Veri gecikmeli olabilir · ${nowHM()}`;
  const unpriced = rows.length - priced.length;
  $("#pfBody").innerHTML = `
    <div class="card total">
      <div><div class="sub" style="margin:0 0 4px">Toplam değer</div><div class="big num">${fmt(totalV, 0)} ₺</div></div>
      <div class="pair">
        <div><span>Toplam kâr/zarar</span><b class="num ${cls(totalPL)}">${sgn(totalPL)} ₺ (${pct(totalC ? (totalPL / totalC) * 100 : 0)})</b></div>
        <div><span>Maliyet</span><b class="num">${fmt(totalC, 0)} ₺</b></div>
        <div><span>Bugün</span><b class="num ${cls(today)}">${sgn(today)} ₺</b></div>
        ${realized.length ? `<div><span>Realize K/Z</span><b class="num ${cls(realizedTotal)}">${sgn(realizedTotal)} ₺</b></div>` : ""}
      </div>
      ${unpriced ? `<div class="sub" style="margin:0">${unpriced} hissenin fiyatı alınamadı, toplama dahil değil.</div>` : ""}
    </div>
    <div class="sec">Dağılım</div>
    <div class="alloc">${priced.map((r, i) => `<div style="flex:${(r.value / totalV).toFixed(4)} 1 0;background:${PCOL[i % PCOL.length]}"></div>`).join("")}</div>
    <div class="legend num">${priced.map((r, i) => `<span><i style="background:${PCOL[i % PCOL.length]}"></i>${esc(r.p.symbol)} %${fmt((r.value / totalV) * 100, 1)}</span>`).join("")}</div>
    <div class="list" style="margin-top:12px">${rows.map((r) => `<a class="row" href="#/hisse/${esc(r.p.symbol)}">
      <div class="id"><span class="code">${esc(r.p.symbol)}</span><span class="name num">${fmt(r.p.qty, 0)} adet · Ort. ${fmt(r.p.cost)}</span></div>
      <div class="px num" style="width:auto"><b>${r.value != null ? fmt(r.value, 0) + " ₺" : "—"}</b><span class="${cls(r.pl)}">${r.pl != null ? sgn(r.pl) + " ₺ (" + pct(r.plPct) + ")" : ""}</span></div></a>`).join("")}</div>
    <div style="height:72px"></div>`;
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
const SG = { filter: "all" };
async function viewSinyaller(id) {
  setView(`<header class="top"><div><h1>Sinyaller</h1><div class="sub" id="sgSub">Yükleniyor…</div></div>
    <button type="button" class="icon-btn" id="sgRefresh" aria-label="Yenile">${ICON.refresh}</button></header>
    <div class="chips" id="sgChips"></div>
    <div id="sgChanged"></div>
    <div class="list" id="sgList">${skeleton()}</div>
    <div class="disc">Sinyaller teknik göstergelere dayanır (RSI, 50/200 günlük ortalama, MACD, yıllık momentum, analist ortalaması). Bilgi amaçlıdır, yatırım tavsiyesi değildir.</div>`);
  $("#sgRefresh").onclick = () => { AC.clear(); viewSinyaller(++RID); };
  let wl, pos;
  try { wl = await getWL(true); pos = await kvGet("portfolio"); }
  catch (e) { if (id === RID && !e.auth) { $("#sgList").innerHTML = errBlock(e.message); $("#retry").onclick = () => viewSinyaller(++RID); $("#sgSub").textContent = ""; } return; }
  if (id !== RID) return;
  const syms = Array.from(new Set([...wl.map((x) => x.symbol), ...pos.map((x) => x.symbol)]));
  if (!syms.length) { $("#sgSub").textContent = ""; $("#sgList").innerHTML = '<div class="empty">Takip listen ve portföyün boş.<br>Sinyaller bu hisseler için hesaplanır.</div>'; return; }
  let done = 0;
  const render = () => {
    if (id !== RID) return;
    const ana = syms.map((s) => AC.get(s)?.v).filter(Boolean).sort((a, b) => b.rec.score - a.rec.score);
    const cnt = { AL: 0, TUT: 0, SAT: 0 };
    ana.forEach((a) => cnt[a.sig.key]++);
    $("#sgSub").textContent = done < syms.length ? `Hesaplanıyor ${done}/${syms.length}…` : `${syms.length} hisse · Günlük mumlara göre · ${nowHM()}`;
    const chips = [["all", "Tümü " + ana.length, ""], ["AL", "AL " + cnt.AL, "al"], ["TUT", "TUT " + cnt.TUT, "tut"], ["SAT", "SAT " + cnt.SAT, "sat"]];
    $("#sgChips").innerHTML = chips.map(([k, l, c]) => `<button type="button" class="chip ${c} ${SG.filter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("");
    $$("#sgChips .chip").forEach((b) => (b.onclick = () => { SG.filter = b.dataset.f; render(); }));
    const ch = changedSignals(syms);
    $("#sgChanged").innerHTML = ch.length ? `<div class="sec h">Son ziyarete göre değişenler</div><div class="grid2">${ch.map((c) => `<a class="cell" href="#/hisse/${c.sym}"><b style="font-size:15px">${esc(c.sym)}</b><span style="display:flex;align-items:center;gap:6px"><span class="badge ${c.from}" style="width:auto;padding:3px 8px">${c.from}</span>→<span class="badge ${c.to}" style="width:auto;padding:3px 8px">${c.to}</span></span></a>`).join("")}</div>` : "";
    const shown = ana.filter((a) => SG.filter === "all" || a.sig.key === SG.filter);
    $("#sgList").innerHTML = (shown.length ? `<div class="sec h">Tüm sinyaller</div>` + shown.map((a) => `<a class="row" href="#/hisse/${a.sym}">
      <div class="id"><span class="code">${esc(a.sym)}</span><span class="name">${esc(reasonText(a.rec))}</span></div>
      <span class="sub num" style="margin:0">${a.sig.score}/100</span>${badgeHTML(a.sig)}</a>`).join("") : (done < syms.length ? skeleton(4) : '<div class="empty">Bu filtrede hisse yok.</div>'));
  };
  render();
  let raf = 0;
  await pool(syms, 4, async (s) => { try { await analyze(s); } finally { done++; if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); } });
  render();
}

// ==========================================================================
// 9) HİSSE DETAYI
// ==========================================================================
const DT = { range: 63 };
const RANGES = [["1H", 5], ["1A", 21], ["3A", 63], ["6A", 126], ["1Y", 9999]];
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
  if (cs.length <= 90) {
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

function drawChart(a) {
  const box = $("#chart");
  if (!box) return;
  const { svg, cs, step } = chartSVG(a.d, DT.range);
  box.innerHTML = svg;
  const tip = $("#tip");
  const last = cs[cs.length - 1];
  const idle = `${fmtDay(cs[0].time)} – ${fmtDay(last.time)}`;
  tip.textContent = idle;
  const el = $("svg", box);
  const show = (e) => {
    const r = el.getBoundingClientRect();
    const i = Math.max(0, Math.min(cs.length - 1, Math.floor(((e.clientX - r.left) / r.width) * CW / step)));
    const c = cs[i];
    tip.textContent = `${fmtDay(c.time)} · A ${fmt(c.open)} Y ${fmt(c.high)} D ${fmt(c.low)} K ${fmt(c.close)}`;
  };
  el.addEventListener("pointerdown", show);
  el.addEventListener("pointermove", show);
  el.addEventListener("pointerleave", () => (tip.textContent = idle));
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
  let wl = []; try { wl = (await getWL()).map((x) => x.symbol); } catch (e) { /* yıldız boş kalır */ }
  if (id !== RID) return;
  const { d, f, rec, sig } = a;
  const prev = f.previousClose != null && f.previousClose > 0 ? f.previousClose : d.prevClose;
  const diff = d.lastClose - prev;
  const dchg = prev ? (diff / prev) * 100 : d.changes.daily;
  const pos = rec.factors.filter((x) => parseFloat(x[1]) > 0).length;
  const neg = rec.factors.filter((x) => parseFloat(x[1]) < 0).length;
  const ntr = rec.factors.length - pos - neg;
  const macdTxt = d.macd == null ? "—" : fmt(d.macd, 2);
  const cells = [
    ["RSI (14)", d.rsi != null ? fmt(d.rsi, 0) : "—"],
    ["MACD / Sinyal", d.macd != null ? `${macdTxt} / ${fmt(d.macdSignal, 2)}` : "—"],
    ["SMA 50 / 200", `${fmt(d.ma50)} / ${fmt(d.ma200)}`],
    ["Bollinger alt–üst", d.bollingerLower != null ? `${fmt(d.bollingerLower)} – ${fmt(d.bollingerUpper)}` : "—"],
    ["Gün aralığı", `${fmt(d.dayLow)} – ${fmt(d.dayHigh)}`],
    ["52 hafta aralığı", `${fmt(f.fiftyTwoWeekLow ?? d.week52Low)} – ${fmt(f.fiftyTwoWeekHigh ?? d.week52High)}`],
    ["Önceki kapanış", fmt(prev)],
    ["Hacim", compact(d.dayVolume) + " adet"],
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
    <div class="card sigcard"><span class="sigbig ${sig.key}">${sig.key}</span>
      <div class="tx"><b>${sig.strong ? "Güçlü " : ""}${sig.key} · Skor ${sig.score}/100</b><span>${pos} etken AL, ${neg} SAT, ${ntr} nötr yönünde</span></div></div>
    <div class="sec h">Sinyalin nedeni</div>
    <div>${rec.factors.map(([l, v]) => { const n = parseFloat(v); const k = n > 0 ? "AL" : n < 0 ? "SAT" : "TUT"; return `<div class="frow"><span class="f1">${esc(l)}</span><span class="f2 num">${esc(v)}</span><span class="badge ${k}">${k}</span></div>`; }).join("")}</div>
    <div class="sec h">Göstergeler ve bilgiler</div>
    <div class="grid2 num">${cells.map(([l, v]) => `<div class="cell"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("")}</div>
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
}

// ==========================================================================
// 10) Başlat
// ==========================================================================
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
route();
})();
