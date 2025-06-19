
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { useAuth } from '@/hooks/useSimpleAuth';
import { FormFieldsBuilder } from './FormFieldsBuilder';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Department {
  id: string;
  name: string;
}

interface Form {
  id: string;
  name: string;
  description: string | null;
  department_id: string | null;
}

interface SubHeader {
  id?: string;
  name: string;
  label: string;
  fields: any[];
}

interface FormField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  is_primary_column: boolean;
  is_secondary_column: boolean;
  reference_data_name?: string;
  placeholder_text?: string;
  field_order: number;
  aggregate_fields?: string[];
  has_sub_headers?: boolean;
  sub_headers?: SubHeader[];
}

interface FormBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingForm: Form | null;
  departments: Department[];
}

const generateFieldName = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_|_$/g, '');
};

export const FormBuilderDialog = ({
  isOpen,
  onClose,
  onSave,
  editingForm,
  departments
}: FormBuilderDialogProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: ''
  });
  const [fields, setFields] = useState<FormField[]>([]);

  const fetchFormFields = useCallback(async (formId: string) => {
    try {
      setFieldsLoading(true);
      console.log('Fetching form fields for form:', formId);
      const data = await simpleApiClient.get(`/api/form-fields/${formId}`);
      console.log('Form fields fetched:', data);
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching form fields:', error);
      toast({
        title: "Error",
        description: "Failed to load form fields",
        variant: "destructive",
      });
    } finally {
      setFieldsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (editingForm && isOpen) {
      console.log('Editing form:', editingForm);
      setFormData({
        name: editingForm.name,
        description: editingForm.description || '',
        department_id: editingForm.department_id || ''
      });
      fetchFormFields(editingForm.id);
    } else if (isOpen) {
      console.log('Creating new form');
      setFormData({
        name: '',
        description: '',
        department_id: ''
      });
      setFields([]);
    }
  }, [editingForm, isOpen, fetchFormFields]);

  const validateFields = (): string[] => {
    const errors: string[] = [];
    const fieldNames = new Set<string>();

    fields.forEach((field, index) => {
      // Ensure field has a label
      if (!field.field_label?.trim()) {
        errors.push(`Field ${index + 1}: Field label is required`);
      }

      // Generate field name if empty and validate uniqueness
      const fieldName = field.field_name || generateFieldName(field.field_label);
      if (!fieldName) {
        errors.push(`Field ${index + 1}: Could not generate valid field name from label "${field.field_label}"`);
      } else if (fieldNames.has(fieldName)) {
        errors.push(`Field ${index + 1}: Duplicate field name "${fieldName}"`);
      } else {
        fieldNames.add(fieldName);
      }

      // Validate reference data for dropdown fields
      if ((field.field_type === 'select' || field.field_type === 'radio') && !field.reference_data_name) {
        errors.push(`Field ${index + 1}: Reference data set is required for ${field.field_type} fields`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      console.error('No profile found');
      return;
    }

    // Validate that a department is selected
    if (!formData.department_id) {
      toast({
        title: "Validation Error",
        description: "Please select a department for this form",
        variant: "destructive",
      });
      return;
    }

    // Validate fields
    const fieldErrors = validateFields();
    if (fieldErrors.length > 0) {
      toast({
        title: "Field Validation Errors",
        description: fieldErrors.join('; '),
        variant: "destructive",
      });
      return;
    }

    console.log('Starting form save process...');
    console.log('Form data:', formData);
    console.log('Fields:', fields);
    
    setLoading(true);
    try {
      let formId = editingForm?.id;

      if (editingForm) {
        console.log('Updating existing form:', editingForm.id);
        // Update existing form
        await simpleApiClient.put(`/api/forms/${editingForm.id}`, {
          name: formData.name,
          description: formData.description || null,
          department_id: formData.department_id,
          updated_at: new Date().toISOString()
        });
        console.log('Form updated successfully');
      } else {
        console.log('Creating new form');
        // Create new form
        const data = await simpleApiClient.post('/api/forms', {
          name: formData.name,
          description: formData.description || null,
          department_id: formData.department_id,
          created_by: profile.id
        });
        console.log('Form created successfully:', data);
        formId = data.id;
      }

      // Save form fields with proper field names
      if (formId) {
        console.log('Saving form fields for form:', formId);
        // Delete existing fields if editing
        if (editingForm) {
          console.log('Deleting existing fields...');
          await simpleApiClient.delete(`/api/forms/${formId}/fields`);
        }

        // Insert new fields with proper field names
        if (fields.length > 0) {
          console.log('Inserting new fields...');
          const fieldsToInsert = fields.map((field, index) => {
            // Ensure field_name is properly set
            const fieldName = field.field_name || generateFieldName(field.field_label);
            
            return {
              form_id: formId,
              field_name: fieldName,
              field_label: field.field_label,
              field_type: field.field_type,
              is_required: field.is_required,
              is_primary_column: field.is_primary_column,
              is_secondary_column: field.is_secondary_column,
              reference_data_name: field.reference_data_name || null,
              placeholder_text: field.placeholder_text || null,
              aggregate_fields: field.aggregate_fields || null,
              has_sub_headers: field.has_sub_headers || false,
              sub_headers: field.sub_headers || null,
              field_order: index
            };
          });

          console.log('Fields to insert:', fieldsToInsert);

          await simpleApiClient.post('/api/form-fields', fieldsToInsert);
          console.log('Form fields inserted successfully');
        }
      }

      console.log('Form save process completed successfully');
      toast({
        title: "Success",
        description: editingForm ? "Form updated successfully" : "Form created successfully",
      });
      
      // Call onSave to trigger parent component refresh and close dialog
      console.log('Calling onSave callback...');
      onSave();
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingForm ? 'Edit Form' : 'Create New Form'}
          </DialogTitle>
        </DialogHeader>

        {fieldsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <LoadingSpinner />
              <span>Loading form fields...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter form name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter form description"
                rows={3}
              />
            </div>

            <FormFieldsBuilder
              fields={fields}
              onChange={setFields}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? 'Saving...' : editingForm ? 'Update Form' : 'Create Form'}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
