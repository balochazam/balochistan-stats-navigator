
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Tag, Save, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface ReferenceData {
  id: string;
  name: string;
}

interface ReferenceDataEntry {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  creator?: {
    full_name: string | null;
    email: string;
  };
}

interface ReferenceDataEntriesProps {
  referenceData: ReferenceData;
}

export const ReferenceDataEntries = ({ referenceData }: ReferenceDataEntriesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ReferenceDataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [bulkEntries, setBulkEntries] = useState('');
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [isAddingBulk, setIsAddingBulk] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [referenceData.id]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('data_bank_entries')
        .select(`
          *,
          creator:profiles!data_bank_entries_created_by_fkey(full_name, email)
        `)
        .eq('data_bank_id', referenceData.id)
        .eq('is_active', true)
        .order('value');

      if (error) {
        console.error('Error fetching entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch options",
          variant: "destructive",
        });
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error in fetchEntries:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = (value: string): string => {
    return value.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  };

  const handleAddBulkEntries = async () => {
    if (!user || !bulkEntries.trim()) {
      toast({
        title: "Error",
        description: "Please enter some options to add",
        variant: "destructive",
      });
      return;
    }

    try {
      const entriesText = bulkEntries.trim();
      const entryValues = entriesText
        .split(/[,\n]/)
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);

      if (entryValues.length === 0) {
        toast({
          title: "Error",
          description: "No valid entries found",
          variant: "destructive",
        });
        return;
      }

      const entriesToInsert = entryValues.map(value => ({
        data_bank_id: referenceData.id,
        key: generateKey(value),
        value: value,
        created_by: user.id
      }));

      const { error } = await supabase
        .from('data_bank_entries')
        .insert(entriesToInsert);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Warning",
            description: "Some entries already exist and were skipped",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: `${entryValues.length} option(s) added successfully`,
        });
      }

      setBulkEntries('');
      setIsAddingBulk(false);
      fetchEntries();
    } catch (error) {
      console.error('Error adding entries:', error);
      toast({
        title: "Error",
        description: "Failed to add options",
        variant: "destructive",
      });
    }
  };

  function handleEditEntry(entry: ReferenceDataEntry) {
    setEditingEntry(entry.id);
    setEditValues(prev => ({
      ...prev,
      [entry.id]: entry.value
    }));
  }

  async function handleSaveEdit(entryId: string) {
    const editValue = editValues[entryId];
    if (!editValue || !editValue.trim()) {
      toast({
        title: "Error",
        description: "Value is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newKey = generateKey(editValue.trim());
      const { error } = await supabase
        .from('data_bank_entries')
        .update({
          key: newKey,
          value: editValue.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "An option with this value already exists",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Option updated successfully",
      });
      
      setEditingEntry(null);
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[entryId];
        return newValues;
      });
      fetchEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: "Error",
        description: "Failed to update option",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteEntry(entryId: string) {
    if (!confirm('Are you sure you want to delete this option?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('data_bank_entries')
        .update({ is_active: false })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Option deleted successfully",
      });
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete option",
        variant: "destructive",
      });
    }
  }

  function cancelEdit(entryId: string) {
    setEditingEntry(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[entryId];
      return newValues;
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading options...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Tag className="h-4 w-4 mr-2" />
            Options for {referenceData.name}
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsAddingBulk(true)}
            disabled={isAddingBulk}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Options
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAddingBulk && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Add Multiple Options
                  </label>
                  <Textarea
                    placeholder="Enter options separated by commas or new lines&#10;Example: New York, London, Tokyo&#10;or&#10;New York&#10;London&#10;Tokyo"
                    value={bulkEntries}
                    onChange={(e) => setBulkEntries(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple options with commas or put each on a new line
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" onClick={handleAddBulkEntries}>
                  <Save className="h-3 w-3 mr-1" />
                  Add Options
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingBulk(false);
                    setBulkEntries('');
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No options found</p>
              <p className="text-sm text-gray-500">Add your first dropdown options to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Value</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {editingEntry === entry.id ? (
                        <Input
                          value={editValues[entry.id] || ''}
                          onChange={(e) => setEditValues(prev => ({
                            ...prev,
                            [entry.id]: e.target.value
                          }))}
                          className="h-8"
                          placeholder="Display value"
                        />
                      ) : (
                        <span>{entry.value}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {entry.creator?.full_name || entry.creator?.email || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.updated_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingEntry === entry.id ? (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveEdit(entry.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelEdit(entry.id)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEntry(entry)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
