-- Fix critical indicators with proper methodologies - BATCH 1
-- Focus on health, education, and gender indicators that need authentic structures

-- 3.2.2: Neonatal mortality rate (CRITICAL HEALTH INDICATOR)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_neonatal_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '3.2.2 Data Collection Form' AND category = 'sdg';
    
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'neonatal_mortality_data', 'Neonatal Mortality Data', 'section', 2) 
    RETURNING id INTO group_neonatal_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Civil Registration, PDHS, DHS, Health Facility Records', 2),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (target_form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (target_form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5),
    (target_form_id, group_basic_id, 'birth_weight_category', 'Birth Weight Category', 'select', false, false, 'Very low (<1500g), Low (1500-2499g), Normal (≥2500g), or Total', 6),
    (target_form_id, group_basic_id, 'gestational_age', 'Gestational Age', 'select', false, false, 'Preterm (<37 weeks), Term (≥37 weeks), or Total', 7),
    (target_form_id, group_neonatal_id, 'live_births', 'Total Live Births', 'number', true, false, 'e.g., 125000', 10),
    (target_form_id, group_neonatal_id, 'neonatal_deaths', 'Neonatal Deaths (0-27 days)', 'number', true, false, 'e.g., 2875', 11),
    (target_form_id, group_neonatal_id, 'early_neonatal_deaths', 'Early Neonatal Deaths (0-6 days)', 'number', false, false, 'e.g., 2012', 12),
    (target_form_id, group_neonatal_id, 'late_neonatal_deaths', 'Late Neonatal Deaths (7-27 days)', 'number', false, false, 'e.g., 863', 13),
    (target_form_id, group_neonatal_id, 'neonatal_mortality_rate', 'Neonatal Mortality Rate (per 1,000 live births)', 'number', true, false, 'e.g., 23.0', 14),
    (target_form_id, group_neonatal_id, 'birth_asphyxia_deaths', 'Deaths from Birth Asphyxia', 'number', false, false, 'e.g., 1150', 15),
    (target_form_id, group_neonatal_id, 'infection_deaths', 'Deaths from Infections', 'number', false, false, 'e.g., 863', 16),
    (target_form_id, group_neonatal_id, 'congenital_anomaly_deaths', 'Deaths from Congenital Anomalies', 'number', false, false, 'e.g., 575', 17),
    (target_form_id, group_neonatal_id, 'skilled_birth_attendance', 'Births with Skilled Attendance (%)', 'number', false, false, 'e.g., 69.0', 18),
    (target_form_id, group_neonatal_id, 'baseline_rate', 'Baseline NMR', 'number', false, false, 'e.g., 42.0', 19),
    (target_form_id, group_neonatal_id, 'target_rate', 'Target NMR', 'number', false, false, 'e.g., 12.0', 20);
END $$;

-- 4.5.1: Education parity indices (CRITICAL EDUCATION INDICATOR)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_parity_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '4.5.1 Data Collection Form' AND category = 'sdg';
    
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'parity_indices_data', 'Education Parity Indices Data', 'section', 2) 
    RETURNING id INTO group_parity_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Academic Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'EMIS, MICS, ASER, Education Census', 2),
    (target_form_id, group_basic_id, 'education_indicator', 'Education Indicator', 'select', true, false, 'Net Enrollment, Completion Rate, Literacy Rate, Learning Achievement', 3),
    (target_form_id, group_basic_id, 'education_level', 'Education Level', 'select', true, false, 'Primary, Lower Secondary, Upper Secondary', 4),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 5),
    -- Gender Parity
    (target_form_id, group_parity_id, 'male_value', 'Male Value (for selected indicator)', 'number', true, false, 'e.g., 65.2', 10),
    (target_form_id, group_parity_id, 'female_value', 'Female Value (for selected indicator)', 'number', true, false, 'e.g., 58.7', 11),
    (target_form_id, group_parity_id, 'gender_parity_index', 'Gender Parity Index (Female/Male)', 'number', true, false, 'e.g., 0.90', 12),
    -- Urban/Rural Parity
    (target_form_id, group_parity_id, 'urban_value', 'Urban Value', 'number', false, false, 'e.g., 78.5', 13),
    (target_form_id, group_parity_id, 'rural_value', 'Rural Value', 'number', false, false, 'e.g., 52.3', 14),
    (target_form_id, group_parity_id, 'location_parity_index', 'Location Parity Index (Rural/Urban)', 'number', false, false, 'e.g., 0.67', 15),
    -- Wealth Parity
    (target_form_id, group_parity_id, 'poorest_quintile_value', 'Poorest Quintile Value', 'number', false, false, 'e.g., 45.2', 16),
    (target_form_id, group_parity_id, 'richest_quintile_value', 'Richest Quintile Value', 'number', false, false, 'e.g., 85.7', 17),
    (target_form_id, group_parity_id, 'wealth_parity_index', 'Wealth Parity Index (Poorest/Richest)', 'number', false, false, 'e.g., 0.53', 18),
    -- Disability Parity
    (target_form_id, group_parity_id, 'disabled_value', 'Children with Disabilities Value', 'number', false, false, 'e.g., 32.1', 19),
    (target_form_id, group_parity_id, 'non_disabled_value', 'Children without Disabilities Value', 'number', false, false, 'e.g., 62.8', 20),
    (target_form_id, group_parity_id, 'disability_parity_index', 'Disability Parity Index (Disabled/Non-disabled)', 'number', false, false, 'e.g., 0.51', 21);
END $$;

-- 5.5.1: Women in parliament (CRITICAL GENDER INDICATOR)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_representation_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '5.5.1 Data Collection Form' AND category = 'sdg';
    
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'representation_data', 'Women Political Representation Data', 'section', 2) 
    RETURNING id INTO group_representation_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Election/Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Election Commission, Parliament Records, Provincial Assembly', 2),
    (target_form_id, group_basic_id, 'legislature_type', 'Legislature Type', 'select', true, false, 'National Assembly, Senate, Provincial Assembly, Local Government', 3),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'National, Provincial (specify province)', 4),
    (target_form_id, group_basic_id, 'seat_type', 'Seat Type', 'select', false, false, 'General Seats, Reserved Seats, Total Seats', 5),
    -- National Parliament Data
    (target_form_id, group_representation_id, 'national_assembly_total_seats', 'National Assembly Total Seats', 'number', false, false, 'e.g., 342', 10),
    (target_form_id, group_representation_id, 'national_assembly_women_seats', 'National Assembly Women Seats', 'number', false, false, 'e.g., 69', 11),
    (target_form_id, group_representation_id, 'national_assembly_percentage', 'National Assembly Women Percentage', 'number', false, false, 'e.g., 20.2', 12),
    (target_form_id, group_representation_id, 'senate_total_seats', 'Senate Total Seats', 'number', false, false, 'e.g., 104', 13),
    (target_form_id, group_representation_id, 'senate_women_seats', 'Senate Women Seats', 'number', false, false, 'e.g., 17', 14),
    (target_form_id, group_representation_id, 'senate_percentage', 'Senate Women Percentage', 'number', false, false, 'e.g., 16.3', 15),
    -- Provincial Assembly Data
    (target_form_id, group_representation_id, 'provincial_assembly_total_seats', 'Provincial Assembly Total Seats', 'number', false, false, 'e.g., 371', 16),
    (target_form_id, group_representation_id, 'provincial_assembly_women_seats', 'Provincial Assembly Women Seats', 'number', false, false, 'e.g., 66', 17),
    (target_form_id, group_representation_id, 'provincial_assembly_percentage', 'Provincial Assembly Women Percentage', 'number', false, false, 'e.g., 17.8', 18),
    -- Local Government Data
    (target_form_id, group_representation_id, 'local_government_total_seats', 'Local Government Total Seats', 'number', false, false, 'e.g., 5460', 19),
    (target_form_id, group_representation_id, 'local_government_women_seats', 'Local Government Women Seats', 'number', false, false, 'e.g., 1638', 20),
    (target_form_id, group_representation_id, 'local_government_percentage', 'Local Government Women Percentage', 'number', false, false, 'e.g., 30.0', 21),
    -- Overall Indicators
    (target_form_id, group_representation_id, 'overall_women_representation', 'Overall Women Representation (%)', 'number', true, false, 'e.g., 19.7', 22),
    (target_form_id, group_representation_id, 'baseline_percentage', 'Baseline Representation (%)', 'number', false, false, 'e.g., 15.2', 23),
    (target_form_id, group_representation_id, 'target_percentage', 'Target Representation (%)', 'number', false, false, 'e.g., 30.0', 24);
END $$;