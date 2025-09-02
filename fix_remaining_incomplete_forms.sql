-- Fix remaining incomplete forms

-- 1.a.2 Government spending on social protection
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '1.a.2 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'spending_data', 'Social Protection Spending Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'fiscal_year', 'Fiscal Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Ministry of Finance, Budget Documents', 2),
    (form_id, group_basic_id, 'spending_category', 'Spending Category', 'select', true, false, 'Social insurance, Social assistance, Labor market', 3),
    (form_id, group_data_id, 'total_government_expenditure', 'Total Government Expenditure (PKR millions)', 'number', true, false, 'e.g., 8500000', 10),
    (form_id, group_data_id, 'social_protection_expenditure', 'Social Protection Expenditure (PKR millions)', 'number', true, false, 'e.g., 425000', 11),
    (form_id, group_data_id, 'spending_percentage', 'Social Protection as % of Total Spending', 'number', true, false, 'e.g., 5.0', 12),
    (form_id, group_data_id, 'baseline_percentage', 'Baseline Percentage', 'number', false, false, 'e.g., 3.2', 13),
    (form_id, group_data_id, 'target_percentage', 'Target Percentage', 'number', false, false, 'e.g., 8.0', 14);
END $$;

-- 1.b.1 Pro-poor spending
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '1.b.1 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'propoor_data', 'Pro-Poor Spending Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'fiscal_year', 'Fiscal Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Ministry of Finance, PSDP', 2),
    (form_id, group_basic_id, 'sector', 'Sector', 'select', true, false, 'Health, Education, Social protection, Infrastructure', 3),
    (form_id, group_data_id, 'total_public_expenditure', 'Total Public Expenditure (PKR millions)', 'number', true, false, 'e.g., 8500000', 10),
    (form_id, group_data_id, 'propoor_expenditure', 'Pro-Poor Public Expenditure (PKR millions)', 'number', true, false, 'e.g., 2125000', 11),
    (form_id, group_data_id, 'propoor_percentage', 'Pro-Poor Spending as % of Total', 'number', true, false, 'e.g., 25.0', 12),
    (form_id, group_data_id, 'direct_benefit_programs', 'Direct Benefit Programs (PKR millions)', 'number', false, false, 'e.g., 850000', 13),
    (form_id, group_data_id, 'capacity_building_programs', 'Capacity Building Programs (PKR millions)', 'number', false, false, 'e.g., 425000', 14);
END $$;

-- 15.1.1 Forest area
DO $$ 
DECLARE 
    form_id uuid;
    group_basic_id uuid;
    group_data_id uuid;
BEGIN
    SELECT id INTO form_id FROM forms WHERE name = '15.1.1 Data Collection Form' AND category = 'sdg';
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'forest_data', 'Forest Area Data', 'section', 2) RETURNING id INTO group_data_id;
    
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'measurement_year', 'Measurement Year', 'number', true, true, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, 'Forest Department, FAO, Satellite Data', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, 'Province/District', 3),
    (form_id, group_basic_id, 'forest_type', 'Forest Type', 'select', false, false, 'Natural, Planted, or Total', 4),
    (form_id, group_data_id, 'total_land_area', 'Total Land Area (hectares)', 'number', true, false, 'e.g., 34719000', 10),
    (form_id, group_data_id, 'forest_area', 'Forest Area (hectares)', 'number', true, false, 'e.g., 1902000', 11),
    (form_id, group_data_id, 'forest_percentage', 'Forest Area as % of Total Land', 'number', true, false, 'e.g., 5.48', 12),
    (form_id, group_data_id, 'baseline_percentage', 'Baseline Forest Percentage', 'number', false, false, 'e.g., 5.01', 13),
    (form_id, group_data_id, 'target_percentage', 'Target Forest Percentage', 'number', false, false, 'e.g., 6.0', 14),
    (form_id, group_data_id, 'deforestation_rate', 'Annual Deforestation Rate (%)', 'number', false, false, 'e.g., -0.43', 15);
END $$;