import { useState } from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Database, TrendingUp, Users } from 'lucide-react';
import { SDGGoalsManager } from '@/components/sdg/SDGGoalsManager';
import { SDGIndicatorsManager } from '@/components/sdg/SDGIndicatorsManager';

import { SDGProgressTracker } from '@/components/sdg/SDGProgressTracker';
import { DynamicFormBuilder } from '@/components/sdg/DynamicFormBuilder';

export const SDGManagement = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('goals');

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">Only administrators can manage SDG settings.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SDG Management</h1>
            <p className="text-gray-600 mt-1">
              Manage Sustainable Development Goals structure and data collection
            </p>
          </div>
          <Badge variant="outline" className="text-lg py-2 px-4">
            <Target className="h-5 w-5 mr-2" />
            Admin Panel
          </Badge>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals & Targets
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Indicators
            </TabsTrigger>
            <TabsTrigger value="form-builder" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Form Builder
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <SDGGoalsManager />
          </TabsContent>

          <TabsContent value="indicators" className="space-y-6">
            <SDGIndicatorsManager />
          </TabsContent>

          <TabsContent value="form-builder" className="space-y-6">
            <DynamicFormBuilder />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <SDGProgressTracker />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};