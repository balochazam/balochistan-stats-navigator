import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// SDG Goals data with colors matching the UN design
const sdgGoals = [
  { id: 1, title: "No Poverty", color: "#e5243b", progress: 85 },
  { id: 2, title: "Zero Hunger", color: "#dda63a", progress: 72 },
  { id: 3, title: "Good Health and Well-being", color: "#4c9f38", progress: 68 },
  { id: 4, title: "Quality Education", color: "#c5192d", progress: 91 },
  { id: 5, title: "Gender Equality", color: "#ff3a21", progress: 54 },
  { id: 6, title: "Clean Water and Sanitation", color: "#26bde2", progress: 45 },
  { id: 7, title: "Affordable and Clean Energy", color: "#fcc30b", progress: 78 },
  { id: 8, title: "Decent Work and Economic Growth", color: "#a21942", progress: 63 },
  { id: 9, title: "Industry, Innovation and Infrastructure", color: "#fd6925", progress: 82 },
  { id: 10, title: "Reduced Inequalities", color: "#dd1367", progress: 58 },
  { id: 11, title: "Sustainable Cities and Communities", color: "#fd9d24", progress: 76 },
  { id: 12, title: "Responsible Consumption and Production", color: "#bf8b2e", progress: 42 },
  { id: 13, title: "Climate Action", color: "#3f7e44", progress: 89 },
  { id: 14, title: "Life Below Water", color: "#0a97d9", progress: 37 },
  { id: 15, title: "Life on Land", color: "#56c02b", progress: 71 },
  { id: 16, title: "Peace, Justice and Strong Institutions", color: "#00689d", progress: 64 },
  { id: 17, title: "Partnerships for the Goals", color: "#19486a", progress: 83 },
];

interface SDGIndicator {
  id: string;
  sdg_goal: number;
  indicator_code: string;
  indicator_name: string;
  current_value: number;
  target_value: number;
  unit: string;
  last_updated: string;
  department_id: string;
}

export const SDGDashboard = () => {
  const { profile } = useAuth();
  const [indicators, setIndicators] = useState<SDGIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use static data until we implement the backend
    setLoading(false);
  }, []);

  const chartData = sdgGoals.map(goal => ({
    name: `SDG ${goal.id}`,
    progress: goal.progress,
    fill: goal.color
  }));

  const overallProgress = Math.round(sdgGoals.reduce((acc, goal) => acc + goal.progress, 0) / sdgGoals.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SDG Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Sustainable Development Goals Progress in Balochistan
            </p>
          </div>
          <Badge variant="outline" className="text-lg py-2 px-4">
            <Target className="h-5 w-5 mr-2" />
            Overall Progress: {overallProgress}%
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total SDGs</p>
                  <p className="text-2xl font-bold">17</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On Track</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Need Attention</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-2xl font-bold">Dec 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>SDG Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Progress']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar 
                    dataKey="progress" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SDG Goals Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Sustainable Development Goals</CardTitle>
            <p className="text-sm text-gray-600">
              Click on any goal to view detailed indicators and progress
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {sdgGoals.map((goal) => (
                <Card 
                  key={goal.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2"
                  style={{ borderColor: goal.color }}
                >
                  <CardContent className="p-4 text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: goal.color }}
                    >
                      {goal.id}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 leading-tight">
                      {goal.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${goal.progress}%`,
                            backgroundColor: goal.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {goal.progress}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};