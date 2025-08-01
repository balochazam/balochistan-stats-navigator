import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Database, Info, Calculator, Users, MapPin } from 'lucide-react';
import { type IndicatorStructure, STANDARD_FORM_FIELDS, getCompleteFormStructure } from '@/data/completeSDGIndicators';

interface AuthenticSDGDataEntryFormProps {
  indicator: IndicatorStructure;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AuthenticSDGDataEntryForm: React.FC<AuthenticSDGDataEntryFormProps> = ({
  indicator,
  onSubmit,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dataEntries, setDataEntries] = useState<any[]>([]);

  // Create dynamic form schema based on indicator structure
  const createFormSchema = () => {
    const schemaFields: any = {};
    
    // Add standard fields
    STANDARD_FORM_FIELDS.forEach(field => {
      if (field.type === 'number') {
        schemaFields[field.name] = z.number().min(field.validation?.min || 0);
        if (field.validation?.max) {
          schemaFields[field.name] = schemaFields[field.name].max(field.validation.max);
        }
      } else if (field.type === 'select') {
        schemaFields[field.name] = z.string().min(1, `${field.label} is required`);
      } else {
        schemaFields[field.name] = field.required 
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
      }
    });

    // Add indicator-specific fields
    indicator.form_structure.fields.forEach(field => {
      if (field.type === 'number' || field.type === 'percentage') {
        let schema = z.number();
        if (field.validation?.min !== undefined) schema = schema.min(field.validation.min);
        if (field.validation?.max !== undefined) schema = schema.max(field.validation.max);
        if (!field.required) schema = schema.optional();
        schemaFields[field.name] = schema;
      } else if (field.type === 'select') {
        schemaFields[field.name] = field.required 
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
      } else {
        schemaFields[field.name] = field.required 
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
      }
    });

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {}
  });

  // Generate data entry matrix for complex indicators
  const generateDataMatrix = () => {
    if (indicator.type !== 'multi_dimensional') return [];

    const disaggregationFields = indicator.disaggregation.required;
    let combinations: any[] = [{}];
    
    disaggregationFields.forEach(fieldName => {
      const field = indicator.form_structure.fields.find(f => f.name === fieldName);
      if (field && field.options) {
        const newCombinations: any[] = [];
        combinations.forEach(combo => {
          field.options!.forEach(option => {
            newCombinations.push({
              ...combo,
              [fieldName]: option
            });
          });
        });
        combinations = newCombinations;
      }
    });

    return combinations.map((combo, index) => ({
      id: index,
      ...combo,
      value: '',
      notes: ''
    }));
  };

  const handleSubmit = (data: any) => {
    const submissionData = {
      indicator_code: indicator.code,
      indicator_title: indicator.title,
      goal_id: indicator.goal_id,
      target_code: indicator.target_code,
      data_type: indicator.type,
      form_data: data,
      data_entries: dataEntries,
      submitted_at: new Date().toISOString(),
      metadata: {
        custodian_agencies: indicator.custodian_agencies,
        tier: indicator.tier,
        measurement_unit: indicator.measurement_unit,
        collection_frequency: indicator.collection_frequency
      }
    };
    
    onSubmit(submissionData);
  };

  const renderStandardFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {STANDARD_FORM_FIELDS.map((field) => (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {field.name === 'data_year' && <Calendar className="h-4 w-4" />}
                {field.name === 'data_source' && <Database className="h-4 w-4" />}
                {field.name === 'geographic_coverage' && <MapPin className="h-4 w-4" />}
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                {field.type === 'select' ? (
                  <Select onValueChange={formField.onChange} value={formField.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'number' ? (
                  <Input
                    type="number"
                    {...formField}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                    min={field.validation?.min}
                    max={field.validation?.max}
                  />
                ) : (
                  <Input {...formField} />
                )}
              </FormControl>
              {field.help_text && (
                <FormDescription className="text-xs">
                  {field.help_text}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );

  const renderIndicatorSpecificFields = () => {
    if (indicator.type === 'multi_dimensional') {
      return renderMultiDimensionalForm();
    } else if (indicator.type === 'ratio') {
      return renderRatioForm();
    } else {
      return renderSimpleForm();
    }
  };

  const renderSimpleForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {indicator.form_structure.fields.map((field) => (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                {field.type === 'select' ? (
                  <Select onValueChange={formField.onChange} value={formField.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'number' || field.type === 'percentage' ? (
                  <Input
                    type="number"
                    step={field.type === 'percentage' ? '0.01' : '1'}
                    {...formField}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                    min={field.validation?.min}
                    max={field.validation?.max}
                  />
                ) : (
                  <Input {...formField} />
                )}
              </FormControl>
              {field.help_text && (
                <FormDescription className="text-xs">
                  {field.help_text}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );

  const renderRatioForm = () => {
    const calculation = indicator.form_structure.calculation;
    
    return (
      <div className="space-y-6">
        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            <strong>Ratio Calculation:</strong> {calculation?.formula || 'Numerator ÷ Denominator × Multiplier'}
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicator.form_structure.fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    {field.type === 'select' ? (
                      <Select onValueChange={formField.onChange} value={formField.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        step={field.type === 'percentage' ? '0.01' : '1'}
                        {...formField}
                        onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                        min={field.validation?.min}
                        max={field.validation?.max}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderMultiDimensionalForm = () => {
    React.useEffect(() => {
      if (dataEntries.length === 0) {
        setDataEntries(generateDataMatrix());
      }
    }, []);

    const updateDataEntry = (id: number, field: string, value: string) => {
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      ));
    };

    return (
      <div className="space-y-6">
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Multi-dimensional Data Entry:</strong> Enter values for each combination of {indicator.disaggregation.required.join(', ')}
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {indicator.disaggregation.required.map((dim) => (
                  <TableHead key={dim} className="capitalize">
                    {dim.replace('_', ' ')}
                  </TableHead>
                ))}
                <TableHead>Value ({indicator.measurement_unit})</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataEntries.map((entry) => (
                <TableRow key={entry.id}>
                  {indicator.disaggregation.required.map((dim) => (
                    <TableCell key={dim}>
                      <Badge variant="outline">{entry[dim]}</Badge>
                    </TableCell>
                  ))}
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.value}
                      onChange={(e) => updateDataEntry(entry.id, 'value', e.target.value)}
                      placeholder="0.00"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={entry.notes}
                      onChange={(e) => updateDataEntry(entry.id, 'notes', e.target.value)}
                      placeholder="Optional notes"
                      className="w-32"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {indicator.code}: {indicator.title}
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">Goal {indicator.goal_id}</Badge>
          <Badge variant="outline">Target {indicator.target_code}</Badge>
          <Badge variant="secondary">Tier {indicator.tier}</Badge>
          <Badge variant="default">{indicator.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="standard">Standard Fields</TabsTrigger>
                <TabsTrigger value="data">Data Entry</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Measurement Details</h4>
                        <p><span className="font-medium">Unit:</span> {indicator.measurement_unit}</p>
                        <p><span className="font-medium">Frequency:</span> {indicator.collection_frequency}</p>
                        <p><span className="font-medium">Type:</span> {indicator.type}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Data Sources</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {indicator.data_sources.map((source, idx) => (
                            <li key={idx}>{source}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Custodian Agencies</h4>
                        <p>{indicator.custodian_agencies.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Required Disaggregation</h4>
                        <p>{indicator.disaggregation.required.join(', ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="standard" className="space-y-4">
                {renderStandardFields()}
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                {renderIndicatorSpecificFields()}
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
                      {JSON.stringify(form.getValues(), null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Data Entry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};