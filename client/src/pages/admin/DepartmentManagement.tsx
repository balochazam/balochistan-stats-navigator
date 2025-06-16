
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_count?: number;
}

export const DepartmentManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDepartments();
    }
  }, [profile]);

  const fetchDepartments = async () => {
    try {
      // Fetch departments with user count
      const deptData = await apiClient.get('/api/departments');

      // Fetch user counts for each department
      const departmentsWithCounts = await Promise.all(
        (deptData || []).map(async (dept: any) => {
          const profiles = await apiClient.get(`/api/profiles?department_id=${dept.id}`);
          
          return {
            ...dept,
            user_count: profiles?.length || 0
          };
        })
      );

      setDepartments(departmentsWithCounts);
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDepartment) {
        // Update existing department
        await apiClient.put(`/api/departments/${editingDepartment.id}`, {
          name: formData.name,
          description: formData.description || null,
          updated_at: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        // Create new department
        await apiClient.post('/api/departments', {
          name: formData.name,
          description: formData.description || null
        });

        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }

      // Reset form and close dialog
      setFormData({ name: '', description: '' });
      setEditingDepartment(null);
      setIsCreateDialogOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? Users assigned to this department will be unassigned.')) {
      return;
    }

    try {
      const { error } = await apiClient
        .get
        .delete
        .get;

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingDepartment(null);
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
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
          <div className="text-center">Loading departments...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Department Management
                </CardTitle>
                <CardDescription>
                  Create and manage organizational departments
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingDepartment ? 'Edit Department' : 'Create New Department'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDepartment 
                        ? 'Update the department information below.'
                        : 'Add a new department to organize your users.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Department Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter department name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter department description (optional)"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDepartment ? 'Update' : 'Create'} Department
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {departments.map((department) => (
            <Card key={department.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-semibold">{department.name}</h3>
                      <Badge variant="secondary" className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {department.user_count} users
                      </Badge>
                    </div>
                    {department.description && (
                      <p className="text-gray-600 mt-2 ml-8">{department.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 ml-8">
                      Created: {new Date(department.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(department.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {departments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No departments found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Department
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
