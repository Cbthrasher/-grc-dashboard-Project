import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DashboardStats } from "./DashboardStats";
import { RiskManagement } from "./RiskManagement";
import { IntegrationManagement } from "./IntegrationManagement";
import { useState } from "react";

interface GRCDashboardProps {
  organizationId: string;
}

type TabType = "overview" | "risks" | "controls" | "compliance" | "integrations";

export function GRCDashboard({ organizationId }: GRCDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const organization = useQuery(api.organizations.get, { 
    organizationId: organizationId as Id<"organizations"> 
  });

  if (!organization) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "risks", label: "Risk Management", icon: "⚠️" },
    { id: "controls", label: "Controls", icon: "🛡️" },
    { id: "compliance", label: "Compliance", icon: "✅" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Organization Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            {organization.description && (
              <p className="text-gray-600 mt-1">{organization.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {organization.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && (
          <DashboardStats organizationId={organizationId as Id<"organizations">} />
        )}
        {activeTab === "risks" && (
          <RiskManagement organizationId={organizationId as Id<"organizations">} />
        )}
        {activeTab === "controls" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Controls Management</h2>
            <p className="text-gray-600">Controls management features coming soon...</p>
          </div>
        )}
        {activeTab === "compliance" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Compliance Management</h2>
            <p className="text-gray-600">Compliance management features coming soon...</p>
          </div>
        )}
        {activeTab === "integrations" && (
          <IntegrationManagement organizationId={organizationId as Id<"organizations">} />
        )}
      </div>
    </div>
  );
}
