import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SimpleFormRenderer } from '@/components/forms/SimpleFormRenderer';

interface DynamicDataEntryProps {
  indicatorCode: string;
  indicatorTitle: string;
  formId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DynamicDataEntry: React.FC<DynamicDataEntryProps> = ({
  indicatorCode,
  indicatorTitle,
  formId,
  onSubmit,
  onCancel
}) => {
  const { toast } = useToast();

  if (!formId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No form ID provided for this indicator.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with indicator info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{indicatorCode}</Badge>
            Data Entry for {indicatorCode}
          </CardTitle>
          <p className="text-sm text-gray-600">{indicatorTitle}</p>
          <p className="text-xs text-blue-600">Dynamic Form</p>
        </CardHeader>
      </Card>

      {/* Use the standardized SimpleFormRenderer */}
      <SimpleFormRenderer 
        formId={formId} 
        onSubmissionSuccess={() => {
          toast({
            title: "Success!",
            description: `Data submitted successfully for indicator ${indicatorCode}.`,
          });
          onSubmit({ indicator_code: indicatorCode });
        }}
        onCancel={onCancel}
      />
    </div>
  );
};