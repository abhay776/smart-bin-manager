import { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { Bin, Item } from "@/types/inventory";
import { BinCard } from "@/components/dashboard/BinCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function Bins() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [editingBinName, setEditingBinName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editingMaxCapacity, setEditingMaxCapacity] = useState(false);
  const [editedCapacity, setEditedCapacity] = useState(100);

  const loadBins = () => {
    setBins(inventoryStore.getAllBins());
  };

  useEffect(() => {
    loadBins();
  }, []);

  const handleSaveBinName = () => {
    if (!selectedBin || !editedName.trim()) return;
    
    inventoryStore.updateBin(selectedBin.id, { name: editedName.trim() });
    setSelectedBin({ ...selectedBin, name: editedName.trim() });
    setEditingBinName(false);
    loadBins();
    toast.success("Bin name updated");
  };

  const handleSaveCapacity = () => {
    if (!selectedBin || editedCapacity < 1) return;
    
    inventoryStore.updateBin(selectedBin.id, { maxCapacity: editedCapacity });
    setSelectedBin({ ...selectedBin, maxCapacity: editedCapacity });
    setEditingMaxCapacity(false);
    loadBins();
    toast.success("Bin capacity updated");
  };

  const handleDeleteItem = (itemId: string) => {
    const success = inventoryStore.deleteItem(itemId);
    if (success) {
      toast.success("Item deleted");
      loadBins();
      // Refresh selected bin
      const updatedBin = inventoryStore.getBin(selectedBin!.id);
      if (updatedBin) {
        setSelectedBin(updatedBin);
      } else {
        setSelectedBin(null);
      }
    }
  };

  const startEditingName = () => {
    if (selectedBin) {
      setEditedName(selectedBin.name);
      setEditingBinName(true);
    }
  };

  const startEditingCapacity = () => {
    if (selectedBin) {
      setEditedCapacity(selectedBin.maxCapacity);
      setEditingMaxCapacity(true);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bins</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Storage bins with dynamic allocation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bins.map((bin) => (
          <BinCard 
            key={bin.id} 
            bin={bin} 
            onClick={() => setSelectedBin(bin)}
          />
        ))}
      </div>

      {/* Bin Detail Dialog */}
      <Dialog open={!!selectedBin} onOpenChange={() => {
        setSelectedBin(null);
        setEditingBinName(false);
        setEditingMaxCapacity(false);
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingBinName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveBinName}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingBinName(false)}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <>
                  {selectedBin?.name}
                  <Button size="icon" variant="ghost" onClick={startEditingName}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedBin && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{selectedBin.category}</Badge>
                {editingMaxCapacity ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={editedCapacity}
                      onChange={(e) => setEditedCapacity(parseInt(e.target.value) || 1)}
                      className="h-8 w-20"
                    />
                    <span className="text-sm text-muted-foreground">max capacity</span>
                    <Button size="icon" variant="ghost" onClick={handleSaveCapacity}>
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingMaxCapacity(false)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <button 
                    onClick={startEditingCapacity}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    {selectedBin.currentQuantity}/{selectedBin.maxCapacity} capacity
                    <Edit className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Items in this bin:</h4>
                {selectedBin.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {selectedBin.items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.barcode}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
