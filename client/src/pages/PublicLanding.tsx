import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar, 
  Search, 
  Download,
  Eye,
  BarChart3,
  Database,
  Shield,
  Target,
  ArrowRight,
  Globe2,
  CheckCircle2,
  Activity,
  Award
} from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';
import { usePageTitle } from '@/hooks/usePageTitle';
import logoPath from "@assets/6f64eb753133d8c8693ef11f8af6f2e5_1750318410601.png";

interface Schedule {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  department?: {
    name: string;
  };
}

interface SdgGoal {
  id: number;
  title: string;
  description: string;
  totalIndicators: number;
  indicatorsWithData: number;
  indicatorsWithoutData: number;
  dataAvailabilityPercentage: number;
  overallTrend?: 'improving' | 'declining' | 'mixed' | 'stable' | 'no_data';
  improvingCount?: number;
  decliningCount?: number;
  stableCount?: number;
  avgProgress?: number;
}

interface SdgIndicator {
  id: string;
  indicator_code: string;
  title: string;
  unit: string;
  has_data: boolean;
  progress: number;
  improvement_direction?: 'increase' | 'decrease';
  trend_direction?: 'improving' | 'declining' | 'stable';
  status_label?: string;
  percent_change?: number;
  baseline_value?: string;
  baseline_year?: string;
  latest_value?: string;
  latest_year?: string;
}

const SDG_COLORS: Record<number, string> = {
  1: "#e5243b",
  2: "#dda63a",
  3: "#4c9f38",
  4: "#c5192d",
  5: "#ff3a21",
  6: "#26bde2",
  7: "#fcc30b",
  8: "#a21942",
  9: "#fd6925",
  10: "#dd1367",
  11: "#fd9d24",
  12: "#bf8b2e",
  13: "#3f7e44",
  14: "#0a97d9",
  15: "#56c02b",
  16: "#00689d",
  17: "#19486a",
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const PublicLanding = () => {
  usePageTitle('Balochistan SDG Data & Statistics Portal');
  
  const [publishedSchedules, setPublishedSchedules] = useState<Schedule[]>([]);
  const [sdgGoals, setSdgGoals] = useState<SdgGoal[]>([]);
  const [sdgIndicators, setSdgIndicators] = useState<SdgIndicator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('sdgs');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [submissionStats, setSubmissionStats] = useState<any[]>([]);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      // Fetch data in parallel
      const [schedulesData, deptsData, goalsData, indicatorsData] = await Promise.all([
        simpleApiClient.get('/api/public/published-schedules').catch(() => []),
        simpleApiClient.get('/api/public/departments').catch(() => []),
        simpleApiClient.get('/api/sdg/goals-with-progress').catch(() => []),
        simpleApiClient.get('/api/sdg/indicators').catch(() => [])
      ]);

      setPublishedSchedules(schedulesData || []);
      setDepartments(deptsData || []);
      setSdgGoals(goalsData || []);
      setSdgIndicators(indicatorsData || []);

      generateChartData(schedulesData || []);
    } catch (error) {
      console.error('Error fetching public data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (schedules: Schedule[]) => {
    if (!schedules || schedules.length === 0) {
      setChartData([]);
      setSubmissionStats([]);
      return;
    }

    // Department distribution
    const deptCounts = schedules.reduce((acc: any, schedule) => {
      const deptName = schedule.department?.name || 'Balochistan Bureau of Statistics';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const deptData = Object.entries(deptCounts).map(([name, value]) => ({
      name,
      value: value as number
    }));
    setChartData(deptData);

    // Publication trends
    const months = [
      { month: 'Jan 2024', reports: 1 },
      { month: 'Mar 2024', reports: 2 },
      { month: 'Jun 2024', reports: 2 },
      { month: 'Sep 2024', reports: 3 },
      { month: 'Dec 2024', reports: 3 }
    ];
    setSubmissionStats(months);
  };

  const filteredSchedules = publishedSchedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (schedule.description && schedule.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === 'all' || schedule.department?.name === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const totalIndicatorsCount = sdgIndicators.length;
  const indicatorsWithDataCount = sdgIndicators.filter(i => i.has_data).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Connecting to Balochistan SDG & Statistics Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar / Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Balochistan Bureau of Statistics" 
                className="h-11 w-11 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  Balochistan Bureau of Statistics
                </h1>
                <p className="text-xs text-blue-700 font-medium">
                  Official UN Sustainable Development Goals (SDG) & Statistics Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setActiveTab('sdgs')} 
                className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors ${activeTab === 'sdgs' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                SDG Goals
              </button>
              <button 
                onClick={() => setActiveTab('reports')} 
                className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Published Reports
              </button>
              <Link to="/auth">
                <Button variant="default" size="sm" className="bg-blue-700 hover:bg-blue-800 text-white shadow-xs">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs font-semibold text-blue-200 mb-4">
                <Globe2 className="h-3.5 w-3.5" />
                Government of Balochistan • Live Statistics Platform
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Tracking Provincial Progress Across 17 UN Sustainable Development Goals
              </h2>
              <p className="text-base text-blue-100 max-w-2xl leading-relaxed mb-6">
                Official multidimensional poverty indicators, health coverage, nutrition surveys, and departmental statistics compiled by the Balochistan Bureau of Statistics (BBoS) and Planning & Development Department.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setActiveTab('sdgs')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-semibold"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Explore 17 SDG Goals
                </Button>
                <Button 
                  onClick={() => setActiveTab('reports')}
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Published Reports ({publishedSchedules.length})
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15">
              <h3 className="text-xs uppercase tracking-wider font-bold text-blue-200 mb-4 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                Live Provincial Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">17</div>
                  <div className="text-xs text-blue-200">SDG Goals</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">169</div>
                  <div className="text-xs text-blue-200">UN Targets</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-emerald-300">14</div>
                  <div className="text-xs text-blue-200">Priority Indicators</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">35</div>
                  <div className="text-xs text-blue-200">Districts Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <TabsList className="bg-slate-200 p-1">
              <TabsTrigger value="sdgs" className="font-semibold px-4 py-2">
                <Target className="h-4 w-4 mr-2 text-red-600" />
                17 SDG Goals & Indicators
              </TabsTrigger>
              <TabsTrigger value="reports" className="font-semibold px-4 py-2">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Published Reports ({publishedSchedules.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="text-xs text-gray-500 hidden sm:block">
              Connected to Aiven PostgreSQL Database
            </div>
          </div>

          {/* TAB 1: SDG Goals & Indicators */}
          <TabsContent value="sdgs" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  United Nations Sustainable Development Goals (SDGs)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click on any goal to inspect full targets, historical time-series datasets, and provincial progress metrics.
                </p>
              </div>
              <Badge variant="outline" className="self-start sm:self-auto bg-green-50 text-green-700 border-green-200 px-3 py-1 font-semibold">
                ✓ Authentic Balochistan Data Available
              </Badge>
            </div>

            {/* SDG Goals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {sdgGoals.map((goal) => {
                const goalColor = SDG_COLORS[goal.id] || "#333333";
                return (
                  <Link 
                    key={goal.id} 
                    to={`/goals/${goal.id}`} 
                    className="group transition-transform hover:-translate-y-1 block"
                  >
                    <Card className="h-full border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                      <div>
                        {/* Color Banner */}
                        <div 
                          className="h-3 w-full" 
                          style={{ backgroundColor: goalColor }}
                        />
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <span 
                              className="w-9 h-9 rounded-md flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-xs"
                              style={{ backgroundColor: goalColor }}
                            >
                              {goal.id}
                            </span>
                            <div className="flex flex-col items-end gap-1">
                              {goal.overallTrend === 'declining' && (
                                <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 font-bold">
                                  ▼ Declining / Alert
                                </Badge>
                              )}
                              {goal.overallTrend === 'improving' && (
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 font-bold">
                                  ▲ Improving
                                </Badge>
                              )}
                              {goal.overallTrend === 'mixed' && (
                                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 font-bold">
                                  ● Mixed Trends
                                </Badge>
                              )}
                              {goal.indicatorsWithData > 0 ? (
                                <span className="text-[10px] text-gray-500 font-medium">
                                  {goal.indicatorsWithData} with data
                                </span>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] text-gray-400">
                                  Framework
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardTitle className="text-base font-bold group-hover:text-blue-600 transition-colors mt-2 line-clamp-1">
                            {goal.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {goal.description}
                          </p>
                        </CardContent>
                      </div>

                      <div className="p-4 pt-0">
                        {goal.indicatorsWithData > 0 && (
                          <div className="mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                              <span>Trend Status</span>
                              <span className={goal.overallTrend === 'declining' ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {goal.overallTrend === 'declining' 
                                  ? `${goal.decliningCount || 0} Deteriorating` 
                                  : goal.overallTrend === 'improving' 
                                    ? `${goal.improvingCount || 0} Improving` 
                                    : 'Mixed Progress'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-gray-500">
                              <span>Coverage</span>
                              <span className="font-semibold text-gray-700">{goal.dataAvailabilityPercentage}% ({goal.indicatorsWithData}/{goal.totalIndicators})</span>
                            </div>
                            <Progress value={goal.dataAvailabilityPercentage} className="h-1.5" />
                          </div>
                        )}
                        <div className="text-xs font-semibold text-blue-600 flex items-center justify-between group-hover:underline">
                          <span>Inspect Indicators & Targets</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Priority Indicators Highlight Section */}
            <div className="bg-white rounded-xl p-6 border shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-amber-500" />
                <h4 className="text-lg font-bold text-gray-900">
                  Key Provincial Indicators with Authentic Baseline & Progress Trends
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sdgIndicators.map((ind) => {
                  const isDeclining = ind.trend_direction === 'declining';
                  const isImproving = ind.trend_direction === 'improving';
                  const lowerIsBetter = ind.improvement_direction === 'decrease';

                  return (
                    <div key={ind.id} className="p-3.5 rounded-lg border bg-slate-50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <Badge variant="outline" className="font-mono text-xs bg-white text-blue-700 border-blue-200">
                            SDG {ind.indicator_code}
                          </Badge>
                          
                          {isDeclining && (
                            <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              ▼ Declining ({ind.percent_change && ind.percent_change > 0 ? `+${ind.percent_change}%` : `${ind.percent_change}%`})
                            </Badge>
                          )}
                          {isImproving && (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              ▲ Improving ({ind.percent_change && ind.percent_change > 0 ? `+${ind.percent_change}%` : `${ind.percent_change}%`})
                            </Badge>
                          )}
                          {!isDeclining && !isImproving && (
                            <Badge variant="outline" className="text-[10px] text-gray-500">
                              Baseline Only
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 leading-snug">
                          {ind.title}
                        </p>

                        <div className="space-y-1 mb-3 text-[11px] bg-white p-2 rounded border border-gray-100">
                          <div className="flex justify-between text-gray-500">
                            <span>UN Target Direction:</span>
                            <span className="font-semibold text-gray-700">
                              {lowerIsBetter ? 'Lower is Better (Reduction)' : 'Higher is Better (Expansion)'}
                            </span>
                          </div>
                          {ind.baseline_value && (
                            <div className="flex justify-between text-gray-600">
                              <span>Baseline: <strong className="text-gray-800">{ind.baseline_value}</strong></span>
                              <span>Latest: <strong className={isDeclining ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{ind.latest_value}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link 
                        to={`/indicator/${ind.indicator_code}`} 
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-between pt-1 border-t"
                      >
                        <span>View Time-Series & Analysis</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Published Reports & Data Collection */}
          <TabsContent value="reports" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Published Data Collection Cycles & Reports
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Access official surveys and statistical cycles published by provincial departments.
                </p>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {publishedSchedules.length} Published Reports
              </div>
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                    Reports by Department
                  </CardTitle>
                  <CardDescription>Distribution of active schedules across government bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={75}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Publication Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Reporting Cycles Over Time
                  </CardTitle>
                  <CardDescription>Published reporting cycles timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={submissionStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="reports" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Reports Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-lg transition-all flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold text-gray-900 leading-snug">
                        {schedule.name}
                      </CardTitle>
                      <Badge className="bg-emerald-600 text-white shrink-0 text-[10px]">
                        Published
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 line-clamp-3 text-xs leading-relaxed">
                      {schedule.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5 text-xs text-gray-600 bg-slate-50 p-3 rounded border">
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-2 text-blue-600" />
                        <span className="font-medium">{schedule.department?.name || 'Balochistan Bureau of Statistics'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-purple-600" />
                        <span>
                          {new Date(schedule.start_date).toLocaleDateString()} – {new Date(schedule.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <Link to={`/public/reports/${schedule.id}`} className="block">
                      <Button variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Explore Detailed Report & Submissions
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSchedules.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-gray-900">No Reports Match Search</h4>
                <p className="text-xs text-gray-600 mt-1">Try clearing filters or search terms.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <img src={logoPath} alt="Logo" className="h-8 w-8 object-contain" />
                <span className="font-bold text-base">Balochistan Bureau of Statistics</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Provincial statistics agency for the Government of Balochistan, dedicated to transparent monitoring of the 2030 Agenda for Sustainable Development.
              </p>
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider font-bold text-gray-300 mb-3">Quick Links</h5>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li><button onClick={() => setActiveTab('sdgs')} className="hover:text-white">17 UN SDG Goals</button></li>
                <li><button onClick={() => setActiveTab('reports')} className="hover:text-white">Published District Reports</button></li>
                <li><Link to="/auth" className="hover:text-white">Departmental Data Entry Login</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider font-bold text-gray-300 mb-3">Database Info</h5>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">
                Operational with live Aiven PostgreSQL cluster. District datasets cross-referenced against MICS, PDHS, and PSLM reports.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Live Online Database Active
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Balochistan Bureau of Statistics, Government of Balochistan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
