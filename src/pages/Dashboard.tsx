
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { AuthPage } from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard useEffect - user:', !!user, 'profile:', !!profile, 'loading:', loading);
    
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  console.log('Dashboard render - loading:', loading, 'user:', !!user, 'profile:', !!profile);

  if (loading) {
    console.log('Dashboard loading...');
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
    console.log('No user, showing AuthPage');
    return <AuthPage />;
  }

  console.log('Rendering dashboard for user:', user.id, 'with profile:', profile?.role || 'no profile yet');
  
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
};
