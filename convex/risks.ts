import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const calculateRiskScore = (likelihood: string, impact: string): number => {
  const scoreMap = {
    very_low: 1,
    low: 2,
    medium: 3,
    high: 4,
    very_high: 5,
  };
  
  return scoreMap[likelihood as keyof typeof scoreMap] * scoreMap[impact as keyof typeof scoreMap];
};

export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("operational"),
      v.literal("financial"),
      v.literal("strategic"),
      v.literal("compliance"),
      v.literal("technology"),
      v.literal("reputational")
    ),
    likelihood: v.union(
      v.literal("very_low"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("very_high")
    ),
    impact: v.union(
      v.literal("very_low"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("very_high")
    ),
    owner: v.id("users"),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const riskScore = calculateRiskScore(args.likelihood, args.impact);

    const riskId = await ctx.db.insert("risks", {
      organizationId: args.organizationId,
      title: args.title,
      description: args.description,
      category: args.category,
      likelihood: args.likelihood,
      impact: args.impact,
      riskScore,
      status: "identified",
      owner: args.owner,
      dueDate: args.dueDate,
      createdBy: userId,
      lastUpdated: Date.now(),
    });

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      organizationId: args.organizationId,
      entityType: "risk",
      entityId: riskId,
      action: "created",
      userId,
      timestamp: Date.now(),
    });

    return riskId;
  },
});

export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const risks = await ctx.db
      .query("risks")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Get owner details for each risk
    const risksWithOwners = await Promise.all(
      risks.map(async (risk) => {
        const owner = await ctx.db.get(risk.owner);
        return {
          ...risk,
          ownerName: owner?.name || owner?.email || "Unknown",
        };
      })
    );

    return risksWithOwners;
  },
});

export const update = mutation({
  args: {
    riskId: v.id("risks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    likelihood: v.optional(v.union(
      v.literal("very_low"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("very_high")
    )),
    impact: v.optional(v.union(
      v.literal("very_low"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("very_high")
    )),
    status: v.optional(v.union(
      v.literal("identified"),
      v.literal("assessed"),
      v.literal("mitigated"),
      v.literal("accepted"),
      v.literal("transferred")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const risk = await ctx.db.get(args.riskId);
    if (!risk) {
      throw new Error("Risk not found");
    }

    const updates: any = {
      lastUpdated: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;

    // Recalculate risk score if likelihood or impact changed
    if (args.likelihood !== undefined || args.impact !== undefined) {
      const likelihood = args.likelihood || risk.likelihood;
      const impact = args.impact || risk.impact;
      updates.likelihood = likelihood;
      updates.impact = impact;
      updates.riskScore = calculateRiskScore(likelihood, impact);
    }

    await ctx.db.patch(args.riskId, updates);

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      organizationId: risk.organizationId,
      entityType: "risk",
      entityId: args.riskId,
      action: "updated",
      userId,
      changes: JSON.stringify(updates),
      timestamp: Date.now(),
    });

    return args.riskId;
  },
});

export const getRiskMatrix = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const risks = await ctx.db
      .query("risks")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Group risks by likelihood and impact for matrix visualization
    const matrix: Record<string, Record<string, number>> = {};
    const levels = ["very_low", "low", "medium", "high", "very_high"];

    levels.forEach(likelihood => {
      matrix[likelihood] = {};
      levels.forEach(impact => {
        matrix[likelihood][impact] = 0;
      });
    });

    risks.forEach(risk => {
      matrix[risk.likelihood][risk.impact]++;
    });

    return matrix;
  },
});
