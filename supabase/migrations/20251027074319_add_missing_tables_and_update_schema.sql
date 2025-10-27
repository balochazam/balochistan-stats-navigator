/*
  # Add Missing Tables and Update Schema
  
  1. Tables Added
    - schedule_forms: Links schedules to forms
    - schedule_form_completions: Tracks completion of scheduled forms
    - sdg_data_sources: Data sources for SDG indicators
    - sdg_indicator_values: Historical values for SDG indicators
    - sdg_progress_calculations: Progress tracking for SDG goals
    - session: Session management table
  
  2. Schema Updates
    - Update schedules table structure to match source
    - Update sdg_goals to use integer primary key
    - Update sdg_targets structure
    - Update sdg_indicators structure with additional fields
    - Update profiles table structure
    - Update forms table structure
    - Update form_submissions table structure
  
  3. Security
    - Enable RLS on new tables
    - Add basic read policies for authenticated users
*/

-- Drop existing tables that need structure changes
DROP TABLE IF EXISTS sdg_data_entries CASCADE;
DROP TABLE IF EXISTS sdg_indicators CASCADE;
DROP TABLE IF EXISTS sdg_targets CASCADE;
DROP TABLE IF EXISTS sdg_goals CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate profiles table with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'data_entry_user',
  department_id uuid REFERENCES departments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles (email);

-- Recreate forms table with correct structure
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES departments(id),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active bool NOT NULL DEFAULT true,
  category form_category NOT NULL DEFAULT 'bbos'
);

-- Recreate schedules table with correct structure
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS schedules_name_unique ON schedules (name);

-- Recreate form_submissions table with correct structure
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES schedules(id),
  submitted_by uuid NOT NULL REFERENCES profiles(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  data jsonb NOT NULL DEFAULT '{}'
);

-- Create schedule_forms table
CREATE TABLE IF NOT EXISTS schedule_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  is_required bool NOT NULL DEFAULT true,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create schedule_form_completions table
CREATE TABLE IF NOT EXISTS schedule_form_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_form_id uuid NOT NULL REFERENCES schedule_forms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create sdg_data_sources table
CREATE TABLE IF NOT EXISTS sdg_data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  full_name text,
  source_type data_source_type NOT NULL,
  description text,
  website_url text,
  contact_info jsonb,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Recreate sdg_goals table with integer primary key
CREATE TABLE IF NOT EXISTS sdg_goals (
  id int PRIMARY KEY,
  title text NOT NULL,
  description text,
  color text NOT NULL,
  icon_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recreate sdg_targets table with correct structure
CREATE TABLE IF NOT EXISTS sdg_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sdg_goal_id int NOT NULL REFERENCES sdg_goals(id),
  target_number text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sdg_targets_target_number_unique ON sdg_targets (target_number);

-- Recreate sdg_indicators table with full structure
CREATE TABLE IF NOT EXISTS sdg_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sdg_target_id uuid NOT NULL REFERENCES sdg_targets(id),
  indicator_code text NOT NULL,
  title text NOT NULL,
  description text,
  indicator_type sdg_indicator_type NOT NULL,
  unit text,
  methodology text,
  data_collection_frequency text,
  responsible_departments jsonb,
  is_active bool NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  data_structure jsonb,
  validation_rules jsonb,
  aggregation_methods jsonb,
  disaggregation_categories jsonb,
  data_quality_requirements jsonb,
  improvement_direction improvement_direction NOT NULL DEFAULT 'decrease'
);

CREATE UNIQUE INDEX IF NOT EXISTS sdg_indicators_indicator_code_unique ON sdg_indicators (indicator_code);

-- Create sdg_indicator_values table
CREATE TABLE IF NOT EXISTS sdg_indicator_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES sdg_indicators(id),
  data_source_id uuid REFERENCES sdg_data_sources(id),
  year int NOT NULL,
  value text NOT NULL,
  value_numeric int,
  breakdown_data jsonb,
  baseline_indicator bool DEFAULT false,
  progress_indicator bool DEFAULT false,
  notes text,
  reference_document text,
  data_quality_score int,
  department_id uuid REFERENCES departments(id),
  submitted_by uuid NOT NULL REFERENCES profiles(id),
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sdg_progress_calculations table
CREATE TABLE IF NOT EXISTS sdg_progress_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sdg_goal_id int NOT NULL REFERENCES sdg_goals(id),
  indicator_id uuid REFERENCES sdg_indicators(id),
  progress_percentage int,
  trend_direction text,
  last_calculation_date timestamptz,
  calculation_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session table for express-session
CREATE TABLE IF NOT EXISTS session (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);

-- Enable RLS on all new tables
ALTER TABLE schedule_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_form_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_indicator_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_progress_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on recreated tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Authenticated users can view schedule forms" ON schedule_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view schedule form completions" ON schedule_form_completions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG data sources" ON sdg_data_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG indicator values" ON sdg_indicator_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG progress calculations" ON sdg_progress_calculations FOR SELECT TO authenticated USING (true);

-- Recreate policies for recreated tables
CREATE POLICY "Authenticated users can view profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view forms" ON forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view form submissions" ON form_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG goals" ON sdg_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG targets" ON sdg_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG indicators" ON sdg_indicators FOR SELECT TO authenticated USING (true);