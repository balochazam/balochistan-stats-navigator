import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Comprehensive indicator type definitions
const indicatorTypeDefinitions = {
  percentage: {
    name: "Percentage",
    description: "Values expressed as percentages (0-100%)",
    defaultUnit: "percentage",
    fields: ["unit", "methodology", "data_collection_frequency"],
    validation: { min: 0, max: 100 },
    examples: ["Literacy rate", "Poverty headcount ratio"]
  },
  rate: {
    name: "Rate",
    description: "Rates per unit population (e.g., per 1,000 or 100,000)",
    defaultUnit: "per 100,000",
    fields: ["unit", "methodology", "data_collection_frequency", "population_base"],
    validation: { min: 0 },
    examples: ["Maternal mortality ratio", "Under-5 mortality rate"]
  },
  count: {
    name: "Count/Number",
    description: "Absolute numbers or counts",
    defaultUnit: "number",
    fields: ["unit", "methodology", "data_collection_frequency", "counting_method"],
    validation: { min: 0, integer: true },
    examples: ["Number of schools", "Population count"]
  },
  index: {
    name: "Index",
    description: "Composite indices or normalized scores",
    defaultUnit: "index score",
    fields: ["unit", "methodology", "data_collection_frequency", "index_components", "weighting_method"],
    validation: { min: 0, max: 1 },
    examples: ["Human Development Index", "Gender Parity Index"]
  },
  multi_dimensional: {
    name: "Multi-dimensional",
    description: "Complex indicators with multiple dimensions and breakdowns",
    defaultUnit: "varies",
    fields: ["unit", "methodology", "data_collection_frequency", "dimensions", "disaggregation", "aggregation_rules"],
    validation: {},
    examples: ["Multi-dimensional Poverty Index", "Access to basic services"]
  },
  budget: {
    name: "Budget/Financial",
    description: "Financial allocations and expenditures",
    defaultUnit: "PKR million",
    fields: ["unit", "methodology", "data_collection_frequency", "budget_category", "fiscal_year"],
    validation: { min: 0 },
    examples: ["Government spending on education", "Social protection expenditure"]
  },
  geographic_breakdown: {
    name: "Geographic Breakdown",
    description: "Data broken down by geographic regions",
    defaultUnit: "varies",
    fields: ["unit", "methodology", "data_collection_frequency", "geographic_levels", "coverage_area"],
    validation: {},
    examples: ["Urban vs Rural indicators", "District-wise data"]
  },
  demographic_breakdown: {
    name: "Demographic Breakdown",
    description: "Data disaggregated by demographic characteristics",
    defaultUnit: "varies",
    fields: ["unit", "methodology", "data_collection_frequency", "demographic_categories", "age_groups"],
    validation: {},
    examples: ["Gender-disaggregated data", "Age-specific indicators"]
  }
};

// Enhanced schema for comprehensive indicator creation
const advancedIndicatorSchema = z.object({
  sdg_goal_id: z.string().min(1, "Goal is required"),
  sdg_target_id: z.string().min(1, "Target is required"),
  indicator_code: z.string().min(1, "Indicator code is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  indicator_type: z.enum([
    "percentage", "rate", "count", "index", "ratio", "currency", 
    "multi_dimensional", "budget", "binary", "composite_index",
    "time_series", "geographic_breakdown", "demographic_breakdown", "survey_based"
  ]),
  unit: z.string().min(1, "Unit is required"),
  methodology: z.string().min(1, "Methodology is required"),
  data_collection_frequency: z.string().min(1, "Data collection frequency is required"),
  responsible_departments: z.array(z.string()).default([]),
  // Enhanced fields
  data_structure: z.any().optional(),
  validation_rules: z.any().optional(),
  aggregation_methods: z.any().optional(),
  disaggregation_categories: z.any().optional(),
  data_quality_requirements: z.any().optional(),
});

type AdvancedIndicatorForm = z.infer<typeof advancedIndicatorSchema>;

interface AdvancedIndicatorFormProps {
  goals: any[];
  targets: any[];
  departments: any[];
  onSubmit: (data: AdvancedIndicatorForm) => void;
  onCancel: () => void;
}

export function AdvancedIndicatorForm({ 
  goals, 
  targets, 
  departments, 
  onSubmit, 
  onCancel 
}: AdvancedIndicatorFormProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [dimensions, setDimensions] = useState<Array<{ name: string; type: string; required: boolean }>>([]);
  const [disaggregations, setDisaggregations] = useState<Array<{ category: string; values: string[] }>>([]);

  const form = useForm<AdvancedIndicatorForm>({
    resolver: zodResolver(advancedIndicatorSchema),
    defaultValues: {
      responsible_departments: [],
      data_structure: {},
      validation_rules: {},
      aggregation_methods: {},
      disaggregation_categories: {},
      data_quality_requirements: {},
    },
  });

  const watchedType = form.watch("indicator_type");
  const watchedGoal = form.watch("sdg_goal_id");

  useEffect(() => {
    if (watchedType && indicatorTypeDefinitions[watchedType as keyof typeof indicatorTypeDefinitions]) {
      const typeDef = indicatorTypeDefinitions[watchedType as keyof typeof indicatorTypeDefinitions];
      setSelectedType(watchedType);
      
      // Set default unit
      form.setValue("unit", typeDef.defaultUnit);
      
      // Reset target when goal changes
      if (watchedGoal) {
        form.setValue("sdg_target_id", "");
      }
    }
  }, [watchedType, watchedGoal, form]);

  const addDimension = () => {
    setDimensions([...dimensions, { name: "", type: "text", required: false }]);
  };

  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  const updateDimension = (index: number, field: string, value: any) => {
    const updated = [...dimensions];
    updated[index] = { ...updated[index], [field]: value };
    setDimensions(updated);
  };

  const addDisaggregation = () => {
    setDisaggregations([...disaggregations, { category: "", values: [] }]);
  };

  const removeDisaggregation = (index: number) => {
    setDisaggregations(disaggregations.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: AdvancedIndicatorForm) => {
    // Enhance data with dynamic fields
    const enhancedData = {
      ...data,
      data_structure: selectedType === "multi_dimensional" ? {
        dimensions: dimensions,
        disaggregations: disaggregations
      } : {},
      validation_rules: getValidationRules(selectedType),
      aggregation_methods: getAggregationMethods(selectedType),
      disaggregation_categories: disaggregations.reduce((acc, cat) => {
        acc[cat.category] = cat.values;
        return acc;
      }, {} as Record<string, string[]>),
      data_quality_requirements: getQualityRequirements(selectedType)
    };
    
    onSubmit(enhancedData);
  };

  const getValidationRules = (type: string) => {
    const typeDef = indicatorTypeDefinitions[type as keyof typeof indicatorTypeDefinitions];
    return typeDef?.validation || {};
  };

  const getAggregationMethods = (type: string) => {
    switch (type) {
      case "multi_dimensional":
        return { method: "weighted_average", weights: {} };
      case "percentage":
        return { method: "simple_average" };
      case "rate":
        return { method: "population_weighted" };
      default:
        return { method: "simple_sum" };
    }
  };

  const getQualityRequirements = (type: string) => {
    return {
      completeness_threshold: 0.8,
      accuracy_level: "high",
      timeliness_days: 30,
      consistency_checks: true
    };
  };

  const availableTargets = targets.filter((target: any) => 
    target.sdg_goal_id === parseInt(watchedGoal || '0')
  );

  const currentTypeDef = selectedType ? indicatorTypeDefinitions[selectedType as keyof typeof indicatorTypeDefinitions] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Advanced SDG Indicator</CardTitle>
          <p className="text-sm text-gray-600">
            Design comprehensive indicators with dynamic fields and validation
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="structure">Data Structure</TabsTrigger>
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                  <TabsTrigger value="quality">Quality Control</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sdg_goal_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SDG Goal</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('sdg_target_id', '');
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select SDG Goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {goals.map((goal: any) => (
                                <SelectItem key={goal.id} value={goal.id.toString()}>
                                  SDG {goal.id}: {goal.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sdg_target_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SDG Target</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!watchedGoal}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  watchedGoal ? "Select Target" : "First select a Goal"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableTargets.map((target: any) => (
                                <SelectItem key={target.id} value={target.id}>
                                  {target.target_number}: {target.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="indicator_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indicator Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1.2.2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="indicator_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indicator Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(indicatorTypeDefinitions).map(([key, type]) => (
                                <SelectItem key={key} value={key}>
                                  <div>
                                    <div className="font-medium">{type.name}</div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {currentTypeDef && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{currentTypeDef.name}:</strong> {currentTypeDef.description}
                        <br />
                        <strong>Examples:</strong> {currentTypeDef.examples.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Proportion of population living in poverty" {...field} />
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
                          <Textarea placeholder="Detailed description of the indicator..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measurement</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., percentage, per 100,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_collection_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Collection Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Annual, Quarterly" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="methodology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Methodology</FormLabel>
                        <FormControl>
                          <Textarea placeholder="How this indicator is measured and calculated..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="structure" className="space-y-4">
                  {selectedType === "multi_dimensional" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium">Data Dimensions</h3>
                          <Button type="button" onClick={addDimension} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Dimension
                          </Button>
                        </div>
                        {dimensions.map((dimension, index) => (
                          <Card key={index} className="p-4">
                            <div className="grid grid-cols-4 gap-3 items-end">
                              <div>
                                <label className="text-sm font-medium">Dimension Name</label>
                                <Input
                                  value={dimension.name}
                                  onChange={(e) => updateDimension(index, 'name', e.target.value)}
                                  placeholder="e.g., Age Group"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Data Type</label>
                                <Select 
                                  value={dimension.type} 
                                  onValueChange={(value) => updateDimension(index, 'type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={dimension.required}
                                  onCheckedChange={(checked) => updateDimension(index, 'required', checked)}
                                />
                                <label className="text-sm">Required</label>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDimension(index)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium">Disaggregation Categories</h3>
                          <Button type="button" onClick={addDisaggregation} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                          </Button>
                        </div>
                        {disaggregations.map((disagg, index) => (
                          <Card key={index} className="p-4">
                            <div className="grid grid-cols-3 gap-3 items-end">
                              <div>
                                <label className="text-sm font-medium">Category</label>
                                <Input
                                  value={disagg.category}
                                  onChange={(e) => {
                                    const updated = [...disaggregations];
                                    updated[index].category = e.target.value;
                                    setDisaggregations(updated);
                                  }}
                                  placeholder="e.g., Gender, Location"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Values (comma-separated)</label>
                                <Input
                                  value={disagg.values.join(', ')}
                                  onChange={(e) => {
                                    const updated = [...disaggregations];
                                    updated[index].values = e.target.value.split(',').map(v => v.trim());
                                    setDisaggregations(updated);
                                  }}
                                  placeholder="e.g., Male, Female or Urban, Rural"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDisaggregation(index)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedType && selectedType !== "multi_dimensional" && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This indicator type uses a standard data structure. Advanced structure configuration is available for multi-dimensional indicators.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="validation" className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Validation rules are automatically configured based on the indicator type selected. 
                      Additional custom validation can be added through the API.
                    </AlertDescription>
                  </Alert>

                  {currentTypeDef?.validation && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Automatic Validation Rules</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {Object.entries(currentTypeDef.validation).map(([key, value]) => (
                          <div key={key}>
                            <Badge variant="outline">{key}</Badge>: {String(value)}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Data quality requirements ensure reliable and accurate indicator measurements.
                    </AlertDescription>
                  </Alert>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Quality Standards</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Completeness Threshold:</strong> 80%
                      </div>
                      <div>
                        <strong>Accuracy Level:</strong> High
                      </div>
                      <div>
                        <strong>Timeliness:</strong> 30 days
                      </div>
                      <div>
                        <strong>Consistency Checks:</strong> Enabled
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Advanced Indicator
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}