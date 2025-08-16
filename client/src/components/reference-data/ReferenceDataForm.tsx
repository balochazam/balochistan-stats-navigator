
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { simpleApiClient } from '@/lib/simpleApi';
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

interface ReferenceDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingReferenceData: ReferenceData | null;
}

export const ReferenceDataForm = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingReferenceData
}: ReferenceDataFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingReferenceData) {
      setFormData({
        name: editingReferenceData.name,
        description: editingReferenceData.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
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
        await simpleApiClient.put(`/api/data-banks/${editingReferenceData.id}`, {
          name: formData.name,
          description: formData.description || null,
          updated_at: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Reference data set updated successfully",
        });
      } else {
        // Create new reference data
        await simpleApiClient.post('/api/data-banks', {
          name: formData.name,
          description: formData.description || null,
          created_by: user.id
        });

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
