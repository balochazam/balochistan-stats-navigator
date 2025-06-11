
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FormFieldsBuilder } from './FormFieldsBuilder';

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
}

interface FormBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingForm: Form | null;
  departments: Department[];
}

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: ''
  });
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (editingForm) {
      console.log('Editing form:', editingForm);
      setFormData({
        name: editingForm.name,
        description: editingForm.description || '',
        department_id: editingForm.department_id || ''
      });
      fetchFormFields(editingForm.id);
    } else {
      console.log('Creating new form');
      setFormData({
        name: '',
        description: '',
        department_id: ''
      });
      setFields([]);
    }
  }, [editingForm, isOpen]);

  const fetchFormFields = async (formId: string) => {
    try {
      console.log('Fetching form fields for form:', formId);
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order');

      if (error) throw error;
      console.log('Form fields fetched:', data);
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching form fields:', error);
    }
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

    console.log('Starting form save process...');
    console.log('Form data:', formData);
    console.log('Fields:', fields);
    
    setLoading(true);
    try {
      let formId = editingForm?.id;

      if (editingForm) {
        console.log('Updating existing form:', editingForm.id);
        // Update existing form
        const { error } = await supabase
          .from('forms')
          .update({
            name: formData.name,
            description: formData.description || null,
            department_id: formData.department_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingForm.id);

        if (error) {
          console.error('Error updating form:', error);
          throw error;
        }
        console.log('Form updated successfully');
      } else {
        console.log('Creating new form');
        // Create new form
        const { data, error } = await supabase
          .from('forms')
          .insert({
            name: formData.name,
            description: formData.description || null,
            department_id: formData.department_id,
            created_by: profile.id
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating form:', error);
          throw error;
        }
        console.log('Form created successfully:', data);
        formId = data.id;
      }

      // Save form fields
      if (formId) {
        console.log('Saving form fields for form:', formId);
        // Delete existing fields if editing
        if (editingForm) {
          console.log('Deleting existing fields...');
          await supabase
            .from('form_fields')
            .delete()
            .eq('form_id', formId);
        }

        // Insert new fields
        if (fields.length > 0) {
          console.log('Inserting new fields...');
          const fieldsToInsert = fields.map((field, index) => ({
            form_id: formId,
            field_name: field.field_name,
            field_label: field.field_label,
            field_type: field.field_type,
            is_required: field.is_required,
            is_primary_column: field.is_primary_column,
            is_secondary_column: field.is_secondary_column,
            reference_data_name: field.reference_data_name || null,
            placeholder_text: field.placeholder_text || null,
            field_order: index
          }));

          const { error: fieldsError } = await supabase
            .from('form_fields')
            .insert(fieldsToInsert);

          if (fieldsError) {
            console.error('Error inserting form fields:', fieldsError);
            throw fieldsError;
          }
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingForm ? 'Update Form' : 'Create Form'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
