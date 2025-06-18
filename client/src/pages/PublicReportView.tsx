import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Users, 
  FileText,
  Database,
  Eye,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

      // Generate chart data for the first form by default
      if (formsData && formsData.length > 0) {
        setActiveForm(formsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };



  const getActiveFormSubmissions = () => {
    return submissions.filter(sub => 
      forms.find(form => form.id === activeForm)?.id === activeForm
    );
  };

  const exportAllFormsData = () => {
    if (forms.length === 0 || submissions.length === 0 || !schedule) return;

    const csvContent = forms.map((form: any) => {
      const formSubmissions = submissions.filter((sub: any) => sub.form_id === form.id);
      
      if (formSubmissions.length === 0) return '';

      const formFields = form.form_fields || [];
      const rows: string[] = [];

      // Add form header
      rows.push(`\n=== ${form.name} ===`);
      
      // Add CSV headers
      const headers = formFields.map((field: any) => field.field_label);
      headers.push('Submitted Date');
      rows.push(headers.join(','));

      // Add data rows
      formSubmissions.forEach((submission: any) => {
        const data = submission.data || {};
        const row = formFields.map((field: any) => {
          const value = data[field.field_name] || '';
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        row.push(`"${new Date(submission.submitted_at).toLocaleDateString()}"`);
        rows.push(row.join(','));
      });

      return rows.join('\n');
    }).filter(content => content).join('\n\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${schedule.name}_all_forms_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllFormsPDF = () => {
    if (forms.length === 0 || submissions.length === 0 || !schedule) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table display
    let yPosition = 20;

    // Add title
    doc.setFontSize(16);
    doc.text(schedule.name, 15, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Department: ${schedule.department?.name || 'General'}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, yPosition);
    yPosition += 15;

    forms.forEach((form: any, formIndex: number) => {
      const formSubmissions = submissions.filter((sub: any) => sub.form_id === form.id);
      
      if (formSubmissions.length === 0) return;

      const formFields = form.form_fields || [];
      
      // Check if this is a hierarchical form
      const hasHierarchy = formFields.some((field: any) => field.has_sub_headers && field.sub_headers && field.sub_headers.length > 0);

      // Add form title
      if (formIndex > 0) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(form.name, 15, yPosition);
      yPosition += 10;

      if (hasHierarchy) {
        // Use the same hierarchical structure as the web table
        const structure = getHierarchicalTableStructureForPDF(formFields);
        const primaryField = formFields.find((field: any) => field.is_primary_column);
        
        if (primaryField && Object.keys(structure).length > 0) {
          // Helper function to get column span matching web logic
          const getColumnSpan = (category: any) => {
            return category.fields.length + Object.values(category.subCategories).reduce((sum: number, subCat: any) => sum + subCat.fields.length, 0);
          };

          // Create the exact 3-level header structure from the web table
          const headerRow1: any[] = [];
          const headerRow2: any[] = [];
          const headerRow3: any[] = [];
          
          // Primary column spans all 3 rows
          headerRow1.push({ 
            content: primaryField.field_label.toUpperCase(), 
            rowSpan: 3, 
            styles: { 
              halign: 'center', 
              valign: 'middle', 
              fillColor: [219, 234, 254], // bg-blue-50
              fontStyle: 'bold'
            } 
          });

          // First header row - Main categories (DOCTORS, DENTISTS, SPECIALISTS)
          Object.values(structure).forEach((category: any) => {
            const colSpan = getColumnSpan(category);
            let bgColor = [243, 244, 246]; // default gray
            
            if (category.name === 'Doctors') bgColor = [220, 252, 231]; // bg-green-100
            else if (category.name === 'Dentists') bgColor = [219, 234, 254]; // bg-blue-100  
            else if (category.name === 'Specialists') bgColor = [237, 233, 254]; // bg-purple-100
            
            headerRow1.push({ 
              content: category.name.toUpperCase(), 
              colSpan: colSpan,
              styles: { 
                halign: 'center', 
                fillColor: bgColor,
                fontStyle: 'bold'
              } 
            });
          });

          // Second header row - Subcategories (Medical/Dental for Specialists, empty for others)
          Object.values(structure).forEach((category: any) => {
            if (Object.keys(category.subCategories).length > 0) {
              // Has subcategories like Specialists -> Medical/Dental
              Object.values(category.subCategories).forEach((subCat: any) => {
                headerRow2.push({ 
                  content: subCat.name, 
                  colSpan: subCat.fields.length,
                  styles: { 
                    halign: 'center',
                    fillColor: [249, 250, 251] // bg-gray-50
                  } 
                });
              });
            } else {
              // No subcategories, span across all fields
              headerRow2.push({ 
                content: '', 
                colSpan: category.fields.length,
                styles: { 
                  halign: 'center',
                  fillColor: [249, 250, 251] // bg-gray-50
                } 
              });
            }
          });

          // Third header row - Field labels (Total, Male, Female)
          Object.values(structure).forEach((category: any) => {
            // Add direct category fields first
            category.fields.forEach((field: any) => {
              headerRow3.push({ 
                content: field.label, 
                styles: { 
                  halign: 'center',
                  fillColor: [255, 255, 255] // bg-white
                } 
              });
            });
            
            // Then add subcategory fields
            Object.values(category.subCategories).forEach((subCat: any) => {
              subCat.fields.forEach((field: any) => {
                headerRow3.push({ 
                  content: field.label, 
                  styles: { 
                    halign: 'center',
                    fillColor: [255, 255, 255] // bg-white
                  } 
                });
              });
            });
          });

          // Create data rows exactly matching the web table logic
          const tableData = formSubmissions.map((submission: any) => {
            const data = submission.data || {};
            const primaryValue = data[primaryField.field_name] || '';
            
            // Only show rows that have actual data (matching web table logic)
            if (!primaryValue || primaryValue === '') return null;

            const row = [primaryValue];
            
            // Add data in the same order as headers
            Object.values(structure).forEach((category: any) => {
              // Add direct category fields first
              category.fields.forEach((field: any) => {
                row.push(data[field.key] || '0');
              });
              
              // Then add subcategory fields
              Object.values(category.subCategories).forEach((subCat: any) => {
                subCat.fields.forEach((field: any) => {
                  row.push(data[field.key] || '0');
                });
              });
            });
            
            return row;
          }).filter(row => row !== null);

          // Generate PDF table with exact hierarchical structure
          autoTable(doc, {
            head: [headerRow1, headerRow2, headerRow3],
            body: tableData,
            startY: yPosition,
            styles: { 
              fontSize: 8, 
              cellPadding: 2,
              halign: 'center',
              lineColor: [128, 128, 128],
              lineWidth: 0.5
            },
            headStyles: { 
              textColor: [0, 0, 0],
              fontStyle: 'bold',
              fontSize: 7
            },
            columnStyles: {
              0: { 
                cellWidth: 30, 
                fontStyle: 'bold', 
                halign: 'left',
                fillColor: [255, 255, 255]
              }
            },
            margin: { left: 10, right: 10 },
            tableWidth: 'auto',
            theme: 'grid'
          });
        }
      } else {
        // Simple table for non-hierarchical forms
        const headers = formFields.map((field: any) => field.field_label);
        headers.push('Submitted Date');

        const tableData = formSubmissions.map((submission: any) => {
          const data = submission.data || {};
          const row = formFields.map((field: any) => data[field.field_name] || '');
          row.push(new Date(submission.submitted_at).toLocaleDateString());
          return row;
        });

        autoTable(doc, {
          head: [headers],
          body: tableData,
          startY: yPosition,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: 15, right: 15 }
        });
      }

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    });

    // Save the PDF
    doc.save(`${schedule.name}_all_forms_data.pdf`);
  };

  const getHierarchicalTableStructureForPDF = (formFields: any[]) => {
    const structure: any = {};
    
    formFields.forEach((field: any) => {
      if (field.has_sub_headers && field.sub_headers && field.sub_headers.length > 0) {
        field.sub_headers.forEach((subHeader: any) => {
          const categoryName = subHeader.label || subHeader.name;
          
          if (!structure[categoryName]) {
            structure[categoryName] = {
              name: categoryName,
              fields: [],
              subCategories: {}
            };
          }
          
          if (subHeader.fields && subHeader.fields.length > 0) {
            subHeader.fields.forEach((subField: any) => {
              if (subField.has_sub_headers && subField.sub_headers && subField.sub_headers.length > 0) {
                // Handle nested sub-headers
                subField.sub_headers.forEach((nestedSubHeader: any) => {
                  const subCategoryName = nestedSubHeader.label || nestedSubHeader.name;
                  
                  if (!structure[categoryName].subCategories[subCategoryName]) {
                    structure[categoryName].subCategories[subCategoryName] = {
                      name: subCategoryName,
                      fields: []
                    };
                  }
                  
                  if (nestedSubHeader.fields && nestedSubHeader.fields.length > 0) {
                    nestedSubHeader.fields.forEach((nestedField: any) => {
                      structure[categoryName].subCategories[subCategoryName].fields.push({
                        key: `${field.field_name}_${subHeader.name}_${subField.field_name}_${nestedSubHeader.name}_${nestedField.field_name}`,
                        label: nestedField.field_label,
                        type: 'nested'
                      });
                    });
                  }
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
          }
        });
      }
    });
    
    return structure;
  };

  const renderDataTable = () => {
    const formSubmissions = getActiveFormSubmissions();
    if (!formSubmissions || formSubmissions.length === 0) return null;

    const activeFormData = forms.find(f => f.id === activeForm);
    if (!activeFormData) return null;

    // Check if this is a hierarchical form by looking at form fields with sub_headers
    const formFields = activeFormData.form_fields || [];
    const hasHierarchy = formFields.some((field: any) => field.has_sub_headers && field.sub_headers && field.sub_headers.length > 0);

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

    // Helper function to get structured hierarchical data for table display
    const getHierarchicalTableStructure = () => {
      const structure: any = {};
      
      formFields.forEach((field: any) => {
        if (field.has_sub_headers && field.sub_headers && field.sub_headers.length > 0) {
          field.sub_headers.forEach((subHeader: any) => {
            const categoryName = subHeader.label || subHeader.name;
            
            if (!structure[categoryName]) {
              structure[categoryName] = {
                name: categoryName,
                fields: [],
                subCategories: {}
              };
            }
            
            if (subHeader.fields && subHeader.fields.length > 0) {
              subHeader.fields.forEach((subField: any) => {
                if (subField.has_sub_headers && subField.sub_headers && subField.sub_headers.length > 0) {
                  // Handle nested sub-headers (e.g., Medical/Dental under Specialists)
                  subField.sub_headers.forEach((nestedSubHeader: any) => {
                    const subCategoryName = nestedSubHeader.label || nestedSubHeader.name;
                    
                    if (!structure[categoryName].subCategories[subCategoryName]) {
                      structure[categoryName].subCategories[subCategoryName] = {
                        name: subCategoryName,
                        fields: []
                      };
                    }
                    
                    if (nestedSubHeader.fields && nestedSubHeader.fields.length > 0) {
                      nestedSubHeader.fields.forEach((nestedField: any) => {
                        structure[categoryName].subCategories[subCategoryName].fields.push({
                          key: `${field.field_name}_${subHeader.name}_${subField.field_name}_${nestedSubHeader.name}_${nestedField.field_name}`,
                          label: nestedField.field_label,
                          type: 'nested'
                        });
                      });
                    }
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
            }
          });
        }
      });
      
      return structure;
    };

    const structure = getHierarchicalTableStructure();
    
    // Calculate column spans
    const getColumnSpan = (category: any) => {
      let span = category.fields.length;
      Object.values(category.subCategories).forEach((subCat: any) => {
        span += subCat.fields.length;
      });
      return span;
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* First header row - Main categories */}
            <tr>
              <th rowSpan={3} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300 bg-blue-50">
                {primaryField.field_label}
              </th>
              {Object.values(structure).map((category: any, index) => (
                <th 
                  key={category.name} 
                  colSpan={getColumnSpan(category)} 
                  className={`px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 ${
                    category.name === 'Doctors' ? 'bg-green-100' :
                    category.name === 'Dentists' ? 'bg-blue-100' :
                    category.name === 'Specialists' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}
                >
                  {category.name}
                </th>
              ))}
            </tr>
            
            {/* Second header row - Sub categories (Medical/Dental) */}
            {Object.values(structure).some((category: any) => Object.keys(category.subCategories).length > 0) && (
              <tr>
                {Object.values(structure).map((category: any) => (
                  Object.keys(category.subCategories).length > 0 ? 
                    Object.values(category.subCategories).map((subCat: any) => (
                      <th 
                        key={subCat.name} 
                        colSpan={subCat.fields.length} 
                        className="px-2 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 bg-gray-50"
                      >
                        {subCat.name}
                      </th>
                    )) : 
                    <th 
                      key={category.name} 
                      colSpan={category.fields.length} 
                      className="px-2 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 bg-gray-50"
                    >
                      {/* Empty for categories without subcategories */}
                    </th>
                ))}
              </tr>
            )}
            
            {/* Third header row - Gender (Male/Female) */}
            <tr>
              {Object.values(structure).map((category: any) => [
                ...category.fields.map((field: any) => (
                  <th key={field.key} className="px-2 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 bg-white">
                    {field.label}
                  </th>
                )),
                ...Object.values(category.subCategories).map((subCat: any) => 
                  subCat.fields.map((field: any) => (
                    <th key={field.key} className="px-2 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 bg-white">
                      {field.label}
                    </th>
                  ))
                )
              ])}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formSubmissions.map((submission) => {
              const data = submission.data || {};
              const primaryValue = data[primaryField.field_name] || '';

              // Only show rows that have actual data (not empty primary value)
              if (!primaryValue || primaryValue === '') return null;

              return (
                <tr key={submission.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                    {primaryValue}
                  </td>
                  {Object.values(structure).map((category: any) => [
                    ...category.fields.map((field: any) => (
                      <td key={field.key} className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-300">
                        {data[field.key] || '0'}
                      </td>
                    )),
                    ...Object.values(category.subCategories).map((subCat: any) => 
                      subCat.fields.map((field: any) => (
                        <td key={field.key} className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-300">
                          {data[field.key] || '0'}
                        </td>
                      ))
                    )
                  ])}
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
              
              // Only show rows that have actual data (check if any field has a value)
              const hasData = formFields.some((field: any) => 
                data[field.field_name] && data[field.field_name] !== ''
              );
              
              if (!hasData) return null;

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportAllFormsData}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAllFormsPDF}>
                    <File className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

        {/* Forms Data */}
        {forms.length > 0 && (
          <Card className="mb-8">
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
                        renderDataTable()
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