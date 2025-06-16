
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, List, Building, User } from 'lucide-react';

interface ReferenceData {
  id: string;
  name: string;
  description: string | null;
  department_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  department?: {
    name: string;
  };
  creator?: {
    full_name: string | null;
    email: string;
  };
}

interface ReferenceDataListProps {
  referenceDataSets: ReferenceData[];
  onEdit: (referenceData: ReferenceData) => void;
  onDelete: (referenceDataId: string) => void;
  onSelect: (referenceData: ReferenceData) => void;
  selectedReferenceData: ReferenceData | null;
}

export const ReferenceDataList = ({ 
  referenceDataSets, 
  onEdit, 
  onDelete, 
  onSelect, 
  selectedReferenceData 
}: ReferenceDataListProps) => {
  if (referenceDataSets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No reference data sets found</p>
          <p className="text-sm text-gray-500">Create your first reference data set for dropdown options</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {referenceDataSets.map((referenceData) => (
        <Card 
          key={referenceData.id} 
          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedReferenceData?.id === referenceData.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => onSelect(referenceData)}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <List className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-medium text-gray-900 truncate">{referenceData.name}</h3>
                </div>
                
                {referenceData.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{referenceData.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {referenceData.department && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{referenceData.department.name}</span>
                    </div>
                  )}
                  
                  {referenceData.creator && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{referenceData.creator.full_name || referenceData.creator.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Created: {new Date(referenceData.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(referenceData);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(referenceData.id);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
