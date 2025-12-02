export interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expirationDate: string;
  location: string;
  barcode: string;
  binId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bin {
  id: string;
  name: string;
  category: string;
  maxCapacity: number;
  currentQuantity: number;
  items: Item[];
}

export type Category = 
  | 'Electronics'
  | 'Clothing'
  | 'Food'
  | 'Tools'
  | 'Raw Materials'
  | 'Packaging'
  | 'Chemicals'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Electronics',
  'Clothing',
  'Food',
  'Tools',
  'Raw Materials',
  'Packaging',
  'Chemicals',
  'Other',
];

export interface Alert {
  id: string;
  type: 'low-stock' | 'expiring' | 'expired';
  itemId: string;
  itemName: string;
  message: string;
  severity: 'warning' | 'critical';
  createdAt: string;
}

export interface DashboardStats {
  totalItems: number;
  totalBins: number;
  lowStockCount: number;
  expiringCount: number;
  categoryBreakdown: Record<string, number>;
}
