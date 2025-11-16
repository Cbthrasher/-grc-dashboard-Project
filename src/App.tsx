import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { GRCDashboard } from "./components/GRCDashboard";
import { OrganizationSelector } from "./components/OrganizationSelector";
import { useState } from "react";

export default function App() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-primary">GRC Dashboard</h2>
          <Authenticated>
            <OrganizationSelector 
              selectedOrgId={selectedOrgId} 
              onSelectOrg={setSelectedOrgId} 
            />
          </Authenticated>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1">
        <Content selectedOrgId={selectedOrgId} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ selectedOrgId }: { selectedOrgId: string | null }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Authenticated>
        {selectedOrgId ? (
          <GRCDashboard organizationId={selectedOrgId} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Welcome to GRC Dashboard
              </h2>
              <p className="text-gray-500">
                Select an organization to get started, or create a new one.
              </p>
            </div>
          </div>
        )}
      </Authenticated>
      
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">
                GRC Management Platform
              </h1>
              <p className="text-xl text-secondary">
                Governance, Risk & Compliance made simple
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
