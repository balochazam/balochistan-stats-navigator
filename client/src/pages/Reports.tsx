import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Calendar, FileX, Search, Filter } from 'lucide-react';

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
  has_sub_headers?: boolean;
  sub_headers?: Array<{
    name: string;
    label: string;
    fields: Array<{
      field_name: string;
      field_label: string;
      field_type: string;
      has_sub_headers?: boolean;
      sub_headers?: Array<{
        name: string;
        label: string;
        fields: Array<{
          field_name: string;
          field_label: string;
          field_type: string;
        }>;
      }>;
    }>;
  }>;
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
  
  // Filter states
  const [scheduleFilter, setScheduleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [submissionDateFilter, setSubmissionDateFilter] = useState('all');

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

  // Filter published schedules based on current filters
  const filteredSchedules = publishedSchedules.filter(schedule => {
    const matchesSearch = scheduleFilter === '' || 
      schedule.name.toLowerCase().includes(scheduleFilter.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(scheduleFilter.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || (() => {
      const scheduleDate = new Date(schedule.start_date);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      switch (dateFilter) {
        case 'current_year':
          return scheduleDate.getFullYear() === currentYear;
        case 'current_month':
          return scheduleDate.getFullYear() === currentYear && scheduleDate.getMonth() === currentMonth;
        case 'last_6_months':
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(currentMonth - 6);
          return scheduleDate >= sixMonthsAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesDate;
  });

  // Filter schedule forms based on current filters
  const filteredForms = scheduleForms.filter(form => {
    const matchesSearch = formFilter === '' || 
      form.form.name.toLowerCase().includes(formFilter.toLowerCase()) ||
      form.form.description?.toLowerCase().includes(formFilter.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      form.form.department?.name === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Filter form submissions based on current filters
  const filteredSubmissions = formSubmissions.filter(submission => {
    const matchesDate = submissionDateFilter === 'all' || (() => {
      const submissionDate = new Date(submission.submitted_at);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      switch (submissionDateFilter) {
        case 'today':
          return submissionDate.toDateString() === currentDate.toDateString();
        case 'this_week':
          const weekAgo = new Date();
          weekAgo.setDate(currentDate.getDate() - 7);
          return submissionDate >= weekAgo;
        case 'this_month':
          return submissionDate.getFullYear() === currentYear && submissionDate.getMonth() === currentMonth;
        default:
          return true;
      }
    })();
    
    return matchesDate;
  });

  // Get unique departments for filter dropdown
  const uniqueDepartments = Array.from(new Set(
    scheduleForms.map(form => form.form.department?.name).filter((name): name is string => Boolean(name))
  ));

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

  // Helper function to check if form has hierarchical structure
  const isHierarchicalForm = () => {
    return formFields.some((field: any) => field.has_sub_headers && field.sub_headers?.length > 0);
  };

  // Helper function to get structured hierarchical data for table display
  const getHierarchicalTableStructure = () => {
    const structure: any = {};
    
    formFields.forEach((field: any) => {
      if (field.has_sub_headers && field.sub_headers) {
        field.sub_headers.forEach((subHeader: any) => {
          const categoryName = subHeader.label || subHeader.name;
          
          if (!structure[categoryName]) {
            structure[categoryName] = {
              name: categoryName,
              fields: [],
              subCategories: {}
            };
          }
          
          subHeader.fields.forEach((subField: any) => {
            if (subField.has_sub_headers && subField.sub_headers) {
              // Handle nested sub-headers (e.g., Medical/Dental under Specialists)
              subField.sub_headers.forEach((nestedSubHeader: any) => {
                const subCategoryName = nestedSubHeader.label || nestedSubHeader.name;
                
                if (!structure[categoryName].subCategories[subCategoryName]) {
                  structure[categoryName].subCategories[subCategoryName] = {
                    name: subCategoryName,
                    fields: []
                  };
                }
                
                nestedSubHeader.fields.forEach((nestedField: any) => {
                  structure[categoryName].subCategories[subCategoryName].fields.push({
                    key: `${field.field_name}_${subHeader.name}_${subField.field_name}_${nestedSubHeader.name}_${nestedField.field_name}`,
                    label: nestedField.field_label,
                    type: 'nested'
                  });
                });
              });
            } else {
              // Regular sub-header fields
              structure[categoryName].fields.push({
                key: `${field.field_name}_${subHeader.name}_${subField.field_name}`,
                label: subField.field_label,
                type: 'regular'
              });
            }
          });
        });
      }
    });
    
    return structure;
  };

  // Helper function to get all columns for flat rendering
  const getAllHierarchicalColumns = () => {
    const columns: any[] = [];
    const structure = getHierarchicalTableStructure();
    
    Object.values(structure).forEach((category: any) => {
      // Add regular fields first
      columns.push(...category.fields);
      
      // Add nested subcategory fields
      Object.values(category.subCategories).forEach((subCategory: any) => {
        columns.push(...subCategory.fields);
      });
    });
    
    return columns;
  };

  // Helper function to extract hierarchical field data
  const getFieldValue = (submission: FormSubmission, field: any) => {
    // First try direct field name match (for simple forms)
    if (submission.data?.[field.field_name]) {
      return submission.data[field.field_name];
    }
    
    // For hierarchical forms, look for nested field data
    if (field.has_sub_headers && field.sub_headers) {
      const values: string[] = [];
      
      field.sub_headers.forEach((subHeader: any) => {
        subHeader.fields.forEach((subField: any) => {
          const hierarchicalKey = `${field.field_name}_${subHeader.name}_${subField.field_name}`;
          const value = submission.data?.[hierarchicalKey];
          if (value) {
            values.push(`${subHeader.label || subHeader.name} ${subField.field_label}: ${value}`);
          }
          
          // Check for nested sub-headers (e.g., Medical/Dental under Specialists)
          if (subField.has_sub_headers && subField.sub_headers) {
            subField.sub_headers.forEach((nestedSubHeader: any) => {
              nestedSubHeader.fields.forEach((nestedField: any) => {
                const nestedKey = `${field.field_name}_${subHeader.name}_${subField.field_name}_${nestedSubHeader.name}_${nestedField.field_name}`;
                const nestedValue = submission.data?.[nestedKey];
                if (nestedValue) {
                  values.push(`${subHeader.label || subHeader.name} ${nestedSubHeader.label || nestedSubHeader.name} ${nestedField.field_label}: ${nestedValue}`);
                }
              });
            });
          }
        });
      });
      
      return values.length > 0 ? values.join('; ') : '';
    }
    
    return '';
  };

  const exportToCSV = () => {
    if (!selectedForm || !formFields.length || !filteredSubmissions.length) return;
    
    let headers: string[];
    let rows: string[][];
    
    if (isHierarchicalForm()) {
      // Use hierarchical column structure for CSV
      const columns = getAllHierarchicalColumns();
      headers = ['Submission Date', ...columns.map((col: any) => col.label)];
      rows = formSubmissions.map(submission => [
        new Date(submission.submitted_at).toLocaleDateString(),
        ...columns.map((col: any) => submission.data?.[col.key] || '')
      ]);
    } else {
      // Use simple structure for non-hierarchical forms
      headers = ['Submission Date', ...formFields.map(field => field.field_label)];
      rows = filteredSubmissions.map(submission => [
        new Date(submission.submitted_at).toLocaleDateString(),
        ...formFields.map(field => submission.data?.[field.field_name] || '')
      ]);
    }
    
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

  const exportToPDF = () => {
    if (!selectedForm || !formFields.length || !filteredSubmissions.length) return;
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableHTML = '';
    
    if (isHierarchicalForm()) {
      // Generate hierarchical table structure for PDF
      const structure = getHierarchicalTableStructure();
      const primaryField = formFields.find((field: any) => field.is_primary_column);
      
      // Calculate column spans
      const getColumnSpan = (category: any) => {
        let span = category.fields.length;
        Object.values(category.subCategories).forEach((subCat: any) => {
          span += subCat.fields.length;
        });
        return span;
      };
      
      tableHTML = `
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 11px;">
          <thead>
            <!-- First header row - Main categories -->
            <tr style="background-color: #f5f5f5;">
              <th rowspan="3" style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; background-color: #e3f2fd; min-width: 80px;">
                ${primaryField?.field_label || 'Province'}
              </th>
              ${Object.values(structure).map((category: any) => `
                <th colspan="${getColumnSpan(category)}" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; background-color: ${
                  category.name === 'Doctors' ? '#e8f5e8' :
                  category.name === 'Dentists' ? '#e3f2fd' :
                  category.name === 'Specialists' ? '#f3e5f5' : '#f5f5f5'
                };">
                  ${category.name}
                </th>
              `).join('')}
            </tr>
            
            <!-- Second header row - Sub categories (Medical/Dental) -->
            <tr style="background-color: #fafafa;">
              ${Object.values(structure).map((category: any) => `
                ${category.fields.length > 0 ? `
                  <th colspan="${category.fields.length}" style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: 500; font-size: 10px;">
                    ${category.name}
                  </th>
                ` : ''}
                ${Object.values(category.subCategories).map((subCat: any) => `
                  <th colspan="${subCat.fields.length}" style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: 500; font-size: 10px;">
                    ${subCat.name}
                  </th>
                `).join('')}
              `).join('')}
            </tr>
            
            <!-- Third header row - Field labels (Total, Male, Female) -->
            <tr style="background-color: #ffffff;">
              ${Object.values(structure).map((category: any) => `
                ${category.fields.map((field: any) => `
                  <th style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px; min-width: 50px;">
                    ${field.label}
                  </th>
                `).join('')}
                ${Object.values(category.subCategories).map((subCat: any) => 
                  subCat.fields.map((field: any) => `
                    <th style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px; min-width: 50px;">
                      ${field.label}
                    </th>
                  `).join('')
                ).join('')}
              `).join('')}
            </tr>
          </thead>
          
          <tbody>
            ${filteredSubmissions.map((submission) => `
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f8f9fa; text-align: left;">
                  ${primaryField?.field_name ? (submission.data as any)?.[primaryField.field_name] || '-' : '-'}
                </td>
                ${Object.values(structure).map((category: any) => `
                  ${category.fields.map((field: any) => `
                    <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">
                      ${(submission.data as any)?.[field.key] || '-'}
                    </td>
                  `).join('')}
                  ${Object.values(category.subCategories).map((subCat: any) => 
                    subCat.fields.map((field: any) => `
                      <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">
                        ${(submission.data as any)?.[field.key] || '-'}
                      </td>
                    `).join('')
                  ).join('')}
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      // Generate simple table for non-hierarchical forms
      tableHTML = `
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 11px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Submission Date</th>
              ${formFields.map(field => `
                <th style="border: 1px solid #000; padding: 8px; text-align: center;">${field.field_label}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredSubmissions.map(submission => `
              <tr>
                <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                  ${new Date(submission.submitted_at).toLocaleDateString()}
                </td>
                ${formFields.map(field => `
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                    ${(submission.data as any)?.[field.field_name] || '-'}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedForm.form.name} - ${selectedSchedule?.name} Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: black;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 12px;
              margin-bottom: 15px;
            }
            @media print {
              body { margin: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${selectedForm.form.name.toUpperCase()}</div>
            <div class="subtitle">Comprehensive data collection for ${selectedForm.form.name.toLowerCase()} across provinces</div>
          </div>
          
          ${tableHTML}
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; margin-right: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Published Schedules</h3>
              <Badge variant="secondary">
                {filteredSchedules.length} of {publishedSchedules.length} schedules
              </Badge>
            </div>

            {/* Schedule Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search schedules</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or description..."
                        value={scheduleFilter}
                        onChange={(e) => setScheduleFilter(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter by date</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All schedules</SelectItem>
                        <SelectItem value="current_year">Current year</SelectItem>
                        <SelectItem value="current_month">Current month</SelectItem>
                        <SelectItem value="last_6_months">Last 6 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(scheduleFilter || dateFilter !== 'all') && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setScheduleFilter('');
                        setDateFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {filteredSchedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {publishedSchedules.length === 0 
                      ? "No published schedules available" 
                      : "No schedules match your filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSchedules.map((schedule) => (
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {filteredForms.length} of {scheduleForms.length} forms
                </Badge>
                <Button variant="outline" onClick={() => setSelectedSchedule(null)}>
                  Back to Schedules
                </Button>
              </div>
            </div>

            {/* Forms Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search forms</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by form name or description..."
                        value={formFilter}
                        onChange={(e) => setFormFilter(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter by department</label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {uniqueDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(formFilter || departmentFilter !== 'all') && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setFormFilter('');
                        setDepartmentFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {loadingData ? (
              <div className="text-center py-8">Loading forms...</div>
            ) : filteredForms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {scheduleForms.length === 0 
                      ? "No forms in this schedule" 
                      : "No forms match your filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredForms.map((scheduleForm) => (
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {filteredSubmissions.length} of {formSubmissions.length} submissions
                </Badge>
                <Button variant="outline" onClick={exportToPDF} disabled={!filteredSubmissions.length}>
                  <FileX className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={exportToCSV} disabled={!filteredSubmissions.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => setSelectedForm(null)}>
                  Back to Forms
                </Button>
              </div>
            </div>

            {/* Submissions Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter by submission date</label>
                    <Select value={submissionDateFilter} onValueChange={setSubmissionDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All submissions</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this_week">This week</SelectItem>
                        <SelectItem value="this_month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    {submissionDateFilter !== 'all' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSubmissionDateFilter('all')}
                      >
                        Clear filter
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    {isHierarchicalForm() ? (
                      // Hierarchical table with grouped column structure
                      (() => {
                        const structure = getHierarchicalTableStructure();
                        const primaryField = formFields.find((field: any) => field.is_primary_column);
                        
                        // Calculate column spans
                        const getColumnSpan = (category: any) => {
                          let span = category.fields.length;
                          Object.values(category.subCategories).forEach((subCat: any) => {
                            span += subCat.fields.length;
                          });
                          return span;
                        };
                        
                        return (
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full border-collapse">
                              <thead>
                                {/* First header row - Main categories */}
                                <tr className="bg-gray-100">
                                  <th rowSpan={3} className="border border-gray-300 p-3 text-center font-semibold bg-blue-50">
                                    {primaryField?.field_label || 'Province'}
                                  </th>
                                  {Object.values(structure).map((category: any) => (
                                    <th key={category.name} colSpan={getColumnSpan(category)} 
                                        className={`border border-gray-300 p-2 text-center font-semibold ${
                                          category.name === 'Doctors' ? 'bg-green-100' :
                                          category.name === 'Dentists' ? 'bg-blue-100' :
                                          category.name === 'Specialists' ? 'bg-purple-100' : 'bg-gray-100'
                                        }`}>
                                      {category.name}
                                    </th>
                                  ))}
                                </tr>
                                
                                {/* Second header row - Sub categories (Medical/Dental) */}
                                <tr className="bg-gray-50">
                                  {Object.values(structure).map((category: any) => (
                                    <>
                                      {category.fields.length > 0 && (
                                        <th colSpan={category.fields.length} 
                                            className="border border-gray-300 p-2 text-center font-medium">
                                          {category.name}
                                        </th>
                                      )}
                                      {Object.values(category.subCategories).map((subCat: any) => (
                                        <th key={subCat.name} colSpan={subCat.fields.length} 
                                            className="border border-gray-300 p-2 text-center font-medium">
                                          {subCat.name}
                                        </th>
                                      ))}
                                    </>
                                  ))}
                                </tr>
                                
                                {/* Third header row - Field labels (Total, Male, Female) */}
                                <tr className="bg-white">
                                  {Object.values(structure).map((category: any) => (
                                    <>
                                      {category.fields.map((field: any) => (
                                        <th key={field.key} className="border border-gray-300 p-2 text-center text-sm">
                                          {field.label}
                                        </th>
                                      ))}
                                      {Object.values(category.subCategories).map((subCat: any) => 
                                        subCat.fields.map((field: any) => (
                                          <th key={field.key} className="border border-gray-300 p-2 text-center text-sm">
                                            {field.label}
                                          </th>
                                        ))
                                      )}
                                    </>
                                  ))}
                                </tr>
                              </thead>
                              
                              <tbody>
                                {formSubmissions.map((submission) => (
                                  <tr key={submission.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 font-medium bg-blue-25">
                                      {primaryField?.field_name ? (submission.data as any)?.[primaryField.field_name] || '-' : '-'}
                                    </td>
                                    {Object.values(structure).map((category: any) => (
                                      <>
                                        {category.fields.map((field: any) => (
                                          <td key={field.key} className="border border-gray-300 p-2 text-center">
                                            {submission.data?.[field.key] || '-'}
                                          </td>
                                        ))}
                                        {Object.values(category.subCategories).map((subCat: any) => 
                                          subCat.fields.map((field: any) => (
                                            <td key={field.key} className="border border-gray-300 p-2 text-center">
                                              {submission.data?.[field.key] || '-'}
                                            </td>
                                          ))
                                        )}
                                      </>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()
                    ) : (
                      // Simple table for non-hierarchical forms
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Submission Date</TableHead>
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
                              {formFields.map((field) => (
                                <TableCell key={field.id}>
                                  {submission.data?.[field.field_name] || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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