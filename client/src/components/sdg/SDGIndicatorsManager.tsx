import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Plus, Database, Search, Filter, Target } from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';
import { z } from 'zod';

const indicatorSchema = z.object({
  sdg_goal_id: z.string().min(1, "Goal is required"),
  sdg_target_id: z.string().min(1, "Target is required"),
  indicator_code: z.string().min(1, "Indicator code is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  indicator_type: z.enum(["percentage", "rate", "count", "budget", "multi_dimensional", "survey_based"]),
  unit: z.string().optional(),
  methodology: z.string().optional(),
  data_collection_frequency: z.string().optional(),
  responsible_departments: z.array(z.string()).default([]),
  created_by: z.string(),
});

const indicatorTypes = [
  { value: "percentage", label: "Percentage", description: "Values expressed as percentages (e.g., 71.2%)" },
  { value: "rate", label: "Rate", description: "Rates per population (e.g., per 100,000 people)" },
  { value: "count", label: "Count", description: "Absolute numbers (e.g., deaths, incidents)" },
  { value: "budget", label: "Budget/Financial", description: "Financial allocations and spending" },
  { value: "multi_dimensional", label: "Multi-dimensional", description: "Complex indicators with multiple breakdowns" },
  { value: "survey_based", label: "Survey-based", description: "Data from MICS, PDHS, PSLM surveys" },
];

export const SDGIndicatorsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const form = useForm({
    resolver: zodResolver(indicatorSchema),
    defaultValues: {
      sdg_goal_id: '',
      sdg_target_id: '',
      indicator_code: '',
      title: '',
      description: '',
      indicator_type: 'percentage' as const,
      unit: '',
      methodology: '',
      data_collection_frequency: '',
      responsible_departments: [],
      created_by: '',
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['/api/sdg/goals'],
  });

  const { data: targets = [] } = useQuery({
    queryKey: ['/api/sdg/targets'],
  });

  const { data: indicators = [], isLoading } = useQuery({
    queryKey: ['/api/sdg/indicators'],
    retry: false,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
  });

  const createIndicatorMutation = useMutation({
    mutationFn: async (data: any) => {
      return await simpleApiClient.post('/api/sdg/indicators', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/indicators'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "SDG indicator created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create SDG indicator",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Add current user ID (you'll need to get this from auth context)
    const submissionData = {
      ...data,
      created_by: 'current-user-id', // Replace with actual user ID
    };
    createIndicatorMutation.mutate(submissionData);
  };

  const filteredIndicators = Array.isArray(indicators) ? indicators.filter((indicator: any) => {
    const matchesSearch = indicator.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.indicator_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || indicator.indicator_type === filterType;
    return matchesSearch && matchesType;
  }) : [];

  const getGoalById = (targetId: string) => {
    const targetsArray = Array.isArray(targets) ? targets : [];
    const goalsArray = Array.isArray(goals) ? goals : [];
    const target = targetsArray.find((t: any) => t.id === targetId);
    if (!target) return null;
    return goalsArray.find((g: any) => g.id === target.sdg_goal_id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading SDG indicators...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                SDG Indicators Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage specific measurable indicators for SDG tracking
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Indicator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create SDG Indicator</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* SDG Goal and Target Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sdg_goal_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SDG Goal</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              // Reset target when goal changes
                              form.setValue('sdg_target_id', '');
                            }} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select SDG Goal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(goals) && goals.map((goal: any) => (
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
                        render={({ field }) => {
                          const selectedGoalId = form.watch('sdg_goal_id');
                          const targetsArray = Array.isArray(targets) ? targets : [];
                          const availableTargets = targetsArray.filter((target: any) => 
                            target.sdg_goal_id === parseInt(selectedGoalId || '0')
                          );
                          
                          return (
                            <FormItem>
                              <FormLabel>SDG Target</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!selectedGoalId}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      selectedGoalId 
                                        ? "Select Target" 
                                        : "First select a Goal"
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
                          );
                        }}
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {indicatorTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div>
                                      <div className="font-medium">{type.label}</div>
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
                            <FormLabel>Unit</FormLabel>
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

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createIndicatorMutation.isPending}>
                        {createIndicatorMutation.isPending ? 'Creating...' : 'Create Indicator'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search indicators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {indicatorTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Indicators List */}
          {filteredIndicators.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading SDG Indicators</h3>
              <p className="text-gray-600 mb-4">
                {isLoading ? "Loading 14 authentic SDG indicators with Balochistan data..." : "No indicators found. Please refresh or check your connection."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIndicators.map((indicator: any) => {
                const goal = getGoalById(indicator.sdg_target_id);
                return (
                  <Card key={indicator.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono">
                              {indicator.indicator_code}
                            </Badge>
                            <Badge 
                              variant="secondary"
                              style={{ 
                                backgroundColor: goal?.color || '#gray',
                                color: 'white'
                              }}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              SDG {goal?.id}
                            </Badge>
                            <Badge variant="outline">
                              {indicatorTypes.find(t => t.value === indicator.indicator_type)?.label}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {indicator.title}
                          </h3>
                          {indicator.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {indicator.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {indicator.unit && (
                              <span>Unit: {indicator.unit}</span>
                            )}
                            {indicator.data_collection_frequency && (
                              <span>Frequency: {indicator.data_collection_frequency}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            View Data
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};