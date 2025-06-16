
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingSchedule: Schedule | null;
}

export const ScheduleDialog = ({
  isOpen,
  onClose,
  onSave,
  editingSchedule
}: ScheduleDialogProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'open'
  });

  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        name: editingSchedule.name,
        description: editingSchedule.description || '',
        start_date: editingSchedule.start_date,
        end_date: editingSchedule.end_date,
        status: editingSchedule.status
      });
    } else {
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'open'
      });
    }
  }, [editingSchedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please provide both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingSchedule) {
        const { error } = await apiClient
          .get
          .update({
            name: formData.name,
            description: formData.description || null,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .get;

        if (error) throw error;
      } else {
        const { error } = await apiClient
          .get
          .insert({
            name: formData.name,
            description: formData.description || null,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            created_by: profile.id
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingSchedule ? "Schedule updated successfully" : "Schedule created successfully",
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter schedule name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
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
              placeholder="Enter schedule description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
