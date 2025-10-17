import { QueryProvider } from "@/components/providers/QueryProvider";
import Dashboard from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";

/**
 * Wrapper component for Dashboard page
 * Provides React Query context for the dashboard
 */
export default function DashboardWrapper() {
  return (
    <QueryProvider>
      <Dashboard />
      <Toaster />
    </QueryProvider>
  );
}
