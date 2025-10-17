import { QueryProvider } from "@/components/providers/QueryProvider";
import ClockInOut from "@/components/employee/ClockInOut";
import { Toaster } from "@/components/ui/sonner";

/**
 * Wrapper component for Clock In/Out page
 * Provides React Query context for the entire clock interface
 */
export default function ClockWrapper() {
  return (
    <QueryProvider>
      <ClockInOut />
      <Toaster />
    </QueryProvider>
  );
}
