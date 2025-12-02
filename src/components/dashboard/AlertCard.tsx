import { Alert } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getIcon = () => {
    switch (alert.type) {
      case 'low-stock':
        return PackageX;
      case 'expiring':
        return Clock;
      case 'expired':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getIcon();

  return (
    <div className={cn(
      "flex items-start gap-4 rounded-lg border p-4 transition-all duration-200",
      alert.severity === 'critical' 
        ? "border-destructive/50 bg-destructive/5" 
        : "border-warning/50 bg-warning/5"
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        alert.severity === 'critical' ? "bg-destructive/20" : "bg-warning/20"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          alert.severity === 'critical' ? "text-destructive" : "text-warning"
        )} />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{alert.itemName}</span>
          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
            {alert.type.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{alert.message}</p>
      </div>
    </div>
  );
}
