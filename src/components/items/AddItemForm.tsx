import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CATEGORIES, Category } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { inventoryStore } from "@/lib/inventory-store";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  location: z.string().min(1, "Location is required").max(100),
  barcode: z.string().min(1, "Barcode is required").max(50),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface AddItemFormProps {
  onItemAdded?: () => void;
}

export function AddItemForm({ onItemAdded }: AddItemFormProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 1,
      expirationDate: "",
      location: "",
      barcode: "",
    },
  });

  const onSubmit = (data: ItemFormData) => {
    try {
      // Check if barcode already exists
      const existing = inventoryStore.getItemByBarcode(data.barcode);
      if (existing) {
        toast.error("An item with this barcode already exists");
        return;
      }

      inventoryStore.addItem({
        name: data.name,
        category: data.category as Category,
        quantity: data.quantity,
        expirationDate: data.expirationDate,
        location: data.location,
        barcode: data.barcode,
      });

      toast.success("Item added successfully!");
      form.reset();
      setOpen(false);
      onItemAdded?.();
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const generateBarcode = () => {
    const prefix = form.getValues("category")?.slice(0, 3).toUpperCase() || "ITM";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    form.setValue("barcode", `${prefix}${random}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory. It will be automatically assigned to a bin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Arduino Uno"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                placeholder="1"
                {...form.register("quantity")}
              />
              {form.formState.errors.quantity && (
                <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                {...form.register("expirationDate")}
              />
              {form.formState.errors.expirationDate && (
                <p className="text-xs text-destructive">{form.formState.errors.expirationDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Storage Location</Label>
            <Input
              id="location"
              placeholder="e.g., Aisle A-1, Shelf 3"
              {...form.register("location")}
            />
            {form.formState.errors.location && (
              <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                placeholder="Scan or enter barcode"
                className="font-mono"
                {...form.register("barcode")}
              />
              <Button type="button" variant="outline" size="icon" onClick={generateBarcode}>
                <ScanBarcode className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.barcode && (
              <p className="text-xs text-destructive">{form.formState.errors.barcode.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
