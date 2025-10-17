import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UsersIcon,
  ClockIcon,
  UserCheckIcon,
  CalendarIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "./StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentTimeEntries from "./RecentTimeEntries";
import WorkHoursChart from "./WorkHoursChart";
import { useQuery } from "@tanstack/react-query";
import type { ApiSuccessResponse, DashboardStatsDTO } from "@/types";

// Define worker type for currently working list
interface ActiveWorker {
  id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  has_active_registration: boolean;
}

interface ActiveWorkersResponse {
  workers: ActiveWorker[];
}

const Dashboard = () => {
  // Fetch dashboard stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const result: ApiSuccessResponse<DashboardStatsDTO> =
        await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active workers for "Currently Working" section
  const { data: workersData, isLoading: isLoadingWorkers } = useQuery({
    queryKey: ["active-workers-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/workers/active");
      if (!response.ok) {
        throw new Error("Failed to fetch workers");
      }
      const result: ApiSuccessResponse<ActiveWorkersResponse> =
        await response.json();
      return result.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const stats = statsData;
  const currentlyWorking =
    workersData?.workers.filter((w) => w.has_active_registration) || [];

  // Calculate derived stats
  const totalEmployees = stats?.workers.total || 0;
  const currentlyClockedIn = stats?.workers.with_active_registration || 0;
  const hoursToday = stats?.recent_activity.today_hours || 0;
  const avgHoursPerEmployee =
    totalEmployees > 0 ? hoursToday / totalEmployees : 0;

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

        {isLoadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Employees"
              value={totalEmployees}
              description="Registered employees"
              icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
              trend={{
                value: `${stats?.workers.active || 0} active`,
                text: "employees",
              }}
            />

            <StatsCard
              title="Currently Working"
              value={currentlyClockedIn}
              description="Clocked in now"
              icon={<UserCheckIcon className="h-4 w-4 text-muted-foreground" />}
              trend={{
                value:
                  currentlyClockedIn > 0 && totalEmployees > 0
                    ? `${Math.round(
                        (currentlyClockedIn / totalEmployees) * 100
                      )}%`
                    : "0%",
                text: "of total employees",
              }}
            />

            <StatsCard
              title="Hours Today"
              value={hoursToday.toFixed(1)}
              description="Total hours worked"
              icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
              trend={{
                value: `${stats?.recent_activity.today_registrations || 0}`,
                text: "registrations today",
              }}
            />

            <StatsCard
              title="Avg. Hours/Employee"
              value={avgHoursPerEmployee.toFixed(1)}
              description="Today's average"
              icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
              trend={{
                value: `${
                  stats?.work_hours.average_per_registration.toFixed(1) || "0.0"
                } hrs`,
                text: "avg per registration",
              }}
            />
          </div>
        )}

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
                    {isLoadingWorkers ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Loader2Icon className="h-10 w-10 text-muted-foreground/50 animate-spin" />
                        <h3 className="mt-4 text-lg font-medium">
                          Loading workers...
                        </h3>
                      </div>
                    ) : currentlyWorking.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ClockIcon className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">
                          No employees clocked in
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Employees will appear here when they clock in
                        </p>
                      </div>
                    ) : (
                      currentlyWorking.map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {worker.first_name[0]}
                                {worker.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {worker.first_name} {worker.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {worker.department || "No department"}
                              </p>
                            </div>
                          </div>
                          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        </div>
                      ))
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
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
                  <CardDescription>Frequently used tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      asChild
                    >
                      <a href="/admin/employees">
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Manage Employees
                      </a>
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      asChild
                    >
                      <a href="/admin/reports">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        View Reports
                      </a>
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      asChild
                    >
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
                    Hours worked by department (estimated)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingStats ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Administration
                            </span>
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
                            <span className="text-muted-foreground">
                              Operations
                            </span>
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
                            <span className="text-muted-foreground">
                              Support
                            </span>
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

                        <p className="text-xs text-muted-foreground italic pt-2">
                          Note: Department breakdown is estimated. API endpoint
                          needed for accurate data.
                        </p>
                      </>
                    )}
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
