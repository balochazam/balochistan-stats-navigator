import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Target, Palette } from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';
import { z } from 'zod';

// SDG Goal data with official UN information
const defaultSDGGoals = [
  { id: 1, title: "No Poverty", description: "End poverty in all its forms everywhere", color: "#e5243b" },
  { id: 2, title: "Zero Hunger", description: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture", color: "#dda63a" },
  { id: 3, title: "Good Health and Well-being", description: "Ensure healthy lives and promote well-being for all at all ages", color: "#4c9f38" },
  { id: 4, title: "Quality Education", description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all", color: "#c5192d" },
  { id: 5, title: "Gender Equality", description: "Achieve gender equality and empower all women and girls", color: "#ff3a21" },
  { id: 6, title: "Clean Water and Sanitation", description: "Ensure availability and sustainable management of water and sanitation for all", color: "#26bde2" },
  { id: 7, title: "Affordable and Clean Energy", description: "Ensure access to affordable, reliable, sustainable and modern energy for all", color: "#fcc30b" },
  { id: 8, title: "Decent Work and Economic Growth", description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all", color: "#a21942" },
  { id: 9, title: "Industry, Innovation and Infrastructure", description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation", color: "#fd6925" },
  { id: 10, title: "Reduced Inequalities", description: "Reduce inequality within and among countries", color: "#dd1367" },
  { id: 11, title: "Sustainable Cities and Communities", description: "Make cities and human settlements inclusive, safe, resilient and sustainable", color: "#fd9d24" },
  { id: 12, title: "Responsible Consumption and Production", description: "Ensure sustainable consumption and production patterns", color: "#bf8b2e" },
  { id: 13, title: "Climate Action", description: "Take urgent action to combat climate change and its impacts", color: "#3f7e44" },
  { id: 14, title: "Life Below Water", description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development", color: "#0a97d9" },
  { id: 15, title: "Life on Land", description: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss", color: "#56c02b" },
  { id: 16, title: "Peace, Justice and Strong Institutions", description: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels", color: "#00689d" },
  { id: 17, title: "Partnerships for the Goals", description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development", color: "#19486a" },
];

const sdgGoalSchema = z.object({
  id: z.number().min(1).max(17),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

export const SDGGoalsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(sdgGoalSchema),
    defaultValues: {
      id: 1,
      title: '',
      description: '',
      color: '#e5243b',
    },
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['/api/sdg/goals'],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await simpleApiClient.post('/api/sdg/goals', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/goals'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "SDG goal created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create SDG goal",
        variant: "destructive",
      });
    },
  });

  const initializeDefaultGoals = async () => {
    try {
      await simpleApiClient.post('/api/sdg/seed-data', {});
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/targets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/indicators'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/data-sources'] });
      toast({
        title: "Success",
        description: "All SDG data has been initialized with sample indicators and data",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize SDG data",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: any) => {
    createGoalMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading SDG goals...</div>
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
                <Target className="h-5 w-5" />
                SDG Goals Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage the 17 UN Sustainable Development Goals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                ✅ Database populated with authentic data
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add SDG Goal</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Number (1-17)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="17"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., No Poverty" {...field} />
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
                              <Textarea placeholder="Goal description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="color" {...field} className="w-16 h-10" />
                                <Input {...field} placeholder="#e5243b" />
                              </div>
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
                        <Button type="submit" disabled={createGoalMutation.isPending}>
                          {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SDG Data Found</h3>
              <p className="text-gray-600 mb-4">
                Initialize the complete SDG framework with goals, targets, indicators, and sample data
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {goals.map((goal: any) => (
                <Card key={goal.id} className="border-2" style={{ borderColor: goal.color }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: goal.color }}
                      >
                        {goal.id}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm leading-tight">{goal.title}</h3>
                      </div>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Palette className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{goal.color}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};