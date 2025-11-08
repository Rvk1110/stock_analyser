import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

interface StockCardProps {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  onClick?: () => void;
}

export function StockCard({
  symbol,
  companyName,
  currentPrice,
  change,
  percentChange,
  onClick,
}: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">
                {symbol}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {companyName}
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${
                isPositive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight">
                ${currentPrice.toFixed(2)}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(percentChange).toFixed(2)}%
              </span>
            </div>
          </div>
          <p
            className={`text-sm mt-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
