// ENHANCED VALIDATION FOR PRODUCTION DEPLOYMENT
// Critical data validation and error handling improvements

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

type ValidationRule = {
  name: string;
  check: (data: FinancialReportInput) => { passed: boolean; message?: string; level: 'error' | 'warning' | 'suggestion' };
};

// Industry-specific benchmarks for medispas
const MEDISPA_BENCHMARKS = {
  grossMargin: { min: 0.55, max: 0.85, typical: 0.70 },
  ebitdaMargin: { min: 0.10, max: 0.35, typical: 0.20 },
  currentRatio: { min: 1.0, max: 4.0, typical: 2.0 },
  debtToEquity: { min: 0.0, max: 2.5, typical: 1.0 },
  revenuePerEmployee: { min: 150000, max: 400000, typical: 250000 },
  churnRate: { min: 0.15, max: 0.40, typical: 0.25 }
};

const VALIDATION_RULES: ValidationRule[] = [
  // Basic Data Integrity
  {
    name: "Positive Revenue",
    check: (data) => ({
      passed: !data.incomeStatement?.revenue || data.incomeStatement.revenue > 0,
      message: "Revenue must be positive",
      level: 'error'
    })
  },
  
  {
    name: "COGS vs Revenue",
    check: (data) => {
      const revenue = data.incomeStatement?.revenue;
      const cogs = data.incomeStatement?.costOfGoodsSold;
      if (!revenue || !cogs) return { passed: true, level: 'suggestion' as const };
      return {
        passed: cogs <= revenue,
        message: `COGS (${formatCurrency(cogs)}) cannot exceed Revenue (${formatCurrency(revenue)})`,
        level: 'error' as const
      };
    }
  },
  
  {
    name: "Balance Sheet Balance",
    check: (data) => {
      const assets = data.balanceSheet?.totalAssets;
      const liabilities = data.balanceSheet?.totalLiabilities;
      const equity = data.balanceSheet?.equity;
      
      if (!assets || !liabilities || !equity) return { passed: true, level: 'suggestion' as const };
      
      const imbalance = Math.abs(assets - (liabilities + equity));
      const tolerance = Math.max(1000, assets * 0.01); // 1% or $1K tolerance
      
      return {
        passed: imbalance <= tolerance,
        message: `Balance sheet imbalance: Assets=${formatCurrency(assets)}, Liab+Equity=${formatCurrency(liabilities + equity)}`,
        level: 'error' as const
      };
    }
  },
  
  // Industry Benchmarks
  {
    name: "Gross Margin Range",
    check: (data) => {
      const revenue = data.incomeStatement?.revenue;
      const cogs = data.incomeStatement?.costOfGoodsSold;
      if (!revenue || !cogs) return { passed: true, level: 'suggestion' as const };
      
      const grossMargin = (revenue - cogs) / revenue;
      const benchmark = MEDISPA_BENCHMARKS.grossMargin;
      
      if (grossMargin < benchmark.min) {
        return {
          passed: false,
          message: `Gross margin ${formatPercent(grossMargin)} below industry minimum ${formatPercent(benchmark.min)}`,
          level: 'warning' as const
        };
      }
      
      if (grossMargin > benchmark.max) {
        return {
          passed: false,
          message: `Gross margin ${formatPercent(grossMargin)} above industry maximum ${formatPercent(benchmark.max)} - verify data accuracy`,
          level: 'warning' as const
        };
      }
      
      return { passed: true, level: 'suggestion' as const };
    }
  },
  
  {
    name: "EBITDA Margin Reasonableness",
    check: (data) => {
      const revenue = data.incomeStatement?.revenue;
      const ebitda = data.incomeStatement?.ebitda;
      if (!revenue || !ebitda) return { passed: true, level: 'suggestion' as const };
      
      const ebitdaMargin = ebitda / revenue;
      const benchmark = MEDISPA_BENCHMARKS.ebitdaMargin;
      
      if (ebitdaMargin < 0) {
        return {
          passed: false,
          message: "Negative EBITDA indicates operational challenges",
          level: 'warning' as const
        };
      }
      
      if (ebitdaMargin > benchmark.max) {
        return {
          passed: false,
          message: `EBITDA margin ${formatPercent(ebitdaMargin)} exceptionally high - verify calculations`,
          level: 'warning' as const
        };
      }
      
      return { passed: true, level: 'suggestion' as const };
    }
  },
  
  {
    name: "Current Ratio Analysis",
    check: (data) => {
      const currentAssets = data.balanceSheet?.currentAssets;
      const currentLiabilities = data.balanceSheet?.currentLiabilities;
      if (!currentAssets || !currentLiabilities) return { passed: true, level: 'suggestion' as const };
      
      const currentRatio = currentAssets / currentLiabilities;
      const benchmark = MEDISPA_BENCHMARKS.currentRatio;
      
      if (currentRatio < benchmark.min) {
        return {
          passed: false,
          message: `Current ratio ${currentRatio.toFixed(2)} indicates potential liquidity concerns`,
          level: 'warning' as const
        };
      }
      
      return { passed: true, level: 'suggestion' as const };
    }
  },
  
  // Data Completeness Suggestions
  {
    name: "Revenue Breakdown Available",
    check: (data) => {
      const hasRevenue = data.incomeStatement?.revenue;
      // In real implementation, would check for service line breakdown
      return {
        passed: !!hasRevenue,
        message: "Consider providing revenue breakdown by service line (injectables, lasers, skincare) for more accurate analysis",
        level: 'suggestion' as const
      };
    }
  }
];

function validateFinancialData(data: FinancialReportInput): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  for (const rule of VALIDATION_RULES) {
    const ruleResult = rule.check(data);
    
    if (!ruleResult.passed && ruleResult.message) {
      switch (ruleResult.level) {
        case 'error':
          result.errors.push(`❌ ${rule.name}: ${ruleResult.message}`);
          result.isValid = false;
          break;
        case 'warning':
          result.warnings.push(`⚠️ ${rule.name}: ${ruleResult.message}`);
          break;
        case 'suggestion':
          if (ruleResult.message) {
            result.suggestions.push(`💡 ${rule.name}: ${ruleResult.message}`);
          }
          break;
      }
    }
  }
  
  return result;
}

// Enhanced parsing with validation
function parseAndValidateFinancialData(rawData: string): {
  data: FinancialReportInput;
  validation: ValidationResult;
} {
  const data = parseFinancialData(rawData);
  const validation = validateFinancialData(data);
  
  return { data, validation };
}

// Audit trail implementation
type AuditEntry = {
  timestamp: Date;
  action: string;
  details: Record<string, any>;
  user?: string;
  sessionId: string;
};

class AuditTrail {
  private entries: AuditEntry[] = [];
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  log(action: string, details: Record<string, any>, user?: string) {
    this.entries.push({
      timestamp: new Date(),
      action,
      details,
      user,
      sessionId: this.sessionId
    });
  }
  
  getAuditLog(): AuditEntry[] {
    return [...this.entries];
  }
  
  exportAuditLog(): string {
    return JSON.stringify(this.entries, null, 2);
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Enhanced model with validation and audit trail
class ProductionValuationModel {
  private auditTrail: AuditTrail;
  private lastValidation?: ValidationResult;
  
  constructor() {
    this.auditTrail = new AuditTrail();
  }
  
  processFinancialData(rawData: string): {
    success: boolean;
    data?: FinancialReportInput;
    validation: ValidationResult;
    auditId: string;
  } {
    this.auditTrail.log('financial_data_input', { rawDataLength: rawData.length });
    
    const { data, validation } = parseAndValidateFinancialData(rawData);
    this.lastValidation = validation;
    
    this.auditTrail.log('validation_complete', {
      isValid: validation.isValid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    });
    
    if (!validation.isValid) {
      this.auditTrail.log('validation_failed', { errors: validation.errors });
      return {
        success: false,
        validation,
        auditId: this.auditTrail.getAuditLog().slice(-1)[0].sessionId
      };
    }
    
    return {
      success: true,
      data,
      validation,
      auditId: this.auditTrail.getAuditLog().slice(-1)[0].sessionId
    };
  }
  
  getValidationSummary(): string {
    if (!this.lastValidation) return "No validation performed yet.";
    
    const v = this.lastValidation;
    let summary = `Validation Status: ${v.isValid ? '✅ PASSED' : '❌ FAILED'}\n`;
    
    if (v.errors.length > 0) {
      summary += `\nERRORS (${v.errors.length}):\n${v.errors.join('\n')}\n`;
    }
    
    if (v.warnings.length > 0) {
      summary += `\nWARNINGS (${v.warnings.length}):\n${v.warnings.join('\n')}\n`;
    }
    
    if (v.suggestions.length > 0) {
      summary += `\nSUGGESTIONS (${v.suggestions.length}):\n${v.suggestions.join('\n')}\n`;
    }
    
    return summary;
  }
}

// Utility functions
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

export {
  ValidationResult,
  validateFinancialData,
  parseAndValidateFinancialData,
  ProductionValuationModel,
  AuditTrail,
  MEDISPA_BENCHMARKS
};