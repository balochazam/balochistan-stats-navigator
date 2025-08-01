import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { simpleApiClient } from '@/lib/simpleApi';
import { Save, X, Loader2 } from 'lucide-react';

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
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const { toast } = useToast();

  // Fetch the form structure from the database
  const { data: form, isLoading: formLoading, error: formError } = useQuery({
    queryKey: ['/api/forms', formId],
    enabled: !!formId,
  });

  // Since we don't store the actual form structure in the database yet,
  // let's provide a fallback form for now but also show a message about the actual saved form
  const renderFormFields = () => {
    if (formLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading form structure...</span>
        </div>
      );
    }

    if (formError) {
      return (
        <div className="p-8 text-center text-red-600">
          <p>Error loading form: {formError.message}</p>
        </div>
      );
    }

    // Show information about the actual form that was created
    if (form) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Form Information</h4>
            <p className="text-sm text-blue-700">
              <strong>Form Name:</strong> {(form as any).name || 'Unnamed Form'}
            </p>
            {(form as any).description && (
              <p className="text-sm text-blue-700 mt-1">
                <strong>Description:</strong> {(form as any).description}
              </p>
            )}
            <p className="text-xs text-blue-600 mt-2">
              Note: The form builder structure will be fully integrated in the next update. 
              For now, please use the standard data entry fields below.
            </p>
          </div>
          
          {renderStandardFields()}
        </div>
      );
    }

    return renderStandardFields();
  };

  const renderStandardFields = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{indicatorCode}</Badge>
            Data Entry Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_year">Data Year *</Label>
              <Select
                value={formData.data_year || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, data_year: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022, 2021, 2020].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_source">Data Source *</Label>
              <Select
                value={formData.data_source || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, data_source: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MICS">MICS</SelectItem>
                  <SelectItem value="PDHS">PDHS</SelectItem>
                  <SelectItem value="PSLM">PSLM</SelectItem>
                  <SelectItem value="LFS">LFS</SelectItem>
                  <SelectItem value="NNS">NNS</SelectItem>
                  <SelectItem value="NDMA">NDMA</SelectItem>
                  <SelectItem value="PBS">PBS</SelectItem>
                  <SelectItem value="Custom Survey">Custom Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="baseline_value">Baseline Value</Label>
              <Input
                id="baseline_value"
                type="number"
                step="0.01"
                placeholder="Enter baseline value"
                value={formData.baseline_value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, baseline_value: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="current_value">Current Value *</Label>
              <Input
                id="current_value"
                type="number"
                step="0.01"
                placeholder="Enter current value"
                value={formData.current_value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                placeholder="Enter target value"
                value={formData.target_value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit of Measurement</Label>
              <Select
                value={formData.unit || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="ratio">Ratio</SelectItem>
                  <SelectItem value="rate">Rate per 1,000</SelectItem>
                  <SelectItem value="index">Index</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="geographic_coverage">Geographic Coverage</Label>
            <Select
              value={formData.geographic_coverage || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, geographic_coverage: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="provincial">Provincial</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
                <SelectItem value="district">District Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="methodology">Methodology Notes</Label>
            <Textarea
              id="methodology"
              placeholder="Describe the methodology used for data collection and calculation"
              value={formData.methodology || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="data_quality">Data Quality Assessment</Label>
            <Textarea
              id="data_quality"
              placeholder="Assessment of data quality, limitations, and reliability"
              value={formData.data_quality || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, data_quality: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.data_year || !formData.data_source || !formData.current_value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Data Year, Data Source, Current Value)",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      indicatorCode,
      formId,
      data: formData,
      timestamp: new Date().toISOString()
    };

    toast({
      title: "Success",
      description: `Data submitted successfully for indicator ${indicatorCode}`,
    });

    onSubmit(submissionData);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Data Entry for {indicatorCode}</h3>
        <p className="text-gray-600">{indicatorTitle}</p>
        <Badge variant="outline" className="mt-2">Dynamic Form</Badge>
      </div>

      {renderFormFields()}

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Submit Data
        </Button>
      </div>
    </div>
  );
};