# 👑 GOLDINTEL — Explainable Commodity-Contract Intelligence Platform

> **“Not another gold price dashboard. Understand why contracts differ.”**  
> *Explain the difference. Validate the signal.*

---

## 📌 Executive Summary & Hackathon Problem Statement

In the Indian commodity derivatives market (**Multi Commodity Exchange of India - MCX**), multiple gold futures contracts trade concurrently with heterogeneous specifications:
- **GOLDM (Gold Mini)**: 100g lot size, 995 fineness purity, quoted in ₹ per 10 grams.
- **GOLDTEN (Gold 10g)**: 10g lot size, 999 fineness purity, quoted in ₹ per 10 grams.
- **GOLDGUINEA (Gold Guinea)**: 8g lot size, 999 fineness purity, quoted in ₹ per 8 grams (1 Guinea).
- **GOLDPETAL (Gold Petal)**: 1g lot size, 999 fineness purity, quoted in ₹ per 1 gram.

### ❓ The Central Question of GOLDINTEL:
> **“When two related gold contracts appear to have different prices, is the difference actually unusual after accounting for contract size, purity, quotation basis, expiry carrying cost, and order-book liquidity?”**

Unlike traditional dashboards that merely display price charts or brokerages that issue buy/sell signals, **GOLDINTEL investigates WHY contracts diverge** using a mathematically rigorous, 5-stage analytical pipeline:

$$\text{Raw MCX Data} \longrightarrow \text{Data Validation} \longrightarrow \text{Universal Gold Basis} \longrightarrow \text{Multi-Factor Attribution} \longrightarrow \text{Walk-Forward Reality Check}$$

---

## 🏛️ System Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │             MCX EOD BHAVCOPY FEED            │
                       │    (Open, High, Low, Settle, Vol, OI, DTE)   │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │       DATA INTEGRITY & VALIDATION SUITE      │
                       │   (Boundary Checks, Missing Values, Checks)  │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │     UNIVERSAL GOLD BASIS (UGB) ENGINE        │
                       │   1g of 999.0 Pure Fine Gold Calibration     │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │         RELATIVE VALUE RADAR MATRIX          │
                       │   (6 Pairs, Rolling Z-Scores, Quantiles)     │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │        MULTI-FACTOR ATTRIBUTION ENGINE       │
                       │  • Price Divergence    • Expiry Carrying Cost│
                       │  • Liquidity Spread    • Historical Rarity   │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │       WALK-FORWARD REALITY CHECK HURDLE      │
                       │  Exchange Fees + Taxes + Bid-Ask Slippage    │
                       │    [ SURVIVES  |  WEAKENS  |  DISAPPEARS ]   │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          OFFICIAL EVIDENCE DOSSIER           │
                       │   Transparent Mathematical Proof & Report    │
                       └──────────────────────────────────────────────┘
```

---

## 📐 Mathematical Formulation

### 1. Universal Gold Basis (UGB)
To convert any raw contract settlement price $P_{\text{raw}}$ into the universal standard of **₹ per 1 gram of 999.0 Pure Fine Gold**:

$$\text{Price per Gram (Quoted)} = \frac{P_{\text{raw}}}{\text{Quotation Unit (Grams)}}$$

$$\text{Purity Adjustment Factor} = \frac{0.999}{\text{Delivery Purity}}$$

$$\text{UGB} = \left(\frac{P_{\text{raw}}}{\text{Quotation Unit}}\right) \times \left(\frac{0.999}{\text{Delivery Purity}}\right)$$

*Example for GOLDM ($P_{\text{raw}} = \text{₹}76,480$, Quotation $= 10\text{g}$, Purity $= 0.995$):*
$$\text{UGB}_{\text{GOLDM}} = \left(\frac{76480}{10}\right) \times \left(\frac{0.999}{0.995}\right) = 7648 \times 1.0040201 = \text{₹}7,678.73 / \text{gram}$$

---

### 2. Relative Spread & Rolling Z-Score
For contract pair $(A, B)$ on Universal Gold Basis:
$$\Delta_{A,B}(t) = \text{UGB}_A(t) - \text{UGB}_B(t)$$
$$\text{Spread } \% = \left(\frac{\Delta_{A,B}(t)}{\text{UGB}_B(t)}\right) \times 100\%$$
$$Z = \frac{\Delta_{A,B}(t) - \mu_{30d}}{\sigma_{30d}}$$

- **NORMAL**: $|Z| < 1.5\sigma$
- **WATCH**: $1.5\sigma \le |Z| < 2.0\sigma$
- **UNUSUAL**: $|Z| \ge 2.0\sigma$

---

### 3. Walk-Forward Reality Check (Friction Modeling)
$$\text{Gross Spread (bps)} = |\text{Spread } \%| \times 100$$
$$\text{Total Friction (bps)} = \text{TxCost}_{\text{Exchange}} + \text{Taxes}_{\text{GST+Stamp}} + \text{Slippage}_{\text{BidAsk}}$$
$$\text{Net Signal (bps)} = \text{Gross Spread} - \text{Total Friction}$$

- **SURVIVES**: $\text{Net Signal} > 15.0\text{ bps}$
- **WEAKENS**: $0.0\text{ bps} < \text{Net Signal} \le 15.0\text{ bps}$
- **DISAPPEARS**: $\text{Net Signal} \le 0.0\text{ bps}$

---

## 🚀 Key Application Features

1. **Cinematic Landing & "How GOLDINTEL Thinks" Pipeline** — Clear presentation of the 5-step explainable methodology.
2. **Contract DNA Matrix** — Deep structural specification matrices for GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL.
3. **Universal Gold Basis (UGB) Engine** — Transparent calculation sandbox with step-by-step mathematical proof.
4. **Relative Value Radar** — Interactive 4-node topological graph with animated edge pulses and Z-score heatmaps.
5. **Anomaly Explorer** — Filterable anomaly detection cards with multi-factor breakdown bars.
6. **Signature Feature: "Why Is This Contract Different?"** — Deep comparative laboratory breaking down any 2 contracts with computed attribution and no price predictions.
7. **Gold Market X-Ray** — 5-layer toggle visualizer: Price, Mechanics, Liquidity, Expiry, History.
8. **Expiry Gravity** — Orbit simulation showing days-to-expiry decay and basis roll.
9. **Liquidity Lens** — Volume vs Open Interest scatter, order book depth, and slippage estimation.
10. **Reality Check (Walk-Forward Validation)** — Tests whether detected signals survive real-world execution friction.
11. **Contract Lifecycle** — 5-phase timeline from exchange listing to final vault physical delivery.
12. **Anomaly Memory** — Searchable historical case file archive.
13. **What-If Lab** — Live interactive sliders for transaction costs, slippage, and Z-score thresholds with real-time recalculation.
14. **GOLDINTEL AI Analyst** — Deterministic financial intelligence assistant strictly grounded in computed exchange microstructure metrics.
15. **Data Provenance & Audit** — Complete SHA256 checksum lineage from raw Bhavcopy CSV to presentation.
16. **Judge Mode (2-Minute Tour)** — 8-step guided presentation tour with auto-advance and spotlight highlights.
17. **Official Evidence Dossier** — Printable and downloadable relationship investigation report.

---

## 💻 Tech Stack

- **Frontend**: Single-Page Application (HTML5, Tailwind CSS, JavaScript ES6+, Lucide Icons, Chart.js, HTML5 Canvas)
- **Modular Architecture**: Complete React & TypeScript interfaces in `/src`
- **Backend API**: Python FastAPI (`backend/main.py`), NumPy, SciPy, Pandas analytics core (`backend/analytics.py`), and Bhavcopy parser (`backend/bhavcopy_parser.py`)

---

## ⚡ How to Run

### Option 1: Instant Standalone (Zero-Install)
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).  
All interactive features, calculations, radar graphs, What-If sliders, and Judge Mode work immediately out of the box!

### Option 2: Run Python FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
Visit API Documentation: `http://localhost:8000/docs`

---

## 🏆 Hackathon Presentation & Judge Mode Guide

Click the **"JUDGE MODE (2-Min Tour)"** button in the top navigation bar to launch the guided 8-step hackathon presentation:

- **Step 1**: Select & Contrast Heterogeneous Indian Gold Futures
- **Step 2**: Universal Gold Basis (UGB) Purity & Unit Normalization
- **Step 3**: Relative Value Radar & Z-Score Anomaly Detection
- **Step 4**: Multi-Factor Attribution Engine (Price, Expiry, Liquidity, Rarity)
- **Step 5**: Expiry Gravity & Term Structure Analysis
- **Step 6**: Liquidity Lens & Execution Slippage
- **Step 7**: Walk-Forward Reality Check (Signal Survival)
- **Step 8**: Official Evidence Dossier & Audit Conclusion

---

## 📜 Ethical & Analytical Positioning
- **Zero Price Predictions**: Does not attempt to forecast where gold prices will move.
- **Zero Buy/Sell Recommendations**: Does not provide personalized investment advice or brokerage recommendations.
- **Explainable Microstructure**: Focuses exclusively on explaining why related commodity contracts trade at different relative prices.

---
*Created for HackHills National Hackathon — Explainable Commodity-Contract Intelligence.*
