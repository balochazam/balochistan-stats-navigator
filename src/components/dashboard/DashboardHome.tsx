
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, BarChart3, Building } from 'lucide-react';

export const DashboardHome = () => {
  const { profile } = useAuth();

  const getWelcomeMessage = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Welcome to the BBoS Admin Dashboard. You have full access to manage the system.';
      case 'department_user':
        return 'Welcome to your Department Dashboard. Manage your department\'s data and users.';
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
        },
        { 
          title: 'Reports', 
          description: 'View and generate reports',
          icon: BarChart3,
          path: '/reports'
        }
      ];
    }

    if (profile?.role === 'department_user') {
      return [
        { 
          title: 'Department Users', 
          description: 'Manage users in your department',
          icon: Users,
          path: '/department/users'
        },
        { 
          title: 'Forms', 
          description: 'View department forms',
          icon: FileText,
          path: '/department/forms'
        },
        { 
          title: 'Schedules', 
          description: 'Manage data collection schedules',
          icon: Calendar,
          path: '/department/schedules'
        },
        { 
          title: 'Reports', 
          description: 'View department reports',
          icon: BarChart3,
          path: '/reports'
        }
      ];
    }

    return [
      { 
        title: 'Data Entry', 
        description: 'Enter data for assigned forms',
        icon: FileText,
        path: '/data-entry'
      }
    ];
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome, {profile?.full_name}!</CardTitle>
          <CardDescription>{getWelcomeMessage()}</CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card key={action.path} className="hover:shadow-md transition-shadow cursor-pointer">
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

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile?.role?.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Your Role</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Phase 1</div>
              <div className="text-sm text-gray-600">Development Phase</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
