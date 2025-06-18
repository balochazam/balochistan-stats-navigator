
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
  excludeValues?: string[];
}

export const ReferenceDataSelect = ({
  referenceDataName,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  excludeValues = []
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

  // Filter out excluded values (for duplicate prevention in primary columns)
  const filteredOptions = options.filter(option => !excludeValues.includes(option.key));

  if (filteredOptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-yellow-50 border-yellow-200">
        <span className="text-sm text-yellow-700">
          {excludeValues.length > 0 ? "All options have been used" : "No options available"}
        </span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
