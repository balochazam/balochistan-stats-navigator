import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertFormSchema, type FieldGroup, type FormField, type Form as FormType } from '@shared/schema';
import { HierarchicalFormBuilder } from './HierarchicalFormBuilder';
import { FormFieldsBuilder } from './FormFieldsBuilder';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Lightbulb, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface FormBuilderWithHierarchyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingForm?: {
    id: string;
    name: string;
    description: string | null;
    department_id: string | null;
    created_at: Date | string;
    updated_at: Date | string;
    created_by: string;
    is_active: boolean;
  } | null;
}

export const FormBuilderWithHierarchy: React.FC<FormBuilderWithHierarchyProps> = ({
  open,
  onOpenChange,
  editingForm
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [savedGroups, setSavedGroups] = useState<FieldGroup[]>([]);
  const [savedFields, setSavedFields] = useState<FormField[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true
    }
  });

  // Load existing form data
  useEffect(() => {
    if (editingForm) {
      form.reset({
        name: editingForm.name,
        description: editingForm.description || '',
        is_active: editingForm.is_active
      });
    } else {
      form.reset({
        name: '',
        description: '',
        is_active: true
      });
    }
  }, [editingForm, form]);

  // Fetch field groups for editing form
  const { data: fieldGroups = [] } = useQuery<FieldGroup[]>({
    queryKey: ['/api/forms', editingForm?.id, 'groups'],
    enabled: !!editingForm?.id,
  });

  // Fetch form fields for editing form
  const { data: formFields = [] } = useQuery<FormField[]>({
    queryKey: ['/api/forms', editingForm?.id, 'fields'],
    enabled: !!editingForm?.id,
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (fieldGroups && Array.isArray(fieldGroups) && fieldGroups.length > 0) {
      setSavedGroups(fieldGroups as FieldGroup[]);
    }
    if (formFields && Array.isArray(formFields) && formFields.length > 0) {
      const typedFields = formFields.map(field => ({
        ...field,
        reference_data_name: field.reference_data_name || undefined,
        validation_rules: field.validation_rules || undefined,
        options: field.options || undefined,
        sub_headers: field.sub_headers || undefined
      }));
      setSavedFields(typedFields);
    }
  }, [fieldGroups, formFields]);

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      return simpleApiClient.post('/api/forms', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Success",
        description: "Form created successfully"
      });
    }
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      return simpleApiClient.patch(`/api/forms/${editingForm?.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Success",
        description: "Form updated successfully"
      });
    }
  });

  // Save field groups mutation
  const saveGroupsMutation = useMutation({
    mutationFn: async (groups: FieldGroup[]) => {
      return simpleApiClient.post('/api/field-groups', groups);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Field groups saved successfully"
      });
    }
  });

  // Save form fields mutation
  const saveFieldsMutation = useMutation({
    mutationFn: async (fields: FormField[]) => {
      return simpleApiClient.post('/api/form-fields', fields);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form fields saved successfully"
      });
    }
  });

  const handleFormSubmit = async (data: any) => {
    try {
      let formResult;
      
      if (editingForm) {
        formResult = await updateFormMutation.mutateAsync(data);
      } else {
        formResult = await createFormMutation.mutateAsync(data);
      }

      // Save hierarchical structure if we have groups
      if (savedGroups.length > 0) {
        const groupsWithFormId = savedGroups.map(group => ({
          ...group,
          form_id: formResult.id
        }));
        await saveGroupsMutation.mutateAsync(groupsWithFormId);
      }

      // Save fields if we have them
      if (savedFields.length > 0) {
        const fieldsWithFormId = savedFields.map(field => ({
          ...field,
          form_id: formResult.id
        }));
        await saveFieldsMutation.mutateAsync(fieldsWithFormId);
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive"
      });
    }
  };

  const handleHierarchyChange = (groups: FieldGroup[], fields: FormField[]) => {
    setSavedGroups(groups);
    setSavedFields(fields);
  };

  const handleFieldsChange = (fields: FormField[]) => {
    setSavedFields(fields);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingForm ? 'Edit Form' : 'Create New Form'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="hierarchy">Hierarchical Structure</TabsTrigger>
                <TabsTrigger value="fields">Simple Fields</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                {/* Getting Started Guide */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-900">
                      <Info className="h-5 w-5 mr-2" />
                      Getting Started with Form Creation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <strong>Step 1:</strong> Fill in basic form information below
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <strong>Step 2:</strong> Choose between Hierarchical Structure (for complex nested data) or Simple Fields (for basic forms)
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <strong>Step 3:</strong> Configure your fields and save the form
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Form Name *</label>
                      <input
                        {...form.register('name')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Medical Personnel Census 2024"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use a clear, descriptive name that indicates the purpose of the form</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        {...form.register('description')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Annual collection of medical personnel data by gender and specialization across all provinces"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">Provide details about what data this form collects and its purpose</p>
                    </div>
                  </div>

                  {/* Form Type Guide */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                          Choose Your Form Type
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div className="p-2 bg-green-50 rounded border">
                          <div className="font-medium text-green-800">Hierarchical Structure</div>
                          <div className="text-green-700 mt-1">
                            Use for complex data with multiple levels like:
                            • Medical personnel by specialty and gender
                            • Regional data with subcategories
                            • Any data that needs grouping and totals
                          </div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded border">
                          <div className="font-medium text-blue-800">Simple Fields</div>
                          <div className="text-blue-700 mt-1">
                            Use for straightforward forms like:
                            • Contact information
                            • Basic surveys
                            • Linear data collection
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hierarchy" className="space-y-6">
                {/* Hierarchical Form Guide */}
                <Alert className="border-green-200 bg-green-50">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Hierarchical forms</strong> are perfect for collecting complex data with multiple categories and subcategories. 
                    Think of it like a spreadsheet with grouped columns that automatically calculate totals.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Form Builder */}
                  <div className="lg:col-span-3">
                    <HierarchicalFormBuilder
                      formId={editingForm?.id}
                      onSave={handleHierarchyChange}
                    />
                  </div>

                  {/* Step-by-Step Guide */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Info className="h-4 w-4 mr-2 text-blue-600" />
                          Step-by-Step Guide
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-xs">
                        <div className="space-y-2">
                          <div className="font-medium text-gray-800">1. Add Primary Column</div>
                          <div className="text-gray-600 pl-2 border-l-2 border-blue-200">
                            Choose the main identifier (Province, District, Institution, etc.)
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-gray-800">2. Create Main Categories</div>
                          <div className="text-gray-600 pl-2 border-l-2 border-green-200">
                            Add top-level groups (Doctors, Nurses, Specialists)
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-gray-800">3. Add Sub-Categories</div>
                          <div className="text-gray-600 pl-2 border-l-2 border-purple-200">
                            Create breakdowns (Male/Female, Medical/Dental)
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-gray-800">4. Configure Fields</div>
                          <div className="text-gray-600 pl-2 border-l-2 border-orange-200">
                            Set field types, validation, and calculations
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Best Practices
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="p-2 bg-green-50 rounded text-green-800">
                          • Start with the primary column (what makes each row unique)
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-blue-800">
                          • Group related fields under meaningful categories
                        </div>
                        <div className="p-2 bg-purple-50 rounded text-purple-800">
                          • Use sub-headers for demographic breakdowns
                        </div>
                        <div className="p-2 bg-orange-50 rounded text-orange-800">
                          • Test your structure with sample data
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                          Common Examples
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div>
                          <div className="font-medium text-gray-800">Medical Personnel</div>
                          <div className="text-gray-600 text-xs">
                            Province → Doctors (Male/Female) → Nurses (Male/Female) → Specialists (Medical/Dental)
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Project Data</div>
                          <div className="text-gray-600 text-xs">
                            District → Projects (Government/Private) → Budget (Allocated/Spent)
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Education Stats</div>
                          <div className="text-gray-600 text-xs">
                            School → Students (Primary/Secondary) → Teachers (Qualified/Unqualified)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fields" className="space-y-6">
                {/* Simple Fields Guide */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Simple fields</strong> are perfect for straightforward data collection like contact forms, surveys, or basic information gathering.
                    Each field appears as a single input element on the form.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Form Builder */}
                  <div className="lg:col-span-3">
                    <FormFieldsBuilder
                      fields={savedFields}
                      onFieldsChange={setSavedFields}
                      referenceDataSets={[]}
                    />
                  </div>

                  {/* Field Types Guide */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                          Field Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div className="p-2 bg-gray-50 rounded border-l-4 border-gray-400">
                          <div className="font-medium">Text</div>
                          <div className="text-gray-600">Names, titles, short responses</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded border-l-4 border-blue-400">
                          <div className="font-medium">Textarea</div>
                          <div className="text-gray-600">Long descriptions, comments</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded border-l-4 border-green-400">
                          <div className="font-medium">Number</div>
                          <div className="text-gray-600">Quantities, ages, amounts</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded border-l-4 border-purple-400">
                          <div className="font-medium">Email</div>
                          <div className="text-gray-600">Email addresses with validation</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded border-l-4 border-orange-400">
                          <div className="font-medium">Date</div>
                          <div className="text-gray-600">Birth dates, deadlines</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded border-l-4 border-red-400">
                          <div className="font-medium">Select/Radio</div>
                          <div className="text-gray-600">Predefined options from reference data</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Tips for Simple Forms
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="p-2 bg-green-50 rounded text-green-800">
                          • Use clear, descriptive field labels
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-blue-800">
                          • Mark required fields appropriately
                        </div>
                        <div className="p-2 bg-purple-50 rounded text-purple-800">
                          • Group related fields together
                        </div>
                        <div className="p-2 bg-orange-50 rounded text-orange-800">
                          • Use reference data for consistent options
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                          When to Use Simple Fields
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="text-gray-700">
                          <strong>Perfect for:</strong>
                        </div>
                        <div className="pl-2 space-y-1 text-gray-600">
                          <div>• Contact information forms</div>
                          <div>• Registration forms</div>
                          <div>• Simple surveys</div>
                          <div>• Feedback forms</div>
                          <div>• Basic data entry</div>
                        </div>
                        <div className="text-gray-700 mt-3">
                          <strong>Not ideal for:</strong>
                        </div>
                        <div className="pl-2 space-y-1 text-gray-600">
                          <div>• Complex statistical data</div>
                          <div>• Multi-level categorization</div>
                          <div>• Data requiring subtotals</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createFormMutation.isPending || updateFormMutation.isPending}
              >
                {editingForm ? 'Update Form' : 'Create Form'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};