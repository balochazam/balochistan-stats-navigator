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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Calculator, Database, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBalochistandFormStructure, type BalochistanIndicatorForm, type BalochistanFormField } from '@/data/balochistandGoal1Forms';

interface BalochistandDataEntryProps {
  indicatorCode: string;
  indicatorTitle: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const BalochistandDataEntry: React.FC<BalochistandDataEntryProps> = ({
  indicatorCode,
  indicatorTitle,
  onSubmit,
  onCancel
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const formStructure = getBalochistandFormStructure(indicatorCode);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  if (!formStructure) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Balochistan-specific form for indicator {indicatorCode} is being developed. 
              Please check back later or contact system administrator.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <Button variant="outline" onClick={onCancel}>Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderField = (field: BalochistanFormField, sectionIndex: number) => {
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
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${fieldName}_${option}`}
                    onCheckedChange={(checked) => {
                      const currentValue = watch(fieldName) || {};
                      setValue(fieldName, { ...currentValue, [option]: checked });
                    }}
                  />
                  <Label htmlFor={`${fieldName}_${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup onValueChange={(value) => setValue(fieldName, value)}>
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${fieldName}_${option}`} />
                  <Label htmlFor={`${fieldName}_${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              {...register(fieldName, { required: field.required })}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={3}
            />
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
                step="0.1"
                min="0"
                max="100"
                {...register(fieldName, { 
                  required: field.required,
                  min: 0,
                  max: 100
                })}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
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
              step={field.validation?.step || "0.01"}
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
                {indicatorCode} - Balochistan Data Entry
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{indicatorTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Section {currentSection + 1} of {formStructure.form_sections.length}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Balochistan Format
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {formStructure.form_sections.map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${
              index <= currentSection ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            {index < formStructure.form_sections.length - 1 && (
              <div className={`h-0.5 w-8 ${
                index < currentSection ? 'bg-green-500' : 'bg-gray-300'
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
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Submit Data
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Form metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Data Requirements & Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Calculation Method:</Label>
            <p className="text-sm text-gray-600">{formStructure.calculation.description}</p>
            <code className="text-xs bg-gray-100 p-1 rounded">{formStructure.calculation.formula}</code>
          </div>
          <div>
            <Label className="text-sm font-medium">Data Quality Requirements:</Label>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              {formStructure.data_quality_requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};