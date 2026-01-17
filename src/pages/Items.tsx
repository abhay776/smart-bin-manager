import { useState, useEffect, useCallback } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { Item } from "@/types/inventory";
import { ItemsTable } from "@/components/items/ItemsTable";
import { AddItemForm } from "@/components/items/AddItemForm";
import { EditItemDialog } from "@/components/items/EditItemDialog";
import { toast } from "sonner";

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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

  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (id: string, updates: Partial<Item>) => {
    const updated = inventoryStore.updateItem(id, updates);
    if (updated) {
      toast.success("Item updated");
      loadItems();
    } else {
      toast.error("Failed to update item");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your inventory items
          </p>
        </div>
        <AddItemForm onItemAdded={loadItems} />
      </div>

      <ItemsTable items={items} onDelete={handleDelete} onEdit={handleEdit} />

      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
