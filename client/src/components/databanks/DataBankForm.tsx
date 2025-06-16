
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DataBank {
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

interface DataBankFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingDataBank: DataBank | null;
  departments: Department[];
}

export const DataBankForm = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingDataBank, 
  departments 
}: DataBankFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingDataBank) {
      setFormData({
        name: editingDataBank.name,
        description: editingDataBank.description || '',
        department_id: editingDataBank.department_id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        department_id: ''
      });
    }
  }, [editingDataBank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      if (editingDataBank) {
        // Update existing data bank
        const { error } = await supabase
          .from('data_banks')
          .update({
            name: formData.name,
            description: formData.description || null,
            department_id: formData.department_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDataBank.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Data bank updated successfully",
        });
      } else {
        // Create new data bank
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
          description: "Data bank created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving data bank:', error);
      toast({
        title: "Error",
        description: "Failed to save data bank",
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
            {editingDataBank ? 'Edit Data Bank' : 'Create New Data Bank'}
          </DialogTitle>
          <DialogDescription>
            {editingDataBank 
              ? 'Update the data bank information below.'
              : 'Create a new data bank to organize master data.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter data bank name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter data bank description (optional)"
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
                <SelectItem value="none">No Department</SelectItem>
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
              {loading ? 'Saving...' : (editingDataBank ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
