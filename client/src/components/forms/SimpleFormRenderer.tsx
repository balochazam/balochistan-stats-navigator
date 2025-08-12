import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { Save, Loader2 } from 'lucide-react';

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  placeholder_text?: string;
  reference_data_name?: string;
  field_order: number;
}

interface SimpleFormRendererProps {
  formId: string;
  onSubmissionSuccess?: () => void;
}

export const SimpleFormRenderer: React.FC<SimpleFormRendererProps> = ({
  formId,
  onSubmissionSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Fetch form fields
  const { data: formFields = [], isLoading } = useQuery<FormField[]>({
    queryKey: [`/api/form-fields/${formId}`],
    enabled: !!formId,
  });

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
      return await simpleApiClient.post('/api/form-submissions', {
        form_id: formId,
        data: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Data submitted successfully.",
      });
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

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = formFields.filter(field => field.is_required);
    const missingFields = requiredFields.filter(field => 
      !formData[field.field_name] || formData[field.field_name] === ''
    );

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.map(f => f.field_label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
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

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={submitMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Submit Data
            </>
          )}
        </Button>
      </div>
    </form>
  );
};