
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

interface Department {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
  department_id: string;
}

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingSchedule: Schedule | null;
  departments: Department[];
}

export const ScheduleDialog = ({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
  departments
}: ScheduleDialogProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    status: 'draft',
    department_id: ''
  });

  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        name: editingSchedule.name,
        description: editingSchedule.description || '',
        year: editingSchedule.year,
        start_date: editingSchedule.start_date,
        end_date: editingSchedule.end_date,
        status: editingSchedule.status,
        department_id: editingSchedule.department_id
      });
    } else {
      setFormData({
        name: '',
        description: '',
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
        status: 'draft',
        department_id: ''
      });
    }
  }, [editingSchedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (!formData.department_id) {
      toast({
        title: "Validation Error",
        description: "Please select a department for this schedule",
        variant: "destructive",
      });
      return;
    }

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
        const { error } = await supabase
          .from('schedules')
          .update({
            name: formData.name,
            description: formData.description || null,
            year: formData.year,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            department_id: formData.department_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSchedule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert({
            name: formData.name,
            description: formData.description || null,
            year: formData.year,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            department_id: formData.department_id,
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

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min={2020}
                max={2050}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
