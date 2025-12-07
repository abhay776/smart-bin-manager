import { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/inventory-store";
import { DashboardStats, Bin, Alert } from "@/types/inventory";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BinCard } from "@/components/dashboard/BinCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { Package, Grid3X3, AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setStats(inventoryStore.getStats());
    setBins(inventoryStore.getAllBins());
    setAlerts(inventoryStore.getAlerts().slice(0, 5));
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Overview of your warehouse inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          subtitle="Units in stock"
          icon={Package}
          variant="accent"
        />
        <StatsCard
          title="Active Bins"
          value={stats.totalBins}
          subtitle="Storage locations"
          icon={Grid3X3}
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockCount}
          subtitle="Items need restocking"
          icon={AlertTriangle}
          variant={stats.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringCount}
          subtitle="Within 30 days"
          icon={Clock}
          variant={stats.expiringCount > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Inventory by Category</h2>
          <CategoryChart data={stats.categoryBreakdown} />
        </div>

        {/* Bins Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bins Overview</h2>
            <Link to="/bins">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bins.slice(0, 6).map((bin) => (
              <BinCard key={bin.id} bin={bin} />
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
            <Link to="/alerts">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
