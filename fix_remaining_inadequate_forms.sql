-- Fix the remaining forms with too few fields

-- 8.6.1: NEET youth indicator (needs comprehensive demographic breakdown)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_neet_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '8.6.1 Data Collection Form' AND category = 'sdg';
    
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'neet_youth_data', 'NEET Youth Data', 'section', 2) 
    RETURNING id INTO group_neet_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'LFS, PSLM, Youth Survey', 2),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (target_form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (target_form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5),
    (target_form_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, '15-19, 20-24, or Total (15-24)', 6),
    (target_form_id, group_basic_id, 'education_level', 'Education Level', 'select', false, false, 'No education, Primary, Secondary, Higher, or Total', 7),
    (target_form_id, group_neet_id, 'total_youth_15_24', 'Total Youth Population (15-24 years)', 'number', true, false, 'e.g., 250000', 10),
    (target_form_id, group_neet_id, 'youth_in_education', 'Youth in Education', 'number', false, false, 'e.g., 125000', 11),
    (target_form_id, group_neet_id, 'youth_in_employment', 'Youth in Employment', 'number', false, false, 'e.g., 75000', 12),
    (target_form_id, group_neet_id, 'youth_in_training', 'Youth in Training Programs', 'number', false, false, 'e.g., 12500', 13),
    (target_form_id, group_neet_id, 'youth_neet', 'Youth NEET (Not in Education, Employment, or Training)', 'number', true, false, 'e.g., 37500', 14),
    (target_form_id, group_neet_id, 'neet_rate', 'NEET Rate (%)', 'number', true, false, 'e.g., 15.0', 15),
    (target_form_id, group_neet_id, 'neet_seeking_work', 'NEET Youth Seeking Work', 'number', false, false, 'e.g., 22500', 16),
    (target_form_id, group_neet_id, 'neet_not_seeking_work', 'NEET Youth Not Seeking Work', 'number', false, false, 'e.g., 15000', 17),
    (target_form_id, group_neet_id, 'baseline_neet_rate', 'Baseline NEET Rate (%)', 'number', false, false, 'e.g., 18.5', 18),
    (target_form_id, group_neet_id, 'target_neet_rate', 'Target NEET Rate (%)', 'number', false, false, 'e.g., 10.0', 19);
END $$;

-- 1.a.1: ODA for poverty reduction (needs more comprehensive structure)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_oda_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '1.a.1 Data Collection Form' AND category = 'sdg';
    
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'oda_poverty_data', 'ODA for Poverty Reduction Data', 'section', 2) 
    RETURNING id INTO group_oda_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Fiscal Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Ministry of Finance, OECD DAC, Development Partners', 2),
    (target_form_id, group_basic_id, 'donor_type', 'Donor Type', 'select', false, false, 'Bilateral, Multilateral, NGO, or Total', 3),
    (target_form_id, group_basic_id, 'sector', 'Sector', 'select', false, false, 'Social Protection, Rural Development, Basic Services, or Total', 4),
    (target_form_id, group_oda_id, 'total_oda_received', 'Total ODA Received (USD millions)', 'number', true, false, 'e.g., 1250.5', 10),
    (target_form_id, group_oda_id, 'poverty_focused_oda', 'Poverty-Focused ODA (USD millions)', 'number', true, false, 'e.g., 375.2', 11),
    (target_form_id, group_oda_id, 'poverty_oda_percentage', 'Poverty-Focused ODA as % of Total ODA', 'number', false, false, 'e.g., 30.0', 12),
    (target_form_id, group_oda_id, 'gni_amount', 'Gross National Income (USD millions)', 'number', true, false, 'e.g., 85000', 13),
    (target_form_id, group_oda_id, 'oda_gni_percentage', 'Poverty-Focused ODA as % of GNI', 'number', true, false, 'e.g., 0.44', 14),
    (target_form_id, group_oda_id, 'social_protection_oda', 'Social Protection ODA (USD millions)', 'number', false, false, 'e.g., 125.3', 15),
    (target_form_id, group_oda_id, 'rural_development_oda', 'Rural Development ODA (USD millions)', 'number', false, false, 'e.g., 150.8', 16),
    (target_form_id, group_oda_id, 'basic_services_oda', 'Basic Services ODA (USD millions)', 'number', false, false, 'e.g., 99.1', 17),
    (target_form_id, group_oda_id, 'baseline_oda_gni', 'Baseline ODA/GNI Ratio', 'number', false, false, 'e.g., 0.52', 18),
    (target_form_id, group_oda_id, 'target_oda_gni', 'Target ODA/GNI Ratio', 'number', false, false, 'e.g., 0.30', 19);
END $$;