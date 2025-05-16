import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ClockInOut = () => {
  const { employees, timeEntries, clockIn, clockOut } = useStore();
  const [step, setStep] = useState<'select' | 'pin'>('select');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  
  // Find the selected employee object
  const employee = selectedEmployee 
    ? employees.find(e => e.id === selectedEmployee) 
    : null;
  
  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmployee(empId);
    setStep('pin');
  };
  
  const handleBack = () => {
    setStep('select');
    setSelectedEmployee(null);
    setPin('');
  };
  
  const handlePinSubmit = () => {
    if (!selectedEmployee) return;
    
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }
    
    // Verify PIN
    if (employee.pin !== pin) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setPin('');
      return;
    }
    
    if (employee.clockedIn) {
      // Clock out employee
      clockOut(employee.id);
      
      setSuccessMessage(`You have been clocked out at ${format(new Date(), 'h:mm a')}`);
    } else {
      // Clock in employee
      clockIn(employee.id);
      
      setSuccessMessage(`You have been clocked in at ${format(new Date(), 'h:mm a')}`);
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedEmployee(null);
      setPin('');
      setStep('select');
    }, 3000);
  };
  
  // Handle numeric button press
  const handleNumPress = (num: string) => {
    if (pin.length < 8) { // Limit PIN length
      setPin(prev => prev + num);
    }
  };
  
  // Handle backspace
  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };
  
  // Handle clear
  const handleClear = () => {
    setPin('');
  };
  
  // Active employees (exclude inactive)
  const activeEmployees = employees.filter(emp => emp.active);

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
                <p className="text-slate-600 dark:text-slate-300 mb-6">{successMessage}</p>
                {employee && (
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 h-20 w-20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <p className="text-xl font-medium mt-2">
                  {employee?.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {employee?.department} • {employee?.position}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : step === 'select' ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Employee Clock In/Out</CardTitle>
                <CardDescription>
                  Select your name from the list below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium">No employees found</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Ask your administrator to add employees to the system
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeEmployees.map(emp => (
                      <Button
                        key={emp.id}
                        variant="outline"
                        className={`h-auto p-4 justify-start items-center text-left ${
                          emp.clockedIn ? 'border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : ''
                        }`}
                        onClick={() => handleEmployeeSelect(emp.id)}
                      >
                        <div className="flex items-center w-full">
                          <div className="rounded-full bg-slate-100 dark:bg-slate-800 h-10 w-10 flex items-center justify-center mr-3">
                            <span className="font-bold">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {emp.department} • {emp.position}
                            </div>
                          </div>
                          {emp.clockedIn && (
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
                    {employee?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <CardTitle className="text-2xl">{employee?.name}</CardTitle>
                <CardDescription>
                  {employee?.clockedIn ? 'Clock Out' : 'Clock In'} • Enter your PIN
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
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
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
                      onClick={() => handleNumPress('0')}
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
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button 
                      onClick={handlePinSubmit}
                      disabled={!pin}
                      className={employee?.clockedIn ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    >
                      <ClockIcon className="mr-2 h-4 w-4" />
                      {employee?.clockedIn ? 'Clock Out' : 'Clock In'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} TimeTrack • Employee Management System</p>
        <p className="text-sm mt-1">Current time: {format(new Date(), 'EEEE, MMMM d, yyyy • h:mm:ss a')}</p>
      </div>
    </div>
  );
};

export default ClockInOut;