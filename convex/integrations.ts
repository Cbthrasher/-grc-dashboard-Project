import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    type: v.union(
      v.literal("api"),
      v.literal("webhook"),
      v.literal("file_import"),
      v.literal("database"),
      v.literal("siem"),
      v.literal("erp"),
      v.literal("hrms")
    ),
    endpoint: v.optional(v.string()),
    syncFrequency: v.union(
      v.literal("real_time"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    config: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const integrationId = await ctx.db.insert("integrations", {
      organizationId: args.organizationId,
      name: args.name,
      type: args.type,
      status: "pending",
      endpoint: args.endpoint,
      syncFrequency: args.syncFrequency,
      config: args.config,
      createdBy: userId,
    });

    return integrationId;
  },
});

export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("integrations")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    integrationId: v.id("integrations"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("error"),
      v.literal("pending")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.integrationId, {
      status: args.status,
      lastSync: args.status === "active" ? Date.now() : undefined,
    });

    return args.integrationId;
  },
});

export const testConnection = action({
  args: {
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    // This would contain actual integration testing logic
    // For now, we'll simulate a test
    
    const integration = await ctx.runQuery(api.integrations.get, {
      integrationId: args.integrationId,
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    // Simulate connection test based on integration type
    const success = Math.random() > 0.3; // 70% success rate for demo

    if (success) {
      await ctx.runMutation(api.integrations.updateStatus, {
        integrationId: args.integrationId,
        status: "active",
      });
      return { success: true, message: "Connection successful" };
    } else {
      await ctx.runMutation(api.integrations.updateStatus, {
        integrationId: args.integrationId,
        status: "error",
      });
      return { success: false, message: "Connection failed - please check configuration" };
    }
  },
});

export const get = query({
  args: { integrationId: v.id("integrations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.get(args.integrationId);
  },
});

export const syncData = action({
  args: {
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.runQuery(api.integrations.get, {
      integrationId: args.integrationId,
    });

    if (!integration || integration.status !== "active") {
      throw new Error("Integration not active");
    }

    // This would contain actual data synchronization logic
    // For demo purposes, we'll simulate data sync
    
    const syncResults = {
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
      recordsUpdated: Math.floor(Math.random() * 50) + 10,
      recordsCreated: Math.floor(Math.random() * 20) + 5,
      errors: Math.floor(Math.random() * 3),
    };

    // Update last sync time
    await ctx.runMutation(api.integrations.updateLastSync, {
      integrationId: args.integrationId,
    });

    return syncResults;
  },
});

export const updateLastSync = mutation({
  args: { integrationId: v.id("integrations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.integrationId, {
      lastSync: Date.now(),
    });
  },
});
