import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/lib/store";
import { AlertCircleIcon } from "lucide-react";

const WorkHoursChart = () => {
  const { timeEntries } = useStore();

  // Get days of current week
  const getDaysOfWeek = () => {
    const days = [];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = now.getDate() - dayOfWeek; // get Monday date

    // Create array of dates for this week
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(diff + i);
      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toISOString().split("T")[0],
      });
    }

    return days;
  };

  const days = getDaysOfWeek();

  // Calculate hours for each day
  const data = days.map((day) => {
    const hoursForDay = timeEntries
      .filter((entry) => {
        const entryDate = new Date(entry.clockIn).toISOString().split("T")[0];
        return entryDate === day.date && entry.clockOut;
      })
      .reduce((total, entry) => {
        const clockIn = new Date(entry.clockIn).getTime();
        const clockOut = new Date(entry.clockOut || new Date()).getTime();
        return total + (clockOut - clockIn) / (1000 * 60 * 60);
      }, 0);

    return {
      day: day.day,
      hours: parseFloat(hoursForDay.toFixed(1)),
    };
  });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10">
        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
          <AlertCircleIcon className="h-3 w-3" />
          <span>Mock data - API needed</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value) => [`${value} hours`, "Hours Worked"]}
            labelFormatter={(label) => `${label}`}
          />
          <Bar
            dataKey="hours"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkHoursChart;
