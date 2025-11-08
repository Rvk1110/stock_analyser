import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

interface StockSearchProps {
  onSelect: (symbol: string, companyName: string) => void;
  placeholder?: string;
}

export function StockSearch({ onSelect, placeholder = "Search stocks..." }: StockSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchStocks = useAction(api.stockApi.searchStocks);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchStocks({ query });
      console.log("Search results received:", searchResults);
      console.log("Number of results:", searchResults.length);
      setResults(searchResults);
      if (searchResults.length === 0) {
        toast.info("No stocks found. Try a different search term.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search stocks. Please try again.";
      toast.error(errorMessage, { duration: 5000 });
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between shadow-sm hover:shadow-md transition-shadow"
        >
          <Search className="mr-2 h-4 w-4" />
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 shadow-lg" align="start">
        <Command>
          <CommandInput
            placeholder="Type stock symbol or company name..."
            value={searchQuery}
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isSearching ? "Searching..." : "No stocks found."}
            </CommandEmpty>
            <CommandGroup>
              {results.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={stock.symbol}
                  onSelect={() => {
                    onSelect(stock.symbol, stock.description);
                    setOpen(false);
                    setSearchQuery("");
                    setResults([]);
                  }}
                  className="cursor-pointer"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">{stock.displaySymbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {stock.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}