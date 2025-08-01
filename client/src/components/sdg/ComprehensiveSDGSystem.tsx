import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Target, Database, BarChart3, Globe, Users, Calendar, Filter } from 'lucide-react';
import { AuthenticSDGDataEntryForm } from './AuthenticSDGDataEntryForm';
import { Goal1SpecificDataEntry } from './Goal1SpecificDataEntry';
import { BalochistandDataEntry } from './BalochistandDataEntry';
import { getIndicatorFormStructure } from '@/data/goal1IndicatorForms';

// Types for database data
interface DatabaseIndicator {
  id: string;
  indicator_code: string;
  title: string;
  indicator_type: string;
  unit: string;
  data_structure: any;
  sdg_target_id: string;
  target?: {
    target_number: string;
    title: string;
    sdg_goal_id: number;
  };
}

interface IndicatorStructure {
  code: string;
  title: string;
  goal_id: number;
  target_code: string;
  tier: string;
  type: string;
  measurement_unit: string;
  collection_frequency: string;
  data_sources: string[];
  custodian_agencies: string[];
  disaggregation: {
    required: string[];
    optional: string[];
  };
  form_structure: {
    fields: any[];
    calculation?: any;
  };
}

// SDG Goals with official titles and colors
const SDG_GOALS = [
  { id: 1, title: "No Poverty", color: "#E5243B", icon: "🚫" },
  { id: 2, title: "Zero Hunger", color: "#DDA63A", icon: "🌾" },
  { id: 3, title: "Good Health and Well-being", color: "#4C9F38", icon: "❤️" },
  { id: 4, title: "Quality Education", color: "#C5192D", icon: "📚" },
  { id: 5, title: "Gender Equality", color: "#FF3A21", icon: "⚖️" },
  { id: 6, title: "Clean Water and Sanitation", color: "#26BDE2", icon: "💧" },
  { id: 7, title: "Affordable and Clean Energy", color: "#FCC30B", icon: "⚡" },
  { id: 8, title: "Decent Work and Economic Growth", color: "#A21942", icon: "💼" },
  { id: 9, title: "Industry, Innovation and Infrastructure", color: "#FD6925", icon: "🏗️" },
  { id: 10, title: "Reduced Inequalities", color: "#DD1367", icon: "📊" },
  { id: 11, title: "Sustainable Cities and Communities", color: "#FD9D24", icon: "🏙️" },
  { id: 12, title: "Responsible Consumption and Production", color: "#BF8B2E", icon: "♻️" },
  { id: 13, title: "Climate Action", color: "#3F7E44", icon: "🌍" },
  { id: 14, title: "Life Below Water", color: "#0A97D9", icon: "🐟" },
  { id: 15, title: "Life on Land", color: "#56C02B", icon: "🌳" },
  { id: 16, title: "Peace, Justice and Strong Institutions", color: "#00689D", icon: "⚖️" },
  { id: 17, title: "Partnerships for the Goals", color: "#19486A", icon: "🤝" }
];

// Get targets by goal (sample structure - would need complete mapping)
const getTargetsByGoal = (goalId: number) => {
  const targetMap: { [key: number]: string[] } = {
    1: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.a", "1.b"],
    3: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.a", "3.b", "3.c", "3.d"],
    4: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.a", "4.b", "4.c"],
    5: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.a", "5.b", "5.c"]
    // Add more as needed
  };
  return targetMap[goalId] || [];
};

interface ComprehensiveSDGSystemProps {
  onBack: () => void;
}

export const ComprehensiveSDGSystem: React.FC<ComprehensiveSDGSystemProps> = ({ onBack }) => {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorStructure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'browse' | 'data_entry'>('browse');

  // Fetch real indicators from database
  const { data: indicators = [], isLoading } = useQuery({
    queryKey: ['/api/sdg/indicators'],
  });

  // Fetch targets with goal information
  const { data: targets = [] } = useQuery({
    queryKey: ['/api/sdg/targets'],
  });

  // Convert database indicators to our format
  const convertToIndicatorStructure = (dbIndicator: DatabaseIndicator): IndicatorStructure => {
    const target = targets.find((t: any) => t.id === dbIndicator.sdg_target_id);
    const dataStructure = dbIndicator.data_structure || {};
    
    return {
      code: dbIndicator.indicator_code,
      title: dbIndicator.title,
      goal_id: target?.sdg_goal_id || 1,
      target_code: target?.target_number || '1.1',
      tier: dataStructure.tier || 'I',
      type: dbIndicator.indicator_type || 'percentage',
      measurement_unit: dbIndicator.unit,
      collection_frequency: dataStructure.collection_frequency || 'Annual',
      data_sources: dataStructure.data_sources || ['Official statistics'],
      custodian_agencies: dataStructure.custodian_agencies ? 
        (typeof dataStructure.custodian_agencies === 'string' ? 
          dataStructure.custodian_agencies.split(', ') : 
          dataStructure.custodian_agencies) : ['WHO'],
      disaggregation: {
        required: ['sex', 'age', 'geographic_location'],
        optional: ['wealth_quintile', 'education_level']
      },
      form_structure: {
        fields: generateFieldsForIndicator(dbIndicator),
        calculation: dbIndicator.indicator_type === 'ratio' ? { formula: 'Numerator ÷ Denominator' } : undefined,
        authentic_structure: getIndicatorFormStructure(dbIndicator.indicator_code)
      }
    };
  };

  // Generate form fields based on indicator type
  const generateFieldsForIndicator = (indicator: DatabaseIndicator) => {
    const baseFields = [
      { name: 'data_year', label: 'Data Year', type: 'number', required: true },
      { name: 'data_source', label: 'Data Source', type: 'select', required: true, options: ['MICS', 'PDHS', 'PSLM', 'Administrative Data'] },
      { name: 'geographic_coverage', label: 'Geographic Coverage', type: 'select', required: true, options: ['National', 'Provincial', 'District'] }
    ];

    switch (indicator.indicator_type) {
      case 'percentage':
        return [
          ...baseFields,
          { name: 'percentage_value', label: 'Percentage Value', type: 'percentage', required: true, validation: { min: 0, max: 100 } }
        ];
      case 'ratio':
        return [
          ...baseFields,
          { name: 'numerator', label: 'Numerator', type: 'number', required: true },
          { name: 'denominator', label: 'Denominator', type: 'number', required: true },
          { name: 'multiplier', label: 'Multiplier (e.g., 1000, 100000)', type: 'number', required: true }
        ];
      case 'count':
        return [
          ...baseFields,
          { name: 'count_value', label: 'Count Value', type: 'number', required: true }
        ];
      case 'demographic_breakdown':
        return [
          ...baseFields,
          { name: 'male_value', label: 'Male Value', type: 'number', required: true },
          { name: 'female_value', label: 'Female Value', type: 'number', required: true },
          { name: 'urban_value', label: 'Urban Value', type: 'number', required: false },
          { name: 'rural_value', label: 'Rural Value', type: 'number', required: false }
        ];
      case 'index':
        return [
          ...baseFields,
          { name: 'index_value', label: 'Index Value', type: 'number', required: true, validation: { min: 0, max: 1 } }
        ];
      default:
        return [
          ...baseFields,
          { name: 'value', label: 'Value', type: 'number', required: true }
        ];
    }
  };

  const processedIndicators = indicators.map(convertToIndicatorStructure);

  // Filter indicators based on search and filters
  const filteredIndicators = useMemo(() => {
    let indicators = processedIndicators;
    
    if (selectedGoal) {
      indicators = indicators.filter(ind => ind.goal_id === selectedGoal);
    }
    
    if (selectedTarget) {
      indicators = indicators.filter(ind => ind.target_code === selectedTarget);
    }
    
    if (searchTerm) {
      indicators = indicators.filter(ind => 
        ind.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterTier !== 'all') {
      indicators = indicators.filter(ind => ind.tier === filterTier);
    }
    
    if (filterType !== 'all') {
      indicators = indicators.filter(ind => ind.type === filterType);
    }
    
    return indicators;
  }, [processedIndicators, selectedGoal, selectedTarget, searchTerm, filterTier, filterType]);

  // Get unique targets for selected goal
  const getTargetsForGoal = (goalId: number) => {
    const goalIndicators = processedIndicators.filter(ind => ind.goal_id === goalId);
    return [...new Set(goalIndicators.map(ind => ind.target_code))].sort();
  };

  if (viewMode === 'data_entry' && selectedIndicator) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setViewMode('browse');
              setSelectedIndicator(null);
            }}
          >
            ← Back to Browse
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Data Entry: {selectedIndicator.code}</h2>
            <p className="text-sm text-gray-600">{selectedIndicator.title}</p>
          </div>
        </div>
        {selectedIndicator.goal_id === 1 ? (
          <BalochistandDataEntry
            indicatorCode={selectedIndicator.code}
            indicatorTitle={selectedIndicator.title}
            onSubmit={(data) => {
              console.log('Balochistan data submitted:', data);
              // TODO: Save to backend
              setViewMode('browse');
              setSelectedIndicator(null);
            }}
            onCancel={() => {
              setViewMode('browse');
              setSelectedIndicator(null);
            }}
          />
        ) : (
          <AuthenticSDGDataEntryForm
            indicator={selectedIndicator}
            onSubmit={(data) => {
              console.log('Data submitted:', data);
              // TODO: Save to backend
              setViewMode('browse');
              setSelectedIndicator(null);
            }}
            onCancel={() => {
              setViewMode('browse');
              setSelectedIndicator(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="outline" onClick={onBack}>
                  ← Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Globe className="h-6 w-6" />
                    Complete SDG Indicators System
                  </h1>
                  <p className="text-sm text-gray-600">
                    All {processedIndicators.length} official UN SDG indicators with authentic data collection forms
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {filteredIndicators.length} indicators
              </Badge>
              {isLoading && (
                <Badge variant="outline" className="text-xs">Loading...</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search indicators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="I">Tier I</SelectItem>
                <SelectItem value="II">Tier II</SelectItem>
                <SelectItem value="III">Tier III</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="ratio">Ratio</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="multi_dimensional">Multi-dimensional</SelectItem>
                <SelectItem value="index">Index</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterTier('all');
                setFilterType('all');
                setSelectedGoal(null);
                setSelectedTarget(null);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              SDG Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {SDG_GOALS.map((goal) => (
                  <Button
                    key={goal.id}
                    variant={selectedGoal === goal.id ? "default" : "ghost"}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => {
                      setSelectedGoal(goal.id);
                      setSelectedTarget(null);
                    }}
                    style={{
                      backgroundColor: selectedGoal === goal.id ? goal.color : undefined,
                      borderLeft: `4px solid ${goal.color}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{goal.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Goal {goal.id}</div>
                        <div className="text-xs opacity-90">{goal.title}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Targets & Indicators */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {selectedGoal ? `Goal ${selectedGoal} Indicators` : 'All Indicators'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {selectedGoal ? (
                <div className="space-y-4">
                  {getTargetsForGoal(selectedGoal).map((targetCode) => {
                    const targetIndicators = filteredIndicators.filter(ind => ind.target_code === targetCode);
                    return (
                      <Card key={targetCode} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline">Target {targetCode}</Badge>
                          <span className="text-sm">
                            {targetIndicators.length} indicator{targetIndicators.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {targetIndicators.map((indicator) => (
                            <IndicatorCard
                              key={indicator.code}
                              indicator={indicator}
                              onEnterData={() => {
                                setSelectedIndicator(indicator);
                                setViewMode('data_entry');
                              }}
                            />
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIndicators.map((indicator) => (
                    <IndicatorCard
                      key={indicator.code}
                      indicator={indicator}
                      onEnterData={() => {
                        setSelectedIndicator(indicator);
                        setViewMode('data_entry');
                      }}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Individual Indicator Card Component
interface IndicatorCardProps {
  indicator: IndicatorStructure;
  onEnterData: () => void;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, onEnterData }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'I': return 'bg-green-100 text-green-800';
      case 'II': return 'bg-yellow-100 text-yellow-800';
      case 'III': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono">
                {indicator.code}
              </Badge>
              <Badge className={`text-xs ${getTierColor(indicator.tier)}`}>
                Tier {indicator.tier}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {indicator.type}
              </Badge>
            </div>
            <h4 className="font-medium text-sm leading-tight mb-2">
              {indicator.title}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Unit:</span> {indicator.measurement_unit}
          </div>
          <div>
            <span className="font-medium">Frequency:</span> {indicator.collection_frequency}
          </div>
          <div>
            <span className="font-medium">Sources:</span> {indicator.data_sources.slice(0, 2).join(', ')}
            {indicator.data_sources.length > 2 && '...'}
          </div>
          <div>
            <span className="font-medium">Fields:</span> {indicator.form_structure.fields.length} data points
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Required disaggregation:</span>{' '}
            {indicator.disaggregation.required.join(', ')}
          </div>
          <div className="text-xs">
            <span className="font-medium">Custodian:</span>{' '}
            {indicator.custodian_agencies.join(', ')}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" onClick={onEnterData} className="flex-1">
            <BarChart3 className="h-3 w-3 mr-1" />
            Enter Data
          </Button>
          <Button size="sm" variant="outline">
            <Target className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};