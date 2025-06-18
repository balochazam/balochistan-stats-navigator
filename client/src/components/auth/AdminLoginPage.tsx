import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Shield, Database } from 'lucide-react';

export const AdminLoginPage = () => {
  const { signIn, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated on auth page, redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  }, [user, authLoading]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render auth form if user is authenticated
  if (user) {
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Don't set loading to false on success - let the auth state change handle redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Data Collection Portal</h1>
                <p className="text-sm text-gray-600">Administrator Access</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Public Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Administrator Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access the data collection management system
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    placeholder="admin@example.com"
                    disabled={loading}
                    className="relative block w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="relative block w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Only authorized administrators can access this system.
                  <br />
                  Contact your system administrator for account access.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Public Reports Instead
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Administrator Features</h3>
          <p className="text-gray-600">Comprehensive tools for data collection management</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4 mb-3">
              <Database className="h-6 w-6 text-blue-600 mx-auto" />
            </div>
            <h4 className="font-medium text-gray-900">Form Management</h4>
            <p className="text-sm text-gray-600">Create and manage hierarchical data collection forms</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-4 mb-3">
              <Shield className="h-6 w-6 text-green-600 mx-auto" />
            </div>
            <h4 className="font-medium text-gray-900">User Management</h4>
            <p className="text-sm text-gray-600">Create users and manage department access</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-4 mb-3">
              <Loader2 className="h-6 w-6 text-purple-600 mx-auto" />
            </div>
            <h4 className="font-medium text-gray-900">Schedule Control</h4>
            <p className="text-sm text-gray-600">Manage data collection schedules and publishing</p>
          </div>
        </div>
      </div>
    </div>
  );
};