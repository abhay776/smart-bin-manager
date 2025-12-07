import { Item } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ItemsTableProps {
  items: Item[];
  onDelete: (id: string) => void;
  onEdit?: (item: Item) => void;
}

export function ItemsTable({ items, onDelete, onEdit }: ItemsTableProps) {
  const isExpiringSoon = (date: string) => {
    const expDate = new Date(date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expDate < thirtyDaysFromNow;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  const isLowStock = (quantity: number) => quantity < 10;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold hidden sm:table-cell">Barcode</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold text-right">Qty</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
            <TableHead className="font-semibold">Expiration</TableHead>
            <TableHead className="font-semibold w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm md:text-base">{item.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <code className="font-mono text-xs md:text-sm bg-muted px-2 py-1 rounded">
                    {item.barcode}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-mono font-medium",
                    isLowStock(item.quantity) && "text-destructive"
                  )}>
                    {item.quantity}
                  </span>
                  {isLowStock(item.quantity) && (
                    <Badge variant="destructive" className="ml-2 text-[10px]">Low</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{item.location}</TableCell>
                <TableCell>
                  <span className={cn(
                    "text-sm",
                    isExpired(item.expirationDate) && "text-destructive font-medium",
                    isExpiringSoon(item.expirationDate) && !isExpired(item.expirationDate) && "text-warning"
                  )}>
                    {item.expirationDate}
                  </span>
                  {isExpired(item.expirationDate) && (
                    <Badge variant="destructive" className="ml-2 text-[10px]">Expired</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete(item.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
