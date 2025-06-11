
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  reference_data_name?: string;
  placeholder_text?: string;
  field_order: number;
}

interface ScheduleForm {
  id: string;
  schedule_id: string;
  form_id: string;
  form: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface DataEntryFormProps {
  scheduleForm: ScheduleForm;
  onSubmitted: () => void;
  onCancel: () => void;
}

export const DataEntryForm = ({ scheduleForm, onSubmitted, onCancel }: DataEntryFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [referenceData, setReferenceData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFormFields();
  }, [scheduleForm.form_id]);

  const fetchFormFields = async () => {
    try {
      console.log('Fetching form fields for form:', scheduleForm.form_id);
      
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', scheduleForm.form_id)
        .order('field_order');

      if (fieldsError) throw fieldsError;

      setFields(fieldsData || []);

      // Fetch reference data for dropdown fields
      const referenceDataSets = fieldsData
        ?.filter(field => (field.field_type === 'select' || field.field_type === 'radio') && field.reference_data_name)
        .map(field => field.reference_data_name)
        .filter((name, index, array) => array.indexOf(name) === index);

      if (referenceDataSets && referenceDataSets.length > 0) {
        await fetchReferenceData(referenceDataSets);
      }
    } catch (error) {
      console.error('Error fetching form fields:', error);
      toast({
        title: "Error",
        description: "Failed to load form fields",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async (dataSetNames: string[]) => {
    try {
      const refData: Record<string, any[]> = {};
      
      for (const dataSetName of dataSetNames) {
        const { data, error } = await supabase
          .from('data_bank_entries')
          .select('key, value')
          .eq('data_bank_id', 
            supabase
              .from('data_banks')
              .select('id')
              .eq('name', dataSetName)
              .eq('is_active', true)
              .single()
          )
          .eq('is_active', true);

        if (error) {
          console.error(`Error fetching reference data for ${dataSetName}:`, error);
        } else {
          refData[dataSetName] = data || [];
        }
      }
      
      setReferenceData(refData);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.is_required) {
        const value = formData[field.field_name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.field_name] = `${field.field_label} is required`;
        }
      }
      
      // Validate email fields
      if (field.field_type === 'email' && formData[field.field_name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.field_name])) {
          newErrors[field.field_name] = 'Please enter a valid email address';
        }
      }
      
      // Validate number fields
      if (field.field_type === 'number' && formData[field.field_name]) {
        if (isNaN(Number(formData[field.field_name]))) {
          newErrors[field.field_name] = 'Please enter a valid number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (!profile?.id) return;

    setSubmitting(true);
    try {
      console.log('Submitting form data:', formData);
      
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: scheduleForm.form_id,
          schedule_id: scheduleForm.schedule_id,
          submitted_by: profile.id,
          data: formData
        });

      if (error) throw error;

      console.log('Form submitted successfully');
      onSubmitted();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.field_name] || '';
    const error = errors[field.field_name];
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.field_type}
              value={value}
              onChange={(e) => updateFormData(field.field_name, e.target.value)}
              placeholder={field.placeholder_text || ''}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type="date"
              value={value}
              onChange={(e) => updateFormData(field.field_name, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.field_name}
              value={value}
              onChange={(e) => updateFormData(field.field_name, e.target.value)}
              placeholder={field.placeholder_text || ''}
              rows={3}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'select':
        const selectOptions = field.reference_data_name ? referenceData[field.reference_data_name] || [] : [];
        return (
          <div className="space-y-2">
            <Label>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => updateFormData(field.field_name, newValue)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder_text || `Select ${field.field_label}`} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      case 'radio':
        const radioOptions = field.reference_data_name ? referenceData[field.reference_data_name] || [] : [];
        return (
          <div className="space-y-2">
            <Label>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => updateFormData(field.field_name, newValue)}
              className={error ? 'border border-red-500 rounded p-2' : ''}
            >
              {radioOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.field_name}-${index}`} />
                  <Label htmlFor={`${field.field_name}-${index}`}>{option.value}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <span>{scheduleForm.form.name}</span>
            </CardTitle>
          </div>
          {scheduleForm.form.description && (
            <p className="text-gray-600">{scheduleForm.form.description}</p>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
