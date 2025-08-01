import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Settings2, Eye, Code, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formStructureSchema = z.object({
  indicator_id: z.string(),
  form_type: z.enum(["simple", "ratio", "multi_dimensional", "time_series", "geographic", "demographic"]),
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  data_collection_method: z.string(),
  timeframe_type: z.enum(["annual", "quarterly", "monthly", "one_time"]),
  dimensions: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(["categorical", "numerical", "percentage", "boolean"]),
    values: z.array(z.string()).optional(),
    required: z.boolean(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      decimal_places: z.number().optional()
    }).optional()
  })).default([]),
  calculation_rules: z.object({
    type: z.enum(["sum", "average", "ratio", "weighted_average", "custom"]).optional(),
    formula: z.string().optional(),
    aggregation_levels: z.array(z.string()).optional()
  }).optional(),
  quality_checks: z.object({
    completeness_threshold: z.number().min(0).max(1),
    logical_checks: z.array(z.string()),
    outlier_detection: z.boolean()
  }).default({
    completeness_threshold: 0.8,
    logical_checks: [],
    outlier_detection: true
  })
});

type FormStructure = z.infer<typeof formStructureSchema>;

interface DynamicFormBuilderProps {
  indicator: {
    id: string;
    indicator_code: string;
    title: string;
    indicator_type: string;
  };
  onSave: (structure: FormStructure) => void;
  onCancel: () => void;
  existingStructure?: any;
}

export function DynamicFormBuilder({ indicator, onSave, onCancel, existingStructure }: DynamicFormBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false);
  
  const form = useForm<FormStructure>({
    resolver: zodResolver(formStructureSchema),
    defaultValues: existingStructure || {
      indicator_id: indicator.id,
      form_type: "simple",
      title: `Data Entry Form for ${indicator.indicator_code}`,
      description: "",
      data_collection_method: "manual_entry",
      timeframe_type: "annual",
      dimensions: [],
      calculation_rules: {
        type: "sum"
      },
      quality_checks: {
        completeness_threshold: 0.8,
        logical_checks: [],
        outlier_detection: true
      }
    }
  });

  const { fields: dimensions, append, remove } = useFieldArray({
    control: form.control,
    name: "dimensions"
  });

  const addDimension = () => {
    append({
      name: "",
      label: "",
      type: "categorical",
      values: [],
      required: true,
      validation: {}
    });
  };

  const addDimensionValue = (dimensionIndex: number, value: string) => {
    const currentValues = form.getValues(`dimensions.${dimensionIndex}.values`) || [];
    form.setValue(`dimensions.${dimensionIndex}.values`, [...currentValues, value]);
  };

  const removeDimensionValue = (dimensionIndex: number, valueIndex: number) => {
    const currentValues = form.getValues(`dimensions.${dimensionIndex}.values`) || [];
    const newValues = currentValues.filter((_, index) => index !== valueIndex);
    form.setValue(`dimensions.${dimensionIndex}.values`, newValues);
  };

  const handleSubmit = (data: FormStructure) => {
    onSave(data);
  };

  const renderFormPreview = () => {
    const formData = form.getValues();
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Form Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium">{formData.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
            </div>
            
            {formData.dimensions.map((dimension, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <label className="block text-sm font-medium mb-2">
                  {dimension.label} {dimension.required && <span className="text-red-500">*</span>}
                </label>
                
                {dimension.type === "categorical" && dimension.values && (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {dimension.values.map((value, vIndex) => (
                        <SelectItem key={vIndex} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {(dimension.type === "numerical" || dimension.type === "percentage") && (
                  <Input
                    type="number"
                    placeholder={`Enter ${dimension.type}`}
                    disabled
                  />
                )}
                
                {dimension.type === "boolean" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox disabled />
                    <label className="text-sm">Yes/No option</label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Dynamic Form Builder
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Design custom data entry forms for {indicator.indicator_code}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {previewMode ? "Hide" : "Show"} Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="dimensions">Data Dimensions</TabsTrigger>
                  <TabsTrigger value="calculations">Calculations</TabsTrigger>
                  <TabsTrigger value="quality">Quality Control</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Data Entry Form Title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Form description and instructions" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="form_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Form Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple Value Entry</SelectItem>
                              <SelectItem value="ratio">Ratio Calculation</SelectItem>
                              <SelectItem value="multi_dimensional">Multi-dimensional Data</SelectItem>
                              <SelectItem value="time_series">Time Series</SelectItem>
                              <SelectItem value="geographic">Geographic Breakdown</SelectItem>
                              <SelectItem value="demographic">Demographic Breakdown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeframe_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Collection Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="annual">Annual</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="one_time">One-time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="dimensions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Data Dimensions</h3>
                    <Button type="button" onClick={addDimension} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dimension
                    </Button>
                  </div>

                  {dimensions.map((dimension, index) => (
                    <Card key={dimension.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Dimension {index + 1}</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`dimensions.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Field Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., gender, age_group" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`dimensions.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Label</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Gender, Age Group" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`dimensions.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="categorical">Categorical (dropdown)</SelectItem>
                                    <SelectItem value="numerical">Numerical</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="boolean">Yes/No</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`dimensions.${index}.required`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Required Field</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        {form.watch(`dimensions.${index}.type`) === "categorical" && (
                          <div>
                            <FormLabel>Options</FormLabel>
                            <div className="space-y-2">
                              {form.watch(`dimensions.${index}.values`)?.map((value, vIndex) => (
                                <div key={vIndex} className="flex items-center gap-2">
                                  <Input value={value} readOnly />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeDimensionValue(index, vIndex)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Add option"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const value = (e.target as HTMLInputElement).value;
                                      if (value.trim()) {
                                        addDimensionValue(index, value.trim());
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                    const value = input.value;
                                    if (value.trim()) {
                                      addDimensionValue(index, value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}

                  {dimensions.length === 0 && (
                    <Alert>
                      <Database className="h-4 w-4" />
                      <AlertDescription>
                        Add data dimensions to create structured data entry fields. Each dimension represents a data point that users will fill in.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="calculations" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="calculation_rules.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calculation Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sum">Sum of values</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="ratio">Ratio calculation</SelectItem>
                            <SelectItem value="weighted_average">Weighted average</SelectItem>
                            <SelectItem value="custom">Custom formula</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("calculation_rules.type") === "custom" && (
                    <FormField
                      control={form.control}
                      name="calculation_rules.formula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Formula</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="e.g., SUM(field1) / SUM(field2) * 100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="quality_checks.completeness_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completeness Threshold (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) / 100)}
                            value={(field.value * 100).toString()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality_checks.outlier_detection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Enable outlier detection</FormLabel>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Form Structure
                </Button>
              </div>
            </form>
          </Form>

          {previewMode && renderFormPreview()}
        </CardContent>
      </Card>
    </div>
  );
}