import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  SearchIcon,
  CheckIcon,
  XIcon,
  KeyIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { QueryProvider } from "@/components/providers/QueryProvider";

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

interface WorkersResponse {
  success: boolean;
  data: {
    workers: Worker[];
    pagination: PaginationData;
  };
}

interface CreateWorkerData {
  first_name: string;
  last_name: string;
  pin: string;
  department: string | null;
  is_active: boolean;
}

interface UpdateWorkerData {
  first_name: string;
  last_name: string;
  department: string | null;
  is_active: boolean;
}

interface UpdatePinData {
  new_pin: string;
}

// API Functions
const fetchWorkers = async (params: {
  page: number;
  search: string;
  department: string | null;
  activeTab: string;
}): Promise<WorkersResponse> => {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: "20",
  });

  if (params.search) {
    searchParams.append("search", params.search);
  }

  if (params.department && params.department !== "all") {
    searchParams.append("department", params.department);
  }

  if (params.activeTab === "active") {
    searchParams.append("is_active", "true");
  } else if (params.activeTab === "inactive") {
    searchParams.append("is_active", "false");
  }

  const response = await fetch(`/api/workers?${searchParams.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workers");
  }

  return response.json();
};

const createWorker = async (data: CreateWorkerData): Promise<Worker> => {
  const response = await fetch("/api/workers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("PIN already exists. Please use a different PIN.");
    }
    throw new Error(result.error?.message || "Failed to create employee");
  }

  return result.data;
};

const updateWorker = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateWorkerData;
}): Promise<Worker> => {
  const response = await fetch(`/api/workers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Failed to update employee");
  }

  return result.data;
};

const updateWorkerPin = async ({
  id,
  data,
}: {
  id: string;
  data: UpdatePinData;
}): Promise<void> => {
  const response = await fetch(`/api/workers/${id}/pin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("PIN already in use. Please use a different PIN.");
    }
    throw new Error(result.error?.message || "Failed to update PIN");
  }
};

const deleteWorker = async (id: string): Promise<void> => {
  const response = await fetch(`/api/workers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Failed to deactivate employee");
  }
};

const EmployeeManagementContent = () => {
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Worker | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    pin: "",
    department: "",
    is_active: true,
  });

  const [editEmployee, setEditEmployee] = useState({
    first_name: "",
    last_name: "",
    department: "",
    is_active: true,
  });

  const [newPin, setNewPin] = useState("");

  const departments = [
    "Operations",
    "Administration",
    "Support",
    "Sales",
    "Development",
  ];

  // Fetch workers query
  const {
    data: workersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workers", currentPage, search, employeeDepartment, activeTab],
    queryFn: () =>
      fetchWorkers({
        page: currentPage,
        search,
        department: employeeDepartment,
        activeTab,
      }),
  });

  // Create worker mutation
  const createWorkerMutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Employee added successfully");
      setNewEmployee({
        first_name: "",
        last_name: "",
        pin: "",
        department: "",
        is_active: true,
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add employee. Please try again.");
    },
  });

  // Update worker mutation
  const updateWorkerMutation = useMutation({
    mutationFn: updateWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Employee updated successfully");
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update PIN mutation
  const updatePinMutation = useMutation({
    mutationFn: updateWorkerPin,
    onSuccess: () => {
      toast.success("PIN updated successfully");
      setIsPinDialogOpen(false);
      setSelectedEmployee(null);
      setNewPin("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete worker mutation
  const deleteWorkerMutation = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Employee deactivated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, employeeDepartment, activeTab]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to load employees");
    }
  }, [error]);

  const handleAddEmployee = () => {
    // Validation
    if (!newEmployee.first_name.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!newEmployee.last_name.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (newEmployee.pin.length < 4 || newEmployee.pin.length > 6) {
      toast.error("PIN must be 4-6 digits");
      return;
    }

    createWorkerMutation.mutate({
      first_name: newEmployee.first_name,
      last_name: newEmployee.last_name,
      pin: newEmployee.pin,
      department: newEmployee.department || null,
      is_active: newEmployee.is_active,
    });
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee) return;

    // Validation
    if (!editEmployee.first_name.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!editEmployee.last_name.trim()) {
      toast.error("Last name is required");
      return;
    }

    updateWorkerMutation.mutate({
      id: selectedEmployee.id,
      data: {
        first_name: editEmployee.first_name,
        last_name: editEmployee.last_name,
        department: editEmployee.department || null,
        is_active: editEmployee.is_active,
      },
    });
  };

  const handleUpdatePin = () => {
    if (!selectedEmployee) return;

    // Validation
    if (newPin.length < 4 || newPin.length > 6) {
      toast.error("PIN must be 4-6 digits");
      return;
    }

    updatePinMutation.mutate({
      id: selectedEmployee.id,
      data: { new_pin: newPin },
    });
  };

  const handleDeleteEmployee = (id: string, fullName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${fullName}?`)) {
      return;
    }

    deleteWorkerMutation.mutate(id);
  };

  const openEditDialog = (worker: Worker) => {
    setSelectedEmployee(worker);
    setEditEmployee({
      first_name: worker.first_name,
      last_name: worker.last_name,
      department: worker.department || "",
      is_active: worker.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openPinDialog = (worker: Worker) => {
    setSelectedEmployee(worker);
    setNewPin("");
    setIsPinDialogOpen(true);
  };

  const workers = workersData?.data.workers || [];
  const pagination = workersData?.data.pagination || null;
  const isSubmitting =
    createWorkerMutation.isPending ||
    updateWorkerMutation.isPending ||
    updatePinMutation.isPending;

  return (
    <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Management
          </h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Employees</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 my-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={employeeDepartment || "all"}
              onValueChange={(val) =>
                setEmployeeDepartment(val === "all" ? null : val)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>All Employees</CardTitle>
                    <CardDescription>
                      Manage all registered employees
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {pagination?.total_items || 0} employees
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeTable
                  employees={workers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onUpdatePin={openPinDialog}
                  onDelete={handleDeleteEmployee}
                  isDeleting={deleteWorkerMutation.isPending}
                />
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={!pagination.has_previous}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.has_next}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Active Employees</CardTitle>
                    <CardDescription>
                      Currently active employee accounts
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {pagination?.total_items || 0} active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeTable
                  employees={workers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onUpdatePin={openPinDialog}
                  onDelete={handleDeleteEmployee}
                  isDeleting={deleteWorkerMutation.isPending}
                />
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={!pagination.has_previous}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.has_next}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Inactive Employees</CardTitle>
                    <CardDescription>
                      Deactivated employee accounts
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {pagination?.total_items || 0} inactive
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeTable
                  employees={workers}
                  isLoading={isLoading}
                  onEdit={openEditDialog}
                  onUpdatePin={openPinDialog}
                  onDelete={handleDeleteEmployee}
                  isDeleting={deleteWorkerMutation.isPending}
                />
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={!pagination.has_previous}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.has_next}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the system. They'll be able to clock in
              using their PIN.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={newEmployee.first_name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, first_name: e.target.value })
                }
                placeholder="John"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={newEmployee.last_name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, last_name: e.target.value })
                }
                placeholder="Doe"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pin">PIN Code (4-6 digits)</Label>
              <Input
                id="pin"
                value={newEmployee.pin}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    pin: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="1234"
                type="password"
                maxLength={6}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Select
                value={newEmployee.department || "none"}
                onValueChange={(value) =>
                  setNewEmployee({
                    ...newEmployee,
                    department: value === "none" ? "" : value,
                  })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active Status</Label>
              <Switch
                id="status"
                checked={newEmployee.is_active}
                onCheckedChange={(checked) =>
                  setNewEmployee({ ...newEmployee, is_active: checked })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Make changes to employee information. Use the separate PIN update
              option to change PIN.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-first_name">First Name</Label>
                <Input
                  id="edit-first_name"
                  value={editEmployee.first_name}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      first_name: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last_name">Last Name</Label>
                <Input
                  id="edit-last_name"
                  value={editEmployee.last_name}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      last_name: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department (Optional)</Label>
                <Select
                  value={editEmployee.department || "none"}
                  onValueChange={(value) =>
                    setEditEmployee({
                      ...editEmployee,
                      department: value === "none" ? "" : value,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-status">Active Status</Label>
                <Switch
                  id="edit-status"
                  checked={editEmployee.is_active}
                  onCheckedChange={(checked) =>
                    setEditEmployee({ ...editEmployee, is_active: checked })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditEmployee} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update PIN Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update PIN</DialogTitle>
            <DialogDescription>
              Update the PIN for {selectedEmployee?.first_name}{" "}
              {selectedEmployee?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-pin">New PIN (4-6 digits)</Label>
              <Input
                id="new-pin"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                type="password"
                maxLength={6}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPinDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePin} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface EmployeeTableProps {
  employees: Worker[];
  isLoading: boolean;
  onEdit: (employee: Worker) => void;
  onUpdatePin: (employee: Worker) => void;
  onDelete: (id: string, fullName: string) => void;
  isDeleting: boolean;
}

const EmployeeTable = ({
  employees,
  isLoading,
  onEdit,
  onUpdatePin,
  onDelete,
  isDeleting,
}: EmployeeTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <UsersIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <h3 className="font-medium">No employees found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {employees.length === 0 && !isLoading
                      ? "Add a new employee to get started"
                      : "Try adjusting your filters"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => {
              const fullName = `${employee.first_name} ${employee.last_name}`;
              const initials =
                `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();

              return (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 text-sm font-semibold">
                        {initials}
                      </div>
                      <div>
                        <div>{fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {employee.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.department || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        employee.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {employee.is_active ? (
                        <>
                          <CheckIcon className="mr-1 h-3 w-3" /> Active
                        </>
                      ) : (
                        <>
                          <XIcon className="mr-1 h-3 w-3" /> Inactive
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdatePin(employee)}>
                          <KeyIcon className="mr-2 h-4 w-4" />
                          Update PIN
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(employee.id, fullName)}
                          disabled={isDeleting}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          {employee.is_active ? "Deactivate" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Wrap the component with QueryProvider
const EmployeeManagement = () => {
  return (
    <QueryProvider>
      <EmployeeManagementContent />
    </QueryProvider>
  );
};

export default EmployeeManagement;
