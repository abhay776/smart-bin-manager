import { Item, Bin, Alert, DashboardStats, DEFAULT_CATEGORIES, CATEGORY_SUBTYPES } from '@/types/inventory';

const STORAGE_KEYS = {
  ITEMS: 'chakra_inventory_items',
  BINS: 'chakra_inventory_bins',
  CATEGORIES: 'chakra_inventory_categories',
  SUBTYPES: 'chakra_inventory_subtypes',
};

class InventoryStore {
  private items: Map<string, Item> = new Map();
  private bins: Map<string, Bin> = new Map();
  private barcodeIndex: Map<string, string> = new Map();
  private categories: string[] = [];
  private categorySubtypes: Record<string, string[]> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      // Load categories
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = savedCategories ? JSON.parse(savedCategories) : [...DEFAULT_CATEGORIES];

      // Load subtypes
      const savedSubtypes = localStorage.getItem(STORAGE_KEYS.SUBTYPES);
      this.categorySubtypes = savedSubtypes ? JSON.parse(savedSubtypes) : { ...CATEGORY_SUBTYPES };

      // Load bins
      const savedBins = localStorage.getItem(STORAGE_KEYS.BINS);
      if (savedBins) {
        const binsArray: Bin[] = JSON.parse(savedBins);
        binsArray.forEach(bin => {
          this.bins.set(bin.id, bin);
        });
      } else {
        this.initializeBins();
      }

      // Load items
      const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (savedItems) {
        const itemsArray: Item[] = JSON.parse(savedItems);
        itemsArray.forEach(item => {
          this.items.set(item.id, item);
          this.barcodeIndex.set(item.barcode, item.id);
        });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.initializeBins();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(Array.from(this.items.values())));
      localStorage.setItem(STORAGE_KEYS.BINS, JSON.stringify(Array.from(this.bins.values())));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.SUBTYPES, JSON.stringify(this.categorySubtypes));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private initializeBins() {
    this.categories.forEach((category) => {
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
    this.saveToStorage();
  }

  // Category management
  getCategories(): string[] {
    return [...this.categories];
  }

  addCategory(category: string): boolean {
    if (this.categories.includes(category)) return false;
    this.categories.push(category);
    
    // Create a bin for the new category
    const binId = `bin-${category.toLowerCase().replace(/\s/g, '-')}-1`;
    this.bins.set(binId, {
      id: binId,
      name: `${category} Bin A`,
      category,
      maxCapacity: 100,
      currentQuantity: 0,
      items: [],
    });
    
    this.saveToStorage();
    return true;
  }

  updateCategory(oldName: string, newName: string): boolean {
    const index = this.categories.indexOf(oldName);
    if (index === -1 || this.categories.includes(newName)) return false;
    
    this.categories[index] = newName;
    
    // Update all bins with this category
    this.bins.forEach((bin, id) => {
      if (bin.category === oldName) {
        bin.category = newName;
        this.bins.set(id, bin);
      }
    });
    
    // Update all items with this category
    this.items.forEach((item, id) => {
      if (item.category === oldName) {
        item.category = newName;
        this.items.set(id, item);
      }
    });
    
    // Update subtypes
    if (this.categorySubtypes[oldName]) {
      this.categorySubtypes[newName] = this.categorySubtypes[oldName];
      delete this.categorySubtypes[oldName];
    }
    
    this.saveToStorage();
    return true;
  }

  deleteCategory(category: string): boolean {
    const index = this.categories.indexOf(category);
    if (index === -1) return false;
    
    // Check if any items use this category
    const hasItems = Array.from(this.items.values()).some(item => item.category === category);
    if (hasItems) return false;
    
    this.categories.splice(index, 1);
    
    // Delete bins for this category
    Array.from(this.bins.entries()).forEach(([id, bin]) => {
      if (bin.category === category) {
        this.bins.delete(id);
      }
    });
    
    // Delete subtypes
    delete this.categorySubtypes[category];
    
    this.saveToStorage();
    return true;
  }

  // Subtype management
  getSubtypes(category: string): string[] {
    return this.categorySubtypes[category] || [];
  }

  setSubtypes(category: string, subtypes: string[]) {
    this.categorySubtypes[category] = subtypes;
    this.saveToStorage();
  }

  addSubtype(category: string, subtype: string): boolean {
    if (!this.categorySubtypes[category]) {
      this.categorySubtypes[category] = [];
    }
    if (this.categorySubtypes[category].includes(subtype)) return false;
    this.categorySubtypes[category].push(subtype);
    this.saveToStorage();
    return true;
  }

  deleteSubtype(category: string, subtype: string): boolean {
    if (!this.categorySubtypes[category]) return false;
    const index = this.categorySubtypes[category].indexOf(subtype);
    if (index === -1) return false;
    this.categorySubtypes[category].splice(index, 1);
    this.saveToStorage();
    return true;
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
    this.saveToStorage();
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

    this.saveToStorage();
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

  getBin(id: string): Bin | undefined {
    return this.bins.get(id);
  }

  updateBin(id: string, updates: Partial<Bin>): Bin | undefined {
    const bin = this.bins.get(id);
    if (!bin) return undefined;

    const updatedBin: Bin = {
      ...bin,
      ...updates,
      id,
    };

    this.bins.set(id, updatedBin);
    this.saveToStorage();
    return updatedBin;
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
    this.saveToStorage();
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

    // Update barcode index if barcode changed
    if (updates.barcode && updates.barcode !== item.barcode) {
      this.barcodeIndex.delete(item.barcode);
      this.barcodeIndex.set(updates.barcode, id);
    }

    // Update bin's item reference
    const bin = this.bins.get(item.binId);
    if (bin) {
      const itemIndex = bin.items.findIndex(i => i.id === id);
      if (itemIndex !== -1) {
        bin.items[itemIndex] = updatedItem;
        this.bins.set(bin.id, bin);
      }
    }

    this.items.set(id, updatedItem);
    this.saveToStorage();
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
        i.location.toLowerCase().includes(searchLower) ||
        (i.subType && i.subType.toLowerCase().includes(searchLower))
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
