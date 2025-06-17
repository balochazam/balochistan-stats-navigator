import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Eye, Calendar, FileX } from 'lucide-react';

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

  // Helper function to check if form has hierarchical structure
  const isHierarchicalForm = () => {
    return formFields.some((field: any) => field.has_sub_headers && field.sub_headers?.length > 0);
  };

  // Helper function to get all hierarchical columns
  const getHierarchicalColumns = () => {
    const columns: any[] = [];
    
    // Add primary column first (usually Province)
    const primaryField = formFields.find((field: any) => field.is_primary_column);
    if (primaryField) {
      columns.push({
        key: primaryField.field_name,
        label: primaryField.field_label,
        type: 'primary'
      });
    }
    
    // Add hierarchical columns
    formFields.forEach((field: any) => {
      if (field.has_sub_headers && field.sub_headers) {
        field.sub_headers.forEach((subHeader: any) => {
          subHeader.fields.forEach((subField: any) => {
            if (subField.has_sub_headers && subField.sub_headers) {
              // Handle nested sub-headers (e.g., Medical/Dental under Specialists)
              subField.sub_headers.forEach((nestedSubHeader: any) => {
                nestedSubHeader.fields.forEach((nestedField: any) => {
                  columns.push({
                    key: `${field.field_name}_${subHeader.name}_${subField.field_name}_${nestedSubHeader.name}_${nestedField.field_name}`,
                    label: `${subHeader.label || subHeader.name} ${nestedSubHeader.label || nestedSubHeader.name} ${nestedField.field_label}`,
                    type: 'hierarchical',
                    category: subHeader.label || subHeader.name,
                    subcategory: nestedSubHeader.label || nestedSubHeader.name
                  });
                });
              });
            } else {
              // Regular sub-header fields
              columns.push({
                key: `${field.field_name}_${subHeader.name}_${subField.field_name}`,
                label: `${subHeader.label || subHeader.name} ${subField.field_label}`,
                type: 'hierarchical',
                category: subHeader.label || subHeader.name
              });
            }
          });
        });
      }
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
    if (!selectedForm || !formFields.length || !formSubmissions.length) return;
    
    let headers: string[];
    let rows: string[][];
    
    if (isHierarchicalForm()) {
      // Use hierarchical column structure for CSV
      const columns = getHierarchicalColumns();
      headers = ['Submission Date', ...columns.map(col => col.label)];
      rows = formSubmissions.map(submission => [
        new Date(submission.submitted_at).toLocaleDateString(),
        ...columns.map(col => submission.data?.[col.key] || '')
      ]);
    } else {
      // Use simple structure for non-hierarchical forms
      headers = ['Submission Date', ...formFields.map(field => field.field_label)];
      rows = formSubmissions.map(submission => [
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
    if (!selectedForm || !formFields.length || !formSubmissions.length) return;
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Sort fields: primary first, then secondary, then others
    const sortedFields = [...formFields].sort((a, b) => {
      if (a.is_primary_column && !b.is_primary_column) return -1;
      if (!a.is_primary_column && b.is_primary_column) return 1;
      if (a.is_secondary_column && !b.is_secondary_column) return -1;
      if (!a.is_secondary_column && b.is_secondary_column) return 1;
      return a.field_order - b.field_order;
    });

    // Group data by primary column (e.g., "Under Control")
    const primaryField = sortedFields.find(f => f.is_primary_column);
    const secondaryField = sortedFields.find(f => f.is_secondary_column);
    const dataFields = sortedFields.filter(f => !f.is_primary_column && !f.is_secondary_column);

    // Group submissions by primary field value
    const primaryGroups = new Map();
    formSubmissions.forEach(submission => {
      const primaryValue = primaryField?.field_name ? 
        submission.data?.[primaryField.field_name] || 'Unknown' : 'Unknown';
      if (!primaryGroups.has(primaryValue)) {
        primaryGroups.set(primaryValue, []);
      }
      primaryGroups.get(primaryValue)?.push(submission);
    });

    // Get all unique secondary values for column headers
    const secondaryValues: string[] = [];
    const seen = new Set<string>();
    formSubmissions.forEach((s: any) => {
      const value = secondaryField?.field_name ? s.data?.[secondaryField.field_name] || 'Unknown' : 'All';
      if (!seen.has(value)) {
        seen.add(value);
        secondaryValues.push(value);
      }
    });
    secondaryValues.sort();

    // Create a simple structure for the cross-tabulation
    const structuredData = new Map();
    
    // Initialize the structure for each primary value
    Array.from(primaryGroups.keys()).forEach(primaryValue => {
      const rowData = new Map();
      secondaryValues.forEach(secValue => {
        rowData.set(secValue, []);
      });
      structuredData.set(primaryValue, rowData);
    });
    
    // Populate with submissions based on their actual primary and secondary values
    formSubmissions.forEach((submission: any) => {
      const primaryValue = primaryField?.field_name ? 
        submission.data?.[primaryField.field_name] || 'Unknown' : 'Unknown';
      const secondaryValue = secondaryField?.field_name ? 
        submission.data?.[secondaryField.field_name] || 'Unknown' : 'All';
      
      // Ensure the primary value exists in our structure
      if (!structuredData.has(primaryValue)) {
        const newRowData = new Map();
        secondaryValues.forEach(secValue => {
          newRowData.set(secValue, []);
        });
        structuredData.set(primaryValue, newRowData);
      }
      
      // Ensure the secondary value exists for this primary value
      const rowData = structuredData.get(primaryValue);
      if (!rowData?.has(secondaryValue)) {
        rowData?.set(secondaryValue, []);
      }
      
      // Add the submission to the correct cell
      rowData?.get(secondaryValue)?.push(submission);
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedForm.form.name} - ${selectedSchedule?.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px auto; 
            font-size: 10px;
            color: black;
            max-width: 800px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .title {
            font-size: 12px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .period {
            text-align: right;
            margin-bottom: 15px;
            font-size: 9px;
          }
          table {
            width: auto;
            border-collapse: collapse;
            margin: 0 auto 15px;
            font-size: 9px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px 8px;
            text-align: center;
            vertical-align: middle;
            white-space: nowrap;
          }
          .primary-header {
            font-weight: bold;
            background-color: #f5f5f5;
            text-align: left;
            padding-left: 8px;
            min-width: 120px;
          }
          .secondary-header {
            font-weight: bold;
            font-size: 9px;
            background-color: #f9f9f9;
            min-width: 60px;
          }
          .data-header {
            font-size: 8px;
            font-weight: bold;
            min-width: 35px;
          }
          .data-cell {
            font-size: 9px;
            min-width: 35px;
          }
          .source {
            text-align: right;
            font-size: 8px;
            font-style: italic;
            margin-top: 15px;
          }
          @media print {
            body { margin: 15px auto; max-width: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${selectedForm.form.name.toUpperCase()}</div>
          <div class="subtitle">${selectedForm.form.description || selectedSchedule?.description || ''}</div>
        </div>
        
        <div class="period">${selectedSchedule?.name} (${selectedSchedule?.start_date ? new Date(selectedSchedule.start_date).getFullYear() : 'Year'})</div>
        
        <table>
          <thead>
            <tr>
              <th rowspan="2" class="primary-header">${primaryField?.field_label || 'Category'}</th>
              ${secondaryValues.map(secValue => `
                <th colspan="2" class="secondary-header">${secValue}</th>
              `).join('')}
            </tr>
            <tr>
              ${secondaryValues.map(secValue => `
                <th class="data-header">No.</th>
                <th class="data-header">Beds</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${Array.from(structuredData.entries()).map(([primaryValue, rowData]) => `
              <tr>
                <td class="primary-header">${primaryValue}</td>
                ${secondaryValues.map(secValue => {
                  // Filter submissions for this specific primary-secondary combination
                  const cellSubmissions = formSubmissions.filter((s: any) => {
                    const sPrimary = primaryField?.field_name ? s.data?.[primaryField.field_name] : '';
                    const sSecondary = secondaryField?.field_name ? s.data?.[secondaryField.field_name] : '';
                    return sPrimary === primaryValue && sSecondary === secValue;
                  });
                  
                  if (cellSubmissions.length > 0) {
                    // Count institutions - this should be the count from the "No." field, not the number of submissions
                    const noValue = cellSubmissions.reduce((sum: number, s: any) => {
                      const no = s.data?.['No.'] || s.data?.['No'] || s.data?.['no'] || 0;
                      const num = parseFloat(no);
                      return sum + (isNaN(num) ? 0 : num);
                    }, 0);
                    
                    // Sum beds from the actual data
                    const totalBeds = cellSubmissions.reduce((sum: number, s: any) => {
                      const bedsValue = s.data?.['Beds'] || s.data?.['beds'] || 0;
                      const num = parseFloat(bedsValue);
                      return sum + (isNaN(num) ? 0 : num);
                    }, 0);
                    
                    return `
                      <td class="data-cell">${noValue}</td>
                      <td class="data-cell">${totalBeds}</td>
                    `;
                  } else {
                    // No data for this combination - show 0 and -
                    return `
                      <td class="data-cell">0</td>
                      <td class="data-cell">-</td>
                    `;
                  }
                }).join('')}
              </tr>
            `).join('')}
            
            <tr style="border-top: 2px solid #000;">
              <td class="primary-header" style="background-color: #e0e0e0; font-weight: bold;">Aggregate</td>
              ${secondaryValues.map(secValue => {
                // Calculate totals for this secondary value across all primary values
                const totalNo = Array.from(structuredData.entries()).reduce((sum, [primaryVal, rowData]) => {
                  const cellSubmissions = formSubmissions.filter((s: any) => {
                    const sPrimary = primaryField?.field_name ? s.data?.[primaryField.field_name] : '';
                    const sSecondary = secondaryField?.field_name ? s.data?.[secondaryField.field_name] : '';
                    return sPrimary === primaryVal && sSecondary === secValue;
                  });
                  
                  const noValue = cellSubmissions.reduce((cellSum: number, s: any) => {
                    const no = s.data?.['No.'] || s.data?.['No'] || s.data?.['no'] || 0;
                    const num = parseFloat(no);
                    return cellSum + (isNaN(num) ? 0 : num);
                  }, 0);
                  
                  return sum + noValue;
                }, 0);
                
                const totalBeds = Array.from(structuredData.entries()).reduce((sum, [primaryVal, rowData]) => {
                  const cellSubmissions = formSubmissions.filter((s: any) => {
                    const sPrimary = primaryField?.field_name ? s.data?.[primaryField.field_name] : '';
                    const sSecondary = secondaryField?.field_name ? s.data?.[secondaryField.field_name] : '';
                    return sPrimary === primaryVal && sSecondary === secValue;
                  });
                  
                  const bedsValue = cellSubmissions.reduce((cellSum: number, s: any) => {
                    const beds = s.data?.['Beds'] || s.data?.['beds'] || 0;
                    const num = parseFloat(beds);
                    return cellSum + (isNaN(num) ? 0 : num);
                  }, 0);
                  
                  return sum + bedsValue;
                }, 0);
                
                return `
                  <td class="data-cell" style="background-color: #f0f0f0; font-weight: bold;">${totalNo}</td>
                  <td class="data-cell" style="background-color: #f0f0f0; font-weight: bold;">${totalBeds}</td>
                `;
              }).join('')}
            </tr>
          </tbody>
        </table>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">Print PDF</button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">Close</button>
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
                <Button variant="outline" onClick={exportToPDF} disabled={!formSubmissions.length}>
                  <FileX className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
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
                    {isHierarchicalForm() ? (
                      // Hierarchical table with proper column structure
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="bg-gray-50">Submission Date</TableHead>
                            {getHierarchicalColumns().map((column) => (
                              <TableHead key={column.key} className={
                                column.type === 'primary' ? 'bg-blue-50 font-semibold' : 
                                column.category === 'Doctors' ? 'bg-green-50' :
                                column.category === 'Dentists' ? 'bg-blue-50' :
                                column.category === 'Specialists' ? 'bg-purple-50' : 'bg-gray-50'
                              }>
                                {column.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formSubmissions.map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell className="font-medium">
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </TableCell>
                              {getHierarchicalColumns().map((column) => (
                                <TableCell key={column.key} className={
                                  column.type === 'primary' ? 'font-medium bg-blue-25' : ''
                                }>
                                  {submission.data?.[column.key] || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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