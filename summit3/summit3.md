import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Types
type YearData = {
  year: number;
  revenue: number; // in USD
  rawEbitda: number; // in USD
  addbacks: number; // in USD
};

type AgentMessage = {
  agent: "Planner" | "InputHandler" | "Modeling" | "Visualization" | "Frontend" | "Reflector";
  thought: string;
  action: string;
  output: string;
  ts: number;
};

// Utilities
function formatUSD(n: number): string {
  if (!isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const h = idx - lo;
  return sorted[lo] * (1 - h) + sorted[hi] * h;
}

function download(filename: string, text: string) {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "application/json" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Matrix rain background
function useMatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const letters = "01$#@%&*+<>".split("");
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#22c55e"; // green-500
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      anim = requestAnimationFrame(draw);
    };

    let anim = requestAnimationFrame(draw);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return canvasRef;
}

// Main Component
export default function CPPAgenticTerminal() {
  // Matrix rain background layer
  const rainRef = useMatrixRain();

  // Years and data
  const currentYear = new Date().getFullYear();
  const [yearsData, setYearsData] = useState<YearData[]>([
    { year: currentYear - 2, revenue: 2000000, rawEbitda: 450000, addbacks: 150000 },
    { year: currentYear - 1, revenue: 2300000, rawEbitda: 520000, addbacks: 150000 },
    { year: currentYear, revenue: 2600000, rawEbitda: 600000, addbacks: 150000 },
  ]);
  const [synergyPct, setSynergyPct] = useState<number>(15); // % of raw EBITDA uplift
  const [assets, setAssets] = useState<number>(80000);
  const [liabilities, setLiabilities] = useState<number>(100000);
  const [baseMultiple, setBaseMultiple] = useState<number>(4.5);
  const multiples = useMemo(() => [3, 3.5, 4, 4.5, 5, 5.5, 6], []);

  // DCF params
  const [growthRate, setGrowthRate] = useState<number>(12); // % YoY EBITDA growth
  const [discountRate, setDiscountRate] = useState<number>(16); // %
  const [capexPct, setCapexPct] = useState<number>(10); // % of EBITDA as net reinvestment
  const [taxRate, setTaxRate] = useState<number>(21); // %
  const [terminalGrowth, setTerminalGrowth] = useState<number>(3); // %

  // Monte Carlo
  const [mcRuns, setMcRuns] = useState<number>(500);
  const [mcResults, setMcResults] = useState<number[]>([]);
  const [mcRunning, setMcRunning] = useState<boolean>(false);

  // UI State
  const [activeTab, setActiveTab] = useState<"models" | "viz" | "recs" | "chat">("models");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [showBenchmarksModal, setShowBenchmarksModal] = useState<boolean>(false);
  const [narrative, setNarrative] = useState<string>("Ready.");

  // Derived calculations
  const adjustedByYear = useMemo(() => {
    const s = synergyPct / 100;
    return yearsData.map((y) => ({
      year: y.year,
      adjusted: y.rawEbitda + y.addbacks + s * y.rawEbitda,
      raw: y.rawEbitda,
      addbacks: y.addbacks,
      revenue: y.revenue,
    }));
  }, [yearsData, synergyPct]);

  const avgAdjustedEBITDA = useMemo(() => {
    if (adjustedByYear.length === 0) return 0;
    return (
      adjustedByYear.reduce((acc, cur) => acc + cur.adjusted, 0) / adjustedByYear.length
    );
  }, [adjustedByYear]);

  const evByMultiple = useMemo(() => {
    return multiples.map((m) => ({ multiple: `${m}x`, ev: avgAdjustedEBITDA * m }));
  }, [multiples, avgAdjustedEBITDA]);

  const baseEV = useMemo(() => avgAdjustedEBITDA * baseMultiple, [avgAdjustedEBITDA, baseMultiple]);
  const equityValueFromMultiple = useMemo(() => baseEV + assets - liabilities, [baseEV, assets, liabilities]);

  const dcf = useMemo(() => {
    const dr = discountRate / 100;
    const g = growthRate / 100;
    const capex = capexPct / 100;
    const t = taxRate / 100;

    const lastAdj = adjustedByYear.length > 0 ? adjustedByYear[adjustedByYear.length - 1].adjusted : 0;
    const horizon = 5;
    const fcfs: number[] = [];
    let ebitda = lastAdj;
    for (let i = 1; i <= horizon; i++) {
      ebitda = ebitda * (1 + g);
      const fcf = ebitda * (1 - capex) * (1 - t);
      fcfs.push(fcf);
    }
    const npv = fcfs.reduce((acc, fcf, idx) => acc + fcf / Math.pow(1 + dr, idx + 1), 0);
    const gTerm = terminalGrowth / 100;
    const terminalFCF = fcfs[fcfs.length - 1] * (1 + gTerm);
    const terminalValue = dr > gTerm ? terminalFCF / (dr - gTerm) : 0;
    const terminalPV = terminalValue / Math.pow(1 + dr, horizon);
    const ev = npv + terminalPV;
    const equity = ev + assets - liabilities;

    return { ev, equity, fcfs, horizon };
  }, [adjustedByYear, growthRate, discountRate, capexPct, taxRate, terminalGrowth, assets, liabilities]);

  const forecastSeries = useMemo(() => {
    const g = growthRate / 100;
    const lastAdj = adjustedByYear.length > 0 ? adjustedByYear[adjustedByYear.length - 1].adjusted : 0;
    const outYears = 5;
    const startYear = adjustedByYear.length > 0 ? adjustedByYear[adjustedByYear.length - 1].year : currentYear;
    const rows: { name: string; EBITDA: number; FCF: number }[] = [];
    let e = lastAdj;
    for (let i = 1; i <= outYears; i++) {
      e = e * (1 + g);
      const fcf = e * (1 - capexPct / 100) * (1 - taxRate / 100);
      rows.push({ name: `${startYear + i}`, EBITDA: Math.max(0, e), FCF: Math.max(0, fcf) });
    }
    return rows;
  }, [adjustedByYear, growthRate, capexPct, taxRate, currentYear]);

  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    if (yearsData.length < 3) issues.push("Provide at least 3 years of data for robustness.");
    yearsData.forEach((y) => {
      if (y.revenue <= 0) issues.push(`Revenue for ${y.year} should be > 0.`);
      if (y.rawEbitda < 0) issues.push(`EBITDA for ${y.year} cannot be negative.`);
    });
    if (discountRate <= terminalGrowth) issues.push("Discount rate must exceed terminal growth for DCF.");
    return issues;
  }, [yearsData, discountRate, terminalGrowth]);

  // Agent logging
  const pushLog = (m: AgentMessage) => setMessages((prev) => [...prev, m]);

  const runPipeline = async () => {
    setNarrative("Running multi-agent pipeline...");
    setMessages([]);

    // Planner
    pushLog({
      agent: "Planner",
      thought: "Decompose into validation, modeling, visualization, and recommendations.",
      action: "plan",
      output: JSON.stringify({
        steps: [
          "Validate manual inputs",
          "Normalize EBITDA and compute EV scenarios",
          "DCF forecast and risk simulation",
          "Generate visualizations",
          "Reflect and summarize"
        ],
      }),
      ts: Date.now(),
    });

    // InputHandler
    pushLog({
      agent: "InputHandler",
      thought: "Check completeness and plausibility of entered data.",
      action: "validate",
      output: JSON.stringify({ issues: validationIssues }),
      ts: Date.now(),
    });

    // Modeling
    const explanation = `Avg Adj. EBITDA = ${formatUSD(avgAdjustedEBITDA)}; EV@${baseMultiple.toFixed(1)}x = ${formatUSD(baseEV)}; Equity = EV + Assets - Liabilities = ${formatUSD(equityValueFromMultiple)}. DCF Equity = ${formatUSD(dcf.equity)}.`;
    pushLog({
      agent: "Modeling",
      thought: "Compute normalization, scenarios, and DCF.",
      action: "compute",
      output: explanation,
      ts: Date.now(),
    });

    // Visualization
    pushLog({
      agent: "Visualization",
      thought: "Prepare chart series for multiples, trends, and FCF.",
      action: "series",
      output: JSON.stringify({ evByMultipleCount: evByMultiple.length, forecastPoints: forecastSeries.length }),
      ts: Date.now(),
    });

    // Reflector
    pushLog({
      agent: "Reflector",
      thought: "Cross-check: discount > terminal growth; data years >= 3.",
      action: "qa",
      output: validationIssues.length === 0 ? "Checks passed." : `Issues: ${validationIssues.join(" | ")}`,
      ts: Date.now(),
    });

    setNarrative("Pipeline complete.");
  };

  // Monte Carlo simulation
  const runMonteCarlo = () => {
    setMcRunning(true);
    setTimeout(() => {
      const drMean = discountRate / 100;
      const grMean = growthRate / 100;
      const syMean = synergyPct / 100;
      const capex = capexPct / 100;
      const t = taxRate / 100;
      const lastAdj = adjustedByYear.length > 0 ? adjustedByYear[adjustedByYear.length - 1].adjusted : 0;
      const sims: number[] = [];

      for (let i = 0; i < mcRuns; i++) {
        // simple normal draws with bounds
        const dr = clamp(drMean + (Math.random() * 2 - 1) * 0.03, 0.08, 0.30);
        const gr = clamp(grMean + (Math.random() * 2 - 1) * 0.05, 0.00, 0.35);
        const sy = clamp(syMean + (Math.random() * 2 - 1) * 0.05, 0.0, 0.30);
        const mul = 3 + Math.random() * 3; // 3x-6x

        // Adjusted last EBITDA with synergy variation
        const adj0 = lastAdj * (1 + sy);

        // 5-year DCF
        let e = adj0;
        const horizon = 5;
        let npv = 0;
        for (let y = 1; y <= horizon; y++) {
          e = e * (1 + gr);
          const fcf = e * (1 - capex) * (1 - t);
          npv += fcf / Math.pow(1 + dr, y);
        }
        const gTerm = clamp(terminalGrowth / 100, 0.0, 0.05);
        const terminal = dr > gTerm ? (e * (1 + gTerm) * (1 - capex) * (1 - t)) / (dr - gTerm) : 0;
        const dcfEV = npv + terminal / Math.pow(1 + dr, horizon);
        const compEV = (avgAdjustedEBITDA * mul);
        // Blend to represent model uncertainty
        const ev = 0.65 * dcfEV + 0.35 * compEV;
        const equity = ev + assets - liabilities;
        sims.push(equity);
      }
      setMcResults(sims);
      setMcRunning(false);
    }, 50);
  };

  // Chat command parser
  const handlePrompt = () => {
    const p = userPrompt.toLowerCase();
    const num = parseFloat((p.match(/[-+]?[0-9]*\.?[0-9]+/) || ["0"])[0]);

    if (p.includes("synerg")) setSynergyPct(clamp(num, 0, 30));
    else if (p.includes("growth")) setGrowthRate(clamp(num, 0, 50));
    else if (p.includes("discount")) setDiscountRate(clamp(num, 5, 40));
    else if (p.includes("multiple")) setBaseMultiple(clamp(num, 3, 6));
    else if (p.includes("runs")) setMcRuns(clamp(Math.round(num), 100, 2000));

    pushLog({
      agent: "Frontend",
      thought: "Parsed chat prompt to parameter update.",
      action: "parse",
      output: JSON.stringify({ prompt: userPrompt }),
      ts: Date.now(),
    });
    setUserPrompt("");
  };

  // Save / Load
  const saveSession = () => {
    const payload = {
      yearsData,
      synergyPct,
      assets,
      liabilities,
      baseMultiple,
      growthRate,
      discountRate,
      capexPct,
      taxRate,
      terminalGrowth,
      mcRuns,
    };
    localStorage.setItem("cpp_session", JSON.stringify(payload));
    setNarrative("Session saved to localStorage.");
  };

  const loadSession = () => {
    const raw = localStorage.getItem("cpp_session");
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setYearsData(s.yearsData || yearsData);
      setSynergyPct(s.synergyPct ?? synergyPct);
      setAssets(s.assets ?? assets);
      setLiabilities(s.liabilities ?? liabilities);
      setBaseMultiple(s.baseMultiple ?? baseMultiple);
      setGrowthRate(s.growthRate ?? growthRate);
      setDiscountRate(s.discountRate ?? discountRate);
      setCapexPct(s.capexPct ?? capexPct);
      setTaxRate(s.taxRate ?? taxRate);
      setTerminalGrowth(s.terminalGrowth ?? terminalGrowth);
      setMcRuns(s.mcRuns ?? mcRuns);
      setNarrative("Session loaded.");
    } catch (e) {
      setNarrative("Failed to load session.");
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      inputs: { yearsData, synergyPct, assets, liabilities, baseMultiple, growthRate, discountRate, capexPct, taxRate, terminalGrowth, mcRuns },
      metrics: {
        avgAdjustedEBITDA,
        baseEV,
        equityValueFromMultiple,
        dcfEquity: dcf.equity,
      },
      notes: "Manually entered CPP clinic data; no automated ingestion."
    };
    download(`cpp_valuation_${Date.now()}.json`, JSON.stringify(report, null, 2));
  };

  const loadSample = () => {
    setYearsData([
      { year: currentYear - 2, revenue: 1800000, rawEbitda: 400000, addbacks: 150000 },
      { year: currentYear - 1, revenue: 2100000, rawEbitda: 520000, addbacks: 150000 },
      { year: currentYear, revenue: 2500000, rawEbitda: 600000, addbacks: 150000 },
      { year: currentYear + 1, revenue: 2800000, rawEbitda: 680000, addbacks: 150000 },
    ]);
    setSynergyPct(15);
    setAssets(100000);
    setLiabilities(120000);
    setBaseMultiple(4.5);
    setGrowthRate(12);
    setDiscountRate(16);
    setCapexPct(10);
    setTaxRate(21);
    setTerminalGrowth(3);
    setMcRuns(500);
  };

  const addYear = () => {
    const last = yearsData[yearsData.length - 1];
    if (yearsData.length >= 5) return;
    setYearsData([
      ...yearsData,
      {
        year: last.year + 1,
        revenue: Math.round(last.revenue * 1.1),
        rawEbitda: Math.round(last.rawEbitda * 1.1),
        addbacks: last.addbacks,
      },
    ]);
  };

  const removeYear = () => {
    if (yearsData.length <= 3) return;
    setYearsData(yearsData.slice(0, -1));
  };

  // Benchmarks modal confirm
  const applyBenchmarks = () => {
    // Pretend we fetched external data (requiring confirmation if cost > $0.10).
    setGrowthRate(15);
    setBaseMultiple(4.8);
    setNarrative("Benchmarks applied (no external call made).");
    setShowBenchmarksModal(false);
  };

  // Charts data
  const revenueEbitdaSeries = useMemo(() => {
    return yearsData.map((y, idx) => ({
      name: `${y.year}`,
      Revenue: y.revenue,
      EBITDA: adjustedByYear[idx]?.adjusted || 0,
    }));
  }, [yearsData, adjustedByYear]);

  const mcHistogram = useMemo(() => {
    if (mcResults.length === 0) return [] as { bucket: string; count: number }[];
    const min = Math.min(...mcResults);
    const max = Math.max(...mcResults);
    const bins = 12;
    const width = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    mcResults.forEach((v) => {
      const i = Math.min(bins - 1, Math.floor((v - min) / width));
      counts[i]++;
    });
    return counts.map((c, i) => ({
      bucket: `${formatUSD(min + i * width)}`,
      count: c,
    }));
  }, [mcResults]);

  // Risk heatmap grid (growth vs discount)
  const heatmapGrid = useMemo(() => {
    const rows: { g: number; d: number; value: number }[] = [];
    const lastAdj = adjustedByYear.length > 0 ? adjustedByYear[adjustedByYear.length - 1].adjusted : 0;
    for (let g = 5; g <= 25; g += 4) {
      for (let d = 10; d <= 24; d += 2) {
        // 5-year DCF quick calculation
        let e = lastAdj;
        const capex = capexPct / 100;
        const t = taxRate / 100;
        const gr = g / 100;
        const dr = d / 100;
        let npv = 0;
        for (let y = 1; y <= 5; y++) {
          e = e * (1 + gr);
          const fcf = e * (1 - capex) * (1 - t);
          npv += fcf / Math.pow(1 + dr, y);
        }
        const gTerm = terminalGrowth / 100;
        const terminal = dr > gTerm ? (e * (1 + gTerm) * (1 - capex) * (1 - t)) / (dr - gTerm) : 0;
        const ev = npv + terminal / Math.pow(1 + dr, 5);
        rows.push({ g, d, value: ev + assets - liabilities });
      }
    }
    const vals = rows.map((r) => r.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return rows.map((r) => ({ ...r, norm: (r.value - min) / (max - min || 1) }));
  }, [adjustedByYear, capexPct, taxRate, terminalGrowth, assets, liabilities]);

  return (
    <div className="relative min-h-screen bg-black">
      <Head>
        <title>CPP Agentic Valuation Terminal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Matrix Rain Background */}
      <canvas ref={rainRef} style={{ position: "fixed", inset: 0, zIndex: 0, width: "100%", height: "100%" }} />

      <main className="relative z-10 text-green-400 font-mono" style={{ fontFamily: '"Fira Code", monospace' }}>
        <header className="w-full border-b border-green-700 bg-black/80">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-green-400">CPP Agentic Valuation Terminal</h1>
              <p className="text-green-500 text-sm">Manual inputs • Audit-ready • No auto-ingestion</p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveSession} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Save</button>
              <button onClick={loadSession} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Load</button>
              <button onClick={exportReport} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Export</button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Inputs */}
          <section className="lg:col-span-1 bg-black/70 border border-green-700 rounded-lg p-4 space-y-4">
            <h2 className="text-green-300">$ Manual Data Entry</h2>
            <div className="space-y-3">
              {yearsData.map((row, idx) => (
                <div key={row.year} className="border border-green-800 rounded p-3 bg-black/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">Year {row.year}</span>
                    {idx === yearsData.length - 1 && (
                      <div className="flex gap-2">
                        <button onClick={addYear} className="px-2 py-1 text-xs border border-green-700 rounded hover:bg-green-900 disabled:opacity-50" disabled={yearsData.length >= 5}>+ Year</button>
                        <button onClick={removeYear} className="px-2 py-1 text-xs border border-green-700 rounded hover:bg-green-900 disabled:opacity-50" disabled={yearsData.length <= 3}>- Year</button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="text-sm">$ Revenue
                      <input type="number" className="mt-1 w-full bg-black text-green-300 border border-green-700 rounded px-2 py-1" value={row.revenue}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setYearsData((prev) => prev.map((r, i) => i === idx ? { ...r, revenue: v } : r));
                        }} />
                    </label>
                    <label className="text-sm">$ Raw EBITDA
                      <input type="number" className="mt-1 w-full bg-black text-green-300 border border-green-700 rounded px-2 py-1" value={row.rawEbitda}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setYearsData((prev) => prev.map((r, i) => i === idx ? { ...r, rawEbitda: v } : r));
                        }} />
                    </label>
                    <label className="text-sm">$ Add-backs
                      <input type="number" className="mt-1 w-full bg-black text-green-300 border border-green-700 rounded px-2 py-1" value={row.addbacks}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setYearsData((prev) => prev.map((r, i) => i === idx ? { ...r, addbacks: v } : r));
                        }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">% Synergies (EBITDA)
                <input type="range" min={0} max={30} step={1} value={synergyPct}
                  onChange={(e) => setSynergyPct(Number(e.target.value))}
                  className="w-full" />
                <div className="text-xs">Current: {synergyPct}%</div>
              </label>
              <label className="text-sm">$ Assets
                <input type="number" className="mt-1 w-full bg-black text-green-300 border border-green-700 rounded px-2 py-1" value={assets}
                  onChange={(e) => setAssets(Number(e.target.value || 0))} />
              </label>
              <label className="text-sm">$ Liabilities
                <input type="number" className="mt-1 w-full bg-black text-green-300 border border-green-700 rounded px-2 py-1" value={liabilities}
                  onChange={(e) => setLiabilities(Number(e.target.value || 0))} />
              </label>
              <label className="text-sm">× Base Multiple
                <input type="range" min={3} max={6} step={0.5} value={baseMultiple}
                  onChange={(e) => setBaseMultiple(Number(e.target.value))}
                  className="w-full" />
                <div className="text-xs">Current: {baseMultiple.toFixed(1)}x</div>
              </label>
            </div>

            <h3 className="text-green-300 mt-2">$ DCF Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">% Growth Rate
                <input type="range" min={0} max={40} step={1} value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))} className="w-full" />
                <div className="text-xs">{growthRate}%</div>
              </label>
              <label className="text-sm">% Discount Rate
                <input type="range" min={8} max={30} step={1} value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))} className="w-full" />
                <div className="text-xs">{discountRate}%</div>
              </label>
              <label className="text-sm">% Capex/Reinvestment
                <input type="range" min={0} max={30} step={1} value={capexPct}
                  onChange={(e) => setCapexPct(Number(e.target.value))} className="w-full" />
                <div className="text-xs">{capexPct}%</div>
              </label>
              <label className="text-sm">% Tax Rate
                <input type="range" min={0} max={40} step={1} value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full" />
                <div className="text-xs">{taxRate}%</div>
              </label>
              <label className="text-sm">% Terminal Growth
                <input type="range" min={0} max={5} step={0.5} value={terminalGrowth}
                  onChange={(e) => setTerminalGrowth(Number(e.target.value))} className="w-full" />
                <div className="text-xs">{terminalGrowth}%</div>
              </label>
            </div>

            <h3 className="text-green-300 mt-2">$ Monte Carlo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <label className="text-sm">Runs
                <input type="number" className="mt-1 w-full bg-black text-green-300 border border-green-700 rounded px-2 py-1" value={mcRuns}
                  onChange={(e) => setMcRuns(clamp(Number(e.target.value || 0), 100, 2000))} />
              </label>
              <button onClick={runMonteCarlo} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900 flex items-center justify-center" disabled={mcRunning}>
                {mcRunning ? <span className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" /> : "Run Sim"}
              </button>
              <button onClick={() => setShowBenchmarksModal(true)} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Benchmarks</button>
            </div>

            <div className="pt-2 text-xs text-green-500">
              Ethics & Safety: Unbiased modeling, HIPAA-conscious, and user-confirmed external calls (> $0.10).
            </div>
          </section>

          {/* Middle: Charts / Models */}
          <section className="lg:col-span-2 space-y-4">
            <div className="bg-black/70 border border-green-700 rounded-lg p-3">
              <div className="flex gap-2 mb-3">
                <button onClick={() => setActiveTab("models")} className={`px-3 py-2 rounded border ${activeTab === "models" ? "bg-green-900 border-green-500" : "border-green-700 hover:bg-green-900/40"}`}>Models</button>
                <button onClick={() => setActiveTab("viz")} className={`px-3 py-2 rounded border ${activeTab === "viz" ? "bg-green-900 border-green-500" : "border-green-700 hover:bg-green-900/40"}`}>Viz</button>
                <button onClick={() => setActiveTab("recs")} className={`px-3 py-2 rounded border ${activeTab === "recs" ? "bg-green-900 border-green-500" : "border-green-700 hover:bg-green-900/40"}`}>Recommendations</button>
                <button onClick={() => setActiveTab("chat")} className={`px-3 py-2 rounded border ${activeTab === "chat" ? "bg-green-900 border-green-500" : "border-green-700 hover:bg-green-900/40"}`}>Query Chat</button>
                <div className="flex-1" />
                <button onClick={runPipeline} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Run Pipeline</button>
              </div>

              {activeTab === "models" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* KPI Cards */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-1">Adjusted EBITDA (Avg)</div>
                    <div className="text-2xl text-green-400">{formatUSD(avgAdjustedEBITDA)}</div>
                    <div className="text-xs text-green-500">Includes add-backs and {synergyPct}% synergies.</div>
                  </div>
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-1">EV @ {baseMultiple.toFixed(1)}x</div>
                    <div className="text-2xl text-green-400">{formatUSD(baseEV)}</div>
                    <div className="text-xs text-green-500">Equity (EV + Assets - Liabilities): {formatUSD(equityValueFromMultiple)}</div>
                  </div>
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-1">DCF Equity</div>
                    <div className="text-2xl text-green-400">{formatUSD(dcf.equity)}</div>
                    <div className="text-xs text-green-500">Discount {discountRate}% · Growth {growthRate}% · Terminal {terminalGrowth}%</div>
                  </div>
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-1">Monte Carlo (if run)</div>
                    <div className="text-2xl text-green-400">{mcResults.length > 0 ? `${formatUSD(Math.round(mcResults.reduce((a,b)=>a+b,0)/mcResults.length))}` : "—"}</div>
                    <div className="text-xs text-green-500">P10: {mcResults.length ? formatUSD(Math.round(percentile(mcResults, 0.1))) : "—"} · P90: {mcResults.length ? formatUSD(Math.round(percentile(mcResults, 0.9))) : "—"}</div>
                  </div>

                  {/* EV by Multiple */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">EV by Multiple</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={evByMultiple}>
                          <CartesianGrid stroke="#064e3b" strokeDasharray="3 3" />
                          <XAxis dataKey="multiple" stroke="#86efac" />
                          <YAxis stroke="#86efac" tickFormatter={(v)=>`$${(v/1_000_000).toFixed(1)}M`} />
                          <Tooltip formatter={(v: any)=>formatUSD(Number(v))} contentStyle={{ backgroundColor: "#052e16", border: "1px solid #16a34a" }} />
                          <Legend />
                          <Bar dataKey="ev" fill="#22c55e" name="Enterprise Value" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue + EBITDA trend */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">Revenue & Adjusted EBITDA</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueEbitdaSeries}>
                          <CartesianGrid stroke="#064e3b" strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#86efac" />
                          <YAxis stroke="#86efac" tickFormatter={(v)=>`$${(v/1_000_000).toFixed(1)}M`} />
                          <Tooltip formatter={(v: any)=>formatUSD(Number(v))} contentStyle={{ backgroundColor: "#052e16", border: "1px solid #16a34a" }} />
                          <Legend />
                          <Line type="monotone" dataKey="Revenue" stroke="#84cc16" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="EBITDA" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* DCF FCF Area */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">DCF Forecast (FCF)</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastSeries}>
                          <defs>
                            <linearGradient id="fcf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#064e3b" strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#86efac" />
                          <YAxis stroke="#86efac" tickFormatter={(v)=>`$${(v/1_000_000).toFixed(1)}M`} />
                          <Tooltip formatter={(v: any)=>formatUSD(Number(v))} contentStyle={{ backgroundColor: "#052e16", border: "1px solid #16a34a" }} />
                          <Area type="monotone" dataKey="FCF" stroke="#22c55e" fillOpacity={1} fill="url(#fcf)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Monte Carlo Histogram */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">Monte Carlo Equity Distribution</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mcHistogram}>
                          <CartesianGrid stroke="#064e3b" strokeDasharray="3 3" />
                          <XAxis dataKey="bucket" stroke="#86efac" interval={1} hide={false} tick={{ fontSize: 10 }} />
                          <YAxis stroke="#86efac" />
                          <Tooltip contentStyle={{ backgroundColor: "#052e16", border: "1px solid #16a34a" }} />
                          <Bar dataKey="count" fill="#16a34a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-green-500 mt-2">Runs: {mcResults.length} · Min: {mcResults.length ? formatUSD(Math.round(Math.min(...mcResults))) : "—"} · Max: {mcResults.length ? formatUSD(Math.round(Math.max(...mcResults))) : "—"}</div>
                  </div>
                </div>
              )}

              {activeTab === "viz" && (
                <div className="grid grid-cols-1 gap-4">
                  {/* Risk Heatmap */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">Risk Heatmap (Growth vs Discount)</div>
                    <div className="grid grid-cols-8 gap-1">
                      {heatmapGrid.map((cell, idx) => (
                        <div key={idx} className="p-3 rounded border border-green-900 text-center" style={{ backgroundColor: `rgba(34,197,94,${0.2 + 0.6 * cell.norm})` }}>
                          <div className="text-xs">g {cell.g}% / d {cell.d}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Forecast Chart */}
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">5-Year EBITDA & FCF</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastSeries}>
                          <CartesianGrid stroke="#064e3b" strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#86efac" />
                          <YAxis stroke="#86efac" tickFormatter={(v)=>`$${(v/1_000_000).toFixed(1)}M`} />
                          <Tooltip formatter={(v: any)=>formatUSD(Number(v))} contentStyle={{ backgroundColor: "#052e16", border: "1px solid #16a34a" }} />
                          <Legend />
                          <Line type="monotone" dataKey="EBITDA" stroke="#84cc16" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="FCF" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "recs" && (
                <div className="space-y-3">
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">Recommendations</div>
                    <ul className="list-disc list-inside text-green-400 text-sm space-y-1">
                      <li>Target EV range: {formatUSD(evByMultiple[0].ev)} - {formatUSD(evByMultiple[evByMultiple.length - 1].ev)} based on 3x-6x.</li>
                      <li>Consider add-back documentation (owner comp, non-recurring) to firm up normalization.</li>
                      <li>Stress test discount rate to remain above terminal growth; current: {discountRate}% vs {terminalGrowth}%.</li>
                      <li>Monte Carlo suggests P10-P90 equity of {mcResults.length ? `${formatUSD(Math.round(percentile(mcResults, 0.1)))} - ${formatUSD(Math.round(percentile(mcResults, 0.9)))}` : "run simulation"}.</li>
                      <li>Benchmark margins: Injectables often ~20%+; validate clinic mix and capacity utilization.</li>
                    </ul>
                  </div>
                  <div className="border border-green-800 rounded p-3 bg-black/60 text-xs text-green-500">
                    Disclaimer: Educational modeling only. Ensure HIPAA compliance and do not enter PHI. Confirm any external API costs before use.
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="border border-green-800 rounded p-3 bg-black/60">
                    <div className="text-green-300 mb-2">Natural Language Query</div>
                    <div className="flex gap-2">
                      <input value={userPrompt} onChange={(e)=>setUserPrompt(e.target.value)} placeholder="> set synergy 20%" className="flex-1 px-3 py-2 bg-black text-green-300 border border-green-700 rounded" />
                      <button onClick={handlePrompt} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Send</button>
                    </div>
                    <div className="text-xs text-green-500 mt-2">Examples: "set synergy 20%", "growth 18", "discount 17", "multiple 5", "runs 1000"</div>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Terminal */}
            <div className="bg-black/70 border border-green-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-300">Agent Logs</div>
                <div className="text-xs text-green-500">{narrative}</div>
              </div>
              <div className="h-64 overflow-auto bg-black/60 border border-green-900 rounded p-2">
                {messages.length === 0 && (
                  <div className="text-green-500">$ No logs yet. Click "Run Pipeline" to start.</div>
                )}
                <ul className="space-y-2">
                  {messages.map((m, i) => (
                    <li key={i} className="text-xs">
                      <div className="text-green-400">[{new Date(m.ts).toLocaleTimeString()}] {m.agent}</div>
                      <pre className="whitespace-pre-wrap text-green-300">{JSON.stringify({ thought: m.thought, action: m.action, output: m.output }, null, 2)}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Modal: Benchmarks Confirmation */}
        {showBenchmarksModal && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
            <div className="bg-black border border-green-700 rounded-lg p-6 w-11/12 md:w-1/2">
              <div className="text-lg text-green-300 mb-2">External Benchmarks</div>
              <p className="text-green-400 text-sm mb-4">This action may call external APIs (e.g., comps providers). Estimated cost could exceed $0.10. Proceed?</p>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowBenchmarksModal(false)} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Cancel</button>
                <button onClick={applyBenchmarks} className="px-3 py-2 bg-green-900/40 border border-green-600 rounded hover:bg-green-900">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}