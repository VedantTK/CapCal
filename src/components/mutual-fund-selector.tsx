"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Building2, Calendar, ArrowUpRight, Loader2, RefreshCw, Star } from 'lucide-react';
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
      case 'large cap': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'mid cap': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'small cap': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'flexi cap': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'index fund': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="premium-card">
        <CardHeader className="form-section-header">
          <div className="form-section-icon">
            <TrendingUp className="h-6 w-6 wealth-text" />
          </div>
          <div className="form-section-title">
            <CardTitle className="wealth-heading">Loading Mutual Funds</CardTitle>
            <CardDescription>Fetching latest NAV data from AMFI...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin wealth-text" />
            <div className="space-y-2">
              <p className="font-medium text-foreground">Loading fund data...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Selected Fund Display */}
      {selectedFund ? (
        <div className="wealth-card">
          <CardHeader className="form-section-header">
            <div className="form-section-icon">
              <Star className="h-6 w-6 wealth-text" />
            </div>
            <div className="form-section-title flex-1">
              <CardTitle className="wealth-heading">Selected Mutual Fund</CardTitle>
              <CardDescription>
                Using historical performance for expected returns calculation
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => onFundSelect(null)}
              className="btn-secondary"
            >
              Change Fund
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Fund Details */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <h4 className="text-xl font-bold text-foreground leading-tight">
                    {selectedFund.schemeName}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedFund.fundHouse}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedFund.navDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getCategoryColor(selectedFund.category)} border font-medium px-3 py-1`}>
                  {selectedFund.category}
                </Badge>
              </div>
              
              {/* NAV Information */}
              <div className="stats-card">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Current NAV</p>
                    <p className="text-2xl font-bold wealth-text">
                      {selectedCurrencySymbol}{selectedFund.nav.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">NAV Date</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(selectedFund.navDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Historical Returns */}
              {selectedFund.historicalCAGR && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-foreground">Historical Returns (CAGR)</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedFund.historicalCAGR.oneYear && (
                      <div className="metric-card text-center">
                        <p className="text-sm text-muted-foreground font-medium mb-2">1 Year</p>
                        <p className="text-2xl font-bold wealth-text">
                          {selectedFund.historicalCAGR.oneYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedFund.historicalCAGR.threeYear && (
                      <div className="metric-card text-center">
                        <p className="text-sm text-muted-foreground font-medium mb-2">3 Years</p>
                        <p className="text-2xl font-bold opportunity-text">
                          {selectedFund.historicalCAGR.threeYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedFund.historicalCAGR.fiveYear && (
                      <div className="metric-card text-center">
                        <p className="text-sm text-muted-foreground font-medium mb-2">5 Years</p>
                        <p className="text-2xl font-bold text-primary">
                          {selectedFund.historicalCAGR.fiveYear.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Expected Return Input */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground">
                  Expected Annual Return (%)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => onExpectedReturnChange(Number(e.target.value))}
                    className="enhanced-input flex-1"
                    step="0.1"
                    min="0"
                    max="50"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const defaultReturn = selectedFund.historicalCAGR?.threeYear || 12;
                      onExpectedReturnChange(defaultReturn);
                    }}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Use 3Y CAGR
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {selectedFund.historicalCAGR?.threeYear ? '3-year' : 'estimated'} historical performance
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      ) : (
        /* Fund Selection Interface */
        <div className="premium-card">
          <CardHeader className="form-section-header">
            <div className="form-section-icon">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="form-section-title flex-1">
              <CardTitle>Select Mutual Fund</CardTitle>
              <CardDescription>
                Choose a fund to use its historical returns as default expected return
              </CardDescription>
            </div>
            <Button
              variant="outline"
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
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search funds by name, fund house, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="enhanced-input pl-12"
              />
            </div>

            {/* Fund List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredFunds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No funds found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredFunds.slice(0, 20).map((fund) => (
                  <div
                    key={fund.schemeCode}
                    className="fund-card cursor-pointer p-6"
                    onClick={() => handleFundSelect(fund)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-3">
                          <h4 className="font-semibold text-foreground leading-tight text-base flex-1">
                            {fund.schemeName}
                          </h4>
                          <Badge className={`${getCategoryColor(fund.category)} border font-medium px-2 py-1 text-xs`}>
                            {fund.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{fund.fundHouse}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(fund.navDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {fund.historicalCAGR?.threeYear && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">3Y CAGR:</span>
                            <span className="text-base font-bold wealth-text">
                              {fund.historicalCAGR.threeYear.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right space-y-2 ml-4">
                        <p className="text-lg font-bold text-foreground">
                          {selectedCurrencySymbol}{fund.nav.toFixed(2)}
                        </p>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground ml-auto" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border/30">
                Data last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </CardContent>
        </div>
      )}
    </div>
  );
}