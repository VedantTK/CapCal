"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Building2, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchAMFIData, searchMutualFunds, type MutualFund } from '@/lib/mutual-funds';
import { useCurrency } from '@/contexts/currency-context';

interface MutualFundSelectorProps {
  selectedFund: MutualFund | null;
  onFundSelect: (fund: MutualFund | null) => void;
  onExpectedReturnChange: (returnRate: number) => void;
  expectedReturn: number;
}

export default function MutualFundSelector({
  selectedFund,
  onFundSelect,
  onExpectedReturnChange,
  expectedReturn
}: MutualFundSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allFunds, setAllFunds] = useState<MutualFund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { selectedCurrencySymbol } = useCurrency();

  const filteredFunds = useMemo(() => {
    return searchMutualFunds(allFunds, searchQuery);
  }, [allFunds, searchQuery]);

  const loadFunds = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const data = await fetchAMFIData();
      setAllFunds(data.funds);
      setLastUpdated(data.lastUpdated);
    } catch (error) {
      console.error('Failed to load mutual funds:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const handleFundSelect = (fund: MutualFund) => {
    onFundSelect(fund);
    const defaultReturn = fund.historicalCAGR?.threeYear || 
                         fund.historicalCAGR?.fiveYear || 
                         fund.historicalCAGR?.oneYear || 
                         12;
    onExpectedReturnChange(defaultReturn);
    setSearchQuery('');
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'large cap': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'mid cap': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'small cap': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'flexi cap': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'index fund': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Loading Mutual Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Fetching latest data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-simple">
      {/* Selected Fund Display */}
      {selectedFund ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Selected Fund</CardTitle>
                <CardDescription>Using historical performance for calculations</CardDescription>
              </div>
              <Button variant="outline" onClick={() => onFundSelect(null)}>
                Change Fund
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-simple">
            <div className="space-tight">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{selectedFund.schemeName}</h4>
                  <div className="flex items-center gap-4 text-small mt-2">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedFund.fundHouse}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedFund.navDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getCategoryColor(selectedFund.category)}>
                  {selectedFund.category}
                </Badge>
              </div>
              
              <div className="grid grid-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-small">Current NAV</p>
                  <p className="text-xl font-bold text-success">
                    {selectedCurrencySymbol}{selectedFund.nav.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-small">NAV Date</p>
                  <p className="font-medium">
                    {new Date(selectedFund.navDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedFund.historicalCAGR && (
                <div>
                  <h5 className="font-medium mb-3">Historical Returns (CAGR)</h5>
                  <div className="grid grid-3 gap-3">
                    {selectedFund.historicalCAGR.oneYear && (
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-small">1 Year</p>
                        <p className="text-lg font-bold text-success">
                          {selectedFund.historicalCAGR.oneYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedFund.historicalCAGR.threeYear && (
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-small">3 Years</p>
                        <p className="text-lg font-bold text-warning">
                          {selectedFund.historicalCAGR.threeYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedFund.historicalCAGR.fiveYear && (
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-small">5 Years</p>
                        <p className="text-lg font-bold text-primary">
                          {selectedFund.historicalCAGR.fiveYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Expected Annual Return (%)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => onExpectedReturnChange(Number(e.target.value))}
                    step="0.1"
                    min="0"
                    max="50"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const defaultReturn = selectedFund.historicalCAGR?.threeYear || 12;
                      onExpectedReturnChange(defaultReturn);
                    }}
                  >
                    Use 3Y
                  </Button>
                </div>
                <p className="form-description">
                  Based on historical performance data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Fund Selection Interface */
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Select Mutual Fund</CardTitle>
                <CardDescription>
                  Choose a fund to use its historical returns
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => loadFunds(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-simple">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredFunds.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>No funds found</p>
                </div>
              ) : (
                filteredFunds.slice(0, 20).map((fund) => (
                  <div
                    key={fund.schemeCode}
                    className="simple-card p-4 cursor-pointer"
                    onClick={() => handleFundSelect(fund)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start gap-2">
                          <h4 className="font-medium text-sm leading-tight flex-1">
                            {fund.schemeName}
                          </h4>
                          <Badge className={`${getCategoryColor(fund.category)} text-xs`}>
                            {fund.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{fund.fundHouse}</span>
                          <span>{new Date(fund.navDate).toLocaleDateString()}</span>
                        </div>
                        
                        {fund.historicalCAGR?.threeYear && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">3Y CAGR: </span>
                            <span className="font-medium text-success">
                              {fund.historicalCAGR.threeYear.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="font-medium">
                          {selectedCurrencySymbol}{fund.nav.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}