import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Database, Plus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Real SDG indicator structures based on UN specifications
const INDICATOR_STRUCTURES = {
  "1.2.2": {
    title: "Proportion of men, women and children of all ages living in poverty in all its dimensions",
    type: "multi_dimensional",
    dimensions: [
      {
        name: "gender",
        label: "Gender",
        values: ["Male", "Female", "Total"]
      },
      {
        name: "age_group", 
        label: "Age Group",
        values: ["0-17 years", "18-64 years", "65+ years", "Total"]
      },
      {
        name: "location",
        label: "Location",
        values: ["Urban", "Rural", "Total"]
      }
    ],
    measurement: "percentage",
    methodology: "Multidimensional Poverty Index (MPI) calculation based on health, education, and living standards deprivations"
  },
  "3.1.1": {
    title: "Maternal mortality ratio",
    type: "ratio",
    structure: {
      numerator: "Number of maternal deaths during a given time period",
      denominator: "Number of live births during the same time period", 
      multiplier: 100000
    },
    measurement: "per 100,000 live births",
    methodology: "Deaths of women while pregnant or within 42 days of termination of pregnancy"
  },
  "4.1.1": {
    title: "Proportion of children achieving minimum proficiency in reading and mathematics",
    type: "demographic_breakdown",
    dimensions: [
      {
        name: "subject",
        label: "Subject",
        values: ["Reading", "Mathematics"]
      },
      {
        name: "grade",
        label: "Grade Level", 
        values: ["Grade 2-3", "Grade 4-6", "Grade 8-9"]
      },
      {
        name: "gender",
        label: "Gender",
        values: ["Boys", "Girls", "Total"]
      },
      {
        name: "location",
        label: "Location",
        values: ["Urban", "Rural", "Total"]
      }
    ],
    measurement: "percentage",
    methodology: "Based on national and international learning assessments"
  }
};

interface IndicatorDataEntryFormProps {
  indicator: {
    id: string;
    indicator_code: string;
    title: string;
    indicator_type: string;
    data_structure?: any;
    unit?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function IndicatorDataEntryForm({ indicator, onSubmit, onCancel }: IndicatorDataEntryFormProps) {
  const [dataEntries, setDataEntries] = useState<any[]>([]);
  const [timeframeData, setTimeframeData] = useState({
    year: new Date().getFullYear().toString(),
    quarter: "",
    month: ""
  });

  // Get real structure or use configured structure
  const indicatorStructure = INDICATOR_STRUCTURES[indicator.indicator_code as keyof typeof INDICATOR_STRUCTURES] 
    || indicator.data_structure;

  // Generate data entry matrix for multi-dimensional indicators
  const generateDataMatrix = () => {
    if (!indicatorStructure || !('dimensions' in indicatorStructure)) return [];
    
    const dimensions = indicatorStructure.dimensions;
    let combinations: any[] = [{}];
    
    // Generate all combinations of dimension values
    dimensions.forEach((dimension: any) => {
      const newCombinations: any[] = [];
      combinations.forEach(combo => {
        dimension.values.forEach((value: string) => {
          newCombinations.push({
            ...combo,
            [dimension.name]: value
          });
        });
      });
      combinations = newCombinations;
    });
    
    return combinations.map((combo, index) => ({
      id: index,
      ...combo,
      value: "",
      notes: ""
    }));
  };

  useEffect(() => {
    if (indicator.indicator_type === "multi_dimensional" || indicator.indicator_type === "demographic_breakdown") {
      setDataEntries(generateDataMatrix());
    }
  }, [indicator]);

  const updateDataEntry = (id: number, field: string, value: string) => {
    setDataEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSubmit = () => {
    const submissionData = {
      indicator_id: indicator.id,
      indicator_code: indicator.indicator_code,
      timeframe: timeframeData,
      data_type: indicator.indicator_type,
      entries: dataEntries,
      submitted_at: new Date().toISOString()
    };
    
    onSubmit(submissionData);
  };

  const renderSimpleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Value</label>
          <Input 
            type="number" 
            placeholder={`Enter ${indicator.unit || 'value'}`}
            onChange={(e) => setDataEntries([{ value: e.target.value }])}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Year</label>
          <Input 
            type="number"
            value={timeframeData.year}
            onChange={(e) => setTimeframeData(prev => ({ ...prev, year: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderRatioForm = () => {
    const structure = indicatorStructure && 'structure' in indicatorStructure ? indicatorStructure.structure : null;
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Ratio Calculation:</strong> {structure?.numerator} ÷ {structure?.denominator} × {structure?.multiplier}
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Numerator</label>
            <Input 
              type="number"
              placeholder={structure?.numerator}
              onChange={(e) => {
                const current = dataEntries[0] || {};
                setDataEntries([{ ...current, numerator: e.target.value }]);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Denominator</label>
            <Input 
              type="number"
              placeholder={structure?.denominator}
              onChange={(e) => {
                const current = dataEntries[0] || {};
                setDataEntries([{ ...current, denominator: e.target.value }]);
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Calculated Ratio</label>
            <Input 
              readOnly
              value={
                dataEntries[0]?.numerator && dataEntries[0]?.denominator 
                  ? ((parseFloat(dataEntries[0].numerator) / parseFloat(dataEntries[0].denominator)) * (structure?.multiplier || 1)).toFixed(2)
                  : ""
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Year</label>
            <Input 
              type="number"
              value={timeframeData.year}
              onChange={(e) => setTimeframeData(prev => ({ ...prev, year: e.target.value }))}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMultiDimensionalForm = () => {
    if (!indicatorStructure || !('dimensions' in indicatorStructure)) return renderSimpleForm();
    
    const dimensions = indicatorStructure.dimensions;
    
    return (
      <div className="space-y-6">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Multi-dimensional Data Entry:</strong> Enter values for each combination of {dimensions.map((d: any) => d.label).join(", ")}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input 
                type="number"
                value={timeframeData.year}
                onChange={(e) => setTimeframeData(prev => ({ ...prev, year: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quarter (Optional)</label>
              <Select value={timeframeData.quarter} onValueChange={(value) => setTimeframeData(prev => ({ ...prev, quarter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Data Source</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MICS">MICS Survey</SelectItem>
                  <SelectItem value="PDHS">PDHS</SelectItem>
                  <SelectItem value="PSLM">PSLM</SelectItem>
                  <SelectItem value="Census">Population Census</SelectItem>
                  <SelectItem value="Admin">Administrative Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {dimensions.map((dim: any) => (
                    <TableHead key={dim.name}>{dim.label}</TableHead>
                  ))}
                  <TableHead>Value ({indicatorStructure.measurement || indicator.unit})</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    {dimensions.map((dim: any) => (
                      <TableCell key={dim.name}>
                        <Badge variant="outline">{entry[dim.name]}</Badge>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.value}
                        onChange={(e) => updateDataEntry(entry.id, 'value', e.target.value)}
                        placeholder="0.00"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.notes}
                        onChange={(e) => updateDataEntry(entry.id, 'notes', e.target.value)}
                        placeholder="Optional notes"
                        className="w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderFormContent = () => {
    switch (indicator.indicator_type) {
      case "multi_dimensional":
      case "demographic_breakdown":
        return renderMultiDimensionalForm();
      case "ratio":
        return renderRatioForm();
      default:
        return renderSimpleForm();
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Data Entry: {indicator.indicator_code}
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{indicator.title}</p>
          {indicatorStructure?.methodology && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Methodology:</strong> {indicatorStructure.methodology}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderFormContent()}
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Data Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}