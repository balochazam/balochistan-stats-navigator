
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { simpleApiClient } from '@/lib/simpleApi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Edit2, Trash2, Users, Shield, Filter } from 'lucide-react';
import { FormBuilderDialog } from '@/components/forms/FormBuilderDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Form {
  id: string;
  name: string;
  description: string | null;
  department_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  department?: {
    name: string;
  };
  creator?: {
    full_name: string | null;
    email: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export const FormManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  
  // Filter states
  const [searchFilter, setSearchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchForms();
      fetchDepartments();
    }
  }, [profile]);

  const fetchForms = async () => {
    try {
      console.log('Fetching forms...');
      const data = await simpleApiClient.get('/api/forms');
      console.log('Forms fetched successfully:', data);
      const formsWithCreator = (data || []).map((form: any) => ({
        ...form,
        creator: undefined
      }));
      setForms(formsWithCreator);
    } catch (error) {
      console.error('Error in fetchForms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const data = await simpleApiClient.get('/api/departments');
      console.log('Departments fetched successfully:', data);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
    }
  };

  const handleCreateForm = () => {
    console.log('Opening create form dialog');
    setEditingForm(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditForm = (form: Form) => {
    console.log('Opening edit form dialog for:', form);
    setEditingForm(form);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting form:', formId);
      await simpleApiClient.delete(`/api/forms/${formId}`);

      console.log('Form deleted successfully');
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      });
    }
  };

  const handleFormSaved = () => {
    console.log('Form saved, closing dialog and refreshing forms...');
    setIsCreateDialogOpen(false);
    setEditingForm(null);
    fetchForms();
  };

  // Filter forms based on current filters
  const filteredForms = forms.filter(form => {
    const matchesSearch = searchFilter === '' || 
      form.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      form.department?.name === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && form.is_active) ||
      (statusFilter === 'inactive' && !form.is_active);
    
    const matchesCreator = creatorFilter === 'all' || 
      form.creator?.full_name === creatorFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesCreator;
  });

  // Get unique creators for filter dropdown
  const uniqueCreators = Array.from(new Set(
    forms.map(form => form.creator?.full_name).filter((name): name is string => Boolean(name))
  ));

  // Clear all filters
  const clearAllFilters = () => {
    setSearchFilter('');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setCreatorFilter('all');
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
          <div className="text-center">Loading forms...</div>
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
                  <FileText className="h-5 w-5 mr-2" />
                  Form Management
                </CardTitle>
                <CardDescription>
                  Create and manage dynamic forms for data collection. Each form must be assigned to a specific department.
                </CardDescription>
              </div>
              <Button onClick={handleCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Forms Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Forms
              </CardTitle>
              <Badge variant="secondary">
                {filteredForms.length} of {forms.length} forms
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search forms by name or description..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All forms</SelectItem>
                    <SelectItem value="active">Active forms</SelectItem>
                    <SelectItem value="inactive">Inactive forms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Creator Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Creator</label>
                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select creator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All creators</SelectItem>
                    {uniqueCreators.map(creator => (
                      <SelectItem key={creator} value={creator}>
                        {creator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchFilter || departmentFilter !== 'all' || statusFilter !== 'all' || creatorFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredForms.map((form) => (
            <Card key={form.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-semibold">{form.name}</h3>
                      {form.department && (
                        <Badge variant="secondary" className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {form.department.name}
                        </Badge>
                      )}
                    </div>
                    {form.description && (
                      <p className="text-gray-600 mt-2 ml-8">{form.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2 ml-8 space-x-4">
                      <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditForm(form)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteForm(form.id)}
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

        {forms.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No forms found</p>
              <Button onClick={handleCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        )}

        <FormBuilderDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            console.log('Closing form dialog');
            setIsCreateDialogOpen(false);
            setEditingForm(null);
          }}
          onSave={handleFormSaved}
          editingForm={editingForm}
          departments={departments}
        />
      </div>
    </DashboardLayout>
  );
};
