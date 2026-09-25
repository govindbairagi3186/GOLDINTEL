from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ContractSpecModel(BaseModel):
    symbol: str
    name: str
    trading_unit_grams: float
    delivery_purity: float
    purity_karat: str
    quotation_basis: str
    quotation_unit_grams: float
    tick_size: float
    initial_margin_percent: float
    typical_daily_volume: int
    typical_open_interest: int
    delivery_center: str
    physical_delivery_option: str
    description: str

class CalculationStepModel(BaseModel):
    step_number: int
    title: str
    formula: str
    input_value: str
    output_value: str
    rationale: str

class UniversalBasisModel(BaseModel):
    id: str
    date: str
    symbol: str
    raw_price: float
    quotation_unit_grams: float
    price_per_gram_quoted: float
    purity_fineness: float
    normalized_price_per_gram_999: float
    purity_adjustment_factor: float
    total_contract_value_inr: float
    effective_cost_bps: float
    calculation_steps: List[CalculationStepModel]

class AttributionModel(BaseModel):
    price_divergence_score: float
    expiry_effect_score: float
    liquidity_spread_score: float
    historical_rarity_score: float
    contract_mechanics_adjustment: str
    primary_driver: str
    summary_explanation: str

class RealityCheckModel(BaseModel):
    pre_cost_spread_bps: float
    total_cost_and_slippage_bps: float
    post_cost_spread_bps: float
    status: str # SURVIVES, WEAKENS, DISAPPEARS
    estimated_slippage_a_bps: float
    estimated_slippage_b_bps: float
    exchange_charges_bps: float
    turnover_tax_and_gst_bps: float
    walk_forward_survival_rate: float
    conclusion: str

class PairRelationshipModel(BaseModel):
    pair_key: str
    contract_a: str
    contract_b: str
    date: str
    raw_spread: float
    normalized_spread_inr_per_gram: float
    spread_percentage: float
    rolling_mean_30d: float
    rolling_std_30d: float
    z_score: float
    historical_percentile: int
    correlation_30d: float
    divergence_duration_days: int
    severity: str # NORMAL, WATCH, UNUSUAL
    expiry_distance_diff_days: int
    liquidity_tier: str
    data_quality: str
    attribution: AttributionModel
    walk_forward_validation: RealityCheckModel

class WhatIfRequest(BaseModel):
    transaction_cost_bps: float = 4.5
    slippage_bps: float = 6.0
    liquidity_threshold_contracts: int = 150
    lookback_period_days: int = 30
    anomaly_z_threshold: float = 2.0
    purity_tolerance_bps: float = 0.0

class AIAnalystRequest(BaseModel):
    query: str
    pair: Optional[str] = None
    date: Optional[str] = None

class AIAnalystResponse(BaseModel):
    response: str
    grounded_metrics: Dict[str, Any]
    grounded_facts: List[str]
    disclaimer: str = "GOLDINTEL AI provides deterministic analytical explanations based strictly on calculated exchange microstructure metrics. It does not provide trading advice or price forecasts."
