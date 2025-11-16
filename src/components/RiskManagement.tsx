import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface RiskManagementProps {
  organizationId: Id<"organizations">;
}

export function RiskManagement({ organizationId }: RiskManagementProps) {
  const risks = useQuery(api.risks.list, { organizationId });
  const createRisk = useMutation(api.risks.create);
  const updateRisk = useMutation(api.risks.update);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: "operational" | "financial" | "strategic" | "compliance" | "technology" | "reputational";
    likelihood: "very_low" | "low" | "medium" | "high" | "very_high";
    impact: "very_low" | "low" | "medium" | "high" | "very_high";
    owner: Id<"users">;
  }>({
    title: "",
    description: "",
    category: "operational",
    likelihood: "medium",
    impact: "medium",
    owner: "" as Id<"users">,
  });

  const loggedInUser = useQuery(api.auth.loggedInUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) return;

    try {
      if (editingRisk) {
        await updateRisk({
          riskId: editingRisk as Id<"risks">,
          title: formData.title,
          description: formData.description,
          likelihood: formData.likelihood,
          impact: formData.impact,
        });
        toast.success("Risk updated successfully");
        setEditingRisk(null);
      } else {
        await createRisk({
          organizationId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          likelihood: formData.likelihood,
          impact: formData.impact,
          owner: formData.owner || loggedInUser._id,
        });
        toast.success("Risk created successfully");
        setShowCreateForm(false);
      }
      
      setFormData({
        title: "",
        description: "",
        category: "operational",
        likelihood: "medium",
        impact: "medium",
        owner: "" as Id<"users">,
      });
    } catch (error) {
      toast.error("Failed to save risk");
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-red-600 bg-red-100";
    if (score >= 9) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "identified": return "text-blue-600 bg-blue-100";
      case "assessed": return "text-yellow-600 bg-yellow-100";
      case "mitigated": return "text-green-600 bg-green-100";
      case "accepted": return "text-gray-600 bg-gray-100";
      case "transferred": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (!risks) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-16 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Risk Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Add Risk
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingRisk) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingRisk ? "Edit Risk" : "Create New Risk"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operational">Operational</option>
                  <option value="financial">Financial</option>
                  <option value="strategic">Strategic</option>
                  <option value="compliance">Compliance</option>
                  <option value="technology">Technology</option>
                  <option value="reputational">Reputational</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Likelihood
                </label>
                <select
                  value={formData.likelihood}
                  onChange={(e) => setFormData({ ...formData, likelihood: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="very_low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact
                </label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="very_low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                {editingRisk ? "Update Risk" : "Create Risk"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingRisk(null);
                  setFormData({
                    title: "",
                    description: "",
                    category: "operational",
                    likelihood: "medium",
                    impact: "medium",
                    owner: "" as Id<"users">,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Risk List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {risks.map((risk) => (
                <tr key={risk._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {risk.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                      {risk.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskScoreColor(risk.riskScore)}`}>
                      {risk.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(risk.status)}`}>
                      {risk.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {risk.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingRisk(risk._id);
                        setFormData({
                          title: risk.title,
                          description: risk.description,
                          category: risk.category,
                          likelihood: risk.likelihood,
                          impact: risk.impact,
                          owner: risk.owner,
                        });
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {risks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No risks found</p>
              <p className="mt-1">Get started by creating your first risk assessment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
