import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's portfolio stocks
export const getPortfolio = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("portfolioStocks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Add stock to portfolio
export const addToPortfolio = mutation({
  args: {
    symbol: v.string(),
    companyName: v.string(),
    shares: v.number(),
    purchasePrice: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Check if stock already exists in portfolio
    const existing = await ctx.db
      .query("portfolioStocks")
      .withIndex("by_userId_and_symbol", (q) =>
        q.eq("userId", user._id).eq("symbol", args.symbol)
      )
      .unique();

    if (existing) {
      // Update existing stock
      await ctx.db.patch(existing._id, {
        shares: existing.shares + args.shares,
        purchasePrice:
          (existing.purchasePrice * existing.shares +
            args.purchasePrice * args.shares) /
          (existing.shares + args.shares),
      });
      return existing._id;
    }

    return await ctx.db.insert("portfolioStocks", {
      userId: user._id,
      symbol: args.symbol.toUpperCase(),
      companyName: args.companyName,
      shares: args.shares,
      purchasePrice: args.purchasePrice,
    });
  },
});

// Remove stock from portfolio
export const removeFromPortfolio = mutation({
  args: {
    portfolioId: v.id("portfolioStocks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const stock = await ctx.db.get(args.portfolioId);
    if (!stock || stock.userId !== user._id) {
      throw new Error("Stock not found or unauthorized");
    }

    await ctx.db.delete(args.portfolioId);
  },
});

// Update portfolio stock
export const updatePortfolioStock = mutation({
  args: {
    portfolioId: v.id("portfolioStocks"),
    shares: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const stock = await ctx.db.get(args.portfolioId);
    if (!stock || stock.userId !== user._id) {
      throw new Error("Stock not found or unauthorized");
    }

    const updates: any = {};
    if (args.shares !== undefined) updates.shares = args.shares;
    if (args.purchasePrice !== undefined)
      updates.purchasePrice = args.purchasePrice;

    await ctx.db.patch(args.portfolioId, updates);
  },
});

// Get user's favorite stocks
export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("favoriteStocks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Add stock to favorites
export const addToFavorites = mutation({
  args: {
    symbol: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Check if already favorited
    const existing = await ctx.db
      .query("favoriteStocks")
      .withIndex("by_userId_and_symbol", (q) =>
        q.eq("userId", user._id).eq("symbol", args.symbol)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("favoriteStocks", {
      userId: user._id,
      symbol: args.symbol.toUpperCase(),
      companyName: args.companyName,
    });
  },
});

// Remove from favorites
export const removeFromFavorites = mutation({
  args: {
    favoriteId: v.id("favoriteStocks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const favorite = await ctx.db.get(args.favoriteId);
    if (!favorite || favorite.userId !== user._id) {
      throw new Error("Favorite not found or unauthorized");
    }

    await ctx.db.delete(args.favoriteId);
  },
});
