
-- Create schedules table to manage yearly/periodic data collection schedules
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  year integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  department_id uuid REFERENCES public.departments(id) NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name, year, department_id)
);

-- Create schedule_forms junction table to associate forms with schedules
CREATE TABLE public.schedule_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  form_id uuid REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, form_id)
);

-- Update form_submissions to include schedule context
ALTER TABLE public.form_submissions 
ADD COLUMN schedule_id uuid REFERENCES public.schedules(id);

-- Enable RLS on new tables
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_forms ENABLE ROW LEVEL SECURITY;

-- RLS policies for schedules - admins can manage all, department users can view their department's schedules
CREATE POLICY "Admins can manage all schedules" 
  ON public.schedules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Department users can view their department schedules" 
  ON public.schedules 
  FOR SELECT 
  USING (
    department_id IN (
      SELECT department_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- RLS policies for schedule_forms - follow schedule permissions
CREATE POLICY "Users can access schedule_forms based on schedule access" 
  ON public.schedule_forms 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.schedules s
      WHERE s.id = schedule_id
      AND (
        -- Admin access
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- Department access
        s.department_id IN (
          SELECT department_id FROM public.profiles 
          WHERE id = auth.uid()
        )
      )
    )
  );

-- Update RLS policy for form_submissions to include schedule context
DROP POLICY IF EXISTS "Users can access form submissions based on department" ON public.form_submissions;

CREATE POLICY "Users can access form submissions based on department and schedule" 
  ON public.form_submissions 
  FOR ALL 
  USING (
    -- Admin can access all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Users can access submissions from their department's forms and schedules
    (
      form_id IN (
        SELECT f.id FROM public.forms f
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE f.department_id = p.department_id
      )
      AND
      (
        schedule_id IS NULL 
        OR 
        schedule_id IN (
          SELECT s.id FROM public.schedules s
          JOIN public.profiles p ON p.id = auth.uid()
          WHERE s.department_id = p.department_id
        )
      )
    )
  );
