import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BalochistandDatabaseFormRenderer } from './BalochistandDatabaseFormRenderer';

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
    <BalochistandDatabaseFormRenderer
      indicatorCode={indicatorCode}
      indicatorTitle={indicatorTitle}
      formId={formId}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};