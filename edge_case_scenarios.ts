// COMPREHENSIVE EDGE CASE HANDLING - PHASE 2
// Scenario-based risk modeling for real-world disruptions

type EdgeCaseScenario = {
  id: string;
  name: string;
  description: string;
  category: "pandemic" | "regulatory" | "competitive" | "economic" | "operational" | "technology";
  severity: "mild" | "moderate" | "severe" | "catastrophic";
  probability: number; // Annual probability (0-1)
  duration: number; // Impact duration in months
  adjustments: {
    revenueImpact?: number[]; // Year-by-year revenue multipliers
    costImpact?: number[]; // Year-by-year cost multipliers
    churnRateIncrease?: number; // Additional churn rate
    newPatientReduction?: number; // Reduction in new patient acquisition
    capexIncrease?: number; // Additional capex requirements
    discountRateIncrease?: number; // Risk premium addition to WACC
    multipleReduction?: number; // Exit multiple haircut
    recoveryProfile?: "immediate" | "linear" | "exponential" | "permanent";
  };
  mitigationFactors?: {
    insuranceCoverage?: number; // 0-1, portion covered by insurance
    governmentSupport?: number; // Expected government aid
    operationalFlex?: number; // Cost reduction capability
  };
};

const EDGE_CASE_SCENARIOS: EdgeCaseScenario[] = [
  {
    id: "covid_style_pandemic",
    name: "Pandemic Closure (COVID-19 Style)",
    description: "Government-mandated closure of non-essential services for 3-6 months",
    category: "pandemic",
    severity: "severe",
    probability: 0.02, // 2% annual probability
    duration: 18,
    adjustments: {
      revenueImpact: [0.25, 0.65, 0.90, 1.0, 1.0], // 75% loss Y1, recovery by Y3
      costImpact: [0.85, 0.95, 1.0, 1.0, 1.0], // Fixed costs continue
      churnRateIncrease: 0.15, // 15% additional churn
      newPatientReduction: 0.40, // 40% reduction in new patients
      discountRateIncrease: 0.02, // 200bp risk premium
      multipleReduction: 0.15, // 15% multiple haircut
      recoveryProfile: "exponential"
    },
    mitigationFactors: {
      insuranceCoverage: 0.30,
      governmentSupport: 0.15,
      operationalFlex: 0.60
    }
  },
  {
    id: "key_injector_departure",
    name: "Star Injector Departure",
    description: "Lead aesthetic provider with significant patient following leaves practice",
    category: "operational",
    severity: "moderate",
    probability: 0.08, // 8% annual probability
    duration: 12,
    adjustments: {
      revenueImpact: [0.75, 0.85, 0.95, 1.0, 1.0], // Gradual recovery
      churnRateIncrease: 0.20, // 20% of patients follow injector
      newPatientReduction: 0.30, // Reduced referrals
      capexIncrease: 75000, // Recruitment and training costs
      recoveryProfile: "linear"
    },
    mitigationFactors: {
      operationalFlex: 0.40
    }
  },
  {
    id: "fda_botox_restriction",
    name: "FDA Botox/Filler Restrictions",
    description: "FDA implements stricter regulations on cosmetic injectables",
    category: "regulatory",
    severity: "moderate",
    probability: 0.05, // 5% annual probability
    duration: 60, // Long-term impact
    adjustments: {
      revenueImpact: [0.85, 0.88, 0.90, 0.90, 0.90], // Permanent 10-15% reduction
      costImpact: [1.15, 1.10, 1.05, 1.05, 1.05], // Compliance costs
      multipleReduction: 0.10, // Regulatory risk discount
      recoveryProfile: "permanent"
    }
  },
  {
    id: "economic_recession",
    name: "Economic Recession",
    description: "Severe economic downturn reducing discretionary spending",
    category: "economic",
    severity: "moderate",
    probability: 0.15, // 15% annual probability
    duration: 24,
    adjustments: {
      revenueImpact: [0.70, 0.75, 0.85, 0.95, 1.0], // Gradual recovery
      churnRateIncrease: 0.10, // Budget-conscious patients leave
      newPatientReduction: 0.35, // Reduced new customer acquisition
      discountRateIncrease: 0.015, // 150bp recession risk premium
      multipleReduction: 0.08, // Economic uncertainty discount
      recoveryProfile: "linear"
    }
  },
  {
    id: "major_competitor_entry",
    name: "Major Chain Competitor Entry",
    description: "Large national chain opens competing location in market",
    category: "competitive",
    severity: "mild",
    probability: 0.12, // 12% annual probability
    duration: 36,
    adjustments: {
      revenueImpact: [0.85, 0.88, 0.92, 0.95, 0.98], // Gradual market adjustment
      churnRateIncrease: 0.08, // Some patients switch
      newPatientReduction: 0.25, // Reduced market share of new patients
      costImpact: [1.05, 1.03, 1.02, 1.01, 1.0], // Marketing response costs
      recoveryProfile: "exponential"
    }
  },
  {
    id: "technology_disruption",
    name: "Equipment Obsolescence",
    description: "New technology makes current equipment obsolete",
    category: "technology",
    severity: "moderate",
    probability: 0.06, // 6% annual probability
    duration: 12,
    adjustments: {
      revenueImpact: [0.90, 0.95, 1.0, 1.0, 1.0], // Short-term impact
      capexIncrease: 500000, // Major equipment upgrade
      recoveryProfile: "immediate"
    }
  },
  {
    id: "malpractice_lawsuit",
    name: "Significant Malpractice Event",
    description: "Major malpractice lawsuit affecting reputation and operations",
    category: "operational",
    severity: "severe",
    probability: 0.03, // 3% annual probability
    duration: 24,
    adjustments: {
      revenueImpact: [0.60, 0.75, 0.90, 0.95, 1.0], // Reputation recovery
      churnRateIncrease: 0.25, // Patient confidence loss
      newPatientReduction: 0.50, // Referral impact
      costImpact: [1.20, 1.10, 1.05, 1.02, 1.0], // Legal and insurance costs
      discountRateIncrease: 0.025, // Litigation risk premium
      multipleReduction: 0.20, // Reputation discount
      recoveryProfile: "exponential"
    },
    mitigationFactors: {
      insuranceCoverage: 0.80,
      operationalFlex: 0.30
    }
  },
  {
    id: "state_licensing_change",
    name: "State Licensing Requirements Change", 
    description: "State implements stricter licensing for aesthetic procedures",
    category: "regulatory",
    severity: "mild",
    probability: 0.10, // 10% annual probability
    duration: 6,
    adjustments: {
      costImpact: [1.08, 1.05, 1.02, 1.0, 1.0], // Training and compliance costs
      capexIncrease: 25000, // Compliance infrastructure
      recoveryProfile: "immediate"
    }
  }
];

function applyEdgeCaseScenario(
  baseParams: ModelParams,
  scenarioId: string,
  severityMultiplier: number = 1.0
): { adjustedParams: ModelParams; scenarioDetails: EdgeCaseScenario } {
  const scenario = EDGE_CASE_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  
  const adjustedParams = JSON.parse(JSON.stringify(baseParams)) as ModelParams;
  const adj = scenario.adjustments;
  
  // Apply revenue impacts
  if (adj.revenueImpact) {
    const totalBaseRevenue = Object.values(baseParams.baseYearRevenueBreakdown).reduce((a, b) => a + b, 0);
    adj.revenueImpact.forEach((multiplier, yearIndex) => {
      const effectiveMultiplier = 1 - ((1 - multiplier) * severityMultiplier);
      // In a full implementation, would modify projections year by year
      // For now, adjust base parameters as proxy
      if (yearIndex === 0) {
        Object.keys(adjustedParams.baseYearRevenueBreakdown).forEach(key => {
          (adjustedParams.baseYearRevenueBreakdown as any)[key] *= effectiveMultiplier;
        });
      }
    });
  }
  
  // Apply churn rate increases
  if (adj.churnRateIncrease) {
    adjustedParams.patients.churnRate = Math.min(0.8, 
      baseParams.patients.churnRate + (adj.churnRateIncrease * severityMultiplier)
    );
  }
  
  // Apply new patient reduction
  if (adj.newPatientReduction) {
    adjustedParams.patients.newPatientsPerYear *= (1 - (adj.newPatientReduction * severityMultiplier));
  }
  
  // Apply capex increases
  if (adj.capexIncrease) {
    adjustedParams.capex.growthCapexYear1 += (adj.capexIncrease * severityMultiplier);
  }
  
  // Apply discount rate increases
  if (adj.discountRateIncrease) {
    adjustedParams.discount.wacc += (adj.discountRateIncrease * severityMultiplier);
  }
  
  // Apply multiple reductions
  if (adj.multipleReduction) {
    adjustedParams.exit.exitMultipleEBITDA *= (1 - (adj.multipleReduction * severityMultiplier));
  }
  
  return { adjustedParams, scenarioDetails: scenario };
}

function runEdgeCaseAnalysis(
  baseParams: ModelParams,
  scenarioIds: string[]
): { 
  baseCase: DCFResult;
  scenarios: Array<{
    scenario: EdgeCaseScenario;
    result: DCFResult;
    impactAnalysis: {
      evImpact: number;
      evImpactPct: number;
      probabilityAdjustedImpact: number;
    };
  }>;
  summary: {
    expectedValueAtRisk: number;
    probabilityWeightedEV: number;
    worstCaseEV: number;
    bestCaseEV: number;
  };
} {
  // This would be the actual DCF computation function
  const computeProjections = (params: ModelParams): DCFResult => {
    // Placeholder - in real implementation would call actual function
    const baseEV = 8000000;
    const revenueMultiplier = Object.values(params.baseYearRevenueBreakdown).reduce((a, b) => a + b, 0) / 
                             Object.values(baseParams.baseYearRevenueBreakdown).reduce((a, b) => a + b, 0);
    
    return {
      enterpriseValue: baseEV * revenueMultiplier * params.exit.exitMultipleEBITDA / baseParams.exit.exitMultipleEBITDA,
      pvFcf: baseEV * 0.6,
      pvTerminal: baseEV * 0.4,
      terminalValue: baseEV * 0.4 * Math.pow(1.12, 5),
      exitYear: 5,
      exitEbitda: 1200000,
      years: [],
      summary: {
        year1Revenue: 3500000,
        year1Ebitda: 875000,
        ebitdaMarginY1: 0.25,
        revenueCAGR: 0.085,
        ebitdaExit: 1200000
      },
      unitEconomics: {
        ltv: 2850,
        ltvToCac: 8.1,
        paybackMonths: 4.8
      }
    } as DCFResult;
  };
  
  const baseCase = computeProjections(baseParams);
  const scenarios = scenarioIds.map(scenarioId => {
    const { adjustedParams, scenarioDetails } = applyEdgeCaseScenario(baseParams, scenarioId);
    const result = computeProjections(adjustedParams);
    
    const evImpact = result.enterpriseValue - baseCase.enterpriseValue;
    const evImpactPct = evImpact / baseCase.enterpriseValue;
    const probabilityAdjustedImpact = evImpact * scenarioDetails.probability;
    
    return {
      scenario: scenarioDetails,
      result,
      impactAnalysis: {
        evImpact,
        evImpactPct,
        probabilityAdjustedImpact
      }
    };
  });
  
  const expectedValueAtRisk = scenarios.reduce((sum, s) => sum + s.impactAnalysis.probabilityAdjustedImpact, 0);
  const probabilityWeightedEV = baseCase.enterpriseValue + expectedValueAtRisk;
  const worstCaseEV = Math.min(...scenarios.map(s => s.result.enterpriseValue));
  const bestCaseEV = baseCase.enterpriseValue; // Base case is best case
  
  return {
    baseCase,
    scenarios,
    summary: {
      expectedValueAtRisk,
      probabilityWeightedEV,
      worstCaseEV,
      bestCaseEV
    }
  };
}

export {
  EdgeCaseScenario,
  EDGE_CASE_SCENARIOS,
  applyEdgeCaseScenario,
  runEdgeCaseAnalysis
};