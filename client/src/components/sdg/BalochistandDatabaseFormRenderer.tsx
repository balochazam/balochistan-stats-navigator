import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database, FileText, Save, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  placeholder_text?: string;
  reference_data_name?: string;
  field_order?: number;
}

interface Form {
  id: string;
  name: string;
  description?: string;
}

interface BalochistandDatabaseFormRendererProps {
  indicatorCode: string;
  indicatorTitle: string;
  formId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const BalochistandDatabaseFormRenderer: React.FC<BalochistandDatabaseFormRendererProps> = ({
  indicatorCode,
  indicatorTitle,
  formId,
  onSubmit,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast: toastHook } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors }, getValues } = useForm();

  // Fetch the form structure from the database
  const { data: form, isLoading: formLoading } = useQuery<Form>({
    queryKey: ['/api/forms', formId],
    enabled: !!formId,
  });

  // Fetch the form fields
  const { data: formFields = [], isLoading: fieldsLoading } = useQuery<FormField[]>({
    queryKey: ['/api/forms', formId, 'fields'],
    enabled: !!formId,
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: formId,
          data: data,
          submitted_by: 'current_user' // This should be replaced with actual user ID
        })
      });
      if (!response.ok) throw new Error('Failed to submit form');
      return response.json();
    },
    onSuccess: () => {
      toastHook({
        title: "Success!",
        description: `Data submitted successfully for indicator ${indicatorCode}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/form-submissions'] });
      onSubmit({ indicator_code: indicatorCode });
    },
    onError: (error) => {
      toastHook({
        title: "Error",
        description: "Failed to submit form data. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFinalSubmit = async () => {
    const currentData = getValues();
    const finalData = { ...formData, ...currentData };
    submitMutation.mutate(finalData);
  };

  const renderField = (field: FormField, index: number) => {
    const fieldId = `field_${field.id}`;
    const label = field.field_label || field.field_name || `Field ${index + 1}`;
    const fieldName = field.field_name || `field_${field.id}`;
    const placeholder = field.placeholder_text || `Enter ${label.toLowerCase()}`;
    
    switch (field.field_type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              placeholder={placeholder}
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: e.target.value }))}
              className="w-full"
            />
          </div>
        );
      
      case 'number':
      case 'percentage':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="number"
              step="0.01"
              placeholder={placeholder}
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: e.target.value }))}
              className="w-full"
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldId}
              placeholder={placeholder}
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: e.target.value }))}
              rows={3}
              className="w-full"
            />
          </div>
        );
      
      case 'select':
        const options = field.reference_data_name ? field.reference_data_name.split(',') : [];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={formData[fieldName] || ''}
              onValueChange={(value) => setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string) => (
                  <SelectItem key={option.trim()} value={option.trim()}>
                    {option.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              placeholder={placeholder}
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: e.target.value }))}
              className="w-full"
            />
          </div>
        );
    }
  };

  if (formLoading || fieldsLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading form structure...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!form || formFields.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Form Not Found</h3>
            <p>No form structure found for indicator {indicatorCode}.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group fields into logical sections (every 6-8 fields)
  const fieldGroups = [];
  const fieldsPerGroup = 8;
  const sortedFields = formFields.sort((a, b) => (a.field_order || 0) - (b.field_order || 0));
  
  for (let i = 0; i < sortedFields.length; i += fieldsPerGroup) {
    fieldGroups.push(sortedFields.slice(i, i + fieldsPerGroup));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Badge variant="outline" className="text-sm">{indicatorCode}</Badge>
                  Data Collection Form
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{indicatorTitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  Database Form
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            {fieldGroups.map((group, groupIndex) => (
              <Card key={groupIndex}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Section {groupIndex + 1}
                    <Badge variant="outline" className="text-xs">
                      {group.length} fields
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.map((field: FormField, index: number) => renderField(field, index))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Submit Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Ready to submit data for {indicatorCode}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      disabled={submitMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      disabled={submitMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {submitMutation.isPending ? 'Submitting...' : 'Submit Data'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">CSV Upload</h3>
                  <p>CSV upload functionality will be available soon for this form.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Methodology & Info */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Form Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Indicator Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Code:</strong> {indicatorCode}</div>
                <div><strong>Total Fields:</strong> {formFields.length}</div>
                <div><strong>Form Name:</strong> {form?.name || 'Custom Form'}</div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium text-sm mb-2">Data Entry Guidelines</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Fill all required fields marked with *</li>
                <li>Use authentic data sources only</li>
                <li>Verify data accuracy before submission</li>
                <li>Include proper geographic coverage</li>
              </ul>
            </div>

            {form?.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{form.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};