import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, Settings, Eye, BarChart3 } from 'lucide-react';
import { IndicatorDataEntryForm } from './IndicatorDataEntryForm';
import { DynamicFormBuilder } from './DynamicFormBuilder';

// Enhanced indicator examples with real SDG structures
const ENHANCED_INDICATOR_EXAMPLES = {
  "1.2.2": {
    title: "Proportion living in poverty in all dimensions",
    real_structure: {
      type: "multi_dimensional",
      dimensions: [
        { name: "gender", label: "Gender", values: ["Male", "Female", "Total"], type: "categorical" },
        { name: "age_group", label: "Age Group", values: ["0-17", "18-64", "65+", "Total"], type: "categorical" },
        { name: "location", label: "Location", values: ["Urban", "Rural", "Total"], type: "categorical" }
      ],
      measurement_unit: "percentage",
      data_points: 27, // 3×4×3 combinations
      collection_frequency: "annual",
      data_sources: ["MICS", "PSLM", "Household Surveys"]
    }
  },
  "3.1.1": {
    title: "Maternal mortality ratio",
    real_structure: {
      type: "ratio",
      numerator: { label: "Maternal deaths", unit: "number", source: "vital_registration" },
      denominator: { label: "Live births", unit: "number", source: "vital_registration" },
      multiplier: 100000,
      measurement_unit: "per 100,000 live births",
      collection_frequency: "annual",
      data_sources: ["Civil Registration", "Health Facilities", "Verbal Autopsy"]
    }
  },
  "4.1.1": {
    title: "Children achieving minimum proficiency in reading and mathematics",
    real_structure: {
      type: "demographic_breakdown",
      base_indicator: "learning_proficiency_percentage",
      dimensions: [
        { name: "subject", label: "Subject", values: ["Reading", "Mathematics"], type: "categorical" },
        { name: "grade", label: "Grade", values: ["Grade 2-3", "Grade 4-6"], type: "categorical" },
        { name: "gender", label: "Gender", values: ["Boys", "Girls", "Total"], type: "categorical" },
        { name: "location", label: "Location", values: ["Urban", "Rural", "Total"], type: "categorical" },
        { name: "wealth_quintile", label: "Wealth", values: ["Q1 (poorest)", "Q2", "Q3", "Q4", "Q5 (richest)"], type: "categorical" }
      ],
      measurement_unit: "percentage",
      data_points: 60, // 2×2×3×2×5 combinations
      collection_frequency: "every 3-5 years",
      data_sources: ["Learning Assessments", "EGRA/EGMA", "National Exams"]
    }
  }
};

export const RealSDGDataEntryManager = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'entry' | 'builder' | 'preview'>('entry');

  const { data: indicators = [] } = useQuery({
    queryKey: ['/api/sdg/indicators'],
    retry: false,
  });

  const getCurrentStructure = (indicatorCode: string) => {
    return ENHANCED_INDICATOR_EXAMPLES[indicatorCode as keyof typeof ENHANCED_INDICATOR_EXAMPLES];
  };

  const renderIndicatorCard = (indicator: any) => {
    const structure = getCurrentStructure(indicator.indicator_code);
    const isEnhanced = !!structure;

    return (
      <Card key={indicator.id} className={`cursor-pointer transition-all ${
        selectedIndicator === indicator.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {indicator.indicator_code}
                </Badge>
                {isEnhanced && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    Enhanced
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {indicator.indicator_type}
                </Badge>
              </div>
              <h3 className="font-medium text-sm leading-tight">{indicator.title}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isEnhanced && structure && (
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Data Points:</span>
                <span className="font-medium">{structure.real_structure.data_points}</span>
              </div>
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span className="font-medium">{structure.real_structure.collection_frequency}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit:</span>
                <span className="font-medium">{structure.real_structure.measurement_unit}</span>
              </div>
              {structure.real_structure.dimensions && (
                <div>
                  <span className="block mb-1">Dimensions:</span>
                  <div className="flex flex-wrap gap-1">
                    {structure.real_structure.dimensions.map((dim: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {dim.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => {
                setSelectedIndicator(indicator.id);
                setViewMode('entry');
              }}
              className="flex-1"
            >
              <Database className="h-3 w-3 mr-1" />
              {isEnhanced ? 'Enter Data' : 'Basic Entry'}
            </Button>
            {!isEnhanced && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedIndicator(indicator.id);
                  setViewMode('builder');
                }}
              >
                <Settings className="h-3 w-3 mr-1" />
                Build Form
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDataEntryInterface = () => {
    const indicator = indicators.find((ind: any) => ind.id === selectedIndicator);
    if (!indicator) return null;

    const structure = getCurrentStructure(indicator.indicator_code);

    if (viewMode === 'builder') {
      return (
        <DynamicFormBuilder
          indicator={indicator}
          onSave={(formStructure) => {
            console.log('Form structure saved:', formStructure);
            // TODO: Save to backend
            setViewMode('preview');
          }}
          onCancel={() => setSelectedIndicator(null)}
        />
      );
    }

    if (viewMode === 'entry') {
      return (
        <IndicatorDataEntryForm
          indicator={{
            ...indicator,
            data_structure: structure?.real_structure
          }}
          onSubmit={(data) => {
            console.log('Data submitted:', data);
            // TODO: Save to backend
            setSelectedIndicator(null);
          }}
          onCancel={() => setSelectedIndicator(null)}
        />
      );
    }

    return null;
  };

  if (selectedIndicator) {
    return renderDataEntryInterface();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Real SDG Data Entry System
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose an indicator to see real multi-dimensional data collection forms or build custom structures
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="enhanced" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="enhanced">Enhanced Indicators</TabsTrigger>
              <TabsTrigger value="basic">Basic Indicators</TabsTrigger>
              <TabsTrigger value="all">All Indicators</TabsTrigger>
            </TabsList>

            <TabsContent value="enhanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicators
                  .filter((ind: any) => getCurrentStructure(ind.indicator_code))
                  .map(renderIndicatorCard)
                }
              </div>
              {indicators.filter((ind: any) => getCurrentStructure(ind.indicator_code)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No enhanced indicators found. Create indicators with codes 1.2.2, 3.1.1, or 4.1.1 to see real SDG structures.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicators
                  .filter((ind: any) => !getCurrentStructure(ind.indicator_code))
                  .map(renderIndicatorCard)
                }
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicators.map(renderIndicatorCard)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};