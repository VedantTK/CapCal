import type { LucideIcon } from 'lucide-react';

export interface CalculatorInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color?: string; // e.g., Tailwind color class like 'text-blue-500'
}
