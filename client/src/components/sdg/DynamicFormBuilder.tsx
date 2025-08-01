import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  X,
  Type,
  Hash,
  Percent,
  List,
  Calendar,
  FileText,
  MapPin,
  CheckSquare,
  Circle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'percentage' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'date' | 'location';
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    showWhen: string | string[];
  };
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface DynamicForm {
  id: string;
  indicatorCode: string;
  indicatorTitle: string;
  description: string;
  sections: FormSection[];
  metadata: {
    dataQualityRequirements: string[];
    calculationMethod: {
      description: string;
      formula: string;
    };
    dataSources: string[];
    frequency: string;
    responsibleDepartment: string;
  };
}

interface DynamicFormBuilderProps {
  indicatorCode: string;
  indicatorTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (form: DynamicForm) => void;
  existingForm?: DynamicForm;
}

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  percentage: Percent,
  select: List,
  multiselect: CheckSquare,
  radio: Circle,
  checkbox: CheckSquare,
  textarea: FileText,
  date: Calendar,
  location: MapPin
};

const fieldTypeLabels = {
  text: 'Text Input',
  number: 'Number',
  percentage: 'Percentage',
  select: 'Dropdown',
  multiselect: 'Multiple Choice',
  radio: 'Radio Buttons',
  checkbox: 'Checkboxes',
  textarea: 'Text Area',
  date: 'Date Picker',
  location: 'Location/GPS'
};

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  indicatorCode,
  indicatorTitle,
  open,
  onOpenChange,
  onSave,
  existingForm
}) => {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [form, setForm] = useState<DynamicForm>(() => 
    existingForm || {
      id: crypto.randomUUID(),
      indicatorCode,
      indicatorTitle,
      description: `Data collection form for ${indicatorTitle}`,
      sections: [{
        id: crypto.randomUUID(),
        title: 'Data Collection',
        description: 'Main data entry section',
        fields: [{
          id: crypto.randomUUID(),
          type: 'date',
          label: 'Data Year',
          name: 'data_year',
          required: true,
          description: 'Year for which data is being reported'
        }, {
          id: crypto.randomUUID(),
          type: 'select',
          label: 'Data Source',
          name: 'data_source',
          required: true,
          options: ['MICS', 'PDHS', 'PSLM', 'LFS', 'NNS', 'NDMA', 'PBS', 'Custom Survey'],
          description: 'Primary source of the data'
        }]
      }],
      metadata: {
        dataQualityRequirements: ['Data must be verified', 'Source documentation required'],
        calculationMethod: {
          description: 'Standard calculation method for this indicator',
          formula: 'To be defined based on indicator requirements'
        },
        dataSources: ['MICS', 'PDHS', 'PSLM'],
        frequency: 'Annual',
        responsibleDepartment: ''
      }
    }
  );

  // Simplified section management (single section for now)
  const mainSection = form.sections[0];

  // Add field to main section
  const addField = (fieldType: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: fieldType,
      label: `New ${fieldTypeLabels[fieldType]}`,
      name: `field_${Date.now()}`,
      required: false,
      placeholder: `Enter ${fieldTypeLabels[fieldType].toLowerCase()}`,
      description: ''
    };

    if (fieldType === 'select' || fieldType === 'multiselect' || fieldType === 'radio') {
      newField.options = ['Option 1', 'Option 2', 'Option 3'];
    }

    if (fieldType === 'number' || fieldType === 'percentage') {
      newField.validation = {
        min: fieldType === 'percentage' ? 0 : undefined,
        max: fieldType === 'percentage' ? 100 : undefined,
        step: fieldType === 'percentage' ? 0.1 : 1
      };
    }

    setForm(prev => ({
      ...prev,
      sections: [{
        ...prev.sections[0],
        fields: [...prev.sections[0].fields, newField]
      }]
    }));
    setSelectedField(newField.id);
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      sections: [{
        ...prev.sections[0],
        fields: prev.sections[0].fields.filter(f => f.id !== fieldId)
      }]
    }));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      sections: [{
        ...prev.sections[0],
        fields: prev.sections[0].fields.map(f => 
          f.id === fieldId ? { ...f, ...updates } : f
        )
      }]
    }));
  };

  // Save form
  const saveForm = () => {
    if (form.sections[0].fields.length === 0) {
      toast.error('Form must have at least one field');
      return;
    }

    onSave?.(form);
    toast.success('Form created successfully!');
    onOpenChange(false);
  };

  // Preview form
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const renderFieldEditor = (field: FormField) => {
    return (
      <Card key={field.id} className={`cursor-pointer transition-all ${selectedField === field.id ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {React.createElement(fieldTypeIcons[field.type], { className: "h-4 w-4" })}
              <span className="font-medium">{field.label}</span>
              <Badge variant="outline" className="text-xs">
                {fieldTypeLabels[field.type]}
              </Badge>
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteField(field.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {selectedField === field.id && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>Field Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={field.description || ''}
                onChange={(e) => updateField(field.id, { description: e.target.value })}
                placeholder="Field description or help text"
              />
            </div>

            <div>
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              />
              <Label>Required Field</Label>
            </div>

            {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
              <div>
                <Label>Options (one per line)</Label>
                <Textarea
                  value={field.options?.join('\n') || ''}
                  onChange={(e) => updateField(field.id, { 
                    options: e.target.value.split('\n').filter(o => o.trim()) 
                  })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}

            {(field.type === 'number' || field.type === 'percentage') && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Min Value</Label>
                  <Input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => updateField(field.id, { 
                      validation: { 
                        ...field.validation, 
                        min: e.target.value ? Number(e.target.value) : undefined 
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => updateField(field.id, { 
                      validation: { 
                        ...field.validation, 
                        max: e.target.value ? Number(e.target.value) : undefined 
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Step</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={field.validation?.step || ''}
                    onChange={(e) => updateField(field.id, { 
                      validation: { 
                        ...field.validation, 
                        step: e.target.value ? Number(e.target.value) : undefined 
                      } 
                    })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        )}
        
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setSelectedField(selectedField === field.id ? null : field.id)}
          >
            {selectedField === field.id ? 'Collapse' : 'Edit Field'}
          </Button>
        </div>
      </Card>
    );
  };

  const renderFormPreview = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{form.indicatorTitle}</CardTitle>
            <p className="text-sm text-gray-600">{form.description}</p>
            <Badge variant="outline">{form.indicatorCode}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {mainSection.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.type === 'text' && (
                    <Input placeholder={field.placeholder} disabled />
                  )}
                  
                  {field.type === 'number' && (
                    <Input type="number" placeholder={field.placeholder} disabled />
                  )}
                  
                  {field.type === 'percentage' && (
                    <div className="relative">
                      <Input type="number" min="0" max="100" step="0.1" disabled />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  )}
                  
                  {field.type === 'select' && (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                    </Select>
                  )}
                  
                  {field.type === 'textarea' && (
                    <Textarea placeholder={field.placeholder} disabled />
                  )}
                  
                  {field.type === 'date' && (
                    <Input type="date" disabled />
                  )}
                  
                  {field.description && (
                    <p className="text-sm text-gray-600">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>Create Form: {indicatorTitle}</span>
              <Badge variant="outline" className="ml-2">{indicatorCode}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={togglePreview}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button size="sm" onClick={saveForm}>
                <Save className="h-4 w-4 mr-2" />
                Save Form
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {previewMode ? (
            <ScrollArea className="flex-1 p-4">
              {renderFormPreview()}
            </ScrollArea>
          ) : (
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Field Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Form Fields</h3>
                  <Select onValueChange={(fieldType) => addField(fieldType as FormField['type'])}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Add Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldTypeLabels).map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {React.createElement(fieldTypeIcons[type as FormField['type']], { className: "h-4 w-4" })}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[calc(90vh-200px)]">
                  <div className="space-y-3">
                    {mainSection.fields.map((field) => renderFieldEditor(field))}
                    {mainSection.fields.length === 0 && (
                      <div className="text-center p-8 text-gray-500">
                        Add fields to get started
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Form Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Form Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this data collection form"
                      />
                    </div>
                    
                    <div>
                      <Label>Collection Frequency</Label>
                      <Select
                        value={form.metadata.frequency}
                        onValueChange={(value) => setForm(prev => ({
                          ...prev,
                          metadata: { ...prev.metadata, frequency: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Annual">Annual</SelectItem>
                          <SelectItem value="As Needed">As Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Total Fields:</strong> {mainSection.fields.length}</p>
                      <p><strong>Required Fields:</strong> {mainSection.fields.filter(f => f.required).length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter data sources (one per line)"
                      value={form.metadata.dataSources.join('\n')}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          dataSources: e.target.value.split('\n').filter(s => s.trim())
                        }
                      }))}
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};