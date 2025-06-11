
-- Create table for storing form definitions
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create table for storing form field definitions
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'radio', 'number', 'email', 'date')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_primary_column BOOLEAN NOT NULL DEFAULT false,
  is_secondary_column BOOLEAN NOT NULL DEFAULT false,
  reference_data_name TEXT, -- For select/radio fields
  placeholder_text TEXT,
  field_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing form submissions/data
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Add RLS policies for forms
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view forms from their department or all departments if admin" 
  ON public.forms 
  FOR SELECT 
  USING (
    get_current_user_role() = 'admin' OR 
    department_id IS NULL OR 
    department_id = get_current_user_department()
  );

CREATE POLICY "Only admins can create forms" 
  ON public.forms 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update forms" 
  ON public.forms 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete forms" 
  ON public.forms 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');

-- Add RLS policies for form_fields
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view form fields from accessible forms" 
  ON public.form_fields 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_fields.form_id 
      AND (
        get_current_user_role() = 'admin' OR 
        forms.department_id IS NULL OR 
        forms.department_id = get_current_user_department()
      )
    )
  );

CREATE POLICY "Only admins can manage form fields" 
  ON public.form_fields 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Add RLS policies for form_submissions
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view submissions from their department or all if admin" 
  ON public.form_submissions 
  FOR SELECT 
  USING (
    get_current_user_role() = 'admin' OR 
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_submissions.form_id 
      AND (
        forms.department_id IS NULL OR 
        forms.department_id = get_current_user_department()
      )
    )
  );

CREATE POLICY "Users can create submissions for accessible forms" 
  ON public.form_submissions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_submissions.form_id 
      AND (
        get_current_user_role() = 'admin' OR 
        forms.department_id IS NULL OR 
        forms.department_id = get_current_user_department()
      )
    )
  );

CREATE POLICY "Users can update their own submissions or admins can update all" 
  ON public.form_submissions 
  FOR UPDATE 
  USING (
    get_current_user_role() = 'admin' OR 
    submitted_by = auth.uid()
  );

CREATE POLICY "Only admins can delete submissions" 
  ON public.form_submissions 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');
