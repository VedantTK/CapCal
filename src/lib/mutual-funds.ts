export interface MutualFund {
  schemeCode: string;
  schemeName: string;
  nav: number;
  navDate: string;
  category: string;
  fundHouse: string;
  historicalCAGR?: {
    oneYear?: number;
    threeYear?: number;
    fiveYear?: number;
  };
}

export interface AMFIData {
  funds: MutualFund[];
  lastUpdated: string;
}

// Cache for AMFI data
let cachedAMFIData: AMFIData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function fetchAMFIData(): Promise<AMFIData> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedAMFIData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedAMFIData;
  }

  try {
    // In a real implementation, you would fetch from AMFI
    // For now, we'll use mock data that simulates the AMFI structure
    const mockData = generateMockAMFIData();
    
    cachedAMFIData = mockData;
    lastFetchTime = now;
    
    return mockData;
  } catch (error) {
    console.error('Failed to fetch AMFI data:', error);
    
    // Return cached data if available, otherwise return empty data
    if (cachedAMFIData) {
      return cachedAMFIData;
    }
    
    return {
      funds: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

function generateMockAMFIData(): AMFIData {
  const mockFunds: MutualFund[] = [
    {
      schemeCode: "120503",
      schemeName: "SBI Bluechip Fund - Direct Plan - Growth",
      nav: 68.45,
      navDate: "2024-01-15",
      category: "Large Cap",
      fundHouse: "SBI Mutual Fund",
      historicalCAGR: { oneYear: 18.5, threeYear: 15.2, fiveYear: 12.8 }
    },
    {
      schemeCode: "120505",
      schemeName: "HDFC Top 100 Fund - Direct Plan - Growth",
      nav: 845.32,
      navDate: "2024-01-15",
      category: "Large Cap",
      fundHouse: "HDFC Mutual Fund",
      historicalCAGR: { oneYear: 16.8, threeYear: 14.5, fiveYear: 11.9 }
    },
    {
      schemeCode: "120507",
      schemeName: "ICICI Prudential Bluechip Fund - Direct Plan - Growth",
      nav: 112.67,
      navDate: "2024-01-15",
      category: "Large Cap",
      fundHouse: "ICICI Prudential Mutual Fund",
      historicalCAGR: { oneYear: 17.2, threeYear: 13.8, fiveYear: 12.1 }
    },
    {
      schemeCode: "120509",
      schemeName: "Axis Bluechip Fund - Direct Plan - Growth",
      nav: 78.91,
      navDate: "2024-01-15",
      category: "Large Cap",
      fundHouse: "Axis Mutual Fund",
      historicalCAGR: { oneYear: 19.1, threeYear: 16.3, fiveYear: 13.5 }
    },
    {
      schemeCode: "120511",
      schemeName: "Mirae Asset Large Cap Fund - Direct Plan - Growth",
      nav: 156.78,
      navDate: "2024-01-15",
      category: "Large Cap",
      fundHouse: "Mirae Asset Mutual Fund",
      historicalCAGR: { oneYear: 20.3, threeYear: 17.1, fiveYear: 14.2 }
    },
    {
      schemeCode: "120513",
      schemeName: "SBI Small Cap Fund - Direct Plan - Growth",
      nav: 234.56,
      navDate: "2024-01-15",
      category: "Small Cap",
      fundHouse: "SBI Mutual Fund",
      historicalCAGR: { oneYear: 25.8, threeYear: 22.4, fiveYear: 18.7 }
    },
    {
      schemeCode: "120515",
      schemeName: "HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth",
      nav: 189.43,
      navDate: "2024-01-15",
      category: "Mid Cap",
      fundHouse: "HDFC Mutual Fund",
      historicalCAGR: { oneYear: 22.1, threeYear: 19.6, fiveYear: 16.3 }
    },
    {
      schemeCode: "120517",
      schemeName: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
      nav: 98.76,
      navDate: "2024-01-15",
      category: "Flexi Cap",
      fundHouse: "Parag Parikh Mutual Fund",
      historicalCAGR: { oneYear: 21.5, threeYear: 18.9, fiveYear: 15.8 }
    },
    {
      schemeCode: "120519",
      schemeName: "Kotak Emerging Equity Fund - Direct Plan - Growth",
      nav: 167.89,
      navDate: "2024-01-15",
      category: "Mid Cap",
      fundHouse: "Kotak Mahindra Mutual Fund",
      historicalCAGR: { oneYear: 23.7, threeYear: 20.2, fiveYear: 17.1 }
    },
    {
      schemeCode: "120521",
      schemeName: "UTI Nifty 50 Index Fund - Direct Plan - Growth",
      nav: 45.32,
      navDate: "2024-01-15",
      category: "Index Fund",
      fundHouse: "UTI Mutual Fund",
      historicalCAGR: { oneYear: 15.8, threeYear: 13.2, fiveYear: 11.5 }
    }
  ];

  return {
    funds: mockFunds,
    lastUpdated: new Date().toISOString()
  };
}

export function searchMutualFunds(funds: MutualFund[], query: string): MutualFund[] {
  if (!query.trim()) return funds;
  
  const searchTerm = query.toLowerCase();
  return funds.filter(fund => 
    fund.schemeName.toLowerCase().includes(searchTerm) ||
    fund.fundHouse.toLowerCase().includes(searchTerm) ||
    fund.category.toLowerCase().includes(searchTerm)
  );
}

export function getDefaultExpectedReturn(fund: MutualFund): number {
  // Use 3-year CAGR as default, fallback to 5-year, then 1-year, then 12%
  return fund.historicalCAGR?.threeYear || 
         fund.historicalCAGR?.fiveYear || 
         fund.historicalCAGR?.oneYear || 
         12;
}

export function formatCurrency(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function calculateSIP(
  monthlyAmount: number, 
  annualReturn: number, 
  years: number
): { totalInvested: number; futureValue: number; gain: number } {
  const monthlyReturn = annualReturn / 100 / 12;
  const months = years * 12;
  
  const futureValue = monthlyAmount * 
    ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
  const totalInvested = monthlyAmount * months;
  const gain = futureValue - totalInvested;
  
  return { totalInvested, futureValue, gain };
}

export function calculateStepUpSIP(
  initialAmount: number,
  stepUpPercentage: number,
  annualReturn: number,
  years: number
): { totalInvested: number; finalCorpus: number; gain: number } {
  let totalInvested = 0;
  let futureValue = 0;
  let currentSIP = initialAmount;
  const monthlyReturn = annualReturn / 100 / 12;
  const stepUpRate = stepUpPercentage / 100;

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      futureValue = (futureValue + currentSIP) * (1 + monthlyReturn);
      totalInvested += currentSIP;
    }
    currentSIP *= (1 + stepUpRate);
  }

  const gain = futureValue - totalInvested;
  return { totalInvested, finalCorpus: futureValue, gain };
}

export function calculateSWP(
  initialAmount: number,
  monthlyWithdrawal: number,
  annualReturn: number,
  years: number
): { totalWithdrawn: number; remainingBalance: number; monthlyData: Array<{month: number, balance: number, withdrawn: number}> } {
  let balance = initialAmount;
  let totalWithdrawn = 0;
  const monthlyReturn = annualReturn / 100 / 12;
  const months = years * 12;
  const monthlyData: Array<{month: number, balance: number, withdrawn: number}> = [];

  for (let month = 1; month <= months; month++) {
    if (balance <= 0) break;

    const withdrawalThisMonth = Math.min(balance, monthlyWithdrawal);
    balance -= withdrawalThisMonth;
    totalWithdrawn += withdrawalThisMonth;
    
    if (balance > 0) {
      balance *= (1 + monthlyReturn);
    }

    monthlyData.push({
      month,
      balance: Math.max(0, balance),
      withdrawn: withdrawalThisMonth
    });
  }

  return {
    totalWithdrawn,
    remainingBalance: Math.max(0, balance),
    monthlyData
  };
}