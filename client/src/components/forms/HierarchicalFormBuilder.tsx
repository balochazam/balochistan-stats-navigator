import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { FieldGroup, FormField, InsertFieldGroup, InsertFormField } from '@shared/schema';

interface HierarchicalFormBuilderProps {
  formId?: string;
  onSave: (groups: FieldGroup[], fields: FormField[]) => void;
}

interface GroupNode {
  id: string;
  form_id: string;
  group_name: string;
  group_label: string;
  parent_group_id: string | null;
  group_type: string;
  display_order: number;
  is_repeatable: boolean;
  created_at: string;
  updated_at: string;
  children: GroupNode[];
  fields: FormField[];
  expanded?: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown (Select)' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'aggregate', label: 'Aggregate (Sum of Fields)' }
];

const GROUP_TYPES = [
  { value: 'section', label: 'Section', description: 'Main category (e.g., Doctors, Specialists)' },
  { value: 'category', label: 'Category', description: 'Sub-category (e.g., Medical, Dental)' },
  { value: 'sub_category', label: 'Sub-Category', description: 'Detailed grouping' }
];

// Predefined templates for common field patterns
const FIELD_TEMPLATES = [
  {
    name: 'Gender Breakdown',
    description: 'Total, Male, Female fields',
    fields: [
      { name: 'total', label: 'Total', type: 'number' },
      { name: 'male', label: 'Male', type: 'number' },
      { name: 'female', label: 'Female', type: 'number' }
    ]
  },
  {
    name: 'Basic Count',
    description: 'Simple number field',
    fields: [
      { name: 'count', label: 'Count', type: 'number' }
    ]
  }
];

export const HierarchicalFormBuilder: React.FC<HierarchicalFormBuilderProps> = ({
  formId,
  onSave
}) => {
  const [groups, setGroups] = useState<GroupNode[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupNode | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);

  // Build hierarchical structure from flat data
  const buildHierarchy = (flatGroups: FieldGroup[], flatFields: FormField[]): GroupNode[] => {
    const groupMap = new Map<string, GroupNode>();
    
    // Create group nodes
    flatGroups.forEach(group => {
      groupMap.set(group.id, {
        ...group,
        created_at: typeof group.created_at === 'string' ? group.created_at : group.created_at.toISOString(),
        updated_at: typeof group.updated_at === 'string' ? group.updated_at : group.updated_at.toISOString(),
        children: [],
        fields: [],
        expanded: true
      });
    });

    // Add fields to groups
    flatFields.forEach(field => {
      if (field.field_group_id) {
        const group = groupMap.get(field.field_group_id);
        if (group) {
          group.fields.push(field);
        }
      }
    });

    // Build hierarchy
    const roots: GroupNode[] = [];
    groupMap.forEach(group => {
      if (group.parent_group_id) {
        const parent = groupMap.get(group.parent_group_id);
        if (parent) {
          parent.children.push(group);
        }
      } else {
        roots.push(group);
      }
    });

    return roots.sort((a, b) => a.display_order - b.display_order);
  };

  const addGroup = (parentGroup?: GroupNode) => {
    const newGroup: GroupNode = {
      id: `temp-${Date.now()}`,
      form_id: formId || '',
      group_name: '',
      group_label: '',
      parent_group_id: parentGroup?.id || null,
      group_type: 'section',
      display_order: 0,
      is_repeatable: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: [],
      fields: [],
      expanded: true
    };

    if (parentGroup) {
      parentGroup.children.push(newGroup);
    } else {
      setGroups([...groups, newGroup]);
    }
    
    setSelectedGroup(newGroup);
    setShowGroupForm(true);
  };

  const addFieldToGroup = (group: GroupNode, template?: typeof FIELD_TEMPLATES[0]) => {
    if (template) {
      // Add multiple fields from template
      template.fields.forEach((fieldTemplate, index) => {
        const newField: FormField = {
          id: `temp-field-${Date.now()}-${index}`,
          form_id: formId || '',
          field_group_id: group.id,
          field_name: `${group.group_name}_${fieldTemplate.name}`,
          field_label: fieldTemplate.label,
          field_type: fieldTemplate.type as any,
          is_required: false,
          is_primary_column: false,
          is_secondary_column: false,
          reference_data_name: null,
          placeholder_text: null,
          aggregate_fields: null,
          field_order: group.fields.length + index,
          created_at: new Date() as any,
          updated_at: new Date() as any
        };
        group.fields.push(newField);
      });
    } else {
      // Add single field
      const newField: FormField = {
        id: `temp-field-${Date.now()}`,
        form_id: formId || '',
        field_group_id: group.id,
        field_name: '',
        field_label: '',
        field_type: 'text',
        is_required: false,
        is_primary_column: false,
        is_secondary_column: false,
        reference_data_name: null,
        placeholder_text: null,
        aggregate_fields: null,
        field_order: group.fields.length,
        created_at: new Date() as any,
        updated_at: new Date() as any
      };
      group.fields.push(newField);
    }
    
    setGroups([...groups]);
    setShowFieldForm(true);
  };

  const toggleGroup = (group: GroupNode) => {
    group.expanded = !group.expanded;
    setGroups([...groups]);
  };

  const removeGroup = (groupToRemove: GroupNode, parentChildren?: GroupNode[]) => {
    if (parentChildren) {
      const index = parentChildren.indexOf(groupToRemove);
      if (index > -1) {
        parentChildren.splice(index, 1);
      }
    } else {
      setGroups(groups.filter(g => g.id !== groupToRemove.id));
    }
    setGroups([...groups]);
  };

  const renderGroup = (group: GroupNode, level = 0, parentChildren?: GroupNode[]) => {
    const indent = level * 24;

    return (
      <div key={group.id} className="space-y-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between" style={{ paddingLeft: indent }}>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(group)}
                  className="p-0 h-6 w-6"
                >
                  {group.expanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div>
                  <CardTitle className="text-sm">{group.group_label || 'Unnamed Group'}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {GROUP_TYPES.find(t => t.value === group.group_type)?.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addGroup(group)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Sub-Group
                </Button>
                <Select onValueChange={(value) => {
                  const template = FIELD_TEMPLATES.find(t => t.name === value);
                  addFieldToGroup(group, template);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Add Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Field</SelectItem>
                    {FIELD_TEMPLATES.map(template => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(group, parentChildren)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {group.expanded && (
            <CardContent className="pt-0">
              {/* Fields in this group */}
              {group.fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{field.field_label || 'Unnamed Field'}</div>
                    <div className="text-xs text-gray-500">
                      {field.field_type} • {field.field_name}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      group.fields.splice(index, 1);
                      setGroups([...groups]);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {/* Child groups */}
              {group.children.map(child => 
                renderGroup(child, level + 1, group.children)
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
  };

  const flattenData = () => {
    const allGroups: FieldGroup[] = [];
    const allFields: FormField[] = [];

    const traverse = (nodes: GroupNode[]) => {
      nodes.forEach(node => {
        const { children, fields, expanded, ...group } = node;
        allGroups.push({
          ...group,
          created_at: new Date(group.created_at),
          updated_at: new Date(group.updated_at)
        } as FieldGroup);
        allFields.push(...fields);
        traverse(children);
      });
    };

    traverse(groups);
    return { allGroups, allFields };
  };

  const handleSave = () => {
    const { allGroups, allFields } = flattenData();
    onSave(allGroups, allFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hierarchical Form Structure</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => addGroup()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
          <Button onClick={handleSave}>
            Save Structure
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Template Structure Example:</h4>
        <p className="text-sm text-gray-600">
          Province (Primary) → Doctors/Specialists (Sections) → Medical/Dental (Categories) → Total/Male/Female (Fields)
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">No groups created yet</p>
            <Button onClick={() => addGroup()}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(group => renderGroup(group))}
        </div>
      )}
    </div>
  );
};