import { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { CATEGORY_SUBTYPES } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Tag, X } from "lucide-react";
import { toast } from "sonner";

export default function Categories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);
  const [subtypeDialogOpen, setSubtypeDialogOpen] = useState<string | null>(null);
  const [newSubtype, setNewSubtype] = useState("");
  const [categorySubtypes, setCategorySubtypes] = useState<Record<string, string[]>>({});

  const loadCategories = () => {
    setCategories(inventoryStore.getCategories());
    const subtypes: Record<string, string[]> = {};
    inventoryStore.getCategories().forEach(cat => {
      subtypes[cat] = inventoryStore.getSubtypes(cat);
    });
    setCategorySubtypes(subtypes);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    const success = inventoryStore.addCategory(newCategory.trim());
    if (success) {
      toast.success("Category added");
      setNewCategory("");
      loadCategories();
    } else {
      toast.error("Category already exists");
    }
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editedName.trim()) return;
    
    const success = inventoryStore.updateCategory(editingCategory, editedName.trim());
    if (success) {
      toast.success("Category updated");
      setEditingCategory(null);
      setEditedName("");
      loadCategories();
    } else {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = () => {
    if (!deleteCategory) return;
    
    const success = inventoryStore.deleteCategory(deleteCategory);
    if (success) {
      toast.success("Category deleted");
      setDeleteCategory(null);
      loadCategories();
    } else {
      toast.error("Cannot delete category with items");
    }
  };

  const handleAddSubtype = (category: string) => {
    if (!newSubtype.trim()) {
      toast.error("Subtype name is required");
      return;
    }
    
    const success = inventoryStore.addSubtype(category, newSubtype.trim());
    if (success) {
      toast.success("Subtype added");
      setNewSubtype("");
      loadCategories();
    } else {
      toast.error("Subtype already exists");
    }
  };

  const handleDeleteSubtype = (category: string, subtype: string) => {
    inventoryStore.deleteSubtype(category, subtype);
    toast.success("Subtype deleted");
    loadCategories();
  };

  const startEditing = (category: string) => {
    setEditingCategory(category);
    setEditedName(category);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage inventory categories and subtypes
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Power Supplies"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category} className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                {editingCategory === category ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                    />
                    <Button size="icon" variant="ghost" onClick={handleUpdateCategory}>
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingCategory(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEditing(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteCategory(category)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtypes</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSubtypeDialogOpen(category)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(categorySubtypes[category] || []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">No subtypes defined</span>
                  ) : (
                    (categorySubtypes[category] || []).map((subtype) => (
                      <Badge 
                        key={subtype} 
                        variant="secondary"
                        className="flex items-center gap-1 group"
                      >
                        {subtype}
                        <button
                          onClick={() => handleDeleteSubtype(category, subtype)}
                          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCategory}"? This action cannot be undone.
              Categories with items cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subtype Dialog */}
      <Dialog open={!!subtypeDialogOpen} onOpenChange={() => setSubtypeDialogOpen(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subtypes - {subtypeDialogOpen}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input
                value={newSubtype}
                onChange={(e) => setNewSubtype(e.target.value)}
                placeholder="e.g., Li-Po Battery"
                onKeyDown={(e) => e.key === 'Enter' && subtypeDialogOpen && handleAddSubtype(subtypeDialogOpen)}
              />
              <Button onClick={() => subtypeDialogOpen && handleAddSubtype(subtypeDialogOpen)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-auto">
              {subtypeDialogOpen && (categorySubtypes[subtypeDialogOpen] || []).map((subtype) => (
                <Badge 
                  key={subtype} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {subtype}
                  <button
                    onClick={() => handleDeleteSubtype(subtypeDialogOpen, subtype)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
