
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { useAuth } from '@/hooks/useSimpleAuth';

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
    start_year: '',
    end_year: '',
    status: 'open'
  });

  useEffect(() => {
    if (editingSchedule) {
      // Extract year from existing date strings (YYYY-MM-DD format)
      const startYear = editingSchedule.start_date ? new Date(editingSchedule.start_date).getFullYear().toString() : '';
      const endYear = editingSchedule.end_date ? new Date(editingSchedule.end_date).getFullYear().toString() : '';
      
      setFormData({
        name: editingSchedule.name,
        description: editingSchedule.description || '',
        start_year: startYear,
        end_year: endYear,
        status: editingSchedule.status
      });
    } else {
      const currentYear = new Date().getFullYear().toString();
      setFormData({
        name: '',
        description: '',
        start_year: currentYear,
        end_year: currentYear,
        status: 'open'
      });
    }
  }, [editingSchedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (!formData.start_year || !formData.end_year) {
      toast({
        title: "Validation Error",
        description: "Please provide both start and end years",
        variant: "destructive",
      });
      return;
    }

    // Validate year format and range
    const startYear = parseInt(formData.start_year);
    const endYear = parseInt(formData.end_year);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(startYear) || isNaN(endYear)) {
      toast({
        title: "Validation Error",
        description: "Please enter valid years",
        variant: "destructive",
      });
      return;
    }

    if (startYear < 1900 || startYear > currentYear + 10 || endYear < 1900 || endYear > currentYear + 10) {
      toast({
        title: "Validation Error",
        description: "Years must be between 1900 and " + (currentYear + 10),
        variant: "destructive",
      });
      return;
    }

    if (startYear > endYear) {
      toast({
        title: "Validation Error",
        description: "Start year cannot be after end year",
        variant: "destructive",
      });
      return;
    }

    // Year validation already handled above, no need for additional date comparison

    setLoading(true);
    try {
      // Convert years to ISO date format (January 1st of start year, December 31st of end year)
      const startDate = `${formData.start_year}-01-01`;
      const endDate = `${formData.end_year}-12-31`;
      
      if (editingSchedule) {
        await simpleApiClient.put(`/api/schedules/${editingSchedule.id}`, {
          name: formData.name,
          description: formData.description || null,
          start_date: startDate,
          end_date: endDate,
          status: formData.status,
          updated_at: new Date().toISOString()
        });
      } else {
        // New schedules must always start with 'open' status
        await simpleApiClient.post('/api/schedules', {
          name: formData.name,
          description: formData.description || null,
          start_date: startDate,
          end_date: endDate,
          status: 'open', // Force 'open' status for new schedules
          created_by: profile.id
        });
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
              <Label htmlFor="start_year">Start Year *</Label>
              <Input
                id="start_year"
                type="number"
                min="1900"
                max="2050"
                value={formData.start_year}
                onChange={(e) => setFormData(prev => ({ ...prev, start_year: e.target.value }))}
                placeholder="e.g., 2024"
                required
              />
              <p className="text-xs text-gray-500">Reporting year when data collection begins</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_year">End Year *</Label>
              <Input
                id="end_year"
                type="number"
                min="1900"
                max="2050"
                value={formData.end_year}
                onChange={(e) => setFormData(prev => ({ ...prev, end_year: e.target.value }))}
                placeholder="e.g., 2024"
                required
              />
              <p className="text-xs text-gray-500">Reporting year when data collection ends</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                required
                disabled={!editingSchedule} // Disable for new schedules
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
              {!editingSchedule && (
                <p className="text-sm text-gray-500">New schedules automatically start with "Open" status</p>
              )}
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
