import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Shield
} from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';

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

interface FormSubmission {
  id: string;
  data: any;
  submitted_at: string;
  form?: {
    name: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const PublicLanding = () => {
  const [publishedSchedules, setPublishedSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [submissionStats, setSubmissionStats] = useState<any[]>([]);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      // Fetch published schedules (public endpoint)
      const schedulesData = await simpleApiClient.get('/api/public/published-schedules');
      setPublishedSchedules(schedulesData || []);

      // Fetch departments for filtering
      const deptsData = await simpleApiClient.get('/api/public/departments');
      setDepartments(deptsData || []);

      // Generate chart data from published schedules
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
      const deptName = schedule.department?.name || 'General';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const deptData = Object.entries(deptCounts).map(([name, value]) => ({
      name,
      value: value as number
    }));
    setChartData(deptData);

    // Monthly publication trends
    const monthlyData = schedules.reduce((acc: any, schedule) => {
      const date = new Date(schedule.created_at);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Sort by date and limit to last 6 months
    const sortedMonths = Object.entries(monthlyData)
      .map(([month, count]) => ({
        month,
        reports: count as number,
        date: new Date(month)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6);

    setSubmissionStats(sortedMonths);
  };

  const filteredSchedules = publishedSchedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (schedule.description && schedule.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === 'all' || schedule.department?.name === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading public reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Collection Portal</h1>
                <p className="text-sm text-gray-600">Public Reports & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Transparent Data Collection & Reporting
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Access published reports, visualize data trends, and explore comprehensive statistics 
            from our data collection initiatives across various departments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6">
                <FileText className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Published Reports</h3>
                <p className="text-blue-100">Access verified and published data reports</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6">
                <BarChart3 className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Interactive Charts</h3>
                <p className="text-blue-100">Visualize data with dynamic charts and graphs</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6">
                <Download className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Export Data</h3>
                <p className="text-blue-100">Download reports in various formats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Data Overview</h3>
            <p className="text-gray-600">Key statistics and trends from our data collection efforts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Department Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Reports by Department
                </CardTitle>
                <CardDescription>Distribution of published reports across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Publication Trends
                </CardTitle>
                <CardDescription>Number of reports published over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{publishedSchedules.length}</div>
                <div className="text-sm text-gray-600">Published Reports</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
                <div className="text-sm text-gray-600">Departments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {publishedSchedules.length > 0 ? new Date().getFullYear() : 0}
                </div>
                <div className="text-sm text-gray-600">Current Year</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Data Accuracy</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Published Reports Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Published Reports</h3>
            <p className="text-gray-600">Browse and access all publicly available data reports</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{schedule.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {schedule.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Published
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{schedule.department?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(schedule.start_date).toLocaleDateString()} - {' '}
                        {new Date(schedule.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/public/reports/${schedule.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {publishedSchedules.length === 0 
                  ? 'No published reports are currently available.'
                  : 'No reports match your search criteria.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Database className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">Data Collection Portal</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transparent, accessible, and comprehensive data reporting for public benefit.
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Data Collection Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};