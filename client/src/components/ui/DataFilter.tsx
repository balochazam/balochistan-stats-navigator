import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface DataFilterProps {
  title?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  onClearAll?: () => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export const DataFilter = ({
  title = "Filter Data",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClearAll,
  resultCount,
  totalCount,
  className = ""
}: DataFilterProps) => {
  const hasActiveFilters = searchValue || filters.some(filter => filter.value !== 'all');

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {title}
          </CardTitle>
          {resultCount !== undefined && totalCount !== undefined && (
            <Badge variant="secondary">
              {resultCount} of {totalCount} items
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          {filters.map((filter, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
            >
              <X className="h-3 w-3 mr-1" />
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};