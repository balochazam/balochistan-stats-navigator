-- Fix all incomplete forms that have 0 fields
-- This is critical - these forms were created but never got their field structures

-- 3.2.1 Under-5 mortality rate
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '3.2.1 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'mortality_data', 'Under-5 Mortality Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'MICS, PDHS, DHS, Civil Registration', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5),
    (form_id, group_data_id, 'under5_deaths', 'Under-5 Deaths', 'number', true, false, 'e.g., 1250', 10),
    (form_id, group_data_id, 'live_births', 'Live Births', 'number', true, false, 'e.g., 125000', 11),
    (form_id, group_data_id, 'under5_mortality_rate', 'Under-5 Mortality Rate (per 1,000 live births)', 'number', true, false, 'e.g., 69.2', 12),
    (form_id, group_data_id, 'baseline_rate', 'Baseline U5MR', 'number', false, false, 'e.g., 89.5', 13),
    (form_id, group_data_id, 'target_rate', 'Target U5MR', 'number', false, false, 'e.g., 25.0', 14);
END $$;

-- 3.3.1 HIV incidence  
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '3.3.1 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'hiv_data', 'HIV Incidence Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'NAP, UNAIDS, Health Ministry', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 4),
    (form_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, '15-24, 25-49, 50+, or Total', 5),
    (form_id, group_basic_id, 'key_population', 'Key Population', 'select', false, false, 'General, MSM, PWID, SW, or Total', 6),
    (form_id, group_data_id, 'new_hiv_infections', 'New HIV Infections', 'number', true, false, 'e.g., 125', 10),
    (form_id, group_data_id, 'uninfected_population', 'Uninfected Population', 'number', true, false, 'e.g., 1250000', 11),
    (form_id, group_data_id, 'hiv_incidence_rate', 'HIV Incidence Rate (per 1,000 uninfected)', 'number', true, false, 'e.g., 0.10', 12);
END $$;

-- 4.1.2 Primary completion rate
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '4.1.2 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'completion_data', 'Education Completion Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'year', 'Academic Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'EMIS, Ministry of Education, Census', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 4),
    (form_id, group_basic_id, 'education_level', 'Education Level', 'select', true, false, 'Primary, Lower Secondary, Upper Secondary', 5),
    (form_id, group_data_id, 'eligible_population', 'Eligible Population for Level', 'number', false, false, 'e.g., 125000', 10),
    (form_id, group_data_id, 'completers', 'Students Who Completed Level', 'number', false, false, 'e.g., 89250', 11),
    (form_id, group_data_id, 'completion_rate', 'Completion Rate (%)', 'number', true, false, 'e.g., 71.4', 12),
    (form_id, group_data_id, 'baseline_rate', 'Baseline Completion Rate (%)', 'number', false, false, 'e.g., 65.2', 13),
    (form_id, group_data_id, 'target_rate', 'Target Completion Rate (%)', 'number', false, false, 'e.g., 85.0', 14);
END $$;

-- 4.2.1 Early childhood development
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '4.2.1 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'development_data', 'Early Childhood Development Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'MICS, DHS, Early Childhood Survey', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 4),
    (form_id, group_basic_id, 'age_months', 'Age Group (Months)', 'select', false, false, '24-35, 36-47, 48-59, or Total (24-59)', 5),
    (form_id, group_data_id, 'children_assessed', 'Total Children Assessed (24-59 months)', 'number', false, false, 'e.g., 2500', 10),
    (form_id, group_data_id, 'children_on_track', 'Children Developmentally On Track', 'number', false, false, 'e.g., 1875', 11),
    (form_id, group_data_id, 'development_rate', 'On Track Development Rate (%)', 'number', true, false, 'e.g., 75.0', 12),
    (form_id, group_data_id, 'health_score', 'Health Development Score (0-100)', 'number', false, false, 'e.g., 78.5', 13),
    (form_id, group_data_id, 'learning_score', 'Learning Development Score (0-100)', 'number', false, false, 'e.g., 72.3', 14),
    (form_id, group_data_id, 'psychosocial_score', 'Psychosocial Development Score (0-100)', 'number', false, false, 'e.g., 74.1', 15);
END $$;

-- 5.3.1 Child marriage
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '5.3.1 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'marriage_data', 'Child Marriage Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'MICS, PDHS, DHS', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (form_id, group_basic_id, 'marriage_age_threshold', 'Marriage Age Threshold', 'select', true, false, 'Before age 15, Before age 18', 5),
    (form_id, group_data_id, 'women_20_24_interviewed', 'Women 20-24 Interviewed', 'number', false, false, 'e.g., 5000', 10),
    (form_id, group_data_id, 'married_before_15', 'Married Before Age 15', 'number', false, false, 'e.g., 150', 11),
    (form_id, group_data_id, 'married_before_18', 'Married Before Age 18', 'number', false, false, 'e.g., 1750', 12),
    (form_id, group_data_id, 'child_marriage_rate', 'Child Marriage Rate (%)', 'number', true, false, 'e.g., 35.0', 13),
    (form_id, group_data_id, 'baseline_rate', 'Baseline Rate (%)', 'number', false, false, 'e.g., 42.3', 14),
    (form_id, group_data_id, 'target_rate', 'Target Rate (%)', 'number', false, false, 'e.g., 10.0', 15);
END $$;