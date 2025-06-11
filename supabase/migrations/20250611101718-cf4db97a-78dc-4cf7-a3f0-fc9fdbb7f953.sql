
-- Create data_banks table for master data management
CREATE TABLE public.data_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create data_bank_entries table for individual data entries
CREATE TABLE public.data_bank_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_bank_id UUID REFERENCES public.data_banks(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(data_bank_id, key)
);

-- Enable RLS for data_banks
ALTER TABLE public.data_banks ENABLE ROW LEVEL SECURITY;

-- Enable RLS for data_bank_entries
ALTER TABLE public.data_bank_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_banks
-- Admins can do everything
CREATE POLICY "Admins can manage all data banks" ON public.data_banks
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Department users can view data banks in their department
CREATE POLICY "Department users can view department data banks" ON public.data_banks
  FOR SELECT USING (
    public.get_current_user_role() = 'department_user' 
    AND department_id = public.get_current_user_department()
  );

-- Data entry users can view all data banks
CREATE POLICY "Data entry users can view data banks" ON public.data_banks
  FOR SELECT USING (public.get_current_user_role() = 'data_entry_user');

-- RLS Policies for data_bank_entries
-- Admins can do everything
CREATE POLICY "Admins can manage all data bank entries" ON public.data_bank_entries
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Department users can manage entries in their department's data banks
CREATE POLICY "Department users can manage department data bank entries" ON public.data_bank_entries
  FOR ALL USING (
    public.get_current_user_role() = 'department_user' 
    AND EXISTS (
      SELECT 1 FROM public.data_banks 
      WHERE id = data_bank_id 
      AND department_id = public.get_current_user_department()
    )
  );

-- Data entry users can create and update entries in all data banks
CREATE POLICY "Data entry users can manage data bank entries" ON public.data_bank_entries
  FOR ALL USING (
    public.get_current_user_role() IN ('data_entry_user', 'department_user', 'admin')
  );

-- Create indexes for better performance
CREATE INDEX idx_data_banks_department_id ON public.data_banks(department_id);
CREATE INDEX idx_data_banks_created_by ON public.data_banks(created_by);
CREATE INDEX idx_data_bank_entries_data_bank_id ON public.data_bank_entries(data_bank_id);
CREATE INDEX idx_data_bank_entries_key ON public.data_bank_entries(key);
CREATE INDEX idx_data_bank_entries_created_by ON public.data_bank_entries(created_by);
