
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, Clock, CheckCircle, Plus } from 'lucide-react';
import { DataEntryForm } from '@/components/data-collection/DataEntryForm';

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

interface ScheduleForm {
  id: string;
  schedule_id: string;
  form_id: string;
  is_required: boolean;
  due_date: string | null;
  form: {
    id: string;
    name: string;
    description: string | null;
    department_id: string | null;
    department?: {
      name: string;
    };
  };
}

interface FormSubmission {
  id: string;
  form_id: string;
  schedule_id: string;
  submitted_at: string;
  submitted_by: string;
  data: any;
}

interface ScheduleDataCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
}

export const ScheduleDataCollectionDialog = ({
  isOpen,
  onClose,
  schedule
}: ScheduleDataCollectionDialogProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [scheduleForms, setScheduleForms] = useState<ScheduleForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedScheduleForm, setSelectedScheduleForm] = useState<ScheduleForm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schedule && isOpen) {
      fetchScheduleForms();
      fetchSubmissions();
    }
  }, [schedule, isOpen]);

  const fetchScheduleForms = async () => {
    if (!schedule) return;

    try {
      setLoading(true);
      const data = await apiClient.get(`/api/schedules/${schedule.id}/forms`);
      setScheduleForms(data || []);
    } catch (error) {
      console.error('Error in fetchScheduleForms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!schedule) return;

    try {
      const data = await apiClient.get(`/api/form-submissions?scheduleId=${schedule.id}`);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
    }
  };

  const handleFormSubmitted = () => {
    setSelectedScheduleForm(null);
    fetchSubmissions();
    toast({
      title: "Success",
      description: "Form submitted successfully",
    });
  };

  const isFormSubmitted = (formId: string) => {
    return submissions.some(sub => 
      sub.form_id === formId && 
      sub.submitted_by === profile?.id
    );
  };

  const getSubmissionCount = (formId: string) => {
    return submissions.filter(sub => sub.form_id === formId).length;
  };

  if (!schedule) return null;

  if (selectedScheduleForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Entry - {selectedScheduleForm.form.name}</DialogTitle>
          </DialogHeader>
          <DataEntryForm
            schedule={schedule}
            scheduleForm={selectedScheduleForm}
            onSubmitted={handleFormSubmitted}
            onCancel={() => setSelectedScheduleForm(null)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Data Collection - {schedule.name}</span>
            <Badge className={`${schedule.status === 'collection' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
              {schedule.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <Clock className="h-4 w-4" />
              <span>
                Schedule Period: {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
              </span>
            </div>
            {schedule.description && (
              <p className="text-sm text-blue-700 mt-2">{schedule.description}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Forms in Schedule</h3>
              <div className="text-sm text-gray-600">
                Total Submissions: {submissions.length}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading forms...</div>
            ) : scheduleForms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No forms associated with this schedule</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {scheduleForms.map((scheduleForm) => {
                  const isSubmitted = isFormSubmitted(scheduleForm.form_id);
                  const submissionCount = getSubmissionCount(scheduleForm.form_id);
                  const isPastDue = scheduleForm.due_date && new Date(scheduleForm.due_date) < new Date();
                  const canSubmit = schedule.status === 'collection' && profile?.id;
                  
                  return (
                    <Card key={scheduleForm.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <FileText className="h-5 w-5 text-gray-500" />
                              <h4 className="font-semibold">{scheduleForm.form.name}</h4>
                              {scheduleForm.form.department && (
                                <Badge variant="secondary">
                                  {scheduleForm.form.department.name}
                                </Badge>
                              )}
                              {scheduleForm.is_required && (
                                <Badge variant="destructive">Required</Badge>
                              )}
                              {isSubmitted && (
                                <Badge className="bg-green-500 text-white flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Submitted</span>
                                </Badge>
                              )}
                              {isPastDue && !isSubmitted && (
                                <Badge variant="destructive">Past Due</Badge>
                              )}
                            </div>

                            {scheduleForm.form.description && (
                              <p className="text-sm text-gray-600 mb-2 ml-8">
                                {scheduleForm.form.description}
                              </p>
                            )}

                            <div className="text-xs text-gray-500 ml-8 space-x-4">
                              <span>Submissions: {submissionCount}</span>
                              {scheduleForm.due_date && (
                                <span>Due: {new Date(scheduleForm.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {canSubmit && (
                              <Button
                                onClick={() => setSelectedScheduleForm(scheduleForm)}
                                disabled={isSubmitted}
                                size="sm"
                              >
                                {isSubmitted ? 'Completed' : 'Fill Form'}
                              </Button>
                            )}
                            {!canSubmit && schedule.status === 'open' && (
                              <span className="text-sm text-gray-500">
                                Not yet open for collection
                              </span>
                            )}
                            {schedule.status === 'published' && (
                              <span className="text-sm text-gray-500">
                                Collection closed
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

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
