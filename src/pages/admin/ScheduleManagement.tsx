
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Edit2, Trash2, Users, Shield, FileText } from 'lucide-react';
import { ScheduleDialog } from '@/components/schedules/ScheduleDialog';
import { ScheduleFormsDialog } from '@/components/schedules/ScheduleFormsDialog';

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
  department_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  department?: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export const ScheduleManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormsDialogOpen, setIsFormsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedScheduleForForms, setSelectedScheduleForForms] = useState<Schedule | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchSchedules();
      fetchDepartments();
    }
  }, [profile]);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          department:departments(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching schedules:', error);
        toast({
          title: "Error",
          description: "Failed to fetch schedules",
          variant: "destructive",
        });
      } else {
        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSchedules:', error);
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

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsCreateDialogOpen(true);
  };

  const handleManageForms = (schedule: Schedule) => {
    setSelectedScheduleForForms(schedule);
    setIsFormsDialogOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleScheduleSaved = () => {
    setIsCreateDialogOpen(false);
    setEditingSchedule(null);
    fetchSchedules();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <div className="text-center">Loading schedules...</div>
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
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Management
                </CardTitle>
                <CardDescription>
                  Create and manage data collection schedules. Each schedule organizes forms for a specific time period and department.
                </CardDescription>
              </div>
              <Button onClick={handleCreateSchedule}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-semibold">{schedule.name}</h3>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                      <Badge variant="outline">
                        Year {schedule.year}
                      </Badge>
                      {schedule.department && (
                        <Badge variant="secondary" className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {schedule.department.name}
                        </Badge>
                      )}
                    </div>
                    {schedule.description && (
                      <p className="text-gray-600 mb-2 ml-8">{schedule.description}</p>
                    )}
                    <div className="text-xs text-gray-500 ml-8 space-x-4">
                      <span>Period: {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}</span>
                      <span>Created: {new Date(schedule.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageForms(schedule)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Manage Forms
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
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

        {schedules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No schedules found</p>
              <Button onClick={handleCreateSchedule}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        )}

        <ScheduleDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingSchedule(null);
          }}
          onSave={handleScheduleSaved}
          editingSchedule={editingSchedule}
          departments={departments}
        />

        <ScheduleFormsDialog
          isOpen={isFormsDialogOpen}
          onClose={() => {
            setIsFormsDialogOpen(false);
            setSelectedScheduleForForms(null);
          }}
          schedule={selectedScheduleForForms}
        />
      </div>
    </DashboardLayout>
  );
};
