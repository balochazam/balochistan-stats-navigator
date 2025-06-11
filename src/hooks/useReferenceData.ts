
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
        const { data: referenceDataSet, error: dataSetError } = await supabase
          .from('data_banks')
          .select('id')
          .eq('name', referenceDataName)
          .eq('is_active', true)
          .maybeSingle();

        if (dataSetError) {
          throw dataSetError;
        }

        if (!referenceDataSet) {
          setError(`Reference data set "${referenceDataName}" not found`);
          setOptions([]);
          return;
        }

        // Then fetch the entries
        const { data: entries, error: entriesError } = await supabase
          .from('data_bank_entries')
          .select('key, value')
          .eq('data_bank_id', referenceDataSet.id)
          .eq('is_active', true)
          .order('value');

        if (entriesError) {
          throw entriesError;
        }

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
