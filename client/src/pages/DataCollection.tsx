
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, FileText, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { DataEntryForm } from '@/components/data-collection/DataEntryForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

interface ScheduleForm {
  id: string;
  schedule_id: string;
  form_id: string;
  is_required: boolean;
  due_date: string | null;
  form: {
    id: string;
    name: string;
    description: string | null;
    department_id: string | null;
  };
}

interface FormSubmission {
  id: string;
  form_id: string;
  schedule_id: string;
  submitted_at: string;
}

interface FormCompletion {
  schedule_form_id: string;
  user_id: string;
}

export const DataCollection = () => {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleForms, setScheduleForms] = useState<ScheduleForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [completions, setCompletions] = useState<FormCompletion[]>([]);
  const [selectedScheduleForm, setSelectedScheduleForm] = useState<ScheduleForm | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSchedules = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      console.log('Fetching active schedules...');
      setError(null);
      
      // Get active schedules (collection or open status)
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .in('status', ['open', 'collection'])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date');

      if (schedulesError) throw schedulesError;

      console.log('Schedules fetched:', schedulesData);
      setSchedules(schedulesData || []);

      // For admins, get all forms. For others, get forms from their department
      if (schedulesData && schedulesData.length > 0) {
        const scheduleIds = schedulesData.map(s => s.id);
        
        let formsQuery = supabase
          .from('schedule_forms')
          .select(`
            *,
            form:forms!inner(
              id,
              name,
              description,
              department_id
            )
          `)
          .in('schedule_id', scheduleIds);

        // If not admin, filter by department
        if (profile?.role !== 'admin' && profile?.department_id) {
          formsQuery = formsQuery.eq('form.department_id', profile.department_id);
        }

        const { data: formsData, error: formsError } = await formsQuery;

        if (formsError) throw formsError;

        console.log('Schedule forms fetched:', formsData);
        setScheduleForms(formsData || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to fetch active schedules');
      toast({
        title: "Error",
        description: "Failed to fetch active schedules",
        variant: "destructive",
      });
    }
  }, [profile?.id, profile?.role, profile?.department_id, toast]);

  const fetchUserSubmissions = useCallback(async () => {
    if (!profile?.id) return;

    try {
      console.log('Fetching user submissions...');
      const { data, error } = await supabase
        .from('form_submissions')
        .select('id, form_id, schedule_id, submitted_at')
        .eq('submitted_by', profile.id);

      if (error) throw error;

      console.log('Submissions fetched:', data);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  }, [profile?.id]);

  const fetchUserCompletions = useCallback(async () => {
    if (!profile?.id) return;

    try {
      console.log('Fetching user completions...');
      const { data, error } = await supabase
        .rpc('get_user_completions', {
          p_user_id: profile.id
        });

      if (error) throw error;

      console.log('Completions fetched:', data);
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  }, [profile?.id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchActiveSchedules(),
      fetchUserSubmissions(),
      fetchUserCompletions()
    ]);
    setLoading(false);
  }, [fetchActiveSchedules, fetchUserSubmissions, fetchUserCompletions]);

  useEffect(() => {
    if (profile?.id && !authLoading) {
      loadData();
    }
  }, [profile?.id, authLoading, loadData]);

  const handleFormSubmitted = useCallback(() => {
    fetchUserSubmissions();
    toast({
      title: "Success",
      description: "Entry added successfully",
    });
  }, [fetchUserSubmissions, toast]);

  const handleFormCompleted = useCallback(() => {
    setSelectedScheduleForm(null);
    setSelectedSchedule(null);
    fetchUserCompletions();
    toast({
      title: "Success",
      description: "Form marked as complete",
    });
  }, [fetchUserCompletions, toast]);

  const handleSelectForm = useCallback((scheduleForm: ScheduleForm) => {
    const schedule = schedules.find(s => s.id === scheduleForm.schedule_id);
    if (schedule) {
      setSelectedScheduleForm(scheduleForm);
      setSelectedSchedule(schedule);
    }
  }, [schedules]);

  const getSubmissionCount = useCallback((formId: string, scheduleId: string) => {
    return submissions.filter(sub => sub.form_id === formId && sub.schedule_id === scheduleId).length;
  }, [submissions]);

  const isFormCompleted = useCallback((scheduleFormId: string) => {
    return completions.some(comp => comp.schedule_form_id === scheduleFormId);
  }, [completions]);

  const getScheduleStatus = useCallback((schedule: Schedule) => {
    const today = new Date();
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);

    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'expired';
    return 'active';
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }, []);

  const getFormsBySchedule = useCallback((scheduleId: string) => {
    return scheduleForms.filter(sf => sf.schedule_id === scheduleId);
  }, [scheduleForms]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span>Loading authentication...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading while data is loading
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span>Loading data collection forms...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (selectedScheduleForm && selectedSchedule) {
    return (
      <DashboardLayout>
        <DataEntryForm
          schedule={selectedSchedule}
          scheduleForm={selectedScheduleForm}
          onSubmitted={handleFormSubmitted}
          onCompleted={handleFormCompleted}
          onCancel={() => {
            setSelectedScheduleForm(null);
            setSelectedSchedule(null);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Data Collection
              {profile?.role === 'admin' && (
                <Badge variant="secondary" className="ml-2">Admin Access - All Forms</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Complete forms for active data collection schedules
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {schedules.map((schedule) => {
            const forms = getFormsBySchedule(schedule.id);
            const scheduleStatus = getScheduleStatus(schedule);
            
            if (forms.length === 0) return null;

            return (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5" />
                        <span>{schedule.name}</span>
                        <Badge className={`${getStatusColor(scheduleStatus)} text-white`}>
                          {scheduleStatus}
                        </Badge>
                        {schedule.status === 'collection' && (
                          <Badge variant="secondary">Data Collection Active</Badge>
                        )}
                      </CardTitle>
                      {schedule.description && (
                        <CardDescription className="mt-2">
                          {schedule.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Available Forms:</h4>
                    {forms.map((scheduleForm) => {
                      const submissionCount = getSubmissionCount(scheduleForm.form_id, schedule.id);
                      const isCompleted = isFormCompleted(scheduleForm.id);
                      const isPastDue = scheduleForm.due_date && new Date(scheduleForm.due_date) < new Date();
                      
                      return (
                        <div key={scheduleForm.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{scheduleForm.form.name}</span>
                              {scheduleForm.is_required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {isCompleted && (
                                <Badge className="bg-green-500 text-white text-xs flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Completed</span>
                                </Badge>
                              )}
                              {isPastDue && !isCompleted && (
                                <Badge variant="destructive" className="text-xs">Past Due</Badge>
                              )}
                            </div>
                            {scheduleForm.form.description && (
                              <p className="text-sm text-gray-600 ml-7 mt-1">
                                {scheduleForm.form.description}
                              </p>
                            )}
                            <div className="text-xs text-gray-500 ml-7 mt-1 space-x-4">
                              <span>Entries: {submissionCount}</span>
                              {scheduleForm.due_date && (
                                <span>Due: {new Date(scheduleForm.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            {schedule.status === 'collection' && scheduleStatus === 'active' && (
                              <Button
                                onClick={() => handleSelectForm(scheduleForm)}
                                disabled={isCompleted}
                                variant={isCompleted ? "secondary" : "default"}
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Completed</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4" />
                                    <span>{submissionCount > 0 ? 'Continue' : 'Start'}</span>
                                  </>
                                )}
                              </Button>
                            )}
                            {schedule.status === 'open' && (
                              <span className="text-sm text-gray-500">
                                Not yet open for data collection
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {schedules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active data collection schedules available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
