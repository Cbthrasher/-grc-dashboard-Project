import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface IntegrationManagementProps {
  organizationId: Id<"organizations">;
}

export function IntegrationManagement({ organizationId }: IntegrationManagementProps) {
  const integrations = useQuery(api.integrations.list, { organizationId });
  const createIntegration = useMutation(api.integrations.create);
  const testConnection = useAction(api.integrations.testConnection);
  const syncData = useAction(api.integrations.syncData);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "api" as const,
    endpoint: "",
    syncFrequency: "daily" as const,
    config: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createIntegration({
        organizationId,
        name: formData.name,
        type: formData.type,
        endpoint: formData.endpoint || undefined,
        syncFrequency: formData.syncFrequency,
        config: formData.config || undefined,
      });
      
      toast.success("Integration created successfully");
      setShowCreateForm(false);
      setFormData({
        name: "",
        type: "api",
        endpoint: "",
        syncFrequency: "daily",
        config: "",
      });
    } catch (error) {
      toast.error("Failed to create integration");
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setTestingConnection(integrationId);
    try {
      const result = await testConnection({ integrationId: integrationId as Id<"integrations"> });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Connection test failed");
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      const result = await syncData({ integrationId: integrationId as Id<"integrations"> });
      toast.success(`Sync completed: ${result.recordsProcessed} records processed, ${result.recordsUpdated} updated, ${result.recordsCreated} created`);
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "inactive": return "text-gray-600 bg-gray-100";
      case "error": return "text-red-600 bg-red-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "api": return "🔗";
      case "webhook": return "📡";
      case "file_import": return "📁";
      case "database": return "🗄️";
      case "siem": return "🛡️";
      case "erp": return "📊";
      case "hrms": return "👥";
      default: return "🔧";
    }
  };

  if (!integrations) {
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Integrations</h2>
          <p className="text-gray-600 mt-1">Connect your existing systems to streamline GRC processes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Add Integration
        </button>
      </div>

      {/* Integration Types Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Supported Integration Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
          <div>🔗 REST APIs</div>
          <div>📡 Webhooks</div>
          <div>📁 File Import</div>
          <div>🗄️ Databases</div>
          <div>🛡️ SIEM Systems</div>
          <div>📊 ERP Systems</div>
          <div>👥 HRMS</div>
          <div>🔧 Custom</div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Integration</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Integration Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Salesforce CRM"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Integration Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="api">REST API</option>
                  <option value="webhook">Webhook</option>
                  <option value="file_import">File Import</option>
                  <option value="database">Database</option>
                  <option value="siem">SIEM System</option>
                  <option value="erp">ERP System</option>
                  <option value="hrms">HRMS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.example.com/v1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sync Frequency
                </label>
                <select
                  value={formData.syncFrequency}
                  onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="real_time">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuration (JSON)
              </label>
              <textarea
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder='{"apiKey": "your-api-key", "timeout": 30}'
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Create Integration
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Integrations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{integration.type.replace("_", " ")}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(integration.status)}`}>
                {integration.status}
              </span>
            </div>

            {integration.endpoint && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Endpoint</p>
                <p className="text-sm text-gray-700 truncate">{integration.endpoint}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Sync Frequency</p>
              <p className="text-sm text-gray-700 capitalize">{integration.syncFrequency.replace("_", " ")}</p>
            </div>

            {integration.lastSync && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                <p className="text-sm text-gray-700">
                  {new Date(integration.lastSync).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleTestConnection(integration._id)}
                disabled={testingConnection === integration._id}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {testingConnection === integration._id ? "Testing..." : "Test"}
              </button>
              
              {integration.status === "active" && (
                <button
                  onClick={() => handleSync(integration._id)}
                  disabled={syncing === integration._id}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {syncing === integration._id ? "Syncing..." : "Sync"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🔗</div>
            <p className="text-lg font-medium">No integrations configured</p>
            <p className="mt-1">Connect your existing systems to automate GRC data collection and reporting.</p>
          </div>
        </div>
      )}
    </div>
  );
}
