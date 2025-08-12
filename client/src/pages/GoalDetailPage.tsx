import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Target, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface Goal {
  id: number;
  title: string;
  description: string;
  color_primary: string;
  color_secondary: string;
  progress?: number;
}

interface Target {
  id: string;
  goal_id: number;
  target_number: string;
  title: string;
  description: string;
}

interface Indicator {
  id: string;
  target_id: string;
  indicator_code: string;
  title: string;
  description: string;
  tier: string;
  custodian_agencies: string[];
  methodology_url?: string;
  data_sources?: string[];
  progress?: number;
  has_data: boolean;
}

interface IndicatorWithTarget extends Indicator {
  target: Target;
}

export default function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const goalNumber = parseInt(goalId || '1');

  // Fetch goal details
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/sdg/goals-with-progress'],
  });

  const goal = goals.find(g => g.id === goalNumber);

  // Fetch targets for this goal
  const { data: targets = [] } = useQuery<Target[]>({
    queryKey: ['/api/sdg/targets'],
  });

  const goalTargets = targets.filter(t => t.goal_id === goalNumber);

  // Fetch indicators for this goal
  const { data: indicators = [] } = useQuery<Indicator[]>({
    queryKey: ['/api/sdg/indicators'],
  });

  // Get indicators with their targets
  const goalIndicators: IndicatorWithTarget[] = indicators
    .filter(indicator => {
      const target = targets.find(t => t.id === indicator.target_id);
      return target?.goal_id === goalNumber;
    })
    .map(indicator => ({
      ...indicator,
      target: targets.find(t => t.id === indicator.target_id)!
    }))
    .sort((a, b) => a.indicator_code.localeCompare(b.indicator_code));

  // Calculate real dynamic statistics from actual Balochistan data
  const totalIndicators = goalIndicators.length;
  const indicatorsWithData = goalIndicators.filter(i => i.has_data).length;
  const indicatorsInProgress = goalIndicators.filter(i => i.has_data && (i.progress || 0) > 0 && (i.progress || 0) < 100).length;
  const indicatorsCompleted = goalIndicators.filter(i => (i.progress || 0) >= 100).length;
  const indicatorsNotStarted = totalIndicators - indicatorsWithData;
  
  // Calculate completion percentage
  const completionRate = totalIndicators > 0 ? Math.round((indicatorsWithData / totalIndicators) * 100) : 0;
  const avgProgress = goalIndicators.length > 0 ? Math.round(goalIndicators.reduce((sum, i) => sum + (i.progress || 0), 0) / goalIndicators.length) : 0;

  if (!goal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Goal Not Found</h1>
          <Link to="/admin/sdg-management">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to SDG Goals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (indicator: Indicator) => {
    if (!indicator.has_data) return 'text-gray-500';
    if ((indicator.progress || 0) >= 100) return 'text-green-600';
    if ((indicator.progress || 0) > 0) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getStatusIcon = (indicator: Indicator) => {
    if (!indicator.has_data) return <Clock className="w-4 h-4" />;
    if ((indicator.progress || 0) >= 100) return <CheckCircle className="w-4 h-4" />;
    if ((indicator.progress || 0) > 0) return <TrendingUp className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusText = (indicator: Indicator) => {
    if (!indicator.has_data) return 'Not Started';
    if ((indicator.progress || 0) >= 100) return 'Completed';
    if ((indicator.progress || 0) > 0) return 'In Progress';
    return 'Data Available';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/sdg-management">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: goal.color_primary }}
          >
            {goal.id}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
            <p className="text-sm text-gray-600">Sustainable Development Goal {goal.id}</p>
          </div>
        </div>
      </div>

      {/* Goal Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-4">{goal.description}</p>
          
          {/* Real-time Balochistan Progress Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Balochistan Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(goal.progress || 0)}%</span>
              </div>
              <Progress value={goal.progress || 0} className="h-2" />
              <p className="text-xs text-gray-500">Based on authentic Balochistan data</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Data Availability</span>
                <span className="text-sm font-bold text-green-600">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-gray-500">{indicatorsWithData} of {totalIndicators} indicators have data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Performance Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalIndicators}</div>
              <p className="text-xs text-gray-600">Total Indicators</p>
              <p className="text-xs text-blue-500 mt-1">UN Official</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{indicatorsWithData}</div>
              <p className="text-xs text-gray-600">With Balochistan Data</p>
              <p className="text-xs text-green-500 mt-1">{completionRate}% coverage</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{indicatorsInProgress}</div>
              <p className="text-xs text-gray-600">Making Progress</p>
              <p className="text-xs text-blue-500 mt-1">Improving trend</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{indicatorsNotStarted}</div>
              <p className="text-xs text-gray-600">Need Attention</p>
              <p className="text-xs text-orange-500 mt-1">Data required</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      {indicatorsWithData > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Balochistan Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Performing */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Top Performing Indicators</h4>
                <div className="space-y-2">
                  {goalIndicators
                    .filter(i => i.has_data && (i.progress || 0) > 50)
                    .slice(0, 3)
                    .map(indicator => (
                      <div key={indicator.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-xs font-medium text-green-800">{indicator.indicator_code}</span>
                        <span className="text-xs font-bold text-green-700">{Math.round(indicator.progress || 0)}%</span>
                      </div>
                    ))
                  }
                  {goalIndicators.filter(i => i.has_data && (i.progress || 0) > 50).length === 0 && (
                    <p className="text-xs text-gray-500 italic">Building progress in multiple areas</p>
                  )}
                </div>
              </div>

              {/* Needs Attention */}
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">Priority Areas</h4>
                <div className="space-y-2">
                  {goalIndicators
                    .filter(i => !i.has_data || (i.progress || 0) < 25)
                    .slice(0, 3)
                    .map(indicator => (
                      <div key={indicator.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <span className="text-xs font-medium text-orange-800">{indicator.indicator_code}</span>
                        <span className="text-xs text-orange-600">
                          {indicator.has_data ? `${Math.round(indicator.progress || 0)}%` : 'No data'}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Targets and Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>All Targets and Indicators</CardTitle>
          <p className="text-sm text-gray-600">
            Click on any indicator to view detailed data entry forms and progress tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {goalTargets.map((target) => {
            const targetIndicators = goalIndicators.filter(i => i.target_id === target.id);
            
            return (
              <div key={target.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    Target {target.target_number}
                  </Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{target.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{target.description}</p>
                  </div>
                </div>
                
                {targetIndicators.length > 0 && (
                  <div className="pl-6 space-y-2">
                    {targetIndicators.map((indicator) => (
                      <Link
                        key={indicator.id}
                        to={`/indicator/${indicator.indicator_code}`}
                        className="block"
                      >
                        <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {indicator.indicator_code}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Tier {indicator.tier}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1 leading-tight">
                                {indicator.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {indicator.description}
                              </p>
                              {indicator.custodian_agencies.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Custodian: {indicator.custodian_agencies.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`flex items-center gap-1 ${getStatusColor(indicator)}`}>
                                {getStatusIcon(indicator)}
                                <span className="text-xs font-medium">
                                  {getStatusText(indicator)}
                                </span>
                              </div>
                              {indicator.has_data && indicator.progress !== undefined && (
                                <div className="text-xs font-bold text-gray-900">
                                  {Math.round(indicator.progress)}%
                                </div>
                              )}
                            </div>
                          </div>
                          {indicator.has_data && indicator.progress !== undefined && (
                            <div className="mt-2">
                              <Progress value={indicator.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {targetIndicators.length === 0 && (
                  <div className="pl-6 text-sm text-gray-500 italic">
                    No indicators available for this target
                  </div>
                )}
                
                <Separator className="my-4" />
              </div>
            );
          })}
          
          {goalTargets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No targets available for this goal</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}