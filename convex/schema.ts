import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Organizations for multi-tenancy
  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_created_by", ["createdBy"]),

  // Organization members
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("viewer")),
    joinedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_org_user", ["organizationId", "userId"]),

  // Risk Management
  risks: defineTable({
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
    riskScore: v.number(), // calculated field
    status: v.union(
      v.literal("identified"),
      v.literal("assessed"),
      v.literal("mitigated"),
      v.literal("accepted"),
      v.literal("transferred")
    ),
    owner: v.id("users"),
    dueDate: v.optional(v.number()),
    createdBy: v.id("users"),
    lastUpdated: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  // Controls
  controls: defineTable({
    organizationId: v.id("organizations"),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("preventive"),
      v.literal("detective"),
      v.literal("corrective"),
      v.literal("compensating")
    ),
    frequency: v.union(
      v.literal("continuous"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually")
    ),
    effectiveness: v.union(
      v.literal("not_tested"),
      v.literal("ineffective"),
      v.literal("partially_effective"),
      v.literal("effective")
    ),
    owner: v.id("users"),
    lastTested: v.optional(v.number()),
    nextTestDue: v.optional(v.number()),
    createdBy: v.id("users"),
  })
    .index("by_organization", ["organizationId"])
    .index("by_owner", ["owner"])
    .index("by_effectiveness", ["effectiveness"]),

  // Risk-Control mappings
  riskControls: defineTable({
    riskId: v.id("risks"),
    controlId: v.id("controls"),
    mitigationLevel: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
  })
    .index("by_risk", ["riskId"])
    .index("by_control", ["controlId"]),

  // Compliance frameworks
  complianceFrameworks: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.string(),
    version: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("draft")
    ),
    createdBy: v.id("users"),
  }).index("by_organization", ["organizationId"]),

  // Compliance requirements
  complianceRequirements: defineTable({
    frameworkId: v.id("complianceFrameworks"),
    requirementId: v.string(), // e.g., "SOX-404", "GDPR-25"
    title: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("compliant"),
      v.literal("non_compliant"),
      v.literal("needs_review")
    ),
    owner: v.id("users"),
    dueDate: v.optional(v.number()),
    lastAssessed: v.optional(v.number()),
    evidence: v.optional(v.string()),
  })
    .index("by_framework", ["frameworkId"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"]),

  // System integrations
  integrations: defineTable({
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
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("error"),
      v.literal("pending")
    ),
    endpoint: v.optional(v.string()),
    lastSync: v.optional(v.number()),
    syncFrequency: v.union(
      v.literal("real_time"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    config: v.optional(v.string()), // JSON string for configuration
    createdBy: v.id("users"),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"]),

  // Audit logs
  auditLogs: defineTable({
    organizationId: v.id("organizations"),
    entityType: v.union(
      v.literal("risk"),
      v.literal("control"),
      v.literal("compliance"),
      v.literal("integration")
    ),
    entityId: v.string(),
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("status_changed")
    ),
    userId: v.id("users"),
    changes: v.optional(v.string()), // JSON string of changes
    timestamp: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
