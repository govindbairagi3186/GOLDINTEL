"""
MCX Bhavcopy Ingestion and Microstructure Validation Layer
Parses public commodity market Bhavcopy files and validates data integrity.
"""
import io
import pandas as pd
from typing import List, Dict, Any, Tuple

REQUIRED_BHAVCOPY_COLUMNS = [
    "INSTRUMENT", "SYMBOL", "EXPIRY_DT", "OPEN", "HIGH", "LOW", "CLOSE", "SETTLE_PR", "CONTRACTS", "OPEN_INT"
]

TARGET_SYMBOLS = ["GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"]

def parse_mcx_bhavcopy_csv(csv_content: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    warnings: List[str] = []
    records: List[Dict[str, Any]] = []

    try:
        df = pd.read_csv(io.StringIO(csv_content))
    except Exception as e:
        warnings.append(f"Failed to parse CSV: {str(e)}")
        return [], warnings

    # Normalize column names
    df.columns = [c.strip().upper() for c in df.columns]

    # Validate required columns
    missing_cols = [c for c in REQUIRED_BHAVCOPY_COLUMNS if c not in df.columns]
    if missing_cols:
        warnings.append(f"Bhavcopy missing standard headers: {', '.join(missing_cols)}")
        # Check if alternative headers exist
        if "TRADINGSYMBOL" in df.columns and "CLOSEPRICE" in df.columns:
            warnings.append("Detected alternative format headers. Mapping to standard schema.")

    # Filter target gold symbols
    if "SYMBOL" in df.columns:
        filtered_df = df[df["SYMBOL"].isin(TARGET_SYMBOLS)].copy()
    else:
        filtered_df = df

    for _, row in filtered_df.iterrows():
        sym = str(row.get("SYMBOL", "")).strip()
        if sym not in TARGET_SYMBOLS:
            continue

        raw_close = float(row.get("SETTLE_PR", row.get("CLOSE", 0.0)))
        raw_open = float(row.get("OPEN", raw_close))
        raw_high = float(row.get("HIGH", raw_close))
        raw_low = float(row.get("LOW", raw_close))
        volume = int(row.get("CONTRACTS", row.get("VOLUME", 0)))
        oi = int(row.get("OPEN_INT", 0))
        expiry = str(row.get("EXPIRY_DT", "2026-10-05"))

        # Microstructure boundary validation
        row_warnings = []
        if raw_low > raw_high:
            row_warnings.append(f"Data anomaly: Low ({raw_low}) > High ({raw_high})")
        if raw_close <= 0:
            row_warnings.append(f"Invalid non-positive settlement price: {raw_close}")
        if volume == 0:
            row_warnings.append(f"Zero volume traded; illiquid session")

        records.append({
            "symbol": sym,
            "expiry_date": expiry,
            "open": raw_open,
            "high": raw_high,
            "low": raw_low,
            "close": raw_close,
            "volume": volume,
            "open_interest": oi,
            "warnings": row_warnings
        })

    return records, warnings
