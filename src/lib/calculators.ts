
import type { CalculatorInfo } from '@/lib/types';
import { Scale, Activity, PiggyBank, Percent, Landmark, TrendingUp, WalletCards, GitFork } from 'lucide-react';

export const calculators: CalculatorInfo[] = [
  {
    id: 'stock-average',
    slug: 'stock-average',
    name: 'Stock Average Calculator',
    description: 'Calculate the average price of stocks purchased at different prices and quantities.',
    path: '/stock-average',
    icon: Scale,
    color: 'text-sky-500',
  },
  {
    id: 'stock-profit-loss',
    slug: 'stock-profit-loss',
    name: 'Stock Profit/Loss Calculator',
    description: 'Compute profit or loss from stock trades.',
    path: '/stock-profit-loss',
    icon: Activity,
    color: 'text-emerald-500',
  },
  {
    id: 'sip',
    slug: 'sip',
    name: 'SIP Calculator',
    description: 'Estimate returns on Systematic Investment Plans (SIPs).',
    path: '/sip',
    icon: PiggyBank,
    color: 'text-amber-500',
  },
  {
    id: 'percentage',
    slug: 'percentage',
    name: 'Percentage Calculator',
    description: 'Perform various percentage-based calculations.',
    path: '/percentage',
    icon: Percent,
    color: 'text-indigo-500',
  },
  {
    id: 'emi',
    slug: 'emi',
    name: 'EMI Calculator',
    description: 'Calculate Equated Monthly Installments (EMI) for loans.',
    path: '/emi',
    icon: Landmark,
    color: 'text-rose-500',
  },
  {
    id: 'cagr',
    slug: 'cagr',
    name: 'CAGR Calculator',
    description: 'Compute the Compound Annual Growth Rate for investments.',
    path: '/cagr',
    icon: TrendingUp,
    color: 'text-lime-500',
  },
  {
    id: 'swp',
    slug: 'swp',
    name: 'SWP Calculator',
    description: 'Calculate systematic withdrawal amounts and remaining balance.',
    path: '/swp',
    icon: WalletCards,
    color: 'text-cyan-500',
  },
  {
    id: 'stock-split',
    slug: 'stock-split',
    name: 'Stock Split Calculator',
    description: 'Determine the impact of stock splits on share quantity and price.',
    path: '/stock-split',
    icon: GitFork,
    color: 'text-purple-500',
  },
  // Removed AI Chart Suggester
];
