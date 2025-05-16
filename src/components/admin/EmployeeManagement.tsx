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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { 
  PlusIcon, 
  MoreHorizontalIcon, 
  PencilIcon, 
  TrashIcon,
  UsersIcon,
  SearchIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const EmployeeManagement = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    pin: '',
    department: null,
    position: '',
    status: true
  });

  const departments = ['Operations', 'Administration', 'Support', 'Sales', 'Development'];
  
  const handleAddEmployee = () => {
    // Simple PIN validation
    if (newEmployee.pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    
    if (!newEmployee.name) {
      toast.error('Employee name is required');
      return;
    }
    
    addEmployee({
      id: Date.now().toString(),
      name: newEmployee.name,
      pin: newEmployee.pin,
      department: newEmployee.department || 'Operations',
      position: newEmployee.position || 'Staff',
      active: newEmployee.status,
      clockedIn: false,
      clockInTime: null
    });
    
    toast.success('Employee added successfully');
    setNewEmployee({ name: '', pin: '', department: null, position: '', status: true });
    setIsAddDialogOpen(false);
  };
  
  const handleEditEmployee = () => {
    if (!selectedEmployee) return;
    
    // Simple PIN validation
    if (selectedEmployee.pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    
    updateEmployee(selectedEmployee.id, selectedEmployee);
    toast.success('Employee updated successfully');
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteEmployee = (id: string) => {
    deleteEmployee(id);
    toast.success('Employee removed successfully');
  };
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(search.toLowerCase()) ||
                          employee.department.toLowerCase().includes(search.toLowerCase()) ||
                          employee.position.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = !employeeDepartment || employee.department === employeeDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Employees</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 my-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={employeeDepartment || "all"} onValueChange={setEmployeeDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                    {filteredEmployees.length} employees
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeTable 
                  employees={filteredEmployees}
                  onEdit={(employee) => {
                    setSelectedEmployee(employee);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteEmployee}
                />
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
                    {filteredEmployees.filter(e => e.active).length} active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeTable 
                  employees={filteredEmployees.filter(e => e.active)}
                  onEdit={(employee) => {
                    setSelectedEmployee(employee);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteEmployee}
                />
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
                    {filteredEmployees.filter(e => !e.active).length} inactive
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeTable 
                  employees={filteredEmployees.filter(e => !e.active)}
                  onEdit={(employee) => {
                    setSelectedEmployee(employee);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteEmployee}
                />
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
              Add a new employee to the system. They'll be able to clock in using their PIN.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pin">PIN Code (4+ digits)</Label>
              <Input
                id="pin"
                value={newEmployee.pin}
                onChange={(e) => setNewEmployee({...newEmployee, pin: e.target.value.replace(/\D/g, '')})}
                placeholder="1234"
                type="password"
                maxLength={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={newEmployee.department || "Operations"} 
                onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                placeholder="Staff"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active Status</Label>
              <Switch 
                id="status" 
                checked={newEmployee.status}
                onCheckedChange={(checked) => setNewEmployee({...newEmployee, status: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>
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
              Make changes to employee information.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={selectedEmployee.name}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pin">PIN Code (4+ digits)</Label>
                <Input
                  id="edit-pin"
                  value={selectedEmployee.pin}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, pin: e.target.value.replace(/\D/g, '')})}
                  type="password"
                  maxLength={8}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select 
                  value={selectedEmployee.department || "Operations"} 
                  onValueChange={(value) => setSelectedEmployee({...selectedEmployee, department: value})}
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={selectedEmployee.position}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, position: e.target.value})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-status">Active Status</Label>
                <Switch 
                  id="edit-status" 
                  checked={selectedEmployee.active}
                  onCheckedChange={(checked) => setSelectedEmployee({...selectedEmployee, active: checked})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface EmployeeTableProps {
  employees: any[];
  onEdit: (employee: any) => void;
  onDelete: (id: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onEdit, onDelete }) => {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <UsersIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <h3 className="font-medium">No employees found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add a new employee to get started
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div>{employee.name}</div>
                      {employee.clockedIn && (
                        <span className="text-xs text-green-600 flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></div>
                          Currently working
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    employee.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {employee.active ? (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(employee)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(employee.id)}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeManagement;