import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, Target, Calendar, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const SDGProgressTracker = () => {
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('5years');

  const { data: goals = [] } = useQuery({
    queryKey: ['/api/sdg/goals'],
  });

  const { data: indicators = [] } = useQuery({
    queryKey: ['/api/sdg/indicators'],
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ['/api/sdg/progress-calculations', selectedGoal !== 'all' ? parseInt(selectedGoal) : undefined],
  });

  // Mock data for visualization - replace with real data from your API
  const mockProgressData = [
    { year: 2015, sdg1: 71, sdg2: 45, sdg3: 52, sdg4: 78, sdg5: 42 },
    { year: 2016, sdg1: 68, sdg2: 48, sdg3: 55, sdg4: 80, sdg5: 45 },
    { year: 2017, sdg1: 65, sdg2: 52, sdg3: 58, sdg4: 83, sdg5: 48 },
    { year: 2018, sdg1: 62, sdg2: 55, sdg3: 62, sdg4: 85, sdg5: 51 },
    { year: 2019, sdg1: 58, sdg2: 58, sdg3: 65, sdg4: 88, sdg5: 54 },
    { year: 2020, sdg1: 55, sdg2: 62, sdg3: 68, sdg4: 90, sdg5: 57 },
    { year: 2021, sdg1: 52, sdg2: 65, sdg3: 71, sdg4: 92, sdg5: 60 },
  ];

  const mockIndicatorProgress = [
    { 
      id: '1', 
      code: '1.2.2', 
      title: 'Proportion living in poverty', 
      current: 52, 
      baseline: 71, 
      trend: 'improving',
      lastUpdated: '2021',
      dataPoints: 15
    },
    { 
      id: '2', 
      code: '2.2.1', 
      title: 'Prevalence of stunting', 
      current: 47, 
      baseline: 32, 
      trend: 'declining',
      lastUpdated: '2020',
      dataPoints: 8
    },
    { 
      id: '3', 
      code: '3.1.2', 
      title: 'Births attended by skilled personnel', 
      current: 52, 
      baseline: 38, 
      trend: 'improving',
      lastUpdated: '2021',
      dataPoints: 12
    },
    { 
      id: '4', 
      code: '4.1.1', 
      title: 'Primary education completion rate', 
      current: 92, 
      baseline: 78, 
      trend: 'improving',
      lastUpdated: '2021',
      dataPoints: 18
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateProgress = (current: number, baseline: number, isReverse = false) => {
    if (isReverse) {
      // For indicators where lower is better (like poverty rate)
      return Math.max(0, Math.min(100, ((baseline - current) / baseline) * 100));
    } else {
      // For indicators where higher is better
      return Math.max(0, Math.min(100, (current / baseline) * 100));
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SDG Progress Tracking
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monitor progress trends and data quality across SDG indicators
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SDG Goals</SelectItem>
                  {goals.map((goal: any) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      SDG {goal.id}: {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2years">2 Years</SelectItem>
                  <SelectItem value="5years">5 Years</SelectItem>
                  <SelectItem value="10years">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Trends Over Time</CardTitle>
          <p className="text-sm text-gray-600">
            Tracking progress across multiple SDG indicators
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                <Line 
                  type="monotone" 
                  dataKey="sdg1" 
                  stroke="#e5243b" 
                  strokeWidth={2}
                  name="SDG 1 (No Poverty)"
                />
                <Line 
                  type="monotone" 
                  dataKey="sdg2" 
                  stroke="#dda63a" 
                  strokeWidth={2}
                  name="SDG 2 (Zero Hunger)"
                />
                <Line 
                  type="monotone" 
                  dataKey="sdg3" 
                  stroke="#4c9f38" 
                  strokeWidth={2}
                  name="SDG 3 (Health)"
                />
                <Line 
                  type="monotone" 
                  dataKey="sdg4" 
                  stroke="#c5192d" 
                  strokeWidth={2}
                  name="SDG 4 (Education)"
                />
                <Line 
                  type="monotone" 
                  dataKey="sdg5" 
                  stroke="#ff3a21" 
                  strokeWidth={2}
                  name="SDG 5 (Gender)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Indicator Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Indicator Progress Details</CardTitle>
          <p className="text-sm text-gray-600">
            Individual progress tracking for each SDG indicator
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockIndicatorProgress.map((indicator) => {
              const progress = calculateProgress(
                indicator.current, 
                indicator.baseline, 
                indicator.code.startsWith('1.') || indicator.code.startsWith('2.2') // Reverse for poverty/malnutrition
              );
              
              return (
                <Card key={indicator.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {indicator.code}
                          </Badge>
                          <Badge className={`${getTrendColor(indicator.trend)} border`}>
                            {getTrendIcon(indicator.trend)}
                            <span className="ml-1 capitalize">{indicator.trend}</span>
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {indicator.title}
                        </h3>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>Baseline: {indicator.baseline}%</span>
                          <span>Current: {indicator.current}%</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Updated: {indicator.lastUpdated}
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-4 w-4" />
                            {indicator.dataPoints} data points
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {Math.round(progress)}%
                        </div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress toward improvement</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div className="text-sm text-gray-600">Data Coverage</div>
              <p className="text-xs text-gray-500 mt-1">
                Indicators with recent data
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.2</div>
              <div className="text-sm text-gray-600">Avg Quality Score</div>
              <p className="text-xs text-gray-500 mt-1">
                Out of 5.0 maximum
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
              <div className="text-sm text-gray-600">On Track</div>
              <p className="text-xs text-gray-500 mt-1">
                Indicators showing improvement
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};