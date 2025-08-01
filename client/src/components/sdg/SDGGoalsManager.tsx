import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit2, Target, TrendingUp, Database, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { simpleApiClient } from '@/lib/simpleApi';
import { z } from 'zod';

// SDG Dashboard data with progress tracking
const defaultSDGData = [
  { id: 1, title: "No Poverty", progress: 52, color: "#e5243b", target: 71, description: "End poverty in all its forms everywhere" },
  { id: 2, title: "Zero Hunger", progress: 65, color: "#dda63a", target: 32, description: "End hunger, achieve food security and improved nutrition" },
  { id: 3, title: "Good Health", progress: 71, color: "#4c9f38", target: 38, description: "Ensure healthy lives and promote well-being for all at all ages" },
  { id: 4, title: "Quality Education", progress: 92, color: "#c5192d", target: 78, description: "Ensure inclusive and equitable quality education" },
  { id: 5, title: "Gender Equality", progress: 60, color: "#ff3a21", target: 45, description: "Achieve gender equality and empower all women and girls" },
  { id: 6, title: "Clean Water", progress: 78, color: "#26bde2", target: 62, description: "Ensure availability and sustainable management of water" },
  { id: 7, title: "Clean Energy", progress: 45, color: "#fcc30b", target: 28, description: "Ensure access to affordable, reliable, sustainable energy" },
  { id: 8, title: "Economic Growth", progress: 67, color: "#a21942", target: 52, description: "Promote sustained, inclusive economic growth" },
  { id: 9, title: "Innovation", progress: 73, color: "#fd6925", target: 38, description: "Build resilient infrastructure, promote innovation" },
  { id: 10, title: "Reduced Inequalities", progress: 58, color: "#dd1367", target: 42, description: "Reduce inequality within and among countries" },
  { id: 11, title: "Sustainable Cities", progress: 54, color: "#fd9d24", target: 35, description: "Make cities and human settlements sustainable" },
  { id: 12, title: "Responsible Consumption", progress: 61, color: "#bf8b2e", target: 48, description: "Ensure sustainable consumption and production patterns" },
  { id: 13, title: "Climate Action", progress: 42, color: "#3f7e44", target: 25, description: "Take urgent action to combat climate change" },
  { id: 14, title: "Life Below Water", progress: 48, color: "#0a97d9", target: 31, description: "Conserve and sustainably use marine resources" },
  { id: 15, title: "Life on Land", progress: 55, color: "#56c02b", target: 38, description: "Protect and restore terrestrial ecosystems" },
  { id: 16, title: "Peace & Justice", progress: 63, color: "#00689d", target: 45, description: "Promote peaceful and inclusive societies" },
  { id: 17, title: "Partnerships", progress: 71, color: "#19486a", target: 58, description: "Strengthen means of implementation and partnerships" },
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

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['/api/sdg/goals'],
    retry: 1,
  });

  const { data: progressCalculations = [] } = useQuery({
    queryKey: ['/api/sdg/progress-calculations'],
    retry: 1,
  });

  // Use API data if available, otherwise fall back to default data
  const goalsArray = Array.isArray(goals) ? goals : [];
  const progressArray = Array.isArray(progressCalculations) ? progressCalculations : [];
  
  const sdgData = goalsArray.length > 0 ? goalsArray.map((goal: any) => {
    const calculation = progressArray.find((calc: any) => calc.sdg_goal_id === goal.id);
    const defaultGoal = defaultSDGData.find(d => d.id === goal.id);
    
    return {
      ...goal,
      progress: calculation?.progress_percentage || defaultGoal?.progress || 0,
      target: calculation?.target_value || defaultGoal?.target || 100,
    };
  }) : defaultSDGData;

  const avgProgress = Math.round(sdgData.reduce((acc: number, sdg: any) => acc + sdg.progress, 0) / sdgData.length);
  const onTrackCount = sdgData.filter((sdg: any) => sdg.progress >= (sdg.target * 0.7)).length;

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

  const updateGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await simpleApiClient.put(`/api/sdg/goals/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sdg/goals'] });
      setIsDialogOpen(false);
      form.reset();
      setEditingGoal(null);
      toast({
        title: "Success",
        description: "SDG goal updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update SDG goal",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    form.reset({
      id: goal.id,
      title: goal.title,
      description: goal.description || '',
      color: goal.color,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    if (editingGoal) {
      updateGoalMutation.mutate(data);
    } else {
      createGoalMutation.mutate(data);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SDG Goals & Targets</h1>
          <p className="text-gray-600 mt-1">
            Sustainable Development Goals progress tracking for Balochistan
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <Badge variant="destructive" className="py-2 px-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              API Unavailable
            </Badge>
          )}
          <Badge variant="outline" className="text-lg py-2 px-4">
            <Target className="h-5 w-5 mr-2" />
            17 Goals Active
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingGoal(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Manage Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? 'Edit SDG Goal' : 'Add New SDG Goal'}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SDG Number (1-17)</FormLabel>
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
                          <Input {...field} />
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
                          <Textarea {...field} />
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
                    <Button type="submit" disabled={createGoalMutation.isPending || updateGoalMutation.isPending}>
                      {createGoalMutation.isPending || updateGoalMutation.isPending 
                        ? 'Saving...' 
                        : editingGoal ? 'Update Goal' : 'Create Goal'
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">17</div>
              <div className="text-sm text-gray-600">Total SDGs</div>
              <p className="text-xs text-gray-500 mt-1">UN Goals</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{onTrackCount}</div>
              <div className="text-sm text-gray-600">On Track</div>
              <p className="text-xs text-gray-500 mt-1">Making progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{avgProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
              <p className="text-xs text-gray-500 mt-1">Overall completion</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2030</div>
              <div className="text-sm text-gray-600">Target Year</div>
              <p className="text-xs text-gray-500 mt-1">UN deadline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SDG Progress Overview
          </CardTitle>
          <p className="text-sm text-gray-600">
            Current progress across all 17 Sustainable Development Goals
            {error && " (using default data - API unavailable)"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdgData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="id" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}`}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}%`, 
                      `SDG ${props.payload.id}: ${props.payload.title}`
                    ]}
                    labelFormatter={(label) => `SDG ${label}`}
                  />
                  <Bar 
                    dataKey="progress" 
                    stroke="#fff"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                  >
                    {sdgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* SDG Icons Legend */}
            <div className="grid grid-cols-17 gap-1 px-4">
              {sdgData.map((sdg) => (
                <div key={sdg.id} className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center text-white text-xs font-bold mb-1"
                    style={{ backgroundColor: sdg.color }}
                    title={`SDG ${sdg.id}: ${sdg.title}`}
                  >
                    {sdg.id}
                  </div>
                  <div className="text-xs text-gray-600 text-center leading-tight">
                    {sdg.title.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 text-right">
              Reporting matters 2021 | 17
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDG Goals Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Individual SDG Progress & Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Detailed view and management of each Sustainable Development Goal
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading SDG data...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sdgData.map((sdg: any) => (
                <Card key={sdg.id} className="border-2" style={{ borderColor: sdg.color }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: sdg.color }}
                      >
                        {sdg.id}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm leading-tight">{sdg.title}</h3>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(sdg)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{sdg.progress}%</span>
                      </div>
                      <Progress value={sdg.progress} className="h-2" />
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Target: {sdg.target}%</span>
                        <span className={sdg.progress >= sdg.target ? 'text-green-600' : 'text-orange-600'}>
                          {sdg.progress >= sdg.target ? '✓ Achieved' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {sdg.description}
                    </p>
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