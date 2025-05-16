import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  UsersIcon, 
  ClockIcon, 
  UserCheckIcon, 
  CalendarIcon,
  ArrowRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from './StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecentTimeEntries from './RecentTimeEntries';
import { useStore } from '@/lib/store';
import WorkHoursChart from './WorkHoursChart';

const Dashboard = () => {
  const { employees, timeEntries } = useStore();
  
  // Calculate stats
  const totalEmployees = employees.length;
  const currentlyClockedIn = employees.filter(emp => emp.clockedIn).length;
  
  // Calculate total hours worked today
  const today = new Date().toISOString().split('T')[0];
  const hoursToday = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.clockIn).toISOString().split('T')[0];
      return entryDate === today && entry.clockOut;
    })
    .reduce((acc, entry) => {
      const clockIn = new Date(entry.clockIn).getTime();
      const clockOut = new Date(entry.clockOut || new Date()).getTime();
      return acc + (clockOut - clockIn) / (1000 * 60 * 60);
    }, 0);

  return (
    <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Today
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Employees"
            value={totalEmployees}
            description="Registered employees"
            icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
            trend={{
              value: "+0%",
              text: "from last month"
            }}
          />
          
          <StatsCard 
            title="Currently Working"
            value={currentlyClockedIn}
            description="Clocked in now"
            icon={<UserCheckIcon className="h-4 w-4 text-muted-foreground" />}
            trend={{
              value: currentlyClockedIn > 0 ? `${Math.round((currentlyClockedIn / totalEmployees) * 100)}%` : "0%",
              text: "of total employees"
            }}
          />
          
          <StatsCard 
            title="Hours Today"
            value={hoursToday.toFixed(1)}
            description="Total hours worked"
            icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
            trend={{
              value: "+0%",
              text: "from yesterday"
            }}
          />
          
          <StatsCard 
            title="Avg. Hours/Employee"
            value={totalEmployees > 0 ? (hoursToday / totalEmployees).toFixed(1) : "0.0"}
            description="Today's average"
            icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
            trend={{
              value: "+0%",
              text: "from last week"
            }}
          />
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Work Hours This Week</CardTitle>
                  <CardDescription>
                    Total hours worked by all employees
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <WorkHoursChart />
                </CardContent>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Currently Working</CardTitle>
                  <CardDescription>
                    Employees clocked in right now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employees.filter(emp => emp.clockedIn).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ClockIcon className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No employees clocked in</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Employees will appear here when they clock in
                        </p>
                      </div>
                    ) : (
                      employees
                        .filter(emp => emp.clockedIn)
                        .map(employee => (
                          <div key={employee.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium leading-none">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {employee.clockInTime ? `Since ${new Date(employee.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Working'}
                                </p>
                              </div>
                            </div>
                            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                          </div>
                        ))
                    )}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="/admin/employees">
                          View all employees
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Frequently used tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/admin/employees">
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Manage Employees
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/admin/reports">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        View Reports
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/clock">
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Clock In/Out Portal
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Today's Stats</CardTitle>
                  <CardDescription>
                    Hours worked by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Administration</span>
                        <span className="font-medium">
                          {(hoursToday * 0.3).toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: "30%" }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Operations</span>
                        <span className="font-medium">
                          {(hoursToday * 0.5).toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: "50%" }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Support</span>
                        <span className="font-medium">
                          {(hoursToday * 0.2).toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: "20%" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
                <CardDescription>
                  Latest employee clock in/out activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTimeEntries limit={10} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;