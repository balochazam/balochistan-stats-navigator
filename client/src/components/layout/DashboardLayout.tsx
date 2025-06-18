
import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Users,
  Building2,
  Database,
  FileText,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout fails, navigate to home
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'department_head', 'data_entry_user']
    },
    {
      title: 'Data Collection',
      icon: ClipboardList,
      path: '/data-collection',
      roles: ['data_entry_user', 'department_head']
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/admin/users',
      roles: ['admin']
    },
    {
      title: 'Department Management',
      icon: Building2,
      path: '/admin/departments',
      roles: ['admin']
    },
    {
      title: 'Data Bank Management',
      icon: Database,
      path: '/admin/data-banks',
      roles: ['admin', 'department_user', 'data_entry_user']
    },
    {
      title: 'Form Management',
      icon: FileText,
      path: '/admin/forms',
      roles: ['admin']
    },
    {
      title: 'Schedule Management',
      icon: Calendar,
      path: '/admin/schedules',
      roles: ['admin']
    },
    {
      title: 'Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Data Portal</h2>
        {profile && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">{profile.full_name || profile.email}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {profile.role?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.title}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            navigate('/profile');
            setSidebarOpen(false);
          }}
        >
          <User className="h-4 w-4 mr-3" />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 lg:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Data Portal</h1>
          <div className="w-8" /> {/* Spacer for alignment */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
