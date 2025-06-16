
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Database, Building, User } from 'lucide-react';

interface DataBank {
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

interface DataBankListProps {
  dataBanks: DataBank[];
  onEdit: (dataBank: DataBank) => void;
  onDelete: (dataBankId: string) => void;
  onSelect: (dataBank: DataBank) => void;
  selectedDataBank: DataBank | null;
}

export const DataBankList = ({ 
  dataBanks, 
  onEdit, 
  onDelete, 
  onSelect, 
  selectedDataBank 
}: DataBankListProps) => {
  if (dataBanks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No data banks found</p>
          <p className="text-sm text-gray-500">Create your first data bank to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {dataBanks.map((dataBank) => (
        <Card 
          key={dataBank.id} 
          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedDataBank?.id === dataBank.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => onSelect(dataBank)}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-medium text-gray-900 truncate">{dataBank.name}</h3>
                </div>
                
                {dataBank.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dataBank.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {dataBank.department && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{dataBank.department.name}</span>
                    </div>
                  )}
                  
                  {dataBank.creator && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{dataBank.creator.full_name || dataBank.creator.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Created: {new Date(dataBank.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(dataBank);
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
                    onDelete(dataBank.id);
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
