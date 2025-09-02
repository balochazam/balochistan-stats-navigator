-- Fix critical form-indicator misalignments - CORRECTED VERSION
-- These forms need to be completely rebuilt to match their indicator requirements

-- 1.4.1: Multi-dimensional basic services access (COMPLETE REBUILD)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_services_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '1.4.1 Data Collection Form' AND category = 'sdg';
    
    -- Delete existing incorrect fields
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    -- Create proper group structure first
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_services', 'Basic Services Access Data', 'section', 2) 
    RETURNING id INTO group_services_id;
    
    -- Insert basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'MICS, PSLM, Census, Household Survey', 2),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (target_form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (target_form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5);
    
    -- Insert multi-dimensional services fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_services_id, 'households_surveyed', 'Total Households Surveyed', 'number', true, false, 'e.g., 5000', 10),
    (target_form_id, group_services_id, 'electricity_access', 'Households with Electricity Access', 'number', true, false, 'e.g., 4250', 11),
    (target_form_id, group_services_id, 'electricity_percentage', 'Electricity Access Rate (%)', 'number', true, false, 'e.g., 85.0', 12),
    (target_form_id, group_services_id, 'water_access', 'Households with Improved Water Source', 'number', true, false, 'e.g., 3750', 13),
    (target_form_id, group_services_id, 'water_percentage', 'Improved Water Access Rate (%)', 'number', true, false, 'e.g., 75.0', 14),
    (target_form_id, group_services_id, 'sanitation_access', 'Households with Improved Sanitation', 'number', true, false, 'e.g., 3000', 15),
    (target_form_id, group_services_id, 'sanitation_percentage', 'Improved Sanitation Rate (%)', 'number', true, false, 'e.g., 60.0', 16),
    (target_form_id, group_services_id, 'waste_management_access', 'Households with Waste Collection', 'number', false, false, 'e.g., 2500', 17),
    (target_form_id, group_services_id, 'waste_percentage', 'Waste Collection Rate (%)', 'number', false, false, 'e.g., 50.0', 18),
    (target_form_id, group_services_id, 'ict_access', 'Households with ICT Access', 'number', false, false, 'e.g., 2000', 19),
    (target_form_id, group_services_id, 'ict_percentage', 'ICT Access Rate (%)', 'number', false, false, 'e.g., 40.0', 20),
    (target_form_id, group_services_id, 'overall_basic_services', 'Households with All Basic Services', 'number', true, false, 'e.g., 1500', 21),
    (target_form_id, group_services_id, 'overall_percentage', 'Overall Basic Services Access Rate (%)', 'number', true, false, 'e.g., 30.0', 22);
END $$;

-- 2.1.1: Undernourishment (REBUILD with proper methodology)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_undernourishment_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '2.1.1 Data Collection Form' AND category = 'sdg';
    
    -- Delete existing incorrect fields
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    -- Create proper group structure
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'undernourishment_data', 'Undernourishment Assessment Data', 'section', 2) 
    RETURNING id INTO group_undernourishment_id;
    
    -- Insert basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'NNS, HIES, Food Security Survey', 2),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (target_form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (target_form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5),
    (target_form_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, 'Under 5, 5-17, 18-64, 65+, or Total', 6);
    
    -- Insert undernourishment calculation components
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_undernourishment_id, 'total_population', 'Total Population Assessed', 'number', true, false, 'e.g., 1000000', 10),
    (target_form_id, group_undernourishment_id, 'average_dietary_energy_supply', 'Average Dietary Energy Supply (kcal/person/day)', 'number', true, false, 'e.g., 2350', 11),
    (target_form_id, group_undernourishment_id, 'minimum_dietary_energy_requirement', 'Minimum Dietary Energy Requirement (kcal/person/day)', 'number', true, false, 'e.g., 1800', 12),
    (target_form_id, group_undernourishment_id, 'coefficient_of_variation', 'Coefficient of Variation of Food Consumption', 'number', true, false, 'e.g., 0.25', 13),
    (target_form_id, group_undernourishment_id, 'undernourished_population', 'Number of Undernourished People', 'number', true, false, 'e.g., 180000', 14),
    (target_form_id, group_undernourishment_id, 'prevalence_undernourishment', 'Prevalence of Undernourishment (%)', 'number', true, false, 'e.g., 18.0', 15),
    (target_form_id, group_undernourishment_id, 'baseline_prevalence', 'Baseline Prevalence (%)', 'number', false, false, 'e.g., 22.3', 16),
    (target_form_id, group_undernourishment_id, 'target_prevalence', 'Target Prevalence (%)', 'number', false, false, 'e.g., 10.0', 17);
END $$;

-- 3.1.1: Maternal mortality (REBUILD with proper disaggregation)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_maternal_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '3.1.1 Data Collection Form' AND category = 'sdg';
    
    -- Delete existing incorrect fields
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    -- Create proper group structure
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'maternal_mortality_data', 'Maternal Mortality Data', 'section', 2) 
    RETURNING id INTO group_maternal_id;
    
    -- Insert basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Civil Registration, PDHS, MICS, Health Facility Records', 2),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (target_form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4),
    (target_form_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, '15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, or Total', 5),
    (target_form_id, group_basic_id, 'place_of_delivery', 'Place of Delivery', 'select', false, false, 'Health facility, Home, Other, or Total', 6);
    
    -- Insert maternal mortality specific fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_maternal_id, 'live_births', 'Total Live Births', 'number', true, false, 'e.g., 125000', 10),
    (target_form_id, group_maternal_id, 'maternal_deaths', 'Maternal Deaths', 'number', true, false, 'e.g., 340', 11),
    (target_form_id, group_maternal_id, 'maternal_mortality_ratio', 'Maternal Mortality Ratio (per 100,000 live births)', 'number', true, false, 'e.g., 272', 12),
    (target_form_id, group_maternal_id, 'direct_obstetric_deaths', 'Direct Obstetric Deaths', 'number', false, false, 'e.g., 204', 13),
    (target_form_id, group_maternal_id, 'indirect_obstetric_deaths', 'Indirect Obstetric Deaths', 'number', false, false, 'e.g., 136', 14),
    (target_form_id, group_maternal_id, 'skilled_birth_attendance', 'Births with Skilled Attendance (%)', 'number', false, false, 'e.g., 69.0', 15),
    (target_form_id, group_maternal_id, 'baseline_ratio', 'Baseline MMR', 'number', false, false, 'e.g., 297', 16),
    (target_form_id, group_maternal_id, 'target_ratio', 'Target MMR', 'number', false, false, 'e.g., 70', 17);
END $$;

-- 3.3.1: HIV incidence (REBUILD with proper key populations)
DO $$ 
DECLARE 
    target_form_id uuid;
    group_basic_id uuid;
    group_hiv_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '3.3.1 Data Collection Form' AND category = 'sdg';
    
    -- Delete existing incorrect fields
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    -- Create proper group structure
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
    RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
    VALUES (target_form_id, 'hiv_incidence_data', 'HIV Incidence Data', 'section', 2) 
    RETURNING id INTO group_hiv_id;
    
    -- Insert basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1),
    (target_form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'NAP, UNAIDS, HIV Surveillance, Health Ministry', 2),
    (target_form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (target_form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 4),
    (target_form_id, group_basic_id, 'age_group', 'Age Group', 'select', false, false, '15-24, 25-34, 35-49, 50+, or Total', 5),
    (target_form_id, group_basic_id, 'key_population_type', 'Key Population Type', 'select', false, false, 'General Population, MSM, PWID, Female Sex Workers, Male Clients, or Total', 6);
    
    -- Insert HIV incidence specific fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (target_form_id, group_hiv_id, 'uninfected_population', 'Uninfected Population at Risk', 'number', true, false, 'e.g., 1250000', 10),
    (target_form_id, group_hiv_id, 'new_hiv_infections', 'New HIV Infections', 'number', true, false, 'e.g., 125', 11),
    (target_form_id, group_hiv_id, 'hiv_incidence_rate', 'HIV Incidence Rate (per 1,000 uninfected)', 'number', true, false, 'e.g., 0.10', 12),
    (target_form_id, group_hiv_id, 'testing_coverage', 'HIV Testing Coverage (%)', 'number', false, false, 'e.g., 45.0', 13),
    (target_form_id, group_hiv_id, 'prevention_coverage', 'Prevention Program Coverage (%)', 'number', false, false, 'e.g., 32.0', 14),
    (target_form_id, group_hiv_id, 'baseline_incidence', 'Baseline Incidence Rate', 'number', false, false, 'e.g., 0.15', 15),
    (target_form_id, group_hiv_id, 'target_incidence', 'Target Incidence Rate', 'number', false, false, 'e.g., 0.05', 16);
END $$;