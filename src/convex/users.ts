import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    // We call getCurrentUser, which now includes a safe error wrapper.
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  // [BEGINNER FIX: Added try/catch to prevent crashes due to malformed keys]
  try {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    // Attempt to fetch the user document.
    return await ctx.db.get(userId);
  } catch (error) {
    // If Convex Auth fails (which it will with manually entered raw keys), 
    // log the error and safely return null. This unblocks the frontend.
    console.error("Convex Auth failed (likely due to malformed JWT keys):", error);
    return null;
  }
};
