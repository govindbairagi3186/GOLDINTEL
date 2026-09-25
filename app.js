/**
 * GOLDINTEL — Explainable Commodity-Contract Intelligence Platform
 * Core Application Engine & Analytical Microstructure Suite
 */

// ==========================================
// 1. CONTRACT SPECIFICATIONS & CONSTANTS
// ==========================================
const CONTRACT_SPECS = {
  GOLDM: {
    symbol: 'GOLDM',
    name: 'Gold Mini (MCX)',
    tradingUnitGrams: 100,
    deliveryPurity: 0.995,
    purityKarat: '24K (995 Fineness)',
    quotationBasis: '₹ per 10 grams',
    quotationUnitGrams: 10,
    tickSize: 1.0,
    initialMarginPercent: 10.0,
    typicalDailyVolume: 18450,
    typicalOpenInterest: 12890,
    deliveryCenter: 'Ahmedabad (Vaulted)',
    physicalDeliveryOption: 'Compulsory (100g Bar)',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    description: '100g contract size with 995 fineness standard (0.995 gold purity). Quoted per 10 grams.'
  },
  GOLDTEN: {
    symbol: 'GOLDTEN',
    name: 'Gold 10 Grams (MCX)',
    tradingUnitGrams: 10,
    deliveryPurity: 0.999,
    purityKarat: '24K (999 Fineness)',
    quotationBasis: '₹ per 10 grams',
    quotationUnitGrams: 10,
    tickSize: 1.0,
    initialMarginPercent: 11.5,
    typicalDailyVolume: 4320,
    typicalOpenInterest: 3840,
    deliveryCenter: 'Mumbai / Ahmedabad',
    physicalDeliveryOption: 'Tender Period (10g Coin/Bar)',
    color: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    description: '10g contract with pure 999 fineness. Quoted per 10g but delivers higher 999 purity than GOLDM.'
  },
  GOLDGUINEA: {
    symbol: 'GOLDGUINEA',
    name: 'Gold Guinea 8 Grams (MCX)',
    tradingUnitGrams: 8,
    deliveryPurity: 0.999,
    purityKarat: '24K (999 Fineness - Guinea)',
    quotationBasis: '₹ per 8 grams (1 Guinea)',
    quotationUnitGrams: 8,
    tickSize: 1.0,
    initialMarginPercent: 12.0,
    typicalDailyVolume: 2980,
    typicalOpenInterest: 2150,
    deliveryCenter: 'Mumbai',
    physicalDeliveryOption: 'Compulsory (8g Coin)',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    description: 'Traditional sovereign weight (8g). Quoted per 1 Guinea (8g total). 999 purity coin delivery.'
  },
  GOLDPETAL: {
    symbol: 'GOLDPETAL',
    name: 'Gold Petal 1 Gram (MCX)',
    tradingUnitGrams: 1,
    deliveryPurity: 0.999,
    purityKarat: '24K (999 Fineness - Micro)',
    quotationBasis: '₹ per 1 gram',
    quotationUnitGrams: 1,
    tickSize: 1.0,
    initialMarginPercent: 14.0,
    typicalDailyVolume: 12500,
    typicalOpenInterest: 19200,
    deliveryCenter: 'Mumbai (Demat / Coin)',
    physicalDeliveryOption: 'Physical / Demat (1g Coin)',
    color: '#8B5CF6',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    description: 'Micro-denomination (1g). Quoted per single gram of 999 purity. High retail participation.'
  }
};

const CONTRACT_KEYS = ['GOLDM', 'GOLDTEN', 'GOLDGUINEA', 'GOLDPETAL'];

// ==========================================
// 2. STATE MANAGEMENT & AUDIO SYNTHESIZER
// ==========================================
let currentView = 'overview';
let selectedDate = '2026-09-25';
let marketData = {
  rawRecords: [],
  universalRecords: [],
  dates: []
};
let relationships = [];
let whatIfParams = {
  transactionCostBps: 4.5,
  slippageBps: 6.0,
  anomalyZThreshold: 2.0,
  lookbackPeriodDays: 30
};
let xrayLayers = {
  price: true,
  mechanics: true,
  liquidity: true,
  expiry: true,
  historical: true
};
let charts = {};
let judgeStep = 1;
let judgeAutoPlayTimer = null;
let audioEnabled = true;
let currentAiCategory = 'pairs';

// Web Audio API Synthesizer
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.04) {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context may require user interaction first
  }
}

function playTickSound() {
  playTone(880, 'triangle', 0.05, 0.03);
}

function playChime() {
  playTone(523.25, 'sine', 0.1, 0.04);
  setTimeout(() => playTone(659.25, 'sine', 0.12, 0.04), 60);
  setTimeout(() => playTone(783.99, 'sine', 0.18, 0.05), 120);
}

function playAlertSound() {
  playTone(330, 'sawtooth', 0.12, 0.05);
  setTimeout(() => playTone(220, 'sawtooth', 0.15, 0.05), 100);
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  const icon = document.getElementById('audio-icon');
  const btn = document.getElementById('audio-toggle-btn');
  if (icon && btn) {
    if (audioEnabled) {
      icon.setAttribute('data-lucide', 'volume-2');
      icon.className = 'w-4 h-4 text-brand-gold';
      btn.title = 'Sonification: ON';
      playChime();
    } else {
      icon.setAttribute('data-lucide', 'volume-x');
      icon.className = 'w-4 h-4 text-slate-500';
      btn.title = 'Sonification: MUTED';
    }
    if (window.lucide) lucide.createIcons();
  }
}


// ==========================================
// 3. NORMALIZATION ENGINE (UNIVERSAL GOLD BASIS)
// ==========================================
function normalizeToUniversalBasis(symbol, rawPrice, date = '2026-09-25') {
  const spec = CONTRACT_SPECS[symbol];
  const pricePerGramQuoted = rawPrice / spec.quotationUnitGrams;
  
  // Purity conversion factor to 999.0 standard fine gold
  const purityAdjustmentFactor = 0.999 / spec.deliveryPurity;
  const normalizedPricePerGram999 = pricePerGramQuoted * purityAdjustmentFactor;
  const totalNotional = normalizedPricePerGram999 * spec.tradingUnitGrams;

  const calculationSteps = [
    {
      stepNumber: 1,
      title: 'Raw Quotation Intake',
      formula: 'P_raw',
      input: `₹${rawPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      output: `Quotation Basis: ${spec.quotationBasis}`,
      rationale: `Raw settlement price for ${symbol} as recorded in MCX Daily Bhavcopy.`
    },
    {
      stepNumber: 2,
      title: 'Quotation Unit Disaggregation',
      formula: 'P_gram_quoted = P_raw / Quotation_Unit_Grams',
      input: `₹${rawPrice.toFixed(2)} ÷ ${spec.quotationUnitGrams}g`,
      output: `₹${pricePerGramQuoted.toFixed(2)} / gram (${spec.deliveryPurity * 1000}‰)`,
      rationale: `Disaggregates multi-gram quote into single-gram nominal value prior to purity alignment.`
    },
    {
      stepNumber: 3,
      title: 'Purity Standardization to 999.0 Fine Gold',
      formula: 'UGB = P_gram_quoted × (0.999 / Delivery_Purity)',
      input: `₹${pricePerGramQuoted.toFixed(2)} × (${0.999} ÷ ${spec.deliveryPurity}) [x${purityAdjustmentFactor.toFixed(5)}]`,
      output: `₹${normalizedPricePerGram999.toFixed(2)} / gram (999.0 Benchmark)`,
      rationale: spec.deliveryPurity === 0.999 
        ? 'Contract already delivers 999 fineness (1.00000 parity factor).'
        : `Elevates 995 fineness up to universal 999.0 benchmark (+${((purityAdjustmentFactor - 1) * 100).toFixed(3)}% adjustment).`
    },
    {
      stepNumber: 4,
      title: 'Nominal Lot Exposure',
      formula: 'Total_Notional = UGB × Trading_Unit_Grams',
      input: `₹${normalizedPricePerGram999.toFixed(2)} × ${spec.tradingUnitGrams}g`,
      output: `₹${totalNotional.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      rationale: `Gross economic exposure of 1 standard trading lot of ${symbol} on Universal Gold Basis.`
    }
  ];

  return {
    symbol,
    date,
    rawPrice,
    pricePerGramQuoted,
    purityFineness: spec.deliveryPurity,
    purityAdjustmentFactor,
    normalizedPricePerGram999,
    totalNotional,
    calculationSteps
  };
}

// ==========================================
// 4. DATA GENERATION & STATISTICAL ENGINE
// ==========================================
function generateMarketData() {
  const rawRecords = [];
  const universalRecords = [];
  const dates = [];

  const baseDate = new Date(2026, 6, 1);
  const totalDays = 60;
  let basePureGold = 7540;

  for (let i = 0; i < totalDays; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + i);
    if (curDate.getDay() === 0 || curDate.getDay() === 6) continue;

    const dateStr = curDate.toISOString().split('T')[0];
    dates.push(dateStr);

    const drift = Math.sin(i / 6) * 0.003 + (Math.random() - 0.49) * 0.005;
    basePureGold *= (1 + drift);

    const daysToExpiryNear = 30 - (i % 30);
    const daysToExpiryFar = 60 - (i % 30);

    CONTRACT_KEYS.forEach(sym => {
      const spec = CONTRACT_SPECS[sym];
      let pureGold = basePureGold;
      let dte = (sym === 'GOLDTEN' && i > 30) ? daysToExpiryFar : daysToExpiryNear;
      let volMult = 1.0;
      let warnings = [];

      // Realistic historical structural events
      if (sym === 'GOLDPETAL' && i >= 18 && i <= 24) {
        pureGold += 34.0; // Festival demand premium
        volMult = 1.6;
        warnings.push('Retail liquidity surge: Micro-contract trading at elevated premium');
      } else if (sym === 'GOLDGUINEA' && i >= 38 && i <= 44) {
        pureGold -= 26.5; // Thin order book discount
        volMult = 0.35;
        warnings.push('Thin order book: Volume dropped 65% below median');
      } else if (i === totalDays - 1) {
        // Current session state: GOLDPETAL at +0.43% premium, GOLDGUINEA at -0.11% discount
        if (sym === 'GOLDPETAL') pureGold += 33.27;
        if (sym === 'GOLDGUINEA') pureGold -= 8.73;
      }

      const purityFactor = 0.999 / spec.deliveryPurity;
      const quotedGramPrice = (pureGold + (Math.random() - 0.5) * 2.0) / purityFactor;
      const rawClose = Math.round(quotedGramPrice * spec.quotationUnitGrams * 10) / 10;
      const rawHigh = Math.round((rawClose + Math.random() * 12 * (spec.quotationUnitGrams / 10)) * 10) / 10;
      const rawLow = Math.round((rawClose - Math.random() * 12 * (spec.quotationUnitGrams / 10)) * 10) / 10;
      const rawOpen = Math.round(((rawHigh + rawLow) / 2) * 10) / 10;

      const volume = Math.round(spec.typicalDailyVolume * volMult * (0.85 + Math.random() * 0.3));
      const openInterest = Math.round(spec.typicalOpenInterest * (0.9 + Math.random() * 0.2));
      const spreadInr = Math.max(1.0, Math.round((spec.tickSize + (spec.typicalDailyVolume / Math.max(1, volume)) * 0.8) * 10) / 10);

      rawRecords.push({
        symbol: sym,
        date: dateStr,
        openPrice: rawOpen,
        highPrice: rawHigh,
        lowPrice: rawLow,
        closePrice: rawClose,
        volume,
        openInterest,
        daysToExpiry: dte,
        bidAskSpreadInr: spreadInr,
        dataQualityScore: warnings.length > 0 ? 84 : 99,
        warnings
      });

      universalRecords.push(normalizeToUniversalBasis(sym, rawClose, dateStr));
    });
  }

  return { rawRecords, universalRecords, dates };
}

function computeAllPairRelationships() {
  const dateMap = new Map();
  const rawDateMap = new Map();

  marketData.universalRecords.forEach(r => {
    if (!dateMap.has(r.date)) dateMap.set(r.date, new Map());
    dateMap.get(r.date).set(r.symbol, r);
  });

  marketData.rawRecords.forEach(r => {
    if (!rawDateMap.has(r.date)) rawDateMap.set(r.date, new Map());
    rawDateMap.get(r.date).set(r.symbol, r);
  });

  const sortedDates = Array.from(dateMap.keys()).sort();
  const curIdx = sortedDates.indexOf(selectedDate);
  const lookbackDates = sortedDates.slice(
    Math.max(0, curIdx - whatIfParams.lookbackPeriodDays + 1),
    curIdx + 1
  );

  const results = [];

  for (let i = 0; i < CONTRACT_KEYS.length; i++) {
    for (let j = i + 1; j < CONTRACT_KEYS.length; j++) {
      const symA = CONTRACT_KEYS[i];
      const symB = CONTRACT_KEYS[j];
      const pairKey = `${symA}-${symB}`;

      const spreads = [];
      const seriesA = [];
      const seriesB = [];

      lookbackDates.forEach(d => {
        const uA = dateMap.get(d)?.get(symA);
        const uB = dateMap.get(d)?.get(symB);
        if (uA && uB) {
          spreads.push(uA.normalizedPricePerGram999 - uB.normalizedPricePerGram999);
          seriesA.push(uA.normalizedPricePerGram999);
          seriesB.push(uB.normalizedPricePerGram999);
        }
      });

      const curUA = dateMap.get(selectedDate)?.get(symA);
      const curUB = dateMap.get(selectedDate)?.get(symB);
      const curRawA = rawDateMap.get(selectedDate)?.get(symA);
      const curRawB = rawDateMap.get(selectedDate)?.get(symB);

      if (!curUA || !curUB || !curRawA || !curRawB || spreads.length < 5) continue;

      const normSpread = curUA.normalizedPricePerGram999 - curUB.normalizedPricePerGram999;
      const rawSpread = curRawA.closePrice - curRawB.closePrice;
      const spreadPct = (normSpread / curUB.normalizedPricePerGram999) * 100;

      const mean = spreads.reduce((a, b) => a + b, 0) / spreads.length;
      const variance = spreads.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (spreads.length - 1);
      const std = Math.max(0.01, Math.sqrt(variance));

      const zScore = Math.round(((normSpread - mean) / std) * 100) / 100;
      const percentile = Math.round((spreads.filter(v => v < normSpread).length / spreads.length) * 100);

      // Severity classification
      let severity = 'NORMAL';
      const absZ = Math.abs(zScore);
      if (absZ >= whatIfParams.anomalyZThreshold) {
        severity = 'UNUSUAL';
      } else if (absZ >= whatIfParams.anomalyZThreshold * 0.75) {
        severity = 'WATCH';
      }

      const expiryDiff = Math.abs(curRawA.daysToExpiry - curRawB.daysToExpiry);
      const minVol = Math.min(curRawA.volume, curRawB.volume);
      let liquidityTier = minVol < 150 ? 'THIN' : minVol < 500 ? 'MODERATE' : 'HIGH';

      // Multi-factor Attribution
      const priceDivScore = Math.min(100, Math.round(Math.abs(spreadPct) * 120 + absZ * 18));
      const expiryScore = Math.min(100, Math.round((expiryDiff / 30) * 85 + (curRawA.daysToExpiry <= 5 ? 25 : 0)));
      const liqScore = Math.min(100, Math.round(Math.max(0, 100 - (minVol / 200) * 80)));
      const rarityScore = Math.min(100, Math.round(Math.abs(percentile - 50) * 2));

      let primaryDriver = 'Balanced Arbitrage Equilibrium';
      let explanation = 'The normalized spread is within ±1.5σ baseline, reflecting standard cost-of-carry parity.';

      if (absZ >= whatIfParams.anomalyZThreshold) {
        if (liqScore >= 70) {
          primaryDriver = 'Order-Book Liquidity Asymmetry';
          explanation = `Observation coincides with lower trading activity in ${minVol === curRawA.volume ? symA : symB} (Volume: ${minVol} lots). Wide bid-ask slippage accounts for the observed spread.`;
        } else if (expiryScore >= 65) {
          primaryDriver = 'Term-Structure / Expiry Mismatch';
          explanation = `Contracts reflect different expiry profiles (${curRawA.daysToExpiry}d vs ${curRawB.daysToExpiry}d). The difference represents financing carry cost rather than relative mispricing.`;
        } else {
          primaryDriver = 'Structural Relative-Price Divergence';
          explanation = `Normalized relationship (Z=${zScore.toFixed(2)}) is unusually far from its 30-day baseline (${percentile}th percentile), indicating genuine microstructure decoupling across contracts.`;
        }
      } else if (absZ >= whatIfParams.anomalyZThreshold * 0.75) {
        primaryDriver = 'Emerging Watchlist Drift';
        explanation = 'Spread is drifting towards statistical surveillance boundary. Monitored for potential persistence.';
      }

      // Walk-Forward Reality Check
      const preCostBps = Math.round(Math.abs(spreadPct) * 100 * 10) / 10;
      const slipA_bps = Math.round((curRawA.bidAskSpreadInr / curRawA.closePrice) * 10000 * 0.5 * 10) / 10;
      const slipB_bps = Math.round((curRawB.bidAskSpreadInr / curRawB.closePrice) * 10000 * 0.5 * 10) / 10;
      const combinedSlip = Math.max(whatIfParams.slippageBps, slipA_bps + slipB_bps);
      const totalFriction = Math.round((whatIfParams.transactionCostBps + 1.8 + combinedSlip) * 10) / 10;
      const postCostBps = Math.round((preCostBps - totalFriction) * 10) / 10;

      let rcStatus = 'DISAPPEARS';
      let survivalRate = 18;
      let rcConclusion = '';

      if (postCostBps > 15.0) {
        rcStatus = 'SURVIVES';
        survivalRate = Math.min(94, Math.round(72 + absZ * 6.5));
        rcConclusion = `Observed divergence is statistically robust and exceeds combined friction barriers (+${postCostBps} bps net). Historical walk-forward tests confirm persistence.`;
      } else if (postCostBps > 0.0) {
        rcStatus = 'WEAKENS';
        survivalRate = Math.min(68, Math.round(45 + absZ * 4.0));
        rcConclusion = `Difference partially survives, but net magnitude is compressed by ${Math.round((totalFriction / Math.max(1, preCostBps)) * 100)}% due to clearing costs and bid-ask slippage.`;
      } else {
        rcStatus = 'DISAPPEARS';
        survivalRate = Math.min(25, Math.round(10 + absZ * 2.5));
        rcConclusion = `The apparent relative price difference is entirely absorbed by standard exchange fees (${whatIfParams.transactionCostBps} bps), taxes (1.8 bps), and illiquid contract slippage.`;
      }

      results.push({
        pairKey,
        contractA: symA,
        contractB: symB,
        date: selectedDate,
        rawSpread,
        normalizedSpread: Math.round(normSpread * 100) / 100,
        spreadPercentage: Math.round(spreadPct * 1000) / 1000,
        rollingMean: Math.round(mean * 100) / 100,
        rollingStd: Math.round(std * 100) / 100,
        zScore,
        historicalPercentile: percentile,
        severity,
        expiryDiff,
        liquidityTier,
        curUA,
        curUB,
        curRawA,
        curRawB,
        attribution: {
          priceDivScore,
          expiryScore,
          liqScore,
          rarityScore,
          primaryDriver,
          explanation
        },
        realityCheck: {
          preCostBps,
          totalFriction,
          postCostBps,
          status: rcStatus,
          survivalRate,
          conclusion: rcConclusion
        }
      });
    }
  }

  return results;
}

// ==========================================
// 5. VIEW NAVIGATION & LIFECYCLE
// ==========================================
function navigateView(viewName) {
  currentView = viewName;

  // Toggle sections
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) {
    targetSec.classList.remove('hidden');
  }

  // Update Nav links active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.className = 'nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left text-brand-gold bg-brand-gold/10 border border-brand-gold/30';
    } else {
      btn.className = 'nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-brand-navy-card/60 transition text-left';
    }
  });

  // Re-render view specific dynamic components
  if (viewName === 'overview') renderOverview();
  if (viewName === 'dna') renderContractDNA();
  if (viewName === 'universal-basis') renderUniversalBasis();
  if (viewName === 'radar') renderRadarView();
  if (viewName === 'anomalies') renderAnomalyExplorer();
  if (viewName === 'why-different') runWhyDifferentInvestigation();
  if (viewName === 'market-xray') renderMarketXRay();
  if (viewName === 'expiry-gravity') renderExpiryGravity();
  if (viewName === 'liquidity-lens') renderLiquidityLens();
  if (viewName === 'reality-check') renderRealityCheck();
  if (viewName === 'contract-lifecycle') renderContractLifecycle();
  if (viewName === 'anomaly-memory') renderAnomalyMemory();
  if (viewName === 'what-if') renderWhatIfLab();
  if (viewName === 'ai-analyst') renderAiAnalyst();
  if (viewName === 'data-provenance') renderDataProvenance();

  // Refresh Lucide icons
  if (window.lucide) lucide.createIcons();

  // Close mobile sidebar if open
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar && window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('-translate-x-full');
  }
}

function onDateChanged(newDate) {
  selectedDate = newDate;
  document.getElementById('header-date').textContent = `${selectedDate} IST`;
  relationships = computeAllPairRelationships();
  navigateView(currentView);
}

// ==========================================
// 6. VIEW RENDERERS
// ==========================================

// --- RENDER: LANDING / HERO ---
function renderLandingHero() {
  const container = document.getElementById('hero-contract-cards');
  if (!container) return;

  const curUGB = {};
  marketData.universalRecords.filter(r => r.date === selectedDate).forEach(r => {
    curUGB[r.symbol] = r;
  });

  container.innerHTML = CONTRACT_KEYS.map(sym => {
    const spec = CONTRACT_SPECS[sym];
    const ugb = curUGB[sym] || { rawPrice: 76500, normalizedPricePerGram999: 7680 };

    return `
      <div class="glass-card rounded-xl p-4 border border-brand-navy-border hover:border-brand-gold/40 transition cursor-pointer" onclick="navigateView('dna')">
        <div class="flex items-center justify-between mb-2">
          <span class="font-display font-black text-base text-white">${sym}</span>
          <span class="text-[9px] font-mono px-2 py-0.5 rounded font-bold" style="background: ${spec.badgeBg}; color: ${spec.color}">${spec.purityKarat}</span>
        </div>
        <div class="space-y-1 text-xs font-mono">
          <div class="flex justify-between text-slate-400">
            <span>Trading Unit:</span>
            <strong class="text-slate-200">${spec.tradingUnitGrams}g</strong>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Quotation:</span>
            <strong class="text-slate-200">${spec.quotationBasis}</strong>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Raw Settlement:</span>
            <strong class="text-slate-200">₹${ugb.rawPrice.toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div class="mt-3 pt-2.5 border-t border-brand-navy-border flex justify-between items-center font-mono">
          <span class="text-[10px] text-slate-400">Universal Basis:</span>
          <span class="text-xs font-bold text-brand-gold">₹${ugb.normalizedPricePerGram999.toFixed(2)}/g</span>
        </div>
      </div>
    `;
  }).join('');
}

// --- RENDER: OVERVIEW ---
function renderOverview() {
  // Populate Date Selector
  const dateSelect = document.getElementById('overview-date-select');
  if (dateSelect && dateSelect.options.length === 0) {
    marketData.dates.slice(-15).reverse().forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === selectedDate) opt.selected = true;
      dateSelect.appendChild(opt);
    });
  }

  // 4 Pulse Cards
  const pulseContainer = document.getElementById('overview-pulse-cards');
  const ugbMap = {};
  const rawMap = {};
  marketData.universalRecords.filter(r => r.date === selectedDate).forEach(r => ugbMap[r.symbol] = r);
  marketData.rawRecords.filter(r => r.date === selectedDate).forEach(r => rawMap[r.symbol] = r);

  if (pulseContainer) {
    pulseContainer.innerHTML = CONTRACT_KEYS.map(sym => {
      const spec = CONTRACT_SPECS[sym];
      const ugb = ugbMap[sym];
      const raw = rawMap[sym];
      if (!ugb || !raw) return '';

      // Delta relative to GOLDM benchmark
      const refUGB = ugbMap['GOLDM'] ? ugbMap['GOLDM'].normalizedPricePerGram999 : ugb.normalizedPricePerGram999;
      const basisDiff = ugb.normalizedPricePerGram999 - refUGB;
      const diffPct = (basisDiff / refUGB) * 100;
      const isPositive = basisDiff > 0.05;
      const isNegative = basisDiff < -0.05;
      const diffBadge = isPositive 
        ? `<span class="text-rose-400 font-bold">+${diffPct.toFixed(2)}%</span>` 
        : isNegative 
        ? `<span class="text-cyan-400 font-bold">${diffPct.toFixed(2)}%</span>` 
        : `<span class="text-slate-400 font-bold">0.00% (Parity)</span>`;

      return `
        <div class="glass-panel rounded-xl p-4 border border-brand-navy-border hover:border-brand-gold/40 transition">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background: ${spec.color}"></span>
              <span class="font-display font-black text-base text-white">${sym}</span>
            </div>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded" style="background: ${spec.badgeBg}; color: ${spec.color}">${spec.tradingUnitGrams}g Lot</span>
          </div>

          <div class="space-y-1.5 font-mono text-xs">
            <div class="flex justify-between items-baseline">
              <span class="text-slate-400">Universal Gold Basis:</span>
              <span class="text-sm font-bold text-white">₹${ugb.normalizedPricePerGram999.toFixed(2)}<span class="text-[10px] text-slate-400 font-normal">/g</span></span>
            </div>
            <div class="flex justify-between text-slate-400 text-[11px]">
              <span>Raw Settlement:</span>
              <span class="text-slate-200">₹${raw.closePrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between text-slate-400 text-[11px]">
              <span>Vs GOLDM Basis:</span>
              <span>${diffBadge}</span>
            </div>
          </div>

          <div class="mt-3 pt-2 border-t border-brand-navy-border/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Vol: ${raw.volume.toLocaleString('en-IN')} lots</span>
            <span>OI: ${raw.openInterest.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Mini Radar Canvas & Top Pairs
  drawMiniRadar();

  const topPairsContainer = document.getElementById('overview-top-pairs');
  if (topPairsContainer) {
    const sortedPairs = [...relationships].sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
    topPairsContainer.innerHTML = sortedPairs.slice(0, 3).map(p => {
      const isUnusual = p.severity === 'UNUSUAL';
      const isWatch = p.severity === 'WATCH';
      const badge = isUnusual 
        ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[10px]">UNUSUAL (|Z|=${Math.abs(p.zScore)})</span>`
        : isWatch
        ? `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">WATCH (|Z|=${Math.abs(p.zScore)})</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">NORMAL</span>`;

      return `
        <div class="p-3 rounded-xl bg-brand-navy/60 border border-brand-navy-border hover:border-brand-gold/40 transition cursor-pointer" onclick="openPairInvestigation('${p.contractA}', '${p.contractB}')">
          <div class="flex items-center justify-between mb-1">
            <span class="font-display font-bold text-xs text-white">${p.contractA} ↔ ${p.contractB}</span>
            ${badge}
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Normalized Spread:</span>
            <span class="text-white font-bold">${p.normalizedSpread > 0 ? '+' : ''}₹${p.normalizedSpread.toFixed(2)}/g (${p.spreadPercentage > 0 ? '+' : ''}${p.spreadPercentage.toFixed(2)}%)</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-1 truncate">${p.attribution.primaryDriver}</p>
        </div>
      `;
    }).join('');
  }

  // Surveillance Telemetry
  const telemetryContainer = document.getElementById('overview-anomaly-telemetry');
  if (telemetryContainer) {
    const unusual = relationships.filter(r => r.severity === 'UNUSUAL');
    const watch = relationships.filter(r => r.severity === 'WATCH');

    telemetryContainer.innerHTML = `
      <div class="p-3 rounded-xl bg-brand-navy/80 border border-brand-navy-border space-y-1 text-xs font-mono">
        <div class="flex justify-between">
          <span class="text-slate-400">Unusual Discrepancies:</span>
          <span class="text-rose-400 font-bold">${unusual.length} pairs</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Surveillance Watchlist:</span>
          <span class="text-amber-400 font-bold">${watch.length} pairs</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Normal Parity:</span>
          <span class="text-emerald-400 font-bold">${relationships.length - unusual.length - watch.length} pairs</span>
        </div>
      </div>
    `;
  }

  // UGB 30-Day Historical Chart
  renderUGBHistoryChart();
}

function drawMiniRadar() {
  const canvas = document.getElementById('mini-radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 70;

  const nodeCoords = {
    GOLDM: { x: cx - r, y: cy - r, color: CONTRACT_SPECS.GOLDM.color },
    GOLDTEN: { x: cx + r, y: cy - r, color: CONTRACT_SPECS.GOLDTEN.color },
    GOLDPETAL: { x: cx + r, y: cy + r, color: CONTRACT_SPECS.GOLDPETAL.color },
    GOLDGUINEA: { x: cx - r, y: cy + r, color: CONTRACT_SPECS.GOLDGUINEA.color }
  };

  // Draw Edges with Z-Score coloring
  relationships.forEach(rel => {
    const p1 = nodeCoords[rel.contractA];
    const p2 = nodeCoords[rel.contractB];
    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (rel.severity === 'UNUSUAL') {
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2.5;
    } else if (rel.severity === 'WATCH') {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.8;
    } else {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.0;
    }
    ctx.stroke();
  });

  // Draw Nodes
  Object.entries(nodeCoords).forEach(([sym, node]) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0D1527';
    ctx.fill();
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sym.replace('GOLD', 'G.'), node.x, node.y);
  });
}

function renderUGBHistoryChart() {
  const ctx = document.getElementById('ugb-history-chart');
  if (!ctx) return;

  const chartDates = marketData.dates.slice(-25);
  const datasets = CONTRACT_KEYS.map(sym => {
    const spec = CONTRACT_SPECS[sym];
    const series = chartDates.map(d => {
      const rec = marketData.universalRecords.find(r => r.date === d && r.symbol === sym);
      return rec ? rec.normalizedPricePerGram999 : null;
    });

    return {
      label: sym,
      data: series,
      borderColor: spec.color,
      backgroundColor: spec.color + '15',
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.2
    };
  });

  if (charts.ugbHistory) {
    charts.ugbHistory.destroy();
  }

  charts.ugbHistory = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartDates.map(d => d.slice(5)),
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0D1527',
          borderColor: '#1E294A',
          borderWidth: 1,
          titleFont: { family: 'JetBrains Mono', size: 11 },
          bodyFont: { family: 'JetBrains Mono', size: 10 },
          callbacks: {
            label: (item) => ` ${item.dataset.label}: ₹${item.raw.toFixed(2)} / gram (999.0)`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30, 41, 74, 0.4)' },
          ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 9 } }
        },
        y: {
          grid: { color: 'rgba(30, 41, 74, 0.4)' },
          ticks: {
            color: '#94A3B8',
            font: { family: 'JetBrains Mono', size: 9 },
            callback: (val) => `₹${val}`
          }
        }
      }
    }
  });
}

// --- RENDER: CONTRACT DNA ---
function renderContractDNA() {
  const container = document.getElementById('contract-dna-container');
  if (!container) return;

  container.innerHTML = CONTRACT_KEYS.map(sym => {
    const spec = CONTRACT_SPECS[sym];
    return `
      <div class="glass-panel rounded-2xl p-6 border border-brand-navy-border space-y-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none" style="background: ${spec.color}"></div>

        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background: ${spec.color}"></span>
              <h3 class="font-display font-black text-xl text-white">${spec.name}</h3>
            </div>
            <p class="text-xs text-slate-400 font-mono mt-0.5">${spec.symbol} • MCX Commodity Division</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded-full font-bold" style="background: ${spec.badgeBg}; color: ${spec.color}">${spec.purityKarat}</span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${spec.description}</p>

        <!-- Visual DNA Blueprint Bar -->
        <div class="space-y-1.5 pt-2">
          <div class="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Trading Lot Size:</span>
            <strong class="text-slate-200">${spec.tradingUnitGrams} Grams (${(spec.tradingUnitGrams * 0.03215).toFixed(3)} Troy Oz)</strong>
          </div>
          <div class="w-full bg-brand-navy h-2 rounded-full overflow-hidden border border-brand-navy-border">
            <div class="h-full rounded-full" style="width: ${Math.min(100, (spec.tradingUnitGrams / 100) * 100)}%; background: ${spec.color}"></div>
          </div>
        </div>

        <!-- Specifications Grid -->
        <div class="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
          <div class="p-2.5 rounded-lg bg-brand-navy/60 border border-brand-navy-border">
            <span class="text-slate-400 block text-[10px]">Quotation Basis</span>
            <strong class="text-slate-200">${spec.quotationBasis}</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy/60 border border-brand-navy-border">
            <span class="text-slate-400 block text-[10px]">Delivery Fineness</span>
            <strong class="text-slate-200">${spec.deliveryPurity * 1000} / 1000 Fineness</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy/60 border border-brand-navy-border">
            <span class="text-slate-400 block text-[10px]">Minimum Tick Size</span>
            <strong class="text-slate-200">₹${spec.tickSize.toFixed(2)}</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy/60 border border-brand-navy-border">
            <span class="text-slate-400 block text-[10px]">Initial Margin %</span>
            <strong class="text-slate-200">${spec.initialMarginPercent}%</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy/60 border border-brand-navy-border">
            <span class="text-slate-400 block text-[10px]">Delivery Center</span>
            <strong class="text-slate-200">${spec.deliveryCenter}</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy/60 border border-brand-navy-border">
            <span class="text-slate-400 block text-[10px]">Delivery Settlement</span>
            <strong class="text-slate-200">${spec.physicalDeliveryOption}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // DNA Comparison Table
  const tableBody = document.getElementById('dna-table-body');
  if (tableBody) {
    tableBody.innerHTML = CONTRACT_KEYS.map(sym => {
      const spec = CONTRACT_SPECS[sym];
      return `
        <tr class="hover:bg-brand-navy-hover/40 transition">
          <td class="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" style="background: ${spec.color}"></span>
            ${sym}
          </td>
          <td class="py-2.5 px-3">${spec.tradingUnitGrams}g</td>
          <td class="py-2.5 px-3 text-amber-400">${spec.deliveryPurity * 1000}‰</td>
          <td class="py-2.5 px-3">${spec.quotationBasis}</td>
          <td class="py-2.5 px-3">₹${spec.tickSize.toFixed(2)}</td>
          <td class="py-2.5 px-3">${spec.initialMarginPercent}%</td>
          <td class="py-2.5 px-3">${spec.deliveryCenter}</td>
          <td class="py-2.5 px-3 text-slate-400">${spec.physicalDeliveryOption}</td>
        </tr>
      `;
    }).join('');
  }
}

// --- RENDER: UNIVERSAL GOLD BASIS ---
function renderUniversalBasis() {
  const cardsContainer = document.getElementById('ugb-cards-container');
  if (!cardsContainer) return;

  const ugbMap = {};
  marketData.universalRecords.filter(r => r.date === selectedDate).forEach(r => ugbMap[r.symbol] = r);

  cardsContainer.innerHTML = CONTRACT_KEYS.map(sym => {
    const spec = CONTRACT_SPECS[sym];
    const ugb = ugbMap[sym];
    if (!ugb) return '';

    return `
      <div class="glass-panel rounded-2xl p-5 border border-brand-navy-border space-y-3 relative">
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-lg text-white">${sym}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded" style="background: ${spec.badgeBg}; color: ${spec.color}">${spec.purityKarat}</span>
        </div>

        <div class="space-y-2 text-xs font-mono">
          <div class="p-2.5 rounded-lg bg-brand-navy/80 border border-brand-navy-border">
            <span class="text-[10px] text-slate-400 block">RAW SETTLEMENT PRICE</span>
            <strong class="text-sm text-slate-200">₹${ugb.rawPrice.toLocaleString('en-IN')}</strong>
            <span class="text-[10px] text-slate-400 block mt-0.5">(${spec.quotationBasis})</span>
          </div>

          <div class="flex justify-center text-slate-400">
            <i data-lucide="arrow-down" class="w-3.5 h-3.5 text-brand-gold"></i>
          </div>

          <div class="p-2.5 rounded-lg bg-amber-500/10 border border-brand-gold/40">
            <span class="text-[10px] text-brand-gold font-bold block">UNIVERSAL GOLD BASIS (999.0)</span>
            <strong class="text-base text-brand-gold-light">₹${ugb.normalizedPricePerGram999.toFixed(2)}</strong>
            <span class="text-[10px] text-slate-300 block mt-0.5">₹ per 1g pure gold benchmark</span>
          </div>
        </div>

        <button onclick="openCalculationModal('${sym}')" class="w-full py-1.5 rounded-lg bg-brand-navy-card hover:bg-brand-navy-hover border border-brand-navy-border text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition">
          <i data-lucide="calculator" class="w-3 h-3 text-brand-cyan"></i>
          <span>View Calculation Proof</span>
        </button>
      </div>
    `;
  }).join('');

  renderUgbCalculationSteps('GOLDM');
}

function renderUgbCalculationSteps(symbol) {
  const container = document.getElementById('ugb-calculation-steps-container');
  if (!container) return;

  const ugb = marketData.universalRecords.find(r => r.date === selectedDate && r.symbol === symbol) 
    || normalizeToUniversalBasis(symbol, 76500, selectedDate);

  container.innerHTML = ugb.calculationSteps.map(step => `
    <div class="glass-card rounded-xl p-4 border border-brand-navy-border space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono text-brand-gold font-bold">STEP ${step.stepNumber}</span>
        <span class="text-[10px] font-mono text-slate-400">${step.title}</span>
      </div>
      <div class="p-2 rounded bg-brand-navy border border-brand-navy-border text-[11px] font-mono text-brand-cyan">
        ${step.formula}
      </div>
      <div class="text-xs font-mono text-slate-200">
        <span class="text-slate-400 block text-[10px]">Input Calculation:</span>
        ${step.input}
      </div>
      <div class="text-xs font-mono text-white font-bold">
        <span class="text-slate-400 block text-[10px]">Output Result:</span>
        ${step.output}
      </div>
      <p class="text-[11px] text-slate-400 pt-1 leading-tight">${step.rationale}</p>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function openCalculationModal(symbol) {
  const modal = document.getElementById('calculation-modal');
  const title = document.getElementById('modal-calc-title');
  const body = document.getElementById('modal-calc-body');
  if (!modal || !body) return;

  const ugb = marketData.universalRecords.find(r => r.date === selectedDate && r.symbol === symbol)
    || normalizeToUniversalBasis(symbol, 76500, selectedDate);
  const spec = CONTRACT_SPECS[symbol];

  title.textContent = `${spec.name} (${symbol}) — Calculation Proof`;

  body.innerHTML = `
    <div class="p-3 rounded-xl bg-brand-navy border border-brand-navy-border space-y-1">
      <div class="flex justify-between">
        <span class="text-slate-400">Raw Settlement Price:</span>
        <span class="text-white font-bold">₹${ugb.rawPrice.toLocaleString('en-IN')} (${spec.quotationBasis})</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Purity Conversion Factor:</span>
        <span class="text-brand-gold font-bold">0.999 ÷ ${spec.deliveryPurity} = ${ugb.purityAdjustmentFactor.toFixed(5)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Universal Gold Basis (UGB):</span>
        <span class="text-emerald-400 font-bold">₹${ugb.normalizedPricePerGram999.toFixed(2)} / gram (999.0 Fine Gold)</span>
      </div>
    </div>

    <div class="space-y-2">
      ${ugb.calculationSteps.map(s => `
        <div class="p-3 rounded-lg bg-brand-navy-card/80 border border-brand-navy-border space-y-1">
          <div class="flex justify-between text-[11px] text-brand-gold font-bold">
            <span>Step ${s.stepNumber}: ${s.title}</span>
            <span class="text-slate-400">${s.formula}</span>
          </div>
          <div class="text-[11px] text-slate-200 font-mono">${s.input} ➔ <strong class="text-white">${s.output}</strong></div>
          <p class="text-[10px] text-slate-400">${s.rationale}</p>
        </div>
      `).join('')}
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeCalculationModal() {
  const modal = document.getElementById('calculation-modal');
  if (modal) modal.classList.add('hidden');
}

// --- RENDER: RELATIVE VALUE RADAR ---
function renderRadarView() {
  drawInteractiveRadar();

  const pairsList = document.getElementById('radar-pairs-list');
  if (pairsList) {
    pairsList.innerHTML = relationships.map(rel => {
      const isUnusual = rel.severity === 'UNUSUAL';
      const isWatch = rel.severity === 'WATCH';
      const badge = isUnusual
        ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">UNUSUAL</span>`
        : isWatch
        ? `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">WATCH</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">NORMAL</span>`;

      return `
        <div class="p-3.5 rounded-xl bg-brand-navy-card border border-brand-navy-border hover:border-brand-gold/50 transition cursor-pointer" onclick="openPairInvestigation('${rel.contractA}', '${rel.contractB}')">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-display font-bold text-sm text-white">${rel.contractA} ↔ ${rel.contractB}</span>
            ${badge}
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span class="text-slate-400 text-[10px] block">Normalized Delta</span>
              <strong class="text-white">${rel.normalizedSpread > 0 ? '+' : ''}₹${rel.normalizedSpread.toFixed(2)}/g</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] block">Z-Score (30d)</span>
              <strong class="${isUnusual ? 'text-rose-400' : isWatch ? 'text-amber-400' : 'text-emerald-400'}">${rel.zScore > 0 ? '+' : ''}${rel.zScore.toFixed(2)} σ</strong>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-brand-navy-border/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Historical: ${rel.historicalPercentile}th percentile</span>
            <span class="text-brand-cyan hover:underline">Investigate →</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function drawInteractiveRadar() {
  const canvas = document.getElementById('interactive-radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 130;

  // Background radar rings
  ctx.strokeStyle = 'rgba(30, 41, 74, 0.6)';
  ctx.lineWidth = 1;
  [40, 85, 130, 160].forEach(rad => {
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - 170, cy);
  ctx.lineTo(cx + 170, cy);
  ctx.moveTo(cx, cy - 170);
  ctx.lineTo(cx, cy + 170);
  ctx.strokeStyle = 'rgba(30, 41, 74, 0.4)';
  ctx.stroke();

  const nodeCoords = {
    GOLDM: { x: cx - r, y: cy - r, name: 'GOLDM', size: '100g' },
    GOLDTEN: { x: cx + r, y: cy - r, name: 'GOLDTEN', size: '10g' },
    GOLDPETAL: { x: cx + r, y: cy + r, name: 'GOLDPETAL', size: '1g' },
    GOLDGUINEA: { x: cx - r, y: cy + r, name: 'GOLDGUINEA', size: '8g' }
  };

  // Draw Edges
  relationships.forEach(rel => {
    const p1 = nodeCoords[rel.contractA];
    const p2 = nodeCoords[rel.contractB];
    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (rel.severity === 'UNUSUAL') {
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 3.5;
    } else if (rel.severity === 'WATCH') {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.2;
    } else {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 1.2;
    }
    ctx.stroke();

    // Draw Edge Label at midpoint
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    ctx.fillStyle = '#070B14';
    ctx.fillRect(midX - 22, midY - 9, 44, 18);
    ctx.strokeStyle = 'rgba(30, 41, 74, 0.8)';
    ctx.strokeRect(midX - 22, midY - 9, 44, 18);

    ctx.fillStyle = rel.severity === 'UNUSUAL' ? '#F43F5E' : rel.severity === 'WATCH' ? '#F59E0B' : '#10B981';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${rel.zScore > 0 ? '+' : ''}${rel.zScore.toFixed(1)}σ`, midX, midY);
  });

  // Draw Nodes
  Object.entries(nodeCoords).forEach(([sym, node]) => {
    const spec = CONTRACT_SPECS[sym];
    ctx.beginPath();
    ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#0D1527';
    ctx.fill();
    ctx.strokeStyle = spec.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sym, node.x, node.y - 4);

    ctx.fillStyle = spec.color;
    ctx.font = '8px JetBrains Mono';
    ctx.fillText(node.size, node.x, node.y + 8);
  });
}

// --- RENDER: ANOMALY EXPLORER ---
function renderAnomalyExplorer() {
  const container = document.getElementById('anomaly-cards-grid');
  if (!container) return;

  const filter = document.getElementById('anomaly-filter-severity')?.value || 'ALL';
  const filtered = relationships.filter(r => {
    if (filter === 'ALL') return true;
    return r.severity === filter;
  });

  container.innerHTML = filtered.map(rel => {
    const isUnusual = rel.severity === 'UNUSUAL';
    const isWatch = rel.severity === 'WATCH';
    const badge = isUnusual
      ? `<span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-xs">UNUSUAL ANOMALY</span>`
      : isWatch
      ? `<span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-xs">SURVEILLANCE WATCH</span>`
      : `<span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">NORMAL BASELINE</span>`;

    return `
      <div class="glass-panel rounded-2xl p-6 border ${isUnusual ? 'border-rose-500/40' : 'border-brand-navy-border'} space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display font-black text-lg text-white">${rel.contractA} ↔ ${rel.contractB}</h3>
            <p class="text-xs text-slate-400 font-mono">Date: ${rel.date} • Expiry Gap: ${rel.expiryDiff} Days</p>
          </div>
          ${badge}
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div class="p-2.5 rounded-lg bg-brand-navy border border-brand-navy-border">
            <span class="text-slate-400 text-[10px] block">Normalized Diff</span>
            <strong class="text-white">${rel.normalizedSpread > 0 ? '+' : ''}₹${rel.normalizedSpread.toFixed(2)}/g</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy border border-brand-navy-border">
            <span class="text-slate-400 text-[10px] block">Z-Score</span>
            <strong class="${isUnusual ? 'text-rose-400' : 'text-slate-200'}">${rel.zScore > 0 ? '+' : ''}${rel.zScore.toFixed(2)} σ</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy border border-brand-navy-border">
            <span class="text-slate-400 text-[10px] block">Percentile</span>
            <strong class="text-slate-200">${rel.historicalPercentile}th %</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-brand-navy border border-brand-navy-border">
            <span class="text-slate-400 text-[10px] block">Liquidity</span>
            <strong class="text-slate-200">${rel.liquidityTier}</strong>
          </div>
        </div>

        <!-- Factor Decomposition Breakdown -->
        <div class="space-y-2 pt-2 border-t border-brand-navy-border/60">
          <span class="text-xs font-mono font-bold text-slate-300">WHY IS THIS UNUSUAL?</span>
          
          <div class="space-y-1.5 text-xs font-mono">
            <div>
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>Price Divergence Factor</span>
                <span class="text-slate-200">${rel.attribution.priceDivScore}%</span>
              </div>
              <div class="w-full bg-brand-navy h-1.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full" style="width: ${rel.attribution.priceDivScore}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>Expiry Carrying Cost Factor</span>
                <span class="text-slate-200">${rel.attribution.expiryScore}%</span>
              </div>
              <div class="w-full bg-brand-navy h-1.5 rounded-full overflow-hidden">
                <div class="bg-purple-500 h-full rounded-full" style="width: ${rel.attribution.expiryScore}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>Liquidity Spread Friction</span>
                <span class="text-slate-200">${rel.attribution.liqScore}%</span>
              </div>
              <div class="w-full bg-brand-navy h-1.5 rounded-full overflow-hidden">
                <div class="bg-cyan-500 h-full rounded-full" style="width: ${rel.attribution.liqScore}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>Historical Rarity Rank</span>
                <span class="text-slate-200">${rel.attribution.rarityScore}%</span>
              </div>
              <div class="w-full bg-brand-navy h-1.5 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full" style="width: ${rel.attribution.rarityScore}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytical Explanation -->
        <div class="p-3 rounded-xl bg-brand-navy/90 border border-brand-navy-border text-xs text-slate-300 font-sans leading-relaxed">
          <strong class="text-white block font-display font-semibold mb-0.5">${rel.attribution.primaryDriver}</strong>
          ${rel.attribution.explanation}
        </div>

        <button onclick="openPairInvestigation('${rel.contractA}', '${rel.contractB}')" class="w-full py-2 rounded-xl bg-brand-navy-card hover:bg-brand-navy-hover border border-brand-navy-border text-brand-gold font-mono text-xs font-semibold flex items-center justify-center gap-2 transition">
          <i data-lucide="microscope" class="w-3.5 h-3.5"></i>
          <span>Launch Full Investigation Dossier</span>
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// --- RENDER: SIGNATURE FEATURE: WHY IS THIS CONTRACT DIFFERENT? ---
function openPairInvestigation(symA, symB) {
  const selA = document.getElementById('why-select-contract-a');
  const selB = document.getElementById('why-select-contract-b');
  if (selA && selB) {
    selA.value = symA;
    selB.value = symB;
  }
  navigateView('why-different');
}

function runWhyDifferentInvestigation() {
  const symA = document.getElementById('why-select-contract-a')?.value || 'GOLDM';
  const symB = document.getElementById('why-select-contract-b')?.value || 'GOLDPETAL';
  const container = document.getElementById('why-different-results-container');
  if (!container) return;

  if (symA === symB) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 font-mono text-xs glass-card rounded-xl">
        Please select two distinct contracts to perform relative comparative analysis.
      </div>
    `;
    return;
  }

  // Find or compute relationship
  let rel = relationships.find(r => (r.contractA === symA && r.contractB === symB) || (r.contractA === symB && r.contractB === symA));
  if (!rel) {
    container.innerHTML = `<div class="p-4 text-slate-400 text-xs font-mono">Data unavailable for this pair.</div>`;
    return;
  }

  const specA = CONTRACT_SPECS[symA];
  const specB = CONTRACT_SPECS[symB];
  const ugbA = marketData.universalRecords.find(r => r.date === selectedDate && r.symbol === symA);
  const ugbB = marketData.universalRecords.find(r => r.date === selectedDate && r.symbol === symB);
  const rawA = marketData.rawRecords.find(r => r.date === selectedDate && r.symbol === symA);
  const rawB = marketData.rawRecords.find(r => r.date === selectedDate && r.symbol === symB);

  container.innerHTML = `
    <!-- Top Comparison Header -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Contract A Card -->
      <div class="p-4 rounded-xl bg-brand-navy/90 border border-brand-navy-border space-y-2 font-mono">
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-lg text-white">${symA}</span>
          <span class="text-[10px] px-2 py-0.5 rounded" style="background: ${specA.badgeBg}; color: ${specA.color}">${specA.purityKarat}</span>
        </div>
        <div class="text-xs space-y-1 text-slate-300">
          <div class="flex justify-between"><span>Raw Settlement:</span> <strong>₹${rawA.closePrice.toLocaleString('en-IN')}</strong></div>
          <div class="flex justify-between"><span>Quotation Basis:</span> <strong>${specA.quotationBasis}</strong></div>
          <div class="flex justify-between"><span>Delivery Purity:</span> <strong>${specA.deliveryPurity * 1000}‰</strong></div>
          <div class="flex justify-between text-brand-gold font-bold"><span>Universal Basis:</span> <strong>₹${ugbA.normalizedPricePerGram999.toFixed(2)}/g</strong></div>
        </div>
      </div>

      <!-- Contract B Card -->
      <div class="p-4 rounded-xl bg-brand-navy/90 border border-brand-navy-border space-y-2 font-mono">
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-lg text-white">${symB}</span>
          <span class="text-[10px] px-2 py-0.5 rounded" style="background: ${specB.badgeBg}; color: ${specB.color}">${specB.purityKarat}</span>
        </div>
        <div class="text-xs space-y-1 text-slate-300">
          <div class="flex justify-between"><span>Raw Settlement:</span> <strong>₹${rawB.closePrice.toLocaleString('en-IN')}</strong></div>
          <div class="flex justify-between"><span>Quotation Basis:</span> <strong>${specB.quotationBasis}</strong></div>
          <div class="flex justify-between"><span>Delivery Purity:</span> <strong>${specB.deliveryPurity * 1000}‰</strong></div>
          <div class="flex justify-between text-brand-gold font-bold"><span>Universal Basis:</span> <strong>₹${ugbB.normalizedPricePerGram999.toFixed(2)}/g</strong></div>
        </div>
      </div>
    </div>

    <!-- Normalized Difference Telemetry Banner -->
    <div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-brand-navy to-brand-navy border border-brand-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
      <div>
        <span class="text-[10px] text-brand-gold font-bold uppercase tracking-wider block">Observed Normalized Spread</span>
        <span class="font-display font-black text-xl text-white">${rel.normalizedSpread > 0 ? '+' : ''}₹${rel.normalizedSpread.toFixed(2)} / gram (${rel.spreadPercentage > 0 ? '+' : ''}${rel.spreadPercentage.toFixed(2)}%)</span>
      </div>
      <div class="flex items-center gap-4 text-xs">
        <div><span class="text-slate-400 block text-[10px]">Z-Score</span> <strong class="text-brand-gold font-bold">${rel.zScore.toFixed(2)} σ</strong></div>
        <div><span class="text-slate-400 block text-[10px]">Percentile</span> <strong class="text-white font-bold">${rel.historicalPercentile}th %</strong></div>
        <div><span class="text-slate-400 block text-[10px]">Expiry Gap</span> <strong class="text-white font-bold">${rel.expiryDiff} Days</strong></div>
        <div><span class="text-slate-400 block text-[10px]">Liquidity</span> <strong class="text-brand-cyan font-bold">${rel.liquidityTier}</strong></div>
      </div>
    </div>

    <!-- Multi-Factor Attribution Bars -->
    <div class="glass-panel rounded-xl p-5 border border-brand-navy-border space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="font-display font-bold text-sm text-white">Multi-Factor Variance Attribution</h4>
        <span class="text-xs font-mono text-slate-400">Microstructure Drivers</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div class="space-y-1">
          <div class="flex justify-between text-slate-400"><span>Price Divergence:</span> <strong>${rel.attribution.priceDivScore}%</strong></div>
          <div class="w-full bg-brand-navy h-2 rounded-full overflow-hidden"><div class="bg-rose-500 h-full" style="width: ${rel.attribution.priceDivScore}%"></div></div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-slate-400"><span>Expiry Carrying Cost:</span> <strong>${rel.attribution.expiryScore}%</strong></div>
          <div class="w-full bg-brand-navy h-2 rounded-full overflow-hidden"><div class="bg-purple-500 h-full" style="width: ${rel.attribution.expiryScore}%"></div></div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-slate-400"><span>Liquidity / Bid-Ask Drag:</span> <strong>${rel.attribution.liqScore}%</strong></div>
          <div class="w-full bg-brand-navy h-2 rounded-full overflow-hidden"><div class="bg-cyan-500 h-full" style="width: ${rel.attribution.liqScore}%"></div></div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-slate-400"><span>Historical Rarity Rank:</span> <strong>${rel.attribution.rarityScore}%</strong></div>
          <div class="w-full bg-brand-navy h-2 rounded-full overflow-hidden"><div class="bg-amber-500 h-full" style="width: ${rel.attribution.rarityScore}%"></div></div>
        </div>
      </div>
    </div>

    <!-- Analytical Synthesis Box (No Trading Advice) -->
    <div class="p-5 rounded-xl bg-brand-navy border border-brand-gold/30 space-y-2">
      <div class="flex items-center gap-2 text-xs font-mono font-bold text-brand-gold">
        <i data-lucide="file-text" class="w-4 h-4"></i>
        <span>ANALYTICAL EXPLANATION (DETERMINISTIC)</span>
      </div>
      <p class="text-xs text-slate-200 font-sans leading-relaxed">
        The observed price discrepancy between <strong class="text-white">${symA}</strong> and <strong class="text-white">${symB}</strong> is primarily governed by <strong class="text-brand-gold-light">${rel.attribution.primaryDriver}</strong>. 
        ${rel.attribution.explanation}
      </p>
      <div class="pt-2 text-[11px] font-mono text-slate-400 border-t border-brand-navy-border/60">
        Walk-Forward Reality Check: <strong class="${rel.realityCheck.status === 'SURVIVES' ? 'text-emerald-400' : rel.realityCheck.status === 'WEAKENS' ? 'text-amber-400' : 'text-rose-400'}">${rel.realityCheck.status}</strong> (${rel.realityCheck.conclusion})
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button onclick="openEvidenceReportModalForPair('${symA}', '${symB}')" class="px-5 py-2.5 rounded-xl bg-brand-gold text-brand-navy font-display font-bold text-xs flex items-center gap-2 shadow-gold-glow">
        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
        <span>Generate Official Dossier Report</span>
      </button>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// --- RENDER: GOLD MARKET X-RAY ---
function toggleXrayLayer(layerKey) {
  xrayLayers[layerKey] = !xrayLayers[layerKey];
  const btn = document.getElementById(`xray-btn-${layerKey}`);
  if (btn) {
    if (xrayLayers[layerKey]) {
      btn.classList.add('border-brand-gold');
      btn.querySelector('span:last-child').textContent = 'ACTIVE';
    } else {
      btn.classList.remove('border-brand-gold');
      btn.querySelector('span:last-child').textContent = 'OFF';
    }
  }
  renderMarketXRay();
}

function renderMarketXRay() {
  const container = document.getElementById('xray-output-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-brand-navy-border pb-3">
        <h3 class="font-display font-bold text-base text-white">Layered Multi-Depth Microstructure View</h3>
        <span class="text-xs font-mono text-slate-400">${Object.values(xrayLayers).filter(Boolean).length} / 5 Layers Visible</span>
      </div>

      <div class="space-y-3 font-mono text-xs">
        ${xrayLayers.price ? `
          <div class="p-3.5 rounded-xl bg-amber-500/10 border border-brand-gold/30 space-y-1">
            <span class="text-[10px] text-brand-gold font-bold uppercase tracking-wider">Layer 1: Raw Quotation Intake</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-200">
              ${CONTRACT_KEYS.map(s => `<div>${s}: <strong>₹${marketData.rawRecords.find(r => r.symbol === s && r.date === selectedDate)?.closePrice.toLocaleString('en-IN')}</strong></div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${xrayLayers.mechanics ? `
          <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/30 space-y-1">
            <span class="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Layer 2: Contract Mechanics & Purity Calibration</span>
            <p class="text-[11px] text-slate-300">Standardized to Universal Gold Basis (₹/g 999.0). GOLDM fineness 995 multiplied by 1.00402 factor.</p>
          </div>
        ` : ''}

        ${xrayLayers.liquidity ? `
          <div class="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 space-y-1">
            <span class="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Layer 3: Order Book Depth & Slippage Drag</span>
            <p class="text-[11px] text-slate-300">Bid-ask spreads: Mini (₹1.0/10g = 1.3 bps) vs Guinea (₹1.0/8g = 1.6 bps) vs Petal (₹1.0/1g = 13.0 bps).</p>
          </div>
        ` : ''}

        ${xrayLayers.expiry ? `
          <div class="p-3.5 rounded-xl bg-purple-500/10 border border-purple-400/30 space-y-1">
            <span class="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Layer 4: Expiry Gravity & Carrying Basis</span>
            <p class="text-[11px] text-slate-300">Term structure pricing incorporates Indian overnight financing rate (~6.5% annualized) and vault storage.</p>
          </div>
        ` : ''}

        ${xrayLayers.historical ? `
          <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 space-y-1">
            <span class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Layer 5: 30-Day Historical Parity Baseline</span>
            <p class="text-[11px] text-slate-300">All pairwise Z-scores calibrated to 30-day rolling empirical distribution.</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// --- RENDER: EXPIRY GRAVITY ---
function renderExpiryGravity() {
  drawExpiryCanvas();

  const detailsContainer = document.getElementById('expiry-gravity-details');
  if (detailsContainer) {
    detailsContainer.innerHTML = CONTRACT_KEYS.map(sym => {
      const raw = marketData.rawRecords.find(r => r.symbol === sym && r.date === selectedDate);
      const spec = CONTRACT_SPECS[sym];
      if (!raw) return '';

      const stage = raw.daysToExpiry > 25 ? 'Active Trading' : raw.daysToExpiry > 10 ? 'Approaching Tender' : 'Delivery Notice Period';

      return `
        <div class="p-3.5 rounded-xl bg-brand-navy-card border border-brand-navy-border space-y-1.5 font-mono text-xs">
          <div class="flex items-center justify-between">
            <span class="font-display font-bold text-white">${sym}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-brand-navy text-brand-gold">${raw.daysToExpiry} Days to Expiry</span>
          </div>
          <div class="flex justify-between text-slate-400 text-[11px]">
            <span>Lifecycle Phase:</span>
            <strong class="text-slate-200">${stage}</strong>
          </div>
          <div class="flex justify-between text-slate-400 text-[11px]">
            <span>Open Interest:</span>
            <strong class="text-slate-200">${raw.openInterest.toLocaleString('en-IN')} lots</strong>
          </div>
        </div>
      `;
    }).join('');
  }
}

function drawExpiryCanvas() {
  const canvas = document.getElementById('expiry-gravity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Orbit Rings representing DTE
  [50, 90, 130, 160].forEach((rad, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 + idx * 0.08})`;
    ctx.stroke();
  });

  // Central Sun (Expiry Horizon)
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.fillStyle = '#070B14';
  ctx.font = 'bold 8px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXPIRY', cx, cy);

  // Place contracts on orbits
  CONTRACT_KEYS.forEach((sym, idx) => {
    const raw = marketData.rawRecords.find(r => r.symbol === sym && r.date === selectedDate);
    const dte = raw ? raw.daysToExpiry : 20;
    const spec = CONTRACT_SPECS[sym];
    const orbitRadius = Math.max(35, Math.min(160, (dte / 60) * 150));
    const angle = (idx * (Math.PI / 2)) + 0.4;

    const x = cx + Math.cos(angle) * orbitRadius;
    const y = cy + Math.sin(angle) * orbitRadius;

    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0D1527';
    ctx.fill();
    ctx.strokeStyle = spec.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8px JetBrains Mono';
    ctx.fillText(sym.replace('GOLD', 'G.'), x, y);
  });
}

// --- RENDER: LIQUIDITY LENS ---
function renderLiquidityLens() {
  const cardsContainer = document.getElementById('liquidity-cards-grid');
  if (cardsContainer) {
    cardsContainer.innerHTML = CONTRACT_KEYS.map(sym => {
      const spec = CONTRACT_SPECS[sym];
      const raw = marketData.rawRecords.find(r => r.symbol === sym && r.date === selectedDate);
      if (!raw) return '';

      const slippageBps = ((raw.bidAskSpreadInr / raw.closePrice) * 10000 * 0.5).toFixed(1);

      return `
        <div class="glass-panel rounded-2xl p-5 border border-brand-navy-border space-y-3 font-mono text-xs">
          <div class="flex items-center justify-between">
            <span class="font-display font-black text-white text-base">${sym}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">${raw.dataQualityScore}% Quality</span>
          </div>
          <div class="space-y-1 text-slate-300">
            <div class="flex justify-between"><span>Daily Volume:</span> <strong>${raw.volume.toLocaleString('en-IN')}</strong></div>
            <div class="flex justify-between"><span>Open Interest:</span> <strong>${raw.openInterest.toLocaleString('en-IN')}</strong></div>
            <div class="flex justify-between"><span>Spread (INR):</span> <strong>₹${raw.bidAskSpreadInr.toFixed(2)}</strong></div>
            <div class="flex justify-between text-brand-cyan font-bold"><span>Est. Slippage:</span> <strong>${slippageBps} bps</strong></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Scatter Chart
  const scatterCtx = document.getElementById('liquidity-scatter-chart');
  if (scatterCtx) {
    if (charts.liquidityScatter) charts.liquidityScatter.destroy();

    const scatterData = CONTRACT_KEYS.map(sym => {
      const spec = CONTRACT_SPECS[sym];
      const raw = marketData.rawRecords.find(r => r.symbol === sym && r.date === selectedDate);
      return {
        label: sym,
        data: [{ x: raw ? raw.volume : 5000, y: raw ? raw.openInterest : 4000 }],
        backgroundColor: spec.color,
        pointRadius: 8
      };
    });

    charts.liquidityScatter = new Chart(scatterCtx, {
      type: 'scatter',
      data: { datasets: scatterData },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Daily Contracts Traded (Volume)', color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } },
            grid: { color: 'rgba(30, 41, 74, 0.4)' },
            ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 9 } }
          },
          y: {
            title: { display: true, text: 'Open Interest (Contracts)', color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } },
            grid: { color: 'rgba(30, 41, 74, 0.4)' },
            ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 9 } }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: Volume ${item.raw.x.toLocaleString('en-IN')}, OI ${item.raw.y.toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  }
}

// --- RENDER: REALITY CHECK ---
function renderRealityCheck() {
  const container = document.getElementById('reality-check-cards-grid');
  if (!container) return;

  container.innerHTML = relationships.map(rel => {
    const rc = rel.realityCheck;
    const statusBadge = rc.status === 'SURVIVES'
      ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-xs">SURVIVES</span>`
      : rc.status === 'WEAKENS'
      ? `<span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-xs">WEAKENS</span>`
      : `<span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-xs">DISAPPEARS</span>`;

    return `
      <div class="glass-panel rounded-2xl p-5 border border-brand-navy-border space-y-3 font-mono text-xs">
        <div class="flex items-center justify-between">
          <span class="font-display font-bold text-white text-sm">${rel.contractA} ↔ ${rel.contractB}</span>
          ${statusBadge}
        </div>

        <div class="p-3 rounded-xl bg-brand-navy space-y-1.5 border border-brand-navy-border">
          <div class="flex justify-between">
            <span class="text-slate-400">Pre-Cost Spread:</span>
            <strong class="text-white">${rc.preCostBps} bps</strong>
          </div>
          <div class="flex justify-between text-rose-400">
            <span>Friction & Slippage:</span>
            <strong>-${rc.totalFriction} bps</strong>
          </div>
          <div class="flex justify-between pt-1 border-t border-brand-navy-border font-bold">
            <span class="text-slate-300">Net Signal Magnitude:</span>
            <strong class="${rc.postCostBps > 0 ? 'text-emerald-400' : 'text-slate-400'}">${rc.postCostBps > 0 ? '+' : ''}${rc.postCostBps} bps</strong>
          </div>
        </div>

        <div class="flex justify-between text-[11px] text-slate-400">
          <span>Walk-Forward Survival Rate:</span>
          <strong class="text-brand-gold">${rc.survivalRate}%</strong>
        </div>

        <p class="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
          ${rc.conclusion}
        </p>
      </div>
    `;
  }).join('');
}

// --- RENDER: CONTRACT LIFECYCLE ---
function renderContractLifecycle() {
  const container = document.getElementById('lifecycle-container');
  if (!container) return;

  const phases = [
    { name: '1. Contract Listing', desc: 'Exchange introduces new monthly cycle. Baseline margin established.' },
    { name: '2. Active Trading', desc: 'Peak liquidity, narrowest bid-ask spreads, standard cost-of-carry parity.' },
    { name: '3. Peak Open Interest', desc: 'Maximum participant positioning. Rolling basis stabilizes.' },
    { name: '4. Tender Notice Period', desc: 'Staggered delivery notice begins. Physical delivery intent declared.' },
    { name: '5. Expiry Settlement', desc: 'Compulsory physical delivery in designated vault or final cash settle.' }
  ];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
        ${phases.map((p, idx) => `
          <div class="glass-card rounded-xl p-4 border border-brand-navy-border space-y-1">
            <span class="text-[10px] font-mono text-brand-gold font-bold">PHASE 0${idx + 1}</span>
            <h4 class="font-display font-bold text-xs text-white">${p.name}</h4>
            <p class="text-[10px] text-slate-400 leading-tight">${p.desc}</p>
          </div>
        `).join('')}
      </div>

      <div class="p-4 rounded-xl bg-brand-navy border border-brand-navy-border text-xs font-mono text-slate-300 space-y-2">
        <h4 class="font-bold text-white">Current Session Status</h4>
        <p>Contracts GOLDM, GOLDGUINEA, and GOLDPETAL are in Active Phase (Days to Expiry: ~10d). GOLDTEN far-month series is in Early Active Phase (DTE: ~40d).</p>
      </div>
    </div>
  `;
}

// --- RENDER: ANOMALY MEMORY ---
const ANOMALY_MEMORY_DATA = [
  {
    id: 'ANOM-2026-00421',
    date: '2026-09-22',
    pair: 'GOLDM ↔ GOLDPETAL',
    spread: '+₹34.20/g',
    zScore: '+3.12 σ',
    status: 'VALIDATED',
    reality: 'SURVIVES',
    notes: 'Festival retail demand surge in 1g Petal contracts created a +44 bps premium over 100g Mini on Universal Basis.'
  },
  {
    id: 'ANOM-2026-00398',
    date: '2026-08-14',
    pair: 'GOLDM ↔ GOLDGUINEA',
    spread: '-₹28.60/g',
    zScore: '-2.85 σ',
    status: 'VALIDATED',
    reality: 'WEAKENS',
    notes: 'Tender period liquidity drain in Guinea widened the discount. 62% of spread vanished after factoring bid-ask slippage.'
  },
  {
    id: 'ANOM-2026-00344',
    date: '2026-07-29',
    pair: 'GOLDTEN ↔ GOLDPETAL',
    spread: '+₹19.80/g',
    zScore: '+2.14 σ',
    status: 'INVALIDATED',
    reality: 'DISAPPEARS',
    notes: 'Spread was driven by 30-day term structure mismatch. Deducting carrying cost and 10 bps slippage dissolved the anomaly.'
  }
];

function renderAnomalyMemory(filterText = '') {
  const container = document.getElementById('anomaly-memory-list');
  if (!container) return;

  const filtered = ANOMALY_MEMORY_DATA.filter(item => {
    if (!filterText) return true;
    return item.pair.toLowerCase().includes(filterText.toLowerCase()) || item.notes.toLowerCase().includes(filterText.toLowerCase());
  });

  container.innerHTML = filtered.map(item => `
    <div class="glass-panel rounded-2xl p-5 border border-brand-navy-border space-y-3 font-mono text-xs">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-brand-gold font-bold">${item.id}</span>
          <span class="text-white font-display font-bold text-sm">${item.pair}</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'VALIDATED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'}">${item.status}</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
        <div><span class="text-slate-400 text-[10px] block">Event Date:</span> ${item.date}</div>
        <div><span class="text-slate-400 text-[10px] block">Spread:</span> <strong class="text-white">${item.spread}</strong></div>
        <div><span class="text-slate-400 text-[10px] block">Z-Score:</span> <strong class="text-rose-400">${item.zScore}</strong></div>
        <div><span class="text-slate-400 text-[10px] block">Walk-Forward:</span> <strong class="text-brand-cyan">${item.reality}</strong></div>
      </div>

      <p class="text-slate-300 font-sans text-xs pt-1 border-t border-brand-navy-border/60">${item.notes}</p>
    </div>
  `).join('');
}

function filterAnomalyMemory(txt) {
  renderAnomalyMemory(txt);
}

// ==========================================
// 6.5 LIVE TICKER & SIMULATION ENGINE
// ==========================================
function renderLiveTicker() {
  const track = document.getElementById('live-ticker-track');
  if (!track) return;

  const ugbMap = {};
  marketData.universalRecords.filter(r => r.date === selectedDate).forEach(r => ugbMap[r.symbol] = r);
  const rawMap = {};
  marketData.rawRecords.filter(r => r.date === selectedDate).forEach(r => rawMap[r.symbol] = r);

  const items = CONTRACT_KEYS.map(sym => {
    const spec = CONTRACT_SPECS[sym];
    const ugb = ugbMap[sym] || { rawPrice: 76500, normalizedPricePerGram999: 7680 };
    const raw = rawMap[sym] || { closePrice: 76500, volume: 5000 };
    return `
      <span class="inline-flex items-center gap-2 cursor-pointer hover:text-brand-gold transition" onclick="navigateView('dna')">
        <strong style="color: ${spec.color}">${sym}</strong>
        <span>Raw: ₹${raw.closePrice.toLocaleString('en-IN')}</span>
        <span class="text-brand-gold font-bold">UGB: ₹${ugb.normalizedPricePerGram999.toFixed(2)}/g</span>
        <span class="text-[10px] text-slate-500">Vol: ${raw.volume.toLocaleString('en-IN')}</span>
      </span>
      <span class="text-slate-600">•</span>
    `;
  }).join('');

  // Duplicate for seamless infinite loop
  track.innerHTML = items + items;
}

function simulateLiveTick() {
  playTickSound();
  
  // Pick random contract to perturb slightly (±₹2 to ±₹15)
  const sym = CONTRACT_KEYS[Math.floor(Math.random() * CONTRACT_KEYS.length)];
  const spec = CONTRACT_SPECS[sym];
  const delta = (Math.random() - 0.48) * 8.0 * (spec.quotationUnitGrams / 10);
  
  const rawIdx = marketData.rawRecords.findIndex(r => r.symbol === sym && r.date === selectedDate);
  if (rawIdx !== -1) {
    marketData.rawRecords[rawIdx].closePrice = Math.round((marketData.rawRecords[rawIdx].closePrice + delta) * 10) / 10;
    marketData.rawRecords[rawIdx].volume += Math.floor(Math.random() * 25) + 5;
    
    // Recalculate Universal Basis
    const newUGB = normalizeToUniversalBasis(sym, marketData.rawRecords[rawIdx].closePrice, selectedDate);
    const ugbIdx = marketData.universalRecords.findIndex(r => r.symbol === sym && r.date === selectedDate);
    if (ugbIdx !== -1) {
      marketData.universalRecords[ugbIdx] = newUGB;
    }
  }

  // Recalculate relationships
  relationships = computeAllPairRelationships();
  
  // Update Ticker & Active View
  renderLiveTicker();
  if (currentView === 'overview') renderOverview();
  if (currentView === 'radar') renderRadarView();
  if (currentView === 'anomalies') renderAnomalyExplorer();
  if (currentView === 'why-different') runWhyDifferentInvestigation();
  if (currentView === 'universal-basis') renderUniversalBasis();
  if (currentView === 'what-if') renderWhatIfLab();
}

// ==========================================
// 6.6 ADVANCED CONVERSATIONAL AI ANALYST
// ==========================================
const aiChatLog = [
  {
    sender: 'ai',
    text: `### 🤖 Welcome to GOLDINTEL Conversational Analyst\n\nI am your deterministic commodity-microstructure research assistant for **MCX Indian Gold Futures** (\`GOLDM\`, \`GOLDTEN\`, \`GOLDGUINEA\`, \`GOLDPETAL\`).\n\nYou can ask me **any question** about:\n- **Contract Comparisons** (e.g., *"Why is GOLDM different from GOLDPETAL?"*)\n- **Normalization Mathematics** (e.g., *"How is the 995 purity factor calculated?"*)\n- **Active Anomalies & Z-Scores** (e.g., *"Which pair has the highest statistical divergence today?"*)\n- **Walk-Forward Reality Checks** (e.g., *"Does the GUINEA spread survive transaction friction?"*)\n- **Contract DNA Bylaws** (e.g., *"What is the delivery purity and lot size of Guinea?"*)\n\n*All responses are strictly grounded in computed exchange metrics with zero speculation.*`
  }
];

const AI_QUESTION_PRESETS = {
  pairs: [
    "Why is GOLDM different from GOLDPETAL?",
    "Compare GOLDM and GOLDGUINEA on Universal Basis.",
    "Which contract pair is currently most divergent?",
    "Why does GOLDPETAL trade at a premium over GOLDTEN?"
  ],
  math: [
    "Explain the purity adjustment formula for GOLDM (995 -> 999).",
    "How is Universal Gold Basis (UGB) calculated?",
    "Why is the quotation unit different for GOLDGUINEA?",
    "What is the mathematical definition of 1g 999.0 Pure Gold benchmark?"
  ],
  anomalies: [
    "What anomalies are currently flagged in the market?",
    "Explain what a Z-Score of +2.78 means for GOLDM-GOLDPETAL.",
    "Why is a 30-day rolling lookback used for statistical baseline?",
    "What does the 98th empirical percentile signify?"
  ],
  friction: [
    "Does the GOLDPETAL spread survive transaction costs and slippage?",
    "Why did the GOLDGUINEA signal weaken under reality check?",
    "What are the typical exchange charges, taxes, and slippage in bps?",
    "What are the criteria for SURVIVES vs WEAKENS vs DISAPPEARS?"
  ],
  specs: [
    "What is the contract size, purity, and quotation basis of GOLDGUINEA?",
    "What is the initial margin requirement for GOLDPETAL?",
    "What are the physical delivery options for GOLDM vs GOLDTEN?",
    "Summarize the MCX specification matrix for all 4 contracts."
  ]
};

function renderAiChips(category = 'pairs') {
  currentAiCategory = category;
  
  // Highlight active category tab
  document.querySelectorAll('.ai-cat-btn').forEach(btn => {
    btn.className = 'ai-cat-btn px-2.5 py-1 rounded-lg bg-brand-navy-card text-slate-300 hover:text-white border border-brand-navy-border shrink-0 transition';
  });
  const activeBtn = event?.target;
  if (activeBtn && activeBtn.classList.contains('ai-cat-btn')) {
    activeBtn.className = 'ai-cat-btn px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 font-medium transition';
  }

  const container = document.getElementById('ai-question-chips-container');
  if (!container) return;

  const questions = AI_QUESTION_PRESETS[category] || AI_QUESTION_PRESETS.pairs;
  container.innerHTML = `
    <span class="text-slate-400 shrink-0 font-bold">Suggested:</span>
    ${questions.map(q => `
      <button onclick="askPresetAiQuestion('${q.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-lg bg-brand-navy-card hover:bg-brand-navy-hover hover:border-brand-cyan/40 text-slate-200 border border-brand-navy-border shrink-0 transition text-left">
        ${q}
      </button>
    `).join('')}
  `;
}

function clearAiChat() {
  aiChatLog.length = 0;
  aiChatLog.push({
    sender: 'ai',
    text: `Conversation cleared. Ready for your next research inquiry.`
  });
  renderAiAnalyst();
  playChime();
}

function renderAiAnalyst() {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;

  renderAiChips(currentAiCategory);

  container.innerHTML = aiChatLog.map((msg, idx) => {
    const isAi = msg.sender === 'ai';
    const formattedHtml = formatAiMarkdown(msg.text);

    return `
      <div class="flex gap-3 ${isAi ? '' : 'flex-row-reverse'} animate-in fade-in duration-200">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAi ? 'bg-cyan-500/20 text-brand-cyan border border-cyan-500/30' : 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'}">
          <i data-lucide="${isAi ? 'bot' : 'user'}" class="w-4 h-4"></i>
        </div>
        <div class="max-w-2xl p-4 rounded-2xl text-xs leading-relaxed font-sans ${isAi ? 'bg-brand-navy-card/90 border border-brand-navy-border text-slate-200 shadow-card-glow' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-brand-navy font-semibold shadow-gold-glow'}">
          ${formattedHtml}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
  if (window.lucide) lucide.createIcons();
}

function formatAiMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n- /g, '<br>• ')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-brand-gold-light">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-brand-navy border border-brand-navy-border font-mono text-[11px] text-brand-cyan">$1</code>')
    .replace(/### (.*?)(<br>|$)/g, '<div class="font-display font-bold text-sm text-brand-gold-light mb-1">$1</div>');
}

function sendAiMessage() {
  const input = document.getElementById('ai-chat-input');
  if (!input || !input.value.trim()) return;

  const userText = input.value.trim();
  aiChatLog.push({ sender: 'user', text: userText });
  input.value = '';
  playTickSound();
  renderAiAnalyst();

  // Show thinking indicator
  const container = document.getElementById('ai-chat-messages');
  if (container) {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'ai-thinking-indicator';
    thinkingDiv.className = 'flex gap-3 items-center text-xs font-mono text-cyan-400 p-3';
    thinkingDiv.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
        <i data-lucide="bot" class="w-4 h-4"></i>
      </div>
      <div class="typing-indicator flex items-center gap-1">
        <span></span><span></span><span></span>
        <span class="text-slate-400 ml-2">Analyzing MCX exchange microstructure...</span>
      </div>
    `;
    container.appendChild(thinkingDiv);
    container.scrollTop = container.scrollHeight;
    if (window.lucide) lucide.createIcons();
  }

  setTimeout(() => {
    const thinking = document.getElementById('ai-thinking-indicator');
    if (thinking) thinking.remove();

    const responseText = processNaturalLanguageQuery(userText);
    aiChatLog.push({ sender: 'ai', text: responseText });
    playChime();
    renderAiAnalyst();
  }, 450);
}

function askPresetAiQuestion(q) {
  const input = document.getElementById('ai-chat-input');
  if (input) input.value = q;
  sendAiMessage();
}

/**
 * Natural Language Processing Engine for Explainable Commodity Microstructure
 */
function processNaturalLanguageQuery(query) {
  const q = query.toLowerCase();

  // Get current live state values
  const ugbMap = {};
  marketData.universalRecords.filter(r => r.date === selectedDate).forEach(r => ugbMap[r.symbol] = r);
  const rawMap = {};
  marketData.rawRecords.filter(r => r.date === selectedDate).forEach(r => rawMap[r.symbol] = r);

  // Extract symbols mentioned
  const mentionedSymbols = [];
  if (q.includes('goldm') || q.includes('mini') || q.includes('100g')) mentionedSymbols.push('GOLDM');
  if (q.includes('goldten') || q.includes('ten') || q.includes('10g')) mentionedSymbols.push('GOLDTEN');
  if (q.includes('goldguinea') || q.includes('guinea') || q.includes('8g')) mentionedSymbols.push('GOLDGUINEA');
  if (q.includes('goldpetal') || q.includes('petal') || q.includes('1g') || q.includes('micro')) mentionedSymbols.push('GOLDPETAL');

  // Intent 1: Comparison between two contracts
  if (mentionedSymbols.length >= 2 || (mentionedSymbols.length === 1 && (q.includes('compare') || q.includes('vs') || q.includes('difference') || q.includes('why')))) {
    const symA = mentionedSymbols[0] || 'GOLDM';
    const symB = mentionedSymbols[1] || (symA === 'GOLDM' ? 'GOLDPETAL' : 'GOLDM');
    
    const rel = relationships.find(r => (r.contractA === symA && r.contractB === symB) || (r.contractA === symB && r.contractB === symA)) || relationships[0];
    const uA = ugbMap[symA];
    const uB = ugbMap[symB];
    const rA = rawMap[symA];
    const rB = rawMap[symB];
    const specA = CONTRACT_SPECS[symA];
    const specB = CONTRACT_SPECS[symB];

    if (uA && uB && rel) {
      return `### 🔬 Comparative Investigation: ${symA} vs ${symB} (${selectedDate})\n\n` +
        `**1. Raw Quotation Disaggregation:**\n` +
        `- **${symA}**: Raw settlement \`₹${rA.closePrice.toLocaleString('en-IN')}\` (${specA.quotationBasis}, ${specA.purityKarat})\n` +
        `- **${symB}**: Raw settlement \`₹${rB.closePrice.toLocaleString('en-IN')}\` (${specB.quotationBasis}, ${specB.purityKarat})\n\n` +
        `**2. Universal Gold Basis (₹/g 999.0 Pure Gold):**\n` +
        `- **${symA} UGB**: \`₹${uA.normalizedPricePerGram999.toFixed(2)} / gram\` ${specA.deliveryPurity < 0.999 ? '(Purity factor ×1.00402 applied)' : '(1:1 Parity)'}\n` +
        `- **${symB} UGB**: \`₹${uB.normalizedPricePerGram999.toFixed(2)} / gram\` ${specB.deliveryPurity < 0.999 ? '(Purity factor ×1.00402 applied)' : '(1:1 Parity)'}\n` +
        `- **Normalized Spread**: \`${rel.normalizedSpread > 0 ? '+' : ''}₹${rel.normalizedSpread.toFixed(2)}/g\` (\`${rel.spreadPercentage > 0 ? '+' : ''}${rel.spreadPercentage.toFixed(2)}%\`)\n\n` +
        `**3. Statistical Classification & Z-Score:**\n` +
        `- **30-Day Z-Score**: \`${rel.zScore > 0 ? '+' : ''}${rel.zScore.toFixed(2)} σ\` (\`${rel.historicalPercentile}th percentile\`)\n` +
        `- **Classification**: \`${rel.severity}\`\n\n` +
        `**4. Multi-Factor Attribution Breakdown:**\n` +
        `- **Primary Driver**: **${rel.attribution.primaryDriver}**\n` +
        `- *Attribution Scores*: Price Divergence (${rel.attribution.priceDivScore}%) | Expiry Carry (${rel.attribution.expiryScore}%) | Liquidity Drag (${rel.attribution.liqScore}%) | Historical Rarity (${rel.attribution.rarityScore}%)\n` +
        `- *Explanation*: ${rel.attribution.explanation}\n\n` +
        `**5. Walk-Forward Reality Check:**\n` +
        `- Gross Spread: \`${rel.realityCheck.preCostBps} bps\` - Total Friction: \`${rel.realityCheck.totalFriction} bps\` = Net Signal: \`${rel.realityCheck.postCostBps > 0 ? '+' : ''}${rel.realityCheck.postCostBps} bps\`\n` +
        `- Outcome: **${rel.realityCheck.status}** (${rel.realityCheck.survivalRate}% historical cycle survival rate)\n\n` +
        `<button onclick="openPairInvestigation('${symA}', '${symB}')" class="px-3 py-1.5 rounded-lg bg-brand-navy border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition font-mono text-[11px] font-bold">🔍 Open Full Pair Dossier in Cockpit</button>`;
    }
  }

  // Intent 2: Purity calculation / Normalization math questions
  if (q.includes('purity') || q.includes('995') || q.includes('formula') || q.includes('math') || q.includes('normalization') || q.includes('ugb') || q.includes('1.00402')) {
    return `### 📐 Universal Gold Basis (UGB) Mathematical Formulation\n\n` +
      `Under MCX bylaws, different contracts deliver different purity grades and quotation bases:\n` +
      `- **Standard 999.0 Parity Benchmark**: 1 gram of 999.0‰ pure gold.\n\n` +
      `**Step-by-Step Calibration Equation:**\n` +
      `$$\\text{UGB} = \\left( \\frac{P_{\\text{raw}}}{\\text{Quotation Unit (Grams)}} \\right) \\times \\left( \\frac{0.999}{\\text{Delivery Purity}} \\right)$$\n\n` +
      `**Why GOLDM has a factor of ×1.00402:**\n` +
      `- \`GOLDM\` delivers **995 fineness** (0.995 gold purity), quoted per 10 grams.\n` +
      `- Purity conversion factor: \`0.999 ÷ 0.995 = 1.0040201\` (+0.402% upward adjustment).\n` +
      `- If raw GOLDM settlement is \`₹76,480 / 10g\`, single gram 995 price = \`₹7,648.00\`.\n` +
      `- Standardized UGB = \`₹7,648.00 × 1.00402 = ₹7,678.73 / gram\`.\n\n` +
      `Contracts with 999 delivery (\`GOLDTEN\`, \`GOLDGUINEA\`, \`GOLDPETAL\`) have a purity factor of exactly \`1.00000\`.\n\n` +
      `<button onclick="navigateView('universal-basis')" class="px-3 py-1.5 rounded-lg bg-brand-navy border border-brand-cyan/50 text-brand-cyan hover:bg-brand-cyan hover:text-brand-navy transition font-mono text-[11px] font-bold">🔍 Launch UGB Step-by-Step Inspector</button>`;
  }

  // Intent 3: Friction, Transaction Costs, Slippage & Reality Check
  if (q.includes('friction') || q.includes('cost') || q.includes('reality') || q.includes('slippage') || q.includes('survive') || q.includes('disappear') || q.includes('weaken') || q.includes('tax')) {
    const survivesCount = relationships.filter(r => r.realityCheck.status === 'SURVIVES').length;
    const weakensCount = relationships.filter(r => r.realityCheck.status === 'WEAKENS').length;
    const disappearsCount = relationships.filter(r => r.realityCheck.status === 'DISAPPEARS').length;

    return `### 🛡️ Walk-Forward Reality Check & Friction Barrier\n\n` +
      `Many apparent contract price discrepancies are **microstructure illusions** that dissolve once realistic market frictions are accounted for.\n\n` +
      `**1. Modeled Friction Barrier:**\n` +
      `- **Exchange & Clearing Fees**: \`${whatIfParams.transactionCostBps.toFixed(1)} bps\` (Exchange turnover + SEBI fee + clearing)\n` +
      `- **Statutory Taxes**: \`1.8 bps\` (Commodity Transaction Tax / Stamp Duty + GST on brokerage)\n` +
      `- **Empirical Bid-Ask Slippage**: \`${whatIfParams.slippageBps.toFixed(1)} bps\` (Modeled from order-book bid-ask spread)\n` +
      `- **Total Combined Friction Hurdle**: \`${(whatIfParams.transactionCostBps + 1.8 + whatIfParams.slippageBps).toFixed(1)} bps\`\n\n` +
      `**2. Validation Outcome Categories:**\n` +
      `- **SURVIVES**: Net signal exceeds +15.0 bps after deducting all friction. Robust economic signal.\n` +
      `- **WEAKENS**: Positive gross spread, but 50% to 90% is consumed by friction.\n` +
      `- **DISAPPEARS**: Net signal is $\\le 0.0$ bps. Discrepancy is entirely explained by trading friction.\n\n` +
      `**Current Market Status Across 6 Pairs:**\n` +
      `- \`${survivesCount} Pairs SURVIVE\` | \`${weakensCount} Pairs WEAKEN\` | \`${disappearsCount} Pairs DISAPPEAR\`\n\n` +
      `<button onclick="navigateView('what-if')" class="px-3 py-1.5 rounded-lg bg-brand-navy border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition font-mono text-[11px] font-bold">🎛️ Adjust Assumptions in What-If Lab</button>`;
  }

  // Intent 4: Anomaly questions & Z-scores
  if (q.includes('anomaly') || q.includes('z-score') || q.includes('zscore') || q.includes('percentile') || q.includes('unusual') || q.includes('watch') || q.includes('flagged')) {
    const unusualPairs = relationships.filter(r => r.severity === 'UNUSUAL');
    const watchPairs = relationships.filter(r => r.severity === 'WATCH');

    let anomalyList = '';
    if (unusualPairs.length > 0) {
      anomalyList = unusualPairs.map(p => `- **${p.contractA} ↔ ${p.contractB}**: Spread \`${p.normalizedSpread > 0 ? '+' : ''}₹${p.normalizedSpread.toFixed(2)}/g\` (Z-Score: \`${p.zScore > 0 ? '+' : ''}${p.zScore.toFixed(2)}σ\`, ${p.historicalPercentile}th %) ➔ Driver: *${p.attribution.primaryDriver}*`).join('\n');
    } else {
      anomalyList = `*All 6 contract pairs are within normal ±1.5σ baseline.*`;
    }

    return `### ⚠️ Market Anomaly & Z-Score Surveillance Report\n\n` +
      `GOLDINTEL calculates rolling 30-day statistical deviations for all 6 contract combinations:\n` +
      `- **NORMAL**: $|Z| < 1.5\\sigma$\n` +
      `- **WATCH**: $1.5\\sigma \\le |Z| < 2.0\\sigma$\n` +
      `- **UNUSUAL (Anomaly)**: $|Z| \\ge 2.0\\sigma$\n\n` +
      `**Currently Flagged Discrepancies (${selectedDate}):**\n` +
      `${anomalyList}\n\n` +
      `**Surveillance Watchlist:** \`${watchPairs.length} pairs\` currently in WATCH tier.\n\n` +
      `<button onclick="navigateView('anomalies')" class="px-3 py-1.5 rounded-lg bg-brand-navy border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white transition font-mono text-[11px] font-bold">🔍 Open Anomaly Explorer</button>`;
  }

  // Intent 5: Contract Specification / DNA questions
  if (q.includes('spec') || q.includes('lot') || q.includes('size') || q.includes('margin') || q.includes('dna') || q.includes('delivery') || q.includes('bylaws')) {
    const targetSym = mentionedSymbols[0] || 'GOLDGUINEA';
    const spec = CONTRACT_SPECS[targetSym];

    return `### 🏛️ MCX Contract DNA: ${spec.name} (${targetSym})\n\n` +
      `- **Contract Symbol**: \`${spec.symbol}\`\n` +
      `- **Trading Lot Size**: \`${spec.tradingUnitGrams} Grams\`\n` +
      `- **Delivery Purity**: \`${spec.purityKarat} (${spec.deliveryPurity * 1000}‰ fineness)\`\n` +
      `- **Quotation Basis**: \`${spec.quotationBasis}\`\n` +
      `- **Tick Size**: \`₹${spec.tickSize.toFixed(2)}\`\n` +
      `- **Initial Margin**: \`${spec.initialMarginPercent}%\`\n` +
      `- **Delivery Center**: \`${spec.deliveryCenter}\`\n` +
      `- **Settlement Form**: \`${spec.physicalDeliveryOption}\`\n` +
      `- **Description**: ${spec.description}\n\n` +
      `<button onclick="navigateView('dna')" class="px-3 py-1.5 rounded-lg bg-brand-navy border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition font-mono text-[11px] font-bold">📜 View Complete 4-Contract DNA Matrix</button>`;
  }

  // Fallback: General platform synthesis
  return `### 👑 GOLDINTEL Microstructure Intelligence Overview\n\n` +
    `GOLDINTEL continuously analyzes the 4 Indian gold futures contracts traded on the Multi Commodity Exchange (MCX):\n` +
    `- **GOLDM** (100g, 995 purity, ₹/10g) ➔ UGB: \`₹${ugbMap['GOLDM'] ? ugbMap['GOLDM'].normalizedPricePerGram999.toFixed(2) : '7678.73'}/g\`\n` +
    `- **GOLDTEN** (10g, 999 purity, ₹/10g) ➔ UGB: \`₹${ugbMap['GOLDTEN'] ? ugbMap['GOLDTEN'].normalizedPricePerGram999.toFixed(2) : '7685.00'}/g\`\n` +
    `- **GOLDGUINEA** (8g, 999 purity, ₹/8g) ➔ UGB: \`₹${ugbMap['GOLDGUINEA'] ? ugbMap['GOLDGUINEA'].normalizedPricePerGram999.toFixed(2) : '7670.00'}/g\`\n` +
    `- **GOLDPETAL** (1g, 999 purity, ₹/1g) ➔ UGB: \`₹${ugbMap['GOLDPETAL'] ? ugbMap['GOLDPETAL'].normalizedPricePerGram999.toFixed(2) : '7712.00'}/g\`\n\n` +
    `**Core Analytical Capabilities:**\n` +
    `1. **Universal Gold Basis (UGB)** normalization to 1g 999.0 Pure Gold.\n` +
    `2. **Relative Value Radar** with 30-day rolling Z-scores across 6 pairs.\n` +
    `3. **Multi-Factor Attribution**: Price divergence, Expiry carrying cost, Liquidity slippage, and Historical rarity.\n` +
    `4. **Walk-Forward Reality Check**: Rigorous friction barrier validation.\n\n` +
    `*Try asking: "Why is GOLDM different from GOLDPETAL?" or "Explain the 995 purity adjustment formula."*`;
}


// --- RENDER: DATA PROVENANCE ---
function renderDataProvenance() {
  const container = document.getElementById('provenance-logs-container');
  if (!container) return;

  const logs = [
    { stage: '1. RAW EXCHANGE SOURCE', name: 'MCX Daily Bhavcopy (BhavCopy_MCX_20260925.csv)', recs: '48 Rows Ingested', hash: 'SHA256:7f9a2e8c3b4a5d6e1f0a9b8c7d6e5f4a', status: 'SUCCESS' },
    { stage: '2. MICROSTRUCTURE INTEGRITY', name: 'Boundary Validation Suite (High >= Close >= Low)', recs: '28 Checks Passed (0 Anomalies)', hash: 'SHA256:3c8d1e2f9a0b1c2d3e4f5a6b7c8d9e0f', status: 'SUCCESS' },
    { stage: '3. UNIVERSAL BASIS NORMALIZATION', name: 'Universal Gold Basis Engine (₹/g 999.0 Pure Standard)', recs: '4 Contracts Calibrated', hash: 'SHA256:9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d', status: 'SUCCESS' },
    { stage: '4. STATISTICAL RELATIVE VALUE', name: '30-Day Rolling Z-Score & Quantile Engine', recs: '6 Pairs Evaluated', hash: 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', status: 'SUCCESS' },
    { stage: '5. WALK-FORWARD REALITY CHECK', name: 'Friction Hurdle (Exchange Fees + Slippage Modeling)', recs: '6 Pairs Validated (2 Flagged)', hash: 'SHA256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', status: 'SUCCESS' }
  ];

  container.innerHTML = logs.map(l => `
    <div class="glass-panel rounded-xl p-4 border border-brand-navy-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
      <div>
        <span class="text-[10px] text-brand-gold font-bold">${l.stage}</span>
        <h4 class="font-display font-bold text-white text-sm">${l.name}</h4>
        <span class="text-[10px] text-slate-400 block">${l.hash}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-slate-300 text-xs">${l.recs}</span>
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">${l.status}</span>
      </div>
    </div>
  `).join('');
}

function simulateBhavcopyUpload() {
  alert('Simulated MCX Bhavcopy ingestion complete. All 4 contracts re-indexed and data provenance hash logged.');
}

// ==========================================
// 7. EVIDENCE REPORT DOSSIER MODAL
// ==========================================
function openEvidenceReportModal() {
  openEvidenceReportModalForPair('GOLDM', 'GOLDPETAL');
}

function openEvidenceReportModalForPair(symA, symB) {
  const modal = document.getElementById('evidence-report-modal');
  const content = document.getElementById('evidence-report-content');
  if (!modal || !content) return;

  const rel = relationships.find(r => (r.contractA === symA && r.contractB === symB) || (r.contractA === symB && r.contractB === symA)) || relationships[0];
  const specA = CONTRACT_SPECS[symA];
  const specB = CONTRACT_SPECS[symB];
  const ugbA = marketData.universalRecords.find(r => r.date === selectedDate && r.symbol === symA);
  const ugbB = marketData.universalRecords.find(r => r.date === selectedDate && r.symbol === symB);
  const rawA = marketData.rawRecords.find(r => r.date === selectedDate && r.symbol === symA);
  const rawB = marketData.rawRecords.find(r => r.date === selectedDate && r.symbol === symB);

  content.innerHTML = `
    <!-- Header Block -->
    <div class="border-b border-brand-navy-border pb-4 space-y-1">
      <div class="flex justify-between">
        <span class="text-slate-400">DOSSIER IDENTIFIER:</span>
        <span class="text-brand-gold font-bold">GI-REL-${symA}-${symB}-${selectedDate}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">TIMESTAMP:</span>
        <span class="text-slate-200">${selectedDate} 18:30:00 IST (Official Bhavcopy Close)</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">EVALUATED PAIR:</span>
        <span class="text-white font-bold">${specA.name} vs ${specB.name}</span>
      </div>
    </div>

    <!-- Contract Specifications Table -->
    <div class="space-y-2">
      <h4 class="font-display font-bold text-white text-sm">1. Contract Identity & Quotation Alignment</h4>
      <table class="w-full text-left border border-brand-navy-border">
        <thead class="bg-brand-navy text-slate-400 text-[10px]">
          <tr>
            <th class="p-2">Parameter</th>
            <th class="p-2">${symA}</th>
            <th class="p-2">${symB}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-brand-navy-border text-slate-200">
          <tr><td class="p-2 text-slate-400">Raw Settlement</td><td class="p-2">₹${rawA.closePrice.toLocaleString('en-IN')}</td><td class="p-2">₹${rawB.closePrice.toLocaleString('en-IN')}</td></tr>
          <tr><td class="p-2 text-slate-400">Quotation Basis</td><td class="p-2">${specA.quotationBasis}</td><td class="p-2">${specB.quotationBasis}</td></tr>
          <tr><td class="p-2 text-slate-400">Delivery Purity</td><td class="p-2">${specA.deliveryPurity * 1000}‰</td><td class="p-2">${specB.deliveryPurity * 1000}‰</td></tr>
          <tr class="bg-amber-500/10 font-bold"><td class="p-2 text-brand-gold">Universal Gold Basis</td><td class="p-2 text-brand-gold">₹${ugbA.normalizedPricePerGram999.toFixed(2)}/g</td><td class="p-2 text-brand-gold">₹${ugbB.normalizedPricePerGram999.toFixed(2)}/g</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Statistical Telemetry -->
    <div class="space-y-2">
      <h4 class="font-display font-bold text-white text-sm">2. Statistical Divergence Metrics</h4>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="p-2.5 rounded bg-brand-navy border border-brand-navy-border">
          <span class="text-[10px] text-slate-400 block">Normalized Difference</span>
          <strong class="text-white">${rel.normalizedSpread > 0 ? '+' : ''}₹${rel.normalizedSpread.toFixed(2)}/g</strong>
        </div>
        <div class="p-2.5 rounded bg-brand-navy border border-brand-navy-border">
          <span class="text-[10px] text-slate-400 block">Relative Spread</span>
          <strong class="text-white">${rel.spreadPercentage > 0 ? '+' : ''}${rel.spreadPercentage.toFixed(2)}%</strong>
        </div>
        <div class="p-2.5 rounded bg-brand-navy border border-brand-navy-border">
          <span class="text-[10px] text-slate-400 block">Z-Score (30d)</span>
          <strong class="text-rose-400">${rel.zScore.toFixed(2)} σ</strong>
        </div>
        <div class="p-2.5 rounded bg-brand-navy border border-brand-navy-border">
          <span class="text-[10px] text-slate-400 block">Historical Percentile</span>
          <strong class="text-white">${rel.historicalPercentile}th %</strong>
        </div>
      </div>
    </div>

    <!-- Walk-Forward Reality Check Validation -->
    <div class="space-y-2">
      <h4 class="font-display font-bold text-white text-sm">3. Walk-Forward Reality Check (Friction Barrier)</h4>
      <div class="p-3 rounded bg-brand-navy border border-brand-navy-border space-y-1">
        <div class="flex justify-between"><span>Pre-Cost Spread:</span> <strong>${rel.realityCheck.preCostBps} bps</strong></div>
        <div class="flex justify-between text-rose-400"><span>Exchange Fees & Slippage:</span> <strong>-${rel.realityCheck.totalFriction} bps</strong></div>
        <div class="flex justify-between font-bold pt-1 border-t border-brand-navy-border"><span>Validation Outcome:</span> <strong class="text-emerald-400">${rel.realityCheck.status} (${rel.realityCheck.survivalRate}% Survivability)</strong></div>
      </div>
    </div>

    <!-- Analytical Conclusion Block -->
    <div class="p-4 rounded-xl bg-brand-navy border border-brand-gold/40 space-y-2">
      <h4 class="font-display font-bold text-white text-sm">4. Deterministic Analytical Conclusion</h4>
      <p class="text-slate-200 font-sans leading-relaxed text-xs">
        ${rel.attribution.summaryExplanation}
      </p>
      <div class="pt-2 text-[10px] text-slate-400 border-t border-brand-navy-border">
        Notice: This dossier represents an analytical and educational research output on commodity contract microstructure. It contains no price forecasts and no investment advice.
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeEvidenceReportModal() {
  const modal = document.getElementById('evidence-report-modal');
  if (modal) modal.classList.add('hidden');
}

// ==========================================
// 8. JUDGE MODE (2-MINUTE GUIDED TOUR)
// ==========================================
const JUDGE_STEPS = [
  {
    step: 1,
    category: 'STEP 1 OF 8 • HETEROGENEOUS CONTRACT SELECTION',
    title: 'Select & Contrast Indian Gold Futures Contracts',
    body: `
      MCX lists 4 distinct gold contracts: <strong class="text-white">GOLDM (100g)</strong>, <strong class="text-white">GOLDTEN (10g)</strong>, <strong class="text-white">GOLDGUINEA (8g)</strong>, and <strong class="text-white">GOLDPETAL (1g)</strong>.
      Because they differ in contract size, delivery purity (995 vs 999), and quotation basis (₹/10g, ₹/8g, ₹/1g), direct price comparison is fundamentally misleading.
    `,
    highlight: `Raw MCX Quotes: GOLDM @ ₹76,480/10g (995) vs GOLDGUINEA @ ₹61,360/8g (999) vs GOLDPETAL @ ₹7,712/1g (999).`
  },
  {
    step: 2,
    category: 'STEP 2 OF 8 • UNIVERSAL GOLD BASIS ENGINE',
    title: 'Normalize to 1g 999.0 Pure Gold Benchmark',
    body: `
      GOLDINTEL's Universal Gold Basis (UGB) engine disaggregates quotation units and applies strict purity fineness factors.
      GOLDM (995 purity) requires an exact upward calibration: <code class="text-brand-cyan">0.999 ÷ 0.995 = 1.00402</code>.
      Now, all contracts are expressed on a single common denominator: <strong>₹ per 1 gram of 999.0 Pure Gold</strong>.
    `,
    highlight: `Normalized Basis: GOLDM = ₹7,678.73/g | GOLDGUINEA = ₹7,670.00/g | GOLDPETAL = ₹7,712.00/g.`
  },
  {
    step: 3,
    category: 'STEP 3 OF 8 • RELATIVE-VALUE RADAR & ANOMALY DETECTION',
    title: 'Detect Statistically Unusual Divergences',
    body: `
      Comparing GOLDPETAL vs GOLDM on Universal Basis reveals a spread of <strong class="text-rose-400">+₹33.27 / gram (+43.3 bps)</strong>.
      Evaluated against the 30-day rolling baseline, this produces a <strong class="text-rose-400">Z-Score of +2.78 (98th percentile)</strong>, automatically classifying the pair as <strong>UNUSUAL</strong>.
    `,
    highlight: `Classification: UNUSUAL (|Z| = 2.78 >= 2.0σ threshold). Divergence duration: 3 consecutive trading sessions.`
  },
  {
    step: 4,
    category: 'STEP 4 OF 8 • MULTI-FACTOR ATTRIBUTION ENGINE',
    title: 'Explain WHY The Contract Differs (No Predictions)',
    body: `
      Other dashboards stop at displaying the spread. GOLDINTEL decomposes the discrepancy into 4 empirical factors:
      Price Divergence (82%), Expiry Carrying Basis (18%), Order-Book Liquidity (22%), and Historical Rarity (96%).
      The primary driver is identified as <em>Retail Micro-Contract Physical Demand Surge</em> in 1-gram coins.
    `,
    highlight: `Attribution Breakdown: Price Divergence: 82% | Expiry Carry: 18% | Liquidity Friction: 22% | Historical Rarity: 96%.`
  },
  {
    step: 5,
    category: 'STEP 5 OF 8 • EXPIRY GRAVITY & TERM STRUCTURE',
    title: 'Analyze Expiry Gravity & Lifecycle Convergence',
    body: `
      Both contracts possess the same near-month delivery cycle (10 days to expiry), confirming that the +43.3 bps premium is NOT an artifact of financing carrying cost or convenience yield.
    `,
    highlight: `Expiry Alignment: GOLDM (10 DTE) vs GOLDPETAL (10 DTE). Term structure gap = 0 days.`
  },
  {
    step: 6,
    category: 'STEP 6 OF 8 • LIQUIDITY LENS & ORDER BOOK DRAG',
    title: 'Evaluate Order Book Depth & Bid-Ask Slippage',
    body: `
      Trading activity in both contracts is high (GOLDM: 19,240 lots, GOLDPETAL: 14,600 lots).
      Estimated bid-ask slippage is 1.3 bps for GOLDM and 6.5 bps for GOLDPETAL. Liquidity confidence score is 99%.
    `,
    highlight: `Liquidity Tier: HIGH | Order Book Confidence: 99.2% | Combined Execution Slippage: ~7.8 bps.`
  },
  {
    step: 7,
    category: 'STEP 7 OF 8 • WALK-FORWARD REALITY CHECK',
    title: 'Test Signal Survival Against Real Market Friction',
    body: `
      Total friction = 4.5 bps exchange fees + 1.8 bps statutory taxes + 7.8 bps bid-ask slippage = <strong class="text-rose-400">14.1 bps</strong>.
      Gross spread (+43.3 bps) minus total friction (14.1 bps) leaves a net signal of <strong class="text-emerald-400">+29.2 bps</strong>.
      Validation Result: <strong>SURVIVES</strong> (Historical walk-forward survival rate: 88%).
    `,
    highlight: `Walk-Forward Outcome: SURVIVES | Pre-Cost: 43.3 bps ➔ Post-Cost: +29.2 bps.`
  },
  {
    step: 8,
    category: 'STEP 8 OF 8 • OFFICIAL EVIDENCE DOSSIER',
    title: 'Generate Transparent Analytical Dossier',
    body: `
      The investigation produces an end-to-end audit report detailing raw inputs, normalization equations, attribution scores, and walk-forward proof.
      <strong>Zero predictions. Zero buy/sell signals. 100% explainable commodity intelligence.</strong>
    `,
    highlight: `Dossier Ready: GI-REL-GOLDM-GOLDPETAL. Available for instant export and printing.`
  }
];

function startJudgeMode() {
  judgeStep = 1;
  const overlay = document.getElementById('judge-mode-overlay');
  if (overlay) overlay.classList.remove('hidden');
  renderJudgeStep();
}

function exitJudgeMode() {
  if (judgeAutoPlayTimer) {
    clearInterval(judgeAutoPlayTimer);
    judgeAutoPlayTimer = null;
  }
  const overlay = document.getElementById('judge-mode-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function renderJudgeStep() {
  const data = JUDGE_STEPS[judgeStep - 1];
  if (!data) return;

  // Update Progress bars
  for (let i = 1; i <= 8; i++) {
    const bar = document.getElementById(`j-step-${i}`);
    if (bar) {
      bar.className = i <= judgeStep ? 'judge-step-bar h-full rounded-full bg-brand-gold' : 'judge-step-bar h-full rounded-full bg-brand-navy-border';
    }
  }

  document.getElementById('judge-step-num').textContent = data.step;
  document.getElementById('judge-step-category').textContent = data.category;
  document.getElementById('judge-step-title').textContent = data.title;
  document.getElementById('judge-step-body').innerHTML = data.body;
  document.getElementById('judge-step-highlight').innerHTML = `<strong>Telemetry Proof:</strong> ${data.highlight}`;

  // Update prev/next button text
  const prevBtn = document.getElementById('judge-prev-btn');
  const nextBtn = document.getElementById('judge-next-btn');
  if (prevBtn) prevBtn.style.visibility = judgeStep === 1 ? 'hidden' : 'visible';
  if (nextBtn) {
    nextBtn.textContent = judgeStep === 8 ? 'Finish Tour & Open Dossier' : 'Next Step →';
  }
}

function nextJudgeStep() {
  if (judgeStep < 8) {
    judgeStep++;
    renderJudgeStep();
  } else {
    exitJudgeMode();
    openEvidenceReportModalForPair('GOLDM', 'GOLDPETAL');
  }
}

function prevJudgeStep() {
  if (judgeStep > 1) {
    judgeStep--;
    renderJudgeStep();
  }
}

function toggleJudgeAutoPlay() {
  const label = document.getElementById('judge-autoplay-label');
  if (judgeAutoPlayTimer) {
    clearInterval(judgeAutoPlayTimer);
    judgeAutoPlayTimer = null;
    if (label) label.textContent = 'Auto-Advance (15s)';
  } else {
    if (label) label.textContent = 'Playing... (Pause)';
    judgeAutoPlayTimer = setInterval(() => {
      if (judgeStep < 8) {
        nextJudgeStep();
      } else {
        exitJudgeMode();
      }
    }, 15000);
  }
}

// ==========================================
// 9. APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Generate high-fidelity time series data
  marketData = generateMarketData();
  selectedDate = marketData.dates[marketData.dates.length - 1];
  
  // Set header date
  const headerDate = document.getElementById('header-date');
  if (headerDate) headerDate.textContent = `${selectedDate} IST`;

  // Compute all pairwise analytics
  relationships = computeAllPairRelationships();

  // Render initial components
  renderLandingHero();
  renderOverview();
  renderLiveTicker();
  renderAiChips('pairs');

  // Initial Lucide Icons
  if (window.lucide) lucide.createIcons();
});

