import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "accent" | "success" | "warning" | "destructive";
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatsCardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    accent: "bg-accent/10 border-accent/30 stat-glow",
    success: "bg-success/10 border-success/30",
    warning: "bg-warning/10 border-warning/30",
    destructive: "bg-destructive/10 border-destructive/30",
  };

  const iconStyles = {
    default: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg animate-fade-in",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
