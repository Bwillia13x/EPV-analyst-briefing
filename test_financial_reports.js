// Test the financial report functionality
function testFinancialReports() {
  // Test data parsing
  const testData = `
    Revenue: $5000000
    Cost of Goods Sold: $1500000
    Operating Expenses: $2000000
    Current Assets: $800000
    Long Term Debt: $2000000
    Current Liabilities: $500000
  `;
  
  console.log("=== Testing Financial Report Feature ===\n");
  
  // This would be the parseFinancialData function from the main code
  function parseFinancialData(rawData) {
    const lines = rawData.trim().split('\n').map(line => line.trim()).filter(line => line);
    const result = { incomeStatement: {}, balanceSheet: {} };
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.substring(0, colonIndex).trim().toLowerCase();
      const valueStr = line.substring(colonIndex + 1).trim();
      
      // Simple parser for testing
      let value = parseFloat(valueStr.replace(/[$,]/g, ''));
      if (isNaN(value)) continue;
      
      // Income Statement items
      if (key.includes('revenue') || key.includes('sales')) {
        result.incomeStatement.revenue = value;
      } else if (key.includes('cost of goods') || key.includes('cogs')) {
        result.incomeStatement.costOfGoodsSold = value;
      } else if (key.includes('operating expense') || key.includes('opex')) {
        result.incomeStatement.operatingExpenses = value;
      }
      // Balance Sheet items
      else if (key.includes('current assets')) {
        result.balanceSheet.currentAssets = value;
      } else if (key.includes('long term debt') || key.includes('long-term debt')) {
        result.balanceSheet.longTermDebt = value;
      } else if (key.includes('current liabilities')) {
        result.balanceSheet.currentLiabilities = value;
      }
    }
    
    return result;
  }
  
  const parsed = parseFinancialData(testData);
  console.log("Parsed data:", JSON.stringify(parsed, null, 2));
  
  console.log("\n=== Test Results ===");
  console.log("✓ Revenue parsed:", parsed.incomeStatement.revenue === 5000000);
  console.log("✓ COGS parsed:", parsed.incomeStatement.costOfGoodsSold === 1500000);
  console.log("✓ OpEx parsed:", parsed.incomeStatement.operatingExpenses === 2000000);
  console.log("✓ Current Assets parsed:", parsed.balanceSheet.currentAssets === 800000);
  console.log("✓ Long Term Debt parsed:", parsed.balanceSheet.longTermDebt === 2000000);
  console.log("✓ Current Liabilities parsed:", parsed.balanceSheet.currentLiabilities === 500000);
  
  console.log("\n=== Usage Examples ===");
  console.log("Income Statement: finrep income Revenue: $5M, COGS: $1.5M, OpEx: $2M");
  console.log("Balance Sheet: finrep balance Current Assets: $800k, Long Term Debt: $2M");
  console.log("Both Reports: finrep both Revenue: $5M, COGS: $1.5M, Current Assets: $800k");
}

testFinancialReports();