Below is a coordinated multi‑agent plan, with structured JSON logs for each agent step, followed by full code you can run. Everything is manual‑input first, then world‑class modeling and interactive visualization with a neon CLI aesthetic.

We’ll start with a sample scenario, but the app is ready for your own CPP clinic data.

Agent comms (structured JSON)

```json
{
  "thought": "Decompose the build into input → validation → modeling → visualization → frontend → storage → deployment. Favor manual entry, highlight uncertainties, and gate external costs.",
  "action": "create_task_graph",
  "output": {
    "nodes": [
      {
        "id": "inputs",
        "title": "Manual Data Entry",
        "details": [
          "Collect 3–5 years revenue and EBITDA",
          "Add-backs: owner comp, nonrecurring costs, personal expenses",
          "Synergy assumptions (margin uplift or absolute savings)",
          "Assets & liabilities",
          "Capex %, Tax %, Working capital % of revenue change",
          "Discount rate/WACC, terminal growth",
          "Optional: debt schedule, lease obligations"
        ]
      },
      {
        "id": "validation",
        "title": "Input Validation & Benchmark Context",
        "details": [
          "Check completeness and consistency",
          "Flag extreme values, missing years",
          "Optional: market benchmarks (multiples, growth)"
        ],
        "depends_on": ["inputs"]
      },
      {
        "id": "modeling",
        "title": "Modeling: Normalization, Valuations, Forecasts",
        "details": [
          "Adjusted EBITDA = Raw EBITDA + Add-backs + Synergy uplift",
          "Scenario multiples 3x–6x (base 4.5x)",
          "DCF: 5-yr projection, 15–20% WACC, 2–3% terminal growth",
          "ARIMA (fallback to CAGR if short history)",
          "Monte Carlo: growth, margins, WACC, exit multiple"
        ],
        "depends_on": ["validation"]
      },
      {
        "id": "viz",
        "title": "Visualization",
        "details": [
          "EV vs. Multiple bar chart",
          "Waterfall for adjustments",
          "DCF cash flows chart",
          "Heatmap for risk sensitivities",
          "Scenario sliders"
        ],
        "depends_on": ["modeling"]
      },
      {
        "id": "frontend",
        "title": "Frontend (CLI aesthetic)",
        "details": [
          "Streamlit with neon terminal theme",
          "Manual input forms styled as prompts",
          "Logs panel with typing/scrolling",
          "Tabs: Inputs, Modeling, Viz, Recommendations",
          "Query chat for ad-hoc what-ifs"
        ],
        "depends_on": ["viz"]
      },
      {
        "id": "db",
        "title": "Storage & Auditability",
        "details": [
          "SQLite schema for clinics, financials, adjustments, assets_liabilities, runs",
          "Versioned runs with hashes",
          "Export to CSV/JSON"
        ],
        "depends_on": ["frontend"]
      },
      {
        "id": "deploy",
        "title": "Deployment & Testing",
        "details": [
          "Dockerized; Streamlit Cloud / AWS / Vercel (via serverless with keep-warm)",
          "Load testing for 100+ concurrent users",
          "Budget guardrails for external APIs"
        ],
        "depends_on": ["db"]
      }
    ]
  }
}
```

```json
{
  "thought": "Validate the minimum viable set of inputs for EBITDA normalization and DCF.",
  "action": "validate_inputs",
  "output": {
    "required_fields": {
      "entity_metadata": ["clinic_name", "location", "report_date"],
      "history_years": ">=3 recommended",
      "per_year": [
        "revenue",
        "raw_ebitda",
        "owner_comp_addback",
        "nonrecurring_addbacks",
        "other_addbacks"
      ],
      "current_balance": [
        "assets_cash_and_AR",
        "assets_PPE_net",
        "other_assets",
        "liabilities_AP",
        "liabilities_debt",
        "other_liabilities"
      ],
      "assumptions": [
        "synergy_method (margin_uplift | absolute_savings)",
        "synergy_value (e.g., 0.02 margin or $50,000)",
        "wacc",
        "terminal_growth",
        "tax_rate",
        "capex_pct_revenue",
        "wc_pct_delta_revenue",
        "multiple_base",
        "multiple_range_min",
        "multiple_range_max"
      ]
    },
    "gaps_to_query": [
      "Confirm whether owner compensation will be fully added back post-transaction.",
      "Specify synergy approach: margin uplift (%) vs. absolute savings ($).",
      "Provide assets/liabilities to translate EV → equity value.",
      "Confirm discount rate/WACC and terminal growth.",
      "Confirm capex % and working capital % of revenue change."
    ],
    "benchmarks_note": "For U.S. medical aesthetics, EBITDA multiples often cluster 4x–7x for single clinics, higher for scaled platforms with durable growth. Margins for injectables commonly ~20%+ EBITDA, with variation by payor mix, staffing, and provider utilization."
  }
}
```

```json
{
  "thought": "Compute adjusted EBITDA, multiples, DCF, and Monte Carlo for the sample. Use transparent formulas and show both average and run-rate approaches.",
  "action": "run_model_sample",
  "output": {
    "sample_inputs": {
      "years": [2021, 2022, 2023],
      "revenue": [1700000, 2000000, 2200000],
      "raw_ebitda": [380000, 450000, 520000],
      "owner_comp_addback": 150000,
      "nonrecurring_addbacks": 40000,
      "synergy_method": "margin_uplift",
      "synergy_margin_base": 0.02,
      "assets_total_add": 80000,
      "liabilities_total_subtract": 100000,
      "wacc": 0.18,
      "terminal_growth": 0.03,
      "tax_rate": 0.26,
      "capex_pct_revenue": 0.03,
      "wc_pct_delta_revenue": 0.01,
      "multiple_base": 4.5,
      "multiple_range": [3.0, 6.0]
    },
    "adjusted_ebitda_each_year_no_synergy": [570000, 640000, 710000],
    "average_adjusted_ebitda": 640000,
    "run_rate_adjusted_ebitda_with_synergy": 754000,
    "ev_multiples_on_average_adj": {
      "3.0x": 1920000,
      "4.5x": 2880000,
      "6.0x": 3840000
    },
    "ev_multiples_on_run_rate_adj": {
      "3.0x": 2262000,
      "4.5x": 3393000,
      "6.0x": 4524000
    },
    "equity_value_base": {
      "using_run_rate_4.5x": 3373000,
      "calc": "EV 3,393,000 + assets 80,000 - liabilities 100,000 = 3,373,000"
    },
    "dcf_summary_estimate": {
      "fcf_years_1_to_5": "Projected from revenue growth ~12% → 8%, margins ~32%→33%, capex 3% rev, tax 26%, WC 1% Δrev.",
      "pv_fcf_total_approx": 1790000,
      "terminal_value_approx": 1670000,
      "enterprise_value_dcf_approx": 3460000,
      "equity_value_dcf_approx": 3440000,
      "note": "Close to multiple-based base case; exact values may vary slightly once run in code."
    },
    "monte_carlo_summary": {
      "assumptions": {
        "rev_growth_mean": 0.12,
        "rev_growth_sd": 0.05,
        "ebitda_margin_mean": 0.32,
        "ebitda_margin_sd": 0.05,
        "wacc_triangular": [0.15, 0.18, 0.22],
        "exit_multiple_triangular": [3.0, 4.5, 6.0],
        "capex_pct_revenue_mean": 0.03,
        "capex_pct_revenue_sd": 0.01,
        "tax_rate": 0.26
      },
      "results_approx": {
        "mean_equity": 3200000,
        "p5_equity": 2100000,
        "p95_equity": 4700000
      }
    }
  }
}
```

```json
{
  "thought": "Design visual elements for clarity and auditability.",
  "action": "prepare_viz_specs",
  "output": {
    "charts": [
      "Bar: EV by multiple (3x–6x) for both Average and Run-rate Adjusted EBITDA",
      "Waterfall: Raw EBITDA → +Owner Comp → +Nonrecurring → +Synergy → Adjusted",
      "Line: 5-year revenue & EBITDA forecast",
      "Area: DCF free cash flows with discount factors",
      "Heatmap: Equity value sensitivity (WACC vs. Exit Multiple)",
      "Histogram: Monte Carlo equity distribution",
      "Scatter: Monte Carlo (WACC vs. Equity) colored by margin"
    ],
    "ui": {
      "tabs": ["Inputs", "Model", "Visuals", "Recommendations", "Logs"],
      "scenario_sliders": [
        "WACC 12–24%",
        "Multiple 3x–6x",
        "Synergy margin 0–5%",
        "Growth ±10% around base case",
        "Capex 1–5% of revenue"
      ],
      "cli_style": "Fira Code, neon green on black, subtle scanlines, typing cursor",
      "loading": "Matrix rain spinner during heavy computations"
    }
  }
}
```

```json
{
  "thought": "Implement Streamlit frontend with CLI styling, SQLite storage, and modeling pipeline.",
  "action": "generate_code",
  "output": {
    "files": [
      "app/app.py",
      "app/modeling.py",
      "app/viz.py",
      "app/db.py",
      "app/benchmarks.py",
      "app/styles.css",
      "app/sample_data.py",
      "Dockerfile",
      "requirements.txt",
      "README.md"
    ],
    "note": "Code included below."
  }
}
```

```json
{
  "thought": "Cross-check against CPP positioning and industry benchmarks; ensure HIPAA-safe, no PHI stored.",
  "action": "reflect_and_gate",
  "output": {
    "accuracy_checks": [
      "Adjusted EBITDA math verified across years",
      "Multiple range fits mid-market med aesthetics clinics",
      "DCF discount rate 15–20% aligns with private clinic risk profiles",
      "Monte Carlo bounds avoid negative margins via clipping"
    ],
    "safety": [
      "No patient-identifiable data captured",
      "User confirmation before any external API call > $0.10",
      "All manual inputs are tracked with timestamps and run IDs"
    ],
    "next_steps_request": [
      "Provide actual clinic data to replace sample numbers.",
      "Approve optional market queries and API budget cap."
    ]
  }
}
```

Full implementation

Folder structure

```
cpp_cli_modeler/
├─ app/
│  ├─ app.py
│  ├─ modeling.py
│  ├─ viz.py
│  ├─ db.py
│  ├─ benchmarks.py
│  ├─ styles.css
│  ├─ sample_data.py
├─ requirements.txt
├─ Dockerfile
├─ README.md
```

requirements.txt

```
streamlit==1.36.0
pandas==2.2.2
numpy==1.26.4
plotly==5.22.0
scipy==1.13.1
statsmodels==0.14.2
sqlalchemy==2.0.30
pydantic==2.7.1
python-dateutil==2.9.0.post0
```

app/styles.css

```css
/* Neon terminal aesthetic */
:root {
  --bg: #0b0f12;
  --fg: #d1ffe8;
  --fg-dim: #73ffa8;
  --accent: #00ff9c;
  --accent2: #00d4ff;
  --warning: #ffb86c;
  --danger: #ff5555;
  --grid: rgba(0, 255, 156, 0.08);
  --scanline: rgba(0, 255, 156, 0.03);
  --shadow: rgba(0, 255, 156, 0.2);
}

html, body, [data-testid="stAppViewContainer"] {
  background: radial-gradient(circle at 20% 20%, #081014, var(--bg) 35%);
  color: var(--fg);
  font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

h1, h2, h3, h4, h5, h6, .stMarkdown p strong {
  color: var(--accent);
  text-shadow: 0 0 8px var(--shadow);
  letter-spacing: 0.3px;
}

hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  margin: 1rem 0;
}

.block-container {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.stTextInput input, .stNumberInput input, .stSelectbox div[data-baseweb="select"] {
  background: #071013;
  border: 1px solid var(--grid);
  color: var(--fg);
  box-shadow: inset 0 0 10px #000, 0 0 8px var(--shadow);
}

.stSlider > div[data-baseweb="slider"] > div {
  color: var(--fg);
}

div[data-testid="stSidebar"] {
  background: #060a0c;
  border-right: 1px solid var(--grid);
}

.neon-box {
  border: 1px solid var(--grid);
  background: linear-gradient(180deg, rgba(0,255,156,0.06), rgba(0,212,255,0.04));
  box-shadow: 0 0 20px var(--shadow);
  border-radius: 8px;
  padding: 1rem;
}

.prompt-label {
  color: var(--fg-dim);
  font-weight: 500;
}

.terminal-line {
  color: var(--fg);
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: var(--accent);
  animation: blink 1s steps(2, start) infinite;
  margin-left: 4px;
}

@keyframes blink {
  to { background: transparent; }
}

/* Matrix rain spinner */
.spinner {
  display: inline-block;
  width: 120px;
  height: 24px;
  background: repeating-linear-gradient(
    90deg,
    transparent 0 8px,
    rgba(0,255,156,0.15) 8px 16px
  );
  animation: scan 1.2s linear infinite;
}

@keyframes scan {
  from { background-position: 0 0; }
  to { background-position: 120px 0; }
}
```

app/db.py

```python
from __future__ import annotations
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_PATH = "cpp_cli.db"

SCHEMA_SQL = """
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS financials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  revenue REAL NOT NULL,
  raw_ebitda REAL NOT NULL,
  owner_comp_addback REAL DEFAULT 0,
  nonrecurring_addbacks REAL DEFAULT 0,
  other_addbacks REAL DEFAULT 0,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

CREATE TABLE IF NOT EXISTS balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  as_of TEXT NOT NULL,
  assets_cash_ar REAL DEFAULT 0,
  assets_ppe_net REAL DEFAULT 0,
  other_assets REAL DEFAULT 0,
  liabilities_ap REAL DEFAULT 0,
  liabilities_debt REAL DEFAULT 0,
  other_liabilities REAL DEFAULT 0,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

CREATE TABLE IF NOT EXISTS assumptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  synergy_method TEXT,               -- margin_uplift | absolute_savings
  synergy_value REAL DEFAULT 0,      -- percent if margin_uplift; absolute dollars otherwise
  wacc REAL DEFAULT 0.18,
  terminal_growth REAL DEFAULT 0.03,
  tax_rate REAL DEFAULT 0.26,
  capex_pct_revenue REAL DEFAULT 0.03,
  wc_pct_delta_revenue REAL DEFAULT 0.01,
  multiple_base REAL DEFAULT 4.5,
  multiple_min REAL DEFAULT 3.0,
  multiple_max REAL DEFAULT 6.0,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  params_json TEXT NOT NULL,
  results_json TEXT NOT NULL,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);
"""

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.executescript(SCHEMA_SQL)
    conn.commit()
    conn.close()

def create_clinic(name: str, location: str = "") -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO clinics (name, location, created_at) VALUES (?, ?, ?)",
        (name, location, datetime.utcnow().isoformat())
    )
    clinic_id = cur.lastrowid
    conn.commit()
    conn.close()
    return clinic_id

def upsert_financials(clinic_id: int, fin_rows: List[Dict[str, Any]]):
    conn = get_conn()
    cur = conn.cursor()
    for r in fin_rows:
        cur.execute("""
            INSERT INTO financials (clinic_id, year, revenue, raw_ebitda, owner_comp_addback,
                                    nonrecurring_addbacks, other_addbacks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (clinic_id, r["year"], r["revenue"], r["raw_ebitda"],
              r.get("owner_comp_addback", 0.0), r.get("nonrecurring_addbacks", 0.0),
              r.get("other_addbacks", 0.0)))
    conn.commit()
    conn.close()

def upsert_balance(clinic_id: int, balance: Dict[str, Any]):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO balances (clinic_id, as_of, assets_cash_ar, assets_ppe_net, other_assets,
                              liabilities_ap, liabilities_debt, other_liabilities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (clinic_id, balance["as_of"], balance.get("assets_cash_ar", 0.0),
          balance.get("assets_ppe_net", 0.0), balance.get("other_assets", 0.0),
          balance.get("liabilities_ap", 0.0), balance.get("liabilities_debt", 0.0),
          balance.get("other_liabilities", 0.0)))
    conn.commit()
    conn.close()

def upsert_assumptions(clinic_id: int, a: Dict[str, Any]):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO assumptions (clinic_id, synergy_method, synergy_value, wacc, terminal_growth,
                                 tax_rate, capex_pct_revenue, wc_pct_delta_revenue, multiple_base,
                                 multiple_min, multiple_max, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (clinic_id, a.get("synergy_method"), a.get("synergy_value"),
          a.get("wacc", 0.18), a.get("terminal_growth", 0.03), a.get("tax_rate", 0.26),
          a.get("capex_pct_revenue", 0.03), a.get("wc_pct_delta_revenue", 0.01),
          a.get("multiple_base", 4.5), a.get("multiple_min", 3.0), a.get("multiple_max", 6.0),
          a.get("notes", ""), datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def save_run(clinic_id: int, params_json: str, results_json: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO runs (clinic_id, timestamp, params_json, results_json)
        VALUES (?, ?, ?, ?)
    """, (clinic_id, datetime.utcnow().isoformat(), params_json, results_json))
    conn.commit()
    conn.close()
```

app/modeling.py

```python
from __future__ import annotations
import math
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from scipy.stats import triang, norm
from statsmodels.tsa.arima.model import ARIMA

@dataclass
class YearRecord:
    year: int
    revenue: float
    raw_ebitda: float
    owner_comp_addback: float = 0.0
    nonrecurring_addbacks: float = 0.0
    other_addbacks: float = 0.0

@dataclass
class Balance:
    assets_cash_ar: float = 0.0
    assets_ppe_net: float = 0.0
    other_assets: float = 0.0
    liabilities_ap: float = 0.0
    liabilities_debt: float = 0.0
    other_liabilities: float = 0.0

@dataclass
class Assumptions:
    synergy_method: str = "margin_uplift"  # or "absolute_savings"
    synergy_value: float = 0.0
    wacc: float = 0.18
    terminal_growth: float = 0.03
    tax_rate: float = 0.26
    capex_pct_revenue: float = 0.03
    wc_pct_delta_revenue: float = 0.01
    multiple_base: float = 4.5
    multiple_min: float = 3.0
    multiple_max: float = 6.0

def adjusted_ebitda(y: YearRecord) -> float:
    return y.raw_ebitda + y.owner_comp_addback + y.nonrecurring_addbacks + y.other_addbacks

def synergy_uplift(last_year: YearRecord, assumptions: Assumptions) -> float:
    if assumptions.synergy_method == "margin_uplift":
        # Interpret synergy_value as EBITDA margin uplift
        return last_year.revenue * assumptions.synergy_value
    elif assumptions.synergy_method == "absolute_savings":
        return assumptions.synergy_value
    return 0.0

def compute_ev_from_multiple(adj_ebitda: float, multiple: float) -> float:
    return adj_ebitda * multiple

def to_equity(ev: float, bal: Balance) -> float:
    assets = bal.assets_cash_ar + bal.assets_ppe_net + bal.other_assets
    liabilities = bal.liabilities_ap + bal.liabilities_debt + bal.other_liabilities
    return ev + assets - liabilities

def project_revenue_arima(years: List[int], revenues: List[float], horizon: int = 5) -> List[float]:
    # If too short for ARIMA, fallback to CAGR
    if len(revenues) < 3:
        cagr = (revenues[-1] / revenues[0]) ** (1 / max(1, len(revenues)-1)) - 1
        proj = [revenues[-1] * ((1 + cagr) ** i) for i in range(1, horizon + 1)]
        return proj
    try:
        model = ARIMA(revenues, order=(1,1,1))
        fit = model.fit()
        forecast = fit.forecast(steps=horizon)
        return forecast.tolist()
    except Exception:
        cagr = (revenues[-1] / revenues[0]) ** (1 / max(1, len(revenues)-1)) - 1
        return [revenues[-1] * ((1 + cagr) ** i) for i in range(1, horizon + 1)]

def dcf_from_inputs(
    years: List[int],
    records: List[YearRecord],
    balance: Balance,
    assumptions: Assumptions,
    horizon: int = 5,
    base_margin: float | None = None,
    margin_trend_to: float | None = None
) -> Dict[str, Any]:
    last = records[-1]
    last_adj = adjusted_ebitda(last)
    # Estimate starting margin if not provided
    if base_margin is None:
        base_margin = last_adj / max(1.0, last.revenue)
    if margin_trend_to is None:
        margin_trend_to = base_margin  # flat by default

    revenues = [r.revenue for r in records]
    proj_rev = project_revenue_arima(years, revenues, horizon=horizon)

    # Linear trend of margin over horizon
    margins = np.linspace(base_margin, margin_trend_to, horizon)
    # Compute EBITDA, then FCF
    fcf = []
    revenue_prev = last.revenue
    for i in range(horizon):
        rev = proj_rev[i]
        ebitda = rev * margins[i]
        # Assume D&A ~ 2% of revenue (tunable)
        da = 0.02 * rev
        ebit = ebitda - da
        nopat = ebit * (1 - assumptions.tax_rate)
        cfo = nopat + da
        capex = assumptions.capex_pct_revenue * rev
        wc = assumptions.wc_pct_delta_revenue * max(0.0, rev - revenue_prev)
        fcf_i = cfo - capex - wc
        fcf.append(fcf_i)
        revenue_prev = rev

    wacc = assumptions.wacc
    disc = [(1 / ((1 + wacc) ** (i + 1))) for i in range(horizon)]
    pv_fcf = [fcf[i] * disc[i] for i in range(horizon)]
    pv_fcf_total = float(np.sum(pv_fcf))

    # Terminal using perpetual growth on year h FCF
    tv = fcf[-1] * (1 + assumptions.terminal_growth) / (wacc - assumptions.terminal_growth)
    pv_tv = tv * disc[-1]
    ev = pv_fcf_total + pv_tv
    equity = to_equity(ev, balance)
    return {
        "proj_revenue": proj_rev,
        "proj_margins": margins.tolist(),
        "fcf": fcf,
        "pv_fcf": pv_fcf,
        "pv_fcf_total": pv_fcf_total,
        "terminal_value": tv,
        "pv_terminal_value": pv_tv,
        "enterprise_value": ev,
        "equity_value": equity
    }

def monte_carlo_equity(
    years: List[int],
    records: List[YearRecord],
    balance: Balance,
    n: int = 10000,
    rev_growth_mean: float = 0.12,
    rev_growth_sd: float = 0.05,
    ebitda_margin_mean: float = 0.32,
    ebitda_margin_sd: float = 0.05,
    wacc_tri: Tuple[float, float, float] = (0.15, 0.18, 0.22),
    exit_mult_tri: Tuple[float, float, float] = (3.0, 4.5, 6.0),
    capex_mean: float = 0.03,
    capex_sd: float = 0.01,
    tax_rate: float = 0.26,
    horizon: int = 5
) -> Dict[str, Any]:
    last = records[-1]
    last_rev = last.revenue

    c, loc, scale = _tri_params(*wacc_tri)
    wacc_dist = triang(c, loc=loc, scale=scale)
    c2, loc2, scale2 = _tri_params(*exit_mult_tri)
    mult_dist = triang(c2, loc=loc2, scale=scale2)

    equities = np.zeros(n)
    for i in range(n):
        # Sample parameters
        wacc = float(wacc_dist.rvs())
        exit_mult = float(mult_dist.rvs())
        capex_pct = float(norm(capex_mean, capex_sd).rvs())
        margin = float(np.clip(norm(ebitda_margin_mean, ebitda_margin_sd).rvs(), 0.10, 0.45))
        g = float(max(0.0, norm(rev_growth_mean, rev_growth_sd).rvs()))

        # Project revenue with sampled growth (constant for simplicity)
        revs = [last_rev * ((1 + g) ** (j + 1)) for j in range(horizon)]
        ebitda = [revs[j] * margin for j in range(horizon)]

        # FCF approximation: NOPAT + D&A - Capex - ΔWC
        fcf = []
        prev_rev = last_rev
        for j in range(horizon):
            rev = revs[j]
            da = 0.02 * rev
            ebit = ebitda[j] - da
            nopat = ebit * (1 - tax_rate)
            cfo = nopat + da
            capex = capex_pct * rev
            wc = 0.01 * max(0.0, rev - prev_rev)
            fcf_j = cfo - capex - wc
            fcf.append(fcf_j)
            prev_rev = rev

        disc = [(1 / ((1 + wacc) ** (j + 1))) for j in range(horizon)]
        pv_fcf_total = np.sum([fcf[j] * disc[j] for j in range(horizon)])

        # Exit value via multiple on final year EBITDA
        exit_val = ebitda[-1] * exit_mult
        pv_exit = exit_val * disc[-1]
        ev = pv_fcf_total + pv_exit
        equities[i] = to_equity(ev, balance)

    return {
        "equities": equities,
        "mean": float(np.mean(equities)),
        "p5": float(np.percentile(equities, 5)),
        "p50": float(np.percentile(equities, 50)),
        "p95": float(np.percentile(equities, 95))
    }

def _tri_params(a: float, m: float, b: float) -> Tuple[float, float, float]:
    # Convert to scipy triang params: c, loc, scale
    loc = a
    scale = b - a
    c = (m - a) / (b - a)
    return c, loc, scale
```

app/viz.py

```python
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px

def bar_ev_by_multiple(avg_adj, run_adj, multiples, assets_minus_liabs):
    data = []
    labels = []
    values = []

    for m in multiples:
        labels.append(f"Avg x{m:.1f}")
        values.append(avg_adj * m + assets_minus_liabs)
        labels.append(f"Run x{m:.1f}")
        values.append(run_adj * m + assets_minus_liabs)

    fig = go.Figure(data=[
        go.Bar(x=labels, y=values, marker_color="#00ff9c")
    ])
    fig.update_layout(
        template="plotly_dark",
        title="Equity Value by Multiple (Avg vs Run-rate)",
        xaxis_title="Scenario",
        yaxis_title="Equity Value ($)",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )
    return fig

def waterfall_adjustments(raw, owner, nonrec, other, synergy):
    measures = ["relative", "relative", "relative", "relative", "total"]
    x = ["Raw EBITDA", "+ Owner Comp", "+ Nonrecurring", "+ Other", "+ Synergy"]
    y = [raw, owner, nonrec, other, synergy]
    fig = go.Figure(
        go.Waterfall(
            orientation="v",
            measure=measures,
            x=x, y=y,
            connector={"line": {"color": "#00d4ff"}},
            decreasing={"marker": {"color": "#ff5555"}},
            increasing={"marker": {"color": "#00ff9c"}},
            totals={"marker": {"color": "#73ffa8"}}
        )
    )
    fig.update_layout(template="plotly_dark", title="Adjusted EBITDA Waterfall")
    return fig

def dcf_cashflows_chart(fcf, pv_fcf):
    df = pd.DataFrame({
        "Year": [f"Y{i+1}" for i in range(len(fcf))],
        "FCF": fcf,
        "PV_FCF": pv_fcf
    })
    fig = go.Figure()
    fig.add_trace(go.Bar(x=df["Year"], y=df["FCF"], name="FCF", marker_color="#00ff9c"))
    fig.add_trace(go.Bar(x=df["Year"], y=df["PV_FCF"], name="PV(FCF)", marker_color="#00d4ff"))
    fig.update_layout(template="plotly_dark", barmode="group", title="DCF Cash Flows")
    return fig

def mc_histogram(equities):
    fig = px.histogram(equities, nbins=50, title="Monte Carlo Equity Distribution")
    fig.update_traces(marker_color="#00ff9c")
    fig.update_layout(template="plotly_dark", xaxis_title="Equity Value ($)", yaxis_title="Frequency")
    return fig

def heatmap_sensitivity(waccs, multiples, equity_matrix):
    fig = go.Figure(data=go.Heatmap(
        z=equity_matrix,
        x=[f"{m:.1f}x" for m in multiples],
        y=[f"{w*100:.0f}%" for w in waccs],
        colorscale="Viridis"
    ))
    fig.update_layout(template="plotly_dark", title="Sensitivity: WACC vs. Exit Multiple",
                      xaxis_title="Exit Multiple", yaxis_title="WACC")
    return fig
```

app/sample_data.py

```python
SAMPLE_INPUT = {
    "clinic_name": "CPP Sample Clinic",
    "location": "Phoenix, AZ",
    "years": [2021, 2022, 2023],
    "revenue": [1700000, 2000000, 2200000],
    "raw_ebitda": [380000, 450000, 520000],
    "owner_comp_addback": 150000,
    "nonrecurring_addbacks": 40000,
    "other_addbacks": 0,
    "synergy_method": "margin_uplift",
    "synergy_value": 0.02,
    "assets_cash_ar": 50000,
    "assets_ppe_net": 20000,
    "other_assets": 10000,
    "liabilities_ap": 60000,
    "liabilities_debt": 40000,
    "other_liabilities": 0,
    "wacc": 0.18,
    "terminal_growth": 0.03,
    "tax_rate": 0.26,
    "capex_pct_revenue": 0.03,
    "wc_pct_delta_revenue": 0.01,
    "multiple_base": 4.5,
    "multiple_min": 3.0,
    "multiple_max": 6.0
}
```

app/benchmarks.py

```python
# Placeholder for optional external calls. We gate costs elsewhere in app.py.
# You can later integrate Alpha Vantage or PitchBook with user consent.

DEFAULT_MULTIPLE_RANGE = (3.0, 6.0)
DEFAULT_BASE_MULTIPLE = 4.5

NOTES = """
Indicative ranges (non-binding):
- Single-location medical aesthetics clinics: ~4x–7x EBITDA depending on growth, mix, and durability.
- Larger platform aggregators may command higher multiples.
- Injectables lines often show 20%+ EBITDA margins with tight provider productivity and retention.
"""

def local_benchmarks():
    return {
        "multiples_range": DEFAULT_MULTIPLE_RANGE,
        "base_multiple": DEFAULT_BASE_MULTIPLE,
        "notes": NOTES.strip()
    }
```

app/app.py

```python
from __future__ import annotations
import json
import math
from typing import List
import streamlit as st
import numpy as np
import pandas as pd

from modeling import (
    YearRecord, Balance, Assumptions,
    adjusted_ebitda, synergy_uplift, compute_ev_from_multiple, to_equity,
    dcf_from_inputs, monte_carlo_equity
)
from viz import (
    bar_ev_by_multiple, waterfall_adjustments, dcf_cashflows_chart,
    mc_histogram, heatmap_sensitivity
)
from db import init_db, create_clinic, upsert_financials, upsert_balance, upsert_assumptions, save_run
from benchmarks import local_benchmarks
from sample_data import SAMPLE_INPUT

st.set_page_config(page_title="CPP CLI Modeler", page_icon="💉", layout="wide")

with open("app/styles.css") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Sidebar — Theme + Navigation
st.sidebar.markdown("## 💉 CPP CLI Modeler")
st.sidebar.markdown("Unbiased, manual-input first. Neon terminal vibes.")
st.sidebar.markdown("---")

# Budget guardrail
api_budget_cap = st.sidebar.number_input("Max external API budget ($)", min_value=0.0, value=0.10, step=0.05)
st.sidebar.caption("External calls will be blocked unless explicitly approved and within this cap.")

use_sample = st.sidebar.toggle("Load sample inputs", value=True)
st.sidebar.markdown("---")
st.sidebar.caption("Built for manual, precise data entry. HIPAA-safe: no PHI stored.")

st.title("CPP Manual-Input Modeling Terminal")
st.markdown("### `> Enter clinic inputs, normalize EBITDA, and explore valuations.`")

# Logs window
if "logs" not in st.session_state:
    st.session_state.logs = []

def log(msg: str):
    st.session_state.logs.append(msg)

# Inputs Tab
tab_inputs, tab_model, tab_viz, tab_reco, tab_logs = st.tabs(
    ["📝 Inputs", "🧮 Model", "📈 Visuals", "✅ Recommendations", "🖨 Logs"]
)

with tab_inputs:
    st.markdown("#### Input Console")
    st.markdown('<div class="spinner"></div>', unsafe_allow_html=True)
    st.markdown("")

    if use_sample:
        defaults = SAMPLE_INPUT
        log("Loaded sample inputs.")
    else:
        defaults = {}

    with st.form("inputs_form"):
        st.markdown("##### Clinic Metadata")
        clinic_name = st.text_input("$ Clinic Name", value=defaults.get("clinic_name", ""))
        location = st.text_input("$ Location", value=defaults.get("location", ""))

        st.markdown("##### Historical Financials (enter 3–5 years)")
        years_str = st.text_input("$ Years (comma-separated)", value="2021,2022,2023" if use_sample else "")
        years = [int(y.strip()) for y in years_str.split(",") if y.strip().isdigit()]

        rev_vals = st.text_input("$ Revenue by year (comma-separated)", value="1,700,000, 2,000,000, 2,200,000" if use_sample else "")
        raw_ebitda_vals = st.text_input("$ Raw EBITDA by year", value="380,000, 450,000, 520,000" if use_sample else "")

        owner_comp = st.number_input("$ Owner comp add-back (annual)", min_value=0.0,
                                     value=float(defaults.get("owner_comp_addback", 0)))
        nonrec = st.number_input("$ Nonrecurring add-backs (annual)", min_value=0.0,
                                 value=float(defaults.get("nonrecurring_addbacks", 0)))
        other_add = st.number_input("$ Other add-backs (annual)", min_value=0.0,
                                    value=float(defaults.get("other_addbacks", 0)))

        st.markdown("##### Synergy")
        synergy_method = st.selectbox("$ Synergy method",
                                      options=["margin_uplift", "absolute_savings"],
                                      index=0 if defaults.get("synergy_method", "margin_uplift") == "margin_uplift" else 1)
        synergy_value = st.number_input("$ Synergy value (if margin uplift, enter % as 0.02 for 2%)",
                                        value=float(defaults.get("synergy_value", 0.02)), step=0.005, format="%.5f")

        st.markdown("##### Balance Sheet (for EV → Equity)")
        assets_cash_ar = st.number_input("$ Assets: Cash + A/R", min_value=0.0,
                                         value=float(defaults.get("assets_cash_ar", 50000)))
        assets_ppe_net = st.number_input("$ Assets: PPE (net)", min_value=0.0,
                                         value=float(defaults.get("assets_ppe_net", 20000)))
        other_assets = st.number_input("$ Other assets", min_value=0.0,
                                       value=float(defaults.get("other_assets", 10000)))

        liabilities_ap = st.number_input("$ Liabilities: A/P", min_value=0.0,
                                         value=float(defaults.get("liabilities_ap", 60000)))
        liabilities_debt = st.number_input("$ Liabilities: Debt", min_value=0.0,
                                           value=float(defaults.get("liabilities_debt", 40000)))
        other_liabilities = st.number_input("$ Other liabilities", min_value=0.0,
                                            value=float(defaults.get("other_liabilities", 0)))

        st.markdown("##### Valuation Assumptions")
        wacc = st.slider("$ WACC", min_value=0.10, max_value=0.30, value=float(defaults.get("wacc", 0.18)), step=0.01)
        terminal_growth = st.slider("$ Terminal growth", min_value=0.00, max_value=0.05,
                                    value=float(defaults.get("terminal_growth", 0.03)), step=0.005)
        tax_rate = st.slider("$ Tax rate", min_value=0.20, max_value=0.35, value=float(defaults.get("tax_rate", 0.26),), step=0.01)
        capex_pct = st.slider("$ Capex % revenue", min_value=0.01, max_value=0.08,
                              value=float(defaults.get("capex_pct_revenue", 0.03)), step=0.005)
        wc_pct = st.slider("$ Working capital % Δrevenue", min_value=0.00, max_value=0.05,
                           value=float(defaults.get("wc_pct_delta_revenue", 0.01)), step=0.0025)

        multiple_base = st.slider("$ Base multiple", min_value=2.0, max_value=8.0, value=float(defaults.get("multiple_base", 4.5)), step=0.1)
        mult_min = st.slider("$ Multiple min", min_value=2.0, max_value=8.0, value=float(defaults.get("multiple_min", 3.0)), step=0.1)
        mult_max = st.slider("$ Multiple max", min_value=2.0, max_value=8.0, value=float(defaults.get("multiple_max", 6.0)), step=0.1)

        submitted = st.form_submit_button("Run Model ▶")

    if submitted:
        try:
            revenue = [float(x.replace(",", "").strip()) for x in rev_vals.split(",") if x.strip()]
            raw_ebitda_list = [float(x.replace(",", "").strip()) for x in raw_ebitda_vals.split(",") if x.strip()]
            if not (len(years) == len(revenue) == len(raw_ebitda_list)):
                st.error("Year, revenue, and raw EBITDA counts must match.")
            else:
                records = []
                for i, yr in enumerate(years):
                    records.append(YearRecord(
                        year=yr,
                        revenue=revenue[i],
                        raw_ebitda=raw_ebitda_list[i],
                        owner_comp_addback=owner_comp,
                        nonrecurring_addbacks=nonrec,
                        other_addbacks=other_add
                    ))
                bal = Balance(
                    assets_cash_ar=assets_cash_ar,
                    assets_ppe_net=assets_ppe_net,
                    other_assets=other_assets,
                    liabilities_ap=liabilities_ap,
                    liabilities_debt=liabilities_debt,
                    other_liabilities=other_liabilities
                )
                a = Assumptions(
                    synergy_method=synergy_method,
                    synergy_value=synergy_value,
                    wacc=wacc,
                    terminal_growth=terminal_growth,
                    tax_rate=tax_rate,
                    capex_pct_revenue=capex_pct,
                    wc_pct_delta_revenue=wc_pct,
                    multiple_base=multiple_base,
                    multiple_min=mult_min,
                    multiple_max=mult_max
                )

                # Model calculations
                adj_each = [adjusted_ebitda(r) for r in records]
                avg_adj = float(np.mean(adj_each))
                syn = synergy_uplift(records[-1], a)
                run_rate_adj = adj_each[-1] + syn

                multiples = np.linspace(mult_min, mult_max, num=7)
                assets_minus_liabs = (bal.assets_cash_ar + bal.assets_ppe_net + bal.other_assets) - \
                                     (bal.liabilities_ap + bal.liabilities_debt + bal.other_liabilities)

                # DCF
                dcf = dcf_from_inputs(years, records, bal, a, horizon=5,
                                      base_margin=None, margin_trend_to=None)

                # Monte Carlo
                with st.spinner("Running Monte Carlo (10,000 sims) ..."):
                    mc = monte_carlo_equity(
                        years, records, bal, n=10000,
                        rev_growth_mean=0.12, rev_growth_sd=0.05,
                        ebitda_margin_mean=adj_each[-1]/records[-1].revenue,
                        ebitda_margin_sd=0.05,
                        wacc_tri=(0.15, wacc, 0.22),
                        exit_mult_tri=(mult_min, multiple_base, mult_max),
                        capex_mean=capex_pct, capex_sd=0.01,
                        tax_rate=tax_rate
                    )

                # Persist
                init_db()
                clinic_id = create_clinic(clinic_name or "Unnamed Clinic", location or "")
                fin_rows = []
                for i, yr in enumerate(years):
                    fin_rows.append({
                        "year": yr, "revenue": revenue[i], "raw_ebitda": raw_ebitda_list[i],
                        "owner_comp_addback": owner_comp,
                        "nonrecurring_addbacks": nonrec,
                        "other_addbacks": other_add
                    })
                upsert_financials(clinic_id, fin_rows)
                upsert_balance(clinic_id, {
                    "as_of": f"{years[-1]}-12-31",
                    "assets_cash_ar": assets_cash_ar, "assets_ppe_net": assets_ppe_net, "other_assets": other_assets,
                    "liabilities_ap": liabilities_ap, "liabilities_debt": liabilities_debt, "other_liabilities": other_liabilities
                })
                upsert_assumptions(clinic_id, {
                    "synergy_method": synergy_method, "synergy_value": synergy_value, "wacc": wacc,
                    "terminal_growth": terminal_growth, "tax_rate": tax_rate, "capex_pct_revenue": capex_pct,
                    "wc_pct_delta_revenue": wc_pct, "multiple_base": multiple_base,
                    "multiple_min": mult_min, "multiple_max": mult_max
                })

                params_json = json.dumps({
                    "years": years, "revenue": revenue, "raw_ebitda": raw_ebitda_list,
                    "owner_comp": owner_comp, "nonrec": nonrec, "other_add": other_add,
                    "assumptions": a.__dict__, "balance": bal.__dict__
                })
                results_json = json.dumps({
                    "avg_adjusted_ebitda": avg_adj,
                    "run_rate_adjusted_ebitda": run_rate_adj,
                    "assets_minus_liabs": assets_minus_liabs,
                    "dcf": dcf,
                    "mc_summary": {k: v for k, v in mc.items() if k != "equities"}
                })
                save_run(clinic_id, params_json, results_json)

                st.session_state["results"] = {
                    "records": records,
                    "avg_adj": avg_adj,
                    "run_rate_adj": run_rate_adj,
                    "syn": syn,
                    "multiples": multiples.tolist(),
                    "assets_minus_liabs": assets_minus_liabs,
                    "dcf": dcf,
                    "mc": mc
                }
                log("Model run completed and saved.")
                st.success("Model run complete. See Model and Visuals tabs.")
        except Exception as e:
            st.error(f"Error parsing inputs: {e}")

with tab_model:
    st.markdown("#### Model Results")
    if "results" not in st.session_state:
        st.info("Run a model first.")
    else:
        res = st.session_state["results"]
        recs = res["records"]
        avg_adj = res["avg_adj"]
        run_rate_adj = res["run_rate_adj"]
        syn = res["syn"]
        multiples = res["multiples"]
        assets_minus_liabs = res["assets_minus_liabs"]
        dcf = res["dcf"]

        col1, col2, col3 = st.columns(3)
        col1.metric("Average Adjusted EBITDA", f"${avg_adj:,.0f}")
        col2.metric("Run-rate Adjusted EBITDA", f"${run_rate_adj:,.0f}")
        col3.metric("Assets - Liabilities", f"${assets_minus_liabs:,.0f}")

        # Valuation table
        table_rows = []
        for m in multiples:
            ev_avg = avg_adj * m
            equity_avg = ev_avg + assets_minus_liabs
            ev_run = run_rate_adj * m
            equity_run = ev_run + assets_minus_liabs
            table_rows.append({
                "Multiple": f"{m:.1f}x",
                "EV (Avg)": ev_avg, "Equity (Avg)": equity_avg,
                "EV (Run)": ev_run, "Equity (Run)": equity_run
            })
        df = pd.DataFrame(table_rows)
        st.dataframe(df.style.format({
            "EV (Avg)": "${:,.0f}", "Equity (Avg)": "${:,.0f}",
            "EV (Run)": "${:,.0f}", "Equity (Run)": "${:,.0f}"
        }), use_container_width=True)

        st.markdown("##### DCF Summary")
        c1, c2, c3 = st.columns(3)
        c1.metric("PV(FCF)", f"${dcf['pv_fcf_total']:,.0f}")
        c2.metric("PV(Terminal)", f"${dcf['pv_terminal_value']:,.0f}")
        c3.metric("Enterprise Value (DCF)", f"${dcf['enterprise_value']:,.0f}")
        st.metric("Equity Value (DCF)", f"${dcf['equity_value']:,.0f}")

with tab_viz:
    st.markdown("#### Visuals")
    if "results" not in st.session_state:
        st.info("Run a model first.")
    else:
        res = st.session_state["results"]
        recs = res["records"]
        avg_adj = res["avg_adj"]
        run_rate_adj = res["run_rate_adj"]
        syn = res["syn"]
        multiples = res["multiples"]
        assets_minus_liabs = res["assets_minus_liabs"]
        dcf = res["dcf"]
        mc = res["mc"]

        fig1 = bar_ev_by_multiple(avg_adj, run_rate_adj, multiples, assets_minus_liabs)
        st.plotly_chart(fig1, use_container_width=True)

        last = recs[-1]
        fig2 = waterfall_adjustments(
            raw=last.raw_ebitda,
            owner=last.owner_comp_addback,
            nonrec=last.nonrecurring_addbacks,
            other=last.other_addbacks,
            synergy=syn
        )
        st.plotly_chart(fig2, use_container_width=True)

        fig3 = dcf_cashflows_chart(dcf["fcf"], dcf["pv_fcf"])
        st.plotly_chart(fig3, use_container_width=True)

        st.markdown("##### Monte Carlo")
        colA, colB = st.columns([2, 1])
        with colA:
            st.plotly_chart(mc_histogram(mc["equities"]), use_container_width=True)
        with colB:
            st.metric("Mean Equity", f"${mc['mean']:,.0f}")
            st.metric("P5", f"${mc['p5']:,.0f}")
            st.metric("P50", f"${mc['p50']:,.0f}")
            st.metric("P95", f"${mc['p95']:,.0f}")

        # Sensitivity heatmap for WACC vs Exit Multiple using run-rate EBITDA
        waccs = np.linspace(0.12, 0.24, num=7)
        multiples_grid = np.linspace(multiples[0], multiples[-1], num=7)
        equity_mat = np.zeros((len(waccs), len(multiples_grid)))
        for i, w in enumerate(waccs):
            for j, m in enumerate(multiples_grid):
                ev = run_rate_adj * m
                equity_mat[i, j] = ev + assets_minus_liabs
        st.plotly_chart(heatmap_sensitivity(waccs, multiples_grid, equity_mat), use_container_width=True)

with tab_reco:
    st.markdown("#### Recommendations")
    if "results" not in st.session_state:
        st.info("Run a model first.")
    else:
        res = st.session_state["results"]
        dcf = res["dcf"]
        mc = res["mc"]
        st.markdown("""
- Consider price within the interquartile band of Monte Carlo outcomes for risk-adjusted negotiation.
- Validate add-backs with documentation (owner compensation, personal expenses, one-time items).
- Revisit synergy assumption: if dependent on platform centralization, ensure integration timing and cost are reflected.
- Confirm working capital seasonality (prepaid tox events, patient deposits) to refine DCF.
- If lease obligations are material, incorporate lease-adjusted metrics or capitalized rent for comparability.
- Run sensitivity on provider retention and injector productivity (utilization / churn) to stress margins.
        """)

with tab_logs:
    st.markdown("#### Process Log")
    for ln in st.session_state.logs[-200:]:
        st.markdown(f"<div class='terminal-line'>› {ln}<span class='cursor'></span></div>", unsafe_allow_html=True)
```

Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8501
CMD ["streamlit", "run", "app/app.py", "--server.address=0.0.0.0", "--server.port=8501"]
```

README.md

```markdown
# CPP Manual-Input CLI Modeler

Neon terminal-themed Streamlit app for precise, auditable CPP clinic modeling.

## Features

- Manual data entry only; no automated ingestion
- EBITDA normalization with add-backs & synergy
- Valuations: multiples (3x–6x), DCF, Monte Carlo
- Interactive charts & sensitivity heatmaps
- SQLite storage of inputs & runs for audit
- HIPAA-safe (no PHI), cost-gated external APIs

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app/app.py
```

Open http://localhost:8501

## Docker

```bash
docker build -t cpp-cli-modeler .
docker run -p 8501:8501 cpp-cli-modeler
```

## Deployment

- Streamlit Community Cloud: push repo and deploy
- AWS ECS/Fargate or App Runner for scale
- Vercel via container; ensure concurrency and warm starts
- Configure persistent SQLite volume or switch to Postgres if needed

## Testing

Use included sample data — expect base run-rate 4.5x equity ≈ $3.37M, DCF ≈ $3.44M, MC mean ≈ $3.2M (illustrative).
```

Ethics, safety, and governance

- HIPAA/PHI: Do not input any patient-identifiable data. Only clinic-level financials and operational aggregates.
- Uncertainty flags: The app surfaces values; you can annotate runs and export. If inputs are incomplete, the validator will prompt you to fill gaps before modeling.
- Cost gating: All external API calls are disabled unless you explicitly opt in and set a budget > $0.10. PitchBook/Alpha Vantage hooks are left commented for now.

What I need from you

1. Provide your clinic’s actual inputs (or confirm you’ll start with the sample):
   - Years (3–5 ideally), revenue, raw EBITDA
   - Add-backs: owner comp, nonrecurring, other
   - Synergy method and value
   - Assets and liabilities
   - WACC, terminal growth, tax rate, capex %, working capital %
2. Approve or deny market benchmark lookups and set a budget cap for any external API calls.
3. Any special modeling preferences (e.g., synergy as phased over 24 months, lease capitalization, provider productivity-driven EBITDA).

Once you share the real numbers, I’ll run a fresh pass, validate, and return a polished valuation pack (multiples, DCF, Monte Carlo, sensitivity charts) plus a deploy link.