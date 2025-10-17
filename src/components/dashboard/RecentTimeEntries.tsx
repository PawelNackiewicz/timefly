import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistance } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import type { ApiSuccessResponse, RecentTimeEntryDTO } from "@/types";

interface RecentTimeEntriesProps {
  limit?: number;
}

const RecentTimeEntries: React.FC<RecentTimeEntriesProps> = ({ limit = 5 }) => {
  // Fetch recent entries from API
  const { data, isLoading } = useQuery({
    queryKey: ["recent-entries", limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/dashboard/recent-entries?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recent entries");
      }
      const result: ApiSuccessResponse<{ entries: RecentTimeEntryDTO[] }> =
        await response.json();
      return result.data.entries;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const entries = data || [];

  // Format duration
  const formatDuration = (
    checkIn: string,
    checkOut: string | null,
    durationHours?: number
  ) => {
    if (!checkOut) return "In progress";

    if (durationHours) {
      const hours = Math.floor(durationHours);
      const minutes = Math.floor((durationHours - hours) * 60);
      return `${hours}h ${minutes}m`;
    }

    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const duration = (end - start) / (1000 * 60 * 60);

    const hours = Math.floor(duration);
    const minutes = Math.floor((duration - hours) * 60);

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                <div className="flex items-center justify-center">
                  <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
                  Loading entries...
                </div>
              </TableCell>
            </TableRow>
          ) : entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                No time entries found
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {entry.worker.first_name} {entry.worker.last_name}
                </TableCell>
                <TableCell>
                  {new Date(entry.check_in).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <div className="text-xs text-muted-foreground">
                    {formatDistance(new Date(entry.check_in), new Date(), {
                      addSuffix: true,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {entry.check_out ? (
                    <>
                      {new Date(entry.check_out).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <div className="text-xs text-muted-foreground">
                        {formatDistance(new Date(entry.check_out), new Date(), {
                          addSuffix: true,
                        })}
                      </div>
                    </>
                  ) : (
                    "Still working"
                  )}
                </TableCell>
                <TableCell>
                  {formatDuration(
                    entry.check_in,
                    entry.check_out,
                    entry.duration_hours
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.status === "completed"
                        ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    }`}
                  >
                    {entry.status === "completed" ? "Completed" : "Active"}
                    {entry.manual_intervention && (
                      <span className="ml-1" title="Manual intervention">
                        ⚠
                      </span>
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentTimeEntries;
