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
import { getBalochistandFormStructure, type BalochistanIndicatorForm, type BalochistanFormField } from '@/data/balochistandAllForms';
import toast from 'react-hot-toast';

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
  const [formData, setFormData] = useState<any>({});
  const formStructure = getBalochistandFormStructure(indicatorCode);
  const { register, handleSubmit, watch, setValue, formState: { errors }, getValues } = useForm();

  // Navigation and submission handlers
  const handleNext = () => {
    // Save current section data
    const currentData = getValues();
    setFormData((prev: any) => ({ ...prev, ...currentData }));
    setCurrentSection(currentSection + 1);
  };

  const handlePrevious = () => {
    // Save current section data
    const currentData = getValues();
    setFormData((prev: any) => ({ ...prev, ...currentData }));
    setCurrentSection(currentSection - 1);
  };

  const handleFinalSubmit = async () => {
    if (!formStructure) return;
    
    // Collect all form data from all sections
    const currentData = getValues();
    const finalData = { ...formData, ...currentData };
    
    console.log('Final submission data:', finalData);
    
    // First, get the indicator ID from the backend using the indicator code
    try {
      const indicatorsResponse = await fetch('/api/sdg/indicators');
      const indicators = await indicatorsResponse.json();
      const indicator = indicators.find((ind: any) => ind.indicator_code === indicatorCode);
      
      if (!indicator) {
        toast.error('Error: Indicator not found in system. Please contact administrator.');
        return;
      }

      // Get current user ID
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();
      
      if (!userData.user) {
        toast.error('Error: Please log in again to submit data.');
        return;
      }

      // Create indicator value record matching the backend schema
      const indicatorValueData = {
        indicator_id: indicator.id,
        year: parseInt(finalData.section_0_data_year) || new Date().getFullYear(),
        value: JSON.stringify(finalData), // Store all form data as JSON string
        breakdown_data: finalData,
        notes: `Data submitted via Balochistan form for ${indicatorCode}`,
        submitted_by: userData.user.id
      };

      // Submit to backend API
      const response = await fetch('/api/sdg/indicator-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(indicatorValueData)
      });

      if (response.ok) {
        console.log('Data successfully saved to backend');
        toast.success('Data submitted successfully! Your indicator data has been saved.');
        onSubmit(finalData);
      } else {
        const errorData = await response.json();
        console.error('Failed to save data to backend:', errorData);
        toast.error('Failed to submit data. Please try again or contact administrator.');
        // Still call onSubmit to allow UI to handle the response
        onSubmit(finalData);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Network error occurred. Please check your connection and try again.');
      // Still call onSubmit to allow UI to handle the error
      onSubmit(finalData);
    }
  };

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
            <Select onValueChange={(value) => setValue(fieldName, value)} defaultValue={formData[fieldName] || ''}>
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
              defaultValue={formData[fieldName] || ''}
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
                defaultValue={formData[fieldName] || ''}
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
              defaultValue={formData[fieldName] || ''}
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
          <div className="space-y-6">
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
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="space-x-2">
                {!isLastSection ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleFinalSubmit}>
                    Submit Data
                  </Button>
                )}
              </div>
            </div>
          </div>
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