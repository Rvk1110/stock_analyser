"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || "";
const BASE_URL = "https://api.twelvedata.com";

export const getStockQuote = action({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${args.symbol}&apikey=${TWELVE_DATA_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.message || "Invalid stock symbol or no data available");
      }

      if (data.code === 429) {
        throw new Error("API rate limit reached. Please try again later.");
      }

      return {
        symbol: args.symbol,
        currentPrice: parseFloat(data.close),
        change: parseFloat(data.change),
        percentChange: parseFloat(data.percent_change),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        open: parseFloat(data.open),
        previousClose: parseFloat(data.previous_close),
        volume: parseInt(data.volume) || 0,
      };
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to fetch stock data");
    }
  },
});

export const getCompanyProfile = action({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `${BASE_URL}/profile?symbol=${args.symbol}&apikey=${TWELVE_DATA_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Invalid stock symbol");
      }

      if (data.code === 429) {
        throw new Error("API rate limit reached. Please try again later.");
      }

      return {
        name: data.name,
        ticker: data.symbol,
        exchange: data.exchange,
        industry: data.industry,
        sector: data.sector,
        marketCap: data.market_cap,
        country: data.country,
        currency: data.currency,
        description: data.description,
      };
    } catch (error) {
      console.error("Error fetching company profile:", error);
      throw new Error("Failed to fetch company profile");
    }
  },
});

export const searchStocks = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `${BASE_URL}/symbol_search?symbol=${args.query}&apikey=${TWELVE_DATA_API_KEY}`
      );
      const data = await response.json();

      console.log("Twelve Data search response:", JSON.stringify(data, null, 2));

      if (data.status === "error") {
        throw new Error(data.message || "Invalid search query or API error");
      }

      if (data.code === 429) {
        const errorMsg = "API rate limit reached. Please try again later or upgrade your API key.";
        throw new Error(errorMsg);
      }

      const matches = data.data || [];
      
      console.log("Matches found:", matches.length);
      
      if (matches.length === 0) {
        return [];
      }
      
      const results = matches
        .slice(0, 10)
        .map((item: any) => ({
          symbol: item.symbol,
          instrument_name: item.instrument_name,
          description: item.instrument_name || item.symbol,
          displaySymbol: item.symbol,
          type: item.instrument_type,
          region: item.country,
        }));
      
      console.log("Returning results:", JSON.stringify(results, null, 2));
      
      return results;
    } catch (error) {
      console.error("Error searching stocks:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to search stocks");
    }
  },
});

export const getHistoricalData = action({
  args: {
    symbol: v.string(),
    resolution: v.string(),
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Twelve Data uses YYYY-MM-DD for start_date and end_date
      const startDate = new Date(args.from * 1000).toISOString().split('T')[0];
      const endDate = new Date(args.to * 1000).toISOString().split('T')[0];

      // [FIX 3] Use args.resolution, start_date, and end_date in the API call
      // Hardcoded outputsize=30 has been removed to allow for dynamic range.
      const response = await fetch(
        `${BASE_URL}/time_series?symbol=${args.symbol}&interval=${args.resolution}&start_date=${startDate}&end_date=${endDate}&apikey=${TWELVE_DATA_API_KEY}`
      );
      
      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Invalid stock symbol");
      }

      if (data.code === 429) {
        throw new Error("API rate limit reached. Please try again later.");
      }

      const timeSeries = data.values || [];
      
      if (timeSeries.length === 0) {
        return { timestamps: [], prices: [], volumes: [] };
      }

      const timestamps: number[] = [];
      const prices: number[] = [];
      const volumes: number[] = [];
      const opens: number[] = [];
      const highs: number[] = [];
      const lows: number[] = [];

      timeSeries
        .reverse()
        .forEach((item: any) => {
          // Twelve Data `datetime` is a string like "YYYY-MM-DD HH:MM:SS"
          const timestamp = new Date(item.datetime).getTime() / 1000;
          
          timestamps.push(timestamp);
          prices.push(parseFloat(item.close));
          volumes.push(parseInt(item.volume));
          opens.push(parseFloat(item.open));
          highs.push(parseFloat(item.high));
          lows.push(parseFloat(item.low));
          
        });

      return {
        timestamps,
        prices,
        volumes,
        opens,
        highs,
        lows,
      };
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw new Error("Failed to fetch historical data");
    }
  },
});
