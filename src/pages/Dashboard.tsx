import { AddStockDialog } from "@/components/AddStockDialog";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PriceChart } from "@/components/PriceChart";
import { StockCard } from "@/components/StockCard";
import { StockSearch } from "@/components/StockSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  Heart,
  Loader2,
  LogOut,
  Plus,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const { isLoading: authLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const portfolio = useQuery(api.stocks.getPortfolio);
  const favorites = useQuery(api.stocks.getFavorites);
  const addToFavorites = useMutation(api.stocks.addToFavorites);
  const removeFromFavorites = useMutation(api.stocks.removeFromFavorites);
  const removeFromPortfolio = useMutation(api.stocks.removeFromPortfolio);
  const getStockQuote = useAction(api.stockApi.getStockQuote);
  const getHistoricalData = useAction(api.stockApi.getHistoricalData);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadStockData = async (symbol: string) => {
    setLoadingStock(true);
    setSelectedStock(symbol);
    try {
      const quote = await getStockQuote({ symbol });
      setStockData(quote);

      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60;
      const historical = await getHistoricalData({
        symbol,
        resolution: "D",
        from,
        to,
      });

      if (historical.timestamps && historical.timestamps.length > 0) {
        const chartData = historical.timestamps.map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toLocaleDateString(),
          price: historical.prices[index],
        }));
        setHistoricalData(chartData);
      } else {
        setHistoricalData([]);
        toast.info("No historical data available for this stock");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load stock data");
      console.error(error);
      setStockData(null);
      setHistoricalData([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleAddToFavorites = async (symbol: string, name: string) => {
    try {
      await addToFavorites({ symbol, companyName: name });
      toast.success(`Added ${symbol} to favorites`);
    } catch (error) {
      toast.error("Failed to add to favorites");
    }
  };

  const handleRemoveFromFavorites = async (favoriteId: string) => {
    try {
      await removeFromFavorites({ favoriteId: favoriteId as any });
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  const handleRemoveFromPortfolio = async (portfolioId: string) => {
    try {
      await removeFromPortfolio({ portfolioId: portfolioId as any });
      toast.success("Removed from portfolio");
    } catch (error) {
      toast.error("Failed to remove from portfolio");
    }
  };

  const isFavorited = (symbol: string) => {
    return favorites?.some(fav => fav.symbol === symbol) || false;
  };

  const calculatePortfolioValue = () => {
    if (!portfolio) return 0;
    return portfolio.reduce(
      (total, stock) => total + stock.shares * stock.purchasePrice,
      0
    );
  };

  const portfolioChartData =
    portfolio?.map((stock) => ({
      name: stock.symbol,
      value: stock.shares * stock.purchasePrice,
    })) || [];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-card shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg shadow-md">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Stock Market Analyzer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.name || user.email || "User"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="shadow-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="tracking-tight font-bold">
                    Search Stocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StockSearch
                    onSelect={(symbol, name) => {
                      loadStockData(symbol);
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {loadingStock && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {stockData && !loadingStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <StockCard
                      symbol={stockData.symbol}
                      companyName={stockData.symbol}
                      currentPrice={stockData.currentPrice}
                      change={stockData.change}
                      percentChange={stockData.percentChange}
                    />
                  </div>
                  <Button
                    variant={isFavorited(stockData.symbol) ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      if (isFavorited(stockData.symbol)) {
                        const fav = favorites?.find(f => f.symbol === stockData.symbol);
                        if (fav) handleRemoveFromFavorites(fav._id);
                      } else {
                        handleAddToFavorites(stockData.symbol, stockData.symbol);
                      }
                    }}
                    className="shadow-sm"
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorited(stockData.symbol) ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Day High
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${stockData.high.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Day Low
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${stockData.low.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {stockData.volume ? (stockData.volume / 1000000).toFixed(2) + "M" : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Favorites */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="tracking-tight font-bold">
                      Favorites
                    </CardTitle>
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  {favorites && favorites.length > 0 ? (
                    <div className="space-y-2">
                      {favorites.map((fav) => (
                        <div
                          key={fav._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedStock(fav.symbol);
                            loadStockData(fav.symbol);
                          }}
                        >
                          <div>
                            <p className="font-medium">{fav.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {fav.companyName}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavorites(fav._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No favorites yet. Search for stocks to add them!
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {historicalData.length > 0 ? (
              <PriceChart
                data={historicalData}
                title={`${selectedStock} - 30 Day Price History`}
              />
            ) : (
              <Card className="shadow-md">
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    Search for a stock to view price trends
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="tracking-tight font-bold">
                        My Portfolio
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Value: ${calculatePortfolioValue().toFixed(2)}
                      </p>
                    </div>
                    <Button
                      onClick={() => setAddDialogOpen(true)}
                      className="shadow-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Stock
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {portfolio && portfolio.length > 0 ? (
                    <div className="space-y-3">
                      {portfolio.map((stock) => (
                        <div
                          key={stock._id}
                          className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <p className="font-bold">{stock.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {stock.companyName}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span>Shares: {stock.shares}</span>
                              <span>
                                Avg Price: ${stock.purchasePrice.toFixed(2)}
                              </span>
                              <span className="font-medium">
                                Value: $
                                {(stock.shares * stock.purchasePrice).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromPortfolio(stock._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No stocks in portfolio. Click "Add Stock" to get started!
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {portfolio && portfolio.length > 0 && (
              <PortfolioChart data={portfolioChartData} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddStockDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}