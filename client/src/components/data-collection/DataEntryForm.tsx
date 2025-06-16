import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReferenceDataSelect } from '@/components/reference-data/ReferenceDataSelect';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle, Plus } from 'lucide-react';

interface FormField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required: boolean;
  reference_data_name?: string;
  placeholder_text?: string;
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

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchFormFields = useCallback(async () => {
    if (!scheduleForm.form_id) return;
    
    try {
      setError(null);
      console.log('Fetching form fields for form:', scheduleForm.form_id);
      
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', scheduleForm.form_id)
        .order('field_order');

      if (error) throw error;
      
      console.log('Form fields fetched successfully:', data);
      setFormFields(data || []);
      
      // Initialize form data with empty values for each field
      const initialData: Record<string, any> = {};
      (data || []).forEach(field => {
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
      // Get submission count for this user
      const { data: submissions, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('id')
        .eq('form_id', scheduleForm.form_id)
        .eq('schedule_id', schedule.id)
        .eq('submitted_by', profile.id);

      if (submissionsError) throw submissionsError;
      
      setSubmissionCount(submissions?.length || 0);

      // Check if user has marked this form as complete
      const { data: completion, error: completionError } = await supabase
        .rpc('get_schedule_form_completion', {
          p_schedule_form_id: scheduleForm.id,
          p_user_id: profile.id
        });

      if (completionError && completionError.code !== 'PGRST116') {
        console.error('Error checking completion status:', completionError);
      } else {
        setIsCompleted(!!completion);
      }

    } catch (error) {
      console.error('Error fetching submission status:', error);
    }
  }, [profile?.id, scheduleForm.form_id, scheduleForm.id, schedule.id]);

  // Fetch form fields and submission status when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFormFields(),
        fetchSubmissionStatus()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchFormFields, fetchSubmissionStatus]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    console.log(`Updating field "${fieldName}" with value:`, value);
    setFormData(prev => {
      const updated = {
        ...prev,
        [fieldName]: value
      };
      console.log('Updated form data:', updated);
      return updated;
    });
  }, []);

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
      
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          schedule_id: schedule.id,
          form_id: scheduleForm.form_id,
          submitted_by: profile?.id,
          data: formData,
          submitted_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

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
      const { error } = await supabase
        .rpc('mark_schedule_form_complete', {
          p_schedule_form_id: scheduleForm.id,
          p_user_id: profile?.id
        });

      if (error) {
        throw error;
      }

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

  const renderField = useCallback((field: FormField) => {
    const fieldValue = formData[field.field_name] || '';
    console.log(`Rendering field: "${field.field_name}", type: ${field.field_type}, value:`, fieldValue);
    
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
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.field_name}>
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
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isMarkingComplete}>
                    Cancel
                  </Button>
                  {submissionCount > 0 && (
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={handleMarkComplete}
                      disabled={isSubmitting || isMarkingComplete}
                      className="flex items-center space-x-2"
                    >
                      {isMarkingComplete && <LoadingSpinner size="sm" />}
                      <CheckCircle className="h-4 w-4" />
                      <span>{isMarkingComplete ? 'Marking Complete...' : 'Mark as Complete'}</span>
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isMarkingComplete}
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting && <LoadingSpinner size="sm" />}
                    <Plus className="h-4 w-4" />
                    <span>{isSubmitting ? 'Adding Entry...' : 'Add Entry'}</span>
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
};
