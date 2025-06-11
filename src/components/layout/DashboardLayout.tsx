
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Users, FileText, Calendar, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const getMenuItems = () => {
    const baseItems = [
      { icon: User, label: 'Profile', path: '/profile' },
    ];

    if (profile?.role === 'admin') {
      return [
        ...baseItems,
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: Settings, label: 'Departments', path: '/admin/departments' },
        { icon: FileText, label: 'Forms', path: '/admin/forms' },
        { icon: Calendar, label: 'Schedules', path: '/admin/schedules' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
      ];
    }

    if (profile?.role === 'department_user') {
      return [
        ...baseItems,
        { icon: Users, label: 'Department Users', path: '/department/users' },
        { icon: FileText, label: 'Department Forms', path: '/department/forms' },
        { icon: Calendar, label: 'Schedules', path: '/department/schedules' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
      ];
    }

    // data_entry_user
    return [
      ...baseItems,
      { icon: FileText, label: 'Data Entry', path: '/data-entry' },
    ];
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
              <h1 className="text-2xl font-bold text-gray-900">BBoS Dashboard</h1>
              <p className="text-sm text-gray-600">Balochistan Bureau of Statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Loading...'}</p>
                <p className="text-xs text-gray-600 capitalize">{profile?.role?.replace('_', ' ') || 'Loading...'}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isCurrent = isCurrentPath(item.path);
                return (
                  <li key={item.path}>
                    <Button
                      variant={isCurrent ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
