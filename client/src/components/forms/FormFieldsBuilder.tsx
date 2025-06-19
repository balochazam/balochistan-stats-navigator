
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';
import { useToast } from '@/hooks/use-toast';

interface FormField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  is_primary_column: boolean;
  is_secondary_column: boolean;
  reference_data_name?: string;
  placeholder_text?: string;
  aggregate_fields?: string[];
  field_order: number;
  has_sub_headers?: boolean;
  sub_headers?: SubHeader[];
}

interface SubHeader {
  id?: string;
  name: string;
  label: string;
  fields: SubHeaderField[];
}

interface SubHeaderField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  field_order: number;
  reference_data_name?: string;
  placeholder_text?: string;
  aggregate_fields?: string[];
  is_secondary_column?: boolean;
  has_sub_headers?: boolean;
  sub_headers?: SubHeader[];
}

interface FormFieldsBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

interface ReferenceDataOption {
  name: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown (Select)' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'aggregate', label: 'Aggregate (Sum of Fields)' }
];

const generateFieldName = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_|_$/g, '');
};

export const FormFieldsBuilder = ({ fields, onChange }: FormFieldsBuilderProps) => {
  const [referenceDataSets, setReferenceDataSets] = useState<ReferenceDataOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Utility function to generate field name from label
  const generateFieldName = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 50); // Limit length
  };

  useEffect(() => {
    fetchReferenceDataSets();
  }, []);

  const fetchReferenceDataSets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching reference data sets...');
      
      const data = await simpleApiClient.get('/api/data-banks');

      console.log('Reference data sets fetched:', data);
      setReferenceDataSets(data || []);
      
      if (!data || data.length === 0) {
        console.log('No reference data sets found');
        setError('No reference data sets available. Please create data banks first.');
      }
    } catch (err) {
      console.error('Error in fetchReferenceDataSets:', err);
      setError('Failed to fetch reference data sets');
      toast({
        title: "Error",
        description: "Failed to fetch reference data sets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField: FormField = {
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      is_primary_column: false,
      is_secondary_column: false,
      placeholder_text: '',
      field_order: fields.length,
      has_sub_headers: false,
      sub_headers: []
    };
    onChange([...fields, newField]);
  };

  // Sub-header management functions
  const addSubHeader = (fieldIndex: number) => {
    const newSubHeader: SubHeader = {
      name: '',
      label: '',
      fields: []
    };
    const updatedFields = [...fields];
    updatedFields[fieldIndex].sub_headers = [...(updatedFields[fieldIndex].sub_headers || []), newSubHeader];
    onChange(updatedFields);
  };

  const removeSubHeader = (fieldIndex: number, subIndex: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].sub_headers = updatedFields[fieldIndex].sub_headers?.filter((_, i) => i !== subIndex) || [];
    onChange(updatedFields);
  };

  const updateSubHeader = (fieldIndex: number, subIndex: number, updates: Partial<SubHeader>) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers) {
      updatedFields[fieldIndex].sub_headers![subIndex] = { 
        ...updatedFields[fieldIndex].sub_headers![subIndex], 
        ...updates 
      };
      onChange(updatedFields);
    }
  };

  const addSubHeaderField = (fieldIndex: number, subIndex: number) => {
    const currentFields = fields[fieldIndex].sub_headers?.[subIndex]?.fields || [];
    const newField: SubHeaderField = {
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      field_order: currentFields.length,
      placeholder_text: '',
      reference_data_name: undefined,
      aggregate_fields: [],
      is_secondary_column: false,
      has_sub_headers: false,
      sub_headers: []
    };
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers?.[subIndex]) {
      updatedFields[fieldIndex].sub_headers![subIndex].fields.push(newField);
      onChange(updatedFields);
    }
  };

  const removeSubHeaderField = (fieldIndex: number, subIndex: number, fieldIndex2: number) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers?.[subIndex]) {
      updatedFields[fieldIndex].sub_headers![subIndex].fields = 
        updatedFields[fieldIndex].sub_headers![subIndex].fields.filter((_, i) => i !== fieldIndex2);
      onChange(updatedFields);
    }
  };

  const updateSubHeaderField = (fieldIndex: number, subIndex: number, fieldIndex2: number, updates: Partial<SubHeaderField>) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers?.[subIndex]?.fields[fieldIndex2]) {
      updatedFields[fieldIndex].sub_headers![subIndex].fields[fieldIndex2] = {
        ...updatedFields[fieldIndex].sub_headers![subIndex].fields[fieldIndex2],
        ...updates
      };
      onChange(updatedFields);
    }
  };

  // Nested sub-header management functions
  const addNestedSubHeader = (fieldIndex: number, subIndex: number, fieldIndex2: number) => {
    const newNestedSubHeader: SubHeader = {
      name: '',
      label: '',
      fields: []
    };
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers?.[subIndex]?.fields[fieldIndex2]) {
      const subField = updatedFields[fieldIndex].sub_headers![subIndex].fields[fieldIndex2];
      subField.sub_headers = [...(subField.sub_headers || []), newNestedSubHeader];
      onChange(updatedFields);
    }
  };

  const removeNestedSubHeader = (fieldIndex: number, subIndex: number, fieldIndex2: number, nestedIndex: number) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers?.[subIndex]?.fields[fieldIndex2]) {
      const subField = updatedFields[fieldIndex].sub_headers![subIndex].fields[fieldIndex2];
      subField.sub_headers = subField.sub_headers?.filter((_, i) => i !== nestedIndex) || [];
      onChange(updatedFields);
    }
  };

  const updateNestedSubHeader = (fieldIndex: number, subIndex: number, fieldIndex2: number, nestedIndex: number, updates: Partial<SubHeader>) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].sub_headers?.[subIndex]?.fields[fieldIndex2]?.sub_headers?.[nestedIndex]) {
      const subField = updatedFields[fieldIndex].sub_headers![subIndex].fields[fieldIndex2];
      subField.sub_headers![nestedIndex] = {
        ...subField.sub_headers![nestedIndex],
        ...updates
      };
      onChange(updatedFields);
    }
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field, i) => {
      if (i === index) {
        const updatedField = { ...field, ...updates };
        
        // Always auto-generate field_name from field_label when label changes
        if (updates.field_label) {
          const generatedName = generateFieldName(updates.field_label);
          updatedField.field_name = generatedName;
        }
        
        // Clear reference_data_name if field type changes to non-dropdown
        if (updates.field_type && !requiresReferenceData(updates.field_type)) {
          updatedField.reference_data_name = undefined;
        }
        
        return updatedField;
      }
      return field;
    });
    onChange(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    onChange(updatedFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updatedFields = [...fields];
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    onChange(updatedFields);
  };

  const requiresReferenceData = (fieldType: string) => {
    return fieldType === 'select' || fieldType === 'radio';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Form Fields</h3>
        <Button type="button" onClick={addField} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No fields added yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Field" to start building your form</p>
          </CardContent>
        </Card>
      )}

      {fields.map((field, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Field {index + 1}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveField(index, 'down')}
                  disabled={index === fields.length - 1}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Label *</Label>
                <Input
                  value={field.field_label}
                  onChange={(e) => updateField(index, { field_label: e.target.value })}
                  placeholder="Enter field label"
                />
              </div>
              <div className="space-y-2">
                <Label>Field Type *</Label>
                <Select
                  value={field.field_type}
                  onValueChange={(value) => updateField(index, { field_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Placeholder Text</Label>
                <Input
                  value={field.placeholder_text || ''}
                  onChange={(e) => updateField(index, { placeholder_text: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
              {field.field_name && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Auto-generated field name:</strong> {field.field_name}
                  </p>
                </div>
              )}
            </div>

            {field.field_type === 'aggregate' && (
              <div className="space-y-2">
                <Label>Fields to Aggregate *</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Select two or more number fields to sum together. Only number fields are available for aggregation.
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {fields
                    .filter((f, i) => i !== index && f.field_type === 'number' && f.field_label)
                    .map((numberField, i) => {
                      const isChecked = field.aggregate_fields?.includes(numberField.field_name) || false;
                      const checkboxId = `aggregate-${index}-field-${numberField.field_name || i}`;
                      
                      return (
                        <div key={numberField.field_name || `number-field-${i}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={checkboxId}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentFields = field.aggregate_fields || [];
                              let updatedFields;
                              
                              if (checked) {
                                // Add field if not already present
                                if (!currentFields.includes(numberField.field_name)) {
                                  updatedFields = [...currentFields, numberField.field_name];
                                } else {
                                  updatedFields = currentFields;
                                }
                              } else {
                                // Remove field
                                updatedFields = currentFields.filter(name => name !== numberField.field_name);
                              }
                              
                              updateField(index, { aggregate_fields: updatedFields });
                            }}
                          />
                          <Label htmlFor={checkboxId} className="text-sm cursor-pointer">
                            {numberField.field_label} ({numberField.field_name || 'unnamed'})
                          </Label>
                        </div>
                      );
                    })}
                  {fields.filter((f, i) => i !== index && f.field_type === 'number' && f.field_label).length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No number fields available. Add number fields first.
                    </p>
                  )}
                </div>
              </div>
            )}

            {requiresReferenceData(field.field_type) && (
              <div className="space-y-2">
                <Label>Reference Data Set *</Label>
                {loading ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="text-sm text-gray-600">Loading reference data...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{error}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchReferenceDataSets}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={field.reference_data_name || ''}
                    onValueChange={(value) => updateField(index, { reference_data_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference data set" />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceDataSets.length === 0 ? (
                        <SelectItem value="no-data" disabled>
                          No reference data sets available
                        </SelectItem>
                      ) : (
                        referenceDataSets.map((dataSet) => (
                          <SelectItem key={dataSet.name} value={dataSet.name}>
                            {dataSet.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500">
                  Choose the dropdown options from your reference data sets
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${index}`}
                  checked={field.is_required}
                  onCheckedChange={(checked) => updateField(index, { is_required: !!checked })}
                />
                <Label htmlFor={`required-${index}`} className="text-sm">Required field</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`primary-${index}`}
                  checked={field.is_primary_column}
                  onCheckedChange={(checked) => updateField(index, { is_primary_column: !!checked })}
                />
                <Label htmlFor={`primary-${index}`} className="text-sm">Primary column</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`secondary-${index}`}
                  checked={field.is_secondary_column}
                  onCheckedChange={(checked) => updateField(index, { is_secondary_column: !!checked })}
                />
                <Label htmlFor={`secondary-${index}`} className="text-sm">Secondary column</Label>
              </div>
            </div>

            {/* Sub-header management for secondary columns */}
            {field.is_secondary_column && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Sub-headers (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`has-subheaders-${index}`}
                      checked={field.has_sub_headers || false}
                      onCheckedChange={(checked) => updateField(index, { 
                        has_sub_headers: !!checked,
                        sub_headers: checked ? (field.sub_headers || []) : []
                      })}
                    />
                    <Label htmlFor={`has-subheaders-${index}`} className="text-sm">Enable sub-headers</Label>
                  </div>
                </div>
                
                {field.has_sub_headers && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Add sub-categories like "Medical" and "Dental" under "Specialists"
                    </p>
                    
                    {/* Sub-header list */}
                    {(field.sub_headers || []).map((subHeader, subIndex) => (
                      <div key={subIndex} className="p-3 border rounded bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Sub-header {subIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubHeader(index, subIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label className="text-xs">Name (technical)</Label>
                            <Input
                              value={subHeader.name}
                              onChange={(e) => updateSubHeader(index, subIndex, { name: e.target.value })}
                              placeholder="medical"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Label (display)</Label>
                            <Input
                              value={subHeader.label}
                              onChange={(e) => updateSubHeader(index, subIndex, { label: e.target.value })}
                              placeholder="Medical"
                              className="text-sm"
                            />
                          </div>
                        </div>

                        {/* Sub-header fields */}
                        <div className="space-y-3">
                          <Label className="text-xs font-medium">Fields in this sub-header:</Label>
                          {subHeader.fields.map((subField, fieldIndex) => (
                            <div key={fieldIndex} className="p-3 border rounded bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs font-medium">Field {fieldIndex + 1}</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSubHeaderField(index, subIndex, fieldIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <Label className="text-xs">Field Label *</Label>
                                  <Input
                                    value={subField.field_label}
                                    onChange={(e) => updateSubHeaderField(index, subIndex, fieldIndex, { 
                                      field_label: e.target.value, 
                                      field_name: generateFieldName(e.target.value) 
                                    })}
                                    placeholder="e.g., Total, Male, Female"
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Field Type *</Label>
                                  <Select
                                    value={subField.field_type}
                                    onValueChange={(value) => updateSubHeaderField(index, subIndex, fieldIndex, { field_type: value })}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FIELD_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {requiresReferenceData(subField.field_type) && (
                                <div className="mb-2">
                                  <Label className="text-xs">Reference Data Set *</Label>
                                  <Select
                                    value={subField.reference_data_name || ''}
                                    onValueChange={(value) => updateSubHeaderField(index, subIndex, fieldIndex, { reference_data_name: value })}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder="Select reference data set" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {referenceDataSets.length === 0 ? (
                                        <SelectItem value="no-data" disabled>
                                          No reference data sets available
                                        </SelectItem>
                                      ) : (
                                        referenceDataSets.map((dataSet) => (
                                          <SelectItem key={dataSet.name} value={dataSet.name}>
                                            {dataSet.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {subField.field_type === 'aggregate' && (
                                <div className="mb-2">
                                  <Label className="text-xs">Aggregate Fields</Label>
                                  <div className="space-y-2">
                                    {/* Show available number fields from this sub-header */}
                                    {subHeader.fields
                                      .filter((f, fIdx) => f.field_type === 'number' && fIdx !== fieldIndex)
                                      .map((numberField, availableIdx) => (
                                        <div key={availableIdx} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`aggregate-${index}-${subIndex}-${fieldIndex}-${availableIdx}`}
                                            checked={subField.aggregate_fields?.includes(numberField.field_name) || false}
                                            onCheckedChange={(checked) => {
                                              const currentAggregates = subField.aggregate_fields || [];
                                              const newAggregates = checked
                                                ? [...currentAggregates, numberField.field_name]
                                                : currentAggregates.filter(f => f !== numberField.field_name);
                                              updateSubHeaderField(index, subIndex, fieldIndex, { 
                                                aggregate_fields: newAggregates 
                                              });
                                            }}
                                          />
                                          <Label 
                                            htmlFor={`aggregate-${index}-${subIndex}-${fieldIndex}-${availableIdx}`}
                                            className="text-xs"
                                          >
                                            {numberField.field_label || numberField.field_name}
                                          </Label>
                                        </div>
                                      ))}
                                    {subHeader.fields.filter(f => f.field_type === 'number' && subHeader.fields.indexOf(f) !== fieldIndex).length === 0 && (
                                      <p className="text-xs text-gray-500 italic">
                                        No number fields available in this sub-header to aggregate
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Select number fields from this sub-header to sum
                                  </p>
                                </div>
                              )}

                              <div className="mb-2">
                                <Label className="text-xs">Placeholder Text</Label>
                                <Input
                                  value={subField.placeholder_text || ''}
                                  onChange={(e) => updateSubHeaderField(index, subIndex, fieldIndex, { placeholder_text: e.target.value })}
                                  placeholder="Placeholder text for this field"
                                  className="text-sm"
                                />
                              </div>

                              <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`sub-required-${index}-${subIndex}-${fieldIndex}`}
                                    checked={subField.is_required}
                                    onCheckedChange={(checked) => updateSubHeaderField(index, subIndex, fieldIndex, { is_required: !!checked })}
                                  />
                                  <Label htmlFor={`sub-required-${index}-${subIndex}-${fieldIndex}`} className="text-xs">
                                    Required field
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`sub-secondary-${index}-${subIndex}-${fieldIndex}`}
                                    checked={subField.is_secondary_column || false}
                                    onCheckedChange={(checked) => updateSubHeaderField(index, subIndex, fieldIndex, { is_secondary_column: !!checked })}
                                  />
                                  <Label htmlFor={`sub-secondary-${index}-${subIndex}-${fieldIndex}`} className="text-xs">
                                    Secondary column
                                  </Label>
                                </div>
                              </div>

                              {/* Nested sub-headers for sub-header fields */}
                              {subField.is_secondary_column && (
                                <div className="mt-3 p-3 border rounded-lg bg-blue-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <Label className="text-xs font-medium">Nested Sub-headers (Optional)</Label>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`nested-has-subheaders-${index}-${subIndex}-${fieldIndex}`}
                                        checked={subField.has_sub_headers || false}
                                        onCheckedChange={(checked) => updateSubHeaderField(index, subIndex, fieldIndex, { 
                                          has_sub_headers: !!checked,
                                          sub_headers: checked ? (subField.sub_headers || []) : []
                                        })}
                                      />
                                      <Label htmlFor={`nested-has-subheaders-${index}-${subIndex}-${fieldIndex}`} className="text-xs">
                                        Enable nested sub-headers
                                      </Label>
                                    </div>
                                  </div>
                                  
                                  {subField.has_sub_headers && (
                                    <div className="space-y-2">
                                      <p className="text-xs text-blue-600">
                                        Add nested categories under "{subField.field_label}"
                                      </p>
                                      
                                      {/* Nested sub-header list */}
                                      {(subField.sub_headers || []).map((nestedSubHeader, nestedSubIndex) => (
                                        <div key={nestedSubIndex} className="p-2 border rounded bg-white">
                                          <div className="flex items-center justify-between mb-2">
                                            <Label className="text-xs font-medium">Nested Sub-header {nestedSubIndex + 1}</Label>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeNestedSubHeader(index, subIndex, fieldIndex, nestedSubIndex)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <Label className="text-xs">Name</Label>
                                              <Input
                                                value={nestedSubHeader.name}
                                                onChange={(e) => updateNestedSubHeader(index, subIndex, fieldIndex, nestedSubIndex, { name: e.target.value })}
                                                placeholder="medical"
                                                className="text-xs"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-xs">Label</Label>
                                              <Input
                                                value={nestedSubHeader.label}
                                                onChange={(e) => updateNestedSubHeader(index, subIndex, fieldIndex, nestedSubIndex, { label: e.target.value })}
                                                placeholder="Medical"
                                                className="text-xs"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addNestedSubHeader(index, subIndex, fieldIndex)}
                                        className="text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Nested Sub-header
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSubHeaderField(index, subIndex)}
                            className="text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Field
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubHeader(index)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-header
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
