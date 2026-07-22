/* ==========================================================================
   BIST TERMİNAL — app.js
   Kilit ekranı -> boş arama ekranı -> arama yapılınca Worker'dan veri çekme
   -> teknik/temel hesaplama -> profesyonel sonuç ekranı render
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

let priceChartApi = null;
let volumeChartApi = null;
let candleSeries = null;
let volumeSeries = null;
let fullChartData = null; // { candles: [...], volumesTL: [...] }

// ==========================================================================
// 1) GİRİŞ / ŞİFRE
// ==========================================================================
function tryEnterApp() {
  const saved = localStorage.getItem(LS_PASS_KEY);
  if (saved) {
    lockScreen.style.display = "none";
    appEl.style.display = "block";
  }
}

passSubmit.addEventListener("click", handlePasswordSubmit);
passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handlePasswordSubmit(); });

function handlePasswordSubmit() {
  const val = passInput.value.trim();
  if (!val) { lockError.textContent = "Lütfen şifre gir."; return; }
  // Not: gerçek doğrulama Worker tarafında yapılır (bkz. worker.js).
  // Burada şifreyi sadece localStorage'a kaydediyoruz; yanlış girilirse
  // ilk arama isteğinde Worker 401 döner ve kullanıcı bilgilendirilir.
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

async function runSearch(rawSymbol) {
  const symbol = (rawSymbol || "").toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
  searchError.textContent = "";
  if (!symbol) { searchError.textContent = "Lütfen bir hisse kodu gir (örn: ALARK)."; return; }

  showLoading(true, `${symbol} için veri çekiliyor...`);

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

    renderAll(symbol, processed, fundamentals);
    showLoading(false);
    resultScreen.classList.add("active");
    searchScreen.classList.add("hidden");
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
  const lastClose = closes[closes.length - 1];
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

  // Teknik göstergeler
  const rsi = calcRSI(closes, 14);
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  const macd = calcMACD(closes);

  return {
    candles,
    volumesTL,
    lastClose,
    changes,
    week52Low,
    week52High,
    avgVolumeTL,
    avgVolumeShares: last30Shares,
    rsi: rsi[rsi.length - 1],
    ma50: ma50[ma50.length - 1],
    ma200: ma200[ma200.length - 1],
    macd: macd.macdLine[macd.macdLine.length - 1],
    macdSignal: macd.signalLine[macd.signalLine.length - 1],
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
    if (typeof v === "object" && "raw" in v) return v.raw; // eski (formatted) yapı
    return v; // formatted=false ile gelen düz değer
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

// ==========================================================================
// 5) AL/SAT PUANLAMA
// ==========================================================================
function computeRecommendation(d, f) {
  let score = 50;
  const factors = [];

  // RSI
  if (d.rsi != null) {
    if (d.rsi < 30) { score += 20; factors.push(["RSI aşırı satım", "+20"]); }
    else if (d.rsi < 45) { score += 8; factors.push(["RSI zayıf bölge", "+8"]); }
    else if (d.rsi <= 55) { factors.push(["RSI nötr", "0"]); }
    else if (d.rsi <= 70) { score -= 8; factors.push(["RSI güçlü bölge", "-8"]); }
    else { score -= 20; factors.push(["RSI aşırı alım", "-20"]); }
  }

  // MA trend
  if (d.ma50 != null && d.ma200 != null) {
    if (d.lastClose > d.ma50 && d.ma50 > d.ma200) { score += 18; factors.push(["Trend: yükseliş (Golden)", "+18"]); }
    else if (d.lastClose < d.ma50 && d.ma50 < d.ma200) { score -= 18; factors.push(["Trend: düşüş (Death)", "-18"]); }
    else { factors.push(["Trend: karışık", "0"]); }
  }

  // MACD
  if (d.macd != null && d.macdSignal != null) {
    if (d.macd > d.macdSignal) { score += 12; factors.push(["MACD pozitif kesişim", "+12"]); }
    else { score -= 12; factors.push(["MACD negatif kesişim", "-12"]); }
  }

  // Yıllık momentum
  const y = d.changes.yearly;
  if (y > 25) { score += 8; factors.push(["Güçlü yıllık momentum", "+8"]); }
  else if (y < -25) { score -= 8; factors.push(["Zayıf yıllık momentum", "-8"]); }

  // Analist ortalaması (1=Strong Buy .. 5=Strong Sell)
  if (f.recommendationMean != null) {
    const rm = f.recommendationMean;
    const analystScore = ((3 - rm) / 2) * 15; // rm=1 -> +15, rm=5 -> -15
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
// 6) GAUGE (AL/SAT yarım-ay göstergesi) - SVG çizimi
// ==========================================================================
function drawGauge(score) {
  const svg = document.getElementById("gaugeSvg");
  svg.innerHTML = "";
  const cx = 140, cy = 140, r = 110;
  const startAngle = Math.PI; // 180°
  const endAngle = 0; // 0°

  // Arka plan yayı (renk geçişli)
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

  // İbre (needle)
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

  // Uç etiketleri
  const labelStyle = { "font-family": "JetBrains Mono, monospace", "font-size": "10.5px", fill: "#4c5768" };
  addSvgText(svg, cx - r - 4, cy + 18, "SAT", labelStyle);
  addSvgText(svg, cx + r - 14, cy + 18, "AL", labelStyle);
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

  // İki grafiği senkronize kaydır/yakınlaştır
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

  // Değişim rozetleri
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

  // 52 hafta aralığı
  const lo = f.fiftyTwoWeekLow ?? d.week52Low;
  const hi = f.fiftyTwoWeekHigh ?? d.week52High;
  document.getElementById("range52Low").textContent = fmtTL(lo);
  document.getElementById("range52High").textContent = fmtTL(hi);
  const pct = hi > lo ? ((d.lastClose - lo) / (hi - lo)) * 100 : 50;
  document.getElementById("rangeMarker").style.left = `${Math.max(2, Math.min(98, pct))}%`;

  const distHigh = ((hi - d.lastClose) / hi) * 100;
  const distLow = ((d.lastClose - lo) / lo) * 100;
  document.getElementById("distToHigh").textContent = `- ${fmtNum(distHigh)}%`;
  document.getElementById("distToLow").textContent = `+ ${fmtNum(distLow)}%`;

  // Grafik
  renderChart(d.candles, d.volumesTL);

  // Hacim kartı
  document.getElementById("avgVolumeTL").textContent = fmtCompactTL(d.avgVolumeTL);
  document.getElementById("avgVolumeShares").textContent = `Ortalama ${fmtNum(d.avgVolumeShares, 0)} adet/gün`;
  drawMiniVolume(d.volumesTL);

  // Teknik göstergeler paneli
  const rsiTag = d.rsi < 30 ? ["Aşırı Satım", "buy"] : d.rsi > 70 ? ["Aşırı Alım", "sell"] : ["Nötr", "neutral"];
  const maTag = d.lastClose > d.ma50 ? ["Fiyat > MA50", "buy"] : ["Fiyat < MA50", "sell"];
  const macdTag = d.macd > d.macdSignal ? ["Pozitif", "buy"] : ["Negatif", "sell"];
  document.getElementById("technicalRows").innerHTML = [
    rowHTML("RSI (14)", fmtNum(d.rsi), rsiTag),
    rowHTML("MA 50", fmtTL(d.ma50)),
    rowHTML("MA 200", fmtTL(d.ma200), maTag),
    rowHTML("MACD", fmtNum(d.macd, 3), macdTag),
    rowHTML("MACD Sinyal", fmtNum(d.macdSignal, 3)),
    rowHTML("Beta", fmtNum(f.beta)),
  ].join("");

  // Temel veriler paneli
  document.getElementById("fundamentalRows").innerHTML = [
    rowHTML("Piyasa Değeri", fmtCompactTL(f.marketCap)),
    rowHTML("F/K (Trailing)", fmtNum(f.trailingPE)),
    rowHTML("F/K (Forward)", fmtNum(f.forwardPE)),
    rowHTML("PD/DD", fmtNum(f.priceToBook)),
    rowHTML("Temettü Verimi", f.dividendYield != null ? fmtPct(f.dividendYield * 100) : "—"),
    rowHTML("Özkaynak Karlılığı (ROE)", f.returnOnEquity != null ? fmtPct(f.returnOnEquity * 100) : "—"),
    rowHTML("Net Kar Marjı", f.profitMargins != null ? fmtPct(f.profitMargins * 100) : "—"),
    rowHTML("Gelir Büyümesi", f.revenueGrowth != null ? fmtPct(f.revenueGrowth * 100) : "—"),
    rowHTML("Analist Sayısı", fmtNum(f.numberOfAnalysts, 0)),
  ].join("");

  // AL/SAT gauge
  const rec = computeRecommendation(d, f);
  drawGauge(rec.score);
  const gaugeLabelEl = document.getElementById("gaugeLabel");
  gaugeLabelEl.textContent = rec.label;
  gaugeLabelEl.className = `gauge-label-big ${rec.cls}`;
  document.getElementById("gaugeScoreText").textContent = `SKOR: ${fmtNum(rec.score, 0)} / 100`;
  document.getElementById("gaugeFactors").innerHTML = rec.factors
    .map(([label, val]) => `<div class="factor">${label}: <b>${val}</b></div>`)
    .join("");
}

function rowHTML(label, value, tag) {
  const tagCls = tag ? tag[1] : null;
  const tagHtml = tag ? `<span class="status-tag ${tagCls}">${tag[0]}</span>` : "";
  return `<div class="data-row"><span class="row-label">${label}</span><span class="row-value">${value}${tagHtml}</span></div>`;
}
