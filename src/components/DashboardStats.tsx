import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface DashboardStatsProps {
  organizationId: Id<"organizations">;
}

export function DashboardStats({ organizationId }: DashboardStatsProps) {
  const stats = useQuery(api.organizations.getDashboardStats, { organizationId });
  const riskMatrix = useQuery(api.risks.getRiskMatrix, { organizationId });

  if (!stats || !riskMatrix) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, color }: {
    title: string;
    value: number;
    subtitle: string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  const RiskMatrixCell = ({ likelihood, impact, count }: {
    likelihood: string;
    impact: string;
    count: number;
  }) => {
    const getColor = () => {
      const score = (["very_low", "low", "medium", "high", "very_high"].indexOf(likelihood) + 1) *
                   (["very_low", "low", "medium", "high", "very_high"].indexOf(impact) + 1);
      
      if (score >= 15) return "bg-red-500";
      if (score >= 9) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <div className={`${getColor()} text-white p-2 text-center rounded text-sm font-medium`}>
        {count}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Risks"
          value={stats.risks.total}
          subtitle={`${stats.risks.high} high priority`}
          color="text-red-600"
        />
        <StatCard
          title="Controls"
          value={stats.controls.total}
          subtitle={`${stats.controls.effective} effective`}
          color="text-blue-600"
        />
        <StatCard
          title="Compliance Items"
          value={stats.compliance.total}
          subtitle={`${stats.compliance.compliant} compliant`}
          color="text-green-600"
        />
      </div>

      {/* Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.risks.high / stats.risks.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.risks.high}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(stats.risks.medium / stats.risks.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.risks.medium}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.risks.low / stats.risks.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.risks.low}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Heat Map</h3>
          <div className="grid grid-cols-6 gap-1 text-xs">
            <div></div>
            <div className="text-center font-medium">Very Low</div>
            <div className="text-center font-medium">Low</div>
            <div className="text-center font-medium">Medium</div>
            <div className="text-center font-medium">High</div>
            <div className="text-center font-medium">Very High</div>
            
            {["very_high", "high", "medium", "low", "very_low"].map((likelihood) => (
              <>
                <div key={likelihood} className="font-medium capitalize py-2">
                  {likelihood.replace("_", " ")}
                </div>
                {["very_low", "low", "medium", "high", "very_high"].map((impact) => (
                  <RiskMatrixCell
                    key={`${likelihood}-${impact}`}
                    likelihood={likelihood}
                    impact={impact}
                    count={riskMatrix[likelihood][impact]}
                  />
                ))}
              </>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Impact →
          </div>
        </div>
      </div>

      {/* Control Effectiveness */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Control Effectiveness</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.controls.effective}</div>
            <div className="text-sm text-gray-600">Effective</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.controls.partiallyEffective}</div>
            <div className="text-sm text-gray-600">Partially Effective</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.controls.ineffective}</div>
            <div className="text-sm text-gray-600">Ineffective</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.controls.notTested}</div>
            <div className="text-sm text-gray-600">Not Tested</div>
          </div>
        </div>
      </div>
    </div>
  );
}
