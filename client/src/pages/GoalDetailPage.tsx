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

  // Calculate statistics
  const totalIndicators = goalIndicators.length;
  const indicatorsWithData = goalIndicators.filter(i => i.has_data).length;
  const indicatorsInProgress = goalIndicators.filter(i => i.has_data && (i.progress || 0) > 0 && (i.progress || 0) < 100).length;
  const indicatorsCompleted = goalIndicators.filter(i => (i.progress || 0) >= 100).length;
  const indicatorsNotStarted = totalIndicators - indicatorsWithData;

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
          {goal.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(goal.progress)}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{totalIndicators}</div>
            <p className="text-xs text-gray-600">Total Indicators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{indicatorsCompleted}</div>
            <p className="text-xs text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{indicatorsInProgress}</div>
            <p className="text-xs text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-500">{indicatorsNotStarted}</div>
            <p className="text-xs text-gray-600">Not Started</p>
          </CardContent>
        </Card>
      </div>

      {/* Targets and Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Targets and Indicators</CardTitle>
          <p className="text-sm text-gray-600">
            Click on any indicator to view detailed information and data entry forms
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