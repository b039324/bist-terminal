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
const themeToggleBtn = document.getElementById("themeToggleBtn");
const printPdfBtn = document.getElementById("printPdfBtn");
const refreshStockBtn = document.getElementById("refreshStockBtn");

const searchScreen = document.getElementById("searchScreen");
const searchInput = document.getElementById("searchInput");
const searchError = document.getElementById("searchError");
const autocompleteBox = document.getElementById("autocompleteBox");
const recentSearchesWrap = document.getElementById("recentSearchesWrap");
const recentSearchesRow = document.getElementById("recentSearchesRow");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const resultScreen = document.getElementById("resultScreen");
const newSearchInput = document.getElementById("newSearchInput");
const newSearchBtn = document.getElementById("newSearchBtn");
const watchlistToggleBtn = document.getElementById("watchlistToggleBtn");

const navSearchBtn = document.getElementById("navSearchBtn");
const navHomeBtn = document.getElementById("navHomeBtn");
const homeScreen = document.getElementById("homeScreen");
const homePortfolioSummary = document.getElementById("homePortfolioSummary");
const homePortfolioEmpty = document.getElementById("homePortfolioEmpty");
const homeWatchlistMovers = document.getElementById("homeWatchlistMovers");
const homeWatchlistEmpty = document.getElementById("homeWatchlistEmpty");
const homePulseRow = document.getElementById("homePulseRow");
const homePulseEmpty = document.getElementById("homePulseEmpty");
const homePulseNote = document.getElementById("homePulseNote");
const homeSectorNote = document.getElementById("homeSectorNote");
const homePortfolioChartCard = document.getElementById("homePortfolioChartCard");
const homePortfolioChartEl = document.getElementById("homePortfolioChart");
const homePortfolioChartEmpty = document.getElementById("homePortfolioChartEmpty");
const homeBist30Mini = document.getElementById("homeBist30Mini");
const homeBist30MiniEmpty = document.getElementById("homeBist30MiniEmpty");
const homeHeatmapMini = document.getElementById("homeHeatmapMini");
const homeHeatmapMiniEmpty = document.getElementById("homeHeatmapMiniEmpty");
const navPortfolioBtn = document.getElementById("navPortfolioBtn");
const navWatchlistBtn = document.getElementById("navWatchlistBtn");
const navTrendsBtn = document.getElementById("navTrendsBtn");
const navMoneyBtn = document.getElementById("navMoneyBtn");
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
const portfolioCsvBtn = document.getElementById("portfolioCsvBtn");
const sectorBreakdownCard = document.getElementById("sectorBreakdownCard");
const sectorBreakdownRow = document.getElementById("sectorBreakdownRow");
const portfolioHistoryCard = document.getElementById("portfolioHistoryCard");
const portfolioHistoryChartEl = document.getElementById("portfolioHistoryChart");
const portfolioHistoryEmpty = document.getElementById("portfolioHistoryEmpty");
const historyRangeTabs = document.getElementById("historyRangeTabs");
const sectorConcentrationWarn = document.getElementById("sectorConcentrationWarn");
const donutSvg = document.getElementById("donutSvg");
const donutLegend = document.getElementById("donutLegend");

const watchlistScreen = document.getElementById("watchlistScreen");
const wlSymbol = document.getElementById("wlSymbol");
const wlAddBtn = document.getElementById("wlAddBtn");
const wlError = document.getElementById("wlError");
const watchlistTableBody = document.getElementById("watchlistTableBody");
const watchlistEmpty = document.getElementById("watchlistEmpty");
const watchlistCsvBtn = document.getElementById("watchlistCsvBtn");

const earningsChartSvg = document.getElementById("earningsChartSvg");
const earningsEmpty = document.getElementById("earningsEmpty");
const recTrendChart = document.getElementById("recTrendChart");
const recTrendEmpty = document.getElementById("recTrendEmpty");
const profileCard = document.getElementById("profileCard");
const profileMeta = document.getElementById("profileMeta");
const profileSummary = document.getElementById("profileSummary");
const stockNoteInput = document.getElementById("stockNoteInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const noteSavedText = document.getElementById("noteSavedText");

const compareScreen = document.getElementById("compareScreen");
const trendsScreen = document.getElementById("trendsScreen");
const moneyScreen = document.getElementById("moneyScreen");
const moneyRefreshBtn = document.getElementById("moneyRefreshBtn");
const moneyError = document.getElementById("moneyError");
const moneyLoading = document.getElementById("moneyLoading");
const moneyLoadingText = document.getElementById("moneyLoadingText");
const moneyResults = document.getElementById("moneyResults");
const moneySectorList = document.getElementById("moneySectorList");
const trendsRefreshBtn = document.getElementById("trendsRefreshBtn");
const trendsError = document.getElementById("trendsError");
const trendsLoading = document.getElementById("trendsLoading");
const trendsLoadingText = document.getElementById("trendsLoadingText");
const trendsResults = document.getElementById("trendsResults");
const trendsGainersTable = document.getElementById("trendsGainersTable");
const trendsLosersTable = document.getElementById("trendsLosersTable");
const trendsVolumeTable = document.getElementById("trendsVolumeTable");
const trends52HighTable = document.getElementById("trends52HighTable");
const trends52HighEmpty = document.getElementById("trends52HighEmpty");
const trends52LowTable = document.getElementById("trends52LowTable");
const trends52LowEmpty = document.getElementById("trends52LowEmpty");
const bist30PeakTable = document.getElementById("bist30PeakTable");
const deepScanBtn = document.getElementById("deepScanBtn");
const deepScanError = document.getElementById("deepScanError");
const deepScanLoading = document.getElementById("deepScanLoading");
const deepScanLoadingText = document.getElementById("deepScanLoadingText");
const deepScanResults = document.getElementById("deepScanResults");
const deepScanMcapTable = document.getElementById("deepScanMcapTable");
const gaugeDistRow = document.getElementById("gaugeDistRow");
const detailToggleBtn = document.getElementById("detailToggleBtn");
const realizedSummary = document.getElementById("realizedSummary");
const realizedTableBody = document.getElementById("realizedTableBody");
const realizedEmpty = document.getElementById("realizedEmpty");
const pulseRow = document.getElementById("pulseRow");
const heatmapGrid = document.getElementById("heatmapGrid");
const volumeHeatmapGrid = document.getElementById("volumeHeatmapGrid");
const cmpSymbol1 = document.getElementById("cmpSymbol1");
const cmpSymbol2 = document.getElementById("cmpSymbol2");
const cmpSymbol3 = document.getElementById("cmpSymbol3");
const cmpSymbol4 = document.getElementById("cmpSymbol4");
const cmpBtn = document.getElementById("cmpBtn");
const cmpError = document.getElementById("cmpError");
const cmpLoading = document.getElementById("cmpLoading");
const cmpResultCard = document.getElementById("cmpResultCard");
const cmpChartEl = document.getElementById("cmpChart");
const compareTable = document.getElementById("compareTable");

let priceChartApi = null, volumeChartApi = null, candleSeries = null, volumeSeries = null;
let fullChartData = null, currentSymbol = null;
let lastTrendsPoints = null, lastTrendsScanTime = null;
let cmpChartApi = null;

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
function tryEnterApp() { if (localStorage.getItem(LS_PASS_KEY)) { lockScreen.style.display = "none"; appEl.style.display = "block"; syncWatchlistState(); renderRecentSearches(); checkShareableLink(); } }
passSubmit.addEventListener("click", () => { const v = passInput.value.trim(); if (!v) { lockError.textContent = "Lütfen şifre gir."; return; } localStorage.setItem(LS_PASS_KEY, v); lockScreen.style.display = "none"; appEl.style.display = "block"; searchInput.focus(); renderRecentSearches(); checkShareableLink(); });
passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") passSubmit.click(); });
logoutBtn.addEventListener("click", () => { localStorage.removeItem(LS_PASS_KEY); location.reload(); });
tryEnterApp();

// ==========================================================================
// 3) NAVİGASYON
// ==========================================================================
function setActiveNav(b) { [navSearchBtn, navHomeBtn, navPortfolioBtn, navWatchlistBtn, navTrendsBtn, navMoneyBtn, navCompareBtn].forEach((x) => x.classList.remove("active")); b.classList.add("active"); }
function hideAllScreens() { window.scrollTo({ top: 0, behavior: "instant" }); homeScreen.classList.remove("active"); portfolioScreen.classList.remove("active"); watchlistScreen.classList.remove("active"); trendsScreen.classList.remove("active"); moneyScreen.classList.remove("active"); compareScreen.classList.remove("active"); resultScreen.classList.remove("active"); loadingScreen.classList.remove("active"); }
function showSearchNav() { setActiveNav(navSearchBtn); homeScreen.classList.remove("active"); portfolioScreen.classList.remove("active"); watchlistScreen.classList.remove("active"); trendsScreen.classList.remove("active"); moneyScreen.classList.remove("active"); compareScreen.classList.remove("active"); searchScreen.classList.remove("hidden"); renderRecentSearches(); }
function showHomeNav() { setActiveNav(navHomeBtn); searchScreen.classList.add("hidden"); hideAllScreens(); homeScreen.classList.add("active"); renderHomeScreen(); }
function showPortfolioNav() { setActiveNav(navPortfolioBtn); searchScreen.classList.add("hidden"); hideAllScreens(); portfolioScreen.classList.add("active"); renderPortfolio(); }
function showWatchlistNav() { setActiveNav(navWatchlistBtn); searchScreen.classList.add("hidden"); hideAllScreens(); watchlistScreen.classList.add("active"); renderWatchlist(); }
function showTrendsNav() { setActiveNav(navTrendsBtn); searchScreen.classList.add("hidden"); hideAllScreens(); trendsScreen.classList.add("active"); }
function showMoneyNav() { setActiveNav(navMoneyBtn); searchScreen.classList.add("hidden"); hideAllScreens(); moneyScreen.classList.add("active"); }
function showCompareNav() { setActiveNav(navCompareBtn); searchScreen.classList.add("hidden"); hideAllScreens(); compareScreen.classList.add("active"); }
navSearchBtn.addEventListener("click", showSearchNav); navHomeBtn.addEventListener("click", showHomeNav); navPortfolioBtn.addEventListener("click", showPortfolioNav); navWatchlistBtn.addEventListener("click", showWatchlistNav); navTrendsBtn.addEventListener("click", showTrendsNav); navMoneyBtn.addEventListener("click", showMoneyNav); navCompareBtn.addEventListener("click", showCompareNav);

// Portföy, Takip, Trendler ve Isı Haritası'ndaki hisse isimlerine tıklayınca
// o hisseyi arayıp sonuç ekranına götürür — mevcut arama akışını aynen kullanır.
function goToStock(symbol) {
  window.scrollTo({ top: 0, behavior: "instant" });
  showSearchNav();
  runSearch(symbol);
}

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
    applyReliableDailyChange(d, f);
    showLoading(false); resultScreen.classList.add("active"); searchScreen.classList.add("hidden");
    renderAll(symbol, d, f); syncWatchlistState(); newSearchInput.value = "";
    saveRecentSearch(symbol);
    loadNoteForSymbol(symbol);
  } catch (err) { showLoading(false); searchScreen.classList.remove("hidden"); resultScreen.classList.remove("active"); searchError.textContent = err.message || "Hata."; }
}

// ==========================================================================
// 5) VERİ İŞLEME
// ==========================================================================
// Günlük değişim: grafik verisindeki (bazen Yahoo tarafında eksik/gecikmeli olabilen) diziye değil,
// temel veri (quote) endpoint'indeki resmi "previousClose" alanına göre YENİDEN hesaplanır.
// Bu, Yahoo'nun web sitesindeki değerle birebir eşleşmesini garantiler.
function applyReliableDailyChange(d, f) {
  if (f.previousClose != null && f.previousClose > 0) {
    d.changes.daily = ((d.lastClose - f.previousClose) / f.previousClose) * 100;
  }
  return d;
}

function processChartData(r) {
  const ts = r.timestamp, q = r.indicators.quote[0], meta = r.meta || {};
  const candles = [], vtl = [];
  for (let i = 0; i < ts.length; i++) { if (q.close[i] == null) continue; const t = ts[i], c = q.close[i]; candles.push({ time: t, open: q.open[i] ?? c, high: q.high[i] ?? c, low: q.low[i] ?? c, close: c, volume: q.volume[i] ?? 0 }); vtl.push({ time: t, volumeTL: (q.volume[i] ?? 0) * c }); }

  // ÖNEMLİ: Yahoo'nun grafik (chart) verisi bazen bugüne hiç ulaşmıyor — ya son satır
  // "boş" (null) geliyor, ya da dizi resmen dünle bitip bugüne ait bir satır bile
  // eklenmemiş oluyor. İkisini de yakalamak için, dizideki SON mumun tarihini,
  // Yahoo'nun "meta" alanındaki (güncel fiyatın ait olduğu) GERÇEK tarihle -TAKVİM GÜNÜ
  // bazında- karşılaştırıyoruz. Meta daha yeni bir günü gösteriyorsa, o günü meta
  // verisinden SENTEZLEYİP diziye ekliyoruz — böylece grafik de, hacim de gerçekten
  // güncel günü gösterir.
  const toTRDateStr = (unixSec) => new Date((unixSec + 3 * 3600) * 1000).toISOString().slice(0, 10);
  const lastCandleDate = candles.length > 0 ? toTRDateStr(candles[candles.length - 1].time) : null;
  const metaDate = meta.regularMarketTime != null ? toTRDateStr(meta.regularMarketTime) : null;

  if (metaDate != null && metaDate !== lastCandleDate && meta.regularMarketPrice != null) {
    const prevC = candles.length > 0 ? candles[candles.length - 1].close : meta.regularMarketPrice;
    const synth = {
      time: meta.regularMarketTime,
      open: prevC,
      high: meta.regularMarketDayHigh ?? Math.max(prevC, meta.regularMarketPrice),
      low: meta.regularMarketDayLow ?? Math.min(prevC, meta.regularMarketPrice),
      close: meta.regularMarketPrice,
      volume: meta.regularMarketVolume ?? 0,
    };
    candles.push(synth);
    vtl.push({ time: synth.time, volumeTL: synth.volume * synth.close });
  }

  const closes = candles.map((c) => c.close);
  const lc = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const pc = closes[closes.length - 2] ?? lc;
  const bd = (n) => { const i = closes.length - 1 - n; return i >= 0 ? closes[i] : closes[0]; };
  const ch = (f) => f ? ((lc - f) / f) * 100 : 0;
  const changes = { daily: ch(pc), weekly: ch(bd(5)), monthly: ch(bd(21)), sixMonth: ch(bd(126)), yearly: ch(closes[0]) };
  const wl = Math.min(...candles.map((c) => c.low)), wh = Math.max(...candles.map((c) => c.high));
  const l30 = vtl.slice(-30), avgV = l30.reduce((s, v) => s + v.volumeTL, 0) / l30.length, avgVS = candles.slice(-30).reduce((s, c) => s + c.volume, 0) / l30.length;
  const lastC = candles[candles.length - 1];
  const rsi = calcRSI(closes, 14), ma50 = sma(closes, 50), ma200 = sma(closes, 200), macd = calcMACD(closes), boll = calcBollinger(closes, 20, 2), stoch = calcStochRSI(closes, 14, 14), ema21arr = ema(closes, 21);
  return { candles, volumesTL: vtl, lastClose: lc, changes, week52Low: wl, week52High: wh, avgVolumeTL: avgV, avgVolumeShares: avgVS, dailyVolumeTL: lastC.volume * lc, dailyVolumeShares: lastC.volume, rsi: rsi[rsi.length - 1], ma50: ma50[ma50.length - 1], ma200: ma200[ma200.length - 1], ema21: ema21arr[ema21arr.length - 1], macd: macd.macdLine[macd.macdLine.length - 1], macdSignal: macd.signalLine[macd.signalLine.length - 1], bollingerUpper: boll.upper[boll.upper.length - 1], bollingerMid: boll.mid[boll.mid.length - 1], bollingerLower: boll.lower[boll.lower.length - 1], stochRsi: stoch[stoch.length - 1] };
}
function processFundamentals(raw) {
  const r = raw?.quoteSummary?.result?.[0] || {}, sd = r.summaryDetail || {}, dks = r.defaultKeyStatistics || {}, fd = r.financialData || {}, price = r.price || {};
  const g = (o, k) => {
    const v = o?.[k];
    if (v == null) return null;
    if (typeof v === "object") return ("raw" in v && v.raw != null) ? v.raw : null; // boş obje {} -> null
    return v;
  };

  // Çeyreklik gelir/kâr (grafik için) — earnings.financialsChart.quarterly
  const quarterly = (r.earnings?.financialsChart?.quarterly || []).map((q) => ({
    label: q.date, revenue: g(q, "revenue"), earnings: g(q, "earnings"),
  }));

  // Analist tavsiye trendi (son aylar) — recommendationTrend.trend
  const recTrend = (r.recommendationTrend?.trend || []).map((t) => ({
    period: t.period, strongBuy: t.strongBuy || 0, buy: t.buy || 0, hold: t.hold || 0, sell: t.sell || 0, strongSell: t.strongSell || 0,
  }));

  // Şirket profili (varsa)
  const profile = r.assetProfile || {};

  return { companyName: price.longName || price.shortName || "—", marketCap: g(price, "marketCap"), trailingPE: g(sd, "trailingPE"), forwardPE: g(sd, "forwardPE"), priceToBook: g(dks, "priceToBook"), dividendYield: g(sd, "dividendYield"), beta: g(sd, "beta"), returnOnEquity: g(fd, "returnOnEquity"), profitMargins: g(dks, "profitMargins"), revenueGrowth: g(fd, "revenueGrowth"), recommendationMean: g(fd, "recommendationMean"), numberOfAnalysts: g(fd, "numberOfAnalystOpinions"), fiftyTwoWeekLow: g(sd, "fiftyTwoWeekLow"), fiftyTwoWeekHigh: g(sd, "fiftyTwoWeekHigh"), priceToSales: g(sd, "priceToSalesTrailing12Months"), targetMeanPrice: g(fd, "targetMeanPrice"), targetHighPrice: g(fd, "targetHighPrice"), targetLowPrice: g(fd, "targetLowPrice"), bookValue: g(dks, "bookValue"), previousClose: g(sd, "previousClose") ?? g(price, "regularMarketPreviousClose"), quarterly, recTrend, businessSummary: profile.longBusinessSummary || null, sector: profile.sector || null, industry: profile.industry || null, employees: g(profile, "fullTimeEmployees"), website: profile.website || null };
}

// ==========================================================================
// 6) GAUGE (basit, eski yapı — ibre r-20 ile içeride, skor 2-98 arası)
// ==========================================================================
function drawGauge(score, svgId) {
  const svg = document.getElementById(svgId);
  svg.innerHTML = "";
  const cx = 140, cy = 140, r = 110, sa = Math.PI, ea = 0, span = sa - ea;
  const clamped = Math.max(2, Math.min(98, (score != null && !isNaN(score)) ? score : 50));
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

  // Trend yönünü önce belirliyoruz (RSI mantığını buna göre ayarlayacağız)
  const trendUp = d.ma50 != null && d.ma200 != null && d.lastClose > d.ma50 && d.ma50 > d.ma200;
  const trendDown = d.ma50 != null && d.ma200 != null && d.lastClose < d.ma50 && d.ma50 < d.ma200;

  // RSI: ağırlık ±20'den ±10'a düşürüldü. Ayrıca trend-duyarlı hale getirildi:
  // düşüş trendinde "aşırı satım" bonusu sınırlanır (düşen bıçağı tutma riski),
  // yükseliş trendinde "aşırı alım" cezası sınırlanır (güçlü trend RSI'de uzun süre kalabilir).
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
  if (typeof f.recommendationMean === "number" && !isNaN(f.recommendationMean)) { const as = ((3 - f.recommendationMean) / 2) * 15; s += as; fa.push(["Analist ort.", (as >= 0 ? "+" : "") + fmtNum(as, 0)]); }
  if (isNaN(s)) s = 50; // güvenlik ağı: hesaplamada NaN oluşursa nötr'e düş
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
  if (isNaN(s)) s = 50; // güvenlik ağı: hesaplamada NaN oluşursa nötr'e düş
  s = Math.max(0, Math.min(100, s));
  let lb, cl; if (s >= 80) { lb = "UCUZ"; cl = "strong-buy"; } else if (s >= 60) { lb = "MAKUL"; cl = "buy"; } else if (s >= 40) { lb = "NÖTR"; cl = "neutral"; } else if (s >= 20) { lb = "PAHALI"; cl = "sell"; } else { lb = "AŞIRI PAHALI"; cl = "strong-sell"; }
  return { score: s, label: lb, cls: cl, factors: fa };
}

// ==========================================================================
// 8) MİNİ HACİM + LIGHTWEIGHT CHARTS
// ==========================================================================
function drawMiniVolume(vtl) { const svg = document.getElementById("miniVolumeSvg"); svg.innerHTML = ""; const data = vtl.slice(-30); const max = Math.max(...data.map((d) => d.volumeTL)); const w = 300 / data.length; data.forEach((d, i) => { const h = max ? (d.volumeTL / max) * 55 : 0; const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("x", i * w + 1); r.setAttribute("y", 58 - h); r.setAttribute("width", Math.max(w - 2, 1)); r.setAttribute("height", h); r.setAttribute("fill", "#d4af37"); r.setAttribute("opacity", "0.75"); svg.appendChild(r); }); }
function isLightTheme() { return document.documentElement.getAttribute("data-theme") === "light"; }

function renderChart(candles, vtl) {
  const pe = document.getElementById("priceChart"), ve = document.getElementById("volumeChart");
  pe.innerHTML = ""; ve.innerHTML = "";
  const light = isLightTheme();
  const opt = { layout: { background: { color: "transparent" }, textColor: light ? "#566072" : "#7d8a9c", fontFamily: "JetBrains Mono, monospace" }, grid: { vertLines: { color: light ? "#e4e7ec" : "#1a1f29" }, horzLines: { color: light ? "#e4e7ec" : "#1a1f29" } }, timeScale: { borderColor: light ? "#dde1e7" : "#232a36" }, rightPriceScale: { borderColor: light ? "#dde1e7" : "#232a36" }, crosshair: { mode: 0 } };
  priceChartApi = LightweightCharts.createChart(pe, { ...opt, height: 340 });
  candleSeries = priceChartApi.addCandlestickSeries({ upColor: "#17c987", downColor: "#ff4757", borderUpColor: "#17c987", borderDownColor: "#ff4757", wickUpColor: "#17c987", wickDownColor: "#ff4757" });
  candleSeries.setData(candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));

  // EMA21 çizgisi — mum grafiğinin üzerine bindirilir
  const closesForEma = candles.map((c) => c.close);
  const ema21Series = ema(closesForEma, 21);
  const ema21LineSeries = priceChartApi.addLineSeries({ color: "#d4af37", lineWidth: 2, title: "EMA21", priceLineVisible: false, lastValueVisible: true });
  ema21LineSeries.setData(candles.map((c, i) => ({ time: c.time, value: ema21Series[i] })).filter((p) => p.value != null));

  volumeChartApi = LightweightCharts.createChart(ve, { ...opt, height: 110 });
  volumeSeries = volumeChartApi.addHistogramSeries({ color: "#4098d7" });
  volumeSeries.setData(vtl.map((v, i) => ({ time: v.time, value: v.volumeTL, color: candles[i].close >= candles[i].open ? "rgba(23,201,135,0.6)" : "rgba(255,71,87,0.6)" })));
  priceChartApi.timeScale().fitContent(); volumeChartApi.timeScale().fitContent();
  priceChartApi.timeScale().subscribeVisibleLogicalRangeChange((r) => { volumeChartApi.timeScale().setVisibleLogicalRange(r); });

  // Mum üzerine gelince: o günün açılış/yüksek/düşük/kapanış ve TL hacmini gösteren tooltip
  const tooltipEl = document.getElementById("chartTooltip");
  priceChartApi.subscribeCrosshairMove((param) => {
    if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
      tooltipEl.style.display = "none";
      return;
    }
    const idx = candles.findIndex((c) => c.time === param.time);
    if (idx === -1) { tooltipEl.style.display = "none"; return; }
    const candle = candles[idx];
    const volPoint = vtl.find((v) => v.time === param.time);
    // Günlük değişim: o günün AÇILIŞINA göre değil, uygulamanın geri kalanıyla tutarlı olması için
    // BİR ÖNCEKİ GÜNÜN KAPANIŞINA göre hesaplanıyor.
    const prevClose = idx > 0 ? candles[idx - 1].close : candle.open;
    const changePct = prevClose ? ((candle.close - prevClose) / prevClose) * 100 : 0;
    const cls = changeClass(changePct);

    tooltipEl.innerHTML =
      '<div class="ct-date">' + fmtDate(candle.time * 1000) + '</div>' +
      '<div class="ct-row"><span class="ct-label">Açılış</span><span class="ct-value">' + fmtTL(candle.open) + '</span></div>' +
      '<div class="ct-row"><span class="ct-label">En Yüksek</span><span class="ct-value">' + fmtTL(candle.high) + '</span></div>' +
      '<div class="ct-row"><span class="ct-label">En Düşük</span><span class="ct-value">' + fmtTL(candle.low) + '</span></div>' +
      '<div class="ct-row"><span class="ct-label">Kapanış</span><span class="ct-value ' + cls + '">' + fmtTL(candle.close) + ' (' + fmtPct(changePct) + ')</span></div>' +
      '<div class="ct-row"><span class="ct-label">Hacim (TL)</span><span class="ct-value">' + (volPoint ? fmtCompactTL(volPoint.volumeTL) : "—") + '</span></div>';
    tooltipEl.style.display = "block";

    const bounds = pe.getBoundingClientRect();
    let left = param.point.x + 16, top = param.point.y + 16;
    if (left + 190 > bounds.width) left = param.point.x - 190;
    if (top + 150 > bounds.height) top = param.point.y - 150;
    tooltipEl.style.left = Math.max(0, left) + "px";
    tooltipEl.style.top = Math.max(0, top) + "px";
  });
}
document.getElementById("rangeTabs").addEventListener("click", async (e) => {
  if (e.target.tagName !== "BUTTON") return;
  document.querySelectorAll("#rangeTabs button").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  const range = e.target.dataset.range;

  if (range === "intraday") {
    await loadIntradayChart();
    return;
  }

  // Günlük görünüme dönülüyorsa ve daha önce gün içi veriye geçilmişse, önce günlük veriyi geri yükle
  if (isIntradayView) { renderChart(fullChartData.candles, fullChartData.volumesTL); isIntradayView = false; }
  if (!priceChartApi || !fullChartData) return;
  const days = { "1m": 21, "3m": 63, "6m": 126, "1y": 300 }[range];
  const c = fullChartData.candles, from = c[Math.max(0, c.length - days)].time, to = c[c.length - 1].time;
  priceChartApi.timeScale().setVisibleRange({ from, to }); volumeChartApi.timeScale().setVisibleRange({ from, to });
});

let isIntradayView = false;

// Gün içi (15 dakikalık) grafik — ayrı bir istekle çekilir, sadece kullanıcı istediğinde.
async function loadIntradayChart() {
  if (!currentSymbol) return;
  const titleEl = document.getElementById("chartCardTitle");
  const prevTitle = titleEl.textContent;
  titleEl.textContent = "Yükleniyor...";
  try {
    const pass = getPass();
    const res = await fetchJSON(WORKER_URL + "/api/chart?symbol=" + currentSymbol + "&pass=" + encodeURIComponent(pass) + "&range=1d&interval=15m");
    if (res.error) throw new Error(res.error);
    const chartR = res.data?.chart?.result?.[0];
    if (!chartR || !chartR.timestamp) throw new Error("Gün içi veri bulunamadı (piyasa henüz açılmamış olabilir).");

    const ts = chartR.timestamp, q = chartR.indicators.quote[0];
    const candles = [], vtl = [];
    for (let i = 0; i < ts.length; i++) {
      if (q.close[i] == null) continue;
      const t = ts[i], c = q.close[i];
      candles.push({ time: t, open: q.open[i] ?? c, high: q.high[i] ?? c, low: q.low[i] ?? c, close: c, volume: q.volume[i] ?? 0 });
      vtl.push({ time: t, volumeTL: (q.volume[i] ?? 0) * c });
    }
    if (candles.length === 0) throw new Error("Gün içi veri bulunamadı (piyasa henüz açılmamış olabilir).");

    renderChart(candles, vtl);
    isIntradayView = true;
    titleEl.textContent = "Fiyat Grafiği (Gün İçi, 15dk)";
  } catch (err) {
    titleEl.textContent = prevTitle;
    alert(err.message || "Gün içi veri çekilemedi.");
    // Hata olursa günlük görünüme geri dön
    document.querySelectorAll("#rangeTabs button").forEach((b) => b.classList.remove("active"));
    document.querySelector('#rangeTabs button[data-range="1y"]').classList.add("active");
  }
}

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
  const ema21T = d.lastClose > d.ema21 ? ["Fiyat > EMA21", "buy"] : ["Fiyat < EMA21", "sell"];
  const maT = d.lastClose > d.ma50 ? ["Fiyat > MA50", "buy"] : ["Fiyat < MA50", "sell"];
  const macdT = d.macd > d.macdSignal ? ["Pozitif", "buy"] : ["Negatif", "sell"];
  const bollT = d.lastClose > d.bollingerUpper ? ["Üst Bandın Üstü", "sell"] : d.lastClose < d.bollingerLower ? ["Alt Bandın Altı", "buy"] : ["Bant İçi", "neutral"];
  const stochT = d.stochRsi > 80 ? ["Aşırı Alım", "sell"] : d.stochRsi < 20 ? ["Aşırı Satım", "buy"] : ["Nötr", "neutral"];

  document.getElementById("technicalRows").innerHTML = [
    rowHTML("RSI (14)", fmtNum(d.rsi), rsiT), rowHTML("Stochastic RSI", fmtNum(d.stochRsi), stochT),
    rowHTML("EMA 21", fmtTL(d.ema21), ema21T),
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

  renderEarningsChart(f.quarterly);
  renderRecTrend(f.recTrend);
  renderCompanyProfile(f);
}

// ---------- Çeyreklik Gelir/Kâr grafiği ----------
function renderEarningsChart(quarterly) {
  earningsChartSvg.innerHTML = "";
  if (!quarterly || quarterly.length === 0) { earningsEmpty.classList.add("visible"); earningsChartSvg.style.display = "none"; return; }
  earningsEmpty.classList.remove("visible"); earningsChartSvg.style.display = "block";

  const last4 = quarterly.slice(-4);
  const allVals = last4.flatMap((q) => [q.revenue || 0, q.earnings || 0]);
  const maxAbs = Math.max(1, ...allVals.map(Math.abs));
  const w = 400, h = 180, padBottom = 24, padTop = 10, zeroY = h - padBottom - (h - padBottom - padTop) / 2;
  const groupW = w / last4.length;

  last4.forEach((q, i) => {
    const cx = i * groupW + groupW / 2;
    const barW = groupW * 0.28;
    const scaleH = (h - padBottom - padTop) / 2;

    const revH = (Math.abs(q.revenue || 0) / maxAbs) * scaleH;
    const revY = q.revenue >= 0 ? zeroY - revH : zeroY;
    const revRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    revRect.setAttribute("x", cx - barW - 3); revRect.setAttribute("y", revY);
    revRect.setAttribute("width", barW); revRect.setAttribute("height", Math.max(1, revH));
    revRect.setAttribute("fill", "#4098d7"); revRect.setAttribute("rx", "2");
    earningsChartSvg.appendChild(revRect);

    const earnH = (Math.abs(q.earnings || 0) / maxAbs) * scaleH;
    const earnY = q.earnings >= 0 ? zeroY - earnH : zeroY;
    const earnRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    earnRect.setAttribute("x", cx + 3); earnRect.setAttribute("y", earnY);
    earnRect.setAttribute("width", barW); earnRect.setAttribute("height", Math.max(1, earnH));
    earnRect.setAttribute("fill", q.earnings >= 0 ? "#17c987" : "#ff4757"); earnRect.setAttribute("rx", "2");
    earningsChartSvg.appendChild(earnRect);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", cx); label.setAttribute("y", h - 6);
    label.setAttribute("text-anchor", "middle"); label.setAttribute("font-size", "10.5");
    label.setAttribute("fill", "#7d8a9c"); label.setAttribute("font-family", "JetBrains Mono, monospace");
    label.textContent = q.label || "";
    earningsChartSvg.appendChild(label);
  });

  // Sıfır çizgisi
  const zeroLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  zeroLine.setAttribute("x1", "0"); zeroLine.setAttribute("x2", String(w));
  zeroLine.setAttribute("y1", String(zeroY)); zeroLine.setAttribute("y2", String(zeroY));
  zeroLine.setAttribute("stroke", "#232a36"); zeroLine.setAttribute("stroke-width", "1");
  earningsChartSvg.insertBefore(zeroLine, earningsChartSvg.firstChild);

  // Basit gösterge notu
  const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
  legend.setAttribute("x", "6"); legend.setAttribute("y", "12");
  legend.setAttribute("font-size", "9.5"); legend.setAttribute("fill", "#4098d7");
  legend.setAttribute("font-family", "JetBrains Mono, monospace");
  legend.textContent = "■ Gelir   ";
  earningsChartSvg.appendChild(legend);
}

// ---------- Analist Tavsiye Trendi (son 4 ay) ----------
function renderRecTrend(recTrend) {
  recTrendChart.innerHTML = "";
  if (!recTrend || recTrend.length === 0) { recTrendEmpty.classList.add("visible"); recTrendChart.style.display = "none"; return; }
  recTrendEmpty.classList.remove("visible"); recTrendChart.style.display = "block";

  const periodLabel = (p) => (p === "0m" ? "Bugün" : p === "-1m" ? "1 Ay Önce" : p === "-2m" ? "2 Ay Önce" : p === "-3m" ? "3 Ay Önce" : p);
  const rows = recTrend.map((t) => {
    const total = t.strongBuy + t.buy + t.hold + t.sell + t.strongSell;
    if (total === 0) return "";
    const seg = (val, color) => (val > 0 ? `<div style="width:${(val / total) * 100}%; background:${color}"></div>` : "");
    return `
      <div class="rec-trend-month">
        <div class="rec-trend-label">${periodLabel(t.period)}</div>
        <div class="rec-trend-bar">
          ${seg(t.strongBuy, "#17c987")}${seg(t.buy, "#5fd9a8")}${seg(t.hold, "#7d8a9c")}${seg(t.sell, "#ff8a94")}${seg(t.strongSell, "#ff4757")}
        </div>
        <div style="font-family:var(--font-mono); color:var(--text-faint); width:26px; text-align:right">${total}</div>
      </div>`;
  }).filter(Boolean);

  recTrendChart.innerHTML = `<div class="rec-trend-row">${rows.join("")}</div>
    <div style="display:flex; gap:12px; margin-top:12px; flex-wrap:wrap; font-size:10.5px; color:var(--text-faint)">
      <span>🟢 Güçlü Al</span><span style="color:#5fd9a8">🟢 Al</span><span>⚪ Nötr</span><span style="color:#ff8a94">🔴 Sat</span><span style="color:#ff4757">🔴 Güçlü Sat</span>
    </div>`;
}

// ---------- Şirket Profili ----------
function renderCompanyProfile(f) {
  if (!f.businessSummary) { profileCard.style.display = "none"; return; }
  profileCard.style.display = "block";
  const metaParts = [];
  if (f.sector) metaParts.push(f.sector);
  if (f.industry) metaParts.push(f.industry);
  if (f.employees) metaParts.push(fmtNum(f.employees, 0) + " çalışan");
  profileMeta.textContent = metaParts.join(" · ");
  profileSummary.textContent = f.businessSummary;
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
async function loadRealized() { try { return await kvGet("realized"); } catch (e) { return []; } }
async function saveRealized(items) { await kvPost("realized", { items }); }

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

// Bir pozisyonun bir kısmını (veya tamamını) "sat" — realize edilmiş K/Z geçmişine kaydeder,
// kalan adedi günceller (0'a düşerse pozisyonu tamamen kaldırır).
async function sellPosition(symbol, currentPrice) {
  const pos = await loadPortfolio();
  const p = pos.find((x) => x.symbol === symbol);
  if (!p) return;

  const qtyStr = window.prompt(`${symbol} — kaç adet satmak istiyorsun? (Elindeki: ${p.qty})`, p.qty);
  if (qtyStr == null) return;
  const qty = parseFloat(qtyStr);
  if (!qty || qty <= 0 || qty > p.qty) { alert("Geçersiz adet."); return; }

  const priceStr = window.prompt(`${symbol} — satış fiyatını (₺) gir:`, currentPrice != null ? currentPrice.toFixed(2) : "");
  if (priceStr == null) return;
  const sellPrice = parseFloat(priceStr);
  if (!sellPrice || sellPrice <= 0) { alert("Geçersiz fiyat."); return; }

  const realizedPnL = qty * (sellPrice - p.cost);
  const realizedPct = p.cost ? ((sellPrice - p.cost) / p.cost) * 100 : 0;

  const realized = await loadRealized();
  realized.push({ symbol, qty, buyCost: p.cost, sellPrice, date: Date.now(), realizedPnL, realizedPct });
  await saveRealized(realized);

  p.qty -= qty;
  const newPositions = p.qty <= 0.0001 ? pos.filter((x) => x.symbol !== symbol) : pos;
  await savePortfolio(newPositions);

  renderPortfolio();
  renderRealized();
}

function renderRealized() {
  loadRealized().then((items) => {
    realizedEmpty.classList.toggle("visible", items.length === 0);
    if (items.length === 0) { realizedTableBody.innerHTML = ""; realizedSummary.innerHTML = ""; return; }

    const sorted = [...items].sort((a, b) => b.date - a.date);
    realizedTableBody.innerHTML = sorted.map((r, idx) => {
      const origIdx = items.indexOf(r);
      return '<tr><td class="symbol-cell clickable-symbol" onclick="goToStock(\'' + r.symbol + '\')">' + r.symbol + '</td><td>' + fmtNum(r.qty, 0) + '</td><td>' + fmtTL(r.buyCost) + '</td><td>' + fmtTL(r.sellPrice) + '</td><td>' + fmtDate(r.date) + '</td><td class="' + changeClass(r.realizedPnL) + '">' + (r.realizedPnL >= 0 ? "+" : "") + fmtTL(r.realizedPnL) + '</td><td class="' + changeClass(r.realizedPct) + '">' + fmtPct(r.realizedPct) + '</td><td><button class="remove-btn" data-idx="' + origIdx + '">Sil</button></td></tr>';
    }).join("");

    realizedTableBody.querySelectorAll(".remove-btn").forEach((b) => b.addEventListener("click", async () => {
      const idx = parseInt(b.dataset.idx, 10);
      const current = await loadRealized();
      current.splice(idx, 1);
      await saveRealized(current);
      renderRealized();
    }));

    const totalPnL = items.reduce((s, r) => s + r.realizedPnL, 0);
    const totalCost = items.reduce((s, r) => s + r.qty * r.buyCost, 0);
    const totalPct = totalCost ? (totalPnL / totalCost) * 100 : 0;
    realizedSummary.innerHTML = '<div class="summary-card"><div class="summary-label">Toplam Realize K/Z</div><div class="summary-value ' + changeClass(totalPnL) + '">' + (totalPnL >= 0 ? "+" : "") + fmtTL(totalPnL) + '</div></div><div class="summary-card"><div class="summary-label">Realize Getiri %</div><div class="summary-value ' + changeClass(totalPct) + '">' + fmtPct(totalPct) + '</div></div><div class="summary-card"><div class="summary-label">İşlem Sayısı</div><div class="summary-value">' + items.length + '</div></div>';
  });
}

async function fetchQuickPrice(sym) {
  const r = await fetchJSON(WORKER_URL + "/api/chart?symbol=" + sym + "&pass=" + encodeURIComponent(getPass()) + "&range=5d&interval=1d");
  if (r.error) throw new Error(r.error);
  const cr = r.data?.chart?.result?.[0]; if (!cr) throw new Error("veri yok");
  const meta = cr.meta || {}, closes = (cr.indicators.quote[0].close || []).filter((c) => c != null);
  const price = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const prev = closes[closes.length - 2] ?? price;
  return { price, dailyChangePct: prev ? ((price - prev) / prev) * 100 : 0 };
}

// "Detaylı Görünüm" — açıksa her pozisyon için tam veri (AL/SAT skoru dahil) çeker.
// Kapalıyken hafif (sadece fiyat) sorgu kullanılır, portföy ekranı hızlı kalır.
let portfolioDetailMode = false;
detailToggleBtn.addEventListener("click", () => {
  portfolioDetailMode = !portfolioDetailMode;
  detailToggleBtn.textContent = portfolioDetailMode ? "− Basit Görünüme Dön" : "+ Detaylı Görünüm (AL/SAT Skoru)";
  renderPortfolio();
});

let portfolioRowsData = [];
let portfolioSortState = { key: null, dir: 1 };

async function renderPortfolio() {
  const pos = await loadPortfolio();
  portfolioEmpty.classList.toggle("visible", pos.length === 0);
  portfolioTableBody.innerHTML = portfolioSummary.innerHTML = ""; donutSvg.innerHTML = donutLegend.innerHTML = "";

  const headEl = document.getElementById("portfolioTableHead");
  headEl.innerHTML = portfolioDetailMode
    ? '<tr><th class="sortable-th" data-key="symbol">Hisse</th><th class="sortable-th" data-key="qty">Adet</th><th class="sortable-th" data-key="cost">Maliyet</th><th class="sortable-th" data-key="price">Güncel</th><th class="sortable-th" data-key="value">Değer</th><th class="sortable-th" data-key="gain">K/Z (TL)</th><th class="sortable-th" data-key="gainPct">K/Z (%)</th><th>AL/SAT</th><th></th></tr>'
    : '<tr><th class="sortable-th" data-key="symbol">Hisse</th><th class="sortable-th" data-key="qty">Adet</th><th class="sortable-th" data-key="cost">Maliyet</th><th class="sortable-th" data-key="price">Güncel</th><th class="sortable-th" data-key="value">Değer</th><th class="sortable-th" data-key="gain">K/Z (TL)</th><th class="sortable-th" data-key="gainPct">K/Z (%)</th><th></th></tr>';
  bindSortableHeaders(headEl, portfolioSortState, () => renderPortfolioTableBody());

  renderRealized();
  if (pos.length === 0) { sectorBreakdownCard.style.display = "none"; portfolioRowsData = []; return; }

  const colspanEmpty = portfolioDetailMode ? 7 : 6;
  portfolioTableBody.innerHTML = pos.map((p) => '<tr><td class="symbol-cell clickable-symbol" onclick="goToStock(\'' + p.symbol + '\')">' + p.symbol + '</td><td colspan="' + colspanEmpty + '" style="color:var(--text-faint)">Yükleniyor...</td></tr>').join("");

  const results = await Promise.allSettled(pos.map((p) => (portfolioDetailMode ? fetchFullData(p.symbol) : fetchQuickPrice(p.symbol))));
  let tc = 0, tv = 0, tdc = 0; const alloc = [];
  portfolioRowsData = [];

  pos.forEach((p, i) => {
    const cv = p.qty * p.cost; tc += cv; const r = results[i];
    if (r.status === "fulfilled") {
      const price = portfolioDetailMode ? r.value.d.lastClose : r.value.price;
      const dailyChangePct = portfolioDetailMode ? r.value.d.changes.daily : r.value.dailyChangePct;
      const val = p.qty * price, gain = val - cv, gp = cv ? (gain / cv) * 100 : 0;
      tv += val; tdc += val - val / (1 + dailyChangePct / 100); alloc.push({ symbol: p.symbol, value: val });
      portfolioRowsData.push({ symbol: p.symbol, qty: p.qty, cost: p.cost, price, value: val, gain, gainPct: gp, recLabel: portfolioDetailMode ? r.value.rec.label : null, recCls: portfolioDetailMode ? r.value.rec.cls : null, error: false });
    } else {
      tv += cv;
      portfolioRowsData.push({ symbol: p.symbol, qty: p.qty, cost: p.cost, price: null, value: null, gain: null, gainPct: null, error: true });
    }
  });

  renderPortfolioTableBody();

  const tg = tv - tc, tgp = tc ? (tg / tc) * 100 : 0;
  portfolioSummary.innerHTML = '<div class="summary-card"><div class="summary-label">Toplam Değer</div><div class="summary-value">' + fmtTL(tv) + '</div></div><div class="summary-card"><div class="summary-label">Toplam Maliyet</div><div class="summary-value">' + fmtTL(tc) + '</div></div><div class="summary-card"><div class="summary-label">Kâr/Zarar</div><div class="summary-value ' + changeClass(tg) + '">' + (tg >= 0 ? "+" : "") + fmtTL(tg) + " (" + fmtPct(tgp) + ')</div></div><div class="summary-card"><div class="summary-label">Bugünkü Değişim</div><div class="summary-value ' + changeClass(tdc) + '">' + (tdc >= 0 ? "+" : "") + fmtTL(tdc) + " (" + fmtPct(tv ? (tdc / (tv - tdc)) * 100 : 0) + ")</div></div>";
  drawDonut([...alloc], tv);
  renderSectorBreakdown(alloc, tv);
  recordAndRenderPortfolioHistory(tv, tc);
}

function renderPortfolioTableBody() {
  const colspanEmpty = portfolioDetailMode ? 5 : 4;
  let rows = [...portfolioRowsData];
  if (portfolioSortState.key) {
    rows.sort((a, b) => {
      let av = a[portfolioSortState.key], bv = b[portfolioSortState.key];
      if (typeof av === "string") { av = av || ""; bv = bv || ""; return av.localeCompare(bv) * portfolioSortState.dir; }
      av = av == null ? -Infinity : av; bv = bv == null ? -Infinity : bv;
      return (av - bv) * portfolioSortState.dir;
    });
  }
  portfolioTableBody.innerHTML = rows.map((p) => {
    if (p.error) {
      return '<tr><td class="symbol-cell clickable-symbol" onclick="goToStock(\'' + p.symbol + '\')">' + p.symbol + "</td><td>" + fmtNum(p.qty, 0) + "</td><td>" + fmtTL(p.cost) + '</td><td colspan="' + colspanEmpty + '" style="color:var(--down)">Veri alınamadı</td><td><button class="remove-btn" data-symbol="' + p.symbol + '">Sil</button></td></tr>';
    }
    let detailCell = portfolioDetailMode ? '<td class="' + p.recCls + '" style="font-weight:700">' + p.recLabel + '</td>' : "";
    return '<tr><td class="symbol-cell clickable-symbol" onclick="goToStock(\'' + p.symbol + '\')">' + p.symbol + "</td><td>" + fmtNum(p.qty, 0) + "</td><td>" + fmtTL(p.cost) + "</td><td>" + fmtTL(p.price) + "</td><td>" + fmtTL(p.value) + '</td><td class="' + changeClass(p.gain) + '">' + (p.gain >= 0 ? "+" : "") + fmtTL(p.gain) + '</td><td class="' + changeClass(p.gainPct) + '">' + fmtPct(p.gainPct) + "</td>" + detailCell + '<td><button class="sell-btn" data-symbol="' + p.symbol + '" data-price="' + p.price + '">Sat</button><button class="remove-btn" data-symbol="' + p.symbol + '">Sil</button></td></tr>';
  }).join("");
  portfolioTableBody.querySelectorAll(".remove-btn").forEach((b) => b.addEventListener("click", () => removePosition(b.dataset.symbol)));
  portfolioTableBody.querySelectorAll(".sell-btn").forEach((b) => b.addEventListener("click", () => sellPosition(b.dataset.symbol, parseFloat(b.dataset.price))));
}

// Genel amaçlı: sıralanabilir tablo başlıklarına tıklama olayı bağlar
function bindSortableHeaders(headEl, sortState, onSort) {
  headEl.querySelectorAll(".sortable-th").forEach((th) => {
    // Orijinal etiketi bir kere data-label'a kaydediyoruz — her çağrıda textContent'ten
    // okumak, önceki ok işaretini de metne dahil edip üst üste eklenmesine (birikmesine) yol açardı.
    if (!th.dataset.label) th.dataset.label = th.textContent.trim();
    th.innerHTML = th.dataset.label + (sortState.key === th.dataset.key ? (sortState.dir === 1 ? ' <span class="sort-arrow">▲</span>' : ' <span class="sort-arrow">▼</span>') : "");
    th.onclick = () => {
      if (sortState.key === th.dataset.key) sortState.dir *= -1;
      else { sortState.key = th.dataset.key; sortState.dir = 1; }
      bindSortableHeaders(headEl, sortState, onSort);
      onSort();
    };
  });
}

// Portföyün sektörlere göre yoğunlaşmasını gösterir — aynı SECTOR_MAP'i kullanır, ek istek atmaz
function renderSectorBreakdown(alloc, total) {
  if (!total || alloc.length === 0) { sectorBreakdownCard.style.display = "none"; return; }
  sectorBreakdownCard.style.display = "block";

  const bySector = {};
  alloc.forEach((a) => {
    const sec = getSector(a.symbol);
    bySector[sec] = (bySector[sec] || 0) + a.value;
  });
  const sectorList = Object.entries(bySector).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value);

  sectorBreakdownRow.innerHTML = sectorList.map((s) => `
    <div class="money-sector-row" style="cursor:default">
      <div class="msr-top">
        <div><span class="msr-name">${s.name}</span></div>
        <div class="msr-right"><span class="msr-change" style="color:var(--text-dim)">${fmtTL(s.value)}</span><span class="msr-ratio normal">${fmtNum(s.pct, 0)}%</span></div>
      </div>
      <div class="msr-bar-wrap"><div class="msr-bar" style="width:${s.pct}%; background:var(--gold)"></div></div>
    </div>`).join("");

  const maxSector = sectorList[0];
  if (maxSector && maxSector.pct >= 40) {
    sectorConcentrationWarn.textContent = `⚠️ Portföyünün %${fmtNum(maxSector.pct, 0)}'i tek bir sektörde (${maxSector.name}) yoğunlaşmış — çeşitlendirmeyi düşünebilirsin.`;
  } else {
    sectorConcentrationWarn.textContent = "";
  }
}

// CSV dışa aktarma — tamamen tarayıcıda üretilir, ek istek yok
function downloadCsv(filename, headers, rows) {
  const escapeCsv = (v) => { const s = String(v ?? ""); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = [headers.map(escapeCsv).join(";"), ...rows.map((r) => r.map(escapeCsv).join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

portfolioCsvBtn.addEventListener("click", () => {
  if (portfolioRowsData.length === 0) { alert("Dışa aktarılacak pozisyon yok."); return; }
  const rows = portfolioRowsData.map((p) => [p.symbol, p.qty, p.cost, p.price ?? "", p.value ?? "", p.gain ?? "", p.gainPct != null ? fmtNum(p.gainPct, 2) : ""]);
  downloadCsv("portfoy_" + new Date().toISOString().slice(0, 10) + ".csv", ["Hisse", "Adet", "Maliyet", "Güncel Fiyat", "Değer", "K/Z (TL)", "K/Z (%)"], rows);
});

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
let watchlistRowsData = [];
let watchlistSortState = { key: null, dir: 1 };

async function renderWatchlist() {
  const items = await loadWatchlist(); watchlistEmpty.classList.toggle("visible", items.length === 0); watchlistTableBody.innerHTML = "";
  const headEl = document.getElementById("watchlistTable").querySelector("thead");
  bindSortableHeaders(headEl, watchlistSortState, () => renderWatchlistTableBody());
  if (items.length === 0) { watchlistRowsData = []; return; }
  const results = await Promise.allSettled(items.map((i) => fetchQuickPrice(i.symbol)));
  watchlistRowsData = items.map((item, idx) => {
    const r = results[idx];
    if (r.status === "fulfilled") {
      const { price, dailyChangePct } = r.value;
      const sinceAdded = item.addedPrice ? ((price - item.addedPrice) / item.addedPrice) * 100 : null;
      return { symbol: item.symbol, price, changePct: dailyChangePct, addedDate: item.addedAt, addedPrice: item.addedPrice, sinceAdded, error: false };
    }
    return { symbol: item.symbol, price: null, changePct: null, addedDate: item.addedAt, addedPrice: item.addedPrice, sinceAdded: null, error: true };
  });
  renderWatchlistTableBody();
}

function renderWatchlistTableBody() {
  let rows = [...watchlistRowsData];
  if (watchlistSortState.key) {
    rows.sort((a, b) => {
      let av = a[watchlistSortState.key], bv = b[watchlistSortState.key];
      if (typeof av === "string") { av = av || ""; bv = bv || ""; return av.localeCompare(bv) * watchlistSortState.dir; }
      av = av == null ? -Infinity : av; bv = bv == null ? -Infinity : bv;
      return (av - bv) * watchlistSortState.dir;
    });
  }
  watchlistTableBody.innerHTML = rows.map((item) => {
    if (item.error) return '<tr><td class="symbol-cell clickable-symbol" onclick="goToStock(\'' + item.symbol + '\')">' + item.symbol + '</td><td colspan="5" style="color:var(--down)">Veri alınamadı</td><td><button class="remove-btn" data-symbol="' + item.symbol + '">Çıkar</button></td></tr>';
    return '<tr><td class="symbol-cell clickable-symbol" onclick="goToStock(\'' + item.symbol + '\')">' + item.symbol + "</td><td>" + fmtTL(item.price) + '</td><td class="' + changeClass(item.changePct) + '">' + fmtPct(item.changePct) + "</td><td>" + fmtDate(item.addedDate) + "</td><td>" + fmtTL(item.addedPrice) + '</td><td class="' + changeClass(item.sinceAdded) + '">' + (item.sinceAdded != null ? fmtPct(item.sinceAdded) : "—") + '</td><td><button class="remove-btn" data-symbol="' + item.symbol + '">Çıkar</button></td></tr>';
  }).join("");
  watchlistTableBody.querySelectorAll(".remove-btn").forEach((b) => b.addEventListener("click", () => removeWatchlistItem(b.dataset.symbol)));
}

watchlistCsvBtn.addEventListener("click", () => {
  if (watchlistRowsData.length === 0) { alert("Dışa aktarılacak hisse yok."); return; }
  const rows = watchlistRowsData.map((i) => [i.symbol, i.price ?? "", i.changePct != null ? fmtNum(i.changePct, 2) : "", fmtDate(i.addedDate), i.addedPrice ?? "", i.sinceAdded != null ? fmtNum(i.sinceAdded, 2) : ""]);
  downloadCsv("takip_listesi_" + new Date().toISOString().slice(0, 10) + ".csv", ["Hisse", "Güncel Fiyat", "Günlük Değişim (%)", "Eklenme Tarihi", "Eklenme Fiyatı", "Eklenmeden Beri (%)"], rows);
});

// ==========================================================================
// 13) KARŞILAŞTIRMA
// ==========================================================================
cmpBtn.addEventListener("click", runCompare);
[cmpSymbol1, cmpSymbol2, cmpSymbol3, cmpSymbol4].forEach((el) => el.addEventListener("keydown", (e) => { if (e.key === "Enter") runCompare(); }));
async function fetchFullData(sym) {
  const pass = getPass();
  const [cr, qr] = await Promise.all([fetchJSON(WORKER_URL + "/api/chart?symbol=" + sym + "&pass=" + encodeURIComponent(pass)), fetchJSON(WORKER_URL + "/api/quote?symbol=" + sym + "&pass=" + encodeURIComponent(pass))]);
  if (cr.error || qr.error) throw new Error(cr.error || qr.error);
  const chartR = cr.data?.chart?.result?.[0]; if (!chartR || !chartR.timestamp) throw new Error('"' + sym + '" bulunamadı.');
  const d = processChartData(chartR), f = processFundamentals(qr.data);
  applyReliableDailyChange(d, f);
  return { symbol: sym, d, f, rec: computeRecommendation(d, f), val: computeValuationScore(f) };
}
async function runCompare() {
  cmpError.textContent = "";
  const syms = [cmpSymbol1.value, cmpSymbol2.value, cmpSymbol3.value, cmpSymbol4.value].map((v) => v.toUpperCase().trim().replace(/[^A-Z0-9]/g, "")).filter(Boolean);
  if (syms.length < 2) { cmpError.textContent = "En az 2 hisse gir."; return; }
  if (syms.length > 4) { cmpError.textContent = "En fazla 4 hisse karşılaştırabilirsin."; return; }
  cmpResultCard.style.display = "none"; cmpLoading.classList.add("active");
  try {
    const results = await Promise.all(syms.map((s) => fetchFullData(s)));
    renderCompareTable(results);
    cmpLoading.classList.remove("active");
    cmpResultCard.style.display = "block"; // ÖNCE görünür yap...
    renderCompareChart(results); // ...SONRA grafiği çiz (aksi halde container 0 genişlik ölçer)
  } catch (err) { cmpLoading.classList.remove("active"); cmpError.textContent = err.message; }
}
function buildMetricRow(label, results, getValue, formatter, higherIsBetter) {
  const vals = results.map((r) => getValue(r)), valid = vals.filter((v) => v != null && !isNaN(v));
  let best = null; if (valid.length > 1) best = higherIsBetter ? Math.max(...valid) : Math.min(...valid);
  return "<tr><td>" + label + "</td>" + vals.map((v) => '<td class="' + (best != null && v === best ? "best-value" : "") + '">' + formatter(v) + "</td>").join("") + "</tr>";
}
function renderCompareTable(results) {
  const hdr = "<tr><th>Metrik</th>" + results.map((r) => '<th class="symbol-cell clickable-symbol" onclick="goToStock(\'' + r.symbol + '\')">' + r.symbol + "</th>").join("") + "</tr>";
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

// Normalize edilmiş (yüzdesel) performans grafiği — her hissenin serinin ilk gününe göre
// % değişimini üst üste çizer. Zaten çekilmiş olan 1 yıllık veriyi kullanır, ek istek atmaz.
function renderCompareChart(results) {
  cmpChartEl.innerHTML = "";
  if (cmpChartApi) { cmpChartApi.remove(); cmpChartApi = null; }
  const light = isLightTheme();

  cmpChartApi = LightweightCharts.createChart(cmpChartEl, {
    height: 320,
    layout: { background: { color: "transparent" }, textColor: light ? "#566072" : "#7d8a9c", fontFamily: "JetBrains Mono, monospace" },
    grid: { vertLines: { color: light ? "#e4e7ec" : "#1a1f29" }, horzLines: { color: light ? "#e4e7ec" : "#1a1f29" } },
    timeScale: { borderColor: light ? "#dde1e7" : "#232a36" },
    rightPriceScale: { borderColor: light ? "#dde1e7" : "#232a36" },
  });

  const colors = ["#d4af37", "#4098d7", "#17c987", "#ff4757"];
  results.forEach((r, i) => {
    const candles = r.d.candles;
    if (!candles || candles.length === 0) return;
    const firstClose = candles[0].close;
    const series = cmpChartApi.addLineSeries({ color: colors[i % colors.length], lineWidth: 2, title: r.symbol });
    series.setData(candles.map((c) => ({ time: c.time, value: firstClose ? ((c.close - firstClose) / firstClose) * 100 : 0 })));
  });

  cmpChartApi.timeScale().fitContent();
}

// ==========================================================================
// 12) TRENDLER — BIST 100 içinde en çok yükselen / düşen / en yüksek hacimli 5 hisse
// ==========================================================================
// NOT: BIST 100 endeks içeriği 3 ayda bir (Ocak-Mart, Nisan-Haziran, Temmuz-Eylül,
// Ekim-Aralık dönemleri başında) güncellenir. Bu listeyi arada bir kontrol edip
// güncellemek gerekebilir (kaynak: Borsa İstanbul / KAP duyuruları).
const BIST100_SYMBOLS = [
  "AGHOL","AGROT","AHGAZ","AKBNK","AKSA","AKSEN","ALARK","ALFAS","ALTNY","ANSGR",
  "AEFES","ANHYT","ARCLK","ARDYZ","ASELS","ASTOR","AVPGY","BTCIM","BSOKE","BERA",
  "BIMAS","BRSAN","BRYAT","CCOLA","CWENE","CANTE","CLEBI","CIMSA","DOHOL","DOAS",
  "DSTKF","EFORC","EGEEN","ECILC","EKGYO","ENJSA","ENERY","ENKAI","EREGL","EUPWR","FROTO",
  "GSRAY","GESAN","GOLTS","GRTHO","GUBRF","SAHOL","HEKTS","IEYHO","ISMEN","KRDMD",
  "KARSN","KTLEV","KCAER","KCHOL","KONTR","KONYA","KOZAL","KOZAA","LMKDC","MAGEN",
  "MAVI","MIATK","MGROS","MPARK","OBAMS","ODAS","OTKAR","OYAKC","PASEU","PGSUS",
  "PETKM","RALYH","REEDR","RYGYO","SASA","SELEC","SMRTG","SKBNK","SOKM","TABGD",
  "TAVHL","TKFEN","TOASO","TCELL","TUPRS","THYAO","GARAN","HALKB","ISCTR","TSKB",
  "TURSG","SISE","VAKBN","TTKOM","TTRAK","ULKER","VESTL","YKBNK","YEOTK","ZOREN",
];
// BIST 30 — en büyük/likit 30 hisse (BIST 100'ün alt kümesi). 3 ayda bir güncellenebilir.
const BIST30_SYMBOLS = [
  "EREGL","KRDMD","AKBNK","GARAN","ISCTR","YKBNK","ASTOR","DSTKF","EKGYO","BIMAS",
  "MGROS","ULKER","KCHOL","SAHOL","AEFES","TCELL","TTKOM","ENKAI","GUBRF","PETKM",
  "SASA","SISE","TUPRS","KOZAL","FROTO","TOASO","ASELS","PGSUS","TAVHL","THYAO",
];
const TRENDS_TOP_N = 5;

trendsRefreshBtn.addEventListener("click", runTrendsScan);

// Tek bir hisse için hafif veri: güncel fiyat, günlük değişim %, günlük hacim (TL)
// Yahoo'nun v7/finance/quote (toplu) ucundan bir grup hissenin anlık verisini çeker.
// Bu uç, Yahoo'nun KENDİ hesapladığı %değişimi (regularMarketChangePercent) doğrudan döner —
// bizim grafik verisinden manuel hesaplamamıza göre daha güvenilirdir (bazen grafik verisinde
// eksik/gecikmeli günler olabildiğini KCHOL/AKBNK örneklerinde görmüştük).
async function fetchQuoteBatch(symbols) {
  const pass = localStorage.getItem(LS_PASS_KEY) || "";
  const res = await fetchJSON(`${WORKER_URL}/api/quotebatch?symbols=${symbols.join(",")}&pass=${encodeURIComponent(pass)}`);
  if (res.error) throw new Error(res.error);
  const list = res.data?.quoteResponse?.result || [];
  return list
    .map((q) => ({
      symbol: (q.symbol || "").replace(".IS", ""),
      price: q.regularMarketPrice,
      changePct: q.regularMarketChangePercent,
      volumeTL: (q.regularMarketVolume || 0) * (q.regularMarketPrice || 0),
      week52High: q.fiftyTwoWeekHigh ?? null,
      week52Low: q.fiftyTwoWeekLow ?? null,
      avgVolume: q.averageDailyVolume10Day ?? q.averageDailyVolume3Month ?? null,
      volume: q.regularMarketVolume ?? null,
    }))
    .filter((p) => p.price != null);
}

// Çok sayıda isteği tek seferde Yahoo'ya patlatmamak için küçük gruplar halinde işliyoruz
async function fetchInBatches(items, batchSize, fn, onProgress) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    let batchResults = await Promise.allSettled(batch.map(fn));

    // Bu grupta başarısız olanlar için kısa bir bekleme sonrası TEK SEFER yeniden dene
    // (Yahoo/Worker tarafındaki geçici (502 vb.) hataların sonucu etkilemesini azaltır)
    const failedIdx = batchResults.map((r, idx) => (r.status === "rejected" ? idx : -1)).filter((i2) => i2 !== -1);
    if (failedIdx.length > 0) {
      await new Promise((r) => setTimeout(r, 400));
      const retryResults = await Promise.allSettled(failedIdx.map((idx) => fn(batch[idx])));
      failedIdx.forEach((idx, k) => { batchResults[idx] = retryResults[k]; });
    }

    results.push(...batchResults);
    if (onProgress) onProgress(Math.min(i + batchSize, items.length), items.length);
  }
  return results;
}

async function runTrendsScan() {
  trendsError.textContent = "";
  trendsResults.style.display = "none";
  trendsRefreshBtn.disabled = true;
  trendsLoading.classList.add("active");
  trendsLoadingText.textContent = `TARANIYOR... (0 / ${BIST100_SYMBOLS.length})`;

  try {
    // BIST 100'ü 25'erli gruplar halinde toplu sorguluyoruz (tek istekte hepsi de olurdu
    // ama URL uzunluğu ve olası kısmi hatalara karşı gruplamak daha güvenli)
    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < BIST100_SYMBOLS.length; i += chunkSize) chunks.push(BIST100_SYMBOLS.slice(i, i + chunkSize));

    let points = [];
    let failedCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      trendsLoadingText.textContent = `TARANIYOR... (${i * chunkSize} / ${BIST100_SYMBOLS.length})`;
      try {
        const chunkPoints = await fetchQuoteBatch(chunks[i]);
        points.push(...chunkPoints);
      } catch (e) {
        // Bu grup başarısız olursa bir kez daha dene, olmazsa o grubu atla
        try {
          await new Promise((r) => setTimeout(r, 500));
          const retryPoints = await fetchQuoteBatch(chunks[i]);
          points.push(...retryPoints);
        } catch (e2) {
          failedCount += chunks[i].length;
        }
      }
    }

    if (points.length === 0) throw new Error("Hiçbir hisse verisi alınamadı. Worker/Yahoo bağlantısını kontrol et.");

    // BIST'te bir günde %30'u aşan bir hareket pratikte olağan değil (uzun süreli işlem
    // durdurma sonrası ilk seans gibi istisnalar hariç) — bu yüzden Yükselen/Düşen/Piyasa
    // Nabzı gibi "en iyi/en kötü" listelerinde bu tür şüpheli veriler dışarıda tutulur.
    // Yine de Isı Haritası'nda (uyarı işaretiyle) tüm hisseler gösterilmeye devam eder.
    const SANITY_LIMIT = 30;
    const reliablePoints = points.filter((p) => Math.abs(p.changePct) <= SANITY_LIMIT);

    const gainers = [...reliablePoints].sort((a, b) => b.changePct - a.changePct).slice(0, TRENDS_TOP_N);
    const losers = [...reliablePoints].sort((a, b) => a.changePct - b.changePct).slice(0, TRENDS_TOP_N);
    const byVolume = [...points].sort((a, b) => b.volumeTL - a.volumeTL).slice(0, TRENDS_TOP_N);

    renderTrendsTable(trendsGainersTable, gainers, true);
    renderTrendsTable(trendsLosersTable, losers, true);
    renderTrendsTable(trendsVolumeTable, byVolume, true, true);
    renderMarketPulse(points);
    renderHeatmap(points);
    renderVolumeHeatmap(points);
    render52WeekBreakouts(points);
    renderBist30PeakDistance(points);

    // Özet ekranının "Piyasa Nabzı" mini widget'ı bu son taramayı yeniden kullanır — ek istek atmaz.
    lastTrendsPoints = points;
    lastTrendsScanTime = Date.now();

    trendsLoading.classList.remove("active");
    trendsResults.style.display = "block";

    if (failedCount > 0) {
      trendsError.textContent = `${failedCount} hisse için veri alınamadı (atlandı), ${points.length} hisse başarıyla tarandı.`;
    }
  } catch (err) {
    trendsLoading.classList.remove("active");
    trendsError.textContent = err.message || "Tarama sırasında bir hata oluştu.";
  } finally {
    trendsRefreshBtn.disabled = false;
  }
}

function renderTrendsTable(tableEl, list, showChange, showVolume) {
  const headCells = ["Hisse", "Fiyat"];
  if (showChange) headCells.push("Değişim");
  if (showVolume) headCells.push("Hacim (TL)");
  const head = `<thead><tr>${headCells.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;

  const rows = list.map((p) => {
    const cells = [
      `<td class="symbol-cell clickable-symbol" onclick="goToStock('${p.symbol}')">${p.symbol}</td>`,
      `<td>${fmtTL(p.price)}</td>`,
    ];
    if (showChange) cells.push(`<td class="${changeClass(p.changePct)}">${fmtPct(p.changePct)}</td>`);
    if (showVolume) cells.push(`<td>${fmtCompactTL(p.volumeTL)}</td>`);
    return `<tr>${cells.join("")}</tr>`;
  });

  tableEl.innerHTML = head + `<tbody>${rows.join("")}</tbody>`;
}

// ==========================================================================
// 13) PİYASA NABZI + ISI HARİTASI — Trendler taramasındaki AYNI veriyi kullanır,
// ekstra istek atmaz.
// ==========================================================================
function renderMarketPulse(points) {
  const up = points.filter((p) => p.changePct > 0.05).length;
  const down = points.filter((p) => p.changePct < -0.05).length;
  const flat = points.length - up - down;
  // Ortalama değişim, imkansız derecede büyük (%30+) tekil değerlerin ortalamayı
  // bozmaması için "güvenilir" (şüpheli olmayan) hisselerden hesaplanıyor.
  const reliable = points.filter((p) => Math.abs(p.changePct) <= 30);
  const avgChange = reliable.length ? reliable.reduce((s, p) => s + p.changePct, 0) / reliable.length : 0;

  const upPct = (up / points.length) * 100;
  const downPct = (down / points.length) * 100;
  const flatPct = 100 - upPct - downPct;

  pulseRow.innerHTML = `
    <div class="pulse-stat up"><div class="pulse-num">${up}</div><div class="pulse-label">Yükselen</div></div>
    <div class="pulse-stat down"><div class="pulse-num">${down}</div><div class="pulse-label">Düşen</div></div>
    <div class="pulse-stat flat"><div class="pulse-num">${flat}</div><div class="pulse-label">Sabit</div></div>
    <div class="pulse-stat ${changeClass(avgChange)}"><div class="pulse-num">${fmtPct(avgChange)}</div><div class="pulse-label">Ortalama Değişim</div></div>
    <div class="pulse-bar">
      <div style="width:${upPct}%; background:var(--up)"></div>
      <div style="width:${flatPct}%; background:var(--text-faint)"></div>
      <div style="width:${downPct}%; background:var(--down)"></div>
    </div>
  `;
}

function renderHeatmap(points) {
  // Değişime göre büyükten küçüğe sıralayıp ısı haritasını daha okunaklı hale getiriyoruz
  const sorted = [...points].sort((a, b) => b.changePct - a.changePct);

  // ÖNEMLİ: Renk yoğunluğunu veri setindeki gerçek maksimuma göre değil, SABİT bir tavana
  // (%15) göre normalize ediyoruz. Aksi halde tek bir anormal/hatalı değer (örn. Yahoo'nun
  // kendi verisinde nadiren görülen bir hata sonucu -%73 gibi imkansız bir sayı), tüm diğer
  // hisselerin rengini "soluklaştırıp" ısı haritasını yanıltıcı hale getirebiliyordu.
  const COLOR_CEILING = 15;
  // BIST'te tek günde bu sınırı aşan bir hareket pratikte imkansıza yakındır (uzun süreli
  // işlem durdurmadan sonra ilk seans hariç) — bu yüzden bu sınırın üzerini "şüpheli veri"
  // olarak ayrıca işaretliyoruz, gizlemiyoruz ama uyarıyoruz.
  const SANITY_LIMIT = 30;

  heatmapGrid.innerHTML = sorted
    .map((p) => {
      const isSuspect = Math.abs(p.changePct) > SANITY_LIMIT;
      const intensity = Math.min(1, Math.abs(p.changePct) / COLOR_CEILING);
      const color = p.changePct >= 0
        ? lerpColor("#1a2e28", "#17c987", intensity)
        : lerpColor("#2e1a1e", "#ff4757", intensity);
      const border = isSuspect ? "border:2px dashed #d4af37;" : "";
      const warn = isSuspect ? ' <span title="Bu değer olağan dışı — Yahoo verisinde bir hata olabilir, teyit et.">⚠️</span>' : "";
      const titleText = isSuspect
        ? `${p.symbol}: ${fmtPct(p.changePct)} (ŞÜPHELİ VERİ — bu kadar büyük bir günlük hareket BIST'te olağan değil, teyit etmeden güvenme)`
        : `${p.symbol}: ${fmtPct(p.changePct)}`;
      return `<div class="heatmap-cell" style="background:${color};${border}" title="${titleText}" onclick="goToStock('${p.symbol}')">
        <div class="hc-symbol">${p.symbol}${warn}</div>
        <div class="hc-change">${fmtPct(p.changePct, 1)}</div>
      </div>`;
    })
    .join("");
}

// Hacim Isı Haritası (TL) — kutu BOYUTU hacme (TL), kutu RENGİ günlük değişim yönüne göre.
// En yüksek hacimden en düşüğe sıralanır; kutu alanı hacimle orantılıdır (kenar uzunluğu
// değil alan orantılı olsun diye karekök ölçekleme kullanılır — bu, büyüklüğü göze doğru yansıtır).
function renderVolumeHeatmap(points) {
  const withVolume = points.filter((p) => p.volumeTL != null && p.volumeTL > 0);
  const sorted = [...withVolume].sort((a, b) => b.volumeTL - a.volumeTL);
  if (sorted.length === 0) { volumeHeatmapGrid.innerHTML = ""; return; }

  const maxVol = sorted[0].volumeTL;
  const MIN_PX = 56, MAX_PX = 168;
  const COLOR_CEILING = 15;

  volumeHeatmapGrid.innerHTML = sorted
    .map((p) => {
      const ratio = Math.sqrt(p.volumeTL / maxVol); // alan orantılı olsun diye karekök
      const size = Math.round(MIN_PX + ratio * (MAX_PX - MIN_PX));
      const intensity = Math.min(1, Math.abs(p.changePct) / COLOR_CEILING);
      const color = p.changePct >= 0
        ? lerpColor("#1a2e28", "#17c987", intensity)
        : lerpColor("#2e1a1e", "#ff4757", intensity);
      const fontScale = Math.max(10, Math.min(15, size / 10));
      return `<div class="volume-heatmap-cell" style="width:${size}px; height:${size}px; background:${color}"
        title="${p.symbol}: ${fmtCompactTL(p.volumeTL)} hacim, ${fmtPct(p.changePct)}"
        onclick="goToStock('${p.symbol}')">
        <div class="vhc-symbol" style="font-size:${fontScale}px">${p.symbol}</div>
        <div class="vhc-volume" style="font-size:${Math.max(8.5, fontScale - 3)}px">${fmtCompactTL(p.volumeTL)}</div>
      </div>`;
    })
    .join("");
}

// 52 hafta zirvesine/dibine yakın veya kıran hisseler — aynı hafif taramanın verisini kullanır (ek istek yok)
function render52WeekBreakouts(points) {
  const withHigh = points.filter((p) => p.week52High && p.week52High > 0);
  const withLow = points.filter((p) => p.week52Low && p.week52Low > 0);

  const nearHigh = withHigh
    .map((p) => ({ ...p, ratio: p.price / p.week52High }))
    .filter((p) => p.ratio >= 0.97)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, TRENDS_TOP_N);

  const nearLow = withLow
    .map((p) => ({ ...p, ratio: p.price / p.week52Low }))
    .filter((p) => p.ratio <= 1.03)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, TRENDS_TOP_N);

  trends52HighEmpty.classList.toggle("visible", nearHigh.length === 0);
  trends52LowEmpty.classList.toggle("visible", nearLow.length === 0);

  trends52HighTable.innerHTML = nearHigh.length === 0 ? "" :
    "<thead><tr><th>Hisse</th><th>Fiyat</th><th>52H Yüksek</th><th>Fark</th></tr></thead><tbody>" +
    nearHigh.map((p) => {
      const diff = (p.ratio - 1) * 100;
      const tag = p.price >= p.week52High ? ' <span class="status-tag buy">Yeni Zirve!</span>' : "";
      return `<tr><td class="symbol-cell clickable-symbol" onclick="goToStock('${p.symbol}')">${p.symbol}${tag}</td><td>${fmtTL(p.price)}</td><td>${fmtTL(p.week52High)}</td><td class="${changeClass(diff)}">${fmtPct(diff)}</td></tr>`;
    }).join("") + "</tbody>";

  trends52LowTable.innerHTML = nearLow.length === 0 ? "" :
    "<thead><tr><th>Hisse</th><th>Fiyat</th><th>52H Düşük</th><th>Fark</th></tr></thead><tbody>" +
    nearLow.map((p) => {
      const diff = (p.ratio - 1) * 100;
      const tag = p.price <= p.week52Low ? ' <span class="status-tag sell">Yeni Dip!</span>' : "";
      return `<tr><td class="symbol-cell clickable-symbol" onclick="goToStock('${p.symbol}')">${p.symbol}${tag}</td><td>${fmtTL(p.price)}</td><td>${fmtTL(p.week52Low)}</td><td class="${changeClass(diff)}">${fmtPct(diff)}</td></tr>`;
    }).join("") + "</tbody>";
}

// BIST 30 - Zirveden Uzaklık: aynı hafif taramanın (BIST 100) verisinden BIST 30 hisselerini
// filtreler, ekstra istek atmaz. Formül: (52H Yüksek - Güncel) / Güncel × 100
// (örn. 90₺ görmüş, şu an 60₺ ise: (90-60)/60*100 = %50 uzakta)
function renderBist30PeakDistance(points) {
  const bist30Points = points.filter((p) => BIST30_SYMBOLS.includes(p.symbol) && p.week52High && p.week52High > 0);
  const ranked = bist30Points
    .map((p) => ({ ...p, distPct: ((p.week52High - p.price) / p.price) * 100 }))
    .sort((a, b) => b.distPct - a.distPct);

  if (ranked.length === 0) { bist30PeakTable.innerHTML = ""; return; }

  bist30PeakTable.innerHTML = "<thead><tr><th>Hisse</th><th>Güncel Fiyat</th><th>Günlük Değişim</th><th>Hacim (TL)</th><th>52H Zirve</th><th>Zirveden Uzaklık</th></tr></thead><tbody>" +
    ranked.map((p) => {
      const tag = p.distPct < 2 ? ' <span class="status-tag buy">Zirveye Yakın</span>' : "";
      return `<tr><td class="symbol-cell clickable-symbol" onclick="goToStock('${p.symbol}')">${p.symbol}${tag}</td><td>${fmtTL(p.price)}</td><td class="${changeClass(p.changePct)}">${fmtPct(p.changePct)}</td><td>${fmtCompactTL(p.volumeTL)}</td><td>${fmtTL(p.week52High)}</td><td class="${changeClass(-p.distPct)}">${fmtNum(p.distPct)}%</td></tr>`;
    }).join("") + "</tbody>";
}

// ==========================================================================
// 14) DETAYLI TARA (opsiyonel, ağır) — Piyasa Değeri Bazlı Sıralama + AL/SAT Skor Dağılımı
// fetchFullData'yı (Karşılaştırma ekranıyla aynı fonksiyon) BIST 100'ün tamamına uygular.
// Normal Trendler taramasından çok daha ağırdır, bu yüzden ayrı ve opsiyonel bir buton.
// ==========================================================================
deepScanBtn.addEventListener("click", runDeepScan);

async function runDeepScan() {
  deepScanError.textContent = "";
  deepScanResults.style.display = "none";
  deepScanBtn.disabled = true;
  deepScanLoading.classList.add("active");
  deepScanLoadingText.textContent = `DETAYLI TARANIYOR... (0 / ${BIST100_SYMBOLS.length})`;

  try {
    const settled = await fetchInBatches(BIST100_SYMBOLS, 5, fetchFullData, (done, total) => {
      deepScanLoadingText.textContent = `DETAYLI TARANIYOR... (${done} / ${total})`;
    });

    const results = settled.filter((r) => r.status === "fulfilled").map((r) => r.value);
    if (results.length === 0) throw new Error("Hiçbir hisse verisi alınamadı.");

    renderDeepScanMcap(results);
    renderGaugeDistribution(results);

    deepScanLoading.classList.remove("active");
    deepScanResults.style.display = "block";

    const failedCount = settled.length - results.length;
    if (failedCount > 0) {
      deepScanError.textContent = `${failedCount} hisse için veri alınamadı (atlandı), ${results.length} hisse başarıyla tarandı.`;
    }
  } catch (err) {
    deepScanLoading.classList.remove("active");
    deepScanError.textContent = err.message || "Detaylı tarama sırasında bir hata oluştu.";
  } finally {
    deepScanBtn.disabled = false;
  }
}

function renderDeepScanMcap(results) {
  const withMcap = results.filter((r) => r.f.marketCap != null && r.f.marketCap > 0);
  const ranked = withMcap
    .map((r) => ({ symbol: r.symbol, marketCap: r.f.marketCap, changePct: r.d.changes.daily, valueChangeTL: r.f.marketCap * (r.d.changes.daily / 100) }))
    .sort((a, b) => b.valueChangeTL - a.valueChangeTL)
    .slice(0, TRENDS_TOP_N);

  deepScanMcapTable.innerHTML = "<thead><tr><th>Hisse</th><th>Piyasa Değeri</th><th>Günlük %</th><th>Tahmini Değer Artışı</th></tr></thead><tbody>" +
    ranked.map((r) => `<tr><td class="symbol-cell clickable-symbol" onclick="goToStock('${r.symbol}')">${r.symbol}</td><td>${fmtCompactTL(r.marketCap)}</td><td class="${changeClass(r.changePct)}">${fmtPct(r.changePct)}</td><td class="${changeClass(r.valueChangeTL)}">${r.valueChangeTL >= 0 ? "+" : ""}${fmtCompactTL(r.valueChangeTL)}</td></tr>`).join("") +
    "</tbody>";
}

function renderGaugeDistribution(results) {
  const bands = [
    { label: "GÜÇLÜ AL", cls: "strong-buy", color: "#17c987" },
    { label: "AL", cls: "buy", color: "#5fd9a8" },
    { label: "NÖTR", cls: "neutral", color: "#7d8a9c" },
    { label: "SAT", cls: "sell", color: "#ff8a94" },
    { label: "GÜÇLÜ SAT", cls: "strong-sell", color: "#ff4757" },
  ];
  const groups = bands.map((b) => results.filter((r) => r.rec.label === b.label));
  const maxCount = Math.max(1, ...groups.map((g) => g.length));

  gaugeDistRow.innerHTML = bands.map((b, i) => {
    const symbolsHtml = groups[i]
      .sort((a, b2) => b2.rec.score - a.rec.score)
      .map((r) => `<span class="dist-symbol clickable-symbol" onclick="goToStock('${r.symbol}')">${r.symbol}</span>`)
      .join("");
    return `
    <div class="dist-row-wrap">
      <div class="dist-row" onclick="this.nextElementSibling.classList.toggle('open')">
        <div class="dist-label">${b.label}</div>
        <div class="dist-bar-wrap"><div class="dist-bar" style="width:${(groups[i].length / maxCount) * 100}%; background:${b.color}"></div></div>
        <div class="dist-count">${groups[i].length}</div>
      </div>
      <div class="dist-symbols">${symbolsHtml || '<span class="sub-note">Bu bantta hisse yok.</span>'}</div>
    </div>`;
  }).join("");
}

// ==========================================================================
// 15) PARA NEREDE — BIST 100'ü kaba sektörlere ayırıp hacim anormalliğini gösterir.
// Trendler'in kullandığı AYNI toplu sorgu ucunu (quotebatch) kullanır, ekstra
// bir Yahoo endpoint'i gerekmez. Formül: bugünkü hacim / normal (10 günlük ort.) hacim.
// NOT: Sektör eşleştirmesi Yahoo'dan gelmiyor, elle hazırlanmış bir listedir —
// BIST 100 bileşenleri değiştikçe bu haritanın da güncellenmesi gerekebilir.
// ==========================================================================
const SECTOR_MAP = {
  AKBNK: "Bankacılık", GARAN: "Bankacılık", HALKB: "Bankacılık", ISCTR: "Bankacılık",
  TSKB: "Bankacılık", VAKBN: "Bankacılık", YKBNK: "Bankacılık", SKBNK: "Bankacılık",

  AGHOL: "Holding", ALARK: "Holding", DOHOL: "Holding", KCHOL: "Holding", SAHOL: "Holding",
  TKFEN: "Holding", BRYAT: "Holding", GRTHO: "Holding", IEYHO: "Holding",

  FROTO: "Otomotiv & Yan Sanayi", TOASO: "Otomotiv & Yan Sanayi", DOAS: "Otomotiv & Yan Sanayi",
  OTKAR: "Otomotiv & Yan Sanayi", KARSN: "Otomotiv & Yan Sanayi", TTRAK: "Otomotiv & Yan Sanayi",
  BERA: "Otomotiv & Yan Sanayi", EGEEN: "Otomotiv & Yan Sanayi",

  EREGL: "Sanayi, Metal & Cam", KRDMD: "Sanayi, Metal & Cam", BRSAN: "Sanayi, Metal & Cam",
  KOZAL: "Sanayi, Metal & Cam", KOZAA: "Sanayi, Metal & Cam", KCAER: "Sanayi, Metal & Cam",
  SISE: "Sanayi, Metal & Cam", ALTNY: "Sanayi, Metal & Cam",

  SASA: "Kimya, Petrokimya & Çimento", PETKM: "Kimya, Petrokimya & Çimento", GUBRF: "Kimya, Petrokimya & Çimento",
  AKSA: "Kimya, Petrokimya & Çimento", HEKTS: "Kimya, Petrokimya & Çimento", CIMSA: "Kimya, Petrokimya & Çimento",
  BTCIM: "Kimya, Petrokimya & Çimento", BSOKE: "Kimya, Petrokimya & Çimento", CANTE: "Kimya, Petrokimya & Çimento",
  GOLTS: "Kimya, Petrokimya & Çimento", KONYA: "Kimya, Petrokimya & Çimento", OYAKC: "Kimya, Petrokimya & Çimento",
  LMKDC: "Kimya, Petrokimya & Çimento",

  AHGAZ: "Enerji", AKSEN: "Enerji", ALFAS: "Enerji", ASTOR: "Enerji", AVPGY: "Enerji",
  CWENE: "Enerji", ENJSA: "Enerji", ENERY: "Enerji", EUPWR: "Enerji", GESAN: "Enerji",
  KTLEV: "Enerji", MAGEN: "Enerji", ODAS: "Enerji", SELEC: "Enerji", SMRTG: "Enerji",
  TUPRS: "Enerji", YEOTK: "Enerji", ZOREN: "Enerji",

  THYAO: "Havacılık & Turizm", PGSUS: "Havacılık & Turizm", TAVHL: "Havacılık & Turizm", CLEBI: "Havacılık & Turizm",

  BIMAS: "Perakende & Tüketim", MGROS: "Perakende & Tüketim", SOKM: "Perakende & Tüketim",
  ULKER: "Perakende & Tüketim", CCOLA: "Perakende & Tüketim", AEFES: "Perakende & Tüketim",
  ARCLK: "Perakende & Tüketim", VESTL: "Perakende & Tüketim", MAVI: "Perakende & Tüketim", TABGD: "Perakende & Tüketim",

  ASELS: "Teknoloji, Savunma & İletişim", TCELL: "Teknoloji, Savunma & İletişim", TTKOM: "Teknoloji, Savunma & İletişim",
  ARDYZ: "Teknoloji, Savunma & İletişim", KONTR: "Teknoloji, Savunma & İletişim", EFORC: "Teknoloji, Savunma & İletişim",
  REEDR: "Teknoloji, Savunma & İletişim", OBAMS: "Teknoloji, Savunma & İletişim",

  EKGYO: "GYO & İnşaat", RYGYO: "GYO & İnşaat", ENKAI: "GYO & İnşaat",

  ANSGR: "Sigorta & Finans", ANHYT: "Sigorta & Finans", TURSG: "Sigorta & Finans",
  ISMEN: "Sigorta & Finans", DSTKF: "Sigorta & Finans",
};
function getSector(symbol) { return SECTOR_MAP[symbol] || "Diğer"; }

moneyRefreshBtn.addEventListener("click", runMoneyFlowScan);

async function runMoneyFlowScan() {
  moneyError.textContent = "";
  moneyResults.style.display = "none";
  moneyRefreshBtn.disabled = true;
  moneyLoading.classList.add("active");
  moneyLoadingText.textContent = `TARANIYOR... (0 / ${BIST100_SYMBOLS.length})`;

  try {
    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < BIST100_SYMBOLS.length; i += chunkSize) chunks.push(BIST100_SYMBOLS.slice(i, i + chunkSize));

    let points = [];
    for (let i = 0; i < chunks.length; i++) {
      moneyLoadingText.textContent = `TARANIYOR... (${i * chunkSize} / ${BIST100_SYMBOLS.length})`;
      try {
        points.push(...(await fetchQuoteBatch(chunks[i])));
      } catch (e) {
        try {
          await new Promise((r) => setTimeout(r, 500));
          points.push(...(await fetchQuoteBatch(chunks[i])));
        } catch (e2) { /* bu grubu atla */ }
      }
    }

    if (points.length === 0) throw new Error("Hiçbir hisse verisi alınamadı.");

    renderMoneyFlow(points);
    moneyLoading.classList.remove("active");
    moneyResults.style.display = "block";
  } catch (err) {
    moneyLoading.classList.remove("active");
    moneyError.textContent = err.message || "Tarama sırasında bir hata oluştu.";
  } finally {
    moneyRefreshBtn.disabled = false;
  }
}

function renderMoneyFlow(points) {
  // Her hisseye sektör ve hacim oranı (bugün / normal) atıyoruz
  const withRatio = points.map((p) => ({
    ...p,
    sector: getSector(p.symbol),
    volRatio: p.avgVolume && p.avgVolume > 0 ? p.volume / p.avgVolume : null,
    avgVolumeTL: p.avgVolume ? p.avgVolume * p.price : null,
  }));

  // Sektör bazında topluyoruz
  const sectorMap = {};
  withRatio.forEach((p) => {
    if (!sectorMap[p.sector]) sectorMap[p.sector] = { name: p.sector, stocks: [], todayVolumeTL: 0, avgVolumeTL: 0, changeSum: 0, changeCount: 0 };
    const s = sectorMap[p.sector];
    s.stocks.push(p);
    s.todayVolumeTL += p.volumeTL || 0;
    if (p.avgVolumeTL) s.avgVolumeTL += p.avgVolumeTL;
    if (p.changePct != null && Math.abs(p.changePct) <= 30) { s.changeSum += p.changePct; s.changeCount++; }
  });

  const sectors = Object.values(sectorMap).map((s) => ({
    ...s,
    ratio: s.avgVolumeTL > 0 ? s.todayVolumeTL / s.avgVolumeTL : null,
    avgChange: s.changeCount ? s.changeSum / s.changeCount : 0,
  }));

  sectors.sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0));
  const maxRatio = Math.max(1, ...sectors.map((s) => s.ratio || 0));

  moneySectorList.innerHTML = sectors.map((s, idx) => {
    const ratioCls = s.ratio == null ? "normal" : s.ratio >= 1.5 ? "hot" : s.ratio >= 1.15 ? "warm" : "normal";
    const ratioText = s.ratio != null ? fmtNum(s.ratio, 2) + "x" : "—";
    const barColor = ratioCls === "hot" ? "#17c987" : ratioCls === "warm" ? "#d4af37" : "#4c5768";
    const barWidth = s.ratio != null ? Math.min(100, (s.ratio / maxRatio) * 100) : 0;

    const stocksSorted = [...s.stocks].sort((a, b) => (b.volRatio ?? 0) - (a.volRatio ?? 0));
    const stocksHtml = stocksSorted.map((p) => {
      const isSuspect = p.changePct != null && Math.abs(p.changePct) > 30;
      const warn = isSuspect ? ' <span title="Bu değer olağan dışı, teyit et">⚠️</span>' : "";
      return `
      <div class="money-stock-row">
        <div class="msl-left">
          <span class="symbol-cell clickable-symbol" onclick="event.stopPropagation(); goToStock('${p.symbol}')">${p.symbol}${warn}</span>
          <span class="msl-price">${fmtTL(p.price)}</span>
        </div>
        <div class="msl-right">
          <span class="${changeClass(p.changePct)}">${fmtPct(p.changePct)}</span>
          <span style="color:var(--text-faint)">${p.volRatio != null ? fmtNum(p.volRatio, 2) + "x hacim" : "—"}</span>
        </div>
      </div>`;
    }).join("");

    return `
      <div class="money-sector-row" onclick="this.querySelector('.money-stock-list').classList.toggle('open')">
        <div class="msr-top">
          <div><span class="msr-name">${s.name}</span><span class="msr-count">${s.stocks.length} hisse</span></div>
          <div class="msr-right">
            <span class="msr-change ${changeClass(s.avgChange)}">${fmtPct(s.avgChange)}</span>
            <span class="msr-ratio ${ratioCls}">${ratioText}</span>
          </div>
        </div>
        <div class="msr-bar-wrap"><div class="msr-bar" style="width:${barWidth}%; background:${barColor}"></div></div>
        <div class="money-stock-list">${stocksHtml}</div>
      </div>`;
  }).join("");
}

// ==========================================================================
// 16) NOTLAR (hisse başına, buluta kaydedilir)
// ==========================================================================
async function loadAllNotes() { try { return await kvGet("notes"); } catch (e) { return {}; } }
async function saveAllNotes(notes) { await kvPost("notes", { notes }); }

async function loadNoteForSymbol(symbol) {
  stockNoteInput.value = "Yükleniyor...";
  try {
    const notes = await loadAllNotes();
    stockNoteInput.value = notes[symbol] || "";
  } catch (e) { stockNoteInput.value = ""; }
  noteSavedText.style.display = "none";
}

saveNoteBtn.addEventListener("click", async () => {
  if (!currentSymbol) return;
  saveNoteBtn.disabled = true;
  try {
    const notes = await loadAllNotes();
    notes[currentSymbol] = stockNoteInput.value.trim();
    await saveAllNotes(notes);
    noteSavedText.style.display = "inline";
    setTimeout(() => { noteSavedText.style.display = "none"; }, 2500);
  } catch (e) {
    alert("Not kaydedilemedi: " + e.message);
  } finally {
    saveNoteBtn.disabled = false;
  }
});

// ==========================================================================
// 17) SON ARAMALAR (localStorage, cihaza özel — hızlı erişim için)
// ==========================================================================
const LS_RECENT_KEY = "bist_terminal_recent";
function saveRecentSearch(symbol) {
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(LS_RECENT_KEY) || "[]"); } catch (e) { recent = []; }
  recent = recent.filter((s) => s !== symbol);
  recent.unshift(symbol);
  recent = recent.slice(0, 6);
  localStorage.setItem(LS_RECENT_KEY, JSON.stringify(recent));
}
function renderRecentSearches() {
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(LS_RECENT_KEY) || "[]"); } catch (e) { recent = []; }
  if (recent.length === 0) { recentSearchesWrap.style.display = "none"; return; }
  recentSearchesWrap.style.display = "block";
  recentSearchesRow.innerHTML = recent.map((s) => `<span class="recent-chip" onclick="goToStock('${s}')">${s}</span>`).join("");
}

// ==========================================================================
// 18) OTOMATİK TAMAMLAMA (BIST 100 listesinden, ek istek yok)
// ==========================================================================
let acActiveIndex = -1;
searchInput.addEventListener("input", () => {
  const val = searchInput.value.toUpperCase().trim();
  acActiveIndex = -1;
  if (!val) { autocompleteBox.classList.remove("open"); autocompleteBox.innerHTML = ""; return; }
  const matches = BIST100_SYMBOLS.filter((s) => s.startsWith(val)).slice(0, 8);
  if (matches.length === 0) { autocompleteBox.classList.remove("open"); autocompleteBox.innerHTML = ""; return; }
  autocompleteBox.innerHTML = matches.map((s, i) => `<div class="autocomplete-item" data-idx="${i}">${s}</div>`).join("");
  autocompleteBox.classList.add("open");
  autocompleteBox.querySelectorAll(".autocomplete-item").forEach((el) => {
    el.addEventListener("click", () => { searchInput.value = el.textContent; autocompleteBox.classList.remove("open"); runSearch(el.textContent); });
  });
});
searchInput.addEventListener("keydown", (e) => {
  const items = autocompleteBox.querySelectorAll(".autocomplete-item");
  if (autocompleteBox.classList.contains("open") && items.length > 0) {
    if (e.key === "ArrowDown") { e.preventDefault(); acActiveIndex = Math.min(acActiveIndex + 1, items.length - 1); items.forEach((it, i) => it.classList.toggle("active", i === acActiveIndex)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); acActiveIndex = Math.max(acActiveIndex - 1, 0); items.forEach((it, i) => it.classList.toggle("active", i === acActiveIndex)); return; }
    if (e.key === "Enter" && acActiveIndex >= 0) { e.preventDefault(); const chosen = items[acActiveIndex].textContent; searchInput.value = chosen; autocompleteBox.classList.remove("open"); runSearch(chosen); return; }
  }
  if (e.key === "Enter") { autocompleteBox.classList.remove("open"); runSearch(searchInput.value); }
  if (e.key === "Escape") { autocompleteBox.classList.remove("open"); }
});
document.addEventListener("click", (e) => {
  if (!autocompleteBox.contains(e.target) && e.target !== searchInput) autocompleteBox.classList.remove("open");
});

// ==========================================================================
// 19) PAYLAŞILABİLİR LİNK — ?symbol=ALARK ile açılınca otomatik arama yapar
// ==========================================================================
function checkShareableLink() {
  const params = new URLSearchParams(window.location.search);
  const sym = params.get("symbol");
  if (sym) {
    showSearchNav();
    runSearch(sym);
  }
}

// ==========================================================================
// 20) ÖZET (ANA SAYFA) EKRANI — Portföy/Takip/Trendler verilerini bir araya
// getirir, kendi başına YENİ bir Yahoo isteği atmaz.
// ==========================================================================
async function renderHomeScreen() {
  await renderHomePortfolio();
  await renderHomeWatchlist();
  renderHomePulse();
  await renderHomePortfolioChart();
  renderHomeBist30Mini();
  renderHomeHeatmapMini();
}

async function renderHomePortfolio() {
  const pos = await loadPortfolio();
  if (pos.length === 0) {
    homePortfolioEmpty.classList.add("visible");
    homePortfolioSummary.innerHTML = ""; homeSectorNote.textContent = "";
    return;
  }
  homePortfolioEmpty.classList.remove("visible");
  homePortfolioSummary.innerHTML = '<div class="summary-card"><div class="summary-label">Yükleniyor</div><div class="summary-value">—</div></div>';

  const results = await Promise.allSettled(pos.map((p) => fetchQuickPrice(p.symbol)));
  let tc = 0, tv = 0, tdc = 0; const alloc = [];
  pos.forEach((p, i) => {
    const cv = p.qty * p.cost; tc += cv;
    const r = results[i];
    if (r.status === "fulfilled") {
      const val = p.qty * r.value.price;
      tv += val;
      tdc += val - val / (1 + r.value.dailyChangePct / 100);
      alloc.push({ symbol: p.symbol, value: val });
    } else { tv += cv; }
  });
  const tg = tv - tc, tgp = tc ? (tg / tc) * 100 : 0;
  homePortfolioSummary.innerHTML =
    '<div class="summary-card"><div class="summary-label">Toplam Değer</div><div class="summary-value">' + fmtTL(tv) + '</div></div>' +
    '<div class="summary-card"><div class="summary-label">Kâr/Zarar</div><div class="summary-value ' + changeClass(tg) + '">' + (tg >= 0 ? "+" : "") + fmtTL(tg) + " (" + fmtPct(tgp) + ')</div></div>' +
    '<div class="summary-card"><div class="summary-label">Bugünkü Değişim</div><div class="summary-value ' + changeClass(tdc) + '">' + (tdc >= 0 ? "+" : "") + fmtTL(tdc) + " (" + fmtPct(tv ? (tdc / (tv - tdc)) * 100 : 0) + ')</div></div>' +
    '<div class="summary-card"><div class="summary-label">Pozisyon Sayısı</div><div class="summary-value">' + pos.length + "</div></div>";

  // Sektör yoğunlaşma notu (Para Nerede'nin sektör haritasını yeniden kullanır, ek istek yok)
  if (tv > 0 && alloc.length > 0) {
    const bySector = {};
    alloc.forEach((a) => { const sec = getSector(a.symbol); bySector[sec] = (bySector[sec] || 0) + a.value; });
    const top = Object.entries(bySector).map(([name, value]) => ({ name, pct: (value / tv) * 100 })).sort((a, b) => b.pct - a.pct)[0];
    if (top) {
      homeSectorNote.textContent = top.pct >= 40
        ? `⚠️ Portföyünün %${fmtNum(top.pct, 0)}'i ${top.name} sektöründe yoğunlaşmış.`
        : `En büyük sektör ağırlığın: ${top.name} (%${fmtNum(top.pct, 0)})`;
    }
  } else { homeSectorNote.textContent = ""; }
}

// Portföy Getirisi mini grafiği — Portföy geçmişini (ayrı bir Yahoo isteği atmadan, sadece KV'den) okur
async function renderHomePortfolioChart() {
  let history = [];
  try { history = await loadPortfolioHistory(); } catch (e) { history = []; }
  if (!history || history.length < 2) {
    homePortfolioChartCard.style.display = history && history.length > 0 ? "block" : "none";
    homePortfolioChartEmpty.classList.add("visible");
    homePortfolioChartEl.innerHTML = "";
    return;
  }
  homePortfolioChartCard.style.display = "block";
  homePortfolioChartEmpty.classList.remove("visible");
  homePortfolioChartEl.innerHTML = "";

  const light = isLightTheme();
  const chart = LightweightCharts.createChart(homePortfolioChartEl, {
    height: 140,
    layout: { background: { color: "transparent" }, textColor: light ? "#566072" : "#7d8a9c", fontFamily: "JetBrains Mono, monospace" },
    grid: { vertLines: { visible: false }, horzLines: { color: light ? "#e4e7ec" : "#1a1f29" } },
    timeScale: { borderColor: light ? "#dde1e7" : "#232a36" },
    rightPriceScale: { borderColor: light ? "#dde1e7" : "#232a36" },
  });
  const series = chart.addLineSeries({ color: "#d4af37", lineWidth: 2 });
  series.setData(history.map((h) => ({ time: Math.floor(new Date(h.date).getTime() / 1000), value: h.value })));
  chart.timeScale().fitContent();
}

// BIST 30 Zirveden Uzaklık — son Trendler taramasının (hafızadaki) verisinden, ek istek yok
function renderHomeBist30Mini() {
  if (!lastTrendsPoints) { homeBist30MiniEmpty.classList.add("visible"); homeBist30Mini.innerHTML = ""; return; }
  const bist30 = lastTrendsPoints.filter((p) => BIST30_SYMBOLS.includes(p.symbol) && p.week52High && p.week52High > 0);
  if (bist30.length === 0) { homeBist30MiniEmpty.classList.add("visible"); homeBist30Mini.innerHTML = ""; return; }
  homeBist30MiniEmpty.classList.remove("visible");
  const ranked = bist30.map((p) => ({ ...p, distPct: ((p.week52High - p.price) / p.price) * 100 })).sort((a, b) => b.distPct - a.distPct).slice(0, 5);
  homeBist30Mini.innerHTML = ranked.map((p) => `
    <div class="home-mover-row">
      <span class="symbol-cell clickable-symbol" onclick="goToStock('${p.symbol}')">${p.symbol}</span>
      <span>${fmtTL(p.price)}</span>
      <span class="${changeClass(-p.distPct)}">${fmtNum(p.distPct)}% uzak</span>
    </div>`).join("");
}

// Isı Haritası mini — son taramadan en çok hareket eden 20 hisse, ek istek yok
function renderHomeHeatmapMini() {
  if (!lastTrendsPoints) { homeHeatmapMiniEmpty.classList.add("visible"); homeHeatmapMini.innerHTML = ""; return; }
  homeHeatmapMiniEmpty.classList.remove("visible");
  const top10Green = [...lastTrendsPoints].filter((p) => p.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 10);
  const top10Red = [...lastTrendsPoints].filter((p) => p.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 10);
  const top20 = [...top10Green, ...top10Red.reverse()];
  const COLOR_CEILING = 15;
  homeHeatmapMini.innerHTML = top20.map((p) => {
    const intensity = Math.min(1, Math.abs(p.changePct) / COLOR_CEILING);
    const color = p.changePct >= 0 ? lerpColor("#1a2e28", "#17c987", intensity) : lerpColor("#2e1a1e", "#ff4757", intensity);
    return `<div class="heatmap-cell" style="background:${color}" title="${p.symbol}: ${fmtPct(p.changePct)}" onclick="goToStock('${p.symbol}')">
      <div class="hc-symbol">${p.symbol}</div>
      <div class="hc-change">${fmtPct(p.changePct, 1)}</div>
    </div>`;
  }).join("");
}

async function renderHomeWatchlist() {
  const items = await loadWatchlist();
  if (items.length === 0) {
    homeWatchlistEmpty.classList.add("visible");
    homeWatchlistMovers.innerHTML = "";
    return;
  }
  homeWatchlistEmpty.classList.remove("visible");
  homeWatchlistMovers.innerHTML = '<div class="sub-note">Yükleniyor...</div>';

  const results = await Promise.allSettled(items.map((i) => fetchQuickPrice(i.symbol)));
  const withData = items
    .map((item, i) => (results[i].status === "fulfilled" ? { symbol: item.symbol, price: results[i].value.price, changePct: results[i].value.dailyChangePct } : null))
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 5);

  if (withData.length === 0) { homeWatchlistMovers.innerHTML = '<div class="sub-note">Veri alınamadı.</div>'; return; }

  homeWatchlistMovers.innerHTML = withData.map((p) => `
    <div class="home-mover-row">
      <span class="symbol-cell clickable-symbol" onclick="goToStock('${p.symbol}')">${p.symbol}</span>
      <span>${fmtTL(p.price)}</span>
      <span class="${changeClass(p.changePct)}">${fmtPct(p.changePct)}</span>
    </div>`).join("");
}

function renderHomePulse() {
  if (!lastTrendsPoints) {
    homePulseEmpty.classList.add("visible");
    homePulseRow.innerHTML = "";
    homePulseNote.textContent = "Trendler'den son tarama sonucu";
    return;
  }
  homePulseEmpty.classList.remove("visible");
  const points = lastTrendsPoints;
  const up = points.filter((p) => p.changePct > 0.05).length;
  const down = points.filter((p) => p.changePct < -0.05).length;
  const flat = points.length - up - down;
  const minsAgo = Math.round((Date.now() - lastTrendsScanTime) / 60000);
  homePulseNote.textContent = minsAgo < 1 ? "Az önce tarandı" : minsAgo + " dakika önce tarandı";
  homePulseRow.innerHTML =
    '<div class="pulse-row">' +
    '<div class="pulse-stat up"><div class="pulse-num">' + up + '</div><div class="pulse-label">Yükselen</div></div>' +
    '<div class="pulse-stat down"><div class="pulse-num">' + down + '</div><div class="pulse-label">Düşen</div></div>' +
    '<div class="pulse-stat flat"><div class="pulse-num">' + flat + '</div><div class="pulse-label">Sabit</div></div>' +
    '</div>';
}

// ==========================================================================
// 21) AÇIK/KOYU TEMA — tercih localStorage'da saklanır, tamamen tarayıcıda çalışır
// ==========================================================================
const LS_THEME_KEY = "bist_terminal_theme";
function applyTheme(theme) {
  if (theme === "light") { document.documentElement.setAttribute("data-theme", "light"); themeToggleBtn.textContent = "☀️"; }
  else { document.documentElement.removeAttribute("data-theme"); themeToggleBtn.textContent = "🌙"; }
}
function initTheme() {
  const saved = localStorage.getItem(LS_THEME_KEY) || "dark";
  applyTheme(saved);
}
themeToggleBtn.addEventListener("click", () => {
  const current = localStorage.getItem(LS_THEME_KEY) || "dark";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(LS_THEME_KEY, next);
  applyTheme(next);
});
initTheme();

// ==========================================================================
// 22) PDF AL / YAZDIR — tarayıcının kendi "Yazdır" özelliğini kullanır (ek maliyet yok).
// @media print CSS kuralları sadece hisse sonuç ekranını yazdırılabilir bırakır.
// ==========================================================================
printPdfBtn.addEventListener("click", () => { window.print(); });

// Hisse detayını yeniden çeker — aynı sistemi (runSearch) kullanır, sadece
// "arama" yerine "mevcut hisseyi tazele" amacıyla tetiklenir.
refreshStockBtn.addEventListener("click", () => {
  if (!currentSymbol) return;
  runSearch(currentSymbol);
});

// ==========================================================================
// 23) PORTFÖY GETİRİ GRAFİĞİ (ZAMAN İÇİNDE) — Her Portföy ekranı ziyaretinde,
// o gün için henüz kayıt yoksa otomatik bir "anlık görüntü" (snapshot) kaydedilir.
// Ayrı bir zamanlanmış görev (cron) YOK — tamamen doğal kullanımla birikir.
// ==========================================================================
async function loadPortfolioHistory() { try { return await kvGet("portfolio_history"); } catch (e) { return []; } }
async function savePortfolioHistory(snapshots) { await kvPost("portfolio_history", { snapshots }); }

function todayTRDateStr() {
  return new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

let lastPortfolioHistory = [];
let historyRangeState = "all";
let portfolioHistoryChartApi = null;

async function recordAndRenderPortfolioHistory(tv, tc) {
  if (!tv && !tc) { portfolioHistoryCard.style.display = "none"; return; }
  try {
    const history = await loadPortfolioHistory();
    const today = todayTRDateStr();
    const last = history[history.length - 1];
    if (!last || last.date !== today) {
      history.push({ date: today, value: tv, cost: tc });
      await savePortfolioHistory(history);
    } else {
      // Bugün için zaten kayıt var — en güncel değerle güncelle (gün içinde birden fazla ziyaret edilirse)
      last.value = tv; last.cost = tc;
      await savePortfolioHistory(history);
    }
    lastPortfolioHistory = history;
    renderPortfolioHistoryChart();
  } catch (e) {
    portfolioHistoryCard.style.display = "none";
  }
}

historyRangeTabs.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  historyRangeTabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  historyRangeState = e.target.dataset.range;
  renderPortfolioHistoryChart();
});

function renderPortfolioHistoryChart() {
  const history = lastPortfolioHistory;
  if (!history || history.length < 2) {
    portfolioHistoryCard.style.display = history && history.length === 1 ? "block" : "none";
    if (history && history.length === 1) { portfolioHistoryEmpty.classList.add("visible"); portfolioHistoryChartEl.innerHTML = ""; }
    return;
  }
  portfolioHistoryCard.style.display = "block";
  portfolioHistoryEmpty.classList.remove("visible");

  let filtered = [...history];
  if (historyRangeState !== "all") {
    const days = historyRangeState === "1m" ? 30 : 90;
    const cutoff = todayTRDateStr();
    const cutoffTs = new Date(cutoff).getTime() - days * 86400000;
    filtered = filtered.filter((h) => new Date(h.date).getTime() >= cutoffTs);
    if (filtered.length < 2) filtered = history.slice(-2);
  }

  portfolioHistoryChartEl.innerHTML = "";
  if (portfolioHistoryChartApi) { portfolioHistoryChartApi.remove(); portfolioHistoryChartApi = null; }
  const light = isLightTheme();

  portfolioHistoryChartApi = LightweightCharts.createChart(portfolioHistoryChartEl, {
    height: 260,
    layout: { background: { color: "transparent" }, textColor: light ? "#566072" : "#7d8a9c", fontFamily: "JetBrains Mono, monospace" },
    grid: { vertLines: { color: light ? "#e4e7ec" : "#1a1f29" }, horzLines: { color: light ? "#e4e7ec" : "#1a1f29" } },
    timeScale: { borderColor: light ? "#dde1e7" : "#232a36" },
    rightPriceScale: { borderColor: light ? "#dde1e7" : "#232a36" },
  });

  const valueSeries = portfolioHistoryChartApi.addLineSeries({ color: "#d4af37", lineWidth: 2, title: "Değer" });
  valueSeries.setData(filtered.map((h) => ({ time: Math.floor(new Date(h.date).getTime() / 1000), value: h.value })));

  const costSeries = portfolioHistoryChartApi.addLineSeries({ color: "#4c5768", lineWidth: 1, lineStyle: 2, title: "Maliyet" });
  costSeries.setData(filtered.map((h) => ({ time: Math.floor(new Date(h.date).getTime() / 1000), value: h.cost })));

  portfolioHistoryChartApi.timeScale().fitContent();
}
