import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Calculator, Database, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getIndicatorFormStructure, type IndicatorFormStructure, type FormField } from '@/data/goal1IndicatorForms';

interface Goal1SpecificDataEntryProps {
  indicatorCode: string;
  indicatorTitle: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const Goal1SpecificDataEntry: React.FC<Goal1SpecificDataEntryProps> = ({
  indicatorCode,
  indicatorTitle,
  onSubmit,
  onCancel
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const formStructure = getIndicatorFormStructure(indicatorCode);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  if (!formStructure) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Specific form structure for indicator {indicatorCode} is being developed. 
              Please use the general form for now.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <Button variant="outline" onClick={onCancel}>Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderField = (field: FormField, sectionIndex: number) => {
    const fieldName = `section_${sectionIndex}_${field.name}`;
    
    switch (field.type) {
      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select onValueChange={(value) => setValue(fieldName, value)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register(`${fieldName}.${option}`)}
                    className="rounded"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      case 'percentage':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min={field.validation?.min || 0}
                max={field.validation?.max || 100}
                {...register(fieldName, { 
                  required: field.required,
                  min: field.validation?.min,
                  max: field.validation?.max
                })}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {field.unit && (
              <p className="text-xs text-gray-500">Unit: {field.unit}</p>
            )}
          </div>
        );

      case 'currency':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="number"
              step="0.01"
              min={field.validation?.min || 0}
              {...register(fieldName, { 
                required: field.required,
                min: field.validation?.min
              })}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {field.unit && (
              <p className="text-xs text-gray-500">Unit: {field.unit}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="number"
              step={field.label.includes('Index') ? '0.001' : '1'}
              min={field.validation?.min}
              max={field.validation?.max}
              {...register(fieldName, { 
                required: field.required,
                min: field.validation?.min,
                max: field.validation?.max
              })}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {field.unit && (
              <p className="text-xs text-gray-500">Unit: {field.unit}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="text"
              {...register(fieldName, { required: field.required })}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );
    }
  };

  const currentSectionData = formStructure.form_sections[currentSection];
  const isLastSection = currentSection === formStructure.form_sections.length - 1;
  const isFirstSection = currentSection === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {indicatorCode} Data Entry
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{indicatorTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Section {currentSection + 1} of {formStructure.form_sections.length}
              </Badge>
              <Badge variant="secondary">Goal 1</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {formStructure.form_sections.map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${
              index <= currentSection ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            {index < formStructure.form_sections.length - 1 && (
              <div className={`h-0.5 w-8 ${
                index < currentSection ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current section form */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSectionData.title}</CardTitle>
          {currentSectionData.description && (
            <p className="text-sm text-gray-600">{currentSectionData.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSectionData.fields.map((field) => renderField(field, currentSection))}
            </div>

            {/* Navigation buttons */}
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                {!isFirstSection && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentSection(currentSection - 1)}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="space-x-2">
                {!isLastSection ? (
                  <Button 
                    type="button" 
                    onClick={() => setCurrentSection(currentSection + 1)}
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit Data
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Methodology info sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Methodology Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formStructure.calculation && (
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculation
              </h4>
              <p className="text-sm text-gray-600 mt-1">{formStructure.calculation.formula}</p>
              <p className="text-xs text-gray-500 mt-1">{formStructure.calculation.description}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-medium">Data Quality Requirements</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              {formStructure.data_quality_requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {formStructure.minimum_sample_size && (
            <div>
              <h4 className="font-medium">Minimum Sample Size</h4>
              <p className="text-sm text-gray-600">{formStructure.minimum_sample_size.toLocaleString()} households</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};