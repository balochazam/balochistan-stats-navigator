import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Settings, 
  Move, 
  Copy,
  FileText,
  Calculator,
  BarChart3,
  Calendar,
  CheckSquare,
  Circle,
  Type,
  Hash,
  Percent,
  List,
  MapPin
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
  indicatorCode?: string;
  indicatorTitle?: string;
  onSave?: (form: DynamicForm) => void;
  onCancel?: () => void;
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
  indicatorCode = '',
  indicatorTitle = '',
  onSave,
  onCancel,
  existingForm
}) => {
  const [activeTab, setActiveTab] = useState('structure');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [form, setForm] = useState<DynamicForm>(existingForm || {
    id: crypto.randomUUID(),
    indicatorCode,
    indicatorTitle,
    description: '',
    sections: [{
      id: crypto.randomUUID(),
      title: 'Basic Information',
      description: 'Essential data collection section',
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
  });

  const { register, handleSubmit, watch, setValue } = useForm();

  // Add new section
  const addSection = () => {
    const newSection: FormSection = {
      id: crypto.randomUUID(),
      title: `Section ${form.sections.length + 1}`,
      description: '',
      fields: []
    };
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setSelectedSection(newSection.id);
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    if (form.sections.length <= 1) {
      toast.error('At least one section is required');
      return;
    }
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
    if (selectedSection === sectionId) {
      setSelectedSection(form.sections[0]?.id || null);
    }
  };

  // Update section
  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }));
  };

  // Add field to section
  const addField = (sectionId: string, fieldType: FormField['type']) => {
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
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, fields: [...s.fields, newField] }
          : s
      )
    }));
    setSelectedField(newField.id);
  };

  // Delete field
  const deleteField = (sectionId: string, fieldId: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
          : s
      )
    }));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  // Update field
  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { 
              ...s, 
              fields: s.fields.map(f => 
                f.id === fieldId ? { ...f, ...updates } : f
              )
            }
          : s
      )
    }));
  };

  // Duplicate field
  const duplicateField = (sectionId: string, fieldId: string) => {
    const section = form.sections.find(s => s.id === sectionId);
    const field = section?.fields.find(f => f.id === fieldId);
    if (field) {
      const duplicatedField = {
        ...field,
        id: crypto.randomUUID(),
        name: `${field.name}_copy`,
        label: `${field.label} (Copy)`
      };
      addFieldToSection(sectionId, duplicatedField);
    }
  };

  const addFieldToSection = (sectionId: string, field: FormField) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, fields: [...s.fields, field] }
          : s
      )
    }));
  };

  // Save form
  const saveForm = () => {
    if (!form.indicatorCode.trim()) {
      toast.error('Indicator code is required');
      return;
    }
    if (!form.indicatorTitle.trim()) {
      toast.error('Indicator title is required');
      return;
    }
    if (form.sections.some(s => s.fields.length === 0)) {
      toast.error('All sections must have at least one field');
      return;
    }

    onSave?.(form);
    toast.success('Form structure saved successfully!');
  };

  // Preview form
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const renderFieldEditor = (sectionId: string, field: FormField) => {
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
                onClick={() => duplicateField(sectionId, field.id)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteField(sectionId, field.id)}
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
                  onChange={(e) => updateField(sectionId, field.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>Field Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateField(sectionId, field.id, { name: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={field.description || ''}
                onChange={(e) => updateField(sectionId, field.id, { description: e.target.value })}
                placeholder="Field description or help text"
              />
            </div>

            <div>
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(sectionId, field.id, { placeholder: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => updateField(sectionId, field.id, { required: checked })}
              />
              <Label>Required Field</Label>
            </div>

            {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
              <div>
                <Label>Options (one per line)</Label>
                <Textarea
                  value={field.options?.join('\n') || ''}
                  onChange={(e) => updateField(sectionId, field.id, { 
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
                    onChange={(e) => updateField(sectionId, field.id, { 
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
                    onChange={(e) => updateField(sectionId, field.id, { 
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
                    onChange={(e) => updateField(sectionId, field.id, { 
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
      <div className="space-y-6">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold">{form.indicatorTitle}</h2>
          <p className="text-gray-600 mt-2">{form.description}</p>
          <Badge>{form.indicatorCode}</Badge>
        </div>

        {form.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-gray-600">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
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
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Form Builder</h1>
          <p className="text-gray-600">Create custom data collection forms for SDG indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={togglePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={saveForm}>
            <Save className="h-4 w-4 mr-2" />
            Save Form
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {previewMode ? (
        renderFormPreview()
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="structure">Form Structure</TabsTrigger>
            <TabsTrigger value="settings">Settings & Metadata</TabsTrigger>
            <TabsTrigger value="validation">Validation Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Sections List */}
              <div className="col-span-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Form Sections</h3>
                    <Button size="sm" onClick={addSection}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {form.sections.map((section, index) => (
                        <Card 
                          key={section.id} 
                          className={`cursor-pointer transition-all ${selectedSection === section.id ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{section.title}</p>
                                <p className="text-sm text-gray-500">{section.fields.length} fields</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSection(section.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Section Editor */}
              <div className="col-span-6">
                {selectedSection && (
                  <div className="space-y-4">
                    {(() => {
                      const section = form.sections.find(s => s.id === selectedSection);
                      if (!section) return null;
                      
                      return (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle>Section Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label>Section Title</Label>
                                <Input
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Section Description</Label>
                                <Textarea
                                  value={section.description || ''}
                                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                />
                              </div>
                            </CardContent>
                          </Card>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Section Fields</h4>
                              <div className="flex items-center gap-2">
                                <Select onValueChange={(fieldType) => addField(section.id, fieldType as FormField['type'])}>
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Add Field Type" />
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
                            </div>

                            <ScrollArea className="h-[500px]">
                              <div className="space-y-4">
                                {section.fields.map((field) => renderFieldEditor(section.id, field))}
                                {section.fields.length === 0 && (
                                  <div className="text-center p-8 text-gray-500">
                                    No fields added yet. Select a field type to get started.
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                
                {!selectedSection && (
                  <div className="text-center p-8 text-gray-500">
                    Select a section to start editing
                  </div>
                )}
              </div>

              {/* Field Properties */}
              <div className="col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Indicator Code</Label>
                      <Input
                        value={form.indicatorCode}
                        onChange={(e) => setForm(prev => ({ ...prev, indicatorCode: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Indicator Title</Label>
                      <Input
                        value={form.indicatorTitle}
                        onChange={(e) => setForm(prev => ({ ...prev, indicatorTitle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Form Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Sections:</strong> {form.sections.length}</p>
                      <p><strong>Total Fields:</strong> {form.sections.reduce((acc, section) => acc + section.fields.length, 0)}</p>
                      <p><strong>Required Fields:</strong> {form.sections.reduce((acc, section) => acc + section.fields.filter(f => f.required).length, 0)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter requirements (one per line)"
                    value={form.metadata.dataQualityRequirements.join('\n')}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        dataQualityRequirements: e.target.value.split('\n').filter(r => r.trim())
                      }
                    }))}
                    rows={6}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calculation Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={form.metadata.calculationMethod.description}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          calculationMethod: {
                            ...prev.metadata.calculationMethod,
                            description: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Formula</Label>
                    <Input
                      value={form.metadata.calculationMethod.formula}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          calculationMethod: {
                            ...prev.metadata.calculationMethod,
                            formula: e.target.value
                          }
                        }
                      }))}
                    />
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

              <Card>
                <CardHeader>
                  <CardTitle>Collection Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                        <SelectItem value="Bi-Annual">Bi-Annual</SelectItem>
                        <SelectItem value="As Needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Responsible Department</Label>
                    <Input
                      value={form.metadata.responsibleDepartment}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, responsibleDepartment: e.target.value }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Validation Summary</CardTitle>
                <p className="text-sm text-gray-600">
                  Review validation rules and field requirements
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {form.sections.map((section) => (
                    <div key={section.id}>
                      <h4 className="font-semibold mb-3">{section.title}</h4>
                      <div className="space-y-2">
                        {section.fields.map((field) => (
                          <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              {React.createElement(fieldTypeIcons[field.type], { className: "h-4 w-4" })}
                              <span>{field.label}</span>
                              <Badge variant="outline">{fieldTypeLabels[field.type]}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              {field.validation?.min !== undefined && (
                                <Badge variant="outline" className="text-xs">Min: {field.validation.min}</Badge>
                              )}
                              {field.validation?.max !== undefined && (
                                <Badge variant="outline" className="text-xs">Max: {field.validation.max}</Badge>
                              )}
                              {field.options && (
                                <Badge variant="outline" className="text-xs">{field.options.length} options</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};