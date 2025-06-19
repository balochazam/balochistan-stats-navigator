import { useAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { simpleApiClient } from '@/lib/simpleApi';
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Building, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Database
} from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  schedule_name?: string;
}

export const DashboardHome = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch data in parallel for faster loading
      const [schedulesData, departmentsData] = await Promise.all([
        simpleApiClient.get('/api/schedules'),
        simpleApiClient.get('/api/departments')
      ]);

      setSchedules(schedulesData || []);
      setDepartments(departmentsData || []);

      // Generate alerts based on data
      generateAlerts(schedulesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (schedules: Schedule[]) => {
    const alertsArray: Alert[] = [];
    const today = new Date();

    schedules.forEach(schedule => {
      const endDate = new Date(schedule.end_date);
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (schedule.status === 'collection' && daysUntilEnd <= 7 && daysUntilEnd > 0) {
        alertsArray.push({
          id: `deadline-${schedule.id}`,
          type: 'warning',
          message: `Schedule "${schedule.name}" ends in ${daysUntilEnd} days`,
          schedule_name: schedule.name
        });
      }

      if (schedule.status === 'collection' && daysUntilEnd < 0) {
        alertsArray.push({
          id: `overdue-${schedule.id}`,
          type: 'error',
          message: `Schedule "${schedule.name}" is overdue`,
          schedule_name: schedule.name
        });
      }
    });

    if (schedules.filter(s => s.status === 'open').length === 0) {
      alertsArray.push({
        id: 'no-open-schedules',
        type: 'info',
        message: 'No schedules are currently open for setup'
      });
    }

    setAlerts(alertsArray);
  };

  const getWelcomeMessage = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Welcome to the BBoS Admin Dashboard. You have full access to manage the system.';
      case 'data_entry_user':
        return 'Welcome to the Data Entry Portal. Enter data for your assigned forms.';
      default:
        return 'Welcome to the BBoS Dashboard.';
    }
  };

  const getQuickActions = () => {
    if (profile?.role === 'admin') {
      return [
        { 
          title: 'User Management', 
          description: 'Manage system users and roles',
          icon: Users,
          path: '/admin/users'
        },
        { 
          title: 'Departments', 
          description: 'Create and manage departments',
          icon: Building,
          path: '/admin/departments'
        },
        { 
          title: 'Forms', 
          description: 'Create dynamic data collection forms',
          icon: FileText,
          path: '/admin/forms'
        },
        { 
          title: 'Schedules', 
          description: 'Manage data collection schedules',
          icon: Calendar,
          path: '/admin/schedules'
        }
      ];
    }

    return [
      { 
        title: 'Data Entry', 
        description: 'Enter data for assigned forms',
        icon: FileText,
        path: '/data-collection'
      }
    ];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Play className="h-3 w-3" />;
      case 'collection':
        return <Clock className="h-3 w-3" />;
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Play className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'collection':
        return 'bg-yellow-500';
      case 'published':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const quickActions = getQuickActions();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome, {profile?.full_name}!</CardTitle>
          <CardDescription>{getWelcomeMessage()}</CardDescription>
        </CardHeader>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                  {getAlertIcon(alert.type)}
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.path} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Published Schedules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Published Schedules
            </CardTitle>
            {profile?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/schedules')}>
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {schedules.filter(s => s.status === 'published').length > 0 ? (
            <div className="space-y-2">
              {schedules
                .filter(s => s.status === 'published')
                .slice(0, 3)
                .map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{schedule.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">Published</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No published schedules available</p>
          )}
        </CardContent>
      </Card>

      {/* Collection Status Schedules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Active Data Collection
            </CardTitle>
            {profile?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/schedules')}>
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {schedules.filter(s => s.status === 'collection').length > 0 ? (
            <div className="space-y-2">
              {schedules
                .filter(s => s.status === 'collection')
                .map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{schedule.name}</div>
                      <div className="text-sm text-gray-600">
                        Ends: {new Date(schedule.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className="bg-yellow-500 text-white flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Collecting</span>
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No active data collection schedules</p>
          )}
        </CardContent>
      </Card>

      {/* Departments Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Departments Overview
            </CardTitle>
            {profile?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/departments')}>
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.slice(0, 6).map((department) => (
                <div key={department.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{department.name}</div>
                  {department.description && (
                    <div className="text-sm text-gray-600 mt-1">{department.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No departments configured</p>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{schedules.length}</div>
              <div className="text-sm text-gray-600">Total Schedules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{profile?.role?.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Your Role</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
