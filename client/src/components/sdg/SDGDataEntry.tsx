import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Plus, Database, Upload, Target, Calendar, TrendingUp } from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';
import { z } from 'zod';

const indicatorValueSchema = z.object({
  indicator_id: z.string().min(1, "Indicator is required"),
  data_source_id: z.string().optional(),
  year: z.number().min(2000).max(2030),
  value: z.string().min(1, "Value is required"),
  value_numeric: z.number().optional(),
  breakdown_data: z.any().optional(),
  baseline_indicator: z.boolean().default(false),
  progress_indicator: z.boolean().default(false),
  notes: z.string().optional(),
  reference_document: z.string().optional(),
  data_quality_score: z.number().min(1).max(5).optional(),
  department_id: z.string().optional(),
  submitted_by: z.string(),
});

const dataSourceTypes = [
  { value: "MICS", label: "MICS", description: "Multiple Indicator Cluster Survey" },
  { value: "PDHS", label: "PDHS", description: "Pakistan Demographic and Health Survey" },
  { value: "PSLM", label: "PSLM", description: "Pakistan Social and Living Standards Measurement" },
  { value: "NNS", label: "NNS", description: "National Nutrition Survey" },
  { value: "NDMA", label: "NDMA", description: "National Disaster Management Authority" },
  { value: "PBS", label: "PBS", description: "Pakistan Bureau of Statistics" },
  { value: "Custom", label: "Custom", description: "Custom data source" },
];

// Form templates for different indicator types
const getFormTemplate = (indicatorType: string) => {
  switch (indicatorType) {
    case 'percentage':
      return {
        fields: ['overall', 'urban', 'rural'],
        helpText: 'Enter percentage values (e.g., 71.2 for 71.2%)'
      };
    case 'rate':
      return {
        fields: ['rate_per_100k'],
        helpText: 'Enter rate per 100,000 population'
      };
    case 'count':
      return {
        fields: ['total_count'],
        helpText: 'Enter absolute numbers'
      };
    case 'multi_dimensional':
      return {
        fields: ['overall', 'male', 'female', 'urban', 'rural'],
        helpText: 'Enter values for different demographic breakdowns'
      };
    case 'survey_based':
      return {
        fields: ['survey_value', 'confidence_interval'],
        helpText: 'Enter survey results with confidence intervals'
      };
    case 'budget':
      return {
        fields: ['total_budget', 'education_percent', 'health_percent', 'social_protection_percent'],
        helpText: 'Enter budget allocations and percentages'
      };
    default:
      return {
        fields: ['value'],
        helpText: 'Enter the indicator value'
      };
  }
};

export const SDGDataEntry = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);
  const [bulkImportData, setBulkImportData] = useState('');

  const form = useForm({
    resolver: zodResolver(indicatorValueSchema),
    defaultValues: {
      indicator_id: '',
      data_source_id: '',
      year: new Date().getFullYear(),
      value: '',
      value_numeric: 0,
      breakdown_data: {},
      baseline_indicator: false,
      progress_indicator: false,
      notes: '',
      reference_document: '',
      data_quality_score: 5,
      department_id: '',
      submitted_by: '',
    },
  });

  const { data: indicators = [] } = useQuery({
    queryKey: ['/api/sdg/indicators'],
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ['/api/sdg/data-sources'],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
  });

  const createValueMutation = useMutation({
    mutationFn: async (data: any) => {
      return await simpleApiClient.post('/api/sdg/indicator-values', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/indicator-values'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Data entry saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save data entry",
        variant: "destructive",
      });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (csvData: string) => {
      // Parse CSV and create multiple entries
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const entries = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
          entries.push({
            indicator_code: values[0],
            year: parseInt(values[1]),
            value: values[2],
            data_source: values[3],
            notes: values[4] || '',
            submitted_by: 'current-user-id', // Replace with actual user ID
          });
        }
      }

      // Process each entry
      for (const entry of entries) {
        const indicator = indicators.find((ind: any) => ind.indicator_code === entry.indicator_code);
        if (indicator) {
          await simpleApiClient.post('/api/sdg/indicator-values', {
            indicator_id: indicator.id,
            year: entry.year,
            value: entry.value,
            notes: entry.notes,
            submitted_by: entry.submitted_by,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/indicator-values'] });
      setBulkImportData('');
      toast({
        title: "Success",
        description: "Bulk import completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Bulk import failed",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const submissionData = {
      ...data,
      submitted_by: 'current-user-id', // Replace with actual user ID
      breakdown_data: selectedIndicator ? getBreakdownData() : null,
    };
    createValueMutation.mutate(submissionData);
  };

  const getBreakdownData = () => {
    if (!selectedIndicator) return null;
    
    const template = getFormTemplate(selectedIndicator.indicator_type);
    const breakdown: any = {};
    
    template.fields.forEach(field => {
      const value = (document.getElementById(field) as HTMLInputElement)?.value;
      if (value) {
        breakdown[field] = parseFloat(value) || value;
      }
    });
    
    return breakdown;
  };

  const handleIndicatorChange = (indicatorId: string) => {
    const indicator = indicators.find((ind: any) => ind.id === indicatorId);
    setSelectedIndicator(indicator);
    form.setValue('indicator_id', indicatorId);
  };

  const handleBulkImport = () => {
    if (bulkImportData.trim()) {
      bulkImportMutation.mutate(bulkImportData);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="single-entry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single-entry">Single Data Entry</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="single-entry" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    SDG Data Entry
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter data values for SDG indicators with appropriate validation
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Data Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Enter SDG Indicator Data</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="indicator_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SDG Indicator</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleIndicatorChange(value);
                                  }} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select indicator" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {indicators.map((indicator: any) => (
                                      <SelectItem key={indicator.id} value={indicator.id}>
                                        <div>
                                          <div className="font-medium">{indicator.indicator_code}</div>
                                          <div className="text-xs text-gray-500 truncate">
                                            {indicator.title}
                                          </div>
                                        </div>
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
                            name="year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="2000"
                                    max="2030"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {selectedIndicator && (
                          <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                {selectedIndicator.indicator_code}: {selectedIndicator.title}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{selectedIndicator.indicator_type}</Badge>
                                {selectedIndicator.unit && (
                                  <Badge variant="secondary">{selectedIndicator.unit}</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const template = getFormTemplate(selectedIndicator.indicator_type);
                                return (
                                  <div className="space-y-4">
                                    <p className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                                      {template.helpText}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                      {template.fields.map((field) => (
                                        <div key={field}>
                                          <label className="text-sm font-medium capitalize">
                                            {field.replace('_', ' ')}
                                          </label>
                                          <Input
                                            id={field}
                                            type="number"
                                            step="0.01"
                                            placeholder={`Enter ${field.replace('_', ' ')}`}
                                            className="mt-1"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="data_source_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Source</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select data source" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {dataSourceTypes.map((source) => (
                                      <SelectItem key={source.value} value={source.value}>
                                        <div>
                                          <div className="font-medium">{source.label}</div>
                                          <div className="text-xs text-gray-500">{source.description}</div>
                                        </div>
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
                            name="data_quality_score"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data Quality (1-5)</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  defaultValue={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="5">5 - Excellent</SelectItem>
                                    <SelectItem value="4">4 - Good</SelectItem>
                                    <SelectItem value="3">3 - Fair</SelectItem>
                                    <SelectItem value="2">2 - Poor</SelectItem>
                                    <SelectItem value="1">1 - Very Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Add any relevant notes, methodology details, or data limitations..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reference_document"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reference Document</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., PDHS 2017-18, MICS 2019-20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createValueMutation.isPending}>
                            {createValueMutation.isPending ? 'Saving...' : 'Save Data Entry'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Data Entry</h3>
                <p className="text-gray-600 mb-4">
                  Use the form above to enter values for SDG indicators with proper validation and tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Data Import
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Import multiple data entries from CSV format for faster data loading
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Your CSV should have the following columns:
                </p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                  indicator_code,year,value,data_source,notes
                </code>
                <p className="text-xs text-blue-600 mt-2">
                  Example: 1.2.2,2018,71.2,PDHS,"Baseline data from demographic survey"
                </p>
              </div>

              <Textarea
                placeholder="Paste CSV data here or type directly..."
                value={bulkImportData}
                onChange={(e) => setBulkImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBulkImportData('')}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={!bulkImportData.trim() || bulkImportMutation.isPending}
                >
                  {bulkImportMutation.isPending ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};