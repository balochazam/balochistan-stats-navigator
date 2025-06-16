
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Key, Save, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataBank {
  id: string;
  name: string;
}

interface DataBankEntry {
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

interface DataBankEntriesProps {
  dataBank: DataBank;
}

export const DataBankEntries = ({ dataBank }: DataBankEntriesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DataBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ key: '', value: '' });
  const [editValues, setEditValues] = useState<{ [key: string]: { key: string; value: string } }>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [dataBank.id]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('data_bank_entries')
        .select(`
          *,
          creator:profiles!data_bank_entries_created_by_fkey(full_name, email)
        `)
        .eq('data_bank_id', dataBank.id)
        .eq('is_active', true)
        .order('key');

      if (error) {
        console.error('Error fetching entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch entries",
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

  const handleAddEntry = async () => {
    if (!user || !newEntry.key.trim() || !newEntry.value.trim()) {
      toast({
        title: "Error",
        description: "Both key and value are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('data_bank_entries')
        .insert({
          data_bank_id: dataBank.id,
          key: newEntry.key.trim(),
          value: newEntry.value.trim(),
          created_by: user.id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A key with this name already exists",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Entry added successfully",
      });
      
      setNewEntry({ key: '', value: '' });
      setIsAddingNew(false);
      fetchEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: "Error",
        description: "Failed to add entry",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = (entry: DataBankEntry) => {
    setEditingEntry(entry.id);
    setEditValues(prev => ({
      ...prev,
      [entry.id]: { key: entry.key, value: entry.value }
    }));
  };

  const handleSaveEdit = async (entryId: string) => {
    const editData = editValues[entryId];
    if (!editData || !editData.key.trim() || !editData.value.trim()) {
      toast({
        title: "Error",
        description: "Both key and value are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('data_bank_entries')
        .update({
          key: editData.key.trim(),
          value: editData.value.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A key with this name already exists",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Entry updated successfully",
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
        description: "Failed to update entry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
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
        description: "Entry deleted successfully",
      });
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = (entryId: string) => {
    setEditingEntry(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[entryId];
      return newValues;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading entries...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Key className="h-4 w-4 mr-2" />
            Data Entries
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAddingNew && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <Input
                  placeholder="Enter key"
                  value={newEntry.key}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, key: e.target.value }))}
                />
                <Input
                  placeholder="Enter value"
                  value={newEntry.value}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleAddEntry}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewEntry({ key: '', value: '' });
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
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No entries found</p>
              <p className="text-sm text-gray-500">Add your first key-value pair to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
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
                          value={editValues[entry.id]?.key || ''}
                          onChange={(e) => setEditValues(prev => ({
                            ...prev,
                            [entry.id]: { ...prev[entry.id], key: e.target.value }
                          }))}
                          className="h-8"
                        />
                      ) : (
                        <span className="font-mono text-sm">{entry.key}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEntry === entry.id ? (
                        <Input
                          value={editValues[entry.id]?.value || ''}
                          onChange={(e) => setEditValues(prev => ({
                            ...prev,
                            [entry.id]: { ...prev[entry.id], value: e.target.value }
                          }))}
                          className="h-8"
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
