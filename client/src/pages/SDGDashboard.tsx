import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Calendar, Database, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Official UN SDG colors and default data for when API is not available
const defaultSDGData = [
  { id: 1, title: "No Poverty", progress: 52, color: "#e5243b", target: 71 },
  { id: 2, title: "Zero Hunger", progress: 65, color: "#dda63a", target: 32 },
  { id: 3, title: "Good Health", progress: 71, color: "#4c9f38", target: 38 },
  { id: 4, title: "Quality Education", progress: 92, color: "#c5192d", target: 78 },
  { id: 5, title: "Gender Equality", progress: 60, color: "#ff3a21", target: 45 },
  { id: 6, title: "Clean Water", progress: 78, color: "#26bde2", target: 62 },
  { id: 7, title: "Clean Energy", progress: 45, color: "#fcc30b", target: 28 },
  { id: 8, title: "Economic Growth", progress: 67, color: "#a21942", target: 52 },
  { id: 9, title: "Innovation", progress: 73, color: "#fd6925", target: 38 },
  { id: 10, title: "Reduced Inequalities", progress: 58, color: "#dd1367", target: 42 },
  { id: 11, title: "Sustainable Cities", progress: 54, color: "#fd9d24", target: 35 },
  { id: 12, title: "Responsible Consumption", progress: 61, color: "#bf8b2e", target: 48 },
  { id: 13, title: "Climate Action", progress: 42, color: "#3f7e44", target: 25 },
  { id: 14, title: "Life Below Water", progress: 48, color: "#0a97d9", target: 31 },
  { id: 15, title: "Life on Land", progress: 55, color: "#56c02b", target: 38 },
  { id: 16, title: "Peace & Justice", progress: 63, color: "#00689d", target: 45 },
  { id: 17, title: "Partnerships", progress: 71, color: "#19486a", target: 58 },
];

export const SDGDashboard = () => {
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['/api/sdg/goals'],
    retry: 1,
  });

  const { data: progressCalculations = [] } = useQuery({
    queryKey: ['/api/sdg/progress-calculations'],
    retry: 1,
  });

  // Use API data if available, otherwise fall back to default data
  const sdgData = goals.length > 0 ? goals.map((goal: any) => {
    const calculation = progressCalculations.find((calc: any) => calc.sdg_goal_id === goal.id);
    const defaultGoal = defaultSDGData.find(d => d.id === goal.id);
    
    return {
      ...goal,
      progress: calculation?.progress_percentage || defaultGoal?.progress || 0,
      target: calculation?.target_value || defaultGoal?.target || 100,
    };
  }) : defaultSDGData;

  const avgProgress = Math.round(sdgData.reduce((acc, sdg) => acc + sdg.progress, 0) / sdgData.length);
  const onTrackCount = sdgData.filter(sdg => sdg.progress >= (sdg.target * 0.7)).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SDG Dashboard</h1>
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
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdgData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="id" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `SDG ${value}`}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
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
                    fill={(entry: any) => entry.color}
                    stroke="#fff"
                    strokeWidth={1}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SDG Goals Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Individual SDG Progress
            </CardTitle>
            <p className="text-sm text-gray-600">
              Detailed view of each Sustainable Development Goal
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};