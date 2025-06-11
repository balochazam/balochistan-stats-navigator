
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Department users can view department profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create security definer function to get current user department
CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT department_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the policies using the security definer functions
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Admins can insert new profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Department users can view profiles in their department
CREATE POLICY "Department users can view department profiles" ON public.profiles
    FOR SELECT USING (
        public.get_current_user_role() = 'department_user' 
        AND department_id = public.get_current_user_department()
    );

-- Only admins can insert departments
CREATE POLICY "Admins can insert departments" ON public.departments
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- Only admins can update departments
CREATE POLICY "Admins can update departments" ON public.departments
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Only admins can delete departments
CREATE POLICY "Admins can delete departments" ON public.departments
    FOR DELETE USING (public.get_current_user_role() = 'admin');
