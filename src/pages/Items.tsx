import { useState, useEffect, useCallback } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { Item } from "@/types/inventory";
import { ItemsTable } from "@/components/items/ItemsTable";
import { AddItemForm } from "@/components/items/AddItemForm";
import { toast } from "sonner";

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);

  const loadItems = useCallback(() => {
    setItems(inventoryStore.getAllItems());
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = (id: string) => {
    const success = inventoryStore.deleteItem(id);
    if (success) {
      toast.success("Item deleted");
      loadItems();
    } else {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory items
          </p>
        </div>
        <AddItemForm onItemAdded={loadItems} />
      </div>

      <ItemsTable items={items} onDelete={handleDelete} />
    </div>
  );
}
