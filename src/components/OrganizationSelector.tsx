import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface OrganizationSelectorProps {
  selectedOrgId: string | null;
  onSelectOrg: (orgId: string | null) => void;
}

export function OrganizationSelector({ selectedOrgId, onSelectOrg }: OrganizationSelectorProps) {
  const organizations = useQuery(api.organizations.list);
  const createOrganization = useMutation(api.organizations.create);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsCreating(true);
    try {
      const orgId = await createOrganization({
        name: newOrgName.trim(),
        description: newOrgDescription.trim() || undefined,
      });
      onSelectOrg(orgId);
      setShowCreateForm(false);
      setNewOrgName("");
      setNewOrgDescription("");
      toast.success("Organization created successfully");
    } catch (error) {
      toast.error("Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  if (!organizations) {
    return <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>;
  }

  const selectedOrg = organizations.find(org => org?._id === selectedOrgId);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={selectedOrgId || ""}
          onChange={(e) => onSelectOrg(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org?._id} value={org?._id}>
              {org?.name} ({org?.role})
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + New
        </button>
      </div>

      {showCreateForm && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
          <form onSubmit={handleCreateOrg}>
            <h3 className="font-semibold text-gray-900 mb-3">Create Organization</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Organization name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newOrgDescription}
                onChange={(e) => setNewOrgDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description"
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating || !newOrgName.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
