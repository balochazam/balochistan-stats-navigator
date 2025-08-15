import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { ReferenceDataSelect } from '@/components/reference-data/ReferenceDataSelect';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Save, Loader2, Upload, Download, FileSpreadsheet, CheckCircle, Plus } from 'lucide-react';

interface SubHeaderField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  field_order: number;
  reference_data_name?: string;
  placeholder_text?: string;
  aggregate_fields?: string[];
  is_secondary_column?: boolean;
  has_sub_headers?: boolean;
  sub_headers?: SubHeader[];
}

interface SubHeader {
  id?: string;
  name: string;
  label: string;
  fields: SubHeaderField[];
}

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  is_primary_column?: boolean;
  is_secondary_column?: boolean;
  placeholder_text?: string;
  reference_data_name?: string;
  field_order: number;
  aggregate_fields?: string[];
  has_sub_headers?: boolean;
  sub_headers?: SubHeader[];
}

interface SimpleFormRendererProps {
  formId?: string;
  formFields?: FormField[];
  scheduleForm?: any;
  schedule?: any;
  submissionCount?: number;
  isMarkingComplete?: boolean;
  onCancel?: () => void;
  onMarkComplete?: () => void;
  onSubmitted?: () => void;
  onSubmissionSuccess?: () => void;
}

export const SimpleFormRenderer: React.FC<SimpleFormRendererProps> = ({
  formId,
  formFields: propFormFields,
  scheduleForm,
  schedule,
  submissionCount = 0,
  isMarkingComplete = false,
  onCancel,
  onMarkComplete,
  onSubmitted,
  onSubmissionSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [csvData, setCsvData] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch form fields only if not provided as props
  const { data: fetchedFormFields = [], isLoading } = useQuery<FormField[]>({
    queryKey: [`/api/form-fields/${formId}`],
    enabled: !!formId && !propFormFields,
  });

  // Use provided form fields or fetched ones
  const formFields = propFormFields || fetchedFormFields;

  // Initialize form data when fields are loaded
  useEffect(() => {
    if (formFields.length > 0) {
      const initialData: Record<string, any> = {};
      formFields.forEach((field) => {
        initialData[field.field_name] = '';
      });
      setFormData(initialData);
    }
  }, [formFields]);

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const payload: any = {
        data: data
      };
      
      // Use formId or scheduleForm.form_id
      if (formId) {
        payload.form_id = formId;
      } else if (scheduleForm?.form_id) {
        payload.form_id = scheduleForm.form_id;
        payload.schedule_id = schedule?.id;
        payload.submitted_by = data.user_id; // Will be set in handleSubmit
        payload.submitted_at = new Date().toISOString();
      }
      
      return await simpleApiClient.post('/api/form-submissions', payload);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Data submitted successfully. You can continue adding more entries.",
      });
      
      // Clear form data for next entry
      const clearedData: Record<string, any> = {};
      formFields.forEach(field => {
        clearedData[field.field_name] = '';
      });
      setFormData(clearedData);
      
      onSubmitted?.();
      onSubmissionSuccess?.();
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // CSV bulk upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: async (entries: Record<string, any>[]) => {
      const promises = entries.map(entry => {
        const payload: any = { data: entry };
        
        // Use formId or scheduleForm.form_id
        if (formId) {
          payload.form_id = formId;
        } else if (scheduleForm?.form_id) {
          payload.form_id = scheduleForm.form_id;
          payload.schedule_id = schedule?.id;
          payload.submitted_by = entry.user_id; // Will be set per entry
          payload.submitted_at = new Date().toISOString();
        }
        
        return simpleApiClient.post('/api/form-submissions', payload);
      });
      return await Promise.all(promises);
    },
    onSuccess: (results) => {
      toast({
        title: "Bulk Upload Complete!",
        description: `Successfully uploaded ${results.length} entries.`,
      });
      setCsvData('');
      onSubmitted?.();
      onSubmissionSuccess?.();
    },
    onError: (error) => {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload CSV data. Please check the format and try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Manual form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const validationErrors = [];
    for (const field of formFields) {
      if (field.is_required && (!formData[field.field_name] || formData[field.field_name] === '')) {
        validationErrors.push(`${field.field_label} is required`);
      }
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Get current user ID if needed (for schedule submissions)
      let userId = null;
      if (scheduleForm) {
        const userResponse = await fetch('/api/auth/user');
        const userData = await userResponse.json();
        userId = userData.user?.id;
      }

      const submitData = { ...formData };
      if (userId) {
        submitData.user_id = userId;
      }

      submitMutation.mutate(submitData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate CSV template
  const generateCSVTemplate = () => {
    const headers = formFields
      .sort((a, b) => a.field_order - b.field_order)
      .map(field => field.field_label);
    
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data_entry_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded!",
      description: "CSV template has been downloaded. Fill it out and upload using the CSV tab.",
    });
  };

  // Parse CSV data with validation
  const parseCSVData = (csvText: string): { 
    entries: Record<string, any>[], 
    validationErrors: string[], 
    duplicateErrors: string[]
  } => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { entries: [], validationErrors: ['CSV must have at least 2 lines (headers + data)'], duplicateErrors: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const fieldMap: Record<string, string> = {};
    
    // Map CSV headers to field names
    formFields.forEach(field => {
      const matchingHeader = headers.find(h => 
        h.toLowerCase() === field.field_label.toLowerCase() ||
        h.toLowerCase() === field.field_name.toLowerCase()
      );
      if (matchingHeader) {
        fieldMap[matchingHeader] = field.field_name;
      }
    });

    // Identify primary columns for duplicate detection
    const primaryColumns = formFields.filter(field => field.is_primary_column);
    const requiredFields = formFields.filter(field => field.is_required);
    
    const entries: Record<string, any>[] = [];
    const validationErrors: string[] = [];
    const duplicateErrors: string[] = [];
    const primaryKeyTracker = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const lineNumber = i + 1;
      const values = lines[i].split(',').map(v => v.trim());
      const entry: Record<string, any> = {};
      
      // Parse row data
      headers.forEach((header, index) => {
        if (fieldMap[header]) {
          entry[fieldMap[header]] = values[index] || '';
        }
      });
      
      if (Object.keys(entry).length === 0) continue;

      // Validate required fields
      const missingRequired = requiredFields.filter(field => 
        !entry[field.field_name] || entry[field.field_name] === ''
      );
      
      if (missingRequired.length > 0) {
        validationErrors.push(
          `Row ${lineNumber}: Missing required fields: ${missingRequired.map(f => f.field_label).join(', ')}`
        );
        continue;
      }

      // Check for duplicates based on primary columns
      if (primaryColumns.length > 0) {
        const primaryKeyValues = primaryColumns.map(col => entry[col.field_name] || '').join('|');
        
        if (primaryKeyTracker.has(primaryKeyValues)) {
          const primaryLabels = primaryColumns.map(col => `${col.field_label}: ${entry[col.field_name]}`).join(', ');
          duplicateErrors.push(`Row ${lineNumber}: Duplicate entry detected (${primaryLabels})`);
          continue;
        }
        
        primaryKeyTracker.add(primaryKeyValues);
      }
      
      entries.push(entry);
    }
    
    return { entries, validationErrors, duplicateErrors };
  };



  // Check for existing entries in database
  const checkExistingEntries = async (entries: Record<string, any>[]): Promise<string[]> => {
    const primaryColumns = formFields.filter(field => field.is_primary_column);
    if (primaryColumns.length === 0) return [];
    
    const existingEntries: string[] = [];
    
    try {
      // Get existing submissions for this form
      const response = await simpleApiClient.get(`/api/form-submissions?form_id=${formId}`);
      const existingSubmissions = response.data || [];
      
      entries.forEach((entry, index) => {
        const primaryKeyValues = primaryColumns.map(col => entry[col.field_name] || '').join('|');
        
        const duplicate = existingSubmissions.find((existing: any) => {
          const existingKey = primaryColumns.map(col => existing.data?.[col.field_name] || '').join('|');
          return existingKey === primaryKeyValues;
        });
        
        if (duplicate) {
          const primaryLabels = primaryColumns.map(col => `${col.field_label}: ${entry[col.field_name]}`).join(', ');
          existingEntries.push(`Entry ${index + 1}: Already exists in database (${primaryLabels})`);
        }
      });
    } catch (error) {
      console.error('Error checking existing entries:', error);
    }
    
    return existingEntries;
  };

  const handleCSVUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data before uploading.",
        variant: "destructive",
      });
      return;
    }

    const parseResult = parseCSVData(csvData);
    const { entries, validationErrors, duplicateErrors } = parseResult;
    
    // Show validation errors
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: validationErrors.slice(0, 3).join('; ') + (validationErrors.length > 3 ? '...' : ''),
        variant: "destructive",
      });
      return;
    }

    // Show duplicate errors within CSV
    if (duplicateErrors.length > 0) {
      toast({
        title: "Duplicate Entries in CSV",
        description: duplicateErrors.slice(0, 3).join('; ') + (duplicateErrors.length > 3 ? '...' : ''),
        variant: "destructive",
      });
      return;
    }

    if (entries.length === 0) {
      toast({
        title: "No Valid Data",
        description: "No valid entries found in CSV data. Please check the format and required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for existing entries in database
    const existingErrors = await checkExistingEntries(entries);
    if (existingErrors.length > 0) {
      toast({
        title: "Database Duplicates Found",
        description: existingErrors.slice(0, 2).join('; ') + (existingErrors.length > 2 ? '...' : ''),
        variant: "destructive",
      });
      return;
    }

    // All validation passed, proceed with upload
    csvUploadMutation.mutate(entries);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            id={field.field_name}
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );

      case 'number':
        return (
          <Input
            id={field.field_name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );

      case 'date':
        return (
          <Input
            id={field.field_name}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.field_name}
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            rows={4}
          />
        );

      case 'select':
        const options = field.reference_data_name ? field.reference_data_name.split(',') : [];
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleInputChange(field.field_name, newValue)}
            required={field.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={field.field_name}
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading form...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (formFields.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No form fields found for this form.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            CSV Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {formFields
              .sort((a, b) => a.field_order - b.field_order)
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.field_name} className="text-sm font-medium">
                    {field.field_label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {submissionCount > 0 && (
                  <span>{submissionCount} entries submitted</span>
                )}
              </div>
              <div className="flex space-x-2">
                {onCancel && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={submitMutation.isPending || isMarkingComplete}
                  >
                    Cancel
                  </Button>
                )}
                {onMarkComplete && submissionCount > 0 && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={onMarkComplete}
                    disabled={submitMutation.isPending || isMarkingComplete}
                    className="flex items-center space-x-2"
                  >
                    {isMarkingComplete && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isMarkingComplete ? 'Marking Complete...' : 'Mark as Complete'}
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending || isMarkingComplete}
                  className="flex items-center space-x-2"
                >
                  {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  <span>{submitMutation.isPending ? 'Adding Entry...' : 'Add Entry'}</span>
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="csv" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Bulk Data Upload</h3>
              <Button
                variant="outline"
                onClick={generateCSVTemplate}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="csv-data">
                Paste CSV Data
                <span className="text-sm text-gray-500 ml-2">
                  (First row should contain column headers)
                </span>
              </Label>
              <Textarea
                id="csv-data"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste your CSV data here, or download the template first to see the expected format..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">CSV Upload Instructions:</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Click "Download Template" to get the correct CSV format</li>
                <li>2. Fill out the template with your data in Excel or any spreadsheet app</li>
                <li>3. Copy and paste the data (including headers) into the text area above</li>
                <li>4. Click "Upload CSV Data" to submit all entries at once</li>
              </ul>
              
              {formFields.some(field => field.is_primary_column) && (
                <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded">
                  <div className="text-sm font-medium text-orange-800 mb-1">Duplicate Prevention:</div>
                  <div className="text-xs text-orange-700">
                    Primary key fields: {formFields.filter(f => f.is_primary_column).map(f => f.field_label).join(', ')}
                    <br />
                    No duplicate entries allowed for the same combination of primary key values.
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCSVUpload}
                disabled={csvUploadMutation.isPending || !csvData.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {csvUploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};