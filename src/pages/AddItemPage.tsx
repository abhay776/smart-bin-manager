import { useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanBarcode, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { inventoryStore } from "@/lib/inventory-store";
import { Link } from "react-router-dom";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  location: z.string().min(1, "Location is required").max(100),
  barcode: z.string().min(1, "Barcode is required").max(50),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function AddItemPage() {
  const navigate = useNavigate();

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
      navigate("/items");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/items">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Item</h1>
          <p className="text-muted-foreground mt-1">
            Add a new item to your inventory
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Fill in the details below. The item will be automatically assigned to a bin based on its category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
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
                <Label htmlFor="category">Category *</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
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
                <Label htmlFor="expirationDate">Expiration Date *</Label>
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
              <Label htmlFor="location">Storage Location *</Label>
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
              <Label htmlFor="barcode">Barcode *</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Scan or enter barcode"
                  className="font-mono"
                  {...form.register("barcode")}
                />
                <Button type="button" variant="outline" onClick={generateBarcode} className="shrink-0">
                  <ScanBarcode className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
              {form.formState.errors.barcode && (
                <p className="text-xs text-destructive">{form.formState.errors.barcode.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link to="/items">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Add Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
