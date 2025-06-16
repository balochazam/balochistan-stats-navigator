
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ReferenceData {
  id: string;
  name: string;
  description: string | null;
  department_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface Department {
  id: string;
  name: string;
}

interface ReferenceDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingReferenceData: ReferenceData | null;
  departments: Department[];
}

export const ReferenceDataForm = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingReferenceData, 
  departments 
}: ReferenceDataFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingReferenceData) {
      setFormData({
        name: editingReferenceData.name,
        description: editingReferenceData.description || '',
        department_id: editingReferenceData.department_id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        department_id: ''
      });
    }
  }, [editingReferenceData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      if (editingReferenceData) {
        // Update existing reference data
        const { error } = await supabase
          .from('data_banks')
          .update({
            name: formData.name,
            description: formData.description || null,
            department_id: formData.department_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReferenceData.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Reference data set updated successfully",
        });
      } else {
        // Create new reference data
        const { error } = await supabase
          .from('data_banks')
          .insert({
            name: formData.name,
            description: formData.description || null,
            department_id: formData.department_id || null,
            created_by: user.id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Reference data set created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving reference data:', error);
      toast({
        title: "Error",
        description: "Failed to save reference data set",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingReferenceData ? 'Edit Reference Data Set' : 'Create New Reference Data Set'}
          </DialogTitle>
          <DialogDescription>
            {editingReferenceData 
              ? 'Update the reference data set information below.'
              : 'Create a new reference data set for dropdown options (e.g., Districts, Countries, Hospitals).'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Districts, Countries, Hospitals"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this reference data is used for"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Department</label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                department_id: value === 'none' ? '' : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Global (All Departments)</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingReferenceData ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
