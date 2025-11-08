import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StockSearch } from "./StockSearch";

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStockDialog({ open, onOpenChange }: AddStockDialogProps) {
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    name: string;
  } | null>(null);
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addToPortfolio = useMutation(api.stocks.addToPortfolio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !shares || !purchasePrice) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await addToPortfolio({
        symbol: selectedStock.symbol,
        companyName: selectedStock.name,
        shares: parseFloat(shares),
        purchasePrice: parseFloat(purchasePrice),
      });
      toast.success(`Added ${selectedStock.symbol} to portfolio`);
      onOpenChange(false);
      setSelectedStock(null);
      setShares("");
      setPurchasePrice("");
    } catch (error) {
      toast.error("Failed to add stock to portfolio");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] shadow-lg">
        <DialogHeader>
          <DialogTitle className="tracking-tight font-bold">
            Add Stock to Portfolio
          </DialogTitle>
          <DialogDescription>
            Search for a stock and enter your purchase details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock</Label>
              <StockSearch
                onSelect={(symbol, name) => setSelectedStock({ symbol, name })}
                placeholder={
                  selectedStock
                    ? `${selectedStock.symbol} - ${selectedStock.name}`
                    : "Search stocks..."
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                step="0.01"
                placeholder="10"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Purchase Price per Share</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="shadow-sm">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Portfolio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
