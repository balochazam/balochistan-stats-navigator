import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useSimpleAuth';
import { 
  Code, 
  Database, 
  Server, 
  Globe, 
  Shield, 
  FileText, 
  GitBranch, 
  Settings, 
  Monitor,
  Layers,
  Package,
  Terminal,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';

export const TechnologyTransfer = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-blue-900">
              <Code className="h-8 w-8 mr-3" />
              Technology Transfer Documentation
            </CardTitle>
            <CardDescription className="text-blue-700">
              Comprehensive technical documentation for the Balochistan Bureau of Statistics Dashboard
            </CardDescription>
          </CardHeader>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-6 w-6 mr-2" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Purpose</h4>
                <p className="text-sm text-gray-600">
                  Full-stack data collection management system with public-first approach for Pakistani government statistics.
                  Features role-based access control, hierarchical form builder, and transparent public reporting.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Public dashboard with published reports</li>
                  <li>• Admin-only user management system</li>
                  <li>• Hierarchical form creation with sub-headers</li>
                  <li>• Department-based data isolation</li>
                  <li>• Schedule-based data collection periods</li>
                  <li>• PDF/CSV export functionality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-6 w-6 mr-2" />
              Architecture & Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Frontend
                </h4>
                <div className="space-y-2">
                  <Badge variant="secondary">React 18 + TypeScript</Badge>
                  <Badge variant="secondary">Vite (Build Tool)</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">Shadcn/ui Components</Badge>
                  <Badge variant="secondary">React Query</Badge>
                  <Badge variant="secondary">React Router</Badge>
                  <Badge variant="secondary">React Hook Form + Zod</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  Backend
                </h4>
                <div className="space-y-2">
                  <Badge variant="outline">Node.js + Express</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">RESTful API</Badge>
                  <Badge variant="outline">Session-based Auth</Badge>
                  <Badge variant="outline">bcrypt + express-session</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </h4>
                <div className="space-y-2">
                  <Badge variant="destructive">PostgreSQL</Badge>
                  <Badge variant="destructive">Drizzle ORM</Badge>
                  <Badge variant="destructive">Neon Database</Badge>
                  <Badge variant="destructive">Row Level Security</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-6 w-6 mr-2" />
              Database Schema & Relations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Core Tables</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 border rounded-lg">
                    <strong>profiles</strong> - User authentication & roles
                    <div className="text-gray-600 mt-1">
                      • id, email, full_name, role (admin/data_entry_user)<br/>
                      • department_id (nullable for admins)<br/>
                      • created_at, updated_at
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>departments</strong> - Organizational units
                    <div className="text-gray-600 mt-1">
                      • id, name, description<br/>
                      • created_at, updated_at
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>data_banks</strong> - Reference data sets
                    <div className="text-gray-600 mt-1">
                      • id, name, description<br/>
                      • department_id (nullable - shared if null)<br/>
                      • created_by, is_active
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Form & Collection Tables</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 border rounded-lg">
                    <strong>forms</strong> - Dynamic form definitions
                    <div className="text-gray-600 mt-1">
                      • id, name, description<br/>
                      • department_id, created_by<br/>
                      • is_active, created_at
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>form_fields</strong> - Field definitions
                    <div className="text-gray-600 mt-1">
                      • id, form_id, field_group_id<br/>
                      • name, type, is_required<br/>
                      • sub_headers (JSON), reference_data_id
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>schedules</strong> - Collection periods
                    <div className="text-gray-600 mt-1">
                      • id, name, description<br/>
                      • start_date, end_date<br/>
                      • status (open/collection/published)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              Authentication & Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Role System</h4>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <Badge variant="destructive" className="mb-2">Admin</Badge>
                    <div className="text-sm text-gray-600">
                      • Full system access<br/>
                      • User management<br/>
                      • Department creation<br/>
                      • Form & schedule management<br/>
                      • No department assignment required
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Data Entry User</Badge>
                    <div className="text-sm text-gray-600">
                      • Department-specific access<br/>
                      • Data collection forms<br/>
                      • Form submission<br/>
                      • Department assignment mandatory
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Implementation Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Session Management:</strong>
                    <div className="text-gray-600">
                      • express-session with PostgreSQL store<br/>
                      • 7-day session TTL<br/>
                      • Secure cookies in production
                    </div>
                  </div>
                  <div>
                    <strong>Password Security:</strong>
                    <div className="text-gray-600">
                      • bcrypt hashing (10 rounds)<br/>
                      • Minimum 6 character requirement<br/>
                      • Admin-only user creation
                    </div>
                  </div>
                  <div>
                    <strong>Route Protection:</strong>
                    <div className="text-gray-600">
                      • Middleware-based auth checks<br/>
                      • Role-based access control<br/>
                      • Department isolation for data access
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Hierarchical Form System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Form Types</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <strong>Simple Forms</strong>
                    <div className="text-sm text-gray-600 mt-1">
                      Standard form with regular fields:<br/>
                      • Text, textarea, number, email<br/>
                      • Select dropdowns, radio buttons<br/>
                      • Date fields<br/>
                      • Reference data integration
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>Hierarchical Forms</strong>
                    <div className="text-sm text-gray-600 mt-1">
                      Complex nested structure:<br/>
                      • Multi-level sub-headers<br/>
                      • Province → Category → Gender breakdowns<br/>
                      • Auto-aggregation calculations<br/>
                      • Matrix-style data entry
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Technical Implementation</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Sub-Headers Storage:</strong>
                    <div className="text-gray-600">
                      JSON field in form_fields table:<br/>
                      <code className="text-xs bg-gray-100 p-1 rounded">
                        {`{headers: [...]}`}
                      </code>
                    </div>
                  </div>
                  <div>
                    <strong>Dynamic Rendering:</strong>
                    <div className="text-gray-600">
                      • React components generate matrix<br/>
                      • Recursive sub-header processing<br/>
                      • Field validation skipped for headers<br/>
                      • Auto-calculation of aggregates
                    </div>
                  </div>
                  <div>
                    <strong>Data Submission:</strong>
                    <div className="text-gray-600">
                      • JSON storage in form_submissions<br/>
                      • Hierarchical data preservation<br/>
                      • Multiple submissions per form allowed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="h-6 w-6 mr-2" />
              API Endpoints Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="font-semibold mb-3">Authentication Routes</h4>
                <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
                  <div><Badge className="mr-2">POST</Badge>/api/auth/login - User login</div>
                  <div><Badge className="mr-2">POST</Badge>/api/auth/logout - User logout</div>
                  <div><Badge className="mr-2">GET</Badge>/api/auth/user - Get current user</div>
                  <div><Badge className="mr-2">POST</Badge>/api/auth/create-user - Admin user creation</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Core Data Routes</h4>
                <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
                  <div><Badge className="mr-2">GET</Badge>/api/departments - List departments</div>
                  <div><Badge className="mr-2">POST</Badge>/api/departments - Create department</div>
                  <div><Badge className="mr-2">GET</Badge>/api/data-banks - List reference data</div>
                  <div><Badge className="mr-2">GET</Badge>/api/forms - List forms</div>
                  <div><Badge className="mr-2">POST</Badge>/api/forms - Create form</div>
                  <div><Badge className="mr-2">GET</Badge>/api/schedules - List schedules</div>
                  <div><Badge className="mr-2">POST</Badge>/api/schedules - Create schedule</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Public Routes</h4>
                <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
                  <div><Badge className="mr-2">GET</Badge>/api/public/published-schedules - Published reports</div>
                  <div><Badge className="mr-2">GET</Badge>/api/public/departments - Public department list</div>
                  <div><Badge className="mr-2">GET</Badge>/api/public/schedule/:id/report - Report data</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 mr-2" />
              Project Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Frontend Structure</h4>
                <div className="text-sm font-mono bg-gray-50 p-4 rounded-lg">
                  <div>client/src/</div>
                  <div className="ml-2">├── components/</div>
                  <div className="ml-4">├── auth/ - Authentication components</div>
                  <div className="ml-4">├── layout/ - Dashboard layout</div>
                  <div className="ml-4">├── forms/ - Form builders</div>
                  <div className="ml-4">└── ui/ - Shadcn components</div>
                  <div className="ml-2">├── pages/</div>
                  <div className="ml-4">├── admin/ - Admin-only pages</div>
                  <div className="ml-4">└── public/ - Public pages</div>
                  <div className="ml-2">├── hooks/ - Custom React hooks</div>
                  <div className="ml-2">└── lib/ - Utilities & API clients</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Backend Structure</h4>
                <div className="text-sm font-mono bg-gray-50 p-4 rounded-lg">
                  <div>server/</div>
                  <div className="ml-2">├── index.ts - Main server file</div>
                  <div className="ml-2">├── routes.ts - API routes</div>
                  <div className="ml-2">├── storage.ts - Database operations</div>
                  <div className="ml-2">└── db.ts - Database connection</div>
                  <div>shared/</div>
                  <div className="ml-2">└── schema.ts - Database schema</div>
                  <div>Root files:</div>
                  <div className="ml-2">├── drizzle.config.ts</div>
                  <div className="ml-2">├── package.json</div>
                  <div className="ml-2">└── replit.md - Project docs</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GitBranch className="h-6 w-6 mr-2" />
              Development Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Common Commands</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded font-mono">npm run dev</div>
                  <div className="text-gray-600">Start development server (frontend + backend)</div>
                  
                  <div className="p-2 bg-gray-50 rounded font-mono">npm run db:push</div>
                  <div className="text-gray-600">Push schema changes to database</div>
                  
                  <div className="p-2 bg-gray-50 rounded font-mono">npm run build</div>
                  <div className="text-gray-600">Build for production</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Environment Variables</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded font-mono">DATABASE_URL</div>
                  <div className="text-gray-600">PostgreSQL connection string</div>
                  
                  <div className="p-2 bg-gray-50 rounded font-mono">NODE_ENV</div>
                  <div className="text-gray-600">Environment (development/production)</div>
                  
                  <div className="p-2 bg-gray-50 rounded font-mono">SESSION_SECRET</div>
                  <div className="text-gray-600">Session encryption key</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Implementation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Key Implementation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Department Isolation
                </h4>
                <div className="text-sm space-y-2">
                  <div>• Admin users see all data across departments</div>
                  <div>• Data entry users only access their assigned department</div>
                  <div>• Data banks can be shared (null department_id) or department-specific</div>
                  <div>• Form submissions filtered by user's department</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Schedule Workflow
                </h4>
                <div className="text-sm space-y-2">
                  <div>• <Badge variant="outline">Open</Badge> → Initial state, forms can be added</div>
                  <div>• <Badge variant="secondary">Collection</Badge> → Data entry phase, forms locked</div>
                  <div>• <Badge variant="default">Published</Badge> → Public visibility, reports available</div>
                  <div>• Status transitions controlled by completion validation</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                  Export System
                </h4>
                <div className="text-sm space-y-2">
                  <div>• PDF exports maintain hierarchical table structure</div>
                  <div>• CSV exports include all form data with proper headers</div>
                  <div>• jsPDF + jsPDF-AutoTable for PDF generation</div>
                  <div>• Landscape orientation for complex hierarchical data</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment & Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Deployment & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Production Deployment</h4>
                <div className="text-sm space-y-2">
                  <div>• Autoscale deployment</div>
                  <div>• Vite build generates optimized assets</div>
                  <div>• Express serves both API and static files</div>
                  <div>• PostgreSQL via Neon Database</div>
                  <div>• Environment variables via Replit Secrets</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Monitoring & Logs</h4>
                <div className="text-sm space-y-2">
                  <div>• Console logs for debugging (remove in production)</div>
                  <div>• Error handling with try-catch blocks</div>
                  <div>• Toast notifications for user feedback</div>
                  <div>• Network request logging in API client</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-3">Common Maintenance Tasks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Adding New Form Fields:</strong>
                  <div className="text-gray-600">
                    1. Update form_fields table<br/>
                    2. Add field type to enum if needed<br/>
                    3. Update FormBuilderWithHierarchy component<br/>
                    4. Test validation and submission
                  </div>
                </div>
                <div>
                  <strong>Database Schema Changes:</strong>
                  <div className="text-gray-600">
                    1. Modify shared/schema.ts<br/>
                    2. Run npm run db:push<br/>
                    3. Update storage.ts interfaces<br/>
                    4. Update TypeScript types
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Considerations */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <Shield className="h-6 w-6 mr-2" />
              Security Considerations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Implemented Security:</strong>
                <div className="text-amber-700 space-y-1 mt-1">
                  <div>• Session-based authentication</div>
                  <div>• Password hashing with bcrypt</div>
                  <div>• Role-based access control</div>
                  <div>• SQL injection prevention (Drizzle ORM)</div>
                  <div>• Department-based data isolation</div>
                </div>
              </div>
              <div>
                <strong>Additional Recommendations:</strong>
                <div className="text-amber-700 space-y-1 mt-1">
                  <div>• Implement rate limiting</div>
                  <div>• Add CSRF protection</div>
                  <div>• Enable HTTPS in production</div>
                  <div>• Regular security audits</div>
                  <div>• Input validation strengthening</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gray-50">
          <CardContent className="text-center py-6">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()} | 
              For additional support, please refer to the developer
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};