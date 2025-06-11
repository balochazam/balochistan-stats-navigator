
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

  console.log('Dashboard render - loading:', loading, 'user:', !!user, 'profile:', !!profile);

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

  // Allow dashboard to render even without profile initially
  // The profile will be fetched and the component will re-render
  console.log('Rendering dashboard for user:', user.id, 'with profile:', profile?.role || 'loading...');
  
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
};
