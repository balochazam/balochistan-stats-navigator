import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Database, TrendingUp, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SimpleFormRenderer } from '@/components/forms/SimpleFormRenderer';

interface Indicator {
  id: string;
  indicator_code: string;
  title: string;
  description: string;
  tier: number;
  custodian_agencies: string[];
  has_data: boolean;
  progress: number;
  sdg_goal_id: number;
  target_id: string;
}

interface Form {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export function IndicatorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [showDataEntry, setShowDataEntry] = useState(false);

  // Fetch indicator details
  const { data: indicators = [], isLoading: indicatorLoading } = useQuery<Indicator[]>({
    queryKey: ['/api/sdg/indicators'],
  });

  // Fetch all forms to find the form for this indicator
  const { data: allForms = [] } = useQuery<Form[]>({
    queryKey: ['/api/forms'],
  });

  const indicator = indicators.find(i => i.id === id);
  
  // Find the form for this indicator
  const indicatorForm = allForms.find(form => 
    form.name.toLowerCase().includes(indicator?.indicator_code?.toLowerCase() || '') ||
    form.description?.toLowerCase().includes(indicator?.indicator_code?.toLowerCase() || '')
  );

  if (indicatorLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Indicator Not Found</h1>
          <p className="text-gray-600 mb-6">The indicator you're looking for doesn't exist or has been moved.</p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to={`/goals/${indicator.sdg_goal_id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goal {indicator.sdg_goal_id}
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-sm">
                {indicator.indicator_code}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Tier {indicator.tier}
              </Badge>
              {indicator.has_data ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ✓ Data Available
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  ⚠ No Data
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {indicator.title}
            </h1>
            
            <p className="text-gray-600 leading-relaxed">
              {indicator.description}
            </p>
          </div>

          {!showDataEntry && indicatorForm && (
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowDataEntry(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Enter Data
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Data Entry Form or Indicator Info */}
      {showDataEntry && indicatorForm ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Data Collection Form - {indicator.indicator_code}
            </CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Enter data for {indicator.title}</p>
              <Button 
                variant="outline" 
                onClick={() => setShowDataEntry(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SimpleFormRenderer 
              formId={indicatorForm.id}
              onSubmissionSuccess={() => {
                setShowDataEntry(false);
                // Refresh data
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Indicator Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Indicator Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Indicator Code</h4>
                  <p className="text-gray-600">{indicator.indicator_code}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Tier Classification</h4>
                  <p className="text-gray-600">Tier {indicator.tier}</p>
                </div>
                
                {indicator.custodian_agencies && indicator.custodian_agencies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Custodian Agencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {indicator.custodian_agencies.map((agency) => (
                        <Badge key={agency} variant="outline">
                          {agency}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{indicator.description}</p>
                </div>
              </CardContent>
            </Card>

            {!indicatorForm && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-orange-900 mb-2">
                      No Data Collection Form Available
                    </h3>
                    <p className="text-orange-700 mb-4">
                      A data collection form hasn't been created for this indicator yet.
                    </p>
                    <Link to={`/goals/${indicator.sdg_goal_id}`}>
                      <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                        Go Back to Create Form
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Progress & Stats */}
          <div className="space-y-6">
            {indicator.has_data && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Progress Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(indicator.progress || 0)}%
                    </div>
                    <p className="text-gray-600">Balochistan Progress</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Data Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data Available</span>
                  <Badge className={indicator.has_data ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                    {indicator.has_data ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Collection Form</span>
                  <Badge className={indicatorForm ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                    {indicatorForm ? "Available" : "Not Created"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}