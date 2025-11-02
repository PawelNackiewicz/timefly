import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_-TuaRVNq.mjs';
/* empty css                                        */
import { $ as $$Layout } from '../../chunks/Layout_CpA_bpbY.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState } from 'react';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, L as Label, I as Input } from '../../chunks/label_BU7B6RIP.mjs';
import { S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, T as Tabs, a as TabsList, b as TabsTrigger, g as TabsContent, h as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell } from '../../chunks/select_zTQrCoIy.mjs';
import { c as cn, b as buttonVariants, B as Button } from '../../chunks/button_BCog2DPo.mjs';
import { format } from 'date-fns';
import { ChevronRight, ChevronLeft, Calendar as Calendar$1, DownloadIcon, FileTextIcon, SearchIcon, ClockIcon, BarChart4Icon, CalendarIcon, FilterIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { B as Badge } from '../../chunks/badge_BWrXtnIh.mjs';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { r as requireAuth } from '../../chunks/auth-guard_lLXD8xHU.mjs';
export { renderers } from '../../renderers.mjs';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn("p-3", className),
      classNames: {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames
      },
      components: {
        IconLeft: ({ ...props2 }) => /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
        IconRight: ({ ...props2 }) => /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

function DateRangePicker({
  date,
  onDateChange,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("grid gap-2", className), children: /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        id: "date",
        variant: "outline",
        className: cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        ),
        children: [
          /* @__PURE__ */ jsx(Calendar$1, { className: "mr-2 h-4 w-4" }),
          date?.from ? date.to ? /* @__PURE__ */ jsxs(Fragment, { children: [
            format(date.from, "LLL dd, y"),
            " -",
            " ",
            format(date.to, "LLL dd, y")
          ] }) : format(date.from, "LLL dd, y") : /* @__PURE__ */ jsx("span", { children: "Pick a date range" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "center", children: /* @__PURE__ */ jsx(
      Calendar,
      {
        initialFocus: true,
        mode: "range",
        defaultMonth: date?.from,
        selected: date,
        onSelect: (date2) => date2 && onDateChange(date2),
        numberOfMonths: 2
      }
    ) })
  ] }) });
}

const createDateWithHourOffset = (hourOffset) => {
  const date = /* @__PURE__ */ new Date();
  date.setHours(date.getHours() + hourOffset);
  return date.toISOString();
};
const createDateWithDayAndHourOffset = (dayOffset, hourOffset) => {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(date.getHours() + hourOffset);
  return date.toISOString();
};
const useStore = create()(
  persist(
    (set) => ({
      employees: [
        {
          id: "1",
          name: "John Doe",
          pin: "1234",
          department: "Operations",
          position: "Manager",
          active: true,
          clockedIn: false,
          clockInTime: null
        },
        {
          id: "2",
          name: "Jane Smith",
          pin: "2345",
          department: "Administration",
          position: "Admin Assistant",
          active: true,
          clockedIn: false,
          clockInTime: null
        },
        {
          id: "3",
          name: "Robert Johnson",
          pin: "3456",
          department: "Support",
          position: "Support Specialist",
          active: true,
          clockedIn: false,
          clockInTime: null
        }
      ],
      timeEntries: [
        {
          id: "1",
          employeeId: "1",
          clockIn: createDateWithHourOffset(-9),
          clockOut: createDateWithHourOffset(-5)
        },
        {
          id: "2",
          employeeId: "2",
          clockIn: createDateWithHourOffset(-8),
          clockOut: createDateWithHourOffset(-4)
        },
        {
          id: "3",
          employeeId: "3",
          clockIn: createDateWithHourOffset(-6),
          clockOut: createDateWithHourOffset(-2)
        },
        {
          id: "4",
          employeeId: "1",
          clockIn: createDateWithDayAndHourOffset(-1, 0),
          clockOut: createDateWithDayAndHourOffset(-1, 4)
        },
        {
          id: "5",
          employeeId: "2",
          clockIn: createDateWithDayAndHourOffset(-1, 0),
          clockOut: createDateWithDayAndHourOffset(-1, 5)
        },
        {
          id: "6",
          employeeId: "1",
          clockIn: createDateWithDayAndHourOffset(-2, 0),
          clockOut: createDateWithDayAndHourOffset(-2, 8)
        }
      ],
      addEmployee: (employee) => set((state) => ({
        employees: [...state.employees, employee]
      })),
      updateEmployee: (id, updates) => set((state) => ({
        employees: state.employees.map(
          (emp) => emp.id === id ? { ...emp, ...updates } : emp
        )
      })),
      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id)
      })),
      clockIn: (employeeId) => {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        set((state) => {
          const updatedEmployees = state.employees.map(
            (emp) => emp.id === employeeId ? { ...emp, clockedIn: true, clockInTime: now } : emp
          );
          const newEntry = {
            id: Date.now().toString(),
            employeeId,
            clockIn: now,
            clockOut: null
          };
          return {
            employees: updatedEmployees,
            timeEntries: [...state.timeEntries, newEntry]
          };
        });
      },
      clockOut: (employeeId) => {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        set((state) => {
          const updatedEmployees = state.employees.map(
            (emp) => emp.id === employeeId ? { ...emp, clockedIn: false, clockInTime: null } : emp
          );
          const updatedEntries = state.timeEntries.map(
            (entry) => entry.employeeId === employeeId && entry.clockOut === null ? { ...entry, clockOut: now } : entry
          );
          return {
            employees: updatedEmployees,
            timeEntries: updatedEntries
          };
        });
      }
    }),
    {
      name: "timetrack-storage"
    }
  )
);

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  HoverCardPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

const WorkTimeReporting = () => {
  const { employees, timeEntries } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: new Date((/* @__PURE__ */ new Date()).setDate(1)),
    // First day of current month
    to: /* @__PURE__ */ new Date()
  });
  const filteredEntries = timeEntries.filter((entry) => {
    const employee = employees.find((e) => e.id === entry.employeeId);
    if (!employee) return false;
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = selectedEmployee === "all" || entry.employeeId === selectedEmployee;
    const entryDate = new Date(entry.clockIn);
    const isInDateRange = (!dateRange.from || entryDate >= dateRange.from) && (!dateRange.to || entryDate <= new Date(dateRange.to.setHours(23, 59, 59, 999)));
    return matchesSearch && matchesEmployee && isInDateRange;
  });
  const totalHours = filteredEntries.reduce((total, entry) => {
    if (!entry.clockOut) return total;
    const clockIn = new Date(entry.clockIn).getTime();
    const clockOut = new Date(entry.clockOut).getTime();
    return total + (clockOut - clockIn) / (1e3 * 60 * 60);
  }, 0);
  const departmentHours = employees.reduce((acc, employee) => {
    const dept = employee.department || "Unassigned";
    const employeeEntries = filteredEntries.filter((entry) => entry.employeeId === employee.id && entry.clockOut);
    const hours = employeeEntries.reduce((total, entry) => {
      const clockIn = new Date(entry.clockIn).getTime();
      const clockOut = new Date(entry.clockOut || /* @__PURE__ */ new Date()).getTime();
      return total + (clockOut - clockIn) / (1e3 * 60 * 60);
    }, 0);
    acc[dept] = (acc[dept] || 0) + hours;
    return acc;
  }, {});
  const departmentChartData = Object.entries(departmentHours).map(([name, hours]) => ({
    name,
    hours: parseFloat(hours.toFixed(1))
  }));
  const getDailyHoursData = () => {
    if (!dateRange.from || !dateRange.to) return [];
    const days = {};
    let currentDate = new Date(dateRange.from);
    let endDate = new Date(dateRange.to);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      days[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    filteredEntries.forEach((entry) => {
      if (!entry.clockOut) return;
      const dateStr = new Date(entry.clockIn).toISOString().split("T")[0];
      if (days[dateStr] !== void 0) {
        const clockIn = new Date(entry.clockIn).getTime();
        const clockOut = new Date(entry.clockOut).getTime();
        days[dateStr] += (clockOut - clockIn) / (1e3 * 60 * 60);
      }
    });
    return Object.entries(days).map(([date, hours]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: parseFloat(hours.toFixed(1))
    }));
  };
  const dailyHoursData = getDailyHoursData();
  const getEmployeeName = (id) => {
    const employee = employees.find((e) => e.id === id);
    return employee ? employee.name : "Unknown Employee";
  };
  const formatDuration = (clockIn, clockOut) => {
    if (!clockOut) return "In progress";
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const durationHours = (end - start) / (1e3 * 60 * 60);
    const hours = Math.floor(durationHours);
    const minutes = Math.floor((durationHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
  return /* @__PURE__ */ jsx("div", { className: "container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Work Time Reports" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "h-9", children: [
          /* @__PURE__ */ jsx(DownloadIcon, { className: "mr-2 h-4 w-4" }),
          "Export Report"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "h-9", children: [
          /* @__PURE__ */ jsx(FileTextIcon, { className: "mr-2 h-4 w-4" }),
          "Print View"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Report Filters" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Select date range and employees to analyze work hours" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Date Range" }),
          /* @__PURE__ */ jsx(
            DateRangePicker,
            {
              date: dateRange,
              onDateChange: setDateRange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Employee" }),
          /* @__PURE__ */ jsxs(Select, { value: selectedEmployee, onValueChange: setSelectedEmployee, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select employee" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Employees" }),
              employees.map((emp) => /* @__PURE__ */ jsx(SelectItem, { value: emp.id, children: emp.name }, emp.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Search" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(SearchIcon, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Search by name...",
                className: "pl-8",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value)
              }
            )
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3 mb-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-medium", children: "Total Hours" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "For selected period" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            totalHours.toFixed(1),
            " hrs"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground pt-1", children: [
            "From ",
            filteredEntries.length,
            " time entries"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-medium", children: "Daily Average" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Hours per day" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            dailyHoursData.length > 0 ? (totalHours / dailyHoursData.length).toFixed(1) : "0.0",
            " hrs"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground pt-1", children: [
            "Across ",
            dailyHoursData.length,
            " days"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-medium", children: "Per Employee" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Average per person" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            selectedEmployee !== "all" || employees.length === 0 ? totalHours.toFixed(1) : (totalHours / employees.length).toFixed(1),
            " hrs"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground pt-1", children: selectedEmployee !== "all" ? "For selected employee" : `Across ${employees.length} employees` })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "entries", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "entries", className: "flex items-center", children: [
          /* @__PURE__ */ jsx(ClockIcon, { className: "mr-2 h-4 w-4" }),
          "Time Entries"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "charts", className: "flex items-center", children: [
          /* @__PURE__ */ jsx(BarChart4Icon, { className: "mr-2 h-4 w-4" }),
          "Analytics"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "entries", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Time Entries" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Detailed work hours for selected period" })
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
            filteredEntries.length,
            " entries"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Clock In" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Clock Out" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Duration" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Department" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: filteredEntries.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center py-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center text-center", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-10 w-10 text-muted-foreground/50 mb-2" }),
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "No time entries found" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Try adjusting your filters or selecting a different date range" })
          ] }) }) }) : filteredEntries.map((entry) => {
            const employee = employees.find((e) => e.id === entry.employeeId);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: getEmployeeName(entry.employeeId) }),
              /* @__PURE__ */ jsx(TableCell, { children: format(new Date(entry.clockIn), "MMM d, yyyy h:mm a") }),
              /* @__PURE__ */ jsx(TableCell, { children: entry.clockOut ? format(new Date(entry.clockOut), "MMM d, yyyy h:mm a") : "Still working" }),
              /* @__PURE__ */ jsx(TableCell, { children: formatDuration(entry.clockIn, entry.clockOut) }),
              /* @__PURE__ */ jsx(TableCell, { children: employee?.department || "Unassigned" }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(HoverCard, { children: [
                /* @__PURE__ */ jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0", children: [
                  /* @__PURE__ */ jsx(FilterIcon, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Details" })
                ] }) }),
                /* @__PURE__ */ jsx(HoverCardContent, { className: "w-80", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold", children: "Entry Details" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground pt-1", children: [
                    /* @__PURE__ */ jsxs("p", { children: [
                      "Employee: ",
                      getEmployeeName(entry.employeeId)
                    ] }),
                    /* @__PURE__ */ jsxs("p", { children: [
                      "Position: ",
                      employee?.position || "Unassigned"
                    ] }),
                    /* @__PURE__ */ jsxs("p", { children: [
                      "Date: ",
                      format(new Date(entry.clockIn), "EEEE, MMMM d, yyyy")
                    ] }),
                    /* @__PURE__ */ jsx(Separator, { className: "my-2" }),
                    /* @__PURE__ */ jsxs("p", { children: [
                      "Clock In: ",
                      format(new Date(entry.clockIn), "h:mm a")
                    ] }),
                    entry.clockOut && /* @__PURE__ */ jsxs("p", { children: [
                      "Clock Out: ",
                      format(new Date(entry.clockOut), "h:mm a")
                    ] }),
                    /* @__PURE__ */ jsxs("p", { children: [
                      "Duration: ",
                      formatDuration(entry.clockIn, entry.clockOut)
                    ] })
                  ] })
                ] }) })
              ] }) })
            ] }, entry.id);
          }) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "charts", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Daily Hours" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Hours worked per day during selected period" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: dailyHoursData, margin: { top: 20, right: 30, left: 0, bottom: 70 }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsx(
              XAxis,
              {
                dataKey: "date",
                angle: -45,
                textAnchor: "end",
                height: 70,
                tick: { fontSize: 12 }
              }
            ),
            /* @__PURE__ */ jsx(YAxis, { label: { value: "Hours", angle: -90, position: "insideLeft" } }),
            /* @__PURE__ */ jsx(
              Tooltip,
              {
                formatter: (value) => [`${value} hours`, "Hours Worked"],
                labelFormatter: (label) => `${label}`
              }
            ),
            /* @__PURE__ */ jsx(Bar, { dataKey: "hours", fill: "hsl(var(--primary))", radius: [4, 4, 0, 0] })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Hours by Department" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Distribution of work hours across departments" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(
              Pie,
              {
                data: departmentChartData,
                cx: "50%",
                cy: "50%",
                labelLine: false,
                outerRadius: 80,
                fill: "#8884d8",
                dataKey: "hours",
                label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
                children: departmentChartData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))
              }
            ),
            /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => [`${value} hours`] }),
            /* @__PURE__ */ jsx(Legend, {})
          ] }) }) }) })
        ] })
      ] }) })
    ] })
  ] }) });
};

const $$Astro = createAstro();
const $$Reports = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Reports;
  const redirect = requireAuth(Astro2);
  if (redirect) return redirect;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "TimeTrack - Work Time Reports" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-slate-50 dark:bg-slate-900"> ${renderComponent($$result2, "WorkTimeReporting", WorkTimeReporting, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/admin/WorkTimeReporting", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/pages/admin/reports.astro", void 0);

const $$file = "/Users/pawelnackiewicz/Projects/timefly/src/pages/admin/reports.astro";
const $$url = "/admin/reports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reports,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
