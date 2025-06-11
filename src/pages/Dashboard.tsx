
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
    console.log('Dashboard useEffect - user:', user?.id, 'profile:', profile?.role, 'loading:', loading);
    
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('Dashboard loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    console.log('No user, showing AuthPage');
    return <AuthPage />;
  }

  if (!profile) {
    console.log('User found but no profile, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  console.log('Rendering dashboard for user:', user.id, 'with role:', profile.role);
  
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
};
