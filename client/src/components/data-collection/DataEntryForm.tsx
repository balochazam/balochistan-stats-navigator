import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { useAuth } from '@/hooks/useSimpleAuth';
import { ReferenceDataSelect } from '@/components/reference-data/ReferenceDataSelect';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Plus, Upload, Download, FileSpreadsheet, Loader2, Save, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SimpleFormRenderer } from '@/components/forms/SimpleFormRenderer';

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
  field_type: string;
  field_label: string;
  is_required: boolean;
  is_primary_column?: boolean;
  is_secondary_column?: boolean;
  reference_data_name?: string;
  placeholder_text?: string;
  aggregate_fields?: string[];
  has_sub_headers?: boolean;
  sub_headers?: SubHeader[];
  field_order?: number;
}

interface Form {
  id: string;
  name: string;
  description: string;
}

interface Schedule {
  id: string;
  name: string;
  description: string;
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
  form: Form;
}

interface DataEntryFormProps {
  schedule: Schedule;
  scheduleForm: ScheduleForm;
  onSubmitted: () => void;
  onCancel: () => void;
  onCompleted?: () => void;
}

export const DataEntryForm = ({ schedule, scheduleForm, onSubmitted, onCancel, onCompleted }: DataEntryFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [existingSubmissions, setExistingSubmissions] = useState<any[]>([]);
  const [usedPrimaryValues, setUsedPrimaryValues] = useState<Set<string>>(new Set());
  const [csvData, setCsvData] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<Record<string, any>[] | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvCompletenessErrors, setCsvCompletenessErrors] = useState<string[]>([]);
  const [isDataComplete, setIsDataComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchFormFields = useCallback(async () => {
    if (!scheduleForm.form_id) return;
    
    try {
      setError(null);
      console.log('Fetching form fields for form:', scheduleForm.form_id);
      
      const data = await simpleApiClient.get(`/api/form-fields/${scheduleForm.form_id}`);
      
      console.log('Form fields fetched successfully:', data);
      // Debug aggregate fields
      data?.forEach((field: any) => {
        if (field.field_type === 'aggregate') {
          console.log('Aggregate field found:', field.field_name, 'aggregate_fields:', field.aggregate_fields);
        }
      });
      setFormFields(data || []);
      
      // Initialize form data with empty values for each field
      const initialData: Record<string, any> = {};
      (data || []).forEach((field: FormField) => {
        initialData[field.field_name] = '';
      });
      setFormData(initialData);
      console.log('Initial form data set:', initialData);
      
    } catch (error) {
      console.error('Error fetching form fields:', error);
      setError('Failed to load form fields');
      toast({
        title: "Error",
        description: "Failed to load form fields",
        variant: "destructive"
      });
    }
  }, [scheduleForm.form_id, toast]);

  const fetchSubmissionStatus = useCallback(async () => {
    if (!profile?.id || !scheduleForm.form_id || !schedule.id) return;

    try {
      // Get submission count for this user in this specific schedule
      const submissions = await simpleApiClient.get(`/api/form-submissions?formId=${scheduleForm.form_id}&scheduleId=${schedule.id}&userId=${profile.id}`);
      
      setSubmissionCount(submissions?.length || 0);

      // Check if user has marked this form as complete
      const completions = await simpleApiClient.get(`/api/schedule-form-completions?scheduleFormId=${scheduleForm.id}&userId=${profile.id}`);

      setIsCompleted(completions && completions.length > 0);

    } catch (error) {
      console.error('Error fetching submission status:', error);
    }
  }, [profile?.id, scheduleForm.form_id, scheduleForm.id, schedule.id]);

  const fetchExistingSubmissions = async () => {
    if (!scheduleForm.form_id || !schedule.id || formFields.length === 0) return;

    try {
      // Get all submissions for this form in this schedule (all users)
      const allSubmissions = await simpleApiClient.get(`/api/form-submissions?formId=${scheduleForm.form_id}&scheduleId=${schedule.id}`);
      
      setExistingSubmissions(allSubmissions || []);

      // Extract used primary column values
      const primaryField = formFields.find(field => field.is_primary_column);
      if (primaryField && allSubmissions) {
        console.log('Primary field:', primaryField.field_name);
        console.log('All submissions:', allSubmissions.length);
        
        const usedValues = new Set<string>();
        allSubmissions.forEach((submission: any) => {
          // The data is stored in the 'data' field according to the schema
          const value = submission.data?.[primaryField.field_name];
          console.log(`Checking submission ${submission.id}: data.${primaryField.field_name} = "${value}"`);
          
          if (value !== null && value !== undefined && value !== '') {
            usedValues.add(String(value));
            console.log(`✓ Found used primary value: "${value}" from submission ${submission.id}`);
          }
        });
        
        setUsedPrimaryValues(usedValues);
        console.log(`🚫 Total used primary values for field "${primaryField.field_name}":`, Array.from(usedValues));
      }

    } catch (error) {
      console.error('Error fetching existing submissions:', error);
    }
  };

  // Fetch form fields and submission status when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFormFields();
      await fetchSubmissionStatus();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Fetch existing submissions after form fields are loaded
  useEffect(() => {
    if (formFields.length > 0) {
      fetchExistingSubmissions();
    }
  }, [formFields.length]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    console.log(`Updating field "${fieldName}" with value:`, value);
    setFormData(prev => {
      const updated = {
        ...prev,
        [fieldName]: value
      };
      
      // Calculate aggregate fields when number fields change
      const updatedWithAggregates = { ...updated };
      
      // Function to calculate aggregates for any field structure
      const calculateAggregatesForFields = (fields: any[], parentPrefix = '') => {
        fields.forEach(field => {
          const fieldKey = parentPrefix ? `${parentPrefix}_${field.field_name}` : field.field_name;
          
          if (field.field_type === 'aggregate' && field.aggregate_fields?.length) {
            let sum = 0;
            let hasValidNumbers = false;
            
            field.aggregate_fields.forEach((aggregateFieldName: string) => {
              const fullFieldName = parentPrefix ? `${parentPrefix}_${aggregateFieldName}` : aggregateFieldName;
              const fieldValue = updatedWithAggregates[fullFieldName];
              const numValue = parseFloat(fieldValue);
              if (!isNaN(numValue)) {
                sum += numValue;
                hasValidNumbers = true;
              }
            });
            
            // Only set the aggregate value if at least one valid number exists
            updatedWithAggregates[fieldKey] = hasValidNumbers ? sum.toString() : '';
          }
        });
      };
      
      // Calculate aggregates for top-level fields
      calculateAggregatesForFields(formFields);
      
      // Calculate aggregates for sub-header fields
      formFields.forEach(field => {
        if (field.has_sub_headers && field.sub_headers) {
          field.sub_headers.forEach((subHeader: any) => {
            const subHeaderPrefix = `${field.field_name}_${subHeader.name}`;
            calculateAggregatesForFields(subHeader.fields, subHeaderPrefix);
            
            // Calculate aggregates for nested sub-header fields (e.g., Medical/Dental under Specialists)
            subHeader.fields.forEach((subField: any) => {
              if (subField.has_sub_headers && subField.sub_headers) {
                subField.sub_headers.forEach((nestedSubHeader: any) => {
                  const nestedPrefix = `${subHeaderPrefix}_${subField.field_name}_${nestedSubHeader.name}`;
                  calculateAggregatesForFields(nestedSubHeader.fields, nestedPrefix);
                });
              }
            });
          });
        }
      });
      
      console.log('Updated form data with aggregates:', updatedWithAggregates);
      return updatedWithAggregates;
    });
  }, [formFields]);

  const handleNumberChange = useCallback((fieldName: string, value: string) => {
    console.log(`Number field "${fieldName}" input:`, value);
    
    // Allow empty string for clearing the field
    if (value === '') {
      handleFieldChange(fieldName, '');
      return;
    }

    // Allow any input during typing, validate on submit
    handleFieldChange(fieldName, value);
  }, [handleFieldChange]);

  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    formFields.forEach(field => {
      // Skip validation for fields that have sub-headers enabled
      // The actual data entry happens in the sub-header fields
      if (field.has_sub_headers && field.sub_headers && field.sub_headers.length > 0) {
        return;
      }
      
      // For non-primary select fields with reference data, skip the main field validation
      // since data is entered in the individual option fields
      if (field.field_type === 'select' && !field.is_primary_column && field.reference_data_name) {
        return;
      }
      
      const fieldValue = formData[field.field_name];
      if (field.is_required && (!fieldValue || fieldValue === '')) {
        errors.push(`${field.field_label} is required`);
      }
    });

    return errors;
  }, [formFields, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting form with data:', formData);
      
      await simpleApiClient.post('/api/form-submissions', {
        schedule_id: schedule.id,
        form_id: scheduleForm.form_id,
        submitted_by: profile?.id,
        data: formData,
        submitted_at: new Date().toISOString()
      });

      console.log('Form submitted successfully');
      toast({
        title: "Success",
        description: "Data submitted successfully. You can continue adding more entries."
      });

      // Clear form for next entry
      const clearedData: Record<string, any> = {};
      formFields.forEach(field => {
        clearedData[field.field_name] = '';
      });
      setFormData(clearedData);
      
      // Update submission count
      setSubmissionCount(prev => prev + 1);
      
      // Refresh used primary values to update duplicate prevention
      await fetchExistingSubmissions();
      
      onSubmitted();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form');
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if all reference data items are covered in submissions
  const checkCompletenessForMarkComplete = async (): Promise<boolean> => {
    const primaryColumns = formFields.filter(field => field.is_primary_column);
    
    for (const primaryCol of primaryColumns) {
      if (primaryCol.reference_data_name) {
        try {
          const refData = await fetchReferenceData(primaryCol.reference_data_name);
          const submissionValues = existingSubmissions.map(sub => 
            sub.data?.[primaryCol.field_name]?.toLowerCase()
          ).filter(Boolean);
          
          const missingItems = refData.filter(refItem => 
            !submissionValues.includes(refItem.value.toLowerCase()) && 
            !submissionValues.includes(refItem.key.toLowerCase())
          );
          
          if (missingItems.length > 0) {
            toast({
              title: "Data Incomplete",
              description: `Missing ${missingItems.length} ${primaryCol.field_label} entries. Complete all data before marking as complete.`,
              variant: "destructive",
            });
            return false;
          }

          if (existingSubmissions.length !== refData.length) {
            toast({
              title: "Count Mismatch",
              description: `Expected ${refData.length} entries but found ${existingSubmissions.length}. Ensure complete data coverage.`,
              variant: "destructive",
            });
            return false;
          }
        } catch (error) {
          toast({
            title: "Validation Error",
            description: `Could not verify completeness for ${primaryCol.field_label}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    return true;
  };

  // Delete entry handler
  const handleDeleteEntry = async (entryId: string) => {
    if (deletingEntryId) return;

    try {
      setDeletingEntryId(entryId);
      
      await simpleApiClient.delete(`/api/form-submissions/${entryId}`);
      
      toast({
        title: "Success",
        description: "Entry deleted successfully"
      });

      // Refresh data
      await fetchExistingSubmissions();
      await fetchSubmissionStatus();
      
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      });
    } finally {
      setDeletingEntryId(null);
    }
  };

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;

    // First check if data is complete
    const isComplete = await checkCompletenessForMarkComplete();
    if (!isComplete) return;

    // Show approval dialog
    setShowApprovalDialog(true);
  };

  const confirmMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await simpleApiClient.post('/api/schedule-form-completions', {
        schedule_form_id: scheduleForm.id,
        user_id: profile?.id
      });

      setIsCompleted(true);
      setShowApprovalDialog(false);
      toast({
        title: "Success",
        description: "Form marked as complete"
      });

      if (onCompleted) {
        onCompleted();
      }
    } catch (error) {
      console.error('Error marking form as complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark form as complete",
        variant: "destructive"
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Generate simple CSV template
  const generateCSVTemplate = () => {
    const allHeaders: string[] = [];
    
    // Process all fields, including sub-header fields
    formFields.forEach(field => {
      if (field.has_sub_headers && field.sub_headers) {
        // For fields with sub-headers, ONLY include the actual data entry fields (sub-header fields)
        field.sub_headers.forEach(subHeader => {
          subHeader.fields.forEach(subField => {
            allHeaders.push(subField.field_label);
          });
        });
      } else {
        // For regular fields without sub-headers (like primary fields)
        allHeaders.push(field.field_label);
      }
    });
    
    // Create CSV content with headers and example row
    let csvContent = allHeaders.join(',') + '\n';
    
    // Add a simple example row with placeholder values
    const exampleRow = allHeaders.map((header) => {
      // For non-formula columns, provide helpful placeholder text
      if (header.toLowerCase().includes('district') || header.toLowerCase().includes('province')) {
        return 'Enter_Location_Name';
      } else if (header.toLowerCase().includes('year') || header.toLowerCase().includes('date')) {
        return '2024';
      } else if (header.toLowerCase().includes('male') || header.toLowerCase().includes('female')) {
        return '0';
      } else {
        return '0'; // Default for numeric fields
      }
    });
    
    csvContent += exampleRow.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${scheduleForm.form.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded!",
      description: "CSV template downloaded with example data. Fill it out and upload using the CSV tab.",
    });
  };

  // Fetch reference data for validation
  const fetchReferenceData = async (dataName: string): Promise<any[]> => {
    try {
      const data = await simpleApiClient.get(`/api/data-banks/${dataName}/entries`);
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch reference data for ${dataName}:`, error);
      return [];
    }
  };

  // Parse CSV data with comprehensive validation
  const parseCSVData = async (csvText: string): Promise<{ 
    entries: Record<string, any>[], 
    validationErrors: string[], 
    duplicateErrors: string[],
    completenessErrors: string[]
  }> => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { entries: [], validationErrors: ['CSV must have at least 2 lines (headers + data)'], duplicateErrors: [], completenessErrors: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const fieldMap: Record<string, string> = {};
    const expectedHeaders: string[] = [];
    
    // Map CSV headers to field names and build expected headers list
    formFields.forEach(field => {
      if (field.has_sub_headers && field.sub_headers) {
        // Handle sub-header fields
        field.sub_headers.forEach(subHeader => {
          subHeader.fields.forEach(subField => {
            const fieldKey = `${field.field_name}_${subHeader.name}_${subField.field_name}`;
            expectedHeaders.push(subField.field_label);
            
            const matchingHeader = headers.find(h => 
              h.toLowerCase() === subField.field_label.toLowerCase() ||
              h.toLowerCase() === fieldKey.toLowerCase()
            );
            if (matchingHeader) {
              fieldMap[matchingHeader] = fieldKey;
            }
          });
        });
      } else {
        // Handle regular fields
        expectedHeaders.push(field.field_label);
        const matchingHeader = headers.find(h => 
          h.toLowerCase() === field.field_label.toLowerCase() ||
          h.toLowerCase() === field.field_name.toLowerCase()
        );
        if (matchingHeader) {
          fieldMap[matchingHeader] = field.field_name;
        }
      }
    });

    // Identify primary columns for validation
    const primaryColumns = formFields.filter(field => field.is_primary_column);
    
    // Build list of all required fields including sub-header fields
    const requiredFields: { field_name: string; field_label: string; reference_data_name?: string }[] = [];
    formFields.forEach(field => {
      if (field.has_sub_headers && field.sub_headers) {
        field.sub_headers.forEach(subHeader => {
          subHeader.fields.forEach(subField => {
            if (subField.is_required) {
              requiredFields.push({
                field_name: `${field.field_name}_${subHeader.name}_${subField.field_name}`,
                field_label: subField.field_label,
                reference_data_name: subField.reference_data_name
              });
            }
          });
        });
      } else if (field.is_required) {
        requiredFields.push({
          field_name: field.field_name,
          field_label: field.field_label,
          reference_data_name: field.reference_data_name
        });
      }
    });

    // Validation arrays
    const entries: Record<string, any>[] = [];
    const validationErrors: string[] = [];
    const duplicateErrors: string[] = [];
    const completenessErrors: string[] = [];
    const primaryKeyTracker = new Set<string>();

    // 1. COLUMN VALIDATION: Check exact column match
    const missingHeaders = expectedHeaders.filter(expected => 
      !headers.some(h => h.toLowerCase() === expected.toLowerCase())
    );
    const extraHeaders = headers.filter(h => 
      !expectedHeaders.some(expected => expected.toLowerCase() === h.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      validationErrors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    if (extraHeaders.length > 0) {
      validationErrors.push(`Extra columns not allowed: ${extraHeaders.join(', ')}`);
    }

    // If column structure is wrong, return early
    if (missingHeaders.length > 0 || extraHeaders.length > 0) {
      return { entries: [], validationErrors, duplicateErrors: [], completenessErrors: [] };
    }

    // 2. FETCH REFERENCE DATA for primary columns validation
    const referenceDataCache: Record<string, any[]> = {};
    for (const primaryCol of primaryColumns) {
      if (primaryCol.reference_data_name) {
        try {
          const refData = await fetchReferenceData(primaryCol.reference_data_name);
          referenceDataCache[primaryCol.reference_data_name] = refData;
        } catch (error) {
          validationErrors.push(`Failed to load reference data for ${primaryCol.field_label}`);
        }
      }
    }

    // Parse data rows
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

      // 3. PRIMARY COLUMN REFERENCE DATA VALIDATION
      for (const primaryCol of primaryColumns) {
        if (primaryCol.reference_data_name && referenceDataCache[primaryCol.reference_data_name]) {
          const refData = referenceDataCache[primaryCol.reference_data_name];
          const entryValue = entry[primaryCol.field_name];
          
          const validValue = refData.some(refItem => 
            refItem.value.toLowerCase() === entryValue.toLowerCase() ||
            refItem.key.toLowerCase() === entryValue.toLowerCase()
          );
          
          if (!validValue) {
            validationErrors.push(
              `Row ${lineNumber}: "${entryValue}" is not available in the ${primaryCol.field_label} reference data list`
            );
          }
        }
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

    // 4. COMPLETENESS VALIDATION: Check if all reference data items are covered
    for (const primaryCol of primaryColumns) {
      if (primaryCol.reference_data_name && referenceDataCache[primaryCol.reference_data_name]) {
        const refData = referenceDataCache[primaryCol.reference_data_name];
        const csvValues = entries.map(entry => entry[primaryCol.field_name]?.toLowerCase());
        
        const missingItems = refData.filter(refItem => 
          !csvValues.includes(refItem.value.toLowerCase()) && 
          !csvValues.includes(refItem.key.toLowerCase())
        );
        
        if (missingItems.length > 0) {
          completenessErrors.push(
            `${primaryCol.field_label} completeness: Missing ${missingItems.length} items from reference data: ${missingItems.map(item => item.value).slice(0, 5).join(', ')}${missingItems.length > 5 ? '...' : ''}`
          );
        }

        const expectedCount = refData.length;
        const actualCount = entries.length;
        
        if (actualCount !== expectedCount) {
          completenessErrors.push(
            `Row count mismatch: Expected exactly ${expectedCount} rows (matching reference data), but got ${actualCount} rows`
          );
        }
      }
    }
    
    return { entries, validationErrors, duplicateErrors, completenessErrors };
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file (.csv extension required).",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Read and preview the file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const { entries, validationErrors, completenessErrors } = await parseCSVData(content);
          setCsvPreviewData(entries);
          setCsvErrors(validationErrors);
          setCsvCompletenessErrors(completenessErrors);
          
          // Check if data is complete (no validation or completeness errors)
          const isComplete = validationErrors.length === 0 && completenessErrors.length === 0;
          setIsDataComplete(isComplete);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          setCsvErrors(['Failed to parse CSV file. Please check the format.']);
          setCsvCompletenessErrors([]);
          setIsDataComplete(false);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV bulk upload with approval workflow
  const handleCSVUpload = async () => {
    if (!csvPreviewData || csvPreviewData.length === 0) {
      toast({
        title: "No Data",
        description: "Please select a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    // Check if data is complete before allowing upload
    if (!isDataComplete) {
      toast({
        title: "Data Incomplete",
        description: "Please fix all validation and completeness errors before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsCsvUploading(true);
    try {
      const entries = csvPreviewData;
      
      // Final validation: Check for duplicates with existing database entries
      const primaryColumns = formFields.filter(field => field.is_primary_column);
      if (primaryColumns.length > 0) {
        const databaseDuplicates: string[] = [];
        
        entries.forEach((entry, index) => {
          const primaryKeyValues = primaryColumns.map(col => entry[col.field_name] || '').join('|');
          
          const duplicate = existingSubmissions.find((existing: any) => {
            const existingKey = primaryColumns.map(col => existing.data?.[col.field_name] || '').join('|');
            return existingKey === primaryKeyValues;
          });
          
          if (duplicate) {
            const primaryLabels = primaryColumns.map(col => `${col.field_label}: ${entry[col.field_name]}`).join(', ');
            databaseDuplicates.push(`Row ${index + 2}: Entry already exists in database (${primaryLabels})`);
          }
        });

        if (databaseDuplicates.length > 0) {
          toast({
            title: "Database Duplicates Found",
            description: databaseDuplicates.slice(0, 3).join('; ') + (databaseDuplicates.length > 3 ? '...' : ''),
            variant: "destructive",
          });
          return;
        }
      }

      // Submit all entries
      const promises = entries.map(entry => 
        simpleApiClient.post('/api/form-submissions', {
          schedule_id: schedule.id,
          form_id: scheduleForm.form_id,
          submitted_by: profile?.id,
          data: entry,
          submitted_at: new Date().toISOString()
        })
      );

      await Promise.all(promises);

      toast({
        title: "Bulk Upload Complete!",
        description: `Successfully uploaded ${entries.length} entries.`,
      });
      
      setCsvPreviewData(null);
      setSelectedFile(null);
      setCsvErrors([]);
      setSubmissionCount(prev => prev + entries.length);
      
      // Refresh existing submissions for duplicate prevention
      await fetchExistingSubmissions();
      
      onSubmitted();
    } catch (error) {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload CSV data. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCsvUploading(false);
    }
  };

  const renderSubHeaderField = useCallback((field: SubHeaderField, parentFieldName: string, subHeaderName: string) => {
    const fieldKey = `${parentFieldName}_${subHeaderName}_${field.field_name}`;
    const fieldValue = formData[fieldKey] || '';
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={fieldKey}
            name={fieldKey}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
      
      case 'select':
        if (field.reference_data_name) {
          return (
            <ReferenceDataSelect
              referenceDataName={field.reference_data_name}
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(fieldKey, value)}
              placeholder={field.placeholder_text || "Select an option"}
            />
          );
        }
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(fieldKey, value)}
          >
            <SelectTrigger id={fieldKey}>
              <SelectValue placeholder={field.placeholder_text || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={fieldValue}
            onChange={(e) => handleNumberChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
      
      case 'email':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            type="email"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
      
      case 'date':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            type="date"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            required={field.is_required}
          />
        );
      
      default:
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
    }
  }, [formData, handleFieldChange, handleNumberChange]);

  const renderNestedSubHeaderField = useCallback((field: SubHeaderField, parentFieldName: string, subHeaderName: string, nestedFieldName: string, nestedSubHeaderName: string) => {
    const fieldKey = `${parentFieldName}_${subHeaderName}_${nestedFieldName}_${nestedSubHeaderName}_${field.field_name}`;
    const fieldValue = formData[fieldKey] || '';
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            className="text-sm"
          />
        );
      
      case 'number':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={fieldValue}
            onChange={(e) => handleNumberChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            className="text-sm"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={fieldKey}
            name={fieldKey}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            className="text-sm"
          />
        );
      
      case 'select':
        if (field.reference_data_name) {
          return (
            <ReferenceDataSelect
              referenceDataName={field.reference_data_name}
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(fieldKey, value)}
              placeholder={field.placeholder_text || "Select an option"}
            />
          );
        }
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(fieldKey, value)}
          >
            <SelectTrigger id={fieldKey} className="text-sm">
              <SelectValue placeholder={field.placeholder_text || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'email':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            type="email"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            className="text-sm"
          />
        );
      
      case 'date':
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            type="date"
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            required={field.is_required}
            className="text-sm"
          />
        );
      
      default:
        return (
          <Input
            id={fieldKey}
            name={fieldKey}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            className="text-sm"
          />
        );
    }
  }, [formData, handleFieldChange, handleNumberChange]);

  const renderField = useCallback((field: FormField) => {
    const fieldValue = formData[field.field_name] || '';
    console.log(`Rendering field: "${field.field_name}", type: ${field.field_type}, value:`, fieldValue);
    
    // If this field has sub-headers, render the sub-header structure
    if (field.has_sub_headers && field.sub_headers && field.sub_headers.length > 0) {
      return (
        <div className="space-y-6">
          <div className="text-lg font-semibold text-gray-800 mb-4">
            {field.field_label}
          </div>
          
          {field.sub_headers.map((subHeader, subIndex) => (
            <div key={subIndex} className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
              <h4 className="font-bold text-xl mb-4 text-center bg-blue-100 py-2 px-4 rounded">
                {subHeader.label}
              </h4>
              
              {/* Check if this sub-header has nested structure (like Specialists) */}
              {subHeader.fields.some(f => f.has_sub_headers && f.sub_headers && f.sub_headers.length > 0) ? (
                <div className="space-y-4">
                  {/* Skip the specialist type selector - show all types directly */}
                  
                  {/* Render all specialist types (Medical/Dental) with their fields */}
                  {subHeader.fields
                    .filter(f => f.has_sub_headers && f.sub_headers && f.sub_headers.length > 0)
                    .map((nestedField, nestedIndex) => 
                      nestedField.sub_headers?.map((nestedSubHeader, nestedSubIndex) => (
                        <div key={`${nestedIndex}-${nestedSubIndex}`} className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
                          <h5 className="font-semibold text-lg mb-3 text-center bg-green-100 py-2 px-3 rounded">
                            {nestedSubHeader.label}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {nestedSubHeader.fields.map((nestedSubField, nestedFieldIndex) => (
                              <div key={nestedFieldIndex}>
                                <Label htmlFor={`${field.field_name}_${subHeader.name}_${nestedField.field_name}_${nestedSubHeader.name}_${nestedSubField.field_name}`} className="text-sm font-medium">
                                  {nestedSubField.field_label}
                                  {nestedSubField.is_required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <div className="mt-1">
                                  {renderNestedSubHeaderField(nestedSubField, field.field_name, subHeader.name, nestedField.field_name, nestedSubHeader.name)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ).flat()}
                </div>
              ) : (
                /* Regular sub-header with direct fields (Doctors/Dentists) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subHeader.fields.map((subField, fieldIndex) => (
                    <div key={fieldIndex} className="bg-white p-3 rounded border">
                      <Label htmlFor={`${field.field_name}_${subHeader.name}_${subField.field_name}`} className="text-sm font-medium">
                        {subField.field_label}
                        {subField.is_required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="mt-2">
                        {renderSubHeaderField(subField, field.field_name, subHeader.name)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            id={field.field_name}
            name={field.field_name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={field.field_name}
            name={field.field_name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
      
      case 'select':
        if (field.reference_data_name) {
          return (
            <ReferenceDataSelect
              referenceDataName={field.reference_data_name}
              value={fieldValue}
              onValueChange={(value) => {
                console.log(`Reference data select changed for "${field.field_name}":`, value);
                handleFieldChange(field.field_name, value);
              }}
              placeholder={field.placeholder_text || "Select an option"}
              excludeValues={field.is_primary_column ? Array.from(usedPrimaryValues) : undefined}
            />
          );
        }
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => {
              console.log(`Select changed for "${field.field_name}":`, value);
              handleFieldChange(field.field_name, value);
            }}
          >
            <SelectTrigger id={field.field_name}>
              <SelectValue placeholder={field.placeholder_text || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            id={field.field_name}
            name={field.field_name}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={fieldValue}
            onChange={(e) => handleNumberChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
            onBlur={(e) => {
              // Validate on blur to ensure it's a valid number
              const value = e.target.value.trim();
              if (value && isNaN(Number(value))) {
                toast({
                  title: "Invalid Number",
                  description: `${field.field_label} must be a valid number`,
                  variant: "destructive"
                });
              }
            }}
          />
        );

      case 'email':
        return (
          <Input
            id={field.field_name}
            name={field.field_name}
            type="email"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );

      case 'date':
        return (
          <Input
            id={field.field_name}
            name={field.field_name}
            type="date"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );

      case 'aggregate':
        return (
          <div className="relative">
            <Input
              id={field.field_name}
              name={field.field_name}
              type="text"
              value={fieldValue}
              readOnly
              disabled
              className="bg-gray-50 font-medium"
              placeholder="Auto-calculated"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {field.aggregate_fields?.length ? `Sum of ${field.aggregate_fields.length} fields` : 'No fields selected'}
            </div>
          </div>
        );
      
      default:
        return (
          <Input
            id={field.field_name}
            name={field.field_name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder_text}
            required={field.is_required}
          />
        );
    }
  }, [formData, handleFieldChange, handleNumberChange, toast]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span>Loading form...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{scheduleForm.form.name}</span>
          {isCompleted && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-normal">Completed</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {scheduleForm.form.description}
          <div className="text-sm text-muted-foreground mt-2">
            Schedule: {schedule.name}
            {scheduleForm.due_date && (
              <span className="ml-4">Due: {new Date(scheduleForm.due_date).toLocaleDateString()}</span>
            )}
            <span className="ml-4">Entries submitted: {submissionCount}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCompleted ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Form Completed</h3>
            <p className="text-gray-600 mb-4">
              You have marked this form as complete with {submissionCount} entries submitted.
            </p>
            <Button onClick={onCancel}>
              Back to Data Collection
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Manual Entry Disabled Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Data Entry Method</AlertTitle>
              <AlertDescription>
                Manual data entry has been disabled for this form. Please use CSV upload for data submission. 
                If you need manual entry access, contact the administrator for assistance.
              </AlertDescription>
            </Alert>

            {/* CSV Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">CSV Upload</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload a CSV file with your data. Download the template first to ensure correct format.
                  </p>
                </div>
                <Button
                  onClick={generateCSVTemplate}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>

              {/* Mark as Complete Button */}
              {submissionCount > 0 && (
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Ready to Complete?</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {submissionCount} entries submitted. You can mark this form as complete when all data is uploaded.
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    className="flex items-center space-x-2"
                  >
                    {isMarkingComplete && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isMarkingComplete ? 'Marking Complete...' : 'Mark as Complete'}
                  </Button>
                </div>
              )}

              {/* Submitted Entries Table */}
              {existingSubmissions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Submitted Entries</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {existingSubmissions.length} entries have been submitted for this form.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                          <tr>
                            {formFields.map((field, index) => (
                              <th key={index} className="px-4 py-2 text-left font-medium border-b">
                                {field.field_label}
                              </th>
                            ))}
                            <th className="px-4 py-2 text-center font-medium border-b w-20">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {existingSubmissions.map((submission, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                              {formFields.map((field, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 border-b">
                                  {submission.data?.[field.field_name] || '-'}
                                </td>
                              ))}
                              <td className="px-4 py-2 border-b text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEntry(submission.id)}
                                  disabled={deletingEntryId === submission.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {deletingEntryId === submission.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {!csvPreviewData ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="csvFile" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Select a CSV file to upload
                          </span>
                          <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                            or drag and drop it here
                          </span>
                        </label>
                        <input
                          id="csvFile"
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <Button
                        onClick={() => document.getElementById('csvFile')?.click()}
                        variant="outline"
                        className="mt-4"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Preview CSV Data</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {csvPreviewData.length} rows found. Review the data below and approve to upload.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setCsvPreviewData(null);
                          setCsvErrors([]);
                          setSelectedFile(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Select Different File
                      </Button>
                    </div>
                  </div>

                  {csvErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors Found</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          {csvErrors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {csvCompletenessErrors.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Completeness Issues</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          {csvCompletenessErrors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {isDataComplete && csvErrors.length === 0 && csvCompletenessErrors.length === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Data Ready for Upload</AlertTitle>
                      <AlertDescription>
                        All validations passed. Data is complete and ready for upload.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                          <tr>
                            {csvPreviewData.length > 0 && Object.keys(csvPreviewData[0]).map((header, index) => (
                              <th key={index} className="px-4 py-2 text-left font-medium border-b">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreviewData.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                              {Object.values(row).map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 border-b">
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csvPreviewData.length > 10 && (
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                        Showing first 10 rows of {csvPreviewData.length} total rows
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCSVUpload}
                      disabled={!isDataComplete || isCsvUploading}
                      className="flex items-center gap-2"
                      variant={isDataComplete ? "default" : "secondary"}
                    >
                      {isCsvUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isDataComplete ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {isCsvUploading ? 'Uploading...' : 
                       isDataComplete ? `Approve & Upload ${csvPreviewData.length} Rows` : 
                       'Fix Issues to Upload'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Approval Dialog for Mark as Complete */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Form Completion</DialogTitle>
            <DialogDescription>
              Please review all submitted entries before marking this form as complete. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-auto">
            <div className="space-y-2 mb-4">
              <h4 className="font-medium">Summary:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="ml-2 font-medium">{existingSubmissions.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Form:</span>
                  <span className="ml-2 font-medium">{scheduleForm.form.name}</span>
                </div>
              </div>
            </div>

            {existingSubmissions.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2">
                  <h4 className="font-medium text-sm">All Submitted Entries</h4>
                </div>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                      <tr>
                        {existingSubmissions.length > 0 && formFields.map((field, index) => (
                          <th key={index} className="px-2 py-1 text-left font-medium border-b">
                            {field.field_label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {existingSubmissions.map((submission, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                          {formFields.map((field, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1 border-b text-xs">
                              {submission.data?.[field.field_name] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={isMarkingComplete}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmMarkComplete}
              disabled={isMarkingComplete}
              className="flex items-center gap-2"
            >
              {isMarkingComplete && <Loader2 className="h-4 w-4 animate-spin" />}
              {isMarkingComplete ? 'Marking Complete...' : 'Mark as Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
