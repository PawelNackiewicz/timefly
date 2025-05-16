import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useStore } from '@/lib/store';
import { 
  CalendarIcon, 
  ClockIcon, 
  DownloadIcon,
  FileTextIcon,
  BarChart4Icon,
  FilterIcon,
  SearchIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

const WorkTimeReporting = () => {
  const { employees, timeEntries } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)),  // First day of current month
    to: new Date()
  });
  
  // Filter time entries based on search, employee selection, and date range
  const filteredEntries = timeEntries.filter(entry => {
    const employee = employees.find(e => e.id === entry.employeeId);
    if (!employee) return false;
    
    // Filter by search term
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by employee selection
    const matchesEmployee = selectedEmployee === 'all' || entry.employeeId === selectedEmployee;
    
    // Filter by date range
    const entryDate = new Date(entry.clockIn);
    const isInDateRange = 
      (!dateRange.from || entryDate >= dateRange.from) && 
      (!dateRange.to || entryDate <= new Date(dateRange.to.setHours(23, 59, 59, 999)));
    
    return matchesSearch && matchesEmployee && isInDateRange;
  });

  // Calculate total hours for filtered entries
  const totalHours = filteredEntries.reduce((total, entry) => {
    if (!entry.clockOut) return total; // Skip ongoing entries
    
    const clockIn = new Date(entry.clockIn).getTime();
    const clockOut = new Date(entry.clockOut).getTime();
    return total + (clockOut - clockIn) / (1000 * 60 * 60);
  }, 0);
  
  // Calculate hours by department
  const departmentHours = employees.reduce((acc, employee) => {
    const dept = employee.department || 'Unassigned';
    
    const employeeEntries = filteredEntries.filter(entry => entry.employeeId === employee.id && entry.clockOut);
    const hours = employeeEntries.reduce((total, entry) => {
      const clockIn = new Date(entry.clockIn).getTime();
      const clockOut = new Date(entry.clockOut || new Date()).getTime();
      return total + (clockOut - clockIn) / (1000 * 60 * 60);
    }, 0);
    
    acc[dept] = (acc[dept] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);
  
  // Prepare department data for chart
  const departmentChartData = Object.entries(departmentHours).map(([name, hours]) => ({
    name,
    hours: parseFloat(hours.toFixed(1))
  }));
  
  // Create daily hours data
  const getDailyHoursData = () => {
    if (!dateRange.from || !dateRange.to) return [];
    
    const days: Record<string, number> = {};
    let currentDate = new Date(dateRange.from);
    let endDate = new Date(dateRange.to);
    
    // Initialize all days with 0 hours
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      days[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sum hours for each day
    filteredEntries.forEach(entry => {
      if (!entry.clockOut) return; // Skip ongoing entries
      
      const dateStr = new Date(entry.clockIn).toISOString().split('T')[0];
      if (days[dateStr] !== undefined) {
        const clockIn = new Date(entry.clockIn).getTime();
        const clockOut = new Date(entry.clockOut).getTime();
        days[dateStr] += (clockOut - clockIn) / (1000 * 60 * 60);
      }
    });
    
    // Convert to array format for chart
    return Object.entries(days).map(([date, hours]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: parseFloat(hours.toFixed(1))
    }));
  };
  
  const dailyHoursData = getDailyHoursData();
  
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
  
  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Work Time Reports</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="h-9">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Print View
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Select date range and employees to analyze work hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label>Date Range</Label>
                <DateRangePicker 
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total Hours</CardTitle>
              <CardDescription className="text-xs">For selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
              <p className="text-xs text-muted-foreground pt-1">
                From {filteredEntries.length} time entries
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Daily Average</CardTitle>
              <CardDescription className="text-xs">Hours per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dailyHoursData.length > 0 
                  ? (totalHours / dailyHoursData.length).toFixed(1) 
                  : "0.0"} hrs
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Across {dailyHoursData.length} days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Per Employee</CardTitle>
              <CardDescription className="text-xs">Average per person</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedEmployee !== 'all' || employees.length === 0
                  ? totalHours.toFixed(1)
                  : (totalHours / employees.length).toFixed(1)} hrs
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {selectedEmployee !== 'all' 
                  ? 'For selected employee' 
                  : `Across ${employees.length} employees`}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="entries" className="w-full">
          <TabsList>
            <TabsTrigger value="entries" className="flex items-center">
              <ClockIcon className="mr-2 h-4 w-4" />
              Time Entries
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center">
              <BarChart4Icon className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Time Entries</CardTitle>
                    <CardDescription>
                      Detailed work hours for selected period
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {filteredEntries.length} entries
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-center">
                            <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                            <h3 className="font-medium">No time entries found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Try adjusting your filters or selecting a different date range
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => {
                        const employee = employees.find(e => e.id === entry.employeeId);
                        
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                              {getEmployeeName(entry.employeeId)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(entry.clockIn), 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>
                              {entry.clockOut 
                                ? format(new Date(entry.clockOut), 'MMM d, yyyy h:mm a')
                                : 'Still working'}
                            </TableCell>
                            <TableCell>
                              {formatDuration(entry.clockIn, entry.clockOut)}
                            </TableCell>
                            <TableCell>
                              {employee?.department || 'Unassigned'}
                            </TableCell>
                            <TableCell className="text-right">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    <FilterIcon className="h-4 w-4" />
                                    <span className="sr-only">Details</span>
                                  </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Entry Details</h4>
                                    <div className="text-xs text-muted-foreground pt-1">
                                      <p>Employee: {getEmployeeName(entry.employeeId)}</p>
                                      <p>Position: {employee?.position || 'Unassigned'}</p>
                                      <p>Date: {format(new Date(entry.clockIn), 'EEEE, MMMM d, yyyy')}</p>
                                      <Separator className="my-2" />
                                      <p>Clock In: {format(new Date(entry.clockIn), 'h:mm a')}</p>
                                      {entry.clockOut && (
                                        <p>Clock Out: {format(new Date(entry.clockOut), 'h:mm a')}</p>
                                      )}
                                      <p>Duration: {formatDuration(entry.clockIn, entry.clockOut)}</p>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="charts">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Hours</CardTitle>
                  <CardDescription>
                    Hours worked per day during selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyHoursData} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value) => [`${value} hours`, 'Hours Worked']}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hours by Department</CardTitle>
                  <CardDescription>
                    Distribution of work hours across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="hours"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {departmentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} hours`]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkTimeReporting;