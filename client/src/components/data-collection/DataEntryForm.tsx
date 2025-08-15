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
import { CheckCircle, Plus, Upload, Download, FileSpreadsheet, Loader2, Save } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('manual');
  const [isCsvUploading, setIsCsvUploading] = useState(false);

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

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;

    setIsMarkingComplete(true);
    try {
      await simpleApiClient.post('/api/schedule-form-completions', {
        schedule_form_id: scheduleForm.id,
        user_id: profile?.id
      });

      setIsCompleted(true);
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

  // Generate CSV template
  const generateCSVTemplate = () => {
    const allHeaders: string[] = [];
    
    // Process all fields, including sub-header fields
    formFields.forEach(field => {
      if (field.has_sub_headers && field.sub_headers) {
        // For fields with sub-headers, ONLY include the actual data entry fields (sub-header fields)
        field.sub_headers.forEach(subHeader => {
          subHeader.fields.forEach(subField => {
            // Use only the sub-field label, not the parent field label
            allHeaders.push(subField.field_label);
          });
        });
      } else {
        // For regular fields without sub-headers (like primary fields)
        allHeaders.push(field.field_label);
      }
    });
    
    const csvContent = allHeaders.join(',') + '\n';
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
      description: "CSV template has been downloaded with all fields including sub-headers. Fill it out and upload using the CSV tab.",
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
    
    // Map CSV headers to field names (including sub-header fields)
    formFields.forEach(field => {
      if (field.has_sub_headers && field.sub_headers) {
        // Handle sub-header fields
        field.sub_headers.forEach(subHeader => {
          subHeader.fields.forEach(subField => {
            const fieldKey = `${field.field_name}_${subHeader.name}_${subField.field_name}`;
            
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
        const matchingHeader = headers.find(h => 
          h.toLowerCase() === field.field_label.toLowerCase() ||
          h.toLowerCase() === field.field_name.toLowerCase()
        );
        if (matchingHeader) {
          fieldMap[matchingHeader] = field.field_name;
        }
      }
    });

    // Identify primary columns for duplicate detection
    const primaryColumns = formFields.filter(field => field.is_primary_column);
    
    // Build list of all required fields including sub-header fields
    const requiredFields: { field_name: string; field_label: string }[] = [];
    formFields.forEach(field => {
      if (field.has_sub_headers && field.sub_headers) {
        field.sub_headers.forEach(subHeader => {
          subHeader.fields.forEach(subField => {
            if (subField.is_required) {
              requiredFields.push({
                field_name: `${field.field_name}_${subHeader.name}_${subField.field_name}`,
                field_label: subField.field_label // Use only the sub-field label
              });
            }
          });
        });
      } else if (field.is_required) {
        requiredFields.push({
          field_name: field.field_name,
          field_label: field.field_label
        });
      }
    });
    
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

  // Handle CSV bulk upload
  const handleCSVUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsCsvUploading(true);
    try {
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

      // Check for duplicates with existing database entries
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
      
      setCsvData('');
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
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
                  .sort((a, b) => (a.field_order || 0) - (b.field_order || 0))
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
                        disabled={isSubmitting || isMarkingComplete}
                      >
                        Cancel
                      </Button>
                    )}
                    {submissionCount > 0 && (
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleMarkComplete}
                        disabled={isSubmitting || isMarkingComplete}
                        className="flex items-center space-x-2"
                      >
                        {isMarkingComplete && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isMarkingComplete ? 'Marking Complete...' : 'Mark as Complete'}
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || isMarkingComplete}
                      className="flex items-center space-x-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Adding Entry...' : 'Add Entry'}</span>
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
                        No duplicate entries allowed for the same combination of primary key values (e.g., if District is primary, cannot enter same district twice).
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCSVUpload}
                    disabled={isCsvUploading || !csvData.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCsvUploading ? (
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
        )}
      </CardContent>
    </Card>
  );
};
