-- Batch 2: Create more comprehensive SDG indicator forms

-- 2.2.2 Child malnutrition (wasting and overweight) form
INSERT INTO forms (name, description, category, created_by) VALUES 
('2.2.2 Data Collection Form', 'Data collection form for Prevalence of malnutrition (weight for height >+2 or <-2 standard deviation from the median of the WHO Child Growth Standards) among children under 5 years of age, by type (wasting and overweight)', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 3.1.1 Maternal mortality ratio form
INSERT INTO forms (name, description, category, created_by) VALUES 
('3.1.1 Data Collection Form', 'Data collection form for Maternal mortality ratio', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 3.2.1 Under-5 mortality rate form
INSERT INTO forms (name, description, category, created_by) VALUES 
('3.2.1 Data Collection Form', 'Data collection form for Under-5 mortality rate', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 3.3.1 HIV incidence form
INSERT INTO forms (name, description, category, created_by) VALUES 
('3.3.1 Data Collection Form', 'Data collection form for Number of new HIV infections per 1,000 uninfected population, by sex, age and key populations', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 4.1.2 Primary completion rate form
INSERT INTO forms (name, description, category, created_by) VALUES 
('4.1.2 Data Collection Form', 'Data collection form for Completion rate (primary education, lower secondary education, upper secondary education)', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 4.2.1 Early childhood development form
INSERT INTO forms (name, description, category, created_by) VALUES 
('4.2.1 Data Collection Form', 'Data collection form for Proportion of children aged 24-59 months who are developmentally on track in health, learning and psychosocial well-being, by sex', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 5.2.1 Violence against women form
INSERT INTO forms (name, description, category, created_by) VALUES 
('5.2.1 Data Collection Form', 'Data collection form for Proportion of ever-partnered women and girls aged 15 years and older subjected to physical, sexual or psychological violence by a current or former intimate partner in the previous 12 months, by form of violence and by age', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- 5.3.1 Child marriage form
INSERT INTO forms (name, description, category, created_by) VALUES 
('5.3.1 Data Collection Form', 'Data collection form for Proportion of women aged 20-24 years who were married or in a union before age 15 and before age 18', 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4');

-- Create detailed field structures for 2.2.2 (Child malnutrition)
DO $$ 
DECLARE 
    form_222_id uuid;
    group_basic_id uuid;
    group_malnutrition_id uuid;
BEGIN
    SELECT id INTO form_222_id FROM forms WHERE name = '2.2.2 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_222_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_222_id, 'malnutrition_data', 'Malnutrition Measurements', 'section', 2) RETURNING id INTO group_malnutrition_id;
    
    -- Basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_222_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_222_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'MICS, PDHS, NNS, or Other', 2),
    (form_222_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_222_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_222_id, group_basic_id, 'sex', 'Sex', 'select', false, false, false, 'Male, Female, or Total', 5),
    (form_222_id, group_basic_id, 'age_months', 'Age Group (Months)', 'select', false, false, false, '0-5, 6-11, 12-23, 24-35, 36-47, 48-59, or Total', 6),
    (form_222_id, group_basic_id, 'malnutrition_type', 'Malnutrition Type', 'select', true, false, false, 'Wasting, Overweight, or Both', 7);
    
    -- Malnutrition data fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_222_id, group_malnutrition_id, 'wasting_prevalence', 'Wasting Prevalence (%)', 'number', false, false, false, 'e.g., 17.7', 10),
    (form_222_id, group_malnutrition_id, 'overweight_prevalence', 'Overweight Prevalence (%)', 'number', false, false, false, 'e.g., 3.2', 11),
    (form_222_id, group_malnutrition_id, 'total_prevalence', 'Total Malnutrition Prevalence (%)', 'number', true, false, false, 'e.g., 20.9', 12),
    (form_222_id, group_malnutrition_id, 'baseline_prevalence', 'Baseline Prevalence (%)', 'number', false, false, false, 'e.g., 23.1', 13),
    (form_222_id, group_malnutrition_id, 'target_prevalence', 'Target Prevalence (%)', 'number', false, false, false, 'e.g., 15.0', 14),
    (form_222_id, group_malnutrition_id, 'children_assessed', 'Total Children Assessed', 'number', false, false, false, 'e.g., 3000', 15);
END $$;

-- Create detailed field structures for 3.1.1 (Maternal mortality)
DO $$ 
DECLARE 
    form_311_id uuid;
    group_basic_id uuid;
    group_mortality_id uuid;
BEGIN
    SELECT id INTO form_311_id FROM forms WHERE name = '3.1.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_311_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_311_id, 'mortality_data', 'Maternal Mortality Data', 'section', 2) RETURNING id INTO group_mortality_id;
    
    -- Basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_311_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_311_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'PDHS, Civil Registration, Health Records, or Other', 2),
    (form_311_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_311_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4);
    
    -- Mortality data fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_311_id, group_mortality_id, 'maternal_deaths', 'Maternal Deaths', 'number', true, false, false, 'e.g., 186', 10),
    (form_311_id, group_mortality_id, 'live_births', 'Live Births', 'number', true, false, false, 'e.g., 125000', 11),
    (form_311_id, group_mortality_id, 'maternal_mortality_ratio', 'Maternal Mortality Ratio (per 100,000 live births)', 'number', true, false, false, 'e.g., 148.8', 12),
    (form_311_id, group_mortality_id, 'baseline_ratio', 'Baseline MMR (per 100,000)', 'number', false, false, false, 'e.g., 260', 13),
    (form_311_id, group_mortality_id, 'target_ratio', 'Target MMR (per 100,000)', 'number', false, false, false, 'e.g., 70', 14);
END $$;

-- Create detailed field structures for 5.2.1 (Violence against women)
DO $$ 
DECLARE 
    form_521_id uuid;
    group_basic_id uuid;
    group_violence_id uuid;
BEGIN
    SELECT id INTO form_521_id FROM forms WHERE name = '5.2.1 Data Collection Form' AND category = 'sdg';
    
    -- Create field groups
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_521_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_521_id, 'violence_data', 'Violence Data', 'section', 2) RETURNING id INTO group_violence_id;
    
    -- Basic information fields (excluding sex since this is women-specific)
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_521_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_521_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'PDHS, MICS, DHS, or Other', 2),
    (form_521_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District', 3),
    (form_521_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_521_id, group_basic_id, 'age_group', 'Age Group', 'select', true, false, false, '15-19, 20-24, 25-34, 35-49, 15-49 (Total)', 5),
    (form_521_id, group_basic_id, 'violence_type', 'Violence Type', 'select', true, false, false, 'Physical, Sexual, Psychological, or Any', 6);
    
    -- Violence data fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_521_id, group_violence_id, 'baseline_value', 'Baseline Prevalence (%)', 'number', false, false, false, 'e.g., 38.2', 10),
    (form_521_id, group_violence_id, 'current_value', 'Current Prevalence (%)', 'number', true, false, false, 'e.g., 34.0', 11),
    (form_521_id, group_violence_id, 'target_value', 'Target Prevalence (%)', 'number', false, false, false, 'e.g., 25.0', 12),
    (form_521_id, group_violence_id, 'women_interviewed', 'Ever-partnered Women Interviewed', 'number', false, false, false, 'e.g., 12500', 13),
    (form_521_id, group_violence_id, 'women_experienced_violence', 'Women Who Experienced Violence', 'number', false, false, false, 'e.g., 4250', 14),
    (form_521_id, group_violence_id, 'reporting_rate', 'Reporting Rate (%)', 'number', false, false, false, 'e.g., 15.2', 15);
END $$;