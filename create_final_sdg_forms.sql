-- Create forms for the final 7 remaining SDG indicators to achieve 100% coverage

-- 1.a.1 - ODA for poverty reduction
INSERT INTO forms (name, description, category, created_by) VALUES 
('1.a.1 Data Collection Form', 'Data collection form for Total official development assistance grants from all donors that focus on poverty reduction as a share of the recipient country gross national income', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 1.a.2 - Government spending on essential services
INSERT INTO forms (name, description, category, created_by) VALUES 
('1.a.2 Data Collection Form', 'Data collection form for Proportion of total government spending on essential services (education, health and social protection)', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 1.b.1 - Pro-poor public social spending
INSERT INTO forms (name, description, category, created_by) VALUES 
('1.b.1 Data Collection Form', 'Data collection form for Pro-poor public social spending', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 15.1.1 - Forest area
INSERT INTO forms (name, description, category, created_by) VALUES 
('15.1.1 Data Collection Form', 'Data collection form for Forest area as a proportion of total land area', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 16.9.1 - Birth registration
INSERT INTO forms (name, description, category, created_by) VALUES 
('16.9.1 Data Collection Form', 'Data collection form for Proportion of children under 5 years of age whose births have been registered with a civil authority by age', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 8.5.2 - Unemployment rate
INSERT INTO forms (name, description, category, created_by) VALUES 
('8.5.2 Data Collection Form', 'Data collection form for Unemployment rate by sex, age and persons with disabilities', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 8.6.1 - Youth NEET
INSERT INTO forms (name, description, category, created_by) VALUES 
('8.6.1 Data Collection Form', 'Data collection form for Proportion of youth (aged 15–24 years) not in education, employment or training', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- Create detailed field structures for the final 7 forms
DO $$ 
DECLARE 
    form_1a1_id uuid; form_1a2_id uuid; form_1b1_id uuid; 
    form_1511_id uuid; form_1691_id uuid; form_852_id uuid; form_861_id uuid;
    group_basic_id uuid; group_data_id uuid;
BEGIN
    -- Get form IDs
    SELECT id INTO form_1a1_id FROM forms WHERE name = '1.a.1 Data Collection Form' AND category = 'sdg';
    SELECT id INTO form_1a2_id FROM forms WHERE name = '1.a.2 Data Collection Form' AND category = 'sdg';
    SELECT id INTO form_1b1_id FROM forms WHERE name = '1.b.1 Data Collection Form' AND category = 'sdg';
    SELECT id INTO form_1511_id FROM forms WHERE name = '15.1.1 Data Collection Form' AND category = 'sdg';
    SELECT id INTO form_1691_id FROM forms WHERE name = '16.9.1 Data Collection Form' AND category = 'sdg';
    SELECT id INTO form_852_id FROM forms WHERE name = '8.5.2 Data Collection Form' AND category = 'sdg';
    SELECT id INTO form_861_id FROM forms WHERE name = '8.6.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups and fields for 1.a.1 (ODA)
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_1a1_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_1a1_id, 'oda_data', 'ODA Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_1a1_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_1a1_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'World Bank, OECD-DAC, or Government', 2),
    (form_1a1_id, group_data_id, 'total_oda_amount', 'Total ODA Amount (USD millions)', 'number', true, false, 'e.g., 125.5', 10),
    (form_1a1_id, group_data_id, 'poverty_focused_oda', 'Poverty-Focused ODA (USD millions)', 'number', true, false, 'e.g., 45.2', 11),
    (form_1a1_id, group_data_id, 'gni_amount', 'Gross National Income (USD millions)', 'number', false, false, 'e.g., 8500', 12),
    (form_1a1_id, group_data_id, 'oda_gni_percentage', 'ODA as % of GNI', 'number', true, false, 'e.g., 1.47', 13);
    
    -- Create fields for 8.5.2 (Unemployment)
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_852_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_852_id, 'unemployment_data', 'Unemployment Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_852_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_852_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'LFS, Population Census, or Survey', 2),
    (form_852_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_852_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 4),
    (form_852_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, '15-24, 25-54, 55+, or Total', 5),
    (form_852_id, group_basic_id, 'disability_status', 'Disability Status', 'select', false, false, 'With disabilities, Without disabilities, or Total', 6),
    (form_852_id, group_data_id, 'labor_force', 'Total Labor Force', 'number', false, false, 'e.g., 1250000', 10),
    (form_852_id, group_data_id, 'unemployed_persons', 'Unemployed Persons', 'number', false, false, 'e.g., 62500', 11),
    (form_852_id, group_data_id, 'unemployment_rate', 'Unemployment Rate (%)', 'number', true, false, 'e.g., 5.0', 12);
    
    -- Create fields for 8.6.1 (Youth NEET)
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_861_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_861_id, 'neet_data', 'Youth NEET Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_861_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_861_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'LFS, HIES, or Youth Survey', 2),
    (form_861_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_861_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 4),
    (form_861_id, group_data_id, 'total_youth_15_24', 'Total Youth Population (15-24)', 'number', false, false, 'e.g., 450000', 10),
    (form_861_id, group_data_id, 'youth_neet', 'Youth Not in Education, Employment or Training', 'number', false, false, 'e.g., 135000', 11),
    (form_861_id, group_data_id, 'neet_rate', 'NEET Rate (%)', 'number', true, false, 'e.g., 30.0', 12);
    
    -- Create basic fields for remaining forms (16.9.1, 15.1.1, 1.a.2, 1.b.1)
    -- 16.9.1 Birth registration
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_1691_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_1691_id, 'registration_data', 'Birth Registration Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_1691_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (form_1691_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'MICS, DHS, Civil Registration', 2),
    (form_1691_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_1691_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (form_1691_id, group_basic_id, 'child_age_months', 'Child Age (Months)', 'select', false, false, '0-11, 12-23, 24-35, 36-47, 48-59, or Total', 5),
    (form_1691_id, group_data_id, 'children_under_5', 'Total Children Under 5', 'number', false, false, 'e.g., 125000', 10),
    (form_1691_id, group_data_id, 'registered_births', 'Registered Births', 'number', false, false, 'e.g., 89250', 11),
    (form_1691_id, group_data_id, 'registration_rate', 'Birth Registration Rate (%)', 'number', true, false, 'e.g., 71.4', 12);
    
END $$;