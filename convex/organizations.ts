import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      industry: args.industry,
      createdBy: userId,
    });

    // Add creator as admin
    await ctx.db.insert("organizationMembers", {
      organizationId,
      userId,
      role: "admin",
      joinedAt: Date.now(),
    });

    return organizationId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          role: membership.role,
        };
      })
    );

    return organizations.filter(Boolean);
  },
});

export const get = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is member
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) => 
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not authorized");
    }

    const organization = await ctx.db.get(args.organizationId);
    return {
      ...organization,
      role: membership.role,
    };
  },
});

export const getDashboardStats = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) => 
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not authorized");
    }

    // Get risk stats
    const risks = await ctx.db
      .query("risks")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const riskStats = {
      total: risks.length,
      high: risks.filter(r => r.riskScore >= 15).length,
      medium: risks.filter(r => r.riskScore >= 9 && r.riskScore < 15).length,
      low: risks.filter(r => r.riskScore < 9).length,
    };

    // Get control stats
    const controls = await ctx.db
      .query("controls")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const controlStats = {
      total: controls.length,
      effective: controls.filter(c => c.effectiveness === "effective").length,
      partiallyEffective: controls.filter(c => c.effectiveness === "partially_effective").length,
      ineffective: controls.filter(c => c.effectiveness === "ineffective").length,
      notTested: controls.filter(c => c.effectiveness === "not_tested").length,
    };

    // Get compliance stats
    const frameworks = await ctx.db
      .query("complianceFrameworks")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    let complianceStats = { total: 0, compliant: 0, nonCompliant: 0, inProgress: 0 };
    
    for (const framework of frameworks) {
      const requirements = await ctx.db
        .query("complianceRequirements")
        .withIndex("by_framework", (q) => q.eq("frameworkId", framework._id))
        .collect();
      
      complianceStats.total += requirements.length;
      complianceStats.compliant += requirements.filter(r => r.status === "compliant").length;
      complianceStats.nonCompliant += requirements.filter(r => r.status === "non_compliant").length;
      complianceStats.inProgress += requirements.filter(r => r.status === "in_progress").length;
    }

    return {
      risks: riskStats,
      controls: controlStats,
      compliance: complianceStats,
    };
  },
});
