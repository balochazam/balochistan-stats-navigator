
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { Plus, Trash2, FileText } from 'lucide-react';
import { ScheduleFormSelect } from './ScheduleFormSelect';

interface Schedule {
  id: string;
  name: string;
}

interface ScheduleForm {
  id: string;
  schedule_id: string;
  form_id: string;
  is_required: boolean;
  due_date: string | null;
  form?: {
    name: string;
    department?: {
      name: string;
    };
  };
}

interface ScheduleFormsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
}

export const ScheduleFormsDialog = ({
  isOpen,
  onClose,
  schedule
}: ScheduleFormsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduleForms, setScheduleForms] = useState<ScheduleForm[]>([]);
  const [isAddingForm, setIsAddingForm] = useState(false);

  useEffect(() => {
    if (schedule && isOpen) {
      fetchScheduleForms();
    }
  }, [schedule, isOpen]);

  const fetchScheduleForms = async () => {
    if (!schedule) return;

    try {
      const data = await simpleApiClient.get(`/api/schedules/${schedule.id}/forms`);
      setScheduleForms(data || []);
    } catch (error) {
      console.error('Error in fetchScheduleForms:', error);
    }
  };

  const handleFormAdded = () => {
    setIsAddingForm(false);
    fetchScheduleForms();
  };

  const handleRemoveForm = async (scheduleFormId: string) => {
    if (!confirm('Are you sure you want to remove this form from the schedule?')) {
      return;
    }

    try {
      await simpleApiClient.delete(`/api/schedule-forms/${scheduleFormId}`);

      toast({
        title: "Success",
        description: "Form removed from schedule successfully",
      });
      fetchScheduleForms();
    } catch (error) {
      console.error('Error removing form:', error);
      toast({
        title: "Error",
        description: "Failed to remove form from schedule",
        variant: "destructive",
      });
    }
  };

  const handleUpdateScheduleForm = async (scheduleFormId: string, updates: Partial<ScheduleForm>) => {
    try {
      await simpleApiClient.put(`/api/schedule-forms/${scheduleFormId}`, updates);

      toast({
        title: "Success",
        description: "Schedule form updated successfully",
      });
      fetchScheduleForms();
    } catch (error) {
      console.error('Error updating schedule form:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule form",
        variant: "destructive",
      });
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Forms for {schedule.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Associated Forms</h3>
            <Button onClick={() => setIsAddingForm(true)} disabled={isAddingForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Form
            </Button>
          </div>

          {isAddingForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Form to Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleFormSelect
                  schedule={schedule}
                  onFormAdded={handleFormAdded}
                  onCancel={() => setIsAddingForm(false)}
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {scheduleForms.map((scheduleForm) => (
              <Card key={scheduleForm.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <h4 className="font-semibold">{scheduleForm.form?.name}</h4>
                        {scheduleForm.form?.department && (
                          <Badge variant="secondary">
                            {scheduleForm.form.department.name}
                          </Badge>
                        )}
                        {scheduleForm.is_required && (
                          <Badge variant="destructive">
                            Required
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${scheduleForm.id}`}
                            checked={scheduleForm.is_required}
                            onCheckedChange={(checked) => 
                              handleUpdateScheduleForm(scheduleForm.id, { is_required: !!checked })
                            }
                          />
                          <Label htmlFor={`required-${scheduleForm.id}`} className="text-sm">
                            Required form
                          </Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Due Date (optional)</Label>
                          <Input
                            type="date"
                            value={scheduleForm.due_date || ''}
                            onChange={(e) => 
                              handleUpdateScheduleForm(scheduleForm.id, { 
                                due_date: e.target.value || null 
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveForm(scheduleForm.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {scheduleForms.length === 0 && !isAddingForm && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No forms associated with this schedule</p>
                <Button onClick={() => setIsAddingForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Form
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
