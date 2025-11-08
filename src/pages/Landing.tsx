import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  LineChart,
  Loader2,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: LineChart,
      title: "Real-Time Data",
      description: "Track stock prices with live market data and updates",
    },
    {
      icon: PieChart,
      title: "Portfolio Management",
      description: "Manage your investments with detailed analytics",
    },
    {
      icon: BarChart3,
      title: "Historical Trends",
      description: "Analyze price movements and market patterns",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="p-6 bg-primary rounded-2xl shadow-lg"
          >
            <TrendingUp className="h-16 w-16 text-primary-foreground" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Stock Market Analyzer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Your comprehensive platform for tracking stocks, analyzing trends,
              and managing your investment portfolio with real-time data.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex gap-4"
          >
            {isLoading ? (
              <Button size="lg" disabled className="shadow-lg">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex p-4 bg-primary/10 rounded-xl">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <Card className="shadow-lg">
            <CardContent className="py-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary">10K+</p>
                  <p className="text-muted-foreground mt-2">Stocks Available</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">Real-Time</p>
                  <p className="text-muted-foreground mt-2">Market Data</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">24/7</p>
                  <p className="text-muted-foreground mt-2">Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-24 text-center space-y-6"
        >
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to start analyzing?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of investors using our platform to make informed
            decisions about their investments.
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              Sign Up Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="border-t mt-24 py-8"
      >
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with React, TypeScript, and Convex • Powered by{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              vly.ai
            </a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
}