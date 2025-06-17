import React from 'react';
import { FormBuilderWithHierarchy } from './FormBuilderWithHierarchy';

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Form {
  id: string;
  name: string;
  description?: string;
  department_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface FormBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingForm: Form | null;
  departments: Department[];
}

export const FormBuilderDialog: React.FC<FormBuilderDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingForm
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <FormBuilderWithHierarchy
      open={isOpen}
      onOpenChange={handleOpenChange}
      editingForm={editingForm}
    />
  );
};