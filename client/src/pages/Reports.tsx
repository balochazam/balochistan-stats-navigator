import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Eye, Calendar } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
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
    department?: {
      name: string;
    };
  };
}

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_primary_column: boolean;
  is_secondary_column: boolean;
  field_order: number;
}

interface FormSubmission {
  id: string;
  form_id: string;
  schedule_id: string;
  submitted_at: string;
  submitted_by: string;
  data: any;
  submitter?: {
    full_name: string;
    email: string;
  };
}

export const Reports = () => {
  const { profile } = useAuth();
  const [publishedSchedules, setPublishedSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleForms, setScheduleForms] = useState<ScheduleForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<ScheduleForm | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchPublishedSchedules();
  }, []);

  const fetchPublishedSchedules = async () => {
    try {
      const data = await apiClient.get('/api/schedules');
      const published = data?.filter((schedule: Schedule) => schedule.status === 'published') || [];
      setPublishedSchedules(published);
    } catch (error) {
      console.error('Error fetching published schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSelectedForm(null);
    setLoadingData(true);
    
    try {
      const forms = await apiClient.get(`/api/schedules/${schedule.id}/forms`);
      setScheduleForms(forms || []);
    } catch (error) {
      console.error('Error fetching schedule forms:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewFormData = async (scheduleForm: ScheduleForm) => {
    setSelectedForm(scheduleForm);
    setLoadingData(true);
    
    try {
      // Fetch form fields
      const fields = await apiClient.get(`/api/forms/${scheduleForm.form_id}/fields`);
      setFormFields(fields?.sort((a: FormField, b: FormField) => a.field_order - b.field_order) || []);
      
      // Fetch form submissions for this schedule and form
      const submissions = await apiClient.get(`/api/form-submissions?formId=${scheduleForm.form_id}&scheduleId=${selectedSchedule?.id}`);
      setFormSubmissions(submissions || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const exportToCSV = () => {
    if (!selectedForm || !formFields.length || !formSubmissions.length) return;
    
    const headers = ['Submission Date', 'Submitted By', ...formFields.map(field => field.field_label)];
    const rows = formSubmissions.map(submission => [
      new Date(submission.submitted_at).toLocaleDateString(),
      submission.submitter?.full_name || submission.submitted_by,
      ...formFields.map(field => {
        const value = submission.data?.[field.field_name];
        return value || '';
      })
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedForm.form.name}_${selectedSchedule?.name}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="text-center">Loading reports...</div>
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
              <FileText className="h-5 w-5 mr-2" />
              Reports
            </CardTitle>
            <CardDescription>
              View and export data from published schedules
            </CardDescription>
          </CardHeader>
        </Card>

        {!selectedSchedule ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Published Schedules</h3>
            {publishedSchedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No published schedules available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {publishedSchedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <h4 className="font-semibold">{schedule.name}</h4>
                            <Badge className="bg-blue-500 text-white">Published</Badge>
                          </div>
                          {schedule.description && (
                            <p className="text-gray-600 mb-2 ml-8">{schedule.description}</p>
                          )}
                          <div className="text-xs text-gray-500 ml-8">
                            Period: {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                          </div>
                        </div>
                        <Button onClick={() => handleViewSchedule(schedule)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : !selectedForm ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedSchedule.name} - Forms</h3>
                <p className="text-gray-600">Select a form to view its submitted data</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSchedule(null)}>
                Back to Schedules
              </Button>
            </div>

            {loadingData ? (
              <div className="text-center py-8">Loading forms...</div>
            ) : scheduleForms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No forms in this schedule</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {scheduleForms.map((scheduleForm) => (
                  <Card key={scheduleForm.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <h4 className="font-semibold">{scheduleForm.form.name}</h4>
                            {scheduleForm.form.department && (
                              <Badge variant="secondary">
                                {scheduleForm.form.department.name}
                              </Badge>
                            )}
                            {scheduleForm.is_required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                          {scheduleForm.form.description && (
                            <p className="text-gray-600 mb-2 ml-8">{scheduleForm.form.description}</p>
                          )}
                        </div>
                        <Button onClick={() => handleViewFormData(scheduleForm)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedForm.form.name} - Data Report</h3>
                <p className="text-gray-600">Submitted data for {selectedSchedule.name}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={exportToCSV} disabled={!formSubmissions.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => setSelectedForm(null)}>
                  Back to Forms
                </Button>
              </div>
            </div>

            {loadingData ? (
              <div className="text-center py-8">Loading data...</div>
            ) : formSubmissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions for this form</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Data ({formSubmissions.length} entries)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Submission Date</TableHead>
                          <TableHead>Submitted By</TableHead>
                          {formFields.map((field) => (
                            <TableHead key={field.id}>{field.field_label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {submission.submitter?.full_name || submission.submitted_by}
                            </TableCell>
                            {formFields.map((field) => (
                              <TableCell key={field.id}>
                                {submission.data?.[field.field_name] || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};