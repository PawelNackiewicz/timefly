import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_-TuaRVNq.mjs';
/* empty css                                        */
import { $ as $$Layout } from '../../chunks/Layout_CpA_bpbY.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { I as Input, C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, L as Label } from '../../chunks/label_BU7B6RIP.mjs';
import { T as Tabs, a as TabsList, b as TabsTrigger, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, g as TabsContent, h as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell } from '../../chunks/select_zTQrCoIy.mjs';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ChevronRight, Check, Circle, PlusIcon, SearchIcon, Loader2Icon, UsersIcon, CheckIcon, XIcon, MoreHorizontalIcon, PencilIcon, KeyIcon, TrashIcon } from 'lucide-react';
import { c as cn, B as Button } from '../../chunks/button_BCog2DPo.mjs';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { B as Badge } from '../../chunks/badge_BWrXtnIh.mjs';
import { r as requireAuth } from '../../chunks/auth-guard_lLXD8xHU.mjs';
export { renderers } from '../../renderers.mjs';

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto h-4 w-4" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;

function QueryProvider({ children }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1e3,
          // 1 minute
          refetchOnWindowFocus: false,
          retry: 1
        }
      }
    })
  );
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children });
}

const fetchWorkers = async (params) => {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: "20"
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
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("Failed to fetch workers");
  }
  return response.json();
};
const createWorker = async (data) => {
  const response = await fetch("/api/workers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
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
  data
}) => {
  const response = await fetch(`/api/workers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Failed to update employee");
  }
  return result.data;
};
const updateWorkerPin = async ({
  id,
  data
}) => {
  const response = await fetch(`/api/workers/${id}/pin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("PIN already in use. Please use a different PIN.");
    }
    throw new Error(result.error?.message || "Failed to update PIN");
  }
};
const deleteWorker = async (id) => {
  const response = await fetch(`/api/workers/${id}`, {
    method: "DELETE",
    credentials: "include"
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
  const [employeeDepartment, setEmployeeDepartment] = useState(
    null
  );
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    pin: "",
    department: "",
    is_active: true
  });
  const [editEmployee, setEditEmployee] = useState({
    first_name: "",
    last_name: "",
    department: "",
    is_active: true
  });
  const [newPin, setNewPin] = useState("");
  const departments = [
    "Operations",
    "Administration",
    "Support",
    "Sales",
    "Development"
  ];
  const {
    data: workersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["workers", currentPage, search, employeeDepartment, activeTab],
    queryFn: () => fetchWorkers({
      page: currentPage,
      search,
      department: employeeDepartment,
      activeTab
    })
  });
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
        is_active: true
      });
      setIsAddDialogOpen(false);
    },
    onError: (error2) => {
      toast.error(error2.message);
    }
  });
  const updateWorkerMutation = useMutation({
    mutationFn: updateWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Employee updated successfully");
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error2) => {
      toast.error(error2.message);
    }
  });
  const updatePinMutation = useMutation({
    mutationFn: updateWorkerPin,
    onSuccess: () => {
      toast.success("PIN updated successfully");
      setIsPinDialogOpen(false);
      setSelectedEmployee(null);
      setNewPin("");
    },
    onError: (error2) => {
      toast.error(error2.message);
    }
  });
  const deleteWorkerMutation = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Employee deactivated successfully");
    },
    onError: (error2) => {
      toast.error(error2.message);
    }
  });
  useEffect(() => {
    setCurrentPage(1);
  }, [search, employeeDepartment, activeTab]);
  useEffect(() => {
    if (error) {
      toast.error("Failed to load employees");
    }
  }, [error]);
  const handleAddEmployee = () => {
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
      is_active: newEmployee.is_active
    });
  };
  const handleEditEmployee = () => {
    if (!selectedEmployee) return;
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
        is_active: editEmployee.is_active
      }
    });
  };
  const handleUpdatePin = () => {
    if (!selectedEmployee) return;
    if (newPin.length < 4 || newPin.length > 6) {
      toast.error("PIN must be 4-6 digits");
      return;
    }
    updatePinMutation.mutate({
      id: selectedEmployee.id,
      data: { new_pin: newPin }
    });
  };
  const handleDeleteEmployee = (id, fullName) => {
    if (!confirm(`Are you sure you want to deactivate ${fullName}?`)) {
      return;
    }
    deleteWorkerMutation.mutate(id);
  };
  const openEditDialog = (worker) => {
    setSelectedEmployee(worker);
    setEditEmployee({
      first_name: worker.first_name,
      last_name: worker.last_name,
      department: worker.department || "",
      is_active: worker.is_active
    });
    setIsEditDialogOpen(true);
  };
  const openPinDialog = (worker) => {
    setSelectedEmployee(worker);
    setNewPin("");
    setIsPinDialogOpen(true);
  };
  const workers = workersData?.data.workers || [];
  const pagination = workersData?.data.pagination || null;
  const isSubmitting = createWorkerMutation.isPending || updateWorkerMutation.isPending || updatePinMutation.isPending;
  return /* @__PURE__ */ jsxs("div", { className: "container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Employee Management" }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setIsAddDialogOpen(true), children: [
          /* @__PURE__ */ jsx(PlusIcon, { className: "mr-2 h-4 w-4" }),
          "Add Employee"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
        /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "all", children: "All Employees" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "active", children: "Active" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "inactive", children: "Inactive" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 my-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsx(SearchIcon, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Search employees by name...",
                className: "pl-8",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: employeeDepartment || "all",
              onValueChange: (val) => setEmployeeDepartment(val === "all" ? null : val),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Department" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Departments" }),
                  departments.map((dept) => /* @__PURE__ */ jsx(SelectItem, { value: dept, children: dept }, dept))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "all", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "All Employees" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Manage all registered employees" })
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "ml-4", children: [
              pagination?.total_items || 0,
              " employees"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(
              EmployeeTable,
              {
                employees: workers,
                isLoading,
                onEdit: openEditDialog,
                onUpdatePin: openPinDialog,
                onDelete: handleDeleteEmployee,
                isDeleting: deleteWorkerMutation.isPending
              }
            ),
            pagination && pagination.total_pages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setCurrentPage((p) => p - 1),
                  disabled: !pagination.has_previous,
                  children: "Previous"
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                "Page ",
                pagination.page,
                " of ",
                pagination.total_pages
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setCurrentPage((p) => p + 1),
                  disabled: !pagination.has_next,
                  children: "Next"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "active", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Active Employees" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Currently active employee accounts" })
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "ml-4", children: [
              pagination?.total_items || 0,
              " active"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(
              EmployeeTable,
              {
                employees: workers,
                isLoading,
                onEdit: openEditDialog,
                onUpdatePin: openPinDialog,
                onDelete: handleDeleteEmployee,
                isDeleting: deleteWorkerMutation.isPending
              }
            ),
            pagination && pagination.total_pages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setCurrentPage((p) => p - 1),
                  disabled: !pagination.has_previous,
                  children: "Previous"
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                "Page ",
                pagination.page,
                " of ",
                pagination.total_pages
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setCurrentPage((p) => p + 1),
                  disabled: !pagination.has_next,
                  children: "Next"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "inactive", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Inactive Employees" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Deactivated employee accounts" })
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "ml-4", children: [
              pagination?.total_items || 0,
              " inactive"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx(
              EmployeeTable,
              {
                employees: workers,
                isLoading,
                onEdit: openEditDialog,
                onUpdatePin: openPinDialog,
                onDelete: handleDeleteEmployee,
                isDeleting: deleteWorkerMutation.isPending
              }
            ),
            pagination && pagination.total_pages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setCurrentPage((p) => p - 1),
                  disabled: !pagination.has_previous,
                  children: "Previous"
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                "Page ",
                pagination.page,
                " of ",
                pagination.total_pages
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => setCurrentPage((p) => p + 1),
                  disabled: !pagination.has_next,
                  children: "Next"
                }
              )
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Add New Employee" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Add a new employee to the system. They'll be able to clock in using their PIN." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "first_name", children: "First Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "first_name",
              value: newEmployee.first_name,
              onChange: (e) => setNewEmployee({ ...newEmployee, first_name: e.target.value }),
              placeholder: "John",
              disabled: isSubmitting
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "last_name", children: "Last Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "last_name",
              value: newEmployee.last_name,
              onChange: (e) => setNewEmployee({ ...newEmployee, last_name: e.target.value }),
              placeholder: "Doe",
              disabled: isSubmitting
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "pin", children: "PIN Code (4-6 digits)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "pin",
              value: newEmployee.pin,
              onChange: (e) => setNewEmployee({
                ...newEmployee,
                pin: e.target.value.replace(/\D/g, "")
              }),
              placeholder: "1234",
              type: "password",
              maxLength: 6,
              disabled: isSubmitting
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "department", children: "Department (Optional)" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: newEmployee.department || "none",
              onValueChange: (value) => setNewEmployee({
                ...newEmployee,
                department: value === "none" ? "" : value
              }),
              disabled: isSubmitting,
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "department", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Department" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "No Department" }),
                  departments.map((dept) => /* @__PURE__ */ jsx(SelectItem, { value: dept, children: dept }, dept))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "status", children: "Active Status" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              id: "status",
              checked: newEmployee.is_active,
              onCheckedChange: (checked) => setNewEmployee({ ...newEmployee, is_active: checked }),
              disabled: isSubmitting
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setIsAddDialogOpen(false),
            disabled: isSubmitting,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs(Button, { onClick: handleAddEmployee, disabled: isSubmitting, children: [
          isSubmitting && /* @__PURE__ */ jsx(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Add Employee"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Employee" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Make changes to employee information. Use the separate PIN update option to change PIN." })
      ] }),
      selectedEmployee && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-first_name", children: "First Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit-first_name",
              value: editEmployee.first_name,
              onChange: (e) => setEditEmployee({
                ...editEmployee,
                first_name: e.target.value
              }),
              disabled: isSubmitting
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-last_name", children: "Last Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit-last_name",
              value: editEmployee.last_name,
              onChange: (e) => setEditEmployee({
                ...editEmployee,
                last_name: e.target.value
              }),
              disabled: isSubmitting
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-department", children: "Department (Optional)" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: editEmployee.department || "none",
              onValueChange: (value) => setEditEmployee({
                ...editEmployee,
                department: value === "none" ? "" : value
              }),
              disabled: isSubmitting,
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "edit-department", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Department" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "No Department" }),
                  departments.map((dept) => /* @__PURE__ */ jsx(SelectItem, { value: dept, children: dept }, dept))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-status", children: "Active Status" }),
          /* @__PURE__ */ jsx(
            Switch,
            {
              id: "edit-status",
              checked: editEmployee.is_active,
              onCheckedChange: (checked) => setEditEmployee({ ...editEmployee, is_active: checked }),
              disabled: isSubmitting
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setIsEditDialogOpen(false),
            disabled: isSubmitting,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs(Button, { onClick: handleEditEmployee, disabled: isSubmitting, children: [
          isSubmitting && /* @__PURE__ */ jsx(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Save Changes"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isPinDialogOpen, onOpenChange: setIsPinDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Update PIN" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "Update the PIN for ",
          selectedEmployee?.first_name,
          " ",
          selectedEmployee?.last_name
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-pin", children: "New PIN (4-6 digits)" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "new-pin",
            value: newPin,
            onChange: (e) => setNewPin(e.target.value.replace(/\D/g, "")),
            placeholder: "1234",
            type: "password",
            maxLength: 6,
            disabled: isSubmitting
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setIsPinDialogOpen(false),
            disabled: isSubmitting,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs(Button, { onClick: handleUpdatePin, disabled: isSubmitting, children: [
          isSubmitting && /* @__PURE__ */ jsx(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Update PIN"
        ] })
      ] })
    ] }) })
  ] });
};
const EmployeeTable = ({
  employees,
  isLoading,
  onEdit,
  onUpdatePin,
  onDelete,
  isDeleting
}) => {
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-10", children: /* @__PURE__ */ jsx(Loader2Icon, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "relative overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
    /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
      /* @__PURE__ */ jsx(TableHead, { className: "w-[250px]", children: "Name" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Department" }),
      /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
      /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx(TableBody, { children: employees.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "text-center py-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsx(UsersIcon, { className: "h-10 w-10 text-muted-foreground/50 mb-2" }),
      /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "No employees found" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: employees.length === 0 && !isLoading ? "Add a new employee to get started" : "Try adjusting your filters" })
    ] }) }) }) : employees.map((employee) => {
      const fullName = `${employee.first_name} ${employee.last_name}`;
      const initials = `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();
      return /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 text-sm font-semibold", children: initials }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { children: fullName }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "ID: ",
              employee.id.substring(0, 8)
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: employee.department || /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
          "span",
          {
            className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${employee.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`,
            children: employee.is_active ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(CheckIcon, { className: "mr-1 h-3 w-3" }),
              " Active"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(XIcon, { className: "mr-1 h-3 w-3" }),
              " Inactive"
            ] })
          }
        ) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 p-0",
              children: [
                /* @__PURE__ */ jsx(MoreHorizontalIcon, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Open menu" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onEdit(employee), children: [
              /* @__PURE__ */ jsx(PencilIcon, { className: "mr-2 h-4 w-4" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => onUpdatePin(employee), children: [
              /* @__PURE__ */ jsx(KeyIcon, { className: "mr-2 h-4 w-4" }),
              "Update PIN"
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(
              DropdownMenuItem,
              {
                className: "text-red-600",
                onClick: () => onDelete(employee.id, fullName),
                disabled: isDeleting,
                children: [
                  /* @__PURE__ */ jsx(TrashIcon, { className: "mr-2 h-4 w-4" }),
                  employee.is_active ? "Deactivate" : "Delete"
                ]
              }
            )
          ] })
        ] }) })
      ] }, employee.id);
    }) })
  ] }) });
};
const EmployeeManagement = () => {
  return /* @__PURE__ */ jsx(QueryProvider, { children: /* @__PURE__ */ jsx(EmployeeManagementContent, {}) });
};

const $$Astro = createAstro();
const $$Employees = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Employees;
  const redirect = requireAuth(Astro2);
  if (redirect) return redirect;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "TimeTrack - Employee Management" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-slate-50 dark:bg-slate-900"> ${renderComponent($$result2, "EmployeeManagement", EmployeeManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/admin/EmployeeManagement", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/pages/admin/employees.astro", void 0);

const $$file = "/Users/pawelnackiewicz/Projects/timefly/src/pages/admin/employees.astro";
const $$url = "/admin/employees";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Employees,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
