// REAL-TIME MARKET DATA INTEGRATION - PHASE 2
// Live market intelligence for valuation accuracy

type MarketDataSource = "fred" | "yahoo_finance" | "pitchbook" | "internal";

type RealTimeMarketData = {
  lastUpdated: Date;
  riskFreeRate: {
    value: number;
    source: MarketDataSource;
    asOf: Date;
  };
  marketRiskPremium: {
    value: number;
    source: MarketDataSource;
    asOf: Date;
  };
  industryMultiples: {
    medispa: {
      ebitdaMultiple: number;
      revenueMultiple: number;
      sampleSize: number;
    };
    healthcare: {
      ebitdaMultiple: number;
      revenueMultiple: number;
    };
    asOf: Date;
  };
  economicIndicators: {
    unemployment: number;
    consumerConfidence: number;
    disposableIncome: number;
    inflationRate: number;
    asOf: Date;
  };
  transactionActivity: {
    medispaDeals: {
      count: number;
      avgMultiple: number;
      medianMultiple: number;
      totalValue: number;
    };
    lastQuarter: Date;
  };
};

// Simulated real-time data (in production, would connect to actual APIs)
class RealTimeMarketDataService {
  private static instance: RealTimeMarketDataService;
  private currentData: RealTimeMarketData;
  private lastUpdate: Date;
  private updateInterval: number = 3600000; // 1 hour in milliseconds
  
  private constructor() {
    this.currentData = this.generateMockData();
    this.lastUpdate = new Date();
    this.startAutoUpdate();
  }
  
  static getInstance(): RealTimeMarketDataService {
    if (!RealTimeMarketDataService.instance) {
      RealTimeMarketDataService.instance = new RealTimeMarketDataService();
    }
    return RealTimeMarketDataService.instance;
  }
  
  private generateMockData(): RealTimeMarketData {
    const now = new Date();
    
    // Simulate real market conditions with slight variations
    const baseRiskFree = 0.045;
    const variation = (Math.random() - 0.5) * 0.005; // ±0.25% variation
    
    return {
      lastUpdated: now,
      riskFreeRate: {
        value: Math.max(0.02, baseRiskFree + variation),
        source: "fred",
        asOf: now
      },
      marketRiskPremium: {
        value: 0.055 + (Math.random() - 0.5) * 0.01, // ±0.5% variation
        source: "internal",
        asOf: now
      },
      industryMultiples: {
        medispa: {
          ebitdaMultiple: 8.2 + (Math.random() - 0.5) * 0.8, // ±0.4x variation
          revenueMultiple: 2.4 + (Math.random() - 0.5) * 0.3,
          sampleSize: 23 + Math.floor(Math.random() * 10)
        },
        healthcare: {
          ebitdaMultiple: 12.5 + (Math.random() - 0.5) * 2.0,
          revenueMultiple: 3.8 + (Math.random() - 0.5) * 0.8
        },
        asOf: now
      },
      economicIndicators: {
        unemployment: 0.038 + (Math.random() - 0.5) * 0.01,
        consumerConfidence: 102 + (Math.random() - 0.5) * 10,
        disposableIncome: 48000 + (Math.random() - 0.5) * 2000,
        inflationRate: 0.032 + (Math.random() - 0.5) * 0.005,
        asOf: now
      },
      transactionActivity: {
        medispaDeals: {
          count: 8 + Math.floor(Math.random() * 6),
          avgMultiple: 8.6 + (Math.random() - 0.5) * 1.5,
          medianMultiple: 8.2 + (Math.random() - 0.5) * 1.2,
          totalValue: 125000000 + (Math.random() - 0.5) * 50000000
        },
        lastQuarter: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      }
    };
  }
  
  private startAutoUpdate(): void {
    setInterval(() => {
      this.updateData();
    }, this.updateInterval);
  }
  
  private updateData(): void {
    this.currentData = this.generateMockData();
    this.lastUpdate = new Date();
    console.log(`Market data updated at ${this.lastUpdate.toISOString()}`);
  }
  
  public getCurrentData(): RealTimeMarketData {
    return { ...this.currentData };
  }
  
  public getDataAge(): number {
    return Date.now() - this.lastUpdate.getTime();
  }
  
  public isDataStale(maxAgeMinutes: number = 60): boolean {
    return this.getDataAge() > (maxAgeMinutes * 60 * 1000);
  }
  
  public forceUpdate(): Promise<RealTimeMarketData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.updateData();
        resolve(this.getCurrentData());
      }, 100); // Simulate API call delay
    });
  }
}

// Real-time calibrated WACC calculation
function getRealTimeWACC(
  size: "small" | "medium" | "large",
  marketData?: RealTimeMarketData
): number {
  const data = marketData || RealTimeMarketDataService.getInstance().getCurrentData();
  
  // Base WACC from real-time risk-free rate and market risk premium
  const baseWACC = data.riskFreeRate.value + data.marketRiskPremium.value;
  
  // Size premium based on current market conditions
  let sizePremium = 0;
  switch (size) {
    case "small":
      sizePremium = 0.025 + (data.economicIndicators.unemployment > 0.05 ? 0.005 : 0);
      break;
    case "medium":
      sizePremium = 0.015;
      break;
    case "large":
      sizePremium = 0.005;
      break;
  }
  
  // Economic condition adjustment
  const economicAdjustment = data.economicIndicators.unemployment > 0.06 ? 0.01 : 
                            data.economicIndicators.consumerConfidence < 90 ? 0.005 : 0;
  
  return Math.max(0.08, Math.min(0.18, baseWACC + sizePremium + economicAdjustment));
}

// Real-time calibrated multiple calculation
function getRealTimeMarketMultiple(
  ebitda: number,
  marketData?: RealTimeMarketData
): number {
  const data = marketData || RealTimeMarketDataService.getInstance().getCurrentData();
  
  // Start with real-time industry multiple
  let baseMultiple = data.industryMultiples.medispa.ebitdaMultiple;
  
  // Adjust for transaction activity
  const transactionMultiple = data.transactionActivity.medispaDeals.medianMultiple;
  const activityWeight = Math.min(1.0, data.transactionActivity.medispaDeals.count / 10);
  baseMultiple = (baseMultiple * (1 - activityWeight)) + (transactionMultiple * activityWeight);
  
  // Economic environment adjustment
  const economicMultiplier = data.economicIndicators.consumerConfidence > 100 ? 1.05 :
                            data.economicIndicators.consumerConfidence < 85 ? 0.95 : 1.0;
  
  // Interest rate environment adjustment
  const rateAdjustment = data.riskFreeRate.value > 0.05 ? 0.90 : 
                        data.riskFreeRate.value < 0.03 ? 1.10 : 1.0;
  
  const finalMultiple = baseMultiple * economicMultiplier * rateAdjustment;
  
  return Math.max(6.0, Math.min(15.0, finalMultiple));
}

// Market condition assessment
function assessMarketConditions(marketData?: RealTimeMarketData): {
  overall: "excellent" | "good" | "neutral" | "poor" | "difficult";
  factors: {
    interestRates: "favorable" | "neutral" | "unfavorable";
    economicGrowth: "strong" | "moderate" | "weak";
    marketSentiment: "bullish" | "neutral" | "bearish";
    industryActivity: "high" | "moderate" | "low";
  };
  summary: string;
} {
  const data = marketData || RealTimeMarketDataService.getInstance().getCurrentData();
  
  // Interest rate assessment
  const interestRates = data.riskFreeRate.value < 0.04 ? "favorable" :
                       data.riskFreeRate.value > 0.06 ? "unfavorable" : "neutral";
  
  // Economic growth assessment
  const economicGrowth = data.economicIndicators.unemployment < 0.04 && 
                        data.economicIndicators.consumerConfidence > 105 ? "strong" :
                        data.economicIndicators.unemployment > 0.06 ? "weak" : "moderate";
  
  // Market sentiment assessment
  const marketSentiment = data.economicIndicators.consumerConfidence > 105 ? "bullish" :
                         data.economicIndicators.consumerConfidence < 90 ? "bearish" : "neutral";
  
  // Industry activity assessment
  const industryActivity = data.transactionActivity.medispaDeals.count > 12 ? "high" :
                          data.transactionActivity.medispaDeals.count < 6 ? "low" : "moderate";
  
  // Overall assessment
  const positiveFactors = [interestRates === "favorable", economicGrowth === "strong", 
                          marketSentiment === "bullish", industryActivity === "high"].filter(Boolean).length;
  const negativeFactors = [interestRates === "unfavorable", economicGrowth === "weak",
                          marketSentiment === "bearish", industryActivity === "low"].filter(Boolean).length;
  
  let overall: "excellent" | "good" | "neutral" | "poor" | "difficult";
  if (positiveFactors >= 3) overall = "excellent";
  else if (positiveFactors >= 2) overall = "good";
  else if (negativeFactors >= 3) overall = "difficult";
  else if (negativeFactors >= 2) overall = "poor";
  else overall = "neutral";
  
  const summary = `Market conditions are ${overall}. Interest rates are ${interestRates}, ` +
                 `economic growth is ${economicGrowth}, sentiment is ${marketSentiment}, ` +
                 `and industry M&A activity is ${industryActivity}.`;
  
  return {
    overall,
    factors: {
      interestRates,
      economicGrowth,
      marketSentiment,
      industryActivity
    },
    summary
  };
}

export {
  RealTimeMarketData,
  RealTimeMarketDataService,
  getRealTimeWACC,
  getRealTimeMarketMultiple,
  assessMarketConditions
};