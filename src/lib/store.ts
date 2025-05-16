import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types
interface Employee {
  id: string;
  name: string;
  pin: string;
  department: string;
  position: string;
  active: boolean;
  clockedIn: boolean;
  clockInTime: string | null;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut: string | null;
}

interface StoreState {
  employees: Employee[];
  timeEntries: TimeEntry[];
  
  // Actions
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
}

// Helper function to create date with offset hours
const createDateWithHourOffset = (hourOffset: number): string => {
  const date = new Date();
  date.setHours(date.getHours() + hourOffset);
  return date.toISOString();
};

// Helper function to create date with day offset and hour offset
const createDateWithDayAndHourOffset = (dayOffset: number, hourOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(date.getHours() + hourOffset);
  return date.toISOString();
};

// Create store with persistence
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      employees: [
        {
          id: '1',
          name: 'John Doe',
          pin: '1234',
          department: 'Operations',
          position: 'Manager',
          active: true,
          clockedIn: false,
          clockInTime: null
        },
        {
          id: '2',
          name: 'Jane Smith',
          pin: '2345',
          department: 'Administration',
          position: 'Admin Assistant',
          active: true,
          clockedIn: false,
          clockInTime: null
        },
        {
          id: '3',
          name: 'Robert Johnson',
          pin: '3456',
          department: 'Support',
          position: 'Support Specialist',
          active: true,
          clockedIn: false,
          clockInTime: null
        }
      ],
      timeEntries: [
        {
          id: '1',
          employeeId: '1',
          clockIn: createDateWithHourOffset(-9),
          clockOut: createDateWithHourOffset(-5)
        },
        {
          id: '2',
          employeeId: '2',
          clockIn: createDateWithHourOffset(-8),
          clockOut: createDateWithHourOffset(-4)
        },
        {
          id: '3',
          employeeId: '3',
          clockIn: createDateWithHourOffset(-6),
          clockOut: createDateWithHourOffset(-2)
        },
        {
          id: '4',
          employeeId: '1',
          clockIn: createDateWithDayAndHourOffset(-1, 0),
          clockOut: createDateWithDayAndHourOffset(-1, 4)
        },
        {
          id: '5',
          employeeId: '2',
          clockIn: createDateWithDayAndHourOffset(-1, 0),
          clockOut: createDateWithDayAndHourOffset(-1, 5)
        },
        {
          id: '6',
          employeeId: '1',
          clockIn: createDateWithDayAndHourOffset(-2, 0),
          clockOut: createDateWithDayAndHourOffset(-2, 8)
        }
      ],
      
      addEmployee: (employee) => 
        set((state) => ({
          employees: [...state.employees, employee]
        })),
      
      updateEmployee: (id, updates) => 
        set((state) => ({
          employees: state.employees.map((emp) => 
            emp.id === id ? { ...emp, ...updates } : emp
          )
        })),
      
      deleteEmployee: (id) => 
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id)
        })),
      
      clockIn: (employeeId) => {
        const now = new Date().toISOString();
        
        set((state) => {
          // Update employee status
          const updatedEmployees = state.employees.map((emp) => 
            emp.id === employeeId 
              ? { ...emp, clockedIn: true, clockInTime: now } 
              : emp
          );
          
          // Create new time entry
          const newEntry: TimeEntry = {
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
        const now = new Date().toISOString();
        
        set((state) => {
          // Update employee status
          const updatedEmployees = state.employees.map((emp) => 
            emp.id === employeeId 
              ? { ...emp, clockedIn: false, clockInTime: null } 
              : emp
          );
          
          // Find and update the open time entry
          const updatedEntries = state.timeEntries.map((entry) => 
            entry.employeeId === employeeId && entry.clockOut === null
              ? { ...entry, clockOut: now }
              : entry
          );
          
          return {
            employees: updatedEmployees,
            timeEntries: updatedEntries
          };
        });
      }
    }),
    {
      name: 'timetrack-storage'
    }
  )
);