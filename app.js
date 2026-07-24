/* ==========================================================================
   BIST TERMİNAL — app.js
   Kilit ekranı -> boş arama ekranı -> arama yapılınca Worker'dan veri çekme
   -> teknik/temel hesaplama -> profesyonel sonuç ekranı render
   Portföy ve Takip Listesi: KV (Cloudflare) tabanlı, cihazlar arası senkron
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

// ---------- Portföy DOM referansları ----------
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

// ---------- Takip Listesi DOM referansları ----------
const watchlistScreen = document.getElementById("watchlistScreen");
const wlSymbol = document.getElementById("wlSymbol");
const wlAddBtn = document.getElementById("wlAddBtn");
const wlError = document.getElementById("wlError");
const watchlistTableBody = document.getElementById("watchlistTableBody");
const watchlistEmpty = document.getElementById("watchlistEmpty");

// ---------- Karşılaştırma DOM referansları ----------
const compareScreen = document.getElementById("compareScreen");
const cmpSymbol1 = document.getElementById("cmpSymbol1");
const cmpSymbol2 = document.getElementById("cmpSymbol2");
const cmpSymbol3 = document.getElementById("cmpSymbol3");
const cmpBtn = document.getElementById("cmpBtn");
const cmpError = document.getElementById("cmpError");
const cmpLoading = document.getElementById("cmpLoading");
const cmpResultCard = document.getElementById("cmpResultCard");
const compareTable = document.getElementById("compareTable");

let priceChartApi = null;
let volumeChartApi = null;
let candleSeries = null;
let volumeSeries = null;
let fullChartData = null;
let currentSymbol = null;

// ==========================================================================
// 0) PWA Service Worker Kaydı
// ==========================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Service worker kaydı başarısız olursa sessizce devam et
    });
  });
}

// ==========================================================================
// 1) GİRİŞ / ŞİFRE
// ==========================================================================
function tryEnterApp() {
  const saved = localStorage.getItem(LS_PASS_KEY);
  if (saved) {
    lockScreen.style.display = "none";
    appEl.style.display = "block";
    syncWatchlistState();
  }
}

passSubmit.addEventListener("click", handlePasswordSubmit);
passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handlePasswordSubmit(); });

function handlePasswordSubmit() {
  const val = passInput.value.trim();
  if (!val) { lockError.textContent = "Lütfen şifre gir."; return; }
  localStorage.setItem(LS_PASS_KEY, val);
  lockScreen.style.display = "none";
  appEl.style.display = "block";
  searchInput.focus();
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(LS_PASS_KEY);
  location.reload();
});

tryEnterApp();

// ==========================================================================
// 2) ARAMA
// ==========================================================================
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch(searchInput.value);
});
newSearchBtn.addEventListener("click", () => runSearch(newSearchInput.value));
newSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch(newSearchInput.value);
});

// ==========================================================================
// EKRAN GEÇİŞLERİ (Ara <-> Portföy <-> Takip <-> Karşılaştır)
// ==========================================================================
function setActiveNav(activeBtn) {
  [navSearchBtn, navPortfolioBtn, navWatchlistBtn, navCompareBtn].forEach((b) => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

function showSearchNav() {
  setActiveNav(navSearchBtn);
  portfolioScreen.classList.remove("active");
  watchlistScreen.classList.remove("active");
  compareScreen.classList.remove("active");
  searchScreen.classList.remove("hidden");
}

function showPortfolioNav() {
  setActiveNav(navPortfolioBtn);
  searchScreen.classList.add("hidden");
  resultScreen.classList.remove("active");
  loadingScreen.classList.remove("active");
  compareScreen.classList.remove("active");
  watchlistScreen.classList.remove("active");
  portfolioScreen.classList.add("active");
  renderPortfolio();
}

function showWatchlistNav() {
  setActiveNav(navWatchlistBtn);
  searchScreen.classList.add("hidden");
  resultScreen.classList.remove("active");
  loadingScreen.classList.remove("active");
  compareScreen.classList.remove("active");
  portfolioScreen.classList.remove("active");
  watchlistScreen.classList.add("active");
  renderWatchlist();
}

function showCompareNav() {
  setActiveNav(navCompareBtn);
  searchScreen.classList.add("hidden");
  resultScreen.classList.remove("active");
  loadingScreen.classList.remove("active");
  portfolioScreen.classList.remove("active");
  watchlistScreen.classList.remove("active");
  compareScreen.classList.add("active");
}

navSearchBtn.addEventListener("click", showSearchNav);
navPortfolioBtn.addEventListener("click", showPortfolioNav);
navWatchlistBtn.addEventListener("click", showWatchlistNav);
navCompareBtn.addEventListener("click", showCompareNav);

async function runSearch(rawSymbol) {
  const symbol = (rawSymbol || "").toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  searchError.textContent = "";
  if (!symbol) { searchError.textContent = "Lütfen bir hisse kodu gir (örn: ALARK)."; return; }

  showLoading(true, `${symbol} için veri çekiliyor...`);
  currentSymbol = symbol;

  const pass = localStorage.getItem(LS_PASS_KEY) || "";

  try {
    const [chartRes, quoteRes] = await Promise.all([
      fetchJSON(`${WORKER_URL}/api/chart?symbol=${symbol}&pass=${encodeURIComponent(pass)}`),
      fetchJSON(`${WORKER_URL}/api/quote?symbol=${symbol}&pass=${encodeURIComponent(pass)}`),
    ]);

    if (chartRes.error || quoteRes.error) {
      const msg = chartRes.error || quoteRes.error;
      if ((chartRes.status === 401) || (quoteRes.status === 401)) {
        localStorage.removeItem(LS_PASS_KEY);
        showLoading(false);
        lockScreen.style.display = "flex";
        appEl.style.display = "none";
        lockError.textContent = "Şifre hatalı. Tekrar dene.";
        return;
      }
      throw new Error(msg);
    }

    const chartResult = chartRes.data?.chart?.result?.[0];
    if (!chartResult || !chartResult.timestamp) {
      throw new Error(`"${symbol}" için veri bulunamadı. Kodu kontrol et (örn: ALARK, THYAO).`);
    }

    const processed = processChartData(chartResult);
    const fundamentals = processFundamentals(quoteRes.data);

    showLoading(false);
    resultScreen.classList.add("active");
    searchScreen.classList.add("hidden");

    renderAll(symbol, processed, fundamentals);
    syncWatchlistState();
    newSearchInput.value = "";
  } catch (err) {
    showLoading(false);
    searchScreen.classList.remove("hidden");
    resultScreen.classList.remove("active");
    searchError.textContent = err.message || "Bir hata oluştu, tekrar dene.";
  }
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Bilinmeyen hata", status: res.status };
    return { data };
  } catch (e) {
    return { error: "Sunucuya ulaşılamadı. Worker adresini (config.js) kontrol et." };
  }
}

function showLoading(active, text) {
  loadingScreen.classList.toggle("active", active);
  searchScreen.classList.toggle("hidden", active);
  if (text) loadingText.textContent = text.toUpperCase();
}

// ==========================================================================
// 3) YAHOO VERİSİNİ İŞLEME
// ==========================================================================
function processChartData(result) {
  const ts = result.timestamp;
  const quote = result.indicators.quote[0];
  const meta = result.meta || {};
  const adjClose = result.indicators.adjclose?.[0]?.adjclose;

  const candles = [];
  const volumesTL = [];

  for (let i = 0; i < ts.length; i++) {
    if (quote.close[i] == null) continue;
    const time = ts[i];
    const close = quote.close[i];
    const open = quote.open[i] ?? close;
    const high = quote.high[i] ?? close;
    const low = quote.low[i] ?? close;
    const volume = quote.volume[i] ?? 0;
    candles.push({ time, open, high, low, close, volume });
    volumesTL.push({ time, volumeTL: volume * close });
  }

  const closes = candles.map((c) => c.close);
  const lastClose = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const prevClose = closes[closes.length - 2] ?? lastClose;

  const findByDaysAgo = (n) => {
    const idx = closes.length - 1 - n;
    return idx >= 0 ? closes[idx] : closes[0];
  };

  const pctChange = (from) => (from ? ((lastClose - from) / from) * 100 : 0);

  const changes = {
    daily: pctChange(prevClose),
    weekly: pctChange(findByDaysAgo(5)),
    monthly: pctChange(findByDaysAgo(21)),
    sixMonth: pctChange(findByDaysAgo(126)),
    yearly: pctChange(closes[0]),
  };

  const week52Low = Math.min(...candles.map((c) => c.low));
  const week52High = Math.max(...candles.map((c) => c.high));

  const last30 = volumesTL.slice(-30);
  const avgVolumeTL = last30.reduce((s, v) => s + v.volumeTL, 0) / last30.length;
  const last30Shares = candles.slice(-30).reduce((s, c) => s + c.volume, 0) / last30.length;

  const lastCandle = candles[candles.length - 1];
  const dailyVolumeTL = lastCandle.volume * lastClose;
  const dailyVolumeShares = lastCandle.volume;

  const rsi = calcRSI(closes, 14);
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  const macd = calcMACD(closes);
  const bollinger = calcBollinger(closes, 20, 2);
  const stochRsi = calcStochRSI(closes, 14, 14);

  return {
    candles, volumesTL, lastClose, changes,
    week52Low, week52High, avgVolumeTL, avgVolumeShares: last30Shares,
    dailyVolumeTL, dailyVolumeShares,
    rsi: rsi[rsi.length - 1], ma50: ma50[ma50.length - 1], ma200: ma200[ma200.length - 1],
    macd: macd.macdLine[macd.macdLine.length - 1],
    macdSignal: macd.signalLine[macd.signalLine.length - 1],
    bollingerUpper: bollinger.upper[bollinger.upper.length - 1],
    bollingerMid: bollinger.mid[bollinger.mid.length - 1],
    bollingerLower: bollinger.lower[bollinger.lower.length - 1],
    stochRsi: stochRsi[stochRsi.length - 1],
  };
}

function processFundamentals(raw) {
  const r = raw?.quoteSummary?.result?.[0] || {};
  const sd = r.summaryDetail || {};
  const dks = r.defaultKeyStatistics || {};
  const fd = r.financialData || {};
  const price = r.price || {};
  const rec = r.recommendationTrend?.trend?.[0] || {};

  const g = (obj, key) => {
    const v = obj?.[key];
    if (v == null) return null;
    if (typeof v === "object" && "raw" in v) return v.raw;
    return v;
  };

  return {
    companyName: price.longName || price.shortName || "—",
    currency: price.currencySymbol || "TL",
    marketCap: g(price, "marketCap"),
    trailingPE: g(sd, "trailingPE"),
    forwardPE: g(sd, "forwardPE"),
    priceToBook: g(dks, "priceToBook"),
    dividendYield: g(sd, "dividendYield"),
    beta: g(sd, "beta"),
    returnOnEquity: g(fd, "returnOnEquity"),
    profitMargins: g(dks, "profitMargins"),
    revenueGrowth: g(fd, "revenueGrowth"),
    recommendationMean: g(fd, "recommendationMean"),
    recommendationKey: fd.recommendationKey || null,
    numberOfAnalysts: g(fd, "numberOfAnalystOpinions"),
    fiftyTwoWeekLow: g(sd, "fiftyTwoWeekLow"),
    fiftyTwoWeekHigh: g(sd, "fiftyTwoWeekHigh"),
    priceToSales: g(sd, "priceToSalesTrailing12Months"),
    enterpriseToEbitda: g(dks, "enterpriseToEbitda"),
    // Analist hedef fiyatları
    targetMeanPrice: g(fd, "targetMeanPrice"),
    targetHighPrice: g(fd, "targetHighPrice"),
    targetLowPrice: g(fd, "targetLowPrice"),
    targetMedianPrice: g(fd, "targetMedianPrice"),
    // 5 yıllık ortalamalar
    fiveYearAvgPE: g(dks, "fiveYearAvgDividendYield") ? null : null, // Yahoo'da doğrudan yok, alternatif olarak kullanılabilir
    bookValue: g(dks, "bookValue"), // Hisse başı defter değeri
  };
}

// ---------- Teknik hesap yardımcıları ----------
function sma(arr, period) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < period - 1) { out.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += arr[j];
    out.push(sum / period);
  }
  return out;
}

function ema(arr, period) {
  const k = 2 / (period + 1);
  const out = [];
  let prev = null;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) { out.push(null); continue; }
    if (prev == null) { prev = arr[i]; out.push(prev); continue; }
    prev = arr[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

function calcRSI(closes, period = 14) {
  const out = new Array(closes.length).fill(null);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  out[period] = 100 - 100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out[i] = 100 - 100 / (1 + rs);
  }
  return out;
}

function calcMACD(closes) {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = closes.map((_, i) => (ema12[i] != null && ema26[i] != null ? ema12[i] - ema26[i] : null));
  const signalLine = ema(macdLine.map((v) => (v == null ? 0 : v)), 9);
  return { macdLine, signalLine };
}

function calcBollinger(closes, period = 20, mult = 2) {
  const mid = sma(closes, period);
  const upper = [], lower = [];
  for (let i = 0; i < closes.length; i++) {
    if (mid[i] == null) { upper.push(null); lower.push(null); continue; }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) sumSq += Math.pow(closes[j] - mid[i], 2);
    const stdDev = Math.sqrt(sumSq / period);
    upper.push(mid[i] + mult * stdDev);
    lower.push(mid[i] - mult * stdDev);
  }
  return { mid, upper, lower };
}

function calcStochRSI(closes, rsiPeriod = 14, stochPeriod = 14) {
  const rsi = calcRSI(closes, rsiPeriod);
  const out = new Array(closes.length).fill(null);
  for (let i = 0; i < rsi.length; i++) {
    if (rsi[i] == null) continue;
    const windowStart = Math.max(0, i - stochPeriod + 1);
    const windowVals = rsi.slice(windowStart, i + 1).filter((v) => v != null);
    if (windowVals.length < stochPeriod) continue;
    const minRsi = Math.min(...windowVals);
    const maxRsi = Math.max(...windowVals);
    out[i] = maxRsi > minRsi ? ((rsi[i] - minRsi) / (maxRsi - minRsi)) * 100 : 50;
  }
  return out;
}

// ==========================================================================
// 4) FORMATLAMA
// ==========================================================================
function fmtTL(n, opts = {}) {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2, ...opts }).format(n);
}
function fmtNum(n, digits = 2) {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits }).format(n);
}
function fmtPct(n, digits = 2) {
  if (n == null || isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${fmtNum(n, digits)}%`;
}
function fmtCompactTL(n) {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `₺${fmtNum(n / 1e9, 2)} Milyar`;
  if (abs >= 1e6) return `₺${fmtNum(n / 1e6, 2)} Milyon`;
  if (abs >= 1e3) return `₺${fmtNum(n / 1e3, 1)} Bin`;
  return fmtTL(n);
}
function changeClass(n) { return n > 0.001 ? "up" : n < -0.001 ? "down" : "flat"; }
function arrow(n) { return n > 0.001 ? "▲" : n < -0.001 ? "▼" : "▬"; }
function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ==========================================================================
// 5) AL/SAT PUANLAMA
// ==========================================================================
function computeRecommendation(d, f) {
  let score = 50;
  const factors = [];

  if (d.rsi != null) {
    if (d.rsi < 30) { score += 20; factors.push(["RSI aşırı satım", "+20"]); }
    else if (d.rsi < 45) { score += 8; factors.push(["RSI zayıf bölge", "+8"]); }
    else if (d.rsi <= 55) { factors.push(["RSI nötr", "0"]); }
    else if (d.rsi <= 70) { score -= 8; factors.push(["RSI güçlü bölge", "-8"]); }
    else { score -= 20; factors.push(["RSI aşırı alım", "-20"]); }
  }

  if (d.ma50 != null && d.ma200 != null) {
    if (d.lastClose > d.ma50 && d.ma50 > d.ma200) { score += 18; factors.push(["Trend: yükseliş (Golden)", "+18"]); }
    else if (d.lastClose < d.ma50 && d.ma50 < d.ma200) { score -= 18; factors.push(["Trend: düşüş (Death)", "-18"]); }
    else { factors.push(["Trend: karışık", "0"]); }
  }

  if (d.macd != null && d.macdSignal != null) {
    if (d.macd > d.macdSignal) { score += 12; factors.push(["MACD pozitif kesişim", "+12"]); }
    else { score -= 12; factors.push(["MACD negatif kesişim", "-12"]); }
  }

  const y = d.changes.yearly;
  if (y > 25) { score += 8; factors.push(["Güçlü yıllık momentum", "+8"]); }
  else if (y < -25) { score -= 8; factors.push(["Zayıf yıllık momentum", "-8"]); }

  if (f.recommendationMean != null) {
    const rm = f.recommendationMean;
    const analystScore = ((3 - rm) / 2) * 15;
    score += analystScore;
    factors.push(["Analist ortalaması", `${analystScore >= 0 ? "+" : ""}${fmtNum(analystScore, 0)}`]);
  }

  score = Math.max(0, Math.min(100, score));

  let label, cls;
  if (score >= 80) { label = "GÜÇLÜ AL"; cls = "strong-buy"; }
  else if (score >= 60) { label = "AL"; cls = "buy"; }
  else if (score >= 40) { label = "NÖTR"; cls = "neutral"; }
  else if (score >= 20) { label = "SAT"; cls = "sell"; }
  else { label = "GÜÇLÜ SAT"; cls = "strong-sell"; }

  return { score, label, cls, factors };
}

// ==========================================================================
// 5b) DEĞERLEME SAĞLIĞI PUANLAMA
// ==========================================================================
function computeValuationScore(f) {
  let score = 50;
  const factors = [];

  if (f.trailingPE != null && f.trailingPE > 0) {
    if (f.trailingPE < 8) { score += 20; factors.push(["F/K çok düşük", "+20"]); }
    else if (f.trailingPE < 15) { score += 8; factors.push(["F/K makul", "+8"]); }
    else if (f.trailingPE <= 25) { factors.push(["F/K normal aralıkta", "0"]); }
    else if (f.trailingPE <= 40) { score -= 15; factors.push(["F/K yüksek", "-15"]); }
    else { score -= 25; factors.push(["F/K aşırı yüksek", "-25"]); }
  } else if (f.trailingPE != null && f.trailingPE <= 0) {
    score -= 10; factors.push(["Şirket zarar ediyor (F/K negatif)", "-10"]);
  }

  if (f.priceToBook != null && f.priceToBook > 0) {
    if (f.priceToBook < 1) { score += 15; factors.push(["PD/DD defter değerinin altında", "+15"]); }
    else if (f.priceToBook < 2) { score += 5; factors.push(["PD/DD makul", "+5"]); }
    else if (f.priceToBook <= 4) { factors.push(["PD/DD normal aralıkta", "0"]); }
    else if (f.priceToBook <= 7) { score -= 12; factors.push(["PD/DD yüksek prim", "-12"]); }
    else { score -= 20; factors.push(["PD/DD aşırı prim", "-20"]); }
  }

  if (f.priceToSales != null && f.priceToSales > 0) {
    if (f.priceToSales < 1) { score += 10; factors.push(["PD/Satış düşük", "+10"]); }
    else if (f.priceToSales <= 3) { factors.push(["PD/Satış normal", "0"]); }
    else if (f.priceToSales <= 6) { score -= 10; factors.push(["PD/Satış yüksek", "-10"]); }
    else { score -= 15; factors.push(["PD/Satış aşırı yüksek", "-15"]); }
  }

  if (f.forwardPE != null && f.trailingPE != null && f.trailingPE > 0 && f.forwardPE > 0) {
    if (f.forwardPE < f.trailingPE * 0.8) { score += 8; factors.push(["Beklenen kâr artışı (Forward F/K düşük)", "+8"]); }
    else if (f.forwardPE > f.trailingPE * 1.2) { score -= 8; factors.push(["Beklenen kâr düşüşü (Forward F/K yüksek)", "-8"]); }
  }

  score = Math.max(0, Math.min(100, score));

  let label, cls;
  if (score >= 80) { label = "UCUZ"; cls = "strong-buy"; }
  else if (score >= 60) { label = "MAKUL"; cls = "buy"; }
  else if (score >= 40) { label = "NÖTR"; cls = "neutral"; }
  else if (score >= 20) { label = "PAHALI"; cls = "sell"; }
  else { label = "AŞIRI PAHALI"; cls = "strong-sell"; }

  return { score, label, cls, factors };
}

// ==========================================================================
// 6) GAUGE (AL/SAT yarım-ay göstergesi) - SVG çizimi
// ==========================================================================
function drawGauge(score, svgId = "gaugeSvg") {
  const svg = document.getElementById(svgId);
  svg.innerHTML = "";
  const cx = 140, cy = 140, r = 110;
  const startAngle = Math.PI;
  const endAngle = 0;

  const segments = 40;
  for (let i = 0; i < segments; i++) {
    const a1 = startAngle - (startAngle - endAngle) * (i / segments);
    const a2 = startAngle - (startAngle - endAngle) * ((i + 1) / segments);
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    const t = i / segments;
    const color = t < 0.5
      ? lerpColor("#ff4757", "#d4af37", t / 0.5)
      : lerpColor("#d4af37", "#17c987", (t - 0.5) / 0.5);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "14");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);
  }

  const angle = startAngle - (startAngle - endAngle) * (score / 100);
  const needleLen = r - 16;
  const nx = cx + needleLen * Math.cos(angle);
  const ny = cy - needleLen * Math.sin(angle);
  const needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
  needle.setAttribute("x1", cx); needle.setAttribute("y1", cy);
  needle.setAttribute("x2", nx); needle.setAttribute("y2", ny);
  needle.setAttribute("stroke", "#e6eaf0");
  needle.setAttribute("stroke-width", "3");
  needle.setAttribute("stroke-linecap", "round");
  svg.appendChild(needle);

  const hub = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hub.setAttribute("cx", cx); hub.setAttribute("cy", cy); hub.setAttribute("r", "7");
  hub.setAttribute("fill", "#e6eaf0");
  svg.appendChild(hub);

  const labelStyle = { "font-family": "JetBrains Mono, monospace", "font-size": "10.5px", fill: "#4c5768" };
  const leftLabel = svgId === "valueGaugeSvg" ? "PAHALI" : "SAT";
  const rightLabel = svgId === "valueGaugeSvg" ? "UCUZ" : "AL";
  addSvgText(svg, cx - r - 4, cy + 18, leftLabel, labelStyle);
  addSvgText(svg, cx + r - 14, cy + 18, rightLabel, labelStyle);
}

function addSvgText(svg, x, y, text, styles) {
  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", x); t.setAttribute("y", y);
  Object.entries(styles).forEach(([k, v]) => t.setAttribute(k, v));
  t.textContent = text;
  svg.appendChild(t);
}

function lerpColor(c1, c2, t) {
  const p1 = hexToRgb(c1), p2 = hexToRgb(c2);
  const r = Math.round(p1.r + (p2.r - p1.r) * t);
  const g = Math.round(p1.g + (p2.g - p1.g) * t);
  const b = Math.round(p1.b + (p2.b - p1.b) * t);
  return `rgb(${r},${g},${b})`;
}
function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

// ==========================================================================
// 7) MİNİ HACİM ÇUBUĞU (SVG)
// ==========================================================================
function drawMiniVolume(volumesTL) {
  const svg = document.getElementById("miniVolumeSvg");
  svg.innerHTML = "";
  const data = volumesTL.slice(-30);
  const max = Math.max(...data.map((d) => d.volumeTL));
  const w = 300 / data.length;
  data.forEach((d, i) => {
    const h = max ? (d.volumeTL / max) * 55 : 0;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", i * w + 1);
    rect.setAttribute("y", 58 - h);
    rect.setAttribute("width", Math.max(w - 2, 1));
    rect.setAttribute("height", h);
    rect.setAttribute("fill", "#d4af37");
    rect.setAttribute("opacity", "0.75");
    svg.appendChild(rect);
  });
}

// ==========================================================================
// 8) LIGHTWEIGHT-CHARTS FİYAT + HACİM GRAFİĞİ
// ==========================================================================
function renderChart(candles, volumesTL) {
  const priceEl = document.getElementById("priceChart");
  const volEl = document.getElementById("volumeChart");
  priceEl.innerHTML = "";
  volEl.innerHTML = "";

  const chartOptions = {
    layout: { background: { color: "transparent" }, textColor: "#7d8a9c", fontFamily: "JetBrains Mono, monospace" },
    grid: { vertLines: { color: "#1a1f29" }, horzLines: { color: "#1a1f29" } },
    timeScale: { borderColor: "#232a36" },
    rightPriceScale: { borderColor: "#232a36" },
    crosshair: { mode: 0 },
  };

  priceChartApi = LightweightCharts.createChart(priceEl, { ...chartOptions, height: 340 });
  candleSeries = priceChartApi.addCandlestickSeries({
    upColor: "#17c987", downColor: "#ff4757",
    borderUpColor: "#17c987", borderDownColor: "#ff4757",
    wickUpColor: "#17c987", wickDownColor: "#ff4757",
  });
  candleSeries.setData(candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));

  volumeChartApi = LightweightCharts.createChart(volEl, { ...chartOptions, height: 110 });
  volumeSeries = volumeChartApi.addHistogramSeries({ color: "#4098d7" });
  volumeSeries.setData(
    volumesTL.map((v, i) => ({
      time: v.time,
      value: v.volumeTL,
      color: candles[i].close >= candles[i].open ? "rgba(23,201,135,0.6)" : "rgba(255,71,87,0.6)",
    }))
  );

  priceChartApi.timeScale().fitContent();
  volumeChartApi.timeScale().fitContent();

  priceChartApi.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    volumeChartApi.timeScale().setVisibleLogicalRange(range);
  });
}

document.getElementById("rangeTabs").addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  document.querySelectorAll("#rangeTabs button").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  const range = e.target.dataset.range;
  if (!priceChartApi || !fullChartData) return;
  const days = { "1m": 21, "3m": 63, "6m": 126, "1y": 300 }[range];
  const candles = fullChartData.candles;
  const from = candles[Math.max(0, candles.length - days)].time;
  const to = candles[candles.length - 1].time;
  priceChartApi.timeScale().setVisibleRange({ from, to });
  volumeChartApi.timeScale().setVisibleRange({ from, to });
});

// ==========================================================================
// 9) TÜM SONUÇ EKRANINI RENDER ET
// ==========================================================================
function renderAll(symbol, d, f) {
  fullChartData = d;

  document.getElementById("stTicker").textContent = symbol;
  document.getElementById("stCompanyName").textContent = f.companyName;
  document.getElementById("stPrice").textContent = fmtTL(d.lastClose);

  const dayCls = changeClass(d.changes.daily);
  const dayEl = document.getElementById("stDayChange");
  dayEl.textContent = `${arrow(d.changes.daily)} ${fmtPct(d.changes.daily)} (bugün)`;
  dayEl.className = `day-change ${dayCls}`;

  // Analist hedef fiyatı
  const analystEl = document.getElementById("analystTarget");
  if (f.targetMeanPrice != null && f.targetMeanPrice > 0) {
    const pot = ((f.targetMeanPrice - d.lastClose) / d.lastClose) * 100;
    const potCls = pot > 1 ? "up" : pot < -1 ? "down" : "";
    analystEl.style.display = "block";
    analystEl.innerHTML = `
      <div class="target-row">
        <div class="target-item">
          <div class="target-label">Hedef Düşük</div>
          <div class="target-value">${f.targetLowPrice ? fmtTL(f.targetLowPrice) : "—"}</div>
        </div>
        <div class="target-item">
          <div class="target-label">Hedef Ortalama</div>
          <div class="target-value" style="color:var(--gold)">${fmtTL(f.targetMeanPrice)}</div>
        </div>
        <div class="target-item">
          <div class="target-label">Hedef Yüksek</div>
          <div class="target-value">${f.targetHighPrice ? fmtTL(f.targetHighPrice) : "—"}</div>
        </div>
        <div class="target-item">
          <div class="target-label">Potansiyel</div>
          <div class="target-value target-potential ${potCls}">${fmtPct(pot)}</div>
        </div>
      </div>`;
  } else {
    analystEl.style.display = "none";
  }

  const badgeDefs = [
    ["Günlük", d.changes.daily],
    ["Haftalık", d.changes.weekly],
    ["Aylık", d.changes.monthly],
    ["6 Aylık", d.changes.sixMonth],
    ["Yıllık", d.changes.yearly],
  ];
  document.getElementById("changeBadges").innerHTML = badgeDefs
    .map(([label, val]) => `
      <div class="badge">
        <div class="badge-label">${label}</div>
        <div class="badge-value ${changeClass(val)}">${fmtPct(val)}</div>
      </div>`)
    .join("");

  const lo = f.fiftyTwoWeekLow ?? d.week52Low;
  const hi = f.fiftyTwoWeekHigh ?? d.week52High;
  document.getElementById("range52Low").textContent = fmtTL(lo);
  document.getElementById("range52High").textContent = fmtTL(hi);
  const pct = hi > lo ? ((d.lastClose - lo) / (hi - lo)) * 100 : 50;
  document.getElementById("rangeMarker").style.left = `${Math.max(2, Math.min(98, pct))}%`;

  const distHigh = ((hi - d.lastClose) / d.lastClose) * 100;
  const distLow = ((d.lastClose - lo) / d.lastClose) * 100;
  document.getElementById("distToHigh").textContent = `+ ${fmtNum(distHigh)}%`;
  document.getElementById("distToLow").textContent = `- ${fmtNum(distLow)}%`;

  renderChart(d.candles, d.volumesTL);

  document.getElementById("dailyVolumeTL").textContent = fmtCompactTL(d.dailyVolumeTL);
  document.getElementById("dailyVolumeShares").textContent = `${fmtNum(d.dailyVolumeShares, 0)} adet`;
  document.getElementById("avgVolumeTL").textContent = fmtCompactTL(d.avgVolumeTL);
  document.getElementById("avgVolumeShares").textContent = `Ortalama ${fmtNum(d.avgVolumeShares, 0)} adet/gün`;
  drawMiniVolume(d.volumesTL);

  const rsiTag = d.rsi < 30 ? ["Aşırı Satım", "buy"] : d.rsi > 70 ? ["Aşırı Alım", "sell"] : ["Nötr", "neutral"];
  const maTag = d.lastClose > d.ma50 ? ["Fiyat > MA50", "buy"] : ["Fiyat < MA50", "sell"];
  const macdTag = d.macd > d.macdSignal ? ["Pozitif", "buy"] : ["Negatif", "sell"];
  const bollTag = d.lastClose > d.bollingerUpper ? ["Üst Bandın Üstü", "sell"]
    : d.lastClose < d.bollingerLower ? ["Alt Bandın Altı", "buy"]
    : ["Bant İçi", "neutral"];
  const stochTag = d.stochRsi > 80 ? ["Aşırı Alım", "sell"] : d.stochRsi < 20 ? ["Aşırı Satım", "buy"] : ["Nötr", "neutral"];
  document.getElementById("technicalRows").innerHTML = [
    rowHTML("RSI (14)", fmtNum(d.rsi), rsiTag),
    rowHTML("Stochastic RSI", fmtNum(d.stochRsi), stochTag),
    rowHTML("MA 50", fmtTL(d.ma50)),
    rowHTML("MA 200", fmtTL(d.ma200), maTag),
    rowHTML("MACD", fmtNum(d.macd, 3), macdTag),
    rowHTML("MACD Sinyal", fmtNum(d.macdSignal, 3)),
    rowHTML("Bollinger Üst Bant", fmtTL(d.bollingerUpper), bollTag),
    rowHTML("Bollinger Orta (MA20)", fmtTL(d.bollingerMid)),
    rowHTML("Bollinger Alt Bant", fmtTL(d.bollingerLower)),
    rowHTML("Beta", fmtNum(f.beta)),
  ].join("");

  // Defter değeri hesaplama (Fiyat / PD/DD)
  let bookValuePerShare = null;
  let bookValueNote = "";
  if (f.priceToBook != null && f.priceToBook > 0) {
    bookValuePerShare = d.lastClose / f.priceToBook;
    bookValueNote = f.priceToBook < 1 ? " (iskontolu)" : f.priceToBook > 2 ? " (primli)" : "";
  } else if (f.bookValue != null) {
    bookValuePerShare = f.bookValue;
  }

  document.getElementById("fundamentalRows").innerHTML = [
    rowHTML("Piyasa Değeri", fmtCompactTL(f.marketCap)),
    rowHTML("F/K (Trailing)", fmtNum(f.trailingPE)),
    rowHTML("F/K (Forward)", fmtNum(f.forwardPE)),
    rowHTML("PD/DD", fmtNum(f.priceToBook)),
    rowHTML("PD/Satış", fmtNum(f.priceToSales)),
    bookValuePerShare != null
      ? `<div class="data-row highlight-book"><span class="row-label">Defter Değeri (Hisse Başı)</span><span class="row-value" style="color:var(--gold)">${fmtTL(bookValuePerShare)}<span style="font-size:10px;color:var(--text-faint);margin-left:4px">${bookValueNote}</span></span></div>`
      : rowHTML("Defter Değeri (Hisse Başı)", "—"),
    rowHTML("Temettü Verimi", f.dividendYield != null ? fmtPct(f.dividendYield * 100) : "—"),
    rowHTML("Özkaynak Karlılığı (ROE)", f.returnOnEquity != null ? fmtPct(f.returnOnEquity * 100) : "—"),
    rowHTML("Net Kar Marjı", f.profitMargins != null ? fmtPct(f.profitMargins * 100) : "—"),
    rowHTML("Gelir Büyümesi", f.revenueGrowth != null ? fmtPct(f.revenueGrowth * 100) : "—"),
    rowHTML("Analist Sayısı", fmtNum(f.numberOfAnalysts, 0)),
  ].join("");

  const rec = computeRecommendation(d, f);
  drawGauge(rec.score, "gaugeSvg");
  const gaugeLabelEl = document.getElementById("gaugeLabel");
  gaugeLabelEl.textContent = rec.label;
  gaugeLabelEl.className = `gauge-label-big ${rec.cls}`;
  document.getElementById("gaugeScoreText").textContent = `SKOR: ${fmtNum(rec.score, 0)} / 100`;
  document.getElementById("gaugeFactors").innerHTML = rec.factors
    .map(([label, val]) => `<div class="factor">${label}: <b>${val}</b></div>`)
    .join("");

  const val = computeValuationScore(f);
  drawGauge(val.score, "valueGaugeSvg");
  const valueGaugeLabelEl = document.getElementById("valueGaugeLabel");
  valueGaugeLabelEl.textContent = val.label;
  valueGaugeLabelEl.className = `gauge-label-big ${val.cls}`;
  document.getElementById("valueGaugeScoreText").textContent = `SKOR: ${fmtNum(val.score, 0)} / 100`;
  document.getElementById("valueGaugeFactors").innerHTML = val.factors
    .map(([label, v]) => `<div class="factor">${label}: <b>${v}</b></div>`)
    .join("");
}

function rowHTML(label, value, tag) {
  const tagCls = tag ? tag[1] : null;
  const tagHtml = tag ? `<span class="status-tag ${tagCls}">${tag[0]}</span>` : "";
  return `<div class="data-row"><span class="row-label">${label}</span><span class="row-value">${value}${tagHtml}</span></div>`;
}

// ==========================================================================
// 10) KV (BULUT) VERİ YARDIMCILARI
// ==========================================================================
function getPass() { return localStorage.getItem(LS_PASS_KEY) || ""; }

async function kvGet(key) {
  const pass = getPass();
  const res = await fetch(`${WORKER_URL}/api/${key}?pass=${encodeURIComponent(pass)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "KV okuma hatası");
  return data;
}

async function kvPost(key, body) {
  const pass = getPass();
  const res = await fetch(`${WORKER_URL}/api/${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pass, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "KV yazma hatası");
  return data;
}

// ==========================================================================
// 11) PORTFÖY (KV tabanlı)
// ==========================================================================
async function loadPortfolio() {
  try { return await kvGet("portfolio"); }
  catch (e) { console.error("Portföy yüklenemedi:", e); return []; }
}

async function savePortfolio(positions) {
  try { await kvPost("portfolio", { positions }); }
  catch (e) { console.error("Portföy kaydedilemedi:", e); throw e; }
}

posAddBtn.addEventListener("click", addPosition);
[posSymbol, posQty, posCost].forEach((el) => {
  el.addEventListener("keydown", (e) => { if (e.key === "Enter") addPosition(); });
});

async function addPosition() {
  posError.textContent = "";
  const symbol = posSymbol.value.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  const qty = parseFloat(posQty.value);
  const cost = parseFloat(posCost.value);

  if (!symbol) { posError.textContent = "Hisse kodu gir (örn: ALARK)."; return; }
  if (!qty || qty <= 0) { posError.textContent = "Geçerli bir adet gir."; return; }
  if (!cost || cost <= 0) { posError.textContent = "Geçerli bir maliyet gir."; return; }

  try {
    const positions = await loadPortfolio();
    const existing = positions.find((p) => p.symbol === symbol);
    if (existing) {
      const totalQty = existing.qty + qty;
      existing.cost = (existing.qty * existing.cost + qty * cost) / totalQty;
      existing.qty = totalQty;
    } else {
      positions.push({ symbol, qty, cost });
    }
    await savePortfolio(positions);

    posSymbol.value = "";
    posQty.value = "";
    posCost.value = "";
    renderPortfolio();
  } catch (e) {
    posError.textContent = "Portföy kaydedilemedi: " + e.message;
  }
}

async function removePosition(symbol) {
  try {
    const positions = await loadPortfolio();
    const filtered = positions.filter((p) => p.symbol !== symbol);
    await savePortfolio(filtered);
    renderPortfolio();
  } catch (e) {
    console.error("Pozisyon silinemedi:", e);
  }
}

async function fetchQuickPrice(symbol) {
  const pass = getPass();
  const res = await fetchJSON(`${WORKER_URL}/api/chart?symbol=${symbol}&pass=${encodeURIComponent(pass)}&range=5d&interval=1d`);
  if (res.error) throw new Error(res.error);
  const result = res.data?.chart?.result?.[0];
  if (!result) throw new Error("veri yok");
  const meta = result.meta || {};
  const closes = (result.indicators.quote[0].close || []).filter((c) => c != null);
  const price = meta.regularMarketPrice != null ? meta.regularMarketPrice : closes[closes.length - 1];
  const prevClose = closes[closes.length - 2] ?? price;
  const dailyChangePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
  return { price, dailyChangePct };
}

async function renderPortfolio() {
  const positions = await loadPortfolio();
  portfolioEmpty.classList.toggle("visible", positions.length === 0);
  portfolioTableBody.innerHTML = "";
  portfolioSummary.innerHTML = "";
  donutSvg.innerHTML = "";
  donutLegend.innerHTML = "";

  if (positions.length === 0) return;

  portfolioTableBody.innerHTML = positions
    .map((p) => `<tr data-symbol="${p.symbol}"><td class="symbol-cell">${p.symbol}</td><td colspan="6" style="text-align:left;color:var(--text-faint)">Yükleniyor...</td></tr>`)
    .join("");

  const results = await Promise.allSettled(positions.map((p) => fetchQuickPrice(p.symbol)));

  let totalCost = 0, totalValue = 0, totalDailyChangeValue = 0;
  const rows = [];
  const allocation = [];

  positions.forEach((p, i) => {
    const r = results[i];
    const costValue = p.qty * p.cost;
    totalCost += costValue;

    if (r.status === "fulfilled") {
      const { price, dailyChangePct } = r.value;
      const value = p.qty * price;
      const gainValue = value - costValue;
      const gainPct = costValue ? (gainValue / costValue) * 100 : 0;
      const prevValue = value / (1 + dailyChangePct / 100);
      const dailyChangeValue = value - prevValue;

      totalValue += value;
      totalDailyChangeValue += dailyChangeValue;
      allocation.push({ symbol: p.symbol, value });

      rows.push(`
        <tr>
          <td class="symbol-cell">${p.symbol}</td>
          <td>${fmtNum(p.qty, 0)}</td>
          <td>${fmtTL(p.cost)}</td>
          <td>${fmtTL(price)}</td>
          <td>${fmtTL(value)}</td>
          <td class="${changeClass(gainValue)}">${gainValue >= 0 ? "+" : ""}${fmtTL(gainValue)}</td>
          <td class="${changeClass(gainPct)}">${fmtPct(gainPct)}</td>
          <td><button class="remove-btn" data-symbol="${p.symbol}">Sil</button></td>
        </tr>`);
    } else {
      totalValue += costValue;
      rows.push(`
        <tr>
          <td class="symbol-cell">${p.symbol}</td>
          <td>${fmtNum(p.qty, 0)}</td>
          <td>${fmtTL(p.cost)}</td>
          <td colspan="4" style="text-align:left;color:var(--down)">Veri alınamadı</td>
          <td><button class="remove-btn" data-symbol="${p.symbol}">Sil</button></td>
        </tr>`);
    }
  });

  portfolioTableBody.innerHTML = rows.join("");
  portfolioTableBody.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removePosition(btn.dataset.symbol));
  });

  const totalGainValue = totalValue - totalCost;
  const totalGainPct = totalCost ? (totalGainValue / totalCost) * 100 : 0;
  const dailyChangePctOfTotal = totalValue ? (totalDailyChangeValue / (totalValue - totalDailyChangeValue)) * 100 : 0;

  portfolioSummary.innerHTML = `
    <div class="summary-card">
      <div class="summary-label">Toplam Değer</div>
      <div class="summary-value">${fmtTL(totalValue)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Toplam Maliyet</div>
      <div class="summary-value">${fmtTL(totalCost)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Toplam Kâr/Zarar</div>
      <div class="summary-value ${changeClass(totalGainValue)}">${totalGainValue >= 0 ? "+" : ""}${fmtTL(totalGainValue)} (${fmtPct(totalGainPct)})</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Bugünkü Değişim</div>
      <div class="summary-value ${changeClass(totalDailyChangeValue)}">${totalDailyChangeValue >= 0 ? "+" : ""}${fmtTL(totalDailyChangeValue)} (${fmtPct(dailyChangePctOfTotal)})</div>
    </div>`;

  drawDonut(allocation, totalValue);
}

function drawDonut(allocation, total) {
  donutSvg.innerHTML = "";
  donutLegend.innerHTML = "";
  if (!total || allocation.length === 0) return;

  const colors = ["#d4af37", "#4098d7", "#17c987", "#ff4757", "#a672e0", "#e08f4a", "#4ac4c4", "#e05d9e"];
  const cx = 100, cy = 100, r = 80, innerR = 48;
  let startAngle = -Math.PI / 2;

  allocation
    .sort((a, b) => b.value - a.value)
    .forEach((a, i) => {
      const fraction = a.value / total;
      const endAngle = startAngle + fraction * Math.PI * 2;
      const color = colors[i % colors.length];

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
      const ix1 = cx + innerR * Math.cos(endAngle), iy1 = cy + innerR * Math.sin(endAngle);
      const ix2 = cx + innerR * Math.cos(startAngle), iy2 = cy + innerR * Math.sin(startAngle);
      const largeArc = fraction > 0.5 ? 1 : 0;

      path.setAttribute(
        "d",
        `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
      );
      path.setAttribute("fill", color);
      donutSvg.appendChild(path);

      const pct = fraction * 100;
      donutLegend.insertAdjacentHTML(
        "beforeend",
        `<div class="legend-row">
           <div class="legend-left"><span class="legend-dot" style="background:${color}"></span>${a.symbol}</div>
           <span class="legend-pct">${fmtNum(pct)}%</span>
         </div>`
      );

      startAngle = endAngle;
    });
}

// ==========================================================================
// 12) TAKİP LİSTESİ (KV tabanlı)
// ==========================================================================
async function loadWatchlist() {
  try { return await kvGet("watchlist"); }
  catch (e) { console.error("Takip listesi yüklenemedi:", e); return []; }
}

async function saveWatchlist(items) {
  try { await kvPost("watchlist", { items }); }
  catch (e) { console.error("Takip listesi kaydedilemedi:", e); throw e; }
}

wlAddBtn.addEventListener("click", addWatchlistItem);
wlSymbol.addEventListener("keydown", (e) => { if (e.key === "Enter") addWatchlistItem(); });

async function addWatchlistItem() {
  wlError.textContent = "";
  const symbol = wlSymbol.value.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");

  if (!symbol) { wlError.textContent = "Hisse kodu gir (örn: ALARK)."; return; }

  try {
    let price = null;
    try {
      const p = await fetchQuickPrice(symbol);
      price = p.price;
    } catch (e) {
      wlError.textContent = `"${symbol}" için fiyat alınamadı. Kodu kontrol et.`;
      return;
    }

    const items = await loadWatchlist();
    if (items.find((item) => item.symbol === symbol)) {
      wlError.textContent = `${symbol} zaten takip listende.`;
      return;
    }

    items.push({
      symbol,
      addedAt: Date.now(),
      addedPrice: price,
    });
    await saveWatchlist(items);

    wlSymbol.value = "";
    wlError.textContent = "";
    renderWatchlist();
    if (currentSymbol === symbol) syncWatchlistState();
  } catch (e) {
    wlError.textContent = "Takip listesine eklenemedi: " + e.message;
  }
}

async function removeWatchlistItem(symbol) {
  try {
    const items = await loadWatchlist();
    const filtered = items.filter((item) => item.symbol !== symbol);
    await saveWatchlist(filtered);
    renderWatchlist();
    if (currentSymbol === symbol) syncWatchlistState();
  } catch (e) {
    console.error("Takip öğesi silinemedi:", e);
  }
}

watchlistToggleBtn.addEventListener("click", async () => {
  if (!currentSymbol) return;
  try {
    const items = await loadWatchlist();
    const exists = items.find((item) => item.symbol === currentSymbol);
    if (exists) {
      await removeWatchlistItem(currentSymbol);
    } else {
      try {
        const p = await fetchQuickPrice(currentSymbol);
        items.push({
          symbol: currentSymbol,
          addedAt: Date.now(),
          addedPrice: p.price,
        });
        await saveWatchlist(items);
      } catch (e) {
        console.error("Takip eklenemedi:", e);
      }
    }
    syncWatchlistState();
  } catch (e) {
    console.error("Takip durumu değiştirilemedi:", e);
  }
});

async function syncWatchlistState() {
  if (!currentSymbol) {
    watchlistToggleBtn.textContent = "★ Takip Ekle";
    watchlistToggleBtn.classList.remove("following");
    return;
  }
  try {
    const items = await loadWatchlist();
    const exists = items.find((item) => item.symbol === currentSymbol);
    if (exists) {
      watchlistToggleBtn.textContent = "★ Takip Ediliyor";
      watchlistToggleBtn.classList.add("following");
    } else {
      watchlistToggleBtn.textContent = "★ Takip Ekle";
      watchlistToggleBtn.classList.remove("following");
    }
  } catch (e) {
    console.error("Takip durumu kontrol edilemedi:", e);
  }
}

async function renderWatchlist() {
  const items = await loadWatchlist();
  watchlistEmpty.classList.toggle("visible", items.length === 0);
  watchlistTableBody.innerHTML = "";

  if (items.length === 0) return;

  const results = await Promise.allSettled(items.map((item) => fetchQuickPrice(item.symbol)));

  const rows = items.map((item, i) => {
    const r = results[i];
    if (r.status === "fulfilled") {
      const { price, dailyChangePct } = r.value;
      const addedChangePct = item.addedPrice ? ((price - item.addedPrice) / item.addedPrice) * 100 : null;
      return `
        <tr>
          <td class="symbol-cell">${item.symbol}</td>
          <td>${fmtTL(price)}</td>
          <td class="${changeClass(dailyChangePct)}">${fmtPct(dailyChangePct)}</td>
          <td>${fmtDate(item.addedAt)}</td>
          <td>${fmtTL(item.addedPrice)}</td>
          <td class="${changeClass(addedChangePct)}">${addedChangePct != null ? fmtPct(addedChangePct) : "—"}</td>
          <td><button class="remove-btn" data-symbol="${item.symbol}">Çıkar</button></td>
        </tr>`;
    } else {
      return `
        <tr>
          <td class="symbol-cell">${item.symbol}</td>
          <td colspan="5" style="text-align:left;color:var(--down)">Veri alınamadı</td>
          <td><button class="remove-btn" data-symbol="${item.symbol}">Çıkar</button></td>
        </tr>`;
    }
  });

  watchlistTableBody.innerHTML = rows.join("");
  watchlistTableBody.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeWatchlistItem(btn.dataset.symbol));
  });
}

// ==========================================================================
// 13) KARŞILAŞTIRMA EKRANI
// ==========================================================================
cmpBtn.addEventListener("click", runCompare);
[cmpSymbol1, cmpSymbol2, cmpSymbol3].forEach((el) => {
  el.addEventListener("keydown", (e) => { if (e.key === "Enter") runCompare(); });
});

async function fetchFullData(symbol) {
  const pass = getPass();
  const [chartRes, quoteRes] = await Promise.all([
    fetchJSON(`${WORKER_URL}/api/chart?symbol=${symbol}&pass=${encodeURIComponent(pass)}`),
    fetchJSON(`${WORKER_URL}/api/quote?symbol=${symbol}&pass=${encodeURIComponent(pass)}`),
  ]);
  if (chartRes.error || quoteRes.error) throw new Error(chartRes.error || quoteRes.error);
  const chartResult = chartRes.data?.chart?.result?.[0];
  if (!chartResult || !chartResult.timestamp) throw new Error(`"${symbol}" bulunamadı.`);
  const d = processChartData(chartResult);
  const f = processFundamentals(quoteRes.data);
  const rec = computeRecommendation(d, f);
  const val = computeValuationScore(f);
  return { symbol, d, f, rec, val };
}

async function runCompare() {
  cmpError.textContent = "";
  const symbols = [cmpSymbol1.value, cmpSymbol2.value, cmpSymbol3.value]
    .map((v) => v.toUpperCase().trim().replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean);

  if (symbols.length < 2) {
    cmpError.textContent = "Karşılaştırmak için en az 2 hisse kodu gir.";
    return;
  }

  cmpResultCard.style.display = "none";
  cmpLoading.classList.add("active");

  try {
    const results = await Promise.all(symbols.map((s) => fetchFullData(s)));
    renderCompareTable(results);
    cmpLoading.classList.remove("active");
    cmpResultCard.style.display = "block";
  } catch (err) {
    cmpLoading.classList.remove("active");
    cmpError.textContent = err.message || "Bir hata oluştu, tekrar dene.";
  }
}

function buildMetricRow(label, results, getValue, formatter, higherIsBetter = true) {
  const values = results.map((r) => getValue(r));
  const validValues = values.filter((v) => v != null && !isNaN(v));
  let bestValue = null;
  if (validValues.length > 1) {
    bestValue = higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
  }
  const cells = values
    .map((v) => {
      const isBest = bestValue != null && v === bestValue;
      return `<td class="${isBest ? "best-value" : ""}">${formatter(v)}</td>`;
    })
    .join("");
  return `<tr><td>${label}</td>${cells}</tr>`;
}

function renderCompareTable(results) {
  const headerRow = `<tr><th>Metrik</th>${results.map((r) => `<th class="symbol-cell">${r.symbol}</th>`).join("")}</tr>`;

  const rows = [
    buildMetricRow("Güncel Fiyat", results, (r) => r.d.lastClose, (v) => fmtTL(v), true),
    buildMetricRow("Günlük Değişim", results, (r) => r.d.changes.daily, (v) => fmtPct(v), true),
    buildMetricRow("Yıllık Değişim", results, (r) => r.d.changes.yearly, (v) => fmtPct(v), true),
    buildMetricRow("52H Konumu (%)", results, (r) => {
      const lo = r.f.fiftyTwoWeekLow ?? r.d.week52Low, hi = r.f.fiftyTwoWeekHigh ?? r.d.week52High;
      return hi > lo ? ((r.d.lastClose - lo) / (hi - lo)) * 100 : null;
    }, (v) => (v != null ? `${fmtNum(v, 0)}%` : "—"), false),
    buildMetricRow("F/K (Trailing)", results, (r) => r.f.trailingPE, (v) => fmtNum(v), false),
    buildMetricRow("PD/DD", results, (r) => r.f.priceToBook, (v) => fmtNum(v), false),
    buildMetricRow("PD/Satış", results, (r) => r.f.priceToSales, (v) => fmtNum(v), false),
    buildMetricRow("Temettü Verimi", results, (r) => (r.f.dividendYield != null ? r.f.dividendYield * 100 : null), (v) => (v != null ? fmtPct(v) : "—"), true),
    buildMetricRow("ROE", results, (r) => (r.f.returnOnEquity != null ? r.f.returnOnEquity * 100 : null), (v) => (v != null ? fmtPct(v) : "—"), true),
    buildMetricRow("Net Kar Marjı", results, (r) => (r.f.profitMargins != null ? r.f.profitMargins * 100 : null), (v) => (v != null ? fmtPct(v) : "—"), true),
    buildMetricRow("RSI (14)", results, (r) => r.d.rsi, (v) => fmtNum(v), false),
    buildMetricRow("Ort. Hacim (TL)", results, (r) => r.d.avgVolumeTL, (v) => fmtCompactTL(v), true),
  ];

  const recScores = results.map((r) => r.rec.score);
  const bestRecScore = Math.max(...recScores);
  rows.push(`<tr><td>AL/SAT Skoru</td>${results.map((r) => `<td class="${r.rec.score === bestRecScore ? "best-value" : ""}">${fmtNum(r.rec.score, 0)} (${r.rec.label})</td>`).join("")}</tr>`);

  const valScores = results.map((r) => r.val.score);
  const bestValScore = Math.max(...valScores);
  rows.push(`<tr><td>Değerleme Skoru</td>${results.map((r) => `<td class="${r.val.score === bestValScore ? "best-value" : ""}">${fmtNum(r.val.score, 0)} (${r.val.label})</td>`).join("")}</tr>`);

  compareTable.innerHTML = `<thead>${headerRow}</thead><tbody>${rows.join("")}</tbody>`;
}
