import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { simpleApiClient } from '@/lib/simpleApi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Shield, Building, Mail, Plus, Edit2, UserPlus, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'data_entry_user';
  department_id: string | null;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['data_entry_user', 'admin']),
  department_id: z.string().optional(),
}).refine((data) => {
  // Department is required for non-admin roles
  if (data.role !== 'admin' && (!data.department_id || data.department_id === 'none')) {
    return false;
  }
  return true;
}, {
  message: "Department is required for non-admin users",
  path: ["department_id"],
});

type CreateUserData = z.infer<typeof createUserSchema>;

export const UserManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Confirmation dialog states
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{
    open: boolean;
    userId: string;
    currentRole: string;
    newRole: string;
    userName: string;
  }>({
    open: false,
    userId: '',
    currentRole: '',
    newRole: '',
    userName: ''
  });
  
  const [departmentChangeConfirm, setDepartmentChangeConfirm] = useState<{
    open: boolean;
    userId: string;
    currentDepartment: string;
    newDepartment: string;
    userName: string;
  }>({
    open: false,
    userId: '',
    currentDepartment: '',
    newDepartment: '',
    userName: ''
  });
  
  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      role: 'data_entry_user',
      department_id: '',
    },
  });

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers();
      fetchDepartments();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      const data = await simpleApiClient.get('/api/profiles');
      setUsers(data || []);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await simpleApiClient.get('/api/departments');
      setDepartments(data || []);
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
    }
  };

  const onSubmit = async (data: CreateUserData) => {
    try {
      const userData = {
        ...data,
        department_id: data.role === 'admin' ? null : (data.department_id === 'none' ? null : data.department_id || null),
      };
      
      await simpleApiClient.post('/api/auth/create-user', userData);
      
      toast({
        title: "User created successfully",
        description: `${data.full_name} has been added to the system`,
      });
      
      setIsCreateDialogOpen(false);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  // Helper functions for confirmation dialogs
  const handleRoleChangeRequest = (userId: string, currentRole: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setRoleChangeConfirm({
      open: true,
      userId,
      currentRole,
      newRole,
      userName: user.full_name || user.email
    });
  };

  const handleDepartmentChangeRequest = (userId: string, currentDepartmentId: string | null, newDepartmentId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const currentDeptName = getDepartmentName(currentDepartmentId);
    const newDeptName = getDepartmentName(newDepartmentId === 'none' ? null : newDepartmentId);
    
    setDepartmentChangeConfirm({
      open: true,
      userId,
      currentDepartment: currentDeptName,
      newDepartment: newDeptName,
      userName: user.full_name || user.email
    });
  };

  const confirmRoleChange = async () => {
    try {
      await simpleApiClient.patch(`/api/profiles/${roleChangeConfirm.userId}`, { 
        role: roleChangeConfirm.newRole 
      });
      
      toast({
        title: "User role updated",
        description: `${roleChangeConfirm.userName}'s role has been changed from ${roleChangeConfirm.currentRole.replace('_', ' ')} to ${roleChangeConfirm.newRole.replace('_', ' ')}`,
      });
      
      setRoleChangeConfirm(prev => ({ ...prev, open: false }));
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const confirmDepartmentChange = async () => {
    try {
      // Find the new department ID - if it's "No Department", use null
      const newDeptId = departmentChangeConfirm.newDepartment === 'No Department' ? null :
        departments.find(d => d.name === departmentChangeConfirm.newDepartment)?.id || null;
      
      await simpleApiClient.patch(`/api/profiles/${departmentChangeConfirm.userId}`, { 
        department_id: newDeptId 
      });
      
      toast({
        title: "User department updated",
        description: `${departmentChangeConfirm.userName}'s department has been changed from ${departmentChangeConfirm.currentDepartment} to ${departmentChangeConfirm.newDepartment}`,
      });
      
      setDepartmentChangeConfirm(prev => ({ ...prev, open: false }));
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating department",
        description: error.message || "Failed to update user department",
        variant: "destructive",
      });
    }
  };

  // Legacy functions (kept for backward compatibility but modified to use confirmation)
  const updateUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.role !== newRole) {
      handleRoleChangeRequest(userId, user.role, newRole);
    }
  };

  const updateUserDepartment = async (userId: string, departmentId: string | null) => {
    const user = users.find(u => u.id === userId);
    if (user && user.department_id !== departmentId) {
      handleDepartmentChangeRequest(userId, user.department_id, departmentId || 'none');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'data_entry_user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return 'No Department';
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You don't have permission to access user management.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Loading users...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and department assignments
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="ahmad.hassan@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Ahmad Hassan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="data_entry_user">Data Entry User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => {
                          const selectedRole = form.watch('role');
                          const isAdmin = selectedRole === 'admin';
                          
                          return (
                            <FormItem>
                              <FormLabel>
                                Department {isAdmin ? '(Disabled for Admin)' : '(Required)'}
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={isAdmin}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={isAdmin ? "Not applicable for Admin" : "Select a department"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {!isAdmin && <SelectItem value="none">No Department</SelectItem>}
                                  {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateDialogOpen(false);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create User</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{user.full_name || user.email}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        <Building className="h-3 w-3 mr-1" />
                        {getDepartmentName(user.department_id)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-8">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data_entry_user">Data Entry User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={user.department_id || "none"}
                        onValueChange={(value) => updateUserDepartment(user.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Department</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No users found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First User
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={roleChangeConfirm.open} onOpenChange={(open) => 
        setRoleChangeConfirm(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change <strong>{roleChangeConfirm.userName}</strong>'s role from{' '}
              <span className="font-semibold capitalize">
                {roleChangeConfirm.currentRole.replace('_', ' ')}
              </span>{' '}
              to{' '}
              <span className="font-semibold capitalize">
                {roleChangeConfirm.newRole.replace('_', ' ')}
              </span>.
              <br /><br />
              <span className="text-red-600 font-medium">
                This action will immediately change their access permissions and cannot be undone automatically.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Role Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Department Change Confirmation Dialog */}
      <AlertDialog open={departmentChangeConfirm.open} onOpenChange={(open) => 
        setDepartmentChangeConfirm(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Confirm Department Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change <strong>{departmentChangeConfirm.userName}</strong>'s department from{' '}
              <span className="font-semibold">
                {departmentChangeConfirm.currentDepartment}
              </span>{' '}
              to{' '}
              <span className="font-semibold">
                {departmentChangeConfirm.newDepartment}
              </span>.
              <br /><br />
              This will affect their access to department-specific data and forms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDepartmentChange}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Department Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};