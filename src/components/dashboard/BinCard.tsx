import { Bin } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { Package, Box } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BinCardProps {
  bin: Bin;
  onClick?: () => void;
}

export function BinCard({ bin, onClick }: BinCardProps) {
  const fillPercentage = (bin.currentQuantity / bin.maxCapacity) * 100;
  
  const getStatusColor = () => {
    if (fillPercentage === 0) return "bg-bin-empty";
    if (fillPercentage < 50) return "bg-bin-partial";
    if (fillPercentage < 90) return "bg-bin-full";
    return "bg-bin-warning";
  };

  const getProgressColor = () => {
    if (fillPercentage < 50) return "bg-bin-partial";
    if (fillPercentage < 90) return "bg-success";
    return "bg-warning";
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 cursor-pointer",
        "hover:shadow-lg hover:border-accent/50 hover:-translate-y-1",
        fillPercentage >= 90 && "bin-glow-warning",
        fillPercentage < 50 && fillPercentage > 0 && "hover:bin-glow-success"
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        getStatusColor()
      )} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{bin.name}</h3>
          <p className="text-sm text-muted-foreground">{bin.category}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Box className="h-5 w-5 text-secondary-foreground" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-mono font-medium">
            {bin.currentQuantity}/{bin.maxCapacity}
          </span>
        </div>

        <Progress 
          value={fillPercentage} 
          className="h-2"
          indicatorClassName={getProgressColor()}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{bin.items.length} item types</span>
        </div>
      </div>
    </div>
  );
}
