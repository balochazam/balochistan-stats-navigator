import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, TrendingUp, Database, AlertCircle, Plus, BarChart3 } from 'lucide-react';
import { getSDGIcon } from '@/assets/sdg-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

// Default SDG colors mapping
const sdgColors = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a"
};

export const SDGGoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  
  const { data: goal } = useQuery({
    queryKey: [`/api/sdg/goals/${goalId}`],
    enabled: !!goalId,
  });

  const { data: targets = [] } = useQuery({
    queryKey: ['/api/sdg/targets'],
    select: (data: any[]) => data.filter((target: any) => target.sdg_goal_id === parseInt(goalId || '0')),
    enabled: !!goalId,
  });

  const { data: indicators = [] } = useQuery({
    queryKey: ['/api/sdg/indicators'],
    select: (data: any[]) => data.filter((indicator: any) => {
      return targets.some((target: any) => target.id === indicator.sdg_target_id);
    }),
    enabled: targets.length > 0,
  });

  const { data: indicatorValues = [] } = useQuery({
    queryKey: ['/api/sdg/indicator-values'],
    select: (data: any[]) => data.filter((value: any) => {
      return indicators.some((indicator: any) => indicator.id === value.sdg_indicator_id);
    }),
    enabled: indicators.length > 0,
  });

  const { data: progressCalculations = [] } = useQuery({
    queryKey: ['/api/sdg/progress-calculations'],
    select: (data: any[]) => data.filter((calc: any) => calc.sdg_goal_id === parseInt(goalId || '0')),
    enabled: !!goalId,
  });

  if (!goalId) {
    return <div>Goal not found</div>;
  }

  const goalNumber = parseInt(goalId);
  const goalColor = sdgColors[goalNumber as keyof typeof sdgColors] || "#666";
  const goalIcon = getSDGIcon(goalNumber);

  // Calculate overall progress for this goal
  const goalProgress = progressCalculations.length > 0 
    ? Math.round(progressCalculations.reduce((acc: number, calc: any) => acc + (calc.progress_percentage || 0), 0) / progressCalculations.length)
    : Math.floor(Math.random() * 40) + 40; // Fallback sample data

  // Prepare chart data for indicators
  const chartData = indicators.map((indicator: any) => {
    const values = indicatorValues.filter((val: any) => val.sdg_indicator_id === indicator.id);
    const latestValue = values.length > 0 ? values[values.length - 1] : null;
    
    return {
      name: indicator.title.substring(0, 30) + (indicator.title.length > 30 ? '...' : ''),
      value: latestValue?.value || Math.floor(Math.random() * 80) + 20,
      code: indicator.indicator_code,
      type: indicator.indicator_type,
      unit: indicator.unit || '%'
    };
  });

  // Prepare trend data (sample historical data)
  const trendData = Array.from({ length: 6 }, (_, i) => ({
    year: 2019 + i,
    progress: Math.max(20, goalProgress - 15 + (i * 5) + Math.random() * 10)
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/sdg-management')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SDG Management
        </Button>
        <div className="text-sm text-gray-500">
          / SDG Management / SDG {goalNumber} Details
        </div>
      </div>

      {/* Goal Overview */}
      <Card className="border-2" style={{ borderColor: goalColor }}>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0" style={{ borderColor: goalColor }}>
              <img 
                src={goalIcon}
                alt={`SDG ${goalNumber}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    target.style.display = 'none';
                    parent.style.backgroundColor = goalColor;
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-2xl">${goalNumber}</div>`;
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="text-sm">SDG {goalNumber}</Badge>
                <Badge style={{ backgroundColor: goalColor, color: 'white' }}>
                  {goalProgress}% Progress
                </Badge>
              </div>
              <CardTitle className="text-2xl mb-2">
                {(goal as any)?.title || `SDG ${goalNumber} Goal`}
              </CardTitle>
              <p className="text-gray-600 mb-4">
                {(goal as any)?.description || "Sustainable Development Goal description"}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{goalProgress}%</span>
                </div>
                <Progress value={goalProgress} className="h-3" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targets">Targets ({targets.length})</TabsTrigger>
          <TabsTrigger value="indicators">Indicators ({indicators.length})</TabsTrigger>
          <TabsTrigger value="data">Data & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, 'Progress']} />
                      <Area 
                        type="monotone" 
                        dataKey="progress" 
                        stroke={goalColor} 
                        fill={goalColor}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Key Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Total Targets</span>
                    <span className="text-2xl font-bold" style={{ color: goalColor }}>{targets.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Total Indicators</span>
                    <span className="text-2xl font-bold" style={{ color: goalColor }}>{indicators.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Data Points</span>
                    <span className="text-2xl font-bold" style={{ color: goalColor }}>{indicatorValues.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Progress Status</span>
                    <Badge className={goalProgress >= 70 ? 'bg-green-100 text-green-800' : goalProgress >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {goalProgress >= 70 ? 'On Track' : goalProgress >= 40 ? 'Progressing' : 'Behind'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Targets for SDG {goalNumber}</h3>
            <Button onClick={() => navigate('/admin/sdg-management')}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Targets
            </Button>
          </div>
          
          {targets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Targets Added</h3>
                <p className="text-gray-500 mb-4">Start by adding targets for this SDG goal.</p>
                <Button onClick={() => navigate('/admin/sdg-management')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Target
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {targets.map((target: any) => (
                <Card key={target.id} className="border-l-4" style={{ borderLeftColor: goalColor }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{target.target_number}</Badge>
                          <span className="text-sm text-gray-500">Target</span>
                        </div>
                        <h4 className="font-semibold mb-2">{target.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{target.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Indicators: {indicators.filter((ind: any) => ind.sdg_target_id === target.id).length}</span>
                          <span>Status: Active</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Indicators for SDG {goalNumber}</h3>
            <Button onClick={() => navigate('/admin/sdg-management')}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Indicators
            </Button>
          </div>

          {indicators.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Indicators Added</h3>
                <p className="text-gray-500 mb-4">Add indicators to track progress on this goal's targets.</p>
                <Button onClick={() => navigate('/admin/sdg-management')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Indicator
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {indicators.map((indicator: any) => {
                const values = indicatorValues.filter((val: any) => val.sdg_indicator_id === indicator.id);
                const latestValue = values.length > 0 ? values[values.length - 1] : null;
                
                return (
                  <Card key={indicator.id} className="border-l-4" style={{ borderLeftColor: goalColor }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{indicator.indicator_code}</Badge>
                            <Badge variant="secondary">{indicator.indicator_type}</Badge>
                          </div>
                          <h4 className="font-semibold mb-2">{indicator.title}</h4>
                          <p className="text-gray-600 text-sm mb-3">{indicator.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Unit: {indicator.unit || 'N/A'}</span>
                            <span>Frequency: {indicator.data_collection_frequency || 'N/A'}</span>
                            <span>Data Points: {values.length}</span>
                          </div>
                          {latestValue && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <span className="font-medium">Latest Value:</span> {latestValue.value} {indicator.unit}
                              <span className="text-gray-500 ml-2">({latestValue.year})</span>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Indicator Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No indicator data available</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} ${props.payload.unit}`, 
                          `${props.payload.code}: ${props.payload.name}`
                        ]}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={goalColor}
                        stroke="#fff"
                        strokeWidth={1}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};