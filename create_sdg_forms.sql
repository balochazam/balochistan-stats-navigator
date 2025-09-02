-- Create comprehensive SDG indicator forms with proper demographic breakdowns
-- Goal 1: No Poverty Forms

-- 1.1.1 International poverty line form
INSERT INTO forms (name, description, category, created_by) VALUES 
('1.1.1 Data Collection Form', 'Data collection form for Proportion of the population living below the international poverty line by sex, age, employment status and geographic location (urban/rural)', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- Get the form ID for 1.1.1
DO $$ 
DECLARE 
    form_111_id uuid;
    group_basic_id uuid;
    group_poverty_id uuid;
BEGIN
    SELECT id INTO form_111_id FROM forms WHERE name = '1.1.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups for 1.1.1
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_111_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_111_id, 'poverty_data', 'International Poverty Data', 'section', 2) RETURNING id INTO group_poverty_id;
    
    -- Basic information fields for 1.1.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_111_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_111_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'MICS, PDHS, PSLM, LFS, or Other', 2),
    (form_111_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_111_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_111_id, group_basic_id, 'sex', 'Sex', 'select', false, false, false, 'Male, Female, or Total', 5),
    (form_111_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, false, '0-14, 15-64, 65+, or Total', 6),
    (form_111_id, group_basic_id, 'employment_status', 'Employment Status', 'select', false, false, false, 'Employed, Unemployed, or Total', 7);
    
    -- Poverty data fields for 1.1.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_111_id, group_poverty_id, 'baseline_value', 'Baseline Value (%)', 'number', false, false, false, 'e.g., 25.5', 10),
    (form_111_id, group_poverty_id, 'current_value', 'Current Value (%)', 'number', true, false, false, 'e.g., 22.3', 11),
    (form_111_id, group_poverty_id, 'target_value', 'Target Value (%)', 'number', false, false, false, 'e.g., 15.0', 12),
    (form_111_id, group_poverty_id, 'poverty_line_amount', 'International Poverty Line (PKR)', 'number', false, false, false, 'e.g., 350', 13),
    (form_111_id, group_poverty_id, 'total_population', 'Total Population in Category', 'number', false, false, false, 'e.g., 1250000', 14),
    (form_111_id, group_poverty_id, 'population_below_line', 'Population Below Poverty Line', 'number', false, false, false, 'e.g., 278750', 15);
END $$;

-- 1.2.1 National poverty line form
INSERT INTO forms (name, description, category, created_by) VALUES 
('1.2.1 Data Collection Form', 'Data collection form for Proportion of population living below the national poverty line, by sex and age', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- Get the form ID for 1.2.1
DO $$ 
DECLARE 
    form_121_id uuid;
    group_basic_id uuid;
    group_poverty_id uuid;
BEGIN
    SELECT id INTO form_121_id FROM forms WHERE name = '1.2.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups for 1.2.1
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_121_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_121_id, 'poverty_data', 'National Poverty Data', 'section', 2) RETURNING id INTO group_poverty_id;
    
    -- Basic information fields for 1.2.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_121_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_121_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'MICS, PDHS, PSLM, LFS, or Other', 2),
    (form_121_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_121_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_121_id, group_basic_id, 'sex', 'Sex', 'select', false, false, false, 'Male, Female, or Total', 5),
    (form_121_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, false, 'Children (0-17), Adults (18-64), Elderly (65+), or Total', 6);
    
    -- Poverty data fields for 1.2.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_121_id, group_poverty_id, 'baseline_value', 'Baseline Value (%)', 'number', false, false, false, 'e.g., 38.4', 10),
    (form_121_id, group_poverty_id, 'current_value', 'Current Value (%)', 'number', true, false, false, 'e.g., 31.2', 11),
    (form_121_id, group_poverty_id, 'target_value', 'Target Value (%)', 'number', false, false, false, 'e.g., 20.0', 12),
    (form_121_id, group_poverty_id, 'national_poverty_line', 'National Poverty Line (PKR)', 'number', false, false, false, 'e.g., 4000', 13),
    (form_121_id, group_poverty_id, 'household_count', 'Total Households Surveyed', 'number', false, false, false, 'e.g., 15000', 14);
END $$;

-- 2.2.1 Child stunting form
INSERT INTO forms (name, description, category, created_by) VALUES 
('2.2.1 Data Collection Form', 'Data collection form for Prevalence of stunting (height for age <-2 standard deviation from the median of the WHO Child Growth Standards) among children under 5 years of age', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- Get the form ID for 2.2.1
DO $$ 
DECLARE 
    form_221_id uuid;
    group_basic_id uuid;
    group_stunting_id uuid;
BEGIN
    SELECT id INTO form_221_id FROM forms WHERE name = '2.2.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups for 2.2.1
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_221_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_221_id, 'stunting_data', 'Stunting Measurements', 'section', 2) RETURNING id INTO group_stunting_id;
    
    -- Basic information fields for 2.2.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_221_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_221_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'MICS, PDHS, PSLM, NNS, or Other', 2),
    (form_221_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_221_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_221_id, group_basic_id, 'sex', 'Sex', 'select', false, false, false, 'Male, Female, or Total', 5),
    (form_221_id, group_basic_id, 'age_months', 'Age Group (Months)', 'select', false, false, false, '0-5, 6-11, 12-23, 24-35, 36-47, 48-59, or Total', 6);
    
    -- Stunting data fields for 2.2.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_221_id, group_stunting_id, 'baseline_value', 'Baseline Stunting Rate (%)', 'number', false, false, false, 'e.g., 43.0', 10),
    (form_221_id, group_stunting_id, 'current_value', 'Current Stunting Rate (%)', 'number', true, false, false, 'e.g., 40.2', 11),
    (form_221_id, group_stunting_id, 'target_value', 'Target Stunting Rate (%)', 'number', false, false, false, 'e.g., 30.0', 12),
    (form_221_id, group_stunting_id, 'children_measured', 'Total Children Measured', 'number', false, false, false, 'e.g., 2500', 13),
    (form_221_id, group_stunting_id, 'children_stunted', 'Children with Stunting', 'number', false, false, false, 'e.g., 1005', 14),
    (form_221_id, group_stunting_id, 'who_standard_applied', 'WHO Child Growth Standards Applied', 'select', true, false, false, 'Yes or No', 15);
END $$;

-- 4.1.1 Student achievement form
INSERT INTO forms (name, description, category, created_by) VALUES 
('4.1.1 Data Collection Form', 'Data collection form for Proportion of children and young people achieving at least a minimum proficiency level in (a) reading and (b) mathematics, by sex', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- Get the form ID for 4.1.1
DO $$ 
DECLARE 
    form_411_id uuid;
    group_basic_id uuid;
    group_achievement_id uuid;
BEGIN
    SELECT id INTO form_411_id FROM forms WHERE name = '4.1.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups for 4.1.1
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_411_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_411_id, 'achievement_data', 'Student Achievement Data', 'section', 2) RETURNING id INTO group_achievement_id;
    
    -- Basic information fields for 4.1.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_411_id, group_basic_id, 'year', 'Academic Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_411_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'ASER, Provincial Assessment, National Assessment, or Other', 2),
    (form_411_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_411_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_411_id, group_basic_id, 'sex', 'Sex', 'select', false, false, false, 'Male, Female, or Total', 5),
    (form_411_id, group_basic_id, 'grade_level', 'Grade Level', 'select', true, false, false, 'Grade 2-3, Grade 4-5, or Grade 8-9', 6),
    (form_411_id, group_basic_id, 'subject', 'Subject', 'select', true, false, false, 'Reading, Mathematics, or Both', 7);
    
    -- Achievement data fields for 4.1.1
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_411_id, group_achievement_id, 'reading_proficiency', 'Reading Proficiency (%)', 'number', false, false, false, 'e.g., 45.2', 10),
    (form_411_id, group_achievement_id, 'mathematics_proficiency', 'Mathematics Proficiency (%)', 'number', false, false, false, 'e.g., 38.7', 11),
    (form_411_id, group_achievement_id, 'overall_proficiency', 'Overall Proficiency (%)', 'number', true, false, false, 'e.g., 41.9', 12),
    (form_411_id, group_achievement_id, 'baseline_proficiency', 'Baseline Proficiency (%)', 'number', false, false, false, 'e.g., 35.0', 13),
    (form_411_id, group_achievement_id, 'target_proficiency', 'Target Proficiency (%)', 'number', false, false, false, 'e.g., 60.0', 14),
    (form_411_id, group_achievement_id, 'students_tested', 'Total Students Tested', 'number', false, false, false, 'e.g., 8500', 15),
    (form_411_id, group_achievement_id, 'students_proficient', 'Students Achieving Minimum Proficiency', 'number', false, false, false, 'e.g., 3565', 16);
END $$;