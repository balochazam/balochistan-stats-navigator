
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
      const data = await apiClient
        .get
        .get
        .get;

      const excludeIds = existingFormIds?.map(sf => sf.form_id) || [];

      let query = supabase
        .get
        .select(`
          id, 
          name,
          department:departments(name)
        `)
        .get
        .order('name');

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching available forms:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available forms",
          variant: "destructive",
        });
      } else {
        setAvailableForms(data || []);
      }
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
      const { error } = await apiClient
        .get
        .insert({
          schedule_id: schedule.id,
          form_id: selectedFormId,
          is_required: isRequired,
          due_date: dueDate || null
        });

      if (error) throw error;

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
