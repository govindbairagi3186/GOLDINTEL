export type ContractSymbol = 'GOLDM' | 'GOLDTEN' | 'GOLDGUINEA' | 'GOLDPETAL';

export interface ContractSpec {
  symbol: ContractSymbol;
  name: string;
  tradingUnitGrams: number;
  deliveryPurity: number; // e.g. 0.995 or 0.999
  purityKarat: string; // "24K (995)" or "24K (999)"
  quotationBasis: string; // "per 10g", "per 1g", "per 8g"
  quotationUnitGrams: number; // 10, 1, or 8
  tickSize: number; // in INR
  initialMarginPercent: number; // e.g. 10.5%
  typicalDailyVolume: number; // contracts
  typicalOpenInterest: number; // contracts
  deliveryCenter: string; // "Ahmedabad", "Mumbai"
  physicalDeliveryOption: string; // "Compulsory" or "Tender Period"
  color: string;
  badgeBg: string;
  description: string;
}

export interface RawMarketRecord {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: ContractSymbol;
  expiryDate: string;
  daysToExpiry: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number; // Raw settlement / close
  volume: number; // Number of contracts
  openInterest: number;
  bidAskSpreadInr: number;
  source: 'MCX_BHAVCOPY' | 'DEMO_SIMULATION';
  dataQualityScore: number; // 0 - 100
  dataWarnings: string[];
}

export interface UniversalBasisRecord {
  id: string;
  date: string;
  symbol: ContractSymbol;
  rawPrice: number;
  quotationUnitGrams: number;
  pricePerGramQuoted: number;
  purityFineness: number;
  normalizedPricePerGram999: number; // UGB: INR per 1g of 999.0 pure gold
  purityAdjustmentFactor: number; // e.g., 999/995 = 1.00402
  totalContractValueInr: number;
  effectiveCostBps: number;
  calculationSteps: CalculationStep[];
}

export interface CalculationStep {
  stepNumber: number;
  title: string;
  formula: string;
  inputValue: string;
  outputValue: string;
  rationale: string;
}

export type AnomalySeverity = 'NORMAL' | 'WATCH' | 'UNUSUAL';

export interface PairRelationship {
  pairKey: string; // e.g. "GOLDM-GOLDPETAL"
  contractA: ContractSymbol;
  contractB: ContractSymbol;
  date: string;
  rawSpread: number; // raw price A - raw price B
  normalizedSpreadInrPerGram: number; // UGB_A - UGB_B
  spreadPercentage: number; // (UGB_A - UGB_B) / UGB_B * 100
  rollingMean30d: number;
  rollingStd30d: number;
  zScore: number;
  historicalPercentile: number; // 0 to 100
  correlation30d: number;
  divergenceDurationDays: number;
  severity: AnomalySeverity;
  expiryDistanceDiffDays: number;
  liquidityTier: 'HIGH' | 'MODERATE' | 'THIN' | 'DISTRESSED';
  dataQuality: 'PRISTINE' | 'VERIFIED' | 'WARNING';
  attribution: AttributionBreakdown;
  walkForwardValidation: RealityCheckResult;
}

export interface AttributionBreakdown {
  priceDivergenceScore: number; // 0 to 100
  expiryEffectScore: number; // 0 to 100
  liquiditySpreadScore: number; // 0 to 100
  historicalRarityScore: number; // 0 to 100
  contractMechanicsAdjustment: string;
  primaryDriver: string;
  summaryExplanation: string;
}

export type RealityCheckStatus = 'SURVIVES' | 'WEAKENS' | 'DISAPPEARS';

export interface RealityCheckResult {
  preCostSpreadBps: number;
  totalCostAndSlippageBps: number;
  postCostSpreadBps: number;
  status: RealityCheckStatus;
  estimatedSlippageA_bps: number;
  estimatedSlippageB_bps: number;
  exchangeChargesBps: number;
  turnoverTaxAndGstBps: number;
  walkForwardSurvivalRate: number; // e.g. 78% of historical days survived
  conclusion: string;
}

export interface WhatIfParameters {
  transactionCostBps: number; // default: 4.5 bps
  slippageBps: number; // default: 6.0 bps
  liquidityThresholdContracts: number; // default: 150
  lookbackPeriodDays: number; // default: 30
  anomalyZThreshold: number; // default: 2.0
  purityToleranceBps: number; // default: 0
}

export interface AnomalyMemoryEvent {
  id: string;
  date: string;
  pair: string;
  symbolA: ContractSymbol;
  symbolB: ContractSymbol;
  normalizedSpread: number;
  zScore: number;
  percentile: number;
  severity: AnomalySeverity;
  liquidityCondition: string;
  expiryGapDays: number;
  realityCheckStatus: RealityCheckStatus;
  resolutionDays: number; // days until spread mean-reverted or expired
  status: 'OBSERVED' | 'VALIDATED' | 'INVALIDATED';
  notes: string;
}

export interface ProvenanceLog {
  stage: 'RAW_SOURCE' | 'INGESTION' | 'VALIDATION' | 'NORMALIZATION' | 'ANALYTICS' | 'PRESENTATION';
  timestamp: string;
  sourceDataset: string;
  recordsProcessed: number;
  checksum: string;
  validationRulesPassed: number;
  status: 'SUCCESS' | 'WARNING' | 'FLAGGED';
  details: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'goldintel-ai';
  timestamp: string;
  text: string;
  metricsUsed?: {
    pair: string;
    zScore: number;
    rawSpread: string;
    normalizedSpread: string;
    expiryGap: string;
    liquidityCondition: string;
    validationStatus: RealityCheckStatus;
  };
  groundedFacts: string[];
}
