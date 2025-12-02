import { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { Bin } from "@/types/inventory";
import { BinCard } from "@/components/dashboard/BinCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function Bins() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  useEffect(() => {
    setBins(inventoryStore.getAllBins());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bins</h1>
        <p className="text-muted-foreground mt-1">
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
      <Dialog open={!!selectedBin} onOpenChange={() => setSelectedBin(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedBin?.name}</DialogTitle>
          </DialogHeader>
          {selectedBin && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedBin.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedBin.currentQuantity}/{selectedBin.maxCapacity} capacity
                </span>
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
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
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
                        <span className="text-sm font-mono">{item.quantity}</span>
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
