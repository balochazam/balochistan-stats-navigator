import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Database, 
  MapPin,
  Users,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getIndicatorData, type IndicatorTimeSeries } from '@shared/balochistandIndicatorData';

interface IndicatorDetailsViewProps {
  indicatorCode: string;
  indicatorTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DataPointCardProps {
  title: string;
  period: string;
  source: string;
  value: string | number;
  breakdown?: any;
  notes?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'baseline' | 'progress' | 'latest';
}

const DataPointCard: React.FC<DataPointCardProps> = ({
  title,
  period,
  source,
  value,
  breakdown,
  notes,
  icon: Icon,
  variant
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'baseline': return 'border-l-blue-500 bg-blue-50';
      case 'progress': return 'border-l-yellow-500 bg-yellow-50';
      case 'latest': return 'border-l-green-500 bg-green-50';
    }
  };

  const getVariantBadge = () => {
    switch (variant) {
      case 'baseline': return <Badge variant="outline" className="bg-blue-100 text-blue-800">Baseline</Badge>;
      case 'progress': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Progress</Badge>;
      case 'latest': return <Badge variant="outline" className="bg-green-100 text-green-800">Latest</Badge>;
    }
  };

  return (
    <Card className={`border-l-4 ${getVariantColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          {getVariantBadge()}
        </div>
        <div className="text-xs text-gray-600">
          <span className="font-medium">{period}</span> • <span>{source}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-lg font-semibold text-gray-900">
            {typeof value === 'string' && value.toLowerCase().includes('not available') ? (
              <span className="text-gray-500 text-sm">Data Not Available</span>
            ) : (
              value
            )}
          </div>
          
          {breakdown && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Breakdown:</p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {typeof breakdown === 'object' ? (
                  Object.entries(breakdown).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-600">{String(breakdown)}</div>
                )}
              </div>
            </div>
          )}
          
          {notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 text-gray-500" />
                <span>{notes}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TrendAnalysis: React.FC<{ data: IndicatorTimeSeries }> = ({ data }) => {
  const getTrendIcon = () => {
    if (!data.trend_analysis) return <Minus className="h-4 w-4 text-gray-400" />;
    
    const analysis = data.trend_analysis.toLowerCase();
    if (analysis.includes('improvement') || analysis.includes('increase') || analysis.includes('progress')) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (analysis.includes('deterioration') || analysis.includes('decline') || analysis.includes('decrease')) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {getTrendIcon()}
          Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.trend_analysis ? (
          <p className="text-sm text-gray-700 leading-relaxed">{data.trend_analysis}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No trend analysis available</p>
        )}
        
        {data.data_quality && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Data Quality</span>
            </div>
            <p className="text-sm text-blue-700">{data.data_quality}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DataSources: React.FC<{ data: IndicatorTimeSeries }> = ({ data }) => {
  const sources = [
    { period: data.baseline.year, source: data.baseline.source, type: 'Baseline' },
    { period: data.progress.year, source: data.progress.source, type: 'Progress' },
    { period: data.latest.year, source: data.latest.source, type: 'Latest' }
  ].filter(item => item.source && item.source !== 'Not available');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4" />
          Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sources.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">{item.source}</span>
                <div className="text-xs text-gray-600">{item.period}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const IndicatorDetailsView: React.FC<IndicatorDetailsViewProps> = ({
  indicatorCode,
  indicatorTitle,
  open,
  onOpenChange
}) => {
  const indicatorData = getIndicatorData(indicatorCode);

  if (!indicatorData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Indicator Details</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              Detailed data for indicator {indicatorCode} is not yet available in our system.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg leading-tight">
            {indicatorCode}: {indicatorTitle}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{indicatorData.unit}</Badge>
            <Badge className="bg-blue-100 text-blue-800">Balochistan Data</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Data Timeline</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <DataPointCard
                  title="Baseline Value"
                  period={indicatorData.baseline.year}
                  source={indicatorData.baseline.source}
                  value={indicatorData.baseline.value}
                  breakdown={indicatorData.baseline.breakdown}
                  notes={indicatorData.baseline.notes}
                  icon={Calendar}
                  variant="baseline"
                />

                <DataPointCard
                  title="Progress Value"
                  period={indicatorData.progress.year}
                  source={indicatorData.progress.source}
                  value={indicatorData.progress.value}
                  breakdown={indicatorData.progress.breakdown}
                  notes={indicatorData.progress.notes}
                  icon={BarChart3}
                  variant="progress"
                />

                <DataPointCard
                  title="Latest Value"
                  period={indicatorData.latest.year}
                  source={indicatorData.latest.source}
                  value={indicatorData.latest.value}
                  breakdown={indicatorData.latest.breakdown}
                  notes={indicatorData.latest.notes}
                  icon={TrendingUp}
                  variant="latest"
                />
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                {[
                  { data: indicatorData.baseline, label: 'Baseline', color: 'bg-blue-500' },
                  { data: indicatorData.progress, label: 'Progress', color: 'bg-yellow-500' },
                  { data: indicatorData.latest, label: 'Latest', color: 'bg-green-500' }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      {index < 2 && <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{item.label}</h3>
                        <Badge variant="outline" className="text-xs">{item.data.year}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{item.data.source}</div>
                      <div className="text-lg font-semibold mb-2">{item.data.value}</div>
                      {item.data.breakdown && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Breakdown: </span>
                          {typeof item.data.breakdown === 'object' 
                            ? Object.entries(item.data.breakdown).map(([key, val]) => `${key}: ${val}`).join(', ')
                            : item.data.breakdown
                          }
                        </div>
                      )}
                      {item.data.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          {item.data.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TrendAnalysis data={indicatorData} />
                <DataSources data={indicatorData} />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Regional Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium text-sm mb-2">Balochistan Province</h4>
                      <p className="text-sm text-gray-700">
                        This indicator reflects the specific context of Balochistan province, 
                        Pakistan's largest province by area but with unique development challenges.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2 bg-blue-50 rounded">
                        <span className="font-medium">Data Collection</span>
                        <p className="mt-1">Multiple national surveys and provincial statistics</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="font-medium">Reporting Period</span>
                        <p className="mt-1">{indicatorData.baseline.year} - {indicatorData.latest.year}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};