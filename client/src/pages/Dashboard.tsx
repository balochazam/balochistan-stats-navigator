
import { useAuth } from '@/hooks/useSimpleAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Dashboard render - loading:', loading, 'user:', !!user);

  useEffect(() => {
    if (!loading && !user) {
      console.log('No authenticated user, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('Dashboard showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, returning null while redirect happens');
    return null;
  }

  console.log('Dashboard rendering main content');
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
};
