import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApiSuccessResponse,
  ToggleTimeRegistrationResponse,
} from "@/types";

// Define worker type for the clock kiosk
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

const ClockInOut = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"select" | "pin">("select");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successAction, setSuccessAction] = useState<"check_in" | "check_out">(
    "check_in"
  );
  const [showError, setShowError] = useState(false);

  // Fetch active workers
  const { data: workersData, isLoading: isLoadingWorkers } = useQuery({
    queryKey: ["active-workers"],
    queryFn: async () => {
      const response = await fetch("/api/workers/active");
      if (!response.ok) {
        throw new Error("Failed to fetch workers");
      }
      const result: ApiSuccessResponse<ActiveWorkersResponse> =
        await response.json();
      return result.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds to show real-time clock status
  });

  // Toggle clock in/out mutation
  const toggleMutation = useMutation({
    mutationFn: async (pin: string) => {
      const response = await fetch("/api/time-registrations/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to process request");
      }

      const result: ToggleTimeRegistrationResponse = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      // Refresh workers list to update clock status
      queryClient.invalidateQueries({ queryKey: ["active-workers"] });

      const time = format(new Date(), "h:mm a");
      const action = data.action === "check_in" ? "clocked in" : "clocked out";
      setSuccessMessage(`You have been ${action} at ${time}`);
      setSuccessAction(data.action);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedEmployee(null);
        setPin("");
        setStep("select");
      }, 3000);
    },
    onError: (error: Error) => {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setPin("");
    },
  });

  const employees = workersData?.workers || [];

  // Find the selected employee object
  const employee = selectedEmployee
    ? employees.find((e) => e.id === selectedEmployee)
    : null;

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmployee(empId);
    setStep("pin");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedEmployee(null);
    setPin("");
  };

  const handlePinSubmit = () => {
    if (!selectedEmployee || !pin) return;

    // Call the toggle mutation with the PIN
    toggleMutation.mutate(pin);
  };

  // Handle numeric button press
  const handleNumPress = (num: string) => {
    if (pin.length < 8) {
      // Limit PIN length
      setPin((prev) => prev + num);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Handle clear
  const handleClear = () => {
    setPin("");
  };

  // All employees from API are already active
  const activeEmployees = employees;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-green-500">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Success!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {successMessage}
                </p>
                {employee && (
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 h-20 w-20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">
                      {employee.first_name[0]}
                      {employee.last_name[0]}
                    </span>
                  </div>
                )}
                <p className="text-xl font-medium mt-2">
                  {employee && `${employee.first_name} ${employee.last_name}`}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {employee?.department || "No department"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : step === "select" ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Employee Clock In/Out
                </CardTitle>
                <CardDescription>
                  Select your name from the list below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingWorkers ? (
                  <div className="text-center py-8">
                    <Loader2Icon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 animate-spin" />
                    <h3 className="mt-4 text-lg font-medium">
                      Loading employees...
                    </h3>
                  </div>
                ) : activeEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium">
                      No employees found
                    </h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Ask your administrator to add employees to the system
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeEmployees.map((emp) => (
                      <Button
                        key={emp.id}
                        variant="outline"
                        className={`h-auto p-4 justify-start items-center text-left ${
                          emp.has_active_registration
                            ? "border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                            : ""
                        }`}
                        onClick={() => handleEmployeeSelect(emp.id)}
                      >
                        <div className="flex items-center w-full">
                          <div className="rounded-full bg-slate-100 dark:bg-slate-800 h-10 w-10 flex items-center justify-center mr-3">
                            <span className="font-bold">
                              {emp.first_name[0]}
                              {emp.last_name[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {emp.department || "No department"}
                            </div>
                          </div>
                          {emp.has_active_registration && (
                            <div className="ml-2 flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                              Working
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto rounded-full bg-slate-100 dark:bg-slate-800 h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">
                    {employee &&
                      `${employee.first_name[0]}${employee.last_name[0]}`}
                  </span>
                </div>
                <CardTitle className="text-2xl">
                  {employee && `${employee.first_name} ${employee.last_name}`}
                </CardTitle>
                <CardDescription>
                  {employee?.has_active_registration ? "Clock Out" : "Clock In"}{" "}
                  • Enter your PIN
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="PIN"
                      value={pin}
                      className="text-center text-lg py-6"
                      readOnly
                    />
                    <AnimatePresence>
                      {showError && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-full text-center text-red-500 text-sm mt-1"
                        >
                          Incorrect PIN. Please try again.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        className="py-6 text-xl"
                        onClick={() => handleNumPress(num.toString())}
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      className="py-6 text-xl"
                      onClick={handleClear}
                    >
                      C
                    </Button>
                    <Button
                      variant="outline"
                      className="py-6 text-xl"
                      onClick={() => handleNumPress("0")}
                    >
                      0
                    </Button>
                    <Button
                      variant="outline"
                      className="py-6 text-xl"
                      onClick={handleBackspace}
                    >
                      ←
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={toggleMutation.isPending}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePinSubmit}
                      disabled={!pin || toggleMutation.isPending}
                      className={
                        employee?.has_active_registration
                          ? "bg-amber-500 hover:bg-amber-600"
                          : ""
                      }
                    >
                      {toggleMutation.isPending ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ClockIcon className="mr-2 h-4 w-4" />
                          {employee?.has_active_registration
                            ? "Clock Out"
                            : "Clock In"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} TimeTrack • Employee Management System
        </p>
        <p className="text-sm mt-1">
          Current time: {format(new Date(), "EEEE, MMMM d, yyyy • h:mm:ss a")}
        </p>
      </div>
    </div>
  );
};

export default ClockInOut;
