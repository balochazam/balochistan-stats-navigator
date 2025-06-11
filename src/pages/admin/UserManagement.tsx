import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Building, Mail } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'department_user' | 'data_entry_user';
  department_id: string | null;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

export const UserManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers();
      fetchDepartments();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'department_user' | 'data_entry_user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error in updateUserRole:', error);
    }
  };

  const updateUserDepartment = async (userId: string, departmentId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ department_id: departmentId === 'none' ? null : departmentId })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user department:', error);
        toast({
          title: "Error",
          description: "Failed to update user department",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User department updated successfully",
        });
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error in updateUserDepartment:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'department_user':
        return 'bg-blue-100 text-blue-800';
      case 'data_entry_user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user roles and department assignments
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                      {user.full_name && (
                        <p className="text-sm text-gray-600 mt-1">{user.full_name}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getDepartmentName(user.department_id)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Role</div>
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'department_user' | 'data_entry_user') => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="department_user">Department User</SelectItem>
                          <SelectItem value="data_entry_user">Data Entry User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Department</div>
                      <Select
                        value={user.department_id || 'none'}
                        onValueChange={(value) => updateUserDepartment(user.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
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

                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
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
              <p className="text-gray-600">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
