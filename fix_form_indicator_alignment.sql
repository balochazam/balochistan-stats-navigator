-- Fix critical form-indicator misalignments
-- These forms need to be completely rebuilt to match their indicator requirements

-- 1.4.1: Multi-dimensional basic services access (COMPLETE REBUILD)
DO $$ 
DECLARE 
    target_form_id uuid;
BEGIN
    SELECT id INTO target_form_id FROM forms WHERE name = '1.4.1 Data Collection Form' AND category = 'sdg';
    
    -- Delete existing incorrect fields
    DELETE FROM form_fields WHERE form_id = target_form_id;
    DELETE FROM field_groups WHERE form_id = target_form_id;
    
    -- Create proper multi-dimensional structure
    WITH group_basic AS (
        INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
        VALUES (target_form_id, 'basic_info', 'Basic Information', 'section', 1) 
        RETURNING id
    ),
    group_services AS (
        INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
        VALUES (target_form_id, 'basic_services', 'Basic Services Access Data', 'section', 2) 
        RETURNING id
    )
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) 
    SELECT target_form_id, group_basic.id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'data_source', 'Data Source', 'select', true, false, 'MICS, PSLM, Census, Household Survey', 2 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5 FROM group_basic
    -- Multi-dimensional services
    UNION ALL
    SELECT form_id, group_services.id, 'households_surveyed', 'Total Households Surveyed', 'number', true, false, 'e.g., 5000', 10 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'electricity_access', 'Households with Electricity Access', 'number', true, false, 'e.g., 4250', 11 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'electricity_percentage', 'Electricity Access Rate (%)', 'number', true, false, 'e.g., 85.0', 12 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'water_access', 'Households with Improved Water Source', 'number', true, false, 'e.g., 3750', 13 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'water_percentage', 'Improved Water Access Rate (%)', 'number', true, false, 'e.g., 75.0', 14 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'sanitation_access', 'Households with Improved Sanitation', 'number', true, false, 'e.g., 3000', 15 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'sanitation_percentage', 'Improved Sanitation Rate (%)', 'number', true, false, 'e.g., 60.0', 16 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'waste_management_access', 'Households with Waste Collection', 'number', false, false, 'e.g., 2500', 17 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'waste_percentage', 'Waste Collection Rate (%)', 'number', false, false, 'e.g., 50.0', 18 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'ict_access', 'Households with ICT Access', 'number', false, false, 'e.g., 2000', 19 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'ict_percentage', 'ICT Access Rate (%)', 'number', false, false, 'e.g., 40.0', 20 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'overall_basic_services', 'Households with All Basic Services', 'number', true, false, 'e.g., 1500', 21 FROM group_services
    UNION ALL
    SELECT form_id, group_services.id, 'overall_percentage', 'Overall Basic Services Access Rate (%)', 'number', true, false, 'e.g., 30.0', 22 FROM group_services;
END $$;

-- 2.1.1: Undernourishment (REBUILD with proper methodology)
DO $$ 
DECLARE 
    form_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '2.1.1 Data Collection Form' AND category = 'sdg';
    
    -- Delete existing incorrect fields
    DELETE FROM form_fields WHERE form_id = form_id;
    DELETE FROM field_groups WHERE form_id = form_id;
    
    -- Create proper undernourishment methodology structure
    WITH group_basic AS (
        INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
        VALUES (form_id, 'basic_info', 'Basic Information', 'section', 1) 
        RETURNING id
    ),
    group_undernourishment AS (
        INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) 
        VALUES (form_id, 'undernourishment_data', 'Undernourishment Assessment Data', 'section', 2) 
        RETURNING id
    )
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) 
    SELECT form_id, group_basic.id, 'year', 'Data Year', 'number', true, true, 'e.g., 2024', 1 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'data_source', 'Data Source', 'select', true, false, 'NNS, HIES, Food Security Survey', 2 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'urban_rural', 'Urban/Rural', 'select', false, false, 'Urban, Rural, or Total', 4 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'sex', 'Sex', 'select', false, false, 'Male, Female, or Total', 5 FROM group_basic
    UNION ALL
    SELECT form_id, group_basic.id, 'age_group', 'Age Group', 'select', false, false, 'Under 5, 5-17, 18-64, 65+, or Total', 6 FROM group_basic
    -- Undernourishment calculation components
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'total_population', 'Total Population Assessed', 'number', true, false, 'e.g., 1000000', 10 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'average_dietary_energy_supply', 'Average Dietary Energy Supply (kcal/person/day)', 'number', true, false, 'e.g., 2350', 11 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'minimum_dietary_energy_requirement', 'Minimum Dietary Energy Requirement (kcal/person/day)', 'number', true, false, 'e.g., 1800', 12 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'coefficient_of_variation', 'Coefficient of Variation of Food Consumption', 'number', true, false, 'e.g., 0.25', 13 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'undernourished_population', 'Number of Undernourished People', 'number', true, false, 'e.g., 180000', 14 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'prevalence_undernourishment', 'Prevalence of Undernourishment (%)', 'number', true, false, 'e.g., 18.0', 15 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'baseline_prevalence', 'Baseline Prevalence (%)', 'number', false, false, 'e.g., 22.3', 16 FROM group_undernourishment
    UNION ALL
    SELECT form_id, group_undernourishment.id, 'target_prevalence', 'Target Prevalence (%)', 'number', false, false, 'e.g., 10.0', 17 FROM group_undernourishment;
END $$;