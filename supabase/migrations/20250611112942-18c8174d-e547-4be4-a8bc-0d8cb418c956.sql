
-- First, drop all policies that depend on department_id
DROP POLICY IF EXISTS "Department users can view their department schedules" ON public.schedules;
DROP POLICY IF EXISTS "Users can access schedule_forms based on schedule access" ON public.schedule_forms;
DROP POLICY IF EXISTS "Users can access form submissions based on department and sched" ON public.form_submissions;

-- Now we can safely drop the columns
ALTER TABLE public.schedules 
DROP COLUMN year,
DROP COLUMN department_id,
DROP COLUMN status;

-- Drop the existing unique constraint that included department_id
ALTER TABLE public.schedules 
DROP CONSTRAINT IF EXISTS schedules_name_year_department_id_key;

-- Add a new unique constraint for just name to prevent duplicate schedule names
ALTER TABLE public.schedules 
ADD CONSTRAINT schedules_name_key UNIQUE (name);

-- Create new policy allowing all authenticated users to view schedules
CREATE POLICY "All users can view schedules" 
  ON public.schedules 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create new policy allowing all authenticated users to access schedule_forms
CREATE POLICY "All users can access schedule_forms" 
  ON public.schedule_forms 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    auth.uid() IS NOT NULL
  );

-- Recreate the form_submissions policy without department restrictions
CREATE POLICY "Users can access form submissions based on schedule" 
  ON public.form_submissions 
  FOR ALL 
  USING (
    -- Admin can access all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Users can access submissions from forms they have access to
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
          WHERE auth.uid() IS NOT NULL
        )
      )
    )
  );
