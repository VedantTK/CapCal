"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Building2, Calendar, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      case 'large cap': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'mid cap': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'small cap': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'flexi cap': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'index fund': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 wealth-text" />
            Loading Mutual Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin wealth-text" />
            <span className="text-muted-foreground">Fetching latest NAV data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Fund Display */}
      {selectedFund ? (
        <Card className="wealth-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 wealth-text" />
                  </div>
                  Selected Mutual Fund
                </CardTitle>
                <CardDescription>
                  Using historical performance for expected returns
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFundSelect(null)}
                className="btn-secondary"
              >
                Change Fund
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground leading-tight">
                    {selectedFund.schemeName}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{selectedFund.fundHouse}</span>
                  </div>
                </div>
                <Badge className={getCategoryColor(selectedFund.category)}>
                  {selectedFund.category}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current NAV</p>
                  <p className="text-lg font-semibold wealth-text">
                    {selectedCurrencySymbol}{selectedFund.nav.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">NAV Date</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedFund.navDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedFund.historicalCAGR && (
                <div className="space-y-3">
                  <h5 className="font-medium text-foreground">Historical Returns (CAGR)</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedFund.historicalCAGR.oneYear && (
                      <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                        <p className="text-xs text-muted-foreground">1 Year</p>
                        <p className="text-lg font-bold wealth-text">
                          {selectedFund.historicalCAGR.oneYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedFund.historicalCAGR.threeYear && (
                      <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                        <p className="text-xs text-muted-foreground">3 Years</p>
                        <p className="text-lg font-bold opportunity-text">
                          {selectedFund.historicalCAGR.threeYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedFund.historicalCAGR.fiveYear && (
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <p className="text-xs text-muted-foreground">5 Years</p>
                        <p className="text-lg font-bold text-primary">
                          {selectedFund.historicalCAGR.fiveYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Expected Return Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Expected Annual Return (%)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => onExpectedReturnChange(Number(e.target.value))}
                    className="focus-enhanced"
                    step="0.1"
                    min="0"
                    max="50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const defaultReturn = selectedFund.historicalCAGR?.threeYear || 12;
                      onExpectedReturnChange(defaultReturn);
                    }}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Use 3Y CAGR
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {selectedFund.historicalCAGR?.threeYear ? '3-year' : 'estimated'} historical performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Fund Selection Interface */
        <Card className="finance-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  Select Mutual Fund
                </CardTitle>
                <CardDescription>
                  Choose a fund to use its historical returns as default expected return
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadFunds(true)}
                disabled={isRefreshing}
                className="btn-secondary"
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
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funds by name, fund house, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus-enhanced"
              />
            </div>

            {/* Fund List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFunds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No funds found matching your search</p>
                </div>
              ) : (
                filteredFunds.slice(0, 20).map((fund) => (
                  <Card
                    key={fund.schemeCode}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border border-border/50 hover:border-primary/30"
                    onClick={() => handleFundSelect(fund)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-2">
                            <h4 className="font-medium text-foreground leading-tight text-sm">
                              {fund.schemeName}
                            </h4>
                            <Badge className={getCategoryColor(fund.category)} variant="secondary">
                              {fund.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span>{fund.fundHouse}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(fund.navDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {fund.historicalCAGR?.threeYear && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">3Y CAGR:</span>
                              <span className="text-sm font-semibold wealth-text">
                                {fund.historicalCAGR.threeYear.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {selectedCurrencySymbol}{fund.nav.toFixed(2)}
                          </p>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center">
                Data last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}