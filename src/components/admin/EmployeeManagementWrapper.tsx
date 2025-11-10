import { QueryProvider } from "@/components/providers/QueryProvider";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import { Toaster } from "@/components/ui/sonner";

/**
 * Wrapper component for Employee Management page
 * Provides React Query context and Toaster for the employee management interface
 */
export default function EmployeeManagementWrapper() {
  return (
    <QueryProvider>
      <EmployeeManagement />
      <Toaster />
    </QueryProvider>
  );
}
