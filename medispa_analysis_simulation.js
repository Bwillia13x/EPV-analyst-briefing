// COMPREHENSIVE MEDISPA FINANCIAL ANALYSIS SIMULATION
// Simulating CLI commands and their outputs for full platform demonstration

console.log("=".repeat(80));
console.log("LUXURY AESTHETICS MEDICAL SPA - COMPREHENSIVE FINANCIAL ANALYSIS");
console.log("=".repeat(80));
console.log("");

// PHASE 1: FINANCIAL REPORT ANALYSIS
console.log("PHASE 1: FINANCIAL STATEMENT ANALYSIS");
console.log("-".repeat(50));
console.log("");

console.log("Command: finrep both Revenue: $4200000, Cost of Goods Sold: $1260000, Operating Expenses: $2100000, Current Assets: $850000, Long Term Debt: $1500000, Current Liabilities: $420000");
console.log("");

// Simulated Income Statement Output
console.log("— Income Statement —");
console.log("Revenue                   $4,200,000");
console.log("Cost of Goods Sold        $1,260,000");
console.log("Gross Profit              $2,940,000");
console.log("Gross Margin %            70.0%");
console.log("");
console.log("Operating Expenses        $2,100,000");
console.log("EBITDA                    $840,000");
console.log("EBITDA Margin %           20.0%");
console.log("");
console.log("Depreciation              $210,000");
console.log("EBIT                      $630,000");
console.log("Interest Expense          $0");
console.log("Taxes                     $157,500");
console.log("Net Income                $472,500");
console.log("Net Margin %              11.3%");
console.log("");

// Simulated Balance Sheet Output
console.log("— Balance Sheet —");
console.log("ASSETS:");
console.log("  Current Assets          $850,000");
console.log("  Fixed Assets            $2,510,000");
console.log("  Total Assets            $3,360,000");
console.log("");
console.log("LIABILITIES:");
console.log("  Current Liabilities     $420,000");
console.log("  Long-term Debt          $1,500,000");
console.log("  Total Liabilities       $1,920,000");
console.log("");
console.log("EQUITY:");
console.log("  Total Equity            $1,440,000");
console.log("");
console.log("KEY METRICS:");
console.log("  Working Capital         $430,000");
console.log("  Debt/Equity             1.04");
console.log("  Current Ratio           2.02");
console.log("");

// PHASE 2: DCF BASELINE ANALYSIS
console.log("PHASE 2: DCF VALUATION MODEL - BASELINE SCENARIO");
console.log("-".repeat(50));
console.log("");

console.log("Command: run");
console.log("");
console.log("— Run Summary —");
console.log("Metric             Value");
console.log("Enterprise Value   $8,245,000");
console.log("PV of FCF          $4,125,000");
console.log("PV of Terminal     $4,120,000");
console.log("Exit Year          5");
console.log("Exit EBITDA        $1,485,000");
console.log("Y1 Revenue         $3,500,000");
console.log("Y1 EBITDA          $875,000");
console.log("Y1 EBITDA %        25.0%");
console.log("Revenue CAGR       8.5%");
console.log("Capacity Util Y1   72.0%");
console.log("LTV                $2,850");
console.log("LTV/CAC            8.10");
console.log("Payback (mo)       4.8");
console.log("");

// Year-by-year projections
console.log("Year-by-Year Financial Projections:");
console.log("Yr   Revenue      EBITDA%   FCF        CapUtil   EBITDA      ΔNWC");
console.log("1    $3,500,000   25.0%     $658,000   72.0%     $875,000    $98,000");
console.log("2    $3,808,000   26.1%     $745,000   74.5%     $994,000    $75,000");
console.log("3    $4,142,000   27.0%     $835,000   77.2%     $1,118,000  $82,000");
console.log("4    $4,504,000   27.8%     $932,000   79.8%     $1,252,000  $89,000");
console.log("5    $4,897,000   28.5%     $1,035,000 82.1%     $1,396,000  $96,000");
console.log("");

// Key Ratios Analysis
console.log("FINANCIAL RATIO ANALYSIS:");
console.log("- Gross Margin: 70.0% (Excellent - above industry average of 65%)");
console.log("- EBITDA Margin: 20.0% (Strong - industry range 15-25%)");
console.log("- Net Margin: 11.3% (Healthy - above industry median of 8%)");
console.log("- Current Ratio: 2.02 (Strong liquidity position)");
console.log("- Debt/Equity: 1.04 (Moderate leverage, manageable)");
console.log("- LTV/CAC: 8.10 (Excellent unit economics)");
console.log("- Payback Period: 4.8 months (Very strong customer acquisition)");
console.log("");

console.log("PHASE 3: SENSITIVITY ANALYSIS");
console.log("-".repeat(50));
console.log("");

console.log("Command: sens discount.wacc=8%,10%,12% exit.exitMultipleEBITDA=6,8,10");
console.log("");
console.log("Sensitivity EV Grid:");
console.log("              6              8              10");
console.log("8%            $9,847,000     $11,245,000    $12,643,000");
console.log("10%           $8,654,000     $9,847,000     $11,040,000");
console.log("12%           $7,692,000     $8,654,000     $9,616,000");
console.log("");

console.log("Command: sens patients.churnRate=20%,25%,30%");
console.log("");
console.log("Churn Rate Impact on Enterprise Value:");
console.log("20%           $9,145,000");
console.log("25%           $8,245,000");
console.log("30%           $7,234,000");
console.log("");

console.log("PHASE 4: MONTE CARLO SIMULATION");
console.log("-".repeat(50));
console.log("");

console.log("Command: mc 1000");
console.log("");
console.log("Running Monte Carlo (1000)...");
console.log("EV p5:  $5,847,000");
console.log("EV p50: $8,245,000");
console.log("EV p95: $11,432,000");
console.log("Prob LTV/CAC > 3: 89.4%");
console.log("Prob EV < 0: 0.2%");
console.log("");

console.log("PHASE 5: SCENARIO ANALYSIS");
console.log("-".repeat(50));
console.log("");

// Growth Scenario
console.log("GROWTH SCENARIO ANALYSIS:");
console.log("Command: preset growth");
console.log("Applied preset 'growth'.");
console.log("");
console.log("Command: run");
console.log("— Growth Scenario Results —");
console.log("Enterprise Value   $10,847,000");
console.log("Y1 EBITDA %        27.5%");
console.log("Revenue CAGR       12.8%");
console.log("LTV/CAC            9.85");
console.log("");

// Lean Scenario  
console.log("LEAN SCENARIO ANALYSIS:");
console.log("Command: preset lean");
console.log("Applied preset 'lean'.");
console.log("");
console.log("Command: run");
console.log("— Lean Scenario Results —");
console.log("Enterprise Value   $6,945,000");
console.log("Y1 EBITDA %        22.8%");
console.log("Revenue CAGR       6.2%");
console.log("LTV/CAC            7.45");
console.log("");

// Premium Scenario
console.log("PREMIUM SCENARIO ANALYSIS:");
console.log("Command: preset premium");
console.log("Applied preset 'premium'.");
console.log("");
console.log("Command: run");
console.log("— Premium Scenario Results —");
console.log("Enterprise Value   $9,547,000");
console.log("Y1 EBITDA %        26.2%");
console.log("Revenue CAGR       9.8%");
console.log("LTV/CAC            8.67");
console.log("");

console.log("=".repeat(80));
console.log("ANALYSIS COMPLETE - GENERATING EXECUTIVE SUMMARY");
console.log("=".repeat(80));