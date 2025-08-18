import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Download, 
  Plus, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Grid3X3
} from 'lucide-react';
import { simpleApiClient } from '@/lib/simpleApi';

interface YearlySummaryReport {
  id: string;
  name: string;
  description?: string;
  form_id: string;
  report_type: 'vertical' | 'horizontal';
  years_included: string[];
  report_data: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Form {
  id: string;
  name: string;
  description?: string;
  department_id: string;
}

interface YearlyData {
  [year: string]: any[];
}

export default function YearlySummaryReports() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [reportType, setReportType] = useState<'vertical' | 'horizontal'>('vertical');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData>({});
  const [selectedReport, setSelectedReport] = useState<YearlySummaryReport | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all forms
  const { data: forms = [], isLoading: formsLoading } = useQuery({
    queryKey: ['/api/forms'],
    queryFn: () => simpleApiClient.get('/api/forms')
  });

  // Fetch yearly summary reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/yearly-summary-reports'],
    queryFn: () => simpleApiClient.get('/api/yearly-summary-reports')
  });

  // Fetch yearly data for selected form
  const fetchYearlyData = async (formId: string) => {
    try {
      const data = await simpleApiClient.get(`/api/forms/${formId}/yearly-data`);
      setYearlyData(data);
      setAvailableYears(Object.keys(data).sort());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch yearly data",
        variant: "destructive"
      });
    }
  };

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (data: any) => simpleApiClient.post('/api/yearly-summary-reports/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yearly-summary-reports'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Yearly summary report generated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to generate report",
        variant: "destructive"
      });
    }
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (id: string) => simpleApiClient.delete(`/api/yearly-summary-reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yearly-summary-reports'] });
      toast({
        title: "Success",
        description: "Report deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete report",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setSelectedForm(null);
    setReportType('vertical');
    setReportName('');
    setReportDescription('');
    setSelectedYears([]);
    setAvailableYears([]);
    setYearlyData({});
  };

  const handleFormSelect = (formId: string) => {
    const form = forms.find((f: Form) => f.id === formId);
    if (form) {
      setSelectedForm(form);
      fetchYearlyData(formId);
    }
  };

  const handleYearToggle = (year: string) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const handleGenerateReport = () => {
    if (!selectedForm || selectedYears.length === 0) {
      toast({
        title: "Error",
        description: "Please select a form and at least one year",
        variant: "destructive"
      });
      return;
    }

    generateReportMutation.mutate({
      formId: selectedForm.id,
      reportType,
      years: selectedYears,
      name: reportName || `${selectedForm.name} - ${reportType === 'vertical' ? 'Multi-Year' : 'Cross-Year'} Summary`,
      description: reportDescription
    });
  };

  const exportReportData = (report: YearlySummaryReport) => {
    const csvContent = generateCSVContent(report);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name}_${report.report_type}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVContent = (report: YearlySummaryReport): string => {
    const { report_data, report_type } = report;
    
    if (report_type === 'vertical') {
      const headers = ['Year', ...report_data.headers, 'Total'];
      const rows = [
        headers,
        ...report_data.rows.map((row: any) => [
          row.year,
          ...report_data.headers.map((header: string) => 
            row.data[Object.keys(row.data).find(key => key.includes(header.toLowerCase())) || ''] || 0
          ),
          row.total
        ]),
        [
          report_data.totalsRow.year,
          ...report_data.headers.map((header: string) => 
            report_data.totalsRow.data[Object.keys(report_data.totalsRow.data).find(key => key.includes(header.toLowerCase())) || ''] || 0
          ),
          report_data.totalsRow.total
        ]
      ];
      
      return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    } else {
      const headers = report_data.headers;
      const rows = [
        headers,
        ...report_data.rows.map((row: any) => [
          row.entity,
          ...Object.values(row.yearlyTotals),
          row.grandTotal
        ]),
        [
          report_data.totalsRow.entity,
          ...Object.values(report_data.totalsRow.yearlyTotals),
          report_data.totalsRow.grandTotal
        ]
      ];
      
      return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
  };

  const renderReportTable = (report: YearlySummaryReport) => {
    const { report_data, report_type } = report;
    
    if (report_type === 'vertical') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Year</th>
                {report_data.headers.map((header: string, index: number) => (
                  <th key={index} className="border border-gray-300 px-3 py-2 text-center font-semibold">
                    {header}
                  </th>
                ))}
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold bg-blue-50">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {report_data.rows.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium">{row.year}</td>
                  {report_data.headers.map((header: string, colIndex: number) => {
                    const fieldKey = Object.keys(row.data).find(key => 
                      key.toLowerCase().includes(header.toLowerCase().replace(/\s+/g, '_'))
                    );
                    return (
                      <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                        {row.data[fieldKey || ''] || 0}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-blue-50">
                    {row.total}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-blue-100 font-semibold">
                <td className="border border-gray-300 px-3 py-2">{report_data.totalsRow.year}</td>
                {report_data.headers.map((header: string, colIndex: number) => {
                  const fieldKey = Object.keys(report_data.totalsRow.data).find(key => 
                    key.toLowerCase().includes(header.toLowerCase().replace(/\s+/g, '_'))
                  );
                  return (
                    <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                      {report_data.totalsRow.data[fieldKey || ''] || 0}
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-3 py-2 text-center bg-blue-200">
                  {report_data.totalsRow.total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else {
      // Horizontal layout
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {report_data.headers.map((header: string, index: number) => (
                  <th 
                    key={index} 
                    className={`border border-gray-300 px-3 py-2 text-center font-semibold ${
                      index === 0 ? 'text-left' : index === report_data.headers.length - 1 ? 'bg-blue-50' : ''
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report_data.rows.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium">{row.entity}</td>
                  {Object.values(row.yearlyTotals).map((total: any, colIndex: number) => (
                    <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                      {total}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-blue-50">
                    {row.grandTotal}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-blue-100 font-semibold">
                <td className="border border-gray-300 px-3 py-2">{report_data.totalsRow.entity}</td>
                {Object.values(report_data.totalsRow.yearlyTotals).map((total: any, colIndex: number) => (
                  <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                    {total}
                  </td>
                ))}
                <td className="border border-gray-300 px-3 py-2 text-center bg-blue-200">
                  {report_data.totalsRow.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Yearly Summary Reports</h2>
          <p className="text-gray-600">Generate and manage multi-year form data summaries</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Yearly Summary Report</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Form Selection */}
              <div className="space-y-2">
                <Label htmlFor="form-select">Select Form</Label>
                <Select onValueChange={handleFormSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a form to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((form: Form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Report Type */}
              <div className="space-y-2">
                <Label>Report Layout</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-colors ${reportType === 'vertical' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setReportType('vertical')}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <div>
                          <h4 className="font-semibold">Vertical Layout</h4>
                          <p className="text-sm text-gray-600">Years as rows, fields as columns</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-colors ${reportType === 'horizontal' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setReportType('horizontal')}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2">
                        <Grid3X3 className="h-5 w-5" />
                        <div>
                          <h4 className="font-semibold">Horizontal Layout</h4>
                          <p className="text-sm text-gray-600">Entities as rows, years as columns (totals only)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Year Selection */}
              {availableYears.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Years to Include</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {availableYears.map(year => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={year}
                          checked={selectedYears.includes(year)}
                          onCheckedChange={() => handleYearToggle(year)}
                        />
                        <Label htmlFor={year} className="text-sm">
                          {year} ({yearlyData[year]?.length || 0} entries)
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedYears.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Selected: {selectedYears.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Report Details */}
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name (Optional)</Label>
                <Input
                  id="report-name"
                  placeholder="Custom report name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description">Description (Optional)</Label>
                <Textarea
                  id="report-description"
                  placeholder="Describe the purpose or scope of this report"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedForm || selectedYears.length === 0 || generateReportMutation.isPending}
                >
                  {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      {reportsLoading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No yearly summary reports generated yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Click "Generate Report" to create your first yearly summary
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report: YearlySummaryReport) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {report.report_type === 'vertical' ? (
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Grid3X3 className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      {report.description && (
                        <p className="text-gray-600 text-sm">{report.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">
                          {report.report_type === 'vertical' ? 'Multi-Year' : 'Cross-Year'} Layout
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{report.years_included.join(', ')}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Created {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReportData(report)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedReport?.id === report.id ? 'Hide' : 'View'} Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReportMutation.mutate(report.id)}
                      disabled={deleteReportMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {selectedReport?.id === report.id && (
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Report Data</h4>
                    {renderReportTable(report)}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}