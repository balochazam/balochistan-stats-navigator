
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface Schedule {
  id: string;
}

interface Form {
  id: string;
  name: string;
  department?: {
    name: string;
  };
}

interface ScheduleFormSelectProps {
  schedule: Schedule;
  onFormAdded: () => void;
  onCancel: () => void;
}

export const ScheduleFormSelect = ({
  schedule,
  onFormAdded,
  onCancel
}: ScheduleFormSelectProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchAvailableForms();
  }, [schedule]);

  const fetchAvailableForms = async () => {
    try {
      // Get forms that are not already in this schedule
      const forms = await apiClient.get('/api/forms');

      // Get existing schedule forms to exclude
      const scheduleFormsResponse = await apiClient.get(`/api/schedules/${schedule.id}/forms`);
      const excludeIds = scheduleFormsResponse?.map((sf: any) => sf.form_id) || [];

      // Filter out forms that are already in this schedule
      const availableForms = forms.filter((form: any) => 
        !excludeIds.includes(form.id)
      ).sort((a: any, b: any) => a.name.localeCompare(b.name));

      setAvailableForms(availableForms || []);
    } catch (error) {
      console.error('Error in fetchAvailableForms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFormId || selectedFormId === 'no-forms') {
      toast({
        title: "Validation Error",
        description: "Please select a form to add",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/schedule-forms', {
        schedule_id: schedule.id,
        form_id: selectedFormId,
        is_required: isRequired,
        due_date: dueDate || null
      });

      toast({
        title: "Success",
        description: "Form added to schedule successfully",
      });
      
      onFormAdded();
    } catch (error) {
      console.error('Error adding form to schedule:', error);
      toast({
        title: "Error",
        description: "Failed to add form to schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="form">Select Form *</Label>
        <Select
          value={selectedFormId}
          onValueChange={setSelectedFormId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a form to add" />
          </SelectTrigger>
          <SelectContent>
            {availableForms.length === 0 ? (
              <SelectItem value="no-forms" disabled>
                No available forms
              </SelectItem>
            ) : (
              availableForms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.name} {form.department && `(${form.department.name})`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={isRequired}
            onCheckedChange={(checked) => setIsRequired(!!checked)}
          />
          <Label htmlFor="required" className="text-sm">
            Required form
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date (optional)</Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || availableForms.length === 0}>
          {loading ? 'Adding...' : 'Add Form'}
        </Button>
      </div>
    </form>
  );
};
