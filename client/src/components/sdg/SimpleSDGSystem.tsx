import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Target, Database, BarChart3, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BalochistandDataEntry } from './BalochistandDataEntry';

interface SimpleSDGSystemProps {
  onBack: () => void;
}

export const SimpleSDGSystem: React.FC<SimpleSDGSystemProps> = ({ onBack }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'browse' | 'data_entry'>('browse');

  // Fetch indicators from database
  const { data: indicators = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/sdg/indicators']
  });

  // Filter for Goal 1 indicators only for now
  const goal1Indicators = indicators.filter((ind: any) => 
    ind.indicator_code?.startsWith('1.') || 
    (ind.target && ind.target.sdg_goal_id === 1)
  );

  // Filter indicators based on search
  const filteredIndicators = goal1Indicators.filter((indicator: any) =>
    indicator.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicator.indicator_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h2 className="text-lg font-semibold">Data Entry: {selectedIndicator.indicator_code}</h2>
            <p className="text-sm text-gray-600">{selectedIndicator.title}</p>
          </div>
        </div>
        <BalochistandDataEntry
          indicatorCode={selectedIndicator.indicator_code}
          indicatorTitle={selectedIndicator.title}
          onSubmit={(data) => {
            console.log('Balochistan data submitted:', data);
            setViewMode('browse');
            setSelectedIndicator(null);
          }}
          onCancel={() => {
            setViewMode('browse');
            setSelectedIndicator(null);
          }}
        />
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
                    Balochistan SDG Data System
                  </h1>
                  <p className="text-sm text-gray-600">
                    Goal 1 indicators with Balochistan-specific data collection forms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {filteredIndicators.length} Goal 1 indicators
                </Badge>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Balochistan Data Format Ready
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search indicators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Indicators List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal 1: No Poverty - Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="text-center py-8">Loading indicators...</div>
            ) : filteredIndicators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No indicators found. Try adjusting your search.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIndicators.map((indicator: any) => (
                  <IndicatorCard
                    key={indicator.id}
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
  );
};

// Individual Indicator Card Component
interface IndicatorCardProps {
  indicator: any;
  onEnterData: () => void;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, onEnterData }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono">
                {indicator.indicator_code}
              </Badge>
              <Badge className="text-xs bg-green-100 text-green-800">
                Balochistan Format
              </Badge>
            </div>
            <h4 className="font-medium text-sm leading-tight mb-2">
              {indicator.title}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Unit:</span> {indicator.unit || 'Percentage'}
          </div>
          <div>
            <span className="font-medium">Type:</span> {indicator.indicator_type || 'Percentage'}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" onClick={onEnterData} className="flex-1 bg-green-600 hover:bg-green-700">
            <BarChart3 className="h-3 w-3 mr-1" />
            Enter Balochistan Data
          </Button>
        </div>
      </div>
    </Card>
  );
};