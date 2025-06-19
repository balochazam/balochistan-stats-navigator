import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { simpleApiClient } from '@/lib/simpleApi';

interface MultiOptionSelectProps {
  referenceDataName: string;
  fieldName: string;
  fieldLabel: string;
  isRequired?: boolean;
  formData: Record<string, any>;
  onValueChange: (optionName: string, value: string) => void;
}

interface ReferenceDataOption {
  id: string;
  key: string;
  value: string;
}

export const MultiOptionSelect = ({ 
  referenceDataName, 
  fieldName, 
  fieldLabel, 
  isRequired = false, 
  formData, 
  onValueChange 
}: MultiOptionSelectProps) => {
  const [options, setOptions] = useState<ReferenceDataOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        console.log('Fetching reference data for multi-option select:', referenceDataName);
        
        // First get the data bank
        const dataBanks = await simpleApiClient.get('/api/data-banks');
        const dataBank = dataBanks?.find((bank: any) => bank.name === referenceDataName);
        
        if (dataBank) {
          // Then get the entries
          const entries = await simpleApiClient.get(`/api/data-banks/${dataBank.id}/entries`);
          console.log('Multi-option select entries:', entries);
          setOptions(entries || []);
        }
      } catch (error) {
        console.error('Error fetching multi-option select data:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    if (referenceDataName) {
      fetchOptions();
    }
  }, [referenceDataName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{fieldLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Loading options...</div>
        </CardContent>
      </Card>
    );
  }

  if (options.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{fieldLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">No options available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          {fieldLabel}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
        <div className="text-xs text-gray-600">
          Enter data for each option below
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {options.map((option) => {
            const optionFieldName = `${fieldName}_${option.key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            const currentValue = formData[optionFieldName] || '';
            
            return (
              <div key={option.id} className="space-y-2">
                <Label 
                  htmlFor={optionFieldName} 
                  className="text-sm font-medium"
                >
                  {option.value}
                </Label>
                <Input
                  id={optionFieldName}
                  name={optionFieldName}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentValue}
                  onChange={(e) => onValueChange(optionFieldName, e.target.value)}
                  placeholder="Enter value"
                  className="text-sm"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};