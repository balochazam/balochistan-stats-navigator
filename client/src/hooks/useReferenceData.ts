
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface ReferenceDataOption {
  key: string;
  value: string;
}

export const useReferenceData = (referenceDataName: string) => {
  const [options, setOptions] = useState<ReferenceDataOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, find the reference data set by name
        const dataBanks = await apiClient.get('/api/data-banks');
        const referenceDataSet = dataBanks.find((bank: any) => 
          bank.name === referenceDataName && bank.is_active
        );

        if (!referenceDataSet) {
          setError(`Reference data set "${referenceDataName}" not found`);
          setOptions([]);
          return;
        }

        // Then fetch the entries
        const entries = await apiClient.get(`/api/data-banks/${referenceDataSet.id}/entries`);

        setOptions(entries || []);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    if (referenceDataName) {
      fetchReferenceData();
    }
  }, [referenceDataName]);

  return { options, loading, error };
};
