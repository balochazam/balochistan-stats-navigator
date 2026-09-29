import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  BarChart3, PieChart as PieIcon, TrendingUp, Layers, 
  Download, Table as TableIcon, Search, ArrowUpDown, 
  Activity, Building, Award, Calendar, CheckSquare, Sparkles, Filter
} from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';

const PALETTE = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#059669', // Emerald
  '#db2777', // Pink
  '#d97706', // Amber
  '#4f46e5', // Indigo
  '#0284c7', // Sky
  '#e11d48', // Rose
  '#16a34a', // Green
  '#9333ea', // Violet
];

export interface MetricDefinition {
  key: string;
  label: string;
  shortLabel: string;
  groupName: string;
  isAggregate: boolean;
  unit?: string;
}

export interface CompositionGroup {
  name: string;
  metrics: MetricDefinition[];
}

interface FormVisualDashboardProps {
  schedule: {
    id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  };
  scheduleForm: {
    id: string;
    form_id: string;
    form: {
      id: string;
      name: string;
      description?: string | null;
      department?: { name: string } | null;
    };
  };
  formFields: any[];
  formSubmissions: any[];
  onSwitchToTable?: () => void;
  isStandalone?: boolean;
}

export const FormVisualDashboard = ({
  schedule,
  scheduleForm,
  formFields,
  formSubmissions,
  onSwitchToTable,
  isStandalone = false
}: FormVisualDashboardProps) => {
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ranking' | 'composition' | 'grouping' | 'distribution' | 'pareto' | 'entity' | 'trends'>('ranking');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'alpha'>('desc');
  const [displayCount, setDisplayCount] = useState<number>(20);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedEntityForDeepDive, setSelectedEntityForDeepDive] = useState<string>('');
  const [selectedCompositionGroupIdx, setSelectedCompositionGroupIdx] = useState<number>(0);

  // Cross-schedule historical data
  const [historicalSubmissions, setHistoricalSubmissions] = useState<any[]>([]);
  const [schedulesMap, setSchedulesMap] = useState<Record<string, any>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 1. DYNAMIC PRIMARY & SECONDARY DIMENSIONS DETECTION
  const { primaryKey, primaryLabel, secondaryKey, secondaryLabel, hasSecondaryDimension } = useMemo(() => {
    // Check if a field explicitly has is_primary_column === true
    const explicitPrimary = formFields.find((f: any) => f.is_primary_column);

    let primKey = explicitPrimary ? explicitPrimary.field_name : '';
    let primLabel = explicitPrimary ? explicitPrimary.field_label : '';

    // If no explicit primary column, search submissions keys for the first categorical/non-numeric field
    if (!primKey && formSubmissions && formSubmissions.length > 0) {
      const sample = formSubmissions[0].data || {};
      for (const field of formFields) {
        if (!field.has_sub_headers && field.field_type !== 'number' && field.field_type !== 'aggregate') {
          if (sample[field.field_name] !== undefined) {
            primKey = field.field_name;
            primLabel = field.field_label || field.field_name;
            break;
          }
        }
      }
    }

    // Fallback if still not found
    if (!primKey && formFields.length > 0) {
      primKey = formFields[0].field_name;
      primLabel = formFields[0].field_label || 'Entity';
    }

    // Check if there is an explicit or distinct secondary categorical column (e.g. Region, Category, Type)
    const explicitSecondary = formFields.find((f: any) => 
      f.is_secondary_column && 
      !f.has_sub_headers && 
      f.field_name !== primKey && 
      f.field_type !== 'number' && 
      f.field_type !== 'aggregate'
    );

    let secKey = explicitSecondary ? explicitSecondary.field_name : '';
    let secLabel = explicitSecondary ? explicitSecondary.field_label : '';

    // If no explicit secondary, inspect submission data for another categorical column
    if (!secKey && formSubmissions && formSubmissions.length > 0) {
      const sample = formSubmissions[0].data || {};
      for (const field of formFields) {
        if (
          field.field_name !== primKey &&
          !field.has_sub_headers &&
          field.field_type !== 'number' &&
          field.field_type !== 'aggregate' &&
          typeof sample[field.field_name] === 'string' &&
          sample[field.field_name].trim() !== '' &&
          isNaN(Number(sample[field.field_name]))
        ) {
          secKey = field.field_name;
          secLabel = field.field_label || field.field_name;
          break;
        }
      }
    }

    return {
      primaryKey: primKey || 'entity',
      primaryLabel: primLabel || 'Reporting Entity',
      secondaryKey: secKey,
      secondaryLabel: secLabel,
      hasSecondaryDimension: Boolean(secKey)
    };
  }, [formFields, formSubmissions]);

  // 2. DYNAMIC METRIC EXTRACTION & HIERARCHY DISCOVERY
  const { metrics, metricCategories, compositionGroups } = useMemo(() => {
    const list: MetricDefinition[] = [];
    const catMap = new Map<string, MetricDefinition[]>();
    const compGroups: CompositionGroup[] = [];

    // Helper to add metric
    const registerMetric = (m: MetricDefinition) => {
      list.push(m);
      const existing = catMap.get(m.groupName) || [];
      existing.push(m);
      catMap.set(m.groupName, existing);
    };

    // Traverse all form fields
    formFields.forEach((field: any) => {
      // If field has sub_headers (Hierarchical Multi-Level)
      if (field.has_sub_headers && Array.isArray(field.sub_headers) && field.sub_headers.length > 0) {
        field.sub_headers.forEach((subHeader: any) => {
          const subHeaderName = subHeader.label || subHeader.name;
          const currentSubHeaderMetrics: MetricDefinition[] = [];

          if (Array.isArray(subHeader.fields)) {
            subHeader.fields.forEach((subField: any) => {
              // Depth 2: Nested sub-headers
              if (subField.has_sub_headers && Array.isArray(subField.sub_headers) && subField.sub_headers.length > 0) {
                subField.sub_headers.forEach((nested: any) => {
                  const nestedName = nested.label || nested.name;
                  const nestedMetrics: MetricDefinition[] = [];
                  if (Array.isArray(nested.fields)) {
                    nested.fields.forEach((nField: any) => {
                      const key = `${field.field_name}_${subHeader.name}_${subField.field_name}_${nested.name}_${nField.field_name}`;
                      const metric: MetricDefinition = {
                        key,
                        groupName: `${field.field_label} → ${subHeaderName}`,
                        label: `${field.field_label} > ${subHeaderName} > ${nestedName} > ${nField.field_label}`,
                        shortLabel: `${nestedName} ${nField.field_label}`.trim(),
                        isAggregate: nField.field_type === 'aggregate' || nField.field_name.toLowerCase().includes('total')
                      };
                      registerMetric(metric);
                      currentSubHeaderMetrics.push(metric);
                      nestedMetrics.push(metric);
                    });
                  }
                  if (nestedMetrics.length > 1) {
                    compGroups.push({
                      name: `${subHeaderName} - ${nestedName}`,
                      metrics: nestedMetrics.filter(m => !m.isAggregate)
                    });
                  }
                });
              } else {
                // Depth 1: Standard sub-header
                const key = `${field.field_name}_${subHeader.name}_${subField.field_name}`;
                const metric: MetricDefinition = {
                  key,
                  groupName: `${field.field_label} (${subHeaderName})`,
                  label: `${field.field_label} > ${subHeaderName} > ${subField.field_label}`,
                  shortLabel: `${subHeaderName} ${subField.field_label}`.trim(),
                  isAggregate: subField.field_type === 'aggregate' || subField.field_name.toLowerCase().includes('total')
                };
                registerMetric(metric);
                currentSubHeaderMetrics.push(metric);
              }
            });
          }

          if (currentSubHeaderMetrics.length > 1) {
            compGroups.push({
              name: `${field.field_label} - ${subHeaderName}`,
              metrics: currentSubHeaderMetrics.filter(m => !m.isAggregate)
            });
          }
        });
      } else if (field.field_name !== primaryKey && field.field_name !== secondaryKey) {
        // Standalone column (could be numeric or aggregate)
        const metric: MetricDefinition = {
          key: field.field_name,
          groupName: scheduleForm.form.name || 'General',
          label: field.field_label || field.field_name,
          shortLabel: field.field_label || field.field_name,
          isAggregate: field.field_type === 'aggregate' || field.field_name.toLowerCase().includes('total')
        };
        registerMetric(metric);
      }
    });

    // If no composition groups were formed from sub-headers, but we have multiple standalone metrics,
    // create a general multi-metric comparison group
    if (compGroups.length === 0 && list.length > 1) {
      compGroups.push({
        name: 'All Metrics Comparison',
        metrics: list.filter(m => !m.isAggregate)
      });
    }

    return {
      metrics: list,
      metricCategories: Array.from(catMap.entries()).map(([name, items]) => ({ name, items })),
      compositionGroups: compGroups
    };
  }, [formFields, primaryKey, secondaryKey, scheduleForm.form.name]);

  // Set default selected metric
  useEffect(() => {
    if (metrics.length > 0 && !selectedMetricKey) {
      // Prefer an aggregate/total metric if available, otherwise first metric
      const defaultMetric = metrics.find(m => m.isAggregate) || metrics[0];
      setSelectedMetricKey(defaultMetric.key);
    }
  }, [metrics, selectedMetricKey]);

  const activeMetric = useMemo(() => {
    return metrics.find(m => m.key === selectedMetricKey) || metrics[0];
  }, [metrics, selectedMetricKey]);

  // Fetch cross-schedule historical submissions for multi-schedule trends
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const [allSubs, allScheds] = await Promise.all([
          simpleApiClient.get(`/api/form-submissions?formId=${scheduleForm.form_id}`),
          simpleApiClient.get('/api/schedules')
        ]);

        if (!isMounted) return;

        const sMap: Record<string, any> = {};
        if (Array.isArray(allScheds)) {
          allScheds.forEach(s => { sMap[s.id] = s; });
        }
        setSchedulesMap(sMap);
        setHistoricalSubmissions(Array.isArray(allSubs) ? allSubs : []);
      } catch (err) {
        console.error('Error fetching historical submissions:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    if (scheduleForm?.form_id) {
      loadHistory();
    }
    return () => { isMounted = false; };
  }, [scheduleForm?.form_id]);

  // 3. PROCESS SUBMISSIONS DYNAMICALLY
  const { dataPoints, stats, secondaryGroupingRollup, paretoData } = useMemo(() => {
    if (!activeMetric || !formSubmissions || formSubmissions.length === 0) {
      return {
        dataPoints: [],
        stats: { total: 0, avg: 0, max: 0, maxEntity: 'N/A', min: 0, minEntity: 'N/A', reportingCount: 0, nonZeroCount: 0 },
        secondaryGroupingRollup: [],
        paretoData: []
      };
    }

    const points: any[] = [];
    const secGroupMap = new Map<string, { total: number; count: number; entities: string[] }>();

    formSubmissions.forEach(sub => {
      const entityValue = sub.data?.[primaryKey] ?? `Entry ${sub.id.slice(0, 4)}`;
      const entity = String(entityValue).trim();
      const rawValue = sub.data?.[activeMetric.key];
      const numericVal = parseFloat(String(rawValue || 0).replace(/[^0-9.-]/g, '')) || 0;

      const item: Record<string, any> = {
        id: sub.id,
        entity: entity || 'Unknown',
        value: numericVal,
        secondaryDimension: secondaryKey ? String(sub.data?.[secondaryKey] || 'Unassigned').trim() : null,
        submittedAt: sub.submitted_at || sub.created_at
      };

      // Populate all other metrics on this row
      metrics.forEach(m => {
        const val = parseFloat(String(sub.data?.[m.key] || 0).replace(/[^0-9.-]/g, '')) || 0;
        item[m.key] = val;
      });

      points.push(item);

      // Accumulate secondary dimension if present
      if (hasSecondaryDimension && item.secondaryDimension) {
        const gName = item.secondaryDimension;
        const current = secGroupMap.get(gName) || { total: 0, count: 0, entities: [] };
        current.total += numericVal;
        current.count += 1;
        if (!current.entities.includes(entity)) current.entities.push(entity);
        secGroupMap.set(gName, current);
      }
    });

    // Filtering
    let filtered = points;
    if (searchFilter.trim()) {
      filtered = filtered.filter(p => p.entity.toLowerCase().includes(searchFilter.toLowerCase()));
    }

    // Sorting
    if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.value - a.value);
    } else if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.value - b.value);
    } else if (sortOrder === 'alpha') {
      filtered.sort((a, b) => a.entity.localeCompare(b.entity));
    }

    // Statistics calculation
    const nonZeroPoints = points.filter(p => p.value > 0);
    const total = points.reduce((acc, p) => acc + p.value, 0);
    const avg = points.length > 0 ? total / points.length : 0;

    let max = 0;
    let maxEntity = 'N/A';
    let min = Infinity;
    let minEntity = 'N/A';

    points.forEach(p => {
      if (p.value > max) {
        max = p.value;
        maxEntity = p.entity;
      }
      if (p.value < min && p.value > 0) {
        min = p.value;
        minEntity = p.entity;
      }
    });
    if (min === Infinity) min = 0;

    // Secondary Grouping Chart Data
    const secChartData = Array.from(secGroupMap.entries())
      .map(([name, data]) => ({
        group: name,
        total: Math.round(data.total * 10) / 10,
        count: data.count,
        avg: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
        entities: data.entities
      }))
      .sort((a, b) => b.total - a.total);

    // Pareto Cumulative Curve calculation
    const paretoSorted = [...points].sort((a, b) => b.value - a.value);
    let runningCumulative = 0;
    const paretoPoints = paretoSorted.map(p => {
      runningCumulative += p.value;
      const cumulativePercent = total > 0 ? Math.round((runningCumulative / total) * 1000) / 10 : 0;
      return {
        entity: p.entity,
        value: p.value,
        cumulativePercent
      };
    });

    return {
      dataPoints: filtered,
      stats: {
        total: Math.round(total * 10) / 10,
        avg: Math.round(avg * 10) / 10,
        max,
        maxEntity,
        min,
        minEntity,
        reportingCount: points.length,
        nonZeroCount: nonZeroPoints.length
      },
      secondaryGroupingRollup: secChartData,
      paretoData: paretoPoints
    };
  }, [activeMetric, formSubmissions, primaryKey, secondaryKey, hasSecondaryDimension, metrics, searchFilter, sortOrder]);

  // Set default deep dive entity
  useEffect(() => {
    if (dataPoints.length > 0 && !selectedEntityForDeepDive) {
      setSelectedEntityForDeepDive(dataPoints[0].entity);
    }
  }, [dataPoints, selectedEntityForDeepDive]);

  // Multi-Schedule historical progression
  const historicalTrendData = useMemo(() => {
    if (!historicalSubmissions || historicalSubmissions.length === 0 || !activeMetric) return [];

    const scheduleGroups = new Map<string, { year: string; scheduleName: string; total: number; count: number }>();

    historicalSubmissions.forEach(sub => {
      const sched = schedulesMap[sub.schedule_id];
      const schedName = sched?.name || 'Schedule ' + sub.schedule_id.slice(0, 4);
      let year = '2024';
      if (sched?.start_date) {
        year = new Date(sched.start_date).getFullYear().toString();
      } else {
        const match = schedName.match(/\b(20\d\d)\b/);
        if (match) year = match[1];
      }

      const key = sub.schedule_id;
      const current = scheduleGroups.get(key) || { year, scheduleName: schedName, total: 0, count: 0 };
      const rawVal = sub.data?.[activeMetric.key];
      const num = parseFloat(String(rawVal || 0).replace(/[^0-9.-]/g, '')) || 0;
      current.total += num;
      current.count += 1;
      scheduleGroups.set(key, current);
    });

    return Array.from(scheduleGroups.values())
      .sort((a, b) => a.year.localeCompare(b.year))
      .map(item => ({
        ...item,
        avg: item.count > 0 ? Math.round((item.total / item.count) * 10) / 10 : 0
      }));
  }, [historicalSubmissions, schedulesMap, activeMetric]);

  // Entity Deep Dive Profile
  const selectedEntityProfile = useMemo(() => {
    if (!selectedEntityForDeepDive) return null;
    const match = dataPoints.find(p => p.entity === selectedEntityForDeepDive);
    if (!match) return null;

    const metricBreakdown = metrics.map(m => {
      const val = match[m.key] || 0;
      const cohortTotal = dataPoints.reduce((acc, p) => acc + (p[m.key] || 0), 0);
      const cohortAvg = dataPoints.length > 0 ? cohortTotal / dataPoints.length : 0;
      const share = cohortTotal > 0 ? (val / cohortTotal) * 100 : 0;
      const variance = cohortAvg > 0 ? ((val - cohortAvg) / cohortAvg) * 100 : 0;

      return {
        ...m,
        value: val,
        cohortAvg: Math.round(cohortAvg * 10) / 10,
        cohortTotal: Math.round(cohortTotal * 10) / 10,
        share: Math.round(share * 10) / 10,
        variance: Math.round(variance * 10) / 10
      };
    });

    return {
      entity: selectedEntityForDeepDive,
      secondaryDimension: match.secondaryDimension,
      metrics: metricBreakdown
    };
  }, [selectedEntityForDeepDive, dataPoints, metrics]);

  // Active Composition Group
  const activeCompositionGroup = useMemo(() => {
    if (compositionGroups.length === 0) return null;
    return compositionGroups[selectedCompositionGroupIdx] || compositionGroups[0];
  }, [compositionGroups, selectedCompositionGroupIdx]);

  // Export Data CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) return;
    const headers = [
      `"${primaryLabel}"`,
      ...(hasSecondaryDimension ? [`"${secondaryLabel}"`] : []),
      ...metrics.map(m => `"${m.shortLabel.replace(/"/g, '""')}"`)
    ];

    const rows = dataPoints.map(p => {
      return [
        `"${p.entity}"`,
        ...(hasSecondaryDimension ? [`"${p.secondaryDimension || ''}"`] : []),
        ...metrics.map(m => p[m.key] ?? 0)
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${scheduleForm.form.name.replace(/[^a-zA-Z0-9]/g, '_')}_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 backdrop-blur-sm">
                <BarChart3 className="h-3 w-3 mr-1" />
                Visual Analytics Dashboard
              </Badge>
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                <Calendar className="h-3 w-3 mr-1" />
                {schedule.name}
              </Badge>
              <Badge variant="outline" className="text-blue-300 border-blue-700/50 bg-blue-900/30">
                Primary Dimension: <strong className="ml-1 text-white">{primaryLabel}</strong>
              </Badge>
              {hasSecondaryDimension && (
                <Badge variant="outline" className="text-purple-300 border-purple-700/50 bg-purple-900/30">
                  Grouped by: <strong className="ml-1 text-white">{secondaryLabel}</strong>
                </Badge>
              )}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">
              {scheduleForm.form.name}
            </h2>
            <p className="text-xs text-blue-200/80 mt-1 max-w-3xl">
              {scheduleForm.form.description || `Dynamic statistical analytics, distributions, and comparisons across all ${primaryLabel.toLowerCase()} entries.`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            {onSwitchToTable && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSwitchToTable}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Tabular View
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Dynamic Metric Switcher Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-300 mr-1 flex items-center">
              <Activity className="h-3.5 w-3.5 mr-1" />
              Active Metric:
            </span>
            {metrics.slice(0, 5).map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMetricKey(m.key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedMetricKey === m.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                {m.shortLabel}
                {m.isAggregate && <span className="ml-1 text-[10px] opacity-75">(Total)</span>}
              </button>
            ))}
          </div>

          {metrics.length > 5 && (
            <div className="w-full md:w-64">
              <Select value={selectedMetricKey} onValueChange={setSelectedMetricKey}>
                <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All Metrics..." />
                </SelectTrigger>
                <SelectContent>
                  {metricCategories.map(cat => (
                    <div key={cat.name} className="py-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {cat.name}
                      </div>
                      {cat.items.map(m => (
                        <SelectItem key={m.key} value={m.key} className="text-xs">
                          {m.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-600 shadow-sm bg-gradient-to-br from-white to-blue-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-gray-500 flex items-center">
              <Activity className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Overall Total
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 truncate">
              {stats.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-gray-500 truncate block">
              Sum across all {primaryLabel.toLowerCase()}s
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600 shadow-sm bg-gradient-to-br from-white to-teal-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-gray-500 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-teal-600" />
              Average Value
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 truncate">
              {stats.avg.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-gray-500 truncate block">
              Mean per {primaryLabel.toLowerCase()}
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm bg-gradient-to-br from-white to-emerald-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-gray-500 flex items-center">
              <Award className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Highest {primaryLabel}
            </CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-700 truncate">
              {stats.max.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] font-semibold text-gray-700 truncate block" title={stats.maxEntity}>
              {stats.maxEntity}
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600 shadow-sm bg-gradient-to-br from-white to-amber-50/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-gray-500 flex items-center">
              <CheckSquare className="h-3.5 w-3.5 mr-1 text-amber-600" />
              Total Records
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stats.reportingCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-gray-500 truncate block">
              {stats.nonZeroCount} reported non-zero
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-sm bg-gradient-to-br from-white to-purple-50/20 col-span-2 md:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-gray-500 flex items-center">
              <Layers className="h-3.5 w-3.5 mr-1 text-purple-600" />
              Metrics Discovered
            </CardDescription>
            <CardTitle className="text-xl font-bold text-purple-900 truncate">
              {metrics.length} Columns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-gray-500 truncate block">
              In {metricCategories.length} category groups
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualizations Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 rounded-lg border shadow-sm">
          <TabsList className="bg-gray-100 p-1 flex-wrap h-auto">
            <TabsTrigger value="ranking" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              {primaryLabel} Ranking
            </TabsTrigger>

            {compositionGroups.length > 0 && (
              <TabsTrigger value="composition" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Category Breakdown
              </TabsTrigger>
            )}

            {hasSecondaryDimension && (
              <TabsTrigger value="grouping" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                {secondaryLabel} Rollup
              </TabsTrigger>
            )}

            <TabsTrigger value="distribution" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
              <PieIcon className="h-3.5 w-3.5" />
              Share of Total
            </TabsTrigger>

            <TabsTrigger value="pareto" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Cumulative Concentration
            </TabsTrigger>

            <TabsTrigger value="entity" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              {primaryLabel} Profile
            </TabsTrigger>

            {historicalTrendData.length > 1 && (
              <TabsTrigger value="trends" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Multi-Year Trend
              </TabsTrigger>
            )}
          </TabsList>

          {/* Controls for current active tab */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'ranking' && (
              <>
                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder={`Filter ${primaryLabel}...`}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                  <SelectTrigger className="h-8 text-xs w-28">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Highest First</SelectItem>
                    <SelectItem value="asc">Lowest First</SelectItem>
                    <SelectItem value="alpha">A to Z</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(displayCount)} onValueChange={(v) => setDisplayCount(Number(v))}>
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                    <SelectItem value="35">Top 35</SelectItem>
                    <SelectItem value="100">All ({dataPoints.length})</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {/* TAB 1: PRIMARY ENTITY RANKING */}
        <TabsContent value="ranking" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    {primaryLabel} Comparison: {activeMetric?.label}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Distribution across {dataPoints.length} reporting {primaryLabel.toLowerCase()} entries with average benchmark ({stats.avg.toLocaleString()}).
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Showing {Math.min(displayCount, dataPoints.length)} of {dataPoints.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {dataPoints.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                  No records match the current filter.
                </div>
              ) : (
                <div className="h-[420px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataPoints.slice(0, displayCount)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 65 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="entity" 
                        angle={-45} 
                        textAnchor="end" 
                        interval={0}
                        height={65}
                        tick={{ fontSize: 11, fill: '#475569' }} 
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                      <RechartsTooltip
                        formatter={(val: any) => [
                          `${Number(val).toLocaleString()} (${stats.total > 0 ? ((Number(val) / stats.total) * 100).toFixed(1) + '%' : '0%'})`,
                          activeMetric?.shortLabel
                        ]}
                        labelFormatter={(label) => `${primaryLabel}: ${label}`}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <ReferenceLine 
                        y={stats.avg} 
                        stroke="#ea580c" 
                        strokeDasharray="4 4" 
                        label={{ 
                          value: `Average: ${stats.avg.toLocaleString()}`, 
                          fill: '#ea580c', 
                          fontSize: 11, 
                          position: 'top' 
                        }} 
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#2563eb" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={500}
                      >
                        {dataPoints.slice(0, displayCount).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.value >= stats.avg ? '#2563eb' : '#93c5fd'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: DYNAMIC COMPOSITION / STACKED CHARTS */}
        {compositionGroups.length > 0 && activeCompositionGroup && (
          <TabsContent value="composition" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      Component Breakdown across {primaryLabel}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      Side-by-side sub-category contributions for each reporting entry.
                    </CardDescription>
                  </div>

                  {compositionGroups.length > 1 && (
                    <div className="w-56">
                      <Select 
                        value={String(selectedCompositionGroupIdx)} 
                        onValueChange={(val) => setSelectedCompositionGroupIdx(Number(val))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {compositionGroups.map((g, idx) => (
                            <SelectItem key={idx} value={String(idx)} className="text-xs">
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[430px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataPoints.slice(0, displayCount)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 65 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="entity" 
                        angle={-45} 
                        textAnchor="end" 
                        interval={0}
                        height={65}
                        tick={{ fontSize: 11, fill: '#475569' }} 
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8 }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                      {activeCompositionGroup.metrics.map((m, idx) => (
                        <Bar
                          key={m.key}
                          dataKey={m.key}
                          name={m.shortLabel}
                          fill={PALETTE[idx % PALETTE.length]}
                          stackId="a"
                          radius={idx === activeCompositionGroup.metrics.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB 3: DYNAMIC SECONDARY DIMENSION GROUPING (Only when secondary dimension actually exists) */}
        {hasSecondaryDimension && (
          <TabsContent value="grouping" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-emerald-600" />
                    Aggregation by {secondaryLabel}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Totals grouped by the form's secondary dimension ({secondaryLabel}).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={secondaryGroupingRollup}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 70, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                        <YAxis 
                          type="category" 
                          dataKey="group" 
                          tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }} 
                        />
                        <RechartsTooltip
                          formatter={(val: any) => [
                            `${Number(val).toLocaleString()} (${stats.total > 0 ? ((Number(val) / stats.total) * 100).toFixed(1) + '%' : '0%'})`,
                            'Group Total'
                          ]}
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="#0d9488" 
                          radius={[0, 4, 4, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Group Summary Cards */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {secondaryLabel} Summary
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Group totals and contribution share
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[380px] overflow-y-auto">
                    {secondaryGroupingRollup.map((grp, i) => {
                      const share = stats.total > 0 ? (grp.total / stats.total) * 100 : 0;
                      return (
                        <div key={grp.group} className="p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                              {grp.group}
                            </span>
                            <span className="font-bold text-gray-800">{grp.total.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>{grp.count} {primaryLabel.toLowerCase()} entries</span>
                            <span className="text-emerald-700 font-medium">{share.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 rounded-full" 
                              style={{ width: `${Math.min(share, 100)}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* TAB 4: DISTRIBUTION & SHARE (Donut + Leaderboard) */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-purple-600" />
                  Top {primaryLabel} Share
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Relative proportion contributed by leading entries vs. the remainder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const top5 = dataPoints.slice(0, 5);
                          const top5Total = top5.reduce((acc, d) => acc + d.value, 0);
                          const remainingTotal = Math.max(0, stats.total - top5Total);
                          const slices = top5.map(d => ({ name: d.entity, value: d.value }));
                          if (remainingTotal > 0 && dataPoints.length > 5) {
                            slices.push({ name: `Remaining (${dataPoints.length - 5})`, value: remainingTotal });
                          }
                          return slices;
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={115}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dataPoints.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: any) => [
                          `${Number(val).toLocaleString()} (${stats.total > 0 ? ((Number(val) / stats.total) * 100).toFixed(1) + '%' : '0%'})`,
                          activeMetric?.shortLabel
                        ]}
                        contentStyle={{ borderRadius: 8 }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Ranking Leaderboard */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Ranked Leaderboard
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Top entries by {activeMetric?.shortLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[360px] overflow-y-auto">
                  {dataPoints.slice(0, 10).map((d, index) => {
                    const percent = stats.total > 0 ? (d.value / stats.total) * 100 : 0;
                    return (
                      <div key={d.entity + index} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-amber-100 text-amber-800' :
                            index === 1 ? 'bg-slate-200 text-slate-800' :
                            index === 2 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-gray-900">{d.entity}</span>
                            {d.secondaryDimension && (
                              <span className="text-[11px] text-gray-500 block">{d.secondaryDimension}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">{d.value.toLocaleString()}</span>
                          <span className="text-[11px] text-blue-600 block">{percent.toFixed(1)}% share</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 5: PARETO CUMULATIVE CONCENTRATION */}
        <TabsContent value="pareto" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Cumulative Concentration (Pareto Analysis)
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Identifies how rapidly volume concentrates among top reporting {primaryLabel.toLowerCase()} entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={paretoData.slice(0, displayCount)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 65 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="entity" 
                      angle={-45} 
                      textAnchor="end" 
                      interval={0}
                      height={65}
                      tick={{ fontSize: 11, fill: '#475569' }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickFormatter={(val) => `${val}%`} 
                      tick={{ fontSize: 11, fill: '#475569' }} 
                    />
                    <RechartsTooltip
                      formatter={(val: any) => [`${val}%`, 'Cumulative Share']}
                      labelFormatter={(label) => `${primaryLabel}: ${label}`}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <ReferenceLine y={80} stroke="#ea580c" strokeDasharray="3 3" label={{ value: '80% Benchmark', fill: '#ea580c', fontSize: 11 }} />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativePercent" 
                      stroke="#7c3aed" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#7c3aed' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: ENTITY DEEP DIVE PROFILE */}
        <TabsContent value="entity" className="space-y-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Select {primaryLabel} for Statistical Scorecard:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {selectedEntityForDeepDive || 'Select an entity'}
                </span>
              </div>
            </div>

            <div className="w-72">
              <Select value={selectedEntityForDeepDive} onValueChange={setSelectedEntityForDeepDive}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={`Select ${primaryLabel}...`} />
                </SelectTrigger>
                <SelectContent>
                  {dataPoints.map(p => (
                    <SelectItem key={p.entity} value={p.entity} className="text-xs">
                      {p.entity} {p.secondaryDimension ? `(${p.secondaryDimension})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEntityProfile && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2 border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {selectedEntityProfile.entity}
                    </CardTitle>
                    {selectedEntityProfile.secondaryDimension && (
                      <CardDescription className="text-xs text-gray-500">
                        {secondaryLabel}: {selectedEntityProfile.secondaryDimension}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs bg-white">
                    {selectedEntityProfile.metrics.length} Recorded Metrics
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50 text-gray-600 font-semibold text-left">
                        <th className="p-3 pl-4">Metric & Hierarchy</th>
                        <th className="p-3">Category Group</th>
                        <th className="p-3 text-right">Entity Value</th>
                        <th className="p-3 text-right">Cohort Average</th>
                        <th className="p-3 text-right">Share of Total</th>
                        <th className="p-3 text-right pr-4">Variance from Mean</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedEntityProfile.metrics.map(m => (
                        <tr key={m.key} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3 pl-4 font-medium text-gray-900">
                            {m.label}
                            {m.isAggregate && (
                              <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1">
                                Total
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-gray-500">{m.groupName}</td>
                          <td className="p-3 text-right font-bold text-gray-900">
                            {m.value.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-gray-600">
                            {m.cohortAvg.toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-blue-600 font-medium">
                            {m.share.toFixed(1)}%
                          </td>
                          <td className="p-3 text-right pr-4">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              m.variance > 0 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : m.variance < 0 
                                  ? 'bg-rose-50 text-rose-700' 
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {m.variance > 0 ? `+${m.variance}%` : `${m.variance}%`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 7: MULTI-SCHEDULE HISTORICAL PROGRESSION */}
        {historicalTrendData.length > 1 && (
          <TabsContent value="trends" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Progression Across Schedules: {activeMetric?.shortLabel}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Tracking overall total changes across different collection schedules / years.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[360px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={historicalTrendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                      <RechartsTooltip
                        formatter={(val: any) => [`${Number(val).toLocaleString()}`, 'Total']}
                        labelFormatter={(_, payload) => payload[0]?.payload?.scheduleName || ''}
                        contentStyle={{ borderRadius: 8 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#trendGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
