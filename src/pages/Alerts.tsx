import { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { Alert } from "@/types/inventory";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setAlerts(inventoryStore.getAlerts());
  }, []);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor low stock and expiring items
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge variant="warning" className="gap-1">
              {warningAlerts.length} Warning
            </Badge>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">All Clear!</h3>
          <p className="text-muted-foreground">No alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-6">
          {criticalAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive">
                Critical Alerts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {warningAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-warning">
                Warnings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warningAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
