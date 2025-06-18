import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Users, 
  FileText,
  BarChart3,
  Database,
  Eye
} from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  department?: {
    name: string;
  };
}

interface FormSubmission {
  id: string;
  data: any;
  submitted_at: string;
  form?: {
    name: string;
  };
  profile?: {
    full_name: string;
    department?: {
      name: string;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const PublicReportView = () => {
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<string>('');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (scheduleId) {
      fetchReportData();
    }
  }, [scheduleId]);

  const fetchReportData = async () => {
    try {
      // Fetch schedule details
      const scheduleData = await simpleApiClient.get(`/api/public/schedules/${scheduleId}`);
      setSchedule(scheduleData);

      // Fetch forms in this schedule
      const formsData = await simpleApiClient.get(`/api/public/schedules/${scheduleId}/forms`);
      setForms(formsData || []);
      
      if (formsData && formsData.length > 0) {
        setActiveForm(formsData[0].id);
      }

      // Fetch submissions for all forms in this schedule
      const submissionsData = await simpleApiClient.get(`/api/public/schedules/${scheduleId}/submissions`);
      setSubmissions(submissionsData || []);

      // Generate chart data
      generateChartData(submissionsData || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (submissionData: FormSubmission[]) => {
    // Generate visualization data based on submissions
    const departmentCounts = submissionData.reduce((acc: any, submission) => {
      const deptName = submission.profile?.department?.name || 'Unknown';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      submissions: value as number
    }));
    setChartData(chartData);
  };

  const getActiveFormSubmissions = () => {
    return submissions.filter(sub => 
      forms.find(form => form.id === activeForm)?.id === activeForm
    );
  };

  const renderDataTable = (formSubmissions: FormSubmission[]) => {
    if (formSubmissions.length === 0) return null;

    const activeFormData = forms.find(f => f.id === activeForm);
    if (!activeFormData) return null;

    // Check if this is a hierarchical form
    const hasHierarchy = activeFormData.field_groups && activeFormData.field_groups.length > 0;

    if (hasHierarchy) {
      return renderHierarchicalTable(formSubmissions, activeFormData);
    } else {
      return renderSimpleTable(formSubmissions, activeFormData);
    }
  };

  const renderHierarchicalTable = (formSubmissions: FormSubmission[], formData: any) => {
    const fieldGroups = formData.field_groups || [];
    const formFields = formData.form_fields || [];

    // Get primary column field
    const primaryField = formFields.find((field: any) => field.is_primary_column);
    
    if (!primaryField) return renderSimpleTable(formSubmissions, formData);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {primaryField.field_label}
              </th>
              {fieldGroups.map((group: any) => {
                const groupFields = formFields.filter((field: any) => field.field_group_id === group.id);
                if (groupFields.length === 0) return null;

                // Check if group has sub-headers
                const hasSubHeaders = groupFields.some((field: any) => field.sub_headers && field.sub_headers.length > 0);

                if (hasSubHeaders) {
                  return groupFields.map((field: any) => 
                    field.sub_headers?.map((subHeader: string) => (
                      <th key={`${field.id}-${subHeader}`} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="text-center">
                          <div className="font-semibold">{group.group_name}</div>
                          <div className="text-xs">{subHeader}</div>
                        </div>
                      </th>
                    ))
                  );
                } else {
                  return (
                    <th key={group.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      {group.group_name}
                    </th>
                  );
                }
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formSubmissions.map((submission) => {
              const data = submission.data || {};
              const primaryValue = data[primaryField.field_name] || '';

              return (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {primaryValue}
                  </td>
                  {fieldGroups.map((group: any) => {
                    const groupFields = formFields.filter((field: any) => field.field_group_id === group.id);
                    
                    return groupFields.map((field: any) => {
                      if (field.sub_headers && field.sub_headers.length > 0) {
                        return field.sub_headers.map((subHeader: string) => {
                          const fieldKey = `${field.field_name}_${subHeader.toLowerCase().replace(/\s+/g, '_')}`;
                          const value = data[fieldKey] || '0';
                          return (
                            <td key={`${field.id}-${subHeader}`} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {value}
                            </td>
                          );
                        });
                      } else {
                        const value = data[field.field_name] || '0';
                        return (
                          <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {value}
                          </td>
                        );
                      }
                    });
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSimpleTable = (formSubmissions: FormSubmission[], formData: any) => {
    const formFields = formData.form_fields || [];
    
    if (formFields.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {formFields.map((field: any) => (
                <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.field_label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formSubmissions.map((submission) => {
              const data = submission.data || {};
              return (
                <tr key={submission.id}>
                  {formFields.map((field: any) => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data[field.field_name] || '-'}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
          <p className="text-gray-600 mb-4">This report may not be published or may not exist.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link to="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{schedule.name}</h1>
                <p className="text-sm text-gray-600">{schedule.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Published</Badge>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Schedule Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Collection Period</div>
                  <div className="text-sm text-gray-600">
                    {new Date(schedule.start_date).toLocaleDateString()} - {' '}
                    {new Date(schedule.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="font-medium">Department</div>
                  <div className="text-sm text-gray-600">{schedule.department?.name || 'General'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="font-medium">Total Submissions</div>
                  <div className="text-sm text-gray-600">{submissions.length} entries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Submission Distribution
              </CardTitle>
              <CardDescription>Number of submissions by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Forms Data */}
        {forms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-600" />
                Report Data
              </CardTitle>
              <CardDescription>Detailed data from all form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeForm} onValueChange={setActiveForm}>
                <TabsList className="mb-6">
                  {forms.map((form) => (
                    <TabsTrigger key={form.id} value={form.id}>
                      {form.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {forms.map((form) => (
                  <TabsContent key={form.id} value={form.id}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{form.name}</h3>
                        <Badge variant="outline">
                          {getActiveFormSubmissions().length} submissions
                        </Badge>
                      </div>
                      
                      {getActiveFormSubmissions().length > 0 ? (
                        renderDataTable(getActiveFormSubmissions())
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No submissions found for this form.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {forms.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">This report doesn't contain any published data yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};