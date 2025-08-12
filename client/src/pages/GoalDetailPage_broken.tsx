import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Target, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SimpleSDGFormBuilder } from '@/components/sdg/SimpleSDGFormBuilder';

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
  sdg_goal_id: number;
  target_number: string;
  title: string;
  description: string;
}

interface Indicator {
  id: string;
  sdg_target_id: string;
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
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

  // Fetch goal details
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/sdg/goals-with-progress'],
  });

  const goal = goals.find(g => g.id === goalNumber);

  // Fetch targets for this goal
  const { data: targets = [], isLoading: targetsLoading, error: targetsError } = useQuery<Target[]>({
    queryKey: ['/api/sdg/targets'],
  });

  const goalTargets = targets.filter(t => t.sdg_goal_id === goalNumber);

  // Fetch indicators for this goal
  const { data: indicators = [], isLoading: indicatorsLoading, error: indicatorsError } = useQuery<Indicator[]>({
    queryKey: ['/api/sdg/indicators'],
  });

  // Fetch all forms to check which indicators have forms
  const { data: allForms = [] } = useQuery<any[]>({
    queryKey: ['/api/forms'],
  });



  // Get indicators with their targets
  const goalIndicators: IndicatorWithTarget[] = indicators
    .filter(indicator => {
      const target = targets.find(t => t.id === indicator.sdg_target_id);
      return target?.sdg_goal_id === goalNumber;
    })
    .map(indicator => ({
      ...indicator,
      target: targets.find(t => t.id === indicator.sdg_target_id)!
    }))
    .sort((a, b) => a.indicator_code.localeCompare(b.indicator_code));



  // Check which indicators have forms
  const getIndicatorFormStatus = (indicatorCode: string) => {
    return allForms.find(form => 
      form.name.toLowerCase().includes(indicatorCode.toLowerCase()) || 
      form.description?.toLowerCase().includes(indicatorCode.toLowerCase())
    );
  };

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
          
          {/* Data Coverage Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalIndicators}</div>
                <div className="text-sm text-gray-600">Total Indicators</div>
                <div className="text-xs text-blue-600">UN Official Count</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{indicatorsWithData}</div>
                <div className="text-sm text-gray-600">Data Available</div>
                <div className="text-xs text-green-600">Balochistan Covered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{indicatorsNotStarted}</div>
                <div className="text-sm text-gray-600">Need Data</div>
                <div className="text-xs text-orange-600">Forms Required</div>
              </div>
            </div>
          </div>

          {/* Real-time Progress Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(goal.progress || 0)}%</span>
              </div>
              <Progress value={goal.progress || 0} className="h-2" />
              <p className="text-xs text-gray-500">Average across all indicators with data</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Data Coverage</span>
                <span className="text-sm font-bold text-green-600">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-gray-500">Indicators with Balochistan data available</p>
            </div>
          </div>
        </CardContent>
      </Card>



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

      {/* All Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>All Indicators for this Goal</CardTitle>
          <p className="text-sm text-gray-600">
            Click on any indicator to view detailed data entry forms and progress tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {goalIndicators.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">No indicators found for this goal</div>
            </div>
          )}
          
          {goalIndicators.map((indicator) => {
            const existingForm = getIndicatorFormStatus(indicator.indicator_code);
            
            return (
              <div key={indicator.id} className="relative">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {indicator.indicator_code}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Tier {indicator.tier}
                        </Badge>
                        {indicator.has_data ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            ✓ Data Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            ⚠ No Data
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 leading-tight">
                        {indicator.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {indicator.description}
                      </p>
                      {indicator.has_data && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Balochistan Progress</span>
                            <span className="font-medium text-blue-600">{Math.round(indicator.progress || 0)}%</span>
                          </div>
                          <Progress value={indicator.progress || 0} className="h-2" />
                        </div>
                      )}
                      {indicator.custodian_agencies && indicator.custodian_agencies.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Custodian: {indicator.custodian_agencies.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {existingForm.hasStaticForm || existingForm.hasDatabaseForm ? (
                        <Link to={`/indicators/${indicator.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Enter Data
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedIndicator(indicator);
                            setShowFormBuilder(true);
                          }}
                        >
                          Create Form
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {indicator.indicator_code}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Tier {indicator.tier}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          ⚠ No Data
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 leading-tight">
                        {indicator.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {indicator.description}
                      </p>
                      {indicator.custodian_agencies && indicator.custodian_agencies.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Custodian: {indicator.custodian_agencies.join(', ')}
                        </p>
                      )}
                    </div>
                    {(() => {
                      const existingForm = getIndicatorFormStatus(indicator.indicator_code);
                      
                      if (existingForm) {
                        return (
                          <Button 
                            size="sm" 
                            variant="default"
                            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              // Navigate to indicator details page for data entry
                              window.location.href = `/indicators/${indicator.id}`;
                            }}
                          >
                            Enter Data
                          </Button>
                        );
                      } else {
                        return (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="whitespace-nowrap"
                            onClick={() => {
                              setSelectedIndicator(indicator);
                              setShowFormBuilder(true);
                            }}
                          >
                            Create Form
                          </Button>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Simple Form Builder Integration */}
      <SimpleSDGFormBuilder
        open={showFormBuilder}
        onOpenChange={(open) => {
          setShowFormBuilder(open);
          if (!open) {
            setSelectedIndicator(null);
          }
        }}
        indicator={selectedIndicator}
      />
    </div>
  );
}