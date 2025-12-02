import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/types/inventory";
import { Search, X } from "lucide-react";

export interface SearchFiltersData {
  search?: string;
  category?: string;
  barcode?: string;
  expirationStart?: string;
  expirationEnd?: string;
}

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersData) => void;
  filters: SearchFiltersData;
}

export function SearchFilters({ onSearch, filters }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFiltersData>(filters);

  const handleChange = (key: keyof SearchFiltersData, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
  };

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const handleClear = () => {
    const cleared: SearchFiltersData = {};
    setLocalFilters(cleared);
    onSearch(cleared);
  };

  const hasFilters = Object.values(localFilters).some(v => v);

  return (
    <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Search & Filter</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Name, barcode, location..."
              className="pl-9"
              value={localFilters.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={localFilters.category || ""}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expirationStart">Expiration From</Label>
          <Input
            id="expirationStart"
            type="date"
            value={localFilters.expirationStart || ""}
            onChange={(e) => handleChange("expirationStart", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expirationEnd">Expiration To</Label>
          <Input
            id="expirationEnd"
            type="date"
            value={localFilters.expirationEnd || ""}
            onChange={(e) => handleChange("expirationEnd", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
