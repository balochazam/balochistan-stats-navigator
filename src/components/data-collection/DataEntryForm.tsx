
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
}

export const DataEntryForm = ({ schedule, scheduleForm, onSubmitted, onCancel }: DataEntryFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  }, [scheduleForm.form_id, toast]);

  // Fetch form fields when component mounts or form_id changes
  useEffect(() => {
    fetchFormFields();
  }, [fetchFormFields]);

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
        description: "Form submitted successfully"
      });

      setFormData({});
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
          <Button onClick={fetchFormFields} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{scheduleForm.form.name}</CardTitle>
        <CardDescription>
          {scheduleForm.form.description}
          <div className="text-sm text-muted-foreground mt-2">
            Schedule: {schedule.name}
            {scheduleForm.due_date && (
              <span className="ml-4">Due: {new Date(scheduleForm.due_date).toLocaleDateString()}</span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Form'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
