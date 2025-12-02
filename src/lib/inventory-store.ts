import { Item, Bin, Alert, DashboardStats, Category, CATEGORIES } from '@/types/inventory';

// In-memory storage (will be replaced with backend later)
class InventoryStore {
  private items: Map<string, Item> = new Map();
  private bins: Map<string, Bin> = new Map();
  private barcodeIndex: Map<string, string> = new Map(); // barcode -> itemId

  constructor() {
    this.initializeBins();
    this.seedData();
  }

  private initializeBins() {
    CATEGORIES.forEach((category, index) => {
      const binId = `bin-${category.toLowerCase().replace(/\s/g, '-')}-1`;
      this.bins.set(binId, {
        id: binId,
        name: `${category} Bin A`,
        category,
        maxCapacity: 100,
        currentQuantity: 0,
        items: [],
      });
    });
  }

  private seedData() {
    const sampleItems: Omit<Item, 'id' | 'binId' | 'createdAt' | 'updatedAt'>[] = [
      { name: 'Arduino Uno', category: 'Electronics', quantity: 25, expirationDate: '2026-12-31', location: 'Aisle A-1', barcode: 'ELE001' },
      { name: 'Raspberry Pi 4', category: 'Electronics', quantity: 8, expirationDate: '2026-06-15', location: 'Aisle A-1', barcode: 'ELE002' },
      { name: 'USB-C Cables', category: 'Electronics', quantity: 3, expirationDate: '2027-01-01', location: 'Aisle A-2', barcode: 'ELE003' },
      { name: 'Work Gloves (L)', category: 'Clothing', quantity: 50, expirationDate: '2025-08-20', location: 'Aisle B-1', barcode: 'CLO001' },
      { name: 'Safety Vests', category: 'Clothing', quantity: 15, expirationDate: '2026-03-10', location: 'Aisle B-2', barcode: 'CLO002' },
      { name: 'Canned Beans', category: 'Food', quantity: 200, expirationDate: '2025-12-15', location: 'Aisle C-1', barcode: 'FOO001' },
      { name: 'Protein Bars', category: 'Food', quantity: 5, expirationDate: '2025-12-10', location: 'Aisle C-2', barcode: 'FOO002' },
      { name: 'Power Drill', category: 'Tools', quantity: 12, expirationDate: '2030-01-01', location: 'Aisle D-1', barcode: 'TOO001' },
      { name: 'Screwdriver Set', category: 'Tools', quantity: 30, expirationDate: '2030-01-01', location: 'Aisle D-1', barcode: 'TOO002' },
      { name: 'Steel Sheets', category: 'Raw Materials', quantity: 45, expirationDate: '2030-01-01', location: 'Aisle E-1', barcode: 'RAW001' },
      { name: 'Cardboard Boxes', category: 'Packaging', quantity: 500, expirationDate: '2028-01-01', location: 'Aisle F-1', barcode: 'PAC001' },
      { name: 'Bubble Wrap', category: 'Packaging', quantity: 2, expirationDate: '2027-06-01', location: 'Aisle F-2', barcode: 'PAC002' },
    ];

    sampleItems.forEach(item => this.addItem(item));
  }

  generateId(): string {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  findOrCreateBin(category: string): Bin {
    // Find existing bin with space
    for (const bin of this.bins.values()) {
      if (bin.category === category && bin.currentQuantity < bin.maxCapacity) {
        return bin;
      }
    }

    // Create new bin
    const binCount = Array.from(this.bins.values()).filter(b => b.category === category).length;
    const binId = `bin-${category.toLowerCase().replace(/\s/g, '-')}-${binCount + 1}`;
    const newBin: Bin = {
      id: binId,
      name: `${category} Bin ${String.fromCharCode(65 + binCount)}`,
      category,
      maxCapacity: 100,
      currentQuantity: 0,
      items: [],
    };
    this.bins.set(binId, newBin);
    return newBin;
  }

  addItem(itemData: Omit<Item, 'id' | 'binId' | 'createdAt' | 'updatedAt'>): Item {
    const bin = this.findOrCreateBin(itemData.category);
    const id = this.generateId();
    const now = new Date().toISOString();

    const item: Item = {
      ...itemData,
      id,
      binId: bin.id,
      createdAt: now,
      updatedAt: now,
    };

    this.items.set(id, item);
    this.barcodeIndex.set(item.barcode, id);
    
    // Update bin
    bin.items.push(item);
    bin.currentQuantity += item.quantity;
    this.bins.set(bin.id, bin);

    return item;
  }

  getItemByBarcode(barcode: string): Item | undefined {
    const itemId = this.barcodeIndex.get(barcode);
    return itemId ? this.items.get(itemId) : undefined;
  }

  getItem(id: string): Item | undefined {
    return this.items.get(id);
  }

  getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  getAllBins(): Bin[] {
    return Array.from(this.bins.values());
  }

  deleteItem(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;

    // Update bin
    const bin = this.bins.get(item.binId);
    if (bin) {
      bin.items = bin.items.filter(i => i.id !== id);
      bin.currentQuantity -= item.quantity;
      
      // Auto-collapse empty bins (keep at least one per category)
      const categoryBins = Array.from(this.bins.values()).filter(b => b.category === bin.category);
      if (bin.items.length === 0 && categoryBins.length > 1) {
        this.bins.delete(bin.id);
      } else {
        this.bins.set(bin.id, bin);
      }
    }

    this.barcodeIndex.delete(item.barcode);
    this.items.delete(id);
    return true;
  }

  updateItem(id: string, updates: Partial<Item>): Item | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updatedItem: Item = {
      ...item,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, updatedItem);
    return updatedItem;
  }

  searchItems(filters: {
    category?: string;
    barcode?: string;
    expirationStart?: string;
    expirationEnd?: string;
    search?: string;
  }): Item[] {
    let results = Array.from(this.items.values());

    if (filters.category) {
      results = results.filter(i => i.category === filters.category);
    }

    if (filters.barcode) {
      results = results.filter(i => i.barcode.toLowerCase().includes(filters.barcode!.toLowerCase()));
    }

    if (filters.expirationStart) {
      results = results.filter(i => i.expirationDate >= filters.expirationStart!);
    }

    if (filters.expirationEnd) {
      results = results.filter(i => i.expirationDate <= filters.expirationEnd!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(i => 
        i.name.toLowerCase().includes(searchLower) ||
        i.barcode.toLowerCase().includes(searchLower) ||
        i.location.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }

  getAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.items.forEach(item => {
      // Low stock alert (< 10 items)
      if (item.quantity < 10) {
        alerts.push({
          id: `alert-low-${item.id}`,
          type: 'low-stock',
          itemId: item.id,
          itemName: item.name,
          message: `Low stock: Only ${item.quantity} units remaining`,
          severity: item.quantity < 5 ? 'critical' : 'warning',
          createdAt: new Date().toISOString(),
        });
      }

      // Expiration alert
      const expDate = new Date(item.expirationDate);
      if (expDate < now) {
        alerts.push({
          id: `alert-expired-${item.id}`,
          type: 'expired',
          itemId: item.id,
          itemName: item.name,
          message: `Item has expired on ${item.expirationDate}`,
          severity: 'critical',
          createdAt: new Date().toISOString(),
        });
      } else if (expDate < thirtyDaysFromNow) {
        alerts.push({
          id: `alert-expiring-${item.id}`,
          type: 'expiring',
          itemId: item.id,
          itemName: item.name,
          message: `Expiring on ${item.expirationDate}`,
          severity: 'warning',
          createdAt: new Date().toISOString(),
        });
      }
    });

    return alerts.sort((a, b) => 
      a.severity === 'critical' ? -1 : b.severity === 'critical' ? 1 : 0
    );
  }

  getStats(): DashboardStats {
    const items = Array.from(this.items.values());
    const categoryBreakdown: Record<string, number> = {};

    items.forEach(item => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.quantity;
    });

    const alerts = this.getAlerts();

    return {
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalBins: this.bins.size,
      lowStockCount: alerts.filter(a => a.type === 'low-stock').length,
      expiringCount: alerts.filter(a => a.type === 'expiring' || a.type === 'expired').length,
      categoryBreakdown,
    };
  }
}

export const inventoryStore = new InventoryStore();
