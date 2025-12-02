import { useState, useCallback } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { Item } from "@/types/inventory";
import { SearchFilters, SearchFiltersData } from "@/components/search/SearchFilters";
import { ItemsTable } from "@/components/items/ItemsTable";
import { toast } from "sonner";

export default function SearchPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filters, setFilters] = useState<SearchFiltersData>({});
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback((newFilters: SearchFiltersData) => {
    setFilters(newFilters);
    const results = inventoryStore.searchItems(newFilters);
    setItems(results);
    setHasSearched(true);
  }, []);

  const handleDelete = (id: string) => {
    const success = inventoryStore.deleteItem(id);
    if (success) {
      toast.success("Item deleted");
      handleSearch(filters);
    } else {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground mt-1">
          Find items by category, expiration date, or barcode
        </p>
      </div>

      <SearchFilters onSearch={handleSearch} filters={filters} />

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Results ({items.length} items found)
            </h2>
          </div>
          <ItemsTable items={items} onDelete={handleDelete} />
        </div>
      )}

      {!hasSearched && (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Use the filters above to search for items
        </div>
      )}
    </div>
  );
}
