
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferenceData } from '@/hooks/useReferenceData';
import { Loader2 } from 'lucide-react';

interface ReferenceDataSelectProps {
  referenceDataName: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ReferenceDataSelect = ({
  referenceDataName,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className
}: ReferenceDataSelectProps) => {
  const { options, loading, error } = useReferenceData(referenceDataName);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Loading options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-red-50 border-red-200">
        <span className="text-sm text-red-600">Error: {error}</span>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50">
        <span className="text-sm text-gray-500">No options available</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
