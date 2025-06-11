
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FormField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required: boolean;
  reference_data_name?: string;
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

  // Fetch form fields when component mounts
  React.useEffect(() => {
    fetchFormFields();
  }, [scheduleForm.form_id]);

  const fetchFormFields = async () => {
    try {
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', scheduleForm.form_id)
        .order('field_order');

      if (error) throw error;
      setFormFields(data || []);
    } catch (error) {
      console.error('Error fetching form fields:', error);
      toast({
        title: "Error",
        description: "Failed to load form fields",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    formFields.forEach(field => {
      if (field.is_required && (!formData[field.field_name] || formData[field.field_name] === '')) {
        errors.push(`${field.field_label} is required`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    try {
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

      toast({
        title: "Success",
        description: "Form submitted successfully"
      });

      setFormData({});
      onSubmitted();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );
      
      case 'select':
        return (
          <Select
            value={formData[field.field_name] || ''}
            onValueChange={(value) => handleFieldChange(field.field_name, value)}
            required={field.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
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
            type="number"
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );
      
      default:
        return (
          <Input
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div>Loading form...</div>
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
