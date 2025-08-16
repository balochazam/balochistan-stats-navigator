import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { simpleApiClient } from '@/lib/simpleApi';
import { SimpleFormRenderer } from '@/components/forms/SimpleFormRenderer';

interface SimpleFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'aggregate';
  required: boolean;
  options?: string[];
  placeholder?: string;
  aggregateFields?: string[]; // IDs of number fields to sum
}

interface Indicator {
  id: string;
  indicator_code: string;
  title: string;
  description: string;
}

interface SimpleSDGFormBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicator: Indicator | null;
  mode?: 'create' | 'enter_data'; // New prop to determine mode
}

export const SimpleSDGFormBuilder: React.FC<SimpleSDGFormBuilderProps> = ({
  open,
  onOpenChange,
  indicator,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);

  // Check if form already exists for this indicator
  const { data: existingForms = [] } = useQuery<any[]>({
    queryKey: ['/api/forms'],
    enabled: !!indicator && mode === 'enter_data',
  });

  const existingForm = existingForms.find(form => 
    form.name.toLowerCase().includes(indicator?.indicator_code.toLowerCase() || '') ||
    form.description?.toLowerCase().includes(indicator?.indicator_code.toLowerCase() || '')
  );

  // Default form structure for SDG indicators
  const [formFields, setFormFields] = useState<SimpleFormField[]>([
    {
      id: '1',
      label: 'Data Year',
      type: 'date',
      required: true,
      placeholder: 'Select the year for this data'
    },
    {
      id: '2', 
      label: 'Data Source',
      type: 'select',
      required: true,
      options: ['MICS', 'PDHS', 'PSLM', 'LFS', 'NNS', 'NDMA', 'Other']
    },
    {
      id: '3',
      label: 'Overall Value',
      type: 'number',
      required: true,
      placeholder: 'Enter the overall indicator value'
    },
    {
      id: '4',
      label: 'Urban Value',
      type: 'number',
      required: false,
      placeholder: 'Value for urban areas (if available)'
    },
    {
      id: '5',
      label: 'Rural Value', 
      type: 'number',
      required: false,
      placeholder: 'Value for rural areas (if available)'
    }
  ]);

  // Save form mutation
  const saveFormMutation = useMutation({
    mutationFn: async () => {
      if (!indicator) return;

      console.log('Saving form for indicator:', indicator.indicator_code);
      console.log('Form fields to save:', formFields);

      // Create the basic form
      const formData = {
        name: `${indicator.indicator_code} Data Collection Form`,
        description: `Data collection form for ${indicator.title}`,
        is_active: true
      };

      console.log('Creating form with data:', formData);
      const formResponse = await simpleApiClient.post('/api/forms', formData);
      console.log('Form created successfully:', formResponse);
      
      // Create form fields - ensuring we save ALL the fields from the current state
      const fieldsToSave = formFields.map((field, index) => {
        // For aggregate fields, convert the field IDs to field names for storage
        let aggregateFieldNames: string[] = [];
        if (field.type === 'aggregate' && field.aggregateFields) {
          aggregateFieldNames = field.aggregateFields.map(fieldId => {
            const targetField = formFields.find(f => f.id === fieldId);
            return targetField ? targetField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : '';
          }).filter(name => name !== '');
        }

        return {
          form_id: formResponse.id,
          field_name: field.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
          field_label: field.label,
          field_type: field.type,
          is_required: field.required,
          is_primary_column: index === 0, // First field is primary
          is_secondary_column: false,
          reference_data_name: field.type === 'select' ? field.options?.join(',') : null,
          placeholder_text: field.placeholder || '',
          aggregate_fields: aggregateFieldNames,
          field_order: index + 1,
          has_sub_headers: false,
          sub_headers: [],
          field_group_id: null // No groups for simple forms
        };
      });

      console.log('Saving form fields:', fieldsToSave);
      const fieldsResponse = await simpleApiClient.post('/api/form-fields', fieldsToSave);
      console.log('Fields saved successfully:', fieldsResponse);
      
      return formResponse;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Form created successfully for data collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/indicators'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addField = () => {
    const newField: SimpleFormField = {
      id: Date.now().toString(),
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: 'Enter value'
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (id: string, updates: Partial<SimpleFormField>) => {
    setFormFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    setFormFields(fields => fields.filter(field => field.id !== id));
  };

  const renderFieldPreview = (field: SimpleFormField) => {
    switch (field.type) {
      case 'text':
        return <Input placeholder={field.placeholder} disabled />;
      case 'number':
        return <Input type="number" placeholder={field.placeholder} disabled />;
      case 'date':
        return <Input type="date" disabled />;
      case 'textarea':
        return <Textarea placeholder={field.placeholder} disabled />;
      case 'select':
        return (
          <select className="w-full p-2 border rounded" disabled>
            <option>Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'aggregate':
        return (
          <div className="relative">
            <Input 
              type="number" 
              placeholder="Auto-calculated sum" 
              disabled 
              className="bg-blue-50 border-blue-200"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 font-medium">
              SUM
            </div>
          </div>
        );
      default:
        return <Input placeholder={field.placeholder} disabled />;
    }
  };

  if (!indicator) return null;

  // If mode is 'enter_data' and we have an existing form, show the form renderer
  if (mode === 'enter_data' && existingForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Enter Data for {indicator.indicator_code}
            </DialogTitle>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Indicator:</strong> {indicator.indicator_code}</div>
              <div><strong>Title:</strong> {indicator.title}</div>
            </div>
          </DialogHeader>
          
          <SimpleFormRenderer 
            formId={existingForm.id} 
            onSubmissionSuccess={() => {
              toast({
                title: "Success!",
                description: "Data submitted successfully.",
              });
              onOpenChange(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Create Data Collection Form
          </DialogTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Indicator:</strong> {indicator.indicator_code}</div>
            <div><strong>Title:</strong> {indicator.title}</div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Form Fields</h3>
              <Button onClick={addField} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {formFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Field {index + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(field.id)}
                        disabled={formFields.length <= 2} // Keep at least 2 essential fields
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Field Label *</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Enter field label"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Field Type</Label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                          className="w-full p-2 text-sm border rounded"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">Dropdown</option>
                          <option value="textarea">Long Text</option>
                          <option value="aggregate">Aggregate (Sum)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Placeholder Text</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Help text for users"
                      />
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <Label className="text-xs">Options (one per line)</Label>
                        <Textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => updateField(field.id, { 
                            options: e.target.value.split('\n').filter(o => o.trim()) 
                          })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={3}
                        />
                      </div>
                    )}

                    {field.type === 'aggregate' && (
                      <div>
                        <Label className="text-xs">Fields to Sum (select all number fields to include)</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                          {formFields
                            .filter(f => f.type === 'number' && f.id !== field.id)
                            .map(numberField => (
                              <label key={numberField.id} className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={field.aggregateFields?.includes(numberField.id) || false}
                                  onChange={(e) => {
                                    const currentFields = field.aggregateFields || [];
                                    const newFields = e.target.checked
                                      ? [...currentFields, numberField.id]
                                      : currentFields.filter(id => id !== numberField.id);
                                    updateField(field.id, { aggregateFields: newFields });
                                  }}
                                />
                                <span>{numberField.label || `Field ${formFields.indexOf(numberField) + 1}`}</span>
                              </label>
                            ))}
                          {formFields.filter(f => f.type === 'number' && f.id !== field.id).length === 0 && (
                            <div className="text-gray-500 text-sm">No number fields available for aggregation</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-xs">
                        Required field
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Form Preview</h3>
            <Card className="p-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-base">
                  {indicator.indicator_code} Data Collection
                </CardTitle>
                <p className="text-sm text-gray-600">{indicator.title}</p>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                {formFields.map(field => (
                  <div key={field.id} className="space-y-1">
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderFieldPreview(field)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => saveFormMutation.mutate()}
            disabled={saveFormMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveFormMutation.isPending ? 'Creating...' : 'Create Form'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};