// GROWTH SENSITIVITY ANALYSIS - MEDISPA INDUSTRY FOCUS
// Critical growth considerations for the rapidly evolving medispa sector

console.log("📈 MEDISPA GROWTH SENSITIVITY ANALYSIS");
console.log("=".repeat(80));

// Growth drivers specific to medispa industry
const MEDISPA_GROWTH_DRIVERS = {
  // Patient acquisition and retention
  patientAcquisition: {
    socialMediaMarketing: { impact: 0.15, volatility: 0.3 }, // High impact, high volatility
    influencerPartnerships: { impact: 0.12, volatility: 0.4 },
    referralPrograms: { impact: 0.08, volatility: 0.2 },
    digitalMarketing: { impact: 0.10, volatility: 0.25 },
    organicGrowth: { impact: 0.05, volatility: 0.15 }
  },
  
  // Service expansion and innovation
  serviceExpansion: {
    newTreatmentModalities: { impact: 0.20, volatility: 0.35 }, // New technologies
    premiumServices: { impact: 0.15, volatility: 0.25 }, // High-end treatments
    membershipPrograms: { impact: 0.10, volatility: 0.20 },
    retailExpansion: { impact: 0.08, volatility: 0.15 },
    corporateWellness: { impact: 0.12, volatility: 0.30 }
  },
  
  // Market dynamics
  marketExpansion: {
    geographicGrowth: { impact: 0.25, volatility: 0.4 }, // New locations
    marketPenetration: { impact: 0.15, volatility: 0.3 }, // Deeper market share
    demographicExpansion: { impact: 0.18, volatility: 0.35 }, // New age groups/genders
    seasonalOptimization: { impact: 0.06, volatility: 0.2 }
  },
  
  // Technology and efficiency
  operationalEfficiency: {
    technologyUpgrades: { impact: 0.12, volatility: 0.25 },
    staffProductivity: { impact: 0.08, volatility: 0.2 },
    processOptimization: { impact: 0.06, volatility: 0.15 },
    costReduction: { impact: 0.05, volatility: 0.1 }
  },
  
  // Industry trends
  industryTrends: {
    preventativeTrend: { impact: 0.20, volatility: 0.3 }, // Younger demographic adoption
    maleMarketGrowth: { impact: 0.25, volatility: 0.4 }, // Expanding male clientele
    wellnessTrend: { impact: 0.15, volatility: 0.25 }, // Holistic wellness
    telemedIntegration: { impact: 0.10, volatility: 0.35 }
  }
};

// Growth scenario modeling
function generateGrowthScenarios(baseParams) {
  const scenarios = {
    conservative: {
      name: "Conservative Growth",
      description: "Minimal market expansion, steady operations",
      assumptions: {
        patientGrowth: 0.05,      // 5% annual patient growth
        pricingGrowth: 0.02,      // 2% pricing increases
        serviceExpansion: 0.02,   // Limited new services
        marketExpansion: 0.01,    // Minimal geographic growth
        efficiency: 0.01          // Small efficiency gains
      },
      riskFactors: ["Economic downturn", "Increased competition", "Regulatory changes"]
    },
    
    base: {
      name: "Base Case Growth",
      description: "Steady growth following industry averages",
      assumptions: {
        patientGrowth: 0.08,      // 8% annual patient growth
        pricingGrowth: 0.04,      // 4% pricing increases
        serviceExpansion: 0.06,   // Moderate service expansion
        marketExpansion: 0.04,    // Some geographic growth
        efficiency: 0.03          // Moderate efficiency gains
      },
      riskFactors: ["Market saturation", "Staff turnover", "Technology obsolescence"]
    },
    
    aggressive: {
      name: "Aggressive Growth",
      description: "High-growth expansion strategy",
      assumptions: {
        patientGrowth: 0.15,      // 15% annual patient growth
        pricingGrowth: 0.06,      // 6% pricing increases
        serviceExpansion: 0.12,   // Significant service expansion
        marketExpansion: 0.10,    // Active geographic expansion
        efficiency: 0.06          // Strong efficiency improvements
      },
      riskFactors: ["Execution risk", "Capital requirements", "Market acceptance"]
    },
    
    hypergrowth: {
      name: "Hyper-Growth",
      description: "Maximum growth potential (top 10% performers)",
      assumptions: {
        patientGrowth: 0.25,      // 25% annual patient growth
        pricingGrowth: 0.08,      // 8% pricing increases
        serviceExpansion: 0.20,   // Major service innovation
        marketExpansion: 0.18,    // Rapid geographic expansion
        efficiency: 0.10          // Technology-driven efficiency
      },
      riskFactors: ["High execution risk", "Significant capital needs", "Market disruption"]
    }
  };
  
  return scenarios;
}

// Multi-dimensional sensitivity analysis
function runGrowthSensitivityAnalysis(baseParams, scenarios) {
  console.log("🎯 GROWTH SCENARIO ANALYSIS");
  console.log("-".repeat(60));
  
  const results = {};
  const baseEV = calculateEnterpriseValue(baseParams);
  
  Object.entries(scenarios).forEach(([scenarioKey, scenario]) => {
    console.log(`\\n📊 ${scenario.name.toUpperCase()}`);
    console.log(`Description: ${scenario.description}`);
    
    // Calculate adjusted parameters
    const adjustedParams = applyGrowthScenario(baseParams, scenario);
    const scenarioEV = calculateEnterpriseValue(adjustedParams);
    
    const evChange = ((scenarioEV - baseEV) / baseEV) * 100;
    const impliedMultiple = scenarioEV / adjustedParams.exitEbitda;
    
    console.log(`Enterprise Value: ${formatCurrency(scenarioEV)}`);
    console.log(`EV Change vs Base: ${evChange > 0 ? '+' : ''}${evChange.toFixed(1)}%`);
    console.log(`Implied EBITDA Multiple: ${impliedMultiple.toFixed(2)}x`);
    
    // Growth driver breakdown
    console.log(`\\nGrowth Assumptions:`);
    Object.entries(scenario.assumptions).forEach(([driver, rate]) => {
      console.log(`  • ${driver}: ${(rate * 100).toFixed(1)}% annually`);
    });
    
    // Risk assessment
    console.log(`\\nKey Risk Factors:`);
    scenario.riskFactors.forEach(risk => {
      console.log(`  ⚠️ ${risk}`);
    });
    
    results[scenarioKey] = {
      scenario,
      enterpriseValue: scenarioEV,
      evChange,
      impliedMultiple,
      adjustedParams
    };
  });
  
  return results;
}

// Variable sensitivity grid analysis
function runVariableSensitivityGrid() {
  console.log("\\n\\n📈 VARIABLE SENSITIVITY GRID");
  console.log("-".repeat(60));
  
  // Key variables for medispa growth
  const variables = {
    patientGrowth: [0.02, 0.05, 0.08, 0.12, 0.18, 0.25],
    pricingPower: [0.01, 0.03, 0.04, 0.06, 0.08, 0.10],
    serviceExpansion: [0.00, 0.03, 0.06, 0.10, 0.15, 0.20],
    marketExpansion: [0.00, 0.02, 0.04, 0.08, 0.12, 0.18]
  };
  
  console.log("\\n🎯 PATIENT GROWTH vs PRICING POWER SENSITIVITY");
  console.log("Enterprise Value Impact (% change from base case)\\n");
  
  // Header row
  process.stdout.write("Patient Growth".padEnd(15));
  variables.pricingPower.forEach(price => {
    process.stdout.write(`${(price * 100).toFixed(0)}% Price`.padStart(10));
  });
  console.log("");
  
  variables.patientGrowth.forEach(patientRate => {
    process.stdout.write(`${(patientRate * 100).toFixed(0)}%`.padEnd(15));
    
    variables.pricingPower.forEach(priceRate => {
      const combinedGrowth = (1 + patientRate) * (1 + priceRate) - 1;
      const evImpact = calculateGrowthImpact(combinedGrowth);
      const impactStr = `${evImpact > 0 ? '+' : ''}${evImpact.toFixed(0)}%`;
      process.stdout.write(impactStr.padStart(10));
    });
    console.log("");
  });
  
  console.log("\\n🎯 SERVICE EXPANSION vs MARKET EXPANSION SENSITIVITY");
  console.log("EBITDA Multiple Impact\\n");
  
  // Header row
  process.stdout.write("Service Expand".padEnd(15));
  variables.marketExpansion.forEach(market => {
    process.stdout.write(`${(market * 100).toFixed(0)}% Mkt`.padStart(10));
  });
  console.log("");
  
  variables.serviceExpansion.forEach(serviceRate => {
    process.stdout.write(`${(serviceRate * 100).toFixed(0)}%`.padEnd(15));
    
    variables.marketExpansion.forEach(marketRate => {
      const combinedExpansion = serviceRate + marketRate;
      const multipleImpact = 8.2 + (combinedExpansion * 15); // Base multiple + expansion premium
      process.stdout.write(`${multipleImpact.toFixed(1)}x`.padStart(10));
    });
    console.log("");
  });
}

// Growth driver correlation analysis
function analyzeGrowthDriverCorrelations() {
  console.log("\\n\\n🔗 GROWTH DRIVER CORRELATION ANALYSIS");
  console.log("-".repeat(60));
  
  const correlations = {
    "Patient Growth ↔ Service Expansion": { correlation: 0.75, relationship: "Strong positive - new services drive patient acquisition" },
    "Pricing Power ↔ Market Position": { correlation: 0.65, relationship: "Strong positive - premium positioning enables pricing" },
    "Geographic Expansion ↔ Efficiency": { correlation: -0.45, relationship: "Moderate negative - expansion can reduce efficiency short-term" },
    "Technology Investment ↔ Margins": { correlation: 0.55, relationship: "Moderate positive - tech improves margins over time" },
    "Male Market Growth ↔ Service Mix": { correlation: 0.70, relationship: "Strong positive - male patients drive specific services" },
    "Social Media ↔ Patient Growth": { correlation: 0.80, relationship: "Very strong positive - critical for medispa growth" }
  };
  
  console.log("Key Growth Driver Relationships:");
  Object.entries(correlations).forEach(([relationship, data]) => {
    const strength = data.correlation > 0.7 ? "🔴 Very Strong" :
                    data.correlation > 0.5 ? "🟠 Strong" :
                    data.correlation > 0.3 ? "🟡 Moderate" : "🟢 Weak";
    
    console.log(`\\n${relationship}`);
    console.log(`  Correlation: ${data.correlation.toFixed(2)} (${strength})`);
    console.log(`  Insight: ${data.relationship}`);
  });
}

// Industry-specific growth considerations
function medispaGrowthConsiderations() {
  console.log("\\n\\n🏥 MEDISPA INDUSTRY GROWTH CONSIDERATIONS");
  console.log("-".repeat(60));
  
  const considerations = {
    "Demographic Shifts": {
      impact: "High",
      timeframe: "2-5 years",
      details: [
        "Male market growing 15-20% annually",
        "Gen Z adoption accelerating (18-25 age group)",
        "Preventative treatments trending younger",
        "Geographic expansion to suburban markets"
      ]
    },
    
    "Technology Disruption": {
      impact: "Very High",
      timeframe: "1-3 years", 
      details: [
        "AI-powered treatment customization",
        "Non-invasive technology advances",
        "Telemedicine integration",
        "Virtual consultation platforms"
      ]
    },
    
    "Market Maturation": {
      impact: "Medium",
      timeframe: "3-7 years",
      details: [
        "Premium market saturation in Tier 1 cities",
        "Consolidation pressure on independent practices",
        "Franchise model expansion",
        "Insurance coverage evolution"
      ]
    },
    
    "Regulatory Evolution": {
      impact: "Medium-High",
      timeframe: "1-5 years",
      details: [
        "FDA oversight changes",
        "State licensing requirements",
        "Training and certification standards",
        "Consumer protection regulations"
      ]
    }
  };
  
  Object.entries(considerations).forEach(([factor, data]) => {
    console.log(`\\n🎯 ${factor.toUpperCase()}`);
    console.log(`Impact Level: ${data.impact} | Timeframe: ${data.timeframe}`);
    data.details.forEach(detail => {
      console.log(`  • ${detail}`);
    });
  });
}

// Monte Carlo simulation for growth uncertainty
function runMonteCarloGrowthSimulation(iterations = 1000) {
  console.log("\\n\\n🎲 MONTE CARLO GROWTH SIMULATION");
  console.log("-".repeat(60));
  console.log(`Running ${iterations} iterations to model growth uncertainty...`);
  
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    // Generate random growth variables within realistic ranges
    const randomGrowth = {
      patientGrowth: normalRandom(0.08, 0.05), // Mean 8%, std dev 5%
      pricingGrowth: normalRandom(0.04, 0.02), // Mean 4%, std dev 2%
      serviceExpansion: normalRandom(0.06, 0.04), // Mean 6%, std dev 4%
      marketExpansion: normalRandom(0.04, 0.03), // Mean 4%, std dev 3%
      efficiency: normalRandom(0.03, 0.02) // Mean 3%, std dev 2%
    };
    
    // Calculate enterprise value for this iteration
    const ev = calculateGrowthScenarioEV(randomGrowth);
    results.push(ev);
  }
  
  // Statistical analysis
  results.sort((a, b) => a - b);
  const p10 = results[Math.floor(iterations * 0.10)];
  const p25 = results[Math.floor(iterations * 0.25)];
  const p50 = results[Math.floor(iterations * 0.50)];
  const p75 = results[Math.floor(iterations * 0.75)];
  const p90 = results[Math.floor(iterations * 0.90)];
  const mean = results.reduce((a, b) => a + b) / results.length;
  
  console.log("\\n📊 GROWTH UNCERTAINTY DISTRIBUTION:");
  console.log(`P10 (Worst 10%):     ${formatCurrency(p10)}`);
  console.log(`P25 (Lower Quartile): ${formatCurrency(p25)}`);
  console.log(`P50 (Median):        ${formatCurrency(p50)}`);
  console.log(`P75 (Upper Quartile): ${formatCurrency(p75)}`);
  console.log(`P90 (Best 10%):      ${formatCurrency(p90)}`);
  console.log(`Mean:                ${formatCurrency(mean)}`);
  
  console.log("\\n🎯 RISK ASSESSMENT:");
  const downside = ((p25 - p50) / p50) * 100;
  const upside = ((p75 - p50) / p50) * 100;
  console.log(`Downside Risk (P25): ${downside.toFixed(1)}%`);
  console.log(`Upside Potential (P75): +${upside.toFixed(1)}%`);
  console.log(`Value at Risk (P10): ${formatCurrency(p50 - p10)} (${(((p50 - p10) / p50) * 100).toFixed(1)}%)`);
}

// Helper functions
function applyGrowthScenario(baseParams, scenario) {
  const adjusted = JSON.parse(JSON.stringify(baseParams));
  
  // Apply growth assumptions to parameters
  adjusted.growth = {
    newPatients: scenario.assumptions.patientGrowth,
    pricing: scenario.assumptions.pricingGrowth,
    frequency: scenario.assumptions.serviceExpansion * 0.5,
    churnImprovement: -(scenario.assumptions.efficiency * 0.3)
  };
  
  // Adjust exit multiple based on growth profile
  const growthPremium = (scenario.assumptions.patientGrowth + 
                        scenario.assumptions.serviceExpansion + 
                        scenario.assumptions.marketExpansion) * 2;
  adjusted.exit.exitMultipleEBITDA = 8.2 + growthPremium;
  
  return adjusted;
}

function calculateEnterpriseValue(params) {
  // Simplified EV calculation for sensitivity analysis
  const baseRevenue = Object.values(params.baseYearRevenueBreakdown).reduce((a, b) => a + b, 0);
  const projectedRevenue = baseRevenue * Math.pow(1.08, 5); // 5-year projection
  const exitEbitda = projectedRevenue * 0.25; // 25% margin
  return exitEbitda * (params.exit?.exitMultipleEBITDA || 8.2);
}

function calculateGrowthImpact(growthRate) {
  // Simplified growth impact calculation
  return growthRate * 300; // 1% growth = ~3% EV impact
}

function calculateGrowthScenarioEV(growthParams) {
  // Simplified EV calculation for Monte Carlo
  const baseEV = 8000000;
  const totalGrowthImpact = Object.values(growthParams).reduce((a, b) => a + b, 0);
  return baseEV * (1 + totalGrowthImpact * 5); // 5-year compound impact
}

function normalRandom(mean, stdDev) {
  // Box-Muller transformation for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Main execution function
function runComprehensiveGrowthAnalysis() {
  console.log("🚀 COMPREHENSIVE MEDISPA GROWTH SENSITIVITY ANALYSIS");
  console.log("Analyzing growth considerations critical to medispa industry success");
  console.log("=".repeat(80));
  
  // Base parameters for analysis
  const baseParams = {
    baseYearRevenueBreakdown: {
      injectables: 2000000,
      lasers: 600000,
      skincare: 400000,
      memberships: 300000,
      retail: 200000
    },
    exit: {
      exitMultipleEBITDA: 8.2
    }
  };
  
  // Run all analyses
  const scenarios = generateGrowthScenarios(baseParams);
  const scenarioResults = runGrowthSensitivityAnalysis(baseParams, scenarios);
  
  runVariableSensitivityGrid();
  analyzeGrowthDriverCorrelations();
  medispaGrowthConsiderations();
  runMonteCarloGrowthSimulation(1000);
  
  console.log("\\n" + "=".repeat(80));
  console.log("🎯 GROWTH SENSITIVITY ANALYSIS COMPLETE");
  console.log("Critical insights for medispa industry growth planning delivered");
  console.log("=".repeat(80));
  
  return {
    scenarios: scenarioResults,
    growthDrivers: MEDISPA_GROWTH_DRIVERS
  };
}

// Execute analysis
if (require.main === module) {
  runComprehensiveGrowthAnalysis();
}

module.exports = {
  runComprehensiveGrowthAnalysis,
  generateGrowthScenarios,
  runGrowthSensitivityAnalysis,
  MEDISPA_GROWTH_DRIVERS
};