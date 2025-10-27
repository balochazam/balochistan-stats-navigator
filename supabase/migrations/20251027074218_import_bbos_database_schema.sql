/*
  # Import BBoS Database Schema and Data
  
  1. Custom Types
    - Creates all necessary enum types for the application
    - form_category: 'bbos', 'sdg'
    - user_role: 'admin', 'data_entry_user'
    - data_source_type: Various data source types
    - sdg_indicator_type: Types of SDG indicators
    - improvement_direction: 'increase', 'decrease'
  
  2. Tables Created
    - departments: Government departments
    - profiles: User profiles with roles
    - data_banks: Data storage banks
    - data_bank_entries: Individual data bank entries
    - forms: Form definitions
    - field_groups: Form field groupings
    - form_fields: Individual form fields
    - form_submissions: Submitted form data
    - schedules: Data collection schedules
    - sdg_goals: UN Sustainable Development Goals
    - sdg_targets: Specific targets under each goal
    - sdg_indicators: Indicators to measure progress
    - sdg_data_entries: Actual SDG data submissions
  
  3. Security
    - Enable RLS on all tables
    - Add restrictive policies for authenticated users
*/

-- Create enum types with proper error handling
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_category') THEN
    CREATE TYPE form_category AS ENUM ('bbos', 'sdg');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'data_entry_user');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_source_type') THEN
    CREATE TYPE data_source_type AS ENUM ('MICS', 'PDHS', 'PSLM', 'NNS', 'NDMA', 'PBS', 'Custom');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sdg_indicator_type') THEN
    CREATE TYPE sdg_indicator_type AS ENUM ('percentage', 'rate', 'count', 'index', 'ratio', 'currency', 'multi_dimensional', 'budget', 'binary', 'composite_index', 'time_series', 'geographic_breakdown', 'demographic_breakdown', 'survey_based');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'improvement_direction') THEN
    CREATE TYPE improvement_direction AS ENUM ('increase', 'decrease');
  END IF;
END $$;

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS departments_name_unique ON departments (name);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  password text NOT NULL,
  full_name text,
  email text,
  role user_role NOT NULL DEFAULT 'data_entry_user',
  department_id uuid REFERENCES departments(id),
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles (username);

-- Create data_banks table
CREATE TABLE IF NOT EXISTS data_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES departments(id),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active bool NOT NULL DEFAULT true
);

-- Create data_bank_entries table
CREATE TABLE IF NOT EXISTS data_bank_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_bank_id uuid NOT NULL REFERENCES data_banks(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  metadata jsonb,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active bool NOT NULL DEFAULT true
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name text NOT NULL,
  form_description text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  department_id uuid REFERENCES departments(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active bool NOT NULL DEFAULT true,
  category form_category NOT NULL DEFAULT 'bbos',
  sdg_indicator_id uuid
);

-- Create field_groups table
CREATE TABLE IF NOT EXISTS field_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  group_name text NOT NULL,
  group_label text NOT NULL,
  parent_group_id uuid,
  group_type text NOT NULL DEFAULT 'section',
  display_order int NOT NULL DEFAULT 0,
  is_repeatable bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL,
  is_required bool NOT NULL DEFAULT false,
  is_primary_column bool NOT NULL DEFAULT false,
  is_secondary_column bool NOT NULL DEFAULT false,
  reference_data_name text,
  placeholder_text text,
  field_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  aggregate_fields jsonb,
  field_group_id uuid REFERENCES field_groups(id) ON DELETE CASCADE,
  has_sub_headers bool NOT NULL DEFAULT false,
  sub_headers jsonb
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES profiles(id),
  submission_data jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name text NOT NULL,
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id),
  frequency text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_active bool NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sdg_goals table
CREATE TABLE IF NOT EXISTS sdg_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_number int NOT NULL,
  title text NOT NULL,
  description text,
  icon_url text,
  color_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sdg_goals_goal_number_unique ON sdg_goals (goal_number);

-- Create sdg_targets table
CREATE TABLE IF NOT EXISTS sdg_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES sdg_goals(id) ON DELETE CASCADE,
  target_number text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sdg_targets_target_number_unique ON sdg_targets (target_number);

-- Create sdg_indicators table
CREATE TABLE IF NOT EXISTS sdg_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid NOT NULL REFERENCES sdg_targets(id) ON DELETE CASCADE,
  indicator_code text NOT NULL,
  indicator_name text NOT NULL,
  description text,
  unit_of_measurement text,
  data_source data_source_type,
  baseline_value numeric,
  baseline_year int,
  target_value numeric,
  target_year int,
  current_value numeric,
  current_year int,
  indicator_type sdg_indicator_type,
  improvement_direction improvement_direction,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  department_id uuid REFERENCES departments(id),
  is_priority bool NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS sdg_indicators_indicator_code_unique ON sdg_indicators (indicator_code);

-- Create sdg_data_entries table
CREATE TABLE IF NOT EXISTS sdg_data_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES sdg_indicators(id) ON DELETE CASCADE,
  year int NOT NULL,
  value numeric NOT NULL,
  data_source text,
  notes text,
  submitted_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Add foreign key constraint for sdg_indicator_id in forms
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forms_sdg_indicator_id_sdg_indicators_id_fk'
  ) THEN
    ALTER TABLE forms 
    ADD CONSTRAINT forms_sdg_indicator_id_sdg_indicators_id_fk 
    FOREIGN KEY (sdg_indicator_id) REFERENCES sdg_indicators(id);
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_bank_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdg_data_entries ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for authenticated users
CREATE POLICY "Authenticated users can view departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view data banks" ON data_banks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view data bank entries" ON data_bank_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view forms" ON forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view field groups" ON field_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view form fields" ON form_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view form submissions" ON form_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG goals" ON sdg_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG targets" ON sdg_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG indicators" ON sdg_indicators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view SDG data entries" ON sdg_data_entries FOR SELECT TO authenticated USING (true);