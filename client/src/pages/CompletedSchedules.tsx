import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { simpleApiClient } from '@/lib/simpleApi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, FileText, Search, Filter, BarChart3 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';

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

export const CompletedSchedules = () => {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleForms, setScheduleForms] = useState<ScheduleForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      console.log('Loading completed schedules...');
      
      // Get published schedules only
      const schedulesData = await simpleApiClient.get('/api/schedules');
      const publishedSchedules = schedulesData.filter((schedule: any) => 
        schedule.status === 'published'
      ).sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

      if (publishedSchedules && publishedSchedules.length > 0) {
        const scheduleIds = publishedSchedules.map((s: any) => s.id);
        
        // Get schedule forms for published schedules
        const allScheduleForms = await simpleApiClient.get('/api/schedule-forms');
        const relevantScheduleForms = allScheduleForms.filter((sf: any) => 
          scheduleIds.includes(sf.schedule_id)
        );

        // Filter by department for non-admin users
        let filteredScheduleForms = relevantScheduleForms;
        let filteredSchedules = publishedSchedules;

        if (profile?.role !== 'admin' && profile?.department_id) {
          const allForms = await simpleApiClient.get('/api/forms');
          
          // Filter schedule forms by department
          filteredScheduleForms = relevantScheduleForms.filter((sf: any) => {
            const form = allForms.find((f: any) => f.id === sf.form_id);
            return form && form.department_id === profile.department_id;
          });

          const scheduleIdsWithDeptForms = new Set(filteredScheduleForms.map((sf: any) => sf.schedule_id));
          filteredSchedules = publishedSchedules.filter((schedule: any) => 
            scheduleIdsWithDeptForms.has(schedule.id)
          );
        }

        setSchedules(filteredSchedules || []);
        setScheduleForms(filteredScheduleForms || []);

        // Get submissions for reporting
        const submissionsData = await simpleApiClient.get('/api/form-submissions');
        setSubmissions(submissionsData || []);
      } else {
        setSchedules([]);
        setScheduleForms([]);
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error loading completed schedules:', error);
      setError('Failed to load completed schedules');
      toast({
        title: "Error",
        description: "Failed to load completed schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.role, profile?.department_id, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter schedules based on search and filter criteria
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (schedule.description && schedule.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const now = new Date();
    const endDate = new Date(schedule.end_date);
    const daysDiff = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let matchesDate = true;
    if (dateFilter === 'recent') {
      matchesDate = daysDiff <= 30; // Last 30 days
    } else if (dateFilter === 'old') {
      matchesDate = daysDiff > 30;
    }

    return matchesSearch && matchesDate;
  });

  const getFormsBySchedule = useCallback((scheduleId: string) => {
    return scheduleForms.filter(sf => sf.schedule_id === scheduleId);
  }, [scheduleForms]);

  const getSubmissionCount = useCallback((formId: string, scheduleId: string) => {
    return submissions.filter(sub => sub.form_id === formId && sub.schedule_id === scheduleId).length;
  }, [submissions]);

  const getTotalSubmissions = useCallback((scheduleId: string) => {
    const forms = getFormsBySchedule(scheduleId);
    return forms.reduce((total, form) => {
      return total + getSubmissionCount(form.form_id, scheduleId);
    }, 0);
  }, [getFormsBySchedule, getSubmissionCount]);

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
            <span>Loading completed schedules...</span>
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
            <BarChart3 className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Completed Schedules & Reports
              {profile?.role === 'admin' && (
                <Badge variant="secondary" className="ml-2">Admin Access - All Reports</Badge>
              )}
            </CardTitle>
            <CardDescription>
              View reports and data from completed data collection schedules
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="recent">Recent (30 days)</SelectItem>
                    <SelectItem value="old">Older</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {filteredSchedules.map((schedule) => {
            const forms = getFormsBySchedule(schedule.id);
            const totalSubmissions = getTotalSubmissions(schedule.id);
            
            if (forms.length === 0) return null;

            return (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5" />
                        <span>{schedule.name}</span>
                        <Badge className="bg-purple-500 text-white">
                          Published
                        </Badge>
                      </CardTitle>
                      {schedule.description && (
                        <CardDescription className="mt-2">
                          {schedule.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Completed: {new Date(schedule.end_date).toLocaleDateString()}</span>
                        <span>Total Submissions: {totalSubmissions}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Available Reports:</h4>
                    {forms.map((scheduleForm) => {
                      const submissionCount = getSubmissionCount(scheduleForm.form_id, schedule.id);
                      
                      return (
                        <div key={scheduleForm.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{scheduleForm.form.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {submissionCount} submissions
                              </Badge>
                            </div>
                            {scheduleForm.form.description && (
                              <p className="text-sm text-gray-600 ml-7 mt-1">
                                {scheduleForm.form.description}
                              </p>
                            )}
                          </div>
                          <div>
                            <Button
                              onClick={() => navigate(`/reports?scheduleId=${schedule.id}&formId=${scheduleForm.form_id}`)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span>View Report</span>
                            </Button>
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

        {filteredSchedules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {schedules.length === 0 
                  ? "No completed schedules available" 
                  : "No schedules match your current filters"
                }
              </p>
              {searchTerm || dateFilter !== 'all' ? (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                  }} 
                  variant="outline" 
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};