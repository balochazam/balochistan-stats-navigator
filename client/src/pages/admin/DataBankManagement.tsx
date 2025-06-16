
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, Plus, Shield, List } from 'lucide-react';
import { ReferenceDataList } from '@/components/reference-data/ReferenceDataList';
import { ReferenceDataForm } from '@/components/reference-data/ReferenceDataForm';
import { ReferenceDataEntries } from '@/components/reference-data/ReferenceDataEntries';

interface ReferenceData {
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

export const DataBankManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [referenceDataSets, setReferenceDataSets] = useState<ReferenceData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReferenceData, setEditingReferenceData] = useState<ReferenceData | null>(null);
  const [selectedReferenceData, setSelectedReferenceData] = useState<ReferenceData | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchReferenceData();
      fetchDepartments();
    }
  }, [profile]);

  const fetchReferenceData = async () => {
    try {
      const data = await apiClient.get('/api/data-banks');

      if (!data) {
        console.error('Error fetching reference data');
        toast({
          title: "Error",
          description: "Failed to fetch reference data",
          variant: "destructive",
        });
      } else {
        setReferenceDataSets(data || []);
      }
    } catch (error) {
      console.error('Error in fetchReferenceData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiClient
        .get
        .get
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

  const handleCreateReferenceData = () => {
    setEditingReferenceData(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditReferenceData = (referenceData: ReferenceData) => {
    setEditingReferenceData(referenceData);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteReferenceData = async (referenceDataId: string) => {
    if (!confirm('Are you sure you want to delete this reference data set? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await apiClient
        .get
        .put
        .get;

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reference data set deleted successfully",
      });
      fetchReferenceData();
    } catch (error) {
      console.error('Error deleting reference data:', error);
      toast({
        title: "Error",
        description: "Failed to delete reference data set",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setEditingReferenceData(null);
    fetchReferenceData();
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
          <div className="text-center">Loading reference data...</div>
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
                  <List className="h-5 w-5 mr-2" />
                  Reference Data Management
                </CardTitle>
                <CardDescription>
                  Manage dropdown options and lookup data for forms (Districts, Countries, Hospitals, etc.)
                </CardDescription>
              </div>
              <Button onClick={handleCreateReferenceData}>
                <Plus className="h-4 w-4 mr-2" />
                Add Reference Data Set
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reference Data Sets</h3>
            <ReferenceDataList
              referenceDataSets={referenceDataSets}
              onEdit={handleEditReferenceData}
              onDelete={handleDeleteReferenceData}
              onSelect={setSelectedReferenceData}
              selectedReferenceData={selectedReferenceData}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedReferenceData ? `Options: ${selectedReferenceData.name}` : 'Select a Reference Data Set'}
            </h3>
            {selectedReferenceData ? (
              <ReferenceDataEntries referenceData={selectedReferenceData} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Select a reference data set to manage its options</p>
                  <p className="text-sm text-gray-500">Examples: Districts, Countries, Hospitals, Schools</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <ReferenceDataForm
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingReferenceData(null);
          }}
          onSuccess={handleFormSuccess}
          editingReferenceData={editingReferenceData}
          departments={departments}
        />
      </div>
    </DashboardLayout>
  );
};
