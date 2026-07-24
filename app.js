/* ==========================================================================
   BIST TERMİNAL — app.js (gauge düzeltildi, eski basit yapı)
   ========================================================================== */

const LS_PASS_KEY = "bist_terminal_pass";

// ---------- DOM referansları ----------
const lockScreen = document.getElementById("lockScreen");
const passInput = document.getElementById("passInput");
const passSubmit = document.getElementById("passSubmit");
const lockError = document.getElementById("lockError");
const appEl = document.getElementById("app");
const logoutBtn = document.getElementById("logoutBtn");

const searchScreen = document.getElementById("searchScreen");
const searchInput = document.getElementById("searchInput");
const searchError = document.getElementById("searchError");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const resultScreen = document.getElementById("resultScreen");
const newSearchInput = document.getElementById("newSearchInput");
const newSearchBtn = document.getElementById("newSearchBtn");
const watchlistToggleBtn = document.getElementById("watchlistToggleBtn");

const navSearchBtn = document.getElementById("navSearchBtn");
const navPortfolioBtn = document.getElementById("navPortfolioBtn");
const navWatchlistBtn = document.getElementById("navWatchlistBtn");
const navCompareBtn = document.getElementById("navCompareBtn");
const portfolioScreen = document.getElementById("portfolioScreen");
const posSymbol = document.getElementById("posSymbol");
const posQty = document.getElementById("posQty");
const posCost = document.getElementById("posCost");
const posAddBtn = document.getElementById("posAddBtn");
const posError = document.getElementById("posError");
const portfolioSummary = document.getElementById("portfolioSummary");
const portfolioTableBody = document.getElementById("portfolioTableBody");
const portfolioEmpty = document.getElementById("portfolioEmpty");
const donutSvg = document.getElementById("donutSvg");
const donutLegend = document.getElementById("donutLegend");

const watchlistScreen = document.getElementById("watchlistScreen");
const wlSymbol = document.getElementById("wlSymbol");
const wlAddBtn = document.getElementById("wlAddBtn");
const wlError = document.getElementById("wlError");
const watchlistTableBody = document.getElementById("watchlistTableBody");
const watchlistEmpty = document.getElementById("watchlistEmpty");

const compareScreen = document.getElementById("compareScreen");
const cmpSymbol1 = document.getElementById("cmpSymbol1");
const cmpSymbol2 = document.getElementById("cmpSymbol2");
const cmpSymbol3 = document.getElementById("cmpSymbol3");
const cmpBtn = document.getElementById("cmpBtn");
const cmpError = document.getElementById("cmpError");
const cmpLoading = document.getElementById("cmpLoading");
const cmpResultCard = document.getElementById("cmpResultCard");
const compareTable = document.getElementById("compareTable");

let priceChartApi = null, volumeChartApi = null, candleSeries = null, volumeSeries = null;
let fullChartData = null, currentSymbol = null;

// ==========================================================================
// 0) PWA
// ==========================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}

// ==========================================================================
// 1) YARDIMCI FONKSİYONLAR
// ==========================================================================
function hexToRgb(hex) { const v = parseInt(hex.slice(1), 16); return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }; }
function lerpColor(c1, c2, t) { const p1 = hexToRgb(c1), p2 = hexToRgb(c2); return `rgb(${Math.round(p1.r + (p2.r - p1.r) * t)},${Math.round(p1.g + (p2.g - p1.g) * t)},${Math.round(p1.b + (p2.b - p1.b) * t)})`; }
function addSvgText(svg, x, y, text, styles) { const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); t.setAttribute("x", x); t.setAttribute("y", y); Object.entries(styles).forEach(([k, v]) => t.setAttribute(k, v)); t.textContent = text; svg.appendChild(t); }

function fmtTL(n, o = {}) { if (n == null || isNaN(n)) return "—"; return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2, ...o }).format(n); }
function fmtNum(n, d = 2) { if (n == null || isNaN(n)) return "—"; return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: d }).format(n); }
function fmtPct(n, d = 2) { if (n == null || isNaN(n)) return "—"; const s = n > 0 ? "+" : ""; return s + fmtNum(n, d) + "%"; }
function fmtCompactTL(n) { if (n == null || isNaN(n)) return "—"; const a = Math.abs(n); if (a >= 1e9) return "₺" + fmtNum(n / 1e9, 2) + " Milyar"; if (a >= 1e6) return "₺" + fmtNum(n / 1e6, 2) + " Milyon"; if (a >= 1e3) return "₺" + fmtNum(n / 1e3, 1) + " Bin"; return fmtTL(n); }
function changeClass(n) { return n > 0.001 ? "up" : n < -0.001 ? "down" : "flat"; }
function arrow(n) { return n > 0.001 ? "▲" : n < -0.001 ? "▼" : "▬"; }
function fmtDate(ts) { if (!ts) return "—"; return new Date(ts).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }); }

function sma(arr, p) { const o = []; for (let i = 0; i < arr.length; i++) { if (i < p - 1) { o.push(null); continue; } let s = 0; for (let j = i - p + 1; j <= i; j++) s += arr[j]; o.push(s / p); } return o; }
function ema(arr, p) { const k = 2 / (p + 1), o = []; let prev = null; for (let i = 0; i < arr.length; i++) { if (arr[i] == null) { o.push(null); continue; } if (prev == null) { prev = arr[i]; o.push(prev); continue; } prev = arr[i] * k + prev * (1 - k); o.push(prev); } return o; }
function calcRSI(cl, p = 14) { const o = new Array(cl.length).fill(null); let g = 0, l = 0; for (let i = 1; i <= p; i++) { const d = cl[i] - cl[i - 1]; if (d >= 0) g += d; else l -= d; } let ag = g / p, al = l / p; o[p] = 100 - 100 / (1 + (al === 0 ? 100 : ag / al)); for (let i = p + 1; i < cl.length; i++) { const d = cl[i] - cl[i - 1]; ag = (ag * (p - 1) + (d > 0 ? d : 0)) / p; al = (al * (p - 1) + (d < 0 ? -d : 0)) / p; o[i] = 100 - 100 / (1 + (al === 0 ? 100 : ag / al)); } return o; }
function calcMACD(cl) { const e12 = ema(cl, 12), e26 = ema(cl, 26); const ml = cl.map((_, i) => (e12[i] != null && e26[i] != null ? e12[i] - e26[i] : null)); return { macdLine: ml, signalLine: ema(ml.map((v) => (v == null ? 0 : v)), 9) }; }
function calcBollinger(cl, p = 20, m = 2) { const mid = sma(cl, p), up = [], lo = []; for (let i = 0; i < cl.length; i++) { if (mid[i] == null) { up.push(null); lo.push(null); continue; } let ss = 0; for (let j = i - p + 1; j <= i; j++) ss += Math.pow(cl[j] - mid[i], 2); const sd = Math.sqrt(ss / p); up.push(mid[i] + m * sd); lo.push(mid[i] - m * sd); } return { mid, upper: up, lower: lo }; }
function calcStochRSI(cl, rp = 14, sp = 14) { const rsi = calcRSI(cl, rp); const o = new Array(cl.length).fill(null); for (let i = 0; i < rsi.length; i++) { if (rsi[i] == null) continue; const ws = Math.max(0, i - sp + 1); const wv = rsi.slice(ws, i + 1).filter((v) => v != null); if (wv.length < sp) continue; const mn = Math.min(...wv), mx = Math.max(...wv); o[i] = mx > mn ? ((rsi[i] - mn) / (mx - mn)) * 100 : 50; } return o; }

// ==========================================================================
// 2) ŞİFRE / GİRİŞ
// ==========================================================================
function tryEnterApp() { if (localStorage.getItem(LS_PASS_KEY)) { lockScreen.style.display = "none"; appEl.style.display = "block"; syncWatchlistState(); } }
passSubmit.addEventListener("click", () => { const v = passInput.value.trim(); if (!v) { lockError.textContent = "Lütfen şifre gir."; return; } localStorage.setItem(LS_PASS_KEY, v); lockScreen.style.display = "none"; appEl.style.display = "block"; searchInput.focus(); });
passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") passSubmit.click(); });
logoutBtn.addEventListener("click", () => { localStorage.removeItem(LS_PASS_KEY); location.reload(); });
tryEnterApp();

// ==========================================================================
// 3) NAVİGASYON
// ==========================================================================
function setActiveNav(b) { [navSearchBtn, navPortfolioBtn, navWatchlistBtn, navCompareBtn].forEach((x) => x.classList.remove("active")); b.classList.add("active"); }
function showSearchNav() { setActiveNav(navSearchBtn); portfolioScreen.classList.remove("active"); watchlistScreen.classList.remove("active"); compareScreen.classList.remove("active"); searchScreen.classList.remove("hidden"); }
function showPortfolioNav() { setActiveNav(navPortfolioBtn); searchScreen.classList.add("hidden"); resultScreen.classList.remove("active"); loadingScreen.classList.remove("active"); watchlistScreen.classList.remove("active"); compareScreen.classList.remove("active"); portfolioScreen.classList.add("active"); renderPortfolio(); }
function showWatchlistNav() { setActiveNav(navWatchlistBtn); searchScreen.classList.add("hidden"); resultScreen.classList.remove("active"); loadingScreen.classList.remove("active"); portfolioScreen.classList.remove("active"); compareScreen.classList.remove("active"); watchlistScreen.classList.add("active"); renderWatchlist(); }
function showCompareNav() { setActiveNav(navCompareBtn); searchScreen.classList.add("hidden"); resultScreen.classList.remove("active"); loadingScreen.classList.remove("active"); portfolioScreen.classList.remove("active"); watchlistScreen.classList.remove("active"); compareScreen.classList.add("active"); }
navSearchBtn.addEventListener("click", showSearchNav); navPortfolioBtn.addEventListener("click", showPortfolioNav); navWatchlistBtn.addEventListener("click", showWatchlistNav); navCompareBtn.addEventListener("click", showCompareNav);

// ==========================================================================
// 4) ARAMA
// ==========================================================================
searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(searchInput.value); });
newSearchBtn.addEventListener("click", () => runSearch(newSearchInput.value));
newSearchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(newSearchInput.value); });

async function fetchJSON(url) { try { const r = await fetch(url); const d = await r.json(); if (!r.ok) return { error: d.error || "Hata", status: r.status }; return { data: d }; } catch (e) { return { error: "Sunucuya ulaşılamadı." }; } }
function showLoading(a, t) { loadingScreen.classList.toggle("active", a); searchScreen.classList.toggle("hidden", a); if (t) loadingText.textContent = t.toUpperCase(); }

async function runSearch(raw) {
  const symbol = (raw || "").toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  searchError.textContent = "";
  if (!symbol) { searchError.textContent = "Hisse kodu gir."; return; }
  showLoading(true, symbol + " için veri çekiliyor...");
  currentSymbol = symbol;
  const pass = localStorage.getItem(LS_PASS_KEY) || "";
  try {
    const [cr, qr] = await Promise.all([fetchJSON(WORKER_URL + "/api/chart?symbol=" + symbol + "&pass=" + encodeURIComponent(pass)), fetchJSON(WORKER_URL + "/api/quote?symbol=" + symbol + "&pass=" + encodeURIComponent(pass))]);
    if (cr.error || qr.error) { const m = cr.error || qr.error; if ((cr.status === 401) || (qr.status === 401)) { localStorage.removeItem(LS_PASS_KEY); showLoading(false); lockScreen.style.display = "flex"; appEl.style.display = "none"; lockError.textContent = "Şifre hatalı."; return; } throw new Error(m); }
    const chartR = cr.data?.chart?.result?.[0];
    if (!chartR || !chartR.timestamp) throw new Error('"' + symbol + '" bulunamadı.');
    const d = processChartData(chartR), f = processFundamentals(qr.data);
    showLoading(false); resultScreen.classList.add("active"); searchScreen.classList.add("hidden");
    renderAll(symbol, d, f); syncWatchlistState(); newSearchInput.value = "";
  } catch (err) { showLoading(false); searchScreen.classList.remove("hidden"); resultScreen.classList.remove("active"); searchError.textContent = err.message || "Hata."; }
}

// ==========================================================================
// 5) VERİ İŞLEME
// ==========================================================================
function processChartData(r) {
  const ts = r.timestamp, q = r.indicators.quote[0], meta = r.meta || {};
  const candles = [], vtl = [];
  for (let i = 0; i < ts.length; i++) { if (q.close[i] == null) continue; const t = ts[i], c = q.close[i]; candles.push({ time: t, open: q.open[i] ?? c, high: q.high[i] ?? c, low: q.low[i] ?? c, close: c, volume: q.volume[i] ?? 0 }); vtl.push({ time: t, volumeTL: (q.volume[i] ?? 0) * c }); }
  const closes = candles.map((c) => c.close);
  const lc = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const pc = closes[closes.length - 2] ?? lc;
  const bd = (n) => { const i = closes.length - 1 - n; return i >= 0 ? closes[i] : closes[0]; };
  const ch = (f) => f ? ((lc - f) / f) * 100 : 0;
  const changes = { daily: ch(pc), weekly: ch(bd(5)), monthly: ch(bd(21)), sixMonth: ch(bd(126)), yearly: ch(closes[0]) };
  const wl = Math.min(...candles.map((c) => c.low)), wh = Math.max(...candles.map((c) => c.high));
  const l30 = vtl.slice(-30), avgV = l30.reduce((s, v) => s + v.volumeTL, 0) / l30.length, avgVS = candles.slice(-30).reduce((s, c) => s + c.volume, 0) / l30.length;
  const lastC = candles[candles.length - 1];
  const rsi = calcRSI(closes, 14), ma50 = sma(closes, 50), ma200 = sma(closes, 200), macd = calcMACD(closes), boll = calcBollinger(closes, 20, 2), stoch = calcStochRSI(closes, 14, 14);
  return { candles, volumesTL: vtl, lastClose: lc, changes, week52Low: wl, week52High: wh, avgVolumeTL: avgV, avgVolumeShares: avgVS, dailyVolumeTL: lastC.volume * lc, dailyVolumeShares: lastC.volume, rsi: rsi[rsi.length - 1], ma50: ma50[ma50.length - 1], ma200: ma200[ma200.length - 1], macd: macd.macdLine[macd.macdLine.length - 1], macdSignal: macd.signalLine[macd.signalLine.length - 1], bollingerUpper: boll.upper[boll.upper.length - 1], bollingerMid: boll.mid[boll.mid.length - 1], bollingerLower: boll.lower[boll.lower.length - 1], stochRsi: stoch[stoch.length - 1] };
}
function processFundamentals(raw) {
  const r = raw?.quoteSummary?.result?.[0] || {}, sd = r.summaryDetail || {}, dks = r.defaultKeyStatistics || {}, fd = r.financialData || {}, price = r.price || {};
  const g = (o, k) => { const v = o?.[k]; if (v == null) return null; return (typeof v === "object" && "raw" in v) ? v.raw : v; };
  return { companyName: price.longName || price.shortName || "—", marketCap: g(price, "marketCap"), trailingPE: g(sd, "trailingPE"), forwardPE: g(sd, "forwardPE"), priceToBook: g(dks, "priceToBook"), dividendYield: g(sd, "dividendYield"), beta: g(sd, "beta"), returnOnEquity: g(fd, "returnOnEquity"), profitMargins: g(dks, "profitMargins"), revenueGrowth: g(fd, "revenueGrowth"), recommendationMean: g(fd, "recommendationMean"), numberOfAnalysts: g(fd, "numberOfAnalystOpinions"), fiftyTwoWeekLow: g(sd, "fiftyTwoWeekLow"), fiftyTwoWeekHigh: g(sd, "fiftyTwoWeekHigh"), priceToSales: g(sd, "priceToSalesTrailing12Months"), targetMeanPrice: g(fd, "targetMeanPrice"), targetHighPrice: g(fd, "targetHighPrice"), targetLowPrice: g(fd, "targetLowPrice"), bookValue: g(dks, "bookValue") };
}

// ==========================================================================
// 6) GAUGE (basit, eski yapı — ibre r-20 ile içeride, skor 2-98 arası)
// ==========================================================================
function drawGauge(score, svgId) {
  const svg = document.getElementById(svgId);
  svg.innerHTML = "";
  const cx = 140, cy = 140, r = 110, sa = Math.PI, ea = 0, span = sa - ea;
  const clamped = Math.max(2, Math.min(98, score || 50));
  const frac = clamped / 100;
  const angle = sa - span * frac;
  const segs = 40;
  for (let i = 0; i < segs; i++) {
    const a1 = sa - span * (i / segs), a2 = sa - span * ((i + 1) / segs);
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    const t = i / segs;
    const color = t < 0.5 ? lerpColor("#ff4757", "#d4af37", t / 0.5) : lerpColor("#d4af37", "#17c987", (t - 0.5) / 0.5);
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M " + x1 + " " + y1 + " A " + r + " " + r + " 0 0 1 " + x2 + " " + y2);
    p.setAttribute("stroke", color); p.setAttribute("stroke-width", "12"); p.setAttribute("fill", "none"); p.setAttribute("stroke-linecap", "round");
    svg.appendChild(p);
  }
  const nl = r - 20, nx = cx + nl * Math.cos(angle), ny = cy - nl * Math.sin(angle);
  const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
  ln.setAttribute("x1", cx); ln.setAttribute("y1", cy); ln.setAttribute("x2", nx); ln.setAttribute("y2", ny);
  ln.setAttribute("stroke", "#e6eaf0"); ln.setAttribute("stroke-width", "2.5"); ln.setAttribute("stroke-linecap", "round");
  svg.appendChild(ln);
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.setAttribute("r", "6"); dot.setAttribute("fill", "#e6eaf0");
  svg.appendChild(dot);
  const ls = { "font-family": "JetBrains Mono, monospace", "font-size": "10px", fill: "#4c5768" };
  addSvgText(svg, cx - r - 6, cy + 16, svgId === "valueGaugeSvg" ? "PAHALI" : "SAT", ls);
  addSvgText(svg, cx + r - 10, cy + 16, svgId === "valueGaugeSvg" ? "UCUZ" : "AL", ls);
}

// ==========================================================================
// 7) PUANLAMA
// ==========================================================================
function computeRecommendation(d, f) {
  let s = 50; const fa = [];
  if (d.rsi != null) { if (d.rsi < 30) { s += 20; fa.push(["RSI aşırı satım", "+20"]); } else if (d.rsi < 45) { s += 8; fa.push(["RSI zayıf", "+8"]); } else if (d.rsi <= 55) { fa.push(["RSI nötr", "0"]); } else if (d.rsi <= 70) { s -= 8; fa.push(["RSI güçlü", "-8"]); } else { s -= 20; fa.push(["RSI aşırı alım", "-20"]); } }
  if (d.ma50 != null && d.ma200 != null) { if (d.lastClose > d.ma50 && d.ma50 > d.ma200) { s += 18; fa.push(["Trend yükseliş", "+18"]); } else if (d.lastClose < d.ma50 && d.ma50 < d.ma200) { s -= 18; fa.push(["Trend düşüş", "-18"]); } else { fa.push(["Trend karışık", "0"]); } }
  if (d.macd != null && d.macdSignal != null) { if (d.macd > d.macdSignal) { s += 12; fa.push(["MACD pozitif", "+12"]); } else { s -= 12; fa.push(["MACD negatif", "-12"]); } }
  if (d.changes.yearly > 25) { s += 8; fa.push(["Yıllık momentum", "+8"]); } else if (d.changes.yearly < -25) { s -= 8; fa.push(["Yıllık momentum", "-8"]); }
  if (f.recommendationMean != null) { const as = ((3 - f.recommendationMean) / 2) * 15; s += as; fa.push(["Analist ort.", (as >= 0 ? "+" : "") + fmtNum(as, 0)]); }
  s = Math.max(0, Math.min(100, s));
  let lb, cl; if (s >= 80) { lb = "GÜÇLÜ AL"; cl = "strong-buy"; } else if (s >= 60) { lb = "AL"; cl = "buy"; } else if (s >= 40) { lb = "NÖTR"; cl = "neutral"; } else if (s >= 20) { lb = "SAT"; cl = "sell"; } else { lb = "GÜÇLÜ SAT"; cl = "strong-sell"; }
  return { score: s, label: lb, cls: cl, factors: fa };
}
function computeValuationScore(f) {
  let s = 50; const fa = [];
  if (f.trailingPE != null && f.trailingPE > 0) { if (f.trailingPE < 8) { s += 20; fa.push(["F/K çok düşük", "+20"]); } else if (f.trailingPE < 15) { s += 8; fa.push(["F/K makul", "+8"]); } else if (f.trailingPE <= 25) { fa.push(["F/K normal", "0"]); } else if (f.trailingPE <= 40) { s -= 15; fa.push(["F/K yüksek", "-15"]); } else { s -= 25; fa.push(["F/K aşırı", "-25"]); } } else if (f.trailingPE != null && f.trailingPE <= 0) { s -= 10; fa.push(["Zarar", "-10"]); }
  if (f.priceToBook != null && f.priceToBook > 0) { if (f.priceToBook < 1) { s += 15; fa.push(["PD/DD düşük", "+15"]); } else if (f.priceToBook < 2) { s += 5; fa.push(["PD/DD makul", "+5"]); } else if (f.priceToBook <= 4) { fa.push(["PD/DD normal", "0"]); } else if (f.priceToBook <= 7) { s -= 12; fa.push(["PD/DD yüksek", "-12"]); } else { s -= 20; fa.push(["PD/DD aşırı", "-20"]); } }
  if (f.priceToSales != null && f.priceToSales > 0) { if (f.priceToSales < 1) { s += 10; fa.push(["PD/Satış düşük", "+10"]); } else if (f.priceToSales <= 3) { fa.push(["PD/Satış normal", "0"]); } else if (f.priceToSales <= 6) { s -= 10; fa.push(["PD/Satış yüksek", "-10"]); } else { s -= 15; fa.push(["PD/Satış aşırı", "-15"]); } }
  if (f.forwardPE != null && f.trailingPE != null && f.trailingPE > 0 && f.forwardPE > 0) { if (f.forwardPE < f.trailingPE * 0.8) { s += 8; fa.push(["Kâr artışı", "+8"]); } else if (f.forwardPE > f.trailingPE * 1.2) { s -= 8; fa.push(["Kâr düşüşü", "-8"]); } }
  s = Math.max(0, Math.min(100, s));
  let lb, cl; if (s >= 80) { lb = "UCUZ"; cl = "strong-buy"; } else if (s >= 60) { lb = "MAKUL"; cl = "buy"; } else if (s >= 40) { lb = "NÖTR"; cl = "neutral"; } else if (s >= 20) { lb = "PAHALI"; cl = "sell"; } else { lb = "AŞIRI PAHALI"; cl = "strong-sell"; }
  return { score: s, label: lb, cls: cl, factors: fa };
}

// ==========================================================================
// 8) MİNİ HACİM + LIGHTWEIGHT CHARTS
// ==========================================================================
function drawMiniVolume(vtl) { const svg = document.getElementById("miniVolumeSvg"); svg.innerHTML = ""; const data = vtl.slice(-30); const max = Math.max(...data.map((d) => d.volumeTL)); const w = 300 / data.length; data.forEach((d, i) => { const h = max ? (d.volumeTL / max) * 55 : 0; const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("x", i * w + 1); r.setAttribute("y", 58 - h); r.setAttribute("width", Math.max(w - 2, 1)); r.setAttribute("height", h); r.setAttribute("fill", "#d4af37"); r.setAttribute("opacity", "0.75"); svg.appendChild(r); }); }
function renderChart(candles, vtl) {
  const pe = document.getElementById("priceChart"), ve = document.getElementById("volumeChart");
  pe.innerHTML = ""; ve.innerHTML = "";
  const opt = { layout: { background: { color: "transparent" }, textColor: "#7d8a9c", fontFamily: "JetBrains Mono, monospace" }, grid: { vertLines: { color: "#1a1f29" }, horzLines: { color: "#1a1f29" } }, timeScale: { borderColor: "#232a36" }, rightPriceScale: { borderColor: "#232a36" }, crosshair: { mode: 0 } };
  priceChartApi = LightweightCharts.createChart(pe, { ...opt, height: 340 });
  candleSeries = priceChartApi.addCandlestickSeries({ upColor: "#17c987", downColor: "#ff4757", borderUpColor: "#17c987", borderDownColor: "#ff4757", wickUpColor: "#17c987", wickDownColor: "#ff4757" });
  candleSeries.setData(candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));
  volumeChartApi = LightweightCharts.createChart(ve, { ...opt, height: 110 });
  volumeSeries = volumeChartApi.addHistogramSeries({ color: "#4098d7" });
  volumeSeries.setData(vtl.map((v, i) => ({ time: v.time, value: v.volumeTL, color: candles[i].close >= candles[i].open ? "rgba(23,201,135,0.6)" : "rgba(255,71,87,0.6)" })));
  priceChartApi.timeScale().fitContent(); volumeChartApi.timeScale().fitContent();
  priceChartApi.timeScale().subscribeVisibleLogicalRangeChange((r) => { volumeChartApi.timeScale().setVisibleLogicalRange(r); });
}
document.getElementById("rangeTabs").addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  document.querySelectorAll("#rangeTabs button").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  if (!priceChartApi || !fullChartData) return;
  const days = { "1m": 21, "3m": 63, "6m": 126, "1y": 300 }[e.target.dataset.range];
  const c = fullChartData.candles, from = c[Math.max(0, c.length - days)].time, to = c[c.length - 1].time;
  priceChartApi.timeScale().setVisibleRange({ from, to }); volumeChartApi.timeScale().setVisibleRange({ from, to });
});

// ==========================================================================
// 9) SONUÇ EKRANI
// ==========================================================================
function rowHTML(l, v, tag) { const t = tag ? '<span class="status-tag ' + tag[1] + '">' + tag[0] + "</span>" : ""; return '<div class="data-row"><span class="row-label">' + l + '</span><span class="row-value">' + v + t + "</span></div>"; }
function renderAll(sym, d, f) {
  fullChartData = d;
  document.getElementById("stTicker").textContent = sym;
  document.getElementById("stCompanyName").textContent = f.companyName;
  document.getElementById("stPrice").textContent = fmtTL(d.lastClose);
  const dc = changeClass(d.changes.daily), de = document.getElementById("stDayChange");
  de.textContent = arrow(d.changes.daily) + " " + fmtPct(d.changes.daily) + " (bugün)"; de.className = "day-change " + dc;

  const ae = document.getElementById("analystTarget");
  if (f.targetMeanPrice != null && f.targetMeanPrice > 0) {
    const pot = ((f.targetMeanPrice - d.lastClose) / d.lastClose) * 100, pc = pot > 1 ? "up" : pot < -1 ? "down" : "";
    ae.style.display = "block";
    ae.innerHTML = '<div class="target-row"><div class="target-item"><div class="target-label">Hedef Düşük</div><div class="target-value">' + (f.targetLowPrice ? fmtTL(f.targetLowPrice) : "—") + '</div></div><div class="target-item"><div class="target-label">Hedef Ort.</div><div class="target-value" style="color:var(--gold)">' + fmtTL(f.targetMeanPrice) + '</div></div><div class="target-item"><div class="target-label">Hedef Yüksek</div><div class="target-value">' + (f.targetHighPrice ? fmtTL(f.targetHighPrice) : "—") + '</div></div><div class="target-item"><div class="target-label">Potansiyel</div><div class="target-value target-potential ' + pc + '">' + fmtPct(pot) + "</div></div></div>";
  } else { ae.style.display = "none"; }

  document.getElementById("changeBadges").innerHTML = [["Günlük", d.changes.daily], ["Haftalık", d.changes.weekly], ["Aylık", d.changes.monthly], ["6 Aylık", d.changes.sixMonth], ["Yıllık", d.changes.yearly]].map(([l, v]) => '<div class="badge"><div class="badge-label">' + l + '</div><div class="badge-value ' + changeClass(v) + '">' + fmtPct(v) + "</div></div>").join("");

  const lo = f.fiftyTwoWeekLow ?? d.week52Low, hi = f.fiftyTwoWeekHigh ?? d.week52High;
  document.getElementById("range52Low").textContent = fmtTL(lo);
  document.getElementById("range52High").textContent = fmtTL(hi);
  document.getElementById("rangeMarker").style.left = Math.max(2, Math.min(98, hi > lo ? ((d.lastClose - lo) / (hi - lo)) * 100 : 50)) + "%";
  document.getElementById("distToHigh").textContent = "+ " + fmtNum(((hi - d.lastClose) / d.lastClose) * 100) + "%";
  document.getElementById("distToLow").textContent = "- " + fmtNum(((d.lastClose - lo) / d.lastClose) * 100) + "%";

  renderChart(d.candles, d.volumesTL);

  document.getElementById("dailyVolumeTL").textContent = fmtCompactTL(d.dailyVolumeTL);
  document.getElementById("dailyVolumeShares").textContent = fmtNum(d.dailyVolumeShares, 0) + " adet";
  document.getElementById("avgVolumeTL").textContent = fmtCompactTL(d.avgVolumeTL);
  document.getElementById("avgVolumeShares").textContent = "Ortalama " + fmtNum(d.avgVolumeShares, 0) + " adet/gün";
  drawMiniVolume(d.volumesTL);

  const rsiT = d.rsi < 30 ? ["Aşırı Satım", "buy"] : d.rsi > 70 ? ["Aşırı Alım", "sell"] : ["Nötr", "neutral"];
  const maT = d.lastClose > d.ma50 ? ["Fiyat > MA50", "buy"] : ["Fiyat < MA50", "sell"];
  const macdT = d.macd > d.macdSignal ? ["Pozitif", "buy"] : ["Negatif", "sell"];
  const bollT = d.lastClose > d.bollingerUpper ? ["Üst Bandın Üstü", "sell"] : d.lastClose < d.bollingerLower ? ["Alt Bandın Altı", "buy"] : ["Bant İçi", "neutral"];
  const stochT = d.stochRsi > 80 ? ["Aşırı Alım", "sell"] : d.stochRsi < 20 ? ["Aşırı Satım", "buy"] : ["Nötr", "neutral"];

  document.getElementById("technicalRows").innerHTML = [
    rowHTML("RSI (14)", fmtNum(d.rsi), rsiT), rowHTML("Stochastic RSI", fmtNum(d.stochRsi), stochT),
    rowHTML("MA 50", fmtTL(d.ma50)), rowHTML("MA 200", fmtTL(d.ma200), maT),
    rowHTML("MACD", fmtNum(d.macd, 3), macdT), rowHTML("MACD Sinyal", fmtNum(d.macdSignal, 3)),
    rowHTML("Bollinger Üst", fmtTL(d.bollingerUpper), bollT), rowHTML("Bollinger Orta", fmtTL(d.bollingerMid)), rowHTML("Bollinger Alt", fmtTL(d.bollingerLower)),
    rowHTML("Beta", fmtNum(f.beta)),
  ].join("");

  let bv = null, bvn = "";
  if (f.priceToBook != null && f.priceToBook > 0) { bv = d.lastClose / f.priceToBook; bvn = f.priceToBook < 1 ? " (iskontolu)" : f.priceToBook > 2 ? " (primli)" : ""; }
  else if (f.bookValue != null) { bv = f.bookValue; }

  document.getElementById("fundamentalRows").innerHTML = [
    rowHTML("Piyasa Değeri", fmtCompactTL(f.marketCap)),
    rowHTML("F/K (Trailing)", fmtNum(f.trailingPE)), rowHTML("F/K (Forward)", fmtNum(f.forwardPE)),
    rowHTML("PD/DD", fmtNum(f.priceToBook)), rowHTML("PD/Satış", fmtNum(f.priceToSales)),
    bv != null ? '<div class="data-row highlight-book"><span class="row-label">Defter Değeri (Hisse Başı)</span><span class="row-value" style="color:var(--gold)">' + fmtTL(bv) + '<span style="font-size:10px;color:var(--text-faint);margin-left:4px">' + bvn + "</span></span></div>" : rowHTML("Defter Değeri", "—"),
    rowHTML("Temettü Verimi", f.dividendYield != null ? fmtPct(f.dividendYield * 100) : "—"),
    rowHTML("ROE", f.returnOnEquity != null ? fmtPct(f.returnOnEquity * 100) : "—"),
    rowHTML("Net Kar Marjı", f.profitMargins != null ? fmtPct(f.profitMargins * 100) : "—"),
    rowHTML("Gelir Büyümesi", f.revenueGrowth != null ? fmtPct(f.revenueGrowth * 100) : "—"),
    rowHTML("Analist Sayısı", fmtNum(f.numberOfAnalysts, 0)),
  ].join("");

  const rec = computeRecommendation(d, f);
  drawGauge(rec.score, "gaugeSvg");
  const gl = document.getElementById("gaugeLabel"); gl.textContent = rec.label; gl.className = "gauge-label-big " + rec.cls;
  document.getElementById("gaugeScoreText").textContent = "SKOR: " + fmtNum(rec.score, 0) + " / 100";
  document.getElementById("gaugeFactors").innerHTML = rec.factors.map(([l, v]) => '<div class="factor">' + l + ": <b>" + v + "</b></div>").join("");

  const val = computeValuationScore(f);
  drawGauge(val.score, "valueGaugeSvg");
  const vgl = document.getElementById("valueGaugeLabel"); vgl.textContent = val.label; vgl.className = "gauge-label-big " + val.cls;
  document.getElementById("valueGaugeScoreText").textContent = "SKOR: " + fmtNum(val.score, 0) + " / 100";
  document.getElementById("valueGaugeFactors").innerHTML = val.factors.map(([l, v]) => '<div class="factor">' + l + ": <b>" + v + "</b></div>").join("");
}

// ==========================================================================
// 10) KV YARDIMCILARI
// ==========================================================================
function getPass() { return localStorage.getItem(LS_PASS_KEY) || ""; }
async function kvGet(key) { const r = await fetch(WORKER_URL + "/api/" + key + "?pass=" + encodeURIComponent(getPass())); const d = await r.json(); if (!r.ok) throw new Error(d.error || "KV hatası"); return d; }
async function kvPost(key, body) { const r = await fetch(WORKER_URL + "/api/" + key, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pass: getPass(), ...body }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "KV hatası"); return d; }

// ==========================================================================
// 11) PORTFÖY
// ==========================================================================
async function loadPortfolio() { try { return await kvGet("portfolio"); } catch (e) { return []; } }
async function savePortfolio(p) { await kvPost("portfolio", { positions: p }); }
posAddBtn.addEventListener("click", addPosition);
[posSymbol, posQty, posCost].forEach((el) => el.addEventListener("keydown", (e) => { if (e.key === "Enter") addPosition(); }));
async function addPosition() {
  posError.textContent = "";
  const s = posSymbol.value.toUpperCase().trim().replace(/[^A-Z0-9]/g, ""), q = parseFloat(posQty.value), c = parseFloat(posCost.value);
  if (!s) { posError.textContent = "Hisse kodu gir."; return; }
  if (!q || q <= 0) { posError.textContent = "Adet gir."; return; }
  if (!c || c <= 0) { posError.textContent = "Maliyet gir."; return; }
  try {
    const pos = await loadPortfolio(), ex = pos.find((p) => p.symbol === s);
    if (ex) { const tq = ex.qty + q; ex.cost = (ex.qty * ex.cost + q * c) / tq; ex.qty = tq; }
    else { pos.push({ symbol: s, qty: q, cost: c }); }
    await savePortfolio(pos); posSymbol.value = posQty.value = posCost.value = ""; renderPortfolio();
  } catch (e) { posError.textContent = "Kaydedilemedi: " + e.message; }
}
async function removePosition(sym) { await savePortfolio((await loadPortfolio()).filter((p) => p.symbol !== sym)); renderPortfolio(); }
async function fetchQuickPrice(sym) {
  const r = await fetchJSON(WORKER_URL + "/api/chart?symbol=" + sym + "&pass=" + encodeURIComponent(getPass()) + "&range=5d&interval=1d");
  if (r.error) throw new Error(r.error);
  const cr = r.data?.chart?.result?.[0]; if (!cr) throw new Error("veri yok");
  const meta = cr.meta || {}, closes = (cr.indicators.quote[0].close || []).filter((c) => c != null);
  const price = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const prev = closes[closes.length - 2] ?? price;
  return { price, dailyChangePct: prev ? ((price - prev) / prev) * 100 : 0 };
}
async function renderPortfolio() {
  const pos = await loadPortfolio();
  portfolioEmpty.classList.toggle("visible", pos.length === 0);
  portfolioTableBody.innerHTML = portfolioSummary.innerHTML = ""; donutSvg.innerHTML = donutLegend.innerHTML = "";
  if (pos.length === 0) return;
  portfolioTableBody.innerHTML = pos.map((p) => '<tr><td class="symbol-cell">' + p.symbol + '</td><td colspan="6" style="color:var(--text-faint)">Yükleniyor...</td></tr>').join("");
  const results = await Promise.allSettled(pos.map((p) => fetchQuickPrice(p.symbol)));
  let tc = 0, tv = 0, tdc = 0; const rows = [], alloc = [];
  pos.forEach((p, i) => {
    const cv = p.qty * p.cost; tc += cv; const r = results[i];
    if (r.status === "fulfilled") {
      const { price, dailyChangePct } = r.value, val = p.qty * price, gain = val - cv, gp = cv ? (gain / cv) * 100 : 0;
      tv += val; tdc += val - val / (1 + dailyChangePct / 100); alloc.push({ symbol: p.symbol, value: val });
      rows.push('<tr><td class="symbol-cell">' + p.symbol + "</td><td>" + fmtNum(p.qty, 0) + "</td><td>" + fmtTL(p.cost) + "</td><td>" + fmtTL(price) + "</td><td>" + fmtTL(val) + '</td><td class="' + changeClass(gain) + '">' + (gain >= 0 ? "+" : "") + fmtTL(gain) + '</td><td class="' + changeClass(gp) + '">' + fmtPct(gp) + '</td><td><button class="remove-btn" data-symbol="' + p.symbol + '">Sil</button></td></tr>');
    } else { tv += cv; rows.push('<tr><td class="symbol-cell">' + p.symbol + "</td><td>" + fmtNum(p.qty, 0) + "</td><td>" + fmtTL(p.cost) + '</td><td colspan="4" style="color:var(--down)">Veri alınamadı</td><td><button class="remove-btn" data-symbol="' + p.symbol + '">Sil</button></td></tr>'); }
  });
  portfolioTableBody.innerHTML = rows.join("");
  portfolioTableBody.querySelectorAll(".remove-btn").forEach((b) => b.addEventListener("click", () => removePosition(b.dataset.symbol)));
  const tg = tv - tc, tgp = tc ? (tg / tc) * 100 : 0;
  portfolioSummary.innerHTML = '<div class="summary-card"><div class="summary-label">Toplam Değer</div><div class="summary-value">' + fmtTL(tv) + '</div></div><div class="summary-card"><div class="summary-label">Toplam Maliyet</div><div class="summary-value">' + fmtTL(tc) + '</div></div><div class="summary-card"><div class="summary-label">Kâr/Zarar</div><div class="summary-value ' + changeClass(tg) + '">' + (tg >= 0 ? "+" : "") + fmtTL(tg) + " (" + fmtPct(tgp) + ')</div></div><div class="summary-card"><div class="summary-label">Bugünkü Değişim</div><div class="summary-value ' + changeClass(tdc) + '">' + (tdc >= 0 ? "+" : "") + fmtTL(tdc) + " (" + fmtPct(tv ? (tdc / (tv - tdc)) * 100 : 0) + ")</div></div>";
  drawDonut(alloc, tv);
}
function drawDonut(alloc, total) {
  donutSvg.innerHTML = donutLegend.innerHTML = "";
  if (!total || alloc.length === 0) return;
  const colors = ["#d4af37", "#4098d7", "#17c987", "#ff4757", "#a672e0", "#e08f4a", "#4ac4c4", "#e05d9e"];
  let start = -Math.PI / 2;
  alloc.sort((a, b) => b.value - a.value).forEach((a, i) => {
    const frac = a.value / total, end = start + frac * Math.PI * 2;
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M " + (100 + 80 * Math.cos(start)) + " " + (100 + 80 * Math.sin(start)) + " A 80 80 0 " + (frac > 0.5 ? 1 : 0) + " 1 " + (100 + 80 * Math.cos(end)) + " " + (100 + 80 * Math.sin(end)) + " L " + (100 + 48 * Math.cos(end)) + " " + (100 + 48 * Math.sin(end)) + " A 48 48 0 " + (frac > 0.5 ? 1 : 0) + " 0 " + (100 + 48 * Math.cos(start)) + " " + (100 + 48 * Math.sin(start)) + " Z");
    p.setAttribute("fill", colors[i % colors.length]); donutSvg.appendChild(p);
    donutLegend.insertAdjacentHTML("beforeend", '<div class="legend-row"><div class="legend-left"><span class="legend-dot" style="background:' + colors[i % colors.length] + '"></span>' + a.symbol + '</div><span class="legend-pct">' + fmtNum(frac * 100) + "%</span></div>");
    start = end;
  });
}

// ==========================================================================
// 12) TAKİP LİSTESİ
// ==========================================================================
async function loadWatchlist() { try { return await kvGet("watchlist"); } catch (e) { return []; } }
async function saveWatchlist(items) { await kvPost("watchlist", { items }); }
wlAddBtn.addEventListener("click", addWatchlistItem);
wlSymbol.addEventListener("keydown", (e) => { if (e.key === "Enter") addWatchlistItem(); });
async function addWatchlistItem() {
  wlError.textContent = "";
  const sym = wlSymbol.value.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  if (!sym) { wlError.textContent = "Hisse kodu gir."; return; }
  try { const p = await fetchQuickPrice(sym); const items = await loadWatchlist(); if (items.find((i) => i.symbol === sym)) { wlError.textContent = sym + " zaten listede."; return; } items.push({ symbol: sym, addedAt: Date.now(), addedPrice: p.price }); await saveWatchlist(items); wlSymbol.value = ""; wlError.textContent = ""; renderWatchlist(); if (currentSymbol === sym) syncWatchlistState(); } catch (e) { wlError.textContent = "Eklenemedi."; }
}
async function removeWatchlistItem(sym) { await saveWatchlist((await loadWatchlist()).filter((i) => i.symbol !== sym)); renderWatchlist(); if (currentSymbol === sym) syncWatchlistState(); }
watchlistToggleBtn.addEventListener("click", async () => {
  if (!currentSymbol) return;
  const items = await loadWatchlist(), exists = items.find((i) => i.symbol === currentSymbol);
  if (exists) { await removeWatchlistItem(currentSymbol); } else { const p = await fetchQuickPrice(currentSymbol); items.push({ symbol: currentSymbol, addedAt: Date.now(), addedPrice: p.price }); await saveWatchlist(items); }
  syncWatchlistState();
});
async function syncWatchlistState() {
  if (!currentSymbol) { watchlistToggleBtn.textContent = "★ Takip Ekle"; watchlistToggleBtn.classList.remove("following"); return; }
  try { const items = await loadWatchlist(); if (items.find((i) => i.symbol === currentSymbol)) { watchlistToggleBtn.textContent = "★ Takip Ediliyor"; watchlistToggleBtn.classList.add("following"); } else { watchlistToggleBtn.textContent = "★ Takip Ekle"; watchlistToggleBtn.classList.remove("following"); } } catch (e) {}
}
async function renderWatchlist() {
  const items = await loadWatchlist(); watchlistEmpty.classList.toggle("visible", items.length === 0); watchlistTableBody.innerHTML = "";
  if (items.length === 0) return;
  const results = await Promise.allSettled(items.map((i) => fetchQuickPrice(i.symbol)));
  watchlistTableBody.innerHTML = items.map((item, idx) => {
    const r = results[idx];
    if (r.status === "fulfilled") { const { price, dailyChangePct } = r.value; const ap = item.addedPrice ? ((price - item.addedPrice) / item.addedPrice) * 100 : null; return '<tr><td class="symbol-cell">' + item.symbol + "</td><td>" + fmtTL(price) + '</td><td class="' + changeClass(dailyChangePct) + '">' + fmtPct(dailyChangePct) + "</td><td>" + fmtDate(item.addedAt) + "</td><td>" + fmtTL(item.addedPrice) + '</td><td class="' + changeClass(ap) + '">' + (ap != null ? fmtPct(ap) : "—") + '</td><td><button class="remove-btn" data-symbol="' + item.symbol + '">Çıkar</button></td></tr>'; }
    return '<tr><td class="symbol-cell">' + item.symbol + '</td><td colspan="5" style="color:var(--down)">Veri alınamadı</td><td><button class="remove-btn" data-symbol="' + item.symbol + '">Çıkar</button></td></tr>';
  }).join("");
  watchlistTableBody.querySelectorAll(".remove-btn").forEach((b) => b.addEventListener("click", () => removeWatchlistItem(b.dataset.symbol)));
}

// ==========================================================================
// 13) KARŞILAŞTIRMA
// ==========================================================================
cmpBtn.addEventListener("click", runCompare);
[cmpSymbol1, cmpSymbol2, cmpSymbol3].forEach((el) => el.addEventListener("keydown", (e) => { if (e.key === "Enter") runCompare(); }));
async function fetchFullData(sym) {
  const pass = getPass();
  const [cr, qr] = await Promise.all([fetchJSON(WORKER_URL + "/api/chart?symbol=" + sym + "&pass=" + encodeURIComponent(pass)), fetchJSON(WORKER_URL + "/api/quote?symbol=" + sym + "&pass=" + encodeURIComponent(pass))]);
  if (cr.error || qr.error) throw new Error(cr.error || qr.error);
  const chartR = cr.data?.chart?.result?.[0]; if (!chartR || !chartR.timestamp) throw new Error('"' + sym + '" bulunamadı.');
  const d = processChartData(chartR), f = processFundamentals(qr.data);
  return { symbol: sym, d, f, rec: computeRecommendation(d, f), val: computeValuationScore(f) };
}
async function runCompare() {
  cmpError.textContent = "";
  const syms = [cmpSymbol1.value, cmpSymbol2.value, cmpSymbol3.value].map((v) => v.toUpperCase().trim().replace(/[^A-Z0-9]/g, "")).filter(Boolean);
  if (syms.length < 2) { cmpError.textContent = "En az 2 hisse gir."; return; }
  cmpResultCard.style.display = "none"; cmpLoading.classList.add("active");
  try { const results = await Promise.all(syms.map((s) => fetchFullData(s))); renderCompareTable(results); cmpLoading.classList.remove("active"); cmpResultCard.style.display = "block"; } catch (err) { cmpLoading.classList.remove("active"); cmpError.textContent = err.message; }
}
function buildMetricRow(label, results, getValue, formatter, higherIsBetter) {
  const vals = results.map((r) => getValue(r)), valid = vals.filter((v) => v != null && !isNaN(v));
  let best = null; if (valid.length > 1) best = higherIsBetter ? Math.max(...valid) : Math.min(...valid);
  return "<tr><td>" + label + "</td>" + vals.map((v) => '<td class="' + (best != null && v === best ? "best-value" : "") + '">' + formatter(v) + "</td>").join("") + "</tr>";
}
function renderCompareTable(results) {
  const hdr = "<tr><th>Metrik</th>" + results.map((r) => '<th class="symbol-cell">' + r.symbol + "</th>").join("") + "</tr>";
  const rows = [
    buildMetricRow("Fiyat", results, (r) => r.d.lastClose, (v) => fmtTL(v), true),
    buildMetricRow("Günlük %", results, (r) => r.d.changes.daily, (v) => fmtPct(v), true),
    buildMetricRow("Yıllık %", results, (r) => r.d.changes.yearly, (v) => fmtPct(v), true),
    buildMetricRow("52H Konum", results, (r) => { const l = r.f.fiftyTwoWeekLow ?? r.d.week52Low, h = r.f.fiftyTwoWeekHigh ?? r.d.week52High; return h > l ? ((r.d.lastClose - l) / (h - l)) * 100 : null; }, (v) => (v != null ? fmtNum(v, 0) + "%" : "—"), false),
    buildMetricRow("F/K", results, (r) => r.f.trailingPE, (v) => fmtNum(v), false),
    buildMetricRow("PD/DD", results, (r) => r.f.priceToBook, (v) => fmtNum(v), false),
    buildMetricRow("PD/Satış", results, (r) => r.f.priceToSales, (v) => fmtNum(v), false),
    buildMetricRow("Temettü", results, (r) => (r.f.dividendYield != null ? r.f.dividendYield * 100 : null), (v) => (v != null ? fmtPct(v) : "—"), true),
    buildMetricRow("ROE", results, (r) => (r.f.returnOnEquity != null ? r.f.returnOnEquity * 100 : null), (v) => (v != null ? fmtPct(v) : "—"), true),
    buildMetricRow("RSI", results, (r) => r.d.rsi, (v) => fmtNum(v), false),
    buildMetricRow("Ort. Hacim", results, (r) => r.d.avgVolumeTL, (v) => fmtCompactTL(v), true),
  ];
  const bestRec = Math.max(...results.map((r) => r.rec.score)), bestVal = Math.max(...results.map((r) => r.val.score));
  rows.push("<tr><td>AL/SAT</td>" + results.map((r) => '<td class="' + (r.rec.score === bestRec ? "best-value" : "") + '">' + fmtNum(r.rec.score, 0) + " (" + r.rec.label + ")</td>").join("") + "</tr>");
  rows.push("<tr><td>Değerleme</td>" + results.map((r) => '<td class="' + (r.val.score === bestVal ? "best-value" : "") + '">' + fmtNum(r.val.score, 0) + " (" + r.val.label + ")</td>").join("") + "</tr>");
  compareTable.innerHTML = "<thead>" + hdr + "</thead><tbody>" + rows.join("") + "</tbody>";
}
