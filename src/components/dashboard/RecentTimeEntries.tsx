import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { formatDistance } from 'date-fns';

interface RecentTimeEntriesProps {
  limit?: number;
}

const RecentTimeEntries: React.FC<RecentTimeEntriesProps> = ({ limit = 5 }) => {
  const { employees, timeEntries } = useStore();
  
  // Sort entries by clock in time (most recent first)
  const sortedEntries = [...timeEntries]
    .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
    .slice(0, limit);
  
  // Get employee name by ID
  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  // Format duration
  const formatDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 'In progress';
    
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    const hours = Math.floor(durationHours);
    const minutes = Math.floor((durationHours - hours) * 60);
    
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
          {sortedEntries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No time entries found
              </TableCell>
            </TableRow>
          ) : (
            sortedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{getEmployeeName(entry.employeeId)}</TableCell>
                <TableCell>
                  {new Date(entry.clockIn).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  <div className="text-xs text-muted-foreground">
                    {formatDistance(new Date(entry.clockIn), new Date(), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  {entry.clockOut ? (
                    <>
                      {new Date(entry.clockOut).toLocaleString([], { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      <div className="text-xs text-muted-foreground">
                        {formatDistance(new Date(entry.clockOut), new Date(), { addSuffix: true })}
                      </div>
                    </>
                  ) : (
                    'Still working'
                  )}
                </TableCell>
                <TableCell>{formatDuration(entry.clockIn, entry.clockOut)}</TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    entry.clockOut ? 'bg-slate-100 text-slate-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {entry.clockOut ? 'Completed' : 'Active'}
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