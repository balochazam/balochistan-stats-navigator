import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  Database,
  MapPin,
  Users,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Target,
  Globe,
  Activity,
  Percent,
  Hash
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getIndicatorData, type IndicatorTimeSeries } from '@shared/balochistandIndicatorData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface IndicatorDashboardProps {
  indicatorCode: string;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  period: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = ({ title, value, trend, period, icon: Icon, color }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
          {trend && getTrendIcon()}
        </div>
        <CardTitle className="text-sm text-gray-600 font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'string' && value.toLowerCase().includes('not available') ? (
            <span className="text-lg text-gray-500">N/A</span>
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-gray-500">{period}</p>
      </CardContent>
    </Card>
  );
};

const DataBreakdownCard: React.FC<{
  title: string;
  data: any;
  color: string;
}> = ({ title, data, color }) => {
  if (!data.breakdown || typeof data.breakdown !== 'object') return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          {title} Breakdown
        </CardTitle>
        <p className="text-sm text-gray-600">{data.year} • {data.source}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data.breakdown).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700 capitalize font-medium">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-sm font-semibold text-gray-900">{String(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TimelinePath: React.FC<{ data: IndicatorTimeSeries }> = ({ data }) => {
  const timeline = [
    { 
      label: 'Baseline', 
      data: data.baseline, 
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Progress', 
      data: data.progress, 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },
    { 
      label: 'Latest', 
      data: data.latest, 
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      {timeline.map((item, index) => (
        <div key={index} className="relative">
          {index < timeline.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
          )}
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
              <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
            </div>
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${item.textColor}`}>{item.label}</CardTitle>
                  <Badge variant="outline">{item.data.year}</Badge>
                </div>
                <p className="text-sm text-gray-600">{item.data.source}</p>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900 mb-3">{item.data.value}</div>
                {item.data.breakdown && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(item.data.breakdown).slice(0, 4).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {item.data.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {item.data.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

// Dynamic Progress Chart Component
const ProgressChart: React.FC<{ data: IndicatorTimeSeries }> = ({ data }) => {
  const chartData = [
    {
      period: data.baseline.year,
      value: parseFloat(String(data.baseline.value).replace(/[%,]/g, '')) || 0,
      type: 'Baseline'
    },
    {
      period: data.progress.year,
      value: parseFloat(String(data.progress.value).replace(/[%,]/g, '')) || 0,
      type: 'Progress'
    },
    {
      period: data.latest.year,
      value: String(data.latest.value).toLowerCase().includes('process') ? 
             parseFloat(String(data.progress.value).replace(/[%,]/g, '')) || 0 : 
             parseFloat(String(data.latest.value).replace(/[%,]/g, '')) || 0,
      type: 'Latest'
    }
  ].filter(item => item.value !== null && item.value !== undefined);

  // Ensure we have at least 2 data points for a meaningful chart
  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Insufficient data points for trend analysis</p>
              <p className="text-sm">Need at least 2 time periods with valid data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Progress Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              formatter={(value, name) => [`${value}${data.unit.includes('%') ? '%' : ''}`, name]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Breakdown Comparison Chart
const BreakdownChart: React.FC<{ data: IndicatorTimeSeries }> = ({ data }) => {
  const latestBreakdown = data.latest.breakdown || data.progress.breakdown;
  
  if (!latestBreakdown) return null;

  const chartData = Object.entries(latestBreakdown)
    .filter(([key, value]) => key !== 'overall' && value && String(value) !== 'N/A')
    .map(([key, value]) => ({
      category: key.replace(/_/g, ' ').toUpperCase(),
      value: parseFloat(String(value).replace(/[%,]/g, '')) || 0,
      color: key === 'urban' ? '#3b82f6' : 
             key === 'rural' ? '#ef4444' :
             key === 'male' ? '#10b981' :
             key === 'female' ? '#f59e0b' : '#8b5cf6'
    }));

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Latest Data Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value}${data.unit.includes('%') ? '%' : ''}`, 'Value']}
            />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Urban-Rural Comparison Pie Chart
const UrbanRuralChart: React.FC<{ data: IndicatorTimeSeries }> = ({ data }) => {
  const latestBreakdown = data.latest.breakdown || data.progress.breakdown;
  
  if (!latestBreakdown?.urban || !latestBreakdown?.rural) return null;

  const chartData = [
    {
      name: 'Urban',
      value: parseFloat(String(latestBreakdown.urban).replace(/[%,]/g, '')) || 0,
      color: '#3b82f6'
    },
    {
      name: 'Rural',
      value: parseFloat(String(latestBreakdown.rural).replace(/[%,]/g, '')) || 0,
      color: '#ef4444'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Urban vs Rural Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Value']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const IndicatorDashboard: React.FC<IndicatorDashboardProps> = ({ indicatorCode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Try to get Balochistan static data first
  const balochistandData = getIndicatorData(indicatorCode);
  
  // Fetch database indicators to check if this indicator exists
  const { data: indicators = [] } = useQuery({
    queryKey: ['/api/sdg/indicators'],
  });
  
  // Fetch forms to check for user-created forms
  const { data: forms = [] } = useQuery({
    queryKey: ['/api/forms'],
  });
  
  // Find the indicator in the database
  const databaseIndicator = indicators.find((ind: any) => ind.indicator_code === indicatorCode);
  
  // Find user-created forms for this indicator
  const indicatorForms = forms.filter((form: any) => 
    form.name && form.name.toLowerCase().includes(indicatorCode.toLowerCase())
  );

  // Fetch form fields to get field labels for the first form
  const { data: formFields = [] } = useQuery({
    queryKey: ['/api/forms', indicatorForms[0]?.id, 'fields'],
    enabled: indicatorForms.length > 0,
    queryFn: async () => {
      if (indicatorForms.length === 0) return [];
      const response = await fetch(`/api/forms/${indicatorForms[0].id}/fields`);
      return response.ok ? response.json() : [];
    }
  });

  // Fetch form submissions for this indicator if forms exist
  const { data: formSubmissions = [] } = useQuery({
    queryKey: [`/api/form-submissions`, indicatorForms.map(f => f.id)],
    enabled: indicatorForms.length > 0,
    queryFn: async () => {
      const submissions = [];
      for (const form of indicatorForms) {
        const response = await fetch(`/api/form-submissions?formId=${form.id}`);
        if (response.ok) {
          const formSubs = await response.json();
          submissions.push(...formSubs.map((sub: any) => ({ ...sub, form_name: form.name })));
        }
      }
      return submissions;
    }
  });

  // Process all form submissions to extract multi-field data by year - GLOBAL SCOPE
  const processSubmissionsByYear = () => {
    const yearlyData: Array<{year: string, data: any, source: string, allFields: Record<string, number>}> = [];
    
    formSubmissions.forEach((submission: any) => {
      if (submission.data && typeof submission.data === 'object') {
        console.log('Processing submission data:', submission.data);
        
        // Extract year from data_year field
        const yearValue = submission.data.data_year;
        const year = yearValue ? new Date(yearValue).getFullYear().toString() : new Date(submission.submitted_at).getFullYear().toString();
        
        // Get data source
        const source = submission.data.data_source || 'Form submission';
        
        // Extract all numeric fields (excluding system fields)
        const allFields: Record<string, number> = {};
        Object.entries(submission.data).forEach(([key, value]) => {
          // Skip system fields
          if (key === 'data_year' || key === 'data_source') {
            return;
          }
          
          // Parse numeric values
          if (typeof value === 'number' && !isNaN(value)) {
            allFields[key] = value;
          } else if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
            allFields[key] = Number(value);
          }
        });
        
        console.log(`Year ${year} fields:`, allFields);
        
        if (Object.keys(allFields).length > 0) {
          yearlyData.push({
            year,
            data: submission.data,
            source,
            allFields
          });
        }
      }
    });
    
    // Sort by year
    return yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };
  
  // Global data processing variables
  const yearlyData = processSubmissionsByYear();
  const hasData = yearlyData.length > 0;
  const hasUserData = formSubmissions.length > 0;
  const totalSubmissions = formSubmissions.length;
  
  // Create baseline, progress, latest from yearly data
  const baselineYear = hasData ? yearlyData[0] : null;
  const latestYear = hasData ? yearlyData[yearlyData.length - 1] : null;
  const progressYear = hasData && yearlyData.length > 2 
    ? yearlyData[Math.floor(yearlyData.length / 2)] 
    : (hasData && yearlyData.length === 2 ? yearlyData[0] : latestYear);
  
  // Create field mapping from auto-generated names to user labels
  const fieldMapping: Record<string, string> = {};
  formFields.forEach((field: any) => {
    if (field.field_name && field.field_label) {
      fieldMapping[field.field_name] = field.field_label;
    }
  });
  
  // Calculate totals and percentages for user forms
  const calculateFieldPercentages = (yearData: any) => {
    if (!yearData || !yearData.allFields) return { percentages: {}, total: 0 };
    
    const values = Object.values(yearData.allFields).map(v => Number(v) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    const percentages: Record<string, number> = {};
    Object.entries(yearData.allFields).forEach(([fieldName, value]) => {
      const numValue = Number(value) || 0;
      percentages[fieldName] = total > 0 ? (numValue / total) * 100 : 0;
    });
    
    return { percentages, total };
  };

  // Format values to show percentages for the main cards
  const formatMultiFieldValue = (yearData: any) => {
    if (!yearData) return 'No data';
    
    const { percentages, total } = calculateFieldPercentages(yearData);
    
    if (total === 0) return 'No numeric data';
    
    // Show percentages for multiple fields, or raw value for single field
    const fieldCount = Object.keys(yearData.allFields).length;
    
    if (fieldCount === 1) {
      const [fieldName, value] = Object.entries(yearData.allFields)[0];
      const label = fieldMapping[fieldName] || fieldName;
      return `${label}: ${value}`;
    } else {
      // Show first field as percentage with most significant value
      const sortedFields = Object.entries(percentages || {}).sort(([,a], [,b]) => b - a);
      if (sortedFields.length > 0) {
        const [topFieldName, topPercentage] = sortedFields[0];
        const topLabel = fieldMapping[topFieldName] || topFieldName;
        return `${topPercentage.toFixed(1)}%`;
      }
      return 'No data';
    }
  };
  
  const formatFieldBreakdown = (yearData: any) => {
    if (!yearData) return '';
    const { percentages } = calculateFieldPercentages(yearData);
    return Object.entries(percentages || {}).map(([fieldName, percentage]) => {
      const label = fieldMapping[fieldName] || fieldName;
      return `${label}: ${percentage.toFixed(1)}%`;
    }).join(' | ');
  };

  // Create indicator data structure from form submissions
  const createFormBasedData = () => {
    
    return {
      indicator_code: indicatorCode,
      title: databaseIndicator.title,
      unit: databaseIndicator.measurement_unit || 'Standard Unit',
      baseline: { 
        value: formatMultiFieldValue(baselineYear), 
        year: baselineYear ? baselineYear.year : '-', 
        source: baselineYear ? baselineYear.source : `${indicatorForms.length} active form(s)` 
      },
      progress: { 
        value: formatMultiFieldValue(progressYear), 
        year: progressYear ? progressYear.year : 'Ongoing', 
        source: progressYear ? progressYear.source : 'User-created forms' 
      },
      latest: { 
        value: formatMultiFieldValue(latestYear), 
        year: latestYear ? latestYear.year : '-', 
        source: latestYear ? latestYear.source : 'Active data collection' 
      },
      trend_analysis: hasData 
        ? `Multi-field data across ${yearlyData.length} years (${yearlyData.map(y => y.year).join(', ')}). Each year contains: ${formatFieldBreakdown(yearlyData[0])}. Total submissions: ${totalSubmissions}.`
        : totalSubmissions > 0 
          ? `This indicator has ${totalSubmissions} submissions but no numeric data found.`
          : `This indicator has ${indicatorForms.length} active data collection form(s) but no submissions yet.`,
      data_quality: hasData ? 'Good' : 'No data',
      // Add breakdown data for detailed view
      breakdown: hasData ? {
        years: yearlyData.map(y => y.year),
        fields: yearlyData.length > 0 ? Object.keys(yearlyData[0].allFields) : [],
        data: yearlyData.map(y => ({ year: y.year, values: y.allFields, source: y.source }))
      } : null
    };
  };

  // Use Balochistan data if available, otherwise create structure from form data
  const indicatorData = balochistandData || (databaseIndicator && indicatorForms.length > 0 ? createFormBasedData() : 
    databaseIndicator ? {
      indicator_code: indicatorCode,
      title: databaseIndicator.title,
      unit: databaseIndicator.measurement_unit || 'Standard Unit',
      baseline: { value: 'Not Available', year: '-', source: 'No data' },
      progress: { value: 'Not Available', year: '-', source: 'No data' },
      latest: { value: 'Not Available', year: '-', source: 'No data' },
      trend_analysis: 'No data collection forms exist for this indicator.',
      data_quality: 'No data'
    } : null);

  const exportToPDF = () => {
    if (!indicatorData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('SDG Indicator Analysis Report', 20, 25);
    
    // Indicator Info
    doc.setFontSize(14);
    doc.text(`Indicator ${indicatorCode}`, 20, 40);
    doc.setFontSize(12);
    const title = doc.splitTextToSize(indicatorData.title, pageWidth - 40);
    doc.text(title, 20, 50);
    
    // Data Summary Table
    const tableData = [
      ['Period', 'Source', 'Value'],
      [indicatorData.baseline.year, indicatorData.baseline.source, String(indicatorData.baseline.value)],
      [indicatorData.progress.year, indicatorData.progress.source, String(indicatorData.progress.value)],
      [indicatorData.latest.year, indicatorData.latest.source, String(indicatorData.latest.value)]
    ];

    (doc as any).autoTable({
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: 70,
      theme: 'grid'
    });

    // Trend Analysis
    if (indicatorData.trend_analysis) {
      doc.setFontSize(14);
      doc.text('Trend Analysis', 20, (doc as any).lastAutoTable.finalY + 20);
      doc.setFontSize(11);
      const analysis = doc.splitTextToSize(indicatorData.trend_analysis, pageWidth - 40);
      doc.text(analysis, 20, (doc as any).lastAutoTable.finalY + 35);
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20);
    doc.text('Balochistan SDG Data Management System', pageWidth - 20, doc.internal.pageSize.height - 20, { align: 'right' });

    doc.save(`SDG_Indicator_${indicatorCode}_Report.pdf`);
  };

  const shareData = () => {
    if (navigator.share && indicatorData) {
      navigator.share({
        title: `SDG Indicator ${indicatorCode}`,
        text: `${indicatorData.title}\n\nLatest Value: ${indicatorData.latest.value}\nSource: ${indicatorData.latest.source}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could add toast notification here
    }
  };

  if (!indicatorData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/sdg-management')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to SDG Management
          </Button>
          
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Indicator Not Found</h2>
            <p className="text-gray-600">
              No data available for indicator {indicatorCode}. Please check the indicator code or return to the main page.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const getTrendDirection = () => {
    const analysis = indicatorData.trend_analysis?.toLowerCase() || '';
    if (analysis.includes('improvement') || analysis.includes('increase') || analysis.includes('progress')) return 'up';
    if (analysis.includes('deterioration') || analysis.includes('decline') || analysis.includes('decrease')) return 'down';
    return 'stable';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/sdg-management')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                SDG Management
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono">{indicatorCode}</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Balochistan Data</Badge>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                  {indicatorData.title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={shareData}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
            <TabsTrigger value="timeline">Data Timeline</TabsTrigger>
            <TabsTrigger value="analysis">Analysis & Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Baseline Value"
                value={indicatorData.baseline.value}
                period={`${indicatorData.baseline.year} • ${indicatorData.baseline.source}`}
                icon={Calendar}
                color="bg-blue-500"
              />
              <MetricCard
                title="Progress Value"
                value={indicatorData.progress.value}
                period={`${indicatorData.progress.year} • ${indicatorData.progress.source}`}
                icon={BarChart3}
                color="bg-yellow-500"
              />
              <MetricCard
                title="Latest Value"
                value={indicatorData.latest.value}
                trend={getTrendDirection()}
                period={`${indicatorData.latest.year} • ${indicatorData.latest.source}`}
                icon={TrendingUp}
                color="bg-green-500"
              />
              <MetricCard
                title="Measurement Unit"
                value={indicatorData.unit}
                period="Standard Unit"
                icon={Percent}
                color="bg-purple-500"
              />
            </div>

            {/* Data Breakdowns - for Balochistan static data */}
            {!hasUserData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DataBreakdownCard
                  title="Baseline"
                  data={indicatorData.baseline}
                  color="bg-blue-500"
                />
                <DataBreakdownCard
                  title="Progress"
                  data={indicatorData.progress}
                  color="bg-yellow-500"
                />
                <DataBreakdownCard
                  title="Latest"
                  data={indicatorData.latest}
                  color="bg-green-500"
                />
              </div>
            )}

            {/* User Form Data with Enhanced Visualization */}
            {hasUserData && (
              <div className="space-y-6">
                {/* Main Data Cards for User Forms */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="Baseline Value"
                    value={formatMultiFieldValue(baselineYear)}
                    period={baselineYear ? `${baselineYear.year} • ${baselineYear.source}` : 'No data'}
                    icon={Calendar}
                    color="bg-blue-500"
                  />
                  <MetricCard
                    title="Progress Value"
                    value={formatMultiFieldValue(progressYear)}
                    period={progressYear ? `${progressYear.year} • ${progressYear.source}` : 'No data'}
                    icon={BarChart3}
                    color="bg-yellow-500"
                  />
                  <MetricCard
                    title="Latest Value"
                    value={formatMultiFieldValue(latestYear)}
                    period={latestYear ? `${latestYear.year} • ${latestYear.source}` : 'No data'}
                    icon={TrendingUp}
                    color="bg-green-500"
                  />
                  <MetricCard
                    title="Measurement Unit"
                    value="Multiple Types"
                    period="Field-based Data"
                    icon={Percent}
                    color="bg-purple-500"
                  />
                </div>

                {/* Latest Breakdown - Enhanced Table */}
                {latestYear && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Latest Breakdown
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {latestYear.year} • {latestYear.source}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(latestYear.allFields).map(([fieldName, value]) => {
                          const label = fieldMapping[fieldName] || fieldName.replace(/field_\d+/, 'Field');
                          const { percentages, total } = calculateFieldPercentages(latestYear);
                          const percentage = percentages[fieldName] || 0;
                          
                          return (
                            <div key={fieldName} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{label}</span>
                              <div className="text-right">
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {percentage.toFixed(1)}%
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ({value} of {total})
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Data Coverage</h4>
                    <p className="text-sm text-blue-800">
                      {indicatorData.baseline.year} - {indicatorData.latest.year} 
                      ({parseInt(indicatorData.latest.year) - parseInt(indicatorData.baseline.year)} years)
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Primary Sources</h4>
                    <p className="text-sm text-green-800">
                      {[indicatorData.baseline.source, indicatorData.progress.source, indicatorData.latest.source]
                        .filter((s, i, arr) => arr.indexOf(s) === i)
                        .slice(0, 2)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressChart data={indicatorData} />
              <UrbanRuralChart data={indicatorData} />
            </div>
            
            <BreakdownChart data={indicatorData} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Data Evolution Timeline
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Track the progression of this indicator across different reporting periods
                </p>
              </CardHeader>
              <CardContent>
                <TimelinePath data={indicatorData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTrendDirection() === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                    {getTrendDirection() === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                    {getTrendDirection() === 'stable' && <Activity className="h-5 w-5 text-gray-600" />}
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {indicatorData.trend_analysis ? (
                    <p className="text-gray-700 leading-relaxed">{indicatorData.trend_analysis}</p>
                  ) : (
                    <p className="text-gray-500 italic">No trend analysis available for this indicator.</p>
                  )}
                  
                  {indicatorData.data_quality && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Data Quality Assessment</span>
                      </div>
                      <p className="text-sm text-blue-700">{indicatorData.data_quality}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Sources & Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { period: indicatorData.baseline.year, source: indicatorData.baseline.source, type: 'Baseline' },
                      { period: indicatorData.progress.year, source: indicatorData.progress.source, type: 'Progress' },
                      { period: indicatorData.latest.year, source: indicatorData.latest.source, type: 'Latest' }
                    ].filter(item => item.source && item.source !== 'Not available').map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.source}</div>
                          <div className="text-sm text-gray-600">{item.period}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regional Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Balochistan Provincial Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Globe className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold mb-1">Geographic Scope</h4>
                    <p className="text-sm text-gray-700">
                      Balochistan Province, Pakistan's largest province by area with unique development challenges
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold mb-1">Population Context</h4>
                    <p className="text-sm text-gray-700">
                      Data represents provincial population across urban and rural areas with demographic disaggregation
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-semibold mb-1">SDG Alignment</h4>
                    <p className="text-sm text-gray-700">
                      Directly contributes to Pakistan's national SDG targets and provincial development priorities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};