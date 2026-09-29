import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Shield, Database, Eye, EyeOff, UserCheck, KeyRound } from 'lucide-react';
import logoPath from "@assets/6f64eb753133d8c8693ef11f8af6f2e5_1750318410601.png";

export const AdminLoginPage = () => {
  usePageTitle('Administrator Login');
  const navigate = useNavigate();
  
  const { signIn, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const handleQuickFill = (email: string) => {
    setSignInData({
      email,
      password: 'admin123'
    });
    setError(null);
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated on auth page, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

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
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src={logoPath} 
                alt="Balochistan Bureau of Statistics" 
                className="h-10 w-10 object-contain mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Balochistan Bureau of Statistics Dashboard</h1>
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
                    placeholder="syedazambaloch@gmail.com or admin@bbos.gob.pk"
                    disabled={loading}
                    className="relative block w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      placeholder="Enter your password (default: admin123)"
                      disabled={loading}
                      className="relative block w-full pr-10"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 font-semibold" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Quick Fill / Demo Accounts */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                    Quick Fill Credentials:
                  </span>
                  <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    pass: admin123
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start border-blue-200 hover:bg-blue-50 text-blue-800 h-auto py-2 px-2.5"
                    onClick={() => handleQuickFill('syedazambaloch@gmail.com')}
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600 shrink-0" />
                    <div className="text-left truncate">
                      <div className="font-semibold text-[11px] truncate">Syed Azam Baloch</div>
                      <div className="text-[10px] text-gray-500 truncate">syedazambaloch@gmail.com</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start border-slate-200 hover:bg-slate-50 text-slate-800 h-auto py-2 px-2.5"
                    onClick={() => handleQuickFill('admin@bbos.gob.pk')}
                  >
                    <Shield className="h-3.5 w-3.5 mr-1.5 text-slate-600 shrink-0" />
                    <div className="text-left truncate">
                      <div className="font-semibold text-[11px] truncate">BBoS Administrator</div>
                      <div className="text-[10px] text-gray-500 truncate">admin@bbos.gob.pk</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Only authorized administrators can access this system.
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