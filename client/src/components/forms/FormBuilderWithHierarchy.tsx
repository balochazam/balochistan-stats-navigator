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
      setSavedFields(formFields as FormField[]);
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

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Form Name</label>
                  <input
                    {...form.register('name')}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter form name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    {...form.register('description')}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter form description"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="hierarchy">
                <HierarchicalFormBuilder
                  formId={editingForm?.id}
                  onSave={handleHierarchyChange}
                />
              </TabsContent>

              <TabsContent value="fields">
                <FormFieldsBuilder
                  fields={savedFields}
                  onFieldsChange={setSavedFields}
                  referenceDataSets={[]}
                />
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