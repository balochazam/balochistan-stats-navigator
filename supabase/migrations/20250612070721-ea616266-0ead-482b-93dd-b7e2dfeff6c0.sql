
-- Create table to track when users mark schedule forms as complete
CREATE TABLE public.schedule_form_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_form_id uuid REFERENCES public.schedule_forms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(schedule_form_id, user_id)
);

-- Enable RLS
ALTER TABLE public.schedule_form_completions ENABLE ROW LEVEL SECURITY;

-- RLS policy - users can only access their own completions
CREATE POLICY "Users can manage their own form completions" 
  ON public.schedule_form_completions 
  FOR ALL 
  USING (user_id = auth.uid());

-- Admins can view all completions
CREATE POLICY "Admins can view all form completions" 
  ON public.schedule_form_completions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
