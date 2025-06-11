
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, Plus, Shield } from 'lucide-react';
import { DataBankList } from '@/components/databanks/DataBankList';
import { DataBankForm } from '@/components/databanks/DataBankForm';
import { DataBankEntries } from '@/components/databanks/DataBankEntries';

interface DataBank {
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
  const [dataBanks, setDataBanks] = useState<DataBank[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDataBank, setEditingDataBank] = useState<DataBank | null>(null);
  const [selectedDataBank, setSelectedDataBank] = useState<DataBank | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDataBanks();
      fetchDepartments();
    }
  }, [profile]);

  const fetchDataBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('data_banks')
        .select(`
          *,
          department:departments(name),
          creator:profiles!data_banks_created_by_fkey(full_name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data banks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch data banks",
          variant: "destructive",
        });
      } else {
        setDataBanks(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDataBanks:', error);
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

  const handleCreateDataBank = () => {
    setEditingDataBank(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditDataBank = (dataBank: DataBank) => {
    setEditingDataBank(dataBank);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteDataBank = async (dataBankId: string) => {
    if (!confirm('Are you sure you want to delete this data bank? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('data_banks')
        .update({ is_active: false })
        .eq('id', dataBankId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data bank deleted successfully",
      });
      fetchDataBanks();
    } catch (error) {
      console.error('Error deleting data bank:', error);
      toast({
        title: "Error",
        description: "Failed to delete data bank",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setEditingDataBank(null);
    fetchDataBanks();
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
          <div className="text-center">Loading data banks...</div>
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
                  <Database className="h-5 w-5 mr-2" />
                  Data Bank Management
                </CardTitle>
                <CardDescription>
                  Create and manage master data banks for your organization
                </CardDescription>
              </div>
              <Button onClick={handleCreateDataBank}>
                <Plus className="h-4 w-4 mr-2" />
                Add Data Bank
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Banks</h3>
            <DataBankList
              dataBanks={dataBanks}
              onEdit={handleEditDataBank}
              onDelete={handleDeleteDataBank}
              onSelect={setSelectedDataBank}
              selectedDataBank={selectedDataBank}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedDataBank ? `Entries: ${selectedDataBank.name}` : 'Select a Data Bank'}
            </h3>
            {selectedDataBank ? (
              <DataBankEntries dataBank={selectedDataBank} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a data bank to view and manage its entries</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DataBankForm
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingDataBank(null);
          }}
          onSuccess={handleFormSuccess}
          editingDataBank={editingDataBank}
          departments={departments}
        />
      </div>
    </DashboardLayout>
  );
};
