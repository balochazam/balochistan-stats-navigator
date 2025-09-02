-- Comprehensive batch: Create forms for remaining 73 SDG indicators
-- This creates standardized forms with proper demographic breakdowns for all indicators

-- Helper function to create standard demographic and data fields for any percentage indicator
CREATE OR REPLACE FUNCTION create_standard_percentage_form(
    indicator_code TEXT,
    form_title TEXT,
    form_description TEXT,
    data_group_label TEXT DEFAULT 'Indicator Data'
) RETURNS UUID AS $$
DECLARE
    form_id UUID;
    group_basic_id UUID;
    group_data_id UUID;
BEGIN
    -- Create the form
    INSERT INTO forms (name, description, category, created_by) VALUES 
    (indicator_code || ' Data Collection Form', form_description, 'sdg', 'bbb55fbb-dc8d-44a4-9389-5842618fb3a4')
    RETURNING id INTO form_id;
    
    -- Create field groups
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'basic_info', 'Basic Information', 'section', 1) RETURNING id INTO group_basic_id;
    
    INSERT INTO field_groups (form_id, group_name, group_label, group_type, display_order) VALUES 
    (form_id, 'indicator_data', data_group_label, 'section', 2) RETURNING id INTO group_data_id;
    
    -- Standard basic information fields
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_id, group_basic_id, 'year', 'Data Year', 'number', true, true, false, 'e.g., 2024', 1),
    (form_id, group_basic_id, 'data_source', 'Data Source', 'select', true, false, true, 'Select primary data source', 2),
    (form_id, group_basic_id, 'geographic_area', 'Geographic Area', 'select', true, false, false, 'Province/District/National', 3),
    (form_id, group_basic_id, 'urban_rural', 'Urban/Rural', 'select', false, false, false, 'Urban, Rural, or Total', 4),
    (form_id, group_basic_id, 'sex', 'Sex', 'select', false, false, false, 'Male, Female, or Total', 5);
    
    -- Standard data fields for percentage indicators
    INSERT INTO form_fields (form_id, field_group_id, field_name, field_label, field_type, is_required, is_primary_column, is_secondary_column, placeholder_text, field_order) VALUES
    (form_id, group_data_id, 'baseline_value', 'Baseline Value (%)', 'number', false, false, false, 'Enter baseline percentage', 10),
    (form_id, group_data_id, 'current_value', 'Current Value (%)', 'number', true, false, false, 'Enter current percentage', 11),
    (form_id, group_data_id, 'target_value', 'Target Value (%)', 'number', false, false, false, 'Enter target percentage', 12),
    (form_id, group_data_id, 'numerator', 'Numerator', 'number', false, false, false, 'Count meeting criteria', 13),
    (form_id, group_data_id, 'denominator', 'Denominator', 'number', false, false, false, 'Total population assessed', 14);
    
    RETURN form_id;
END;
$$ LANGUAGE plpgsql;

-- Create forms for all remaining Goal 1 indicators
SELECT create_standard_percentage_form('1.2.2', 'Multidimensional Poverty', 'Proportion of men, women and children living in poverty in all its dimensions according to national definitions', 'Multidimensional Poverty Data');
SELECT create_standard_percentage_form('1.3.1', 'Social Protection Coverage', 'Proportion of population covered by social protection floors/systems', 'Social Protection Data');
SELECT create_standard_percentage_form('1.4.1', 'Basic Services Access', 'Proportion of population living in households with access to basic services', 'Basic Services Data');
SELECT create_standard_percentage_form('1.4.2', 'Secure Land Tenure', 'Proportion of total adult population with secure tenure rights to land', 'Land Tenure Data');
SELECT create_standard_percentage_form('1.5.1', 'Disaster Mortality', 'Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population', 'Disaster Impact Data');
SELECT create_standard_percentage_form('1.5.2', 'Disaster Economic Loss', 'Direct economic loss attributed to disasters in relation to global gross domestic product (GDP)', 'Economic Loss Data');
SELECT create_standard_percentage_form('1.5.3', 'DRR Strategies National', 'Number of countries that adopt and implement national disaster risk reduction strategies', 'DRR Strategy Data');
SELECT create_standard_percentage_form('1.5.4', 'DRR Strategies Local', 'Proportion of local governments that adopt and implement local disaster risk reduction strategies', 'Local DRR Data');

-- Create forms for Goal 2 indicators (remaining)
SELECT create_standard_percentage_form('2.1.1', 'Undernourishment', 'Prevalence of undernourishment', 'Undernourishment Data');
SELECT create_standard_percentage_form('2.1.2', 'Food Insecurity', 'Prevalence of moderate or severe food insecurity in the population', 'Food Security Data');
SELECT create_standard_percentage_form('2.2.3', 'Anemia in Women', 'Prevalence of anaemia in women aged 15-49 years, by pregnancy status', 'Anemia Data');
SELECT create_standard_percentage_form('2.3.1', 'Agricultural Productivity', 'Volume of production per labour unit by classes of farming/pastoral/forestry enterprise size', 'Agricultural Productivity Data');
SELECT create_standard_percentage_form('2.3.2', 'Small-scale Producer Income', 'Average income of small-scale food producers, by sex and indigenous status', 'Producer Income Data');
SELECT create_standard_percentage_form('2.4.1', 'Sustainable Agriculture', 'Proportion of agricultural area under productive and sustainable agriculture', 'Sustainable Agriculture Data');
SELECT create_standard_percentage_form('2.5.1', 'Plant Genetic Resources', 'Number of (a) plant and (b) animal genetic resources for food and agriculture secured in conservation facilities', 'Genetic Resources Data');
SELECT create_standard_percentage_form('2.5.2', 'Local Breeds at Risk', 'Proportion of local breeds classified as being at risk of extinction', 'Breed Conservation Data');
SELECT create_standard_percentage_form('2.a.1', 'Agriculture Investment', 'Agriculture orientation index for government expenditures', 'Investment Data');
SELECT create_standard_percentage_form('2.a.2', 'Agriculture ODA', 'Total official flows (official development assistance plus other official flows) to the agriculture sector', 'Development Aid Data');
SELECT create_standard_percentage_form('2.b.1', 'Agricultural Export Subsidies', 'Agricultural export subsidies', 'Export Subsidy Data');
SELECT create_standard_percentage_form('2.c.1', 'Food Price Volatility', 'Indicator of food price anomalies', 'Food Price Data');

-- Create forms for Goal 3 indicators (remaining)
SELECT create_standard_percentage_form('3.1.2', 'Skilled Birth Attendance', 'Proportion of births attended by skilled health personnel', 'Birth Attendance Data');
SELECT create_standard_percentage_form('3.2.2', 'Neonatal Mortality', 'Neonatal mortality rate', 'Neonatal Mortality Data');
SELECT create_standard_percentage_form('3.3.2', 'Tuberculosis Incidence', 'Tuberculosis incidence per 100,000 population', 'TB Data');
SELECT create_standard_percentage_form('3.3.3', 'Malaria Incidence', 'Malaria incidence per 1,000 population', 'Malaria Data');
SELECT create_standard_percentage_form('3.3.4', 'Hepatitis B Incidence', 'Hepatitis B incidence per 100,000 population', 'Hepatitis Data');
SELECT create_standard_percentage_form('3.3.5', 'NTDs', 'Number of people requiring interventions against neglected tropical diseases', 'NTD Data');
SELECT create_standard_percentage_form('3.4.1', 'NCDs Mortality', 'Mortality rate attributed to cardiovascular disease, cancer, diabetes or chronic respiratory disease', 'NCD Mortality Data');
SELECT create_standard_percentage_form('3.4.2', 'Suicide Mortality', 'Suicide mortality rate', 'Suicide Data');
SELECT create_standard_percentage_form('3.5.1', 'Substance Abuse Treatment', 'Coverage of treatment interventions for substance use disorders', 'Treatment Coverage Data');
SELECT create_standard_percentage_form('3.5.2', 'Alcohol Consumption', 'Alcohol per capita consumption', 'Alcohol Data');
SELECT create_standard_percentage_form('3.6.1', 'Road Traffic Deaths', 'Death rate due to road traffic injuries', 'Road Safety Data');
SELECT create_standard_percentage_form('3.7.1', 'Family Planning', 'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods', 'Family Planning Data');
SELECT create_standard_percentage_form('3.7.2', 'Adolescent Birth Rate', 'Adolescent birth rate (aged 10-14 years; aged 15-19 years) per 1,000 women in that age group', 'Adolescent Birth Data');
SELECT create_standard_percentage_form('3.8.1', 'UHC Service Coverage', 'Coverage of essential health services', 'UHC Coverage Data');
SELECT create_standard_percentage_form('3.8.2', 'Health Expenditure', 'Proportion of population with large household expenditures on health as a share of total household expenditure or income', 'Health Expenditure Data');
SELECT create_standard_percentage_form('3.9.1', 'Air Pollution Deaths', 'Mortality rate attributed to household and ambient air pollution', 'Air Pollution Data');
SELECT create_standard_percentage_form('3.9.2', 'WASH Deaths', 'Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene', 'WASH Mortality Data');
SELECT create_standard_percentage_form('3.9.3', 'Poisoning Deaths', 'Mortality rate attributed to unintentional poisoning', 'Poisoning Data');
SELECT create_standard_percentage_form('3.a.1', 'Tobacco Use', 'Age-standardized prevalence of current tobacco use among persons aged 15 years and older', 'Tobacco Data');
SELECT create_standard_percentage_form('3.b.1', 'Vaccine Coverage', 'Proportion of the target population covered by all vaccines in the national programme', 'Vaccination Data');
SELECT create_standard_percentage_form('3.b.2', 'Health R&D ODA', 'Total net official development assistance to medical research and basic health sectors', 'Health R&D Data');
SELECT create_standard_percentage_form('3.b.3', 'Medicine Access', 'Proportion of health facilities that have a core set of relevant essential medicines available and affordable', 'Medicine Access Data');
SELECT create_standard_percentage_form('3.c.1', 'Health Worker Density', 'Health worker density and distribution', 'Health Workforce Data');
SELECT create_standard_percentage_form('3.d.1', 'IHR Capacity', 'International Health Regulations (IHR) capacity and health emergency preparedness', 'Health Security Data');
SELECT create_standard_percentage_form('3.d.2', 'Health Risk Communication', 'Percentage of bloodstream infections due to selected antimicrobial-resistant organisms', 'AMR Data');

-- Create forms for Goal 4 indicators (remaining) 
SELECT create_standard_percentage_form('4.2.2', 'Pre-primary Participation', 'Participation rate in organized learning (one year before the official primary entry age), by sex', 'Early Learning Data');
SELECT create_standard_percentage_form('4.3.1', 'Adult Learning', 'Participation rate of youth and adults in formal and non-formal education and training', 'Adult Education Data');
SELECT create_standard_percentage_form('4.4.1', 'ICT Skills', 'Proportion of youth and adults with information and communications technology (ICT) skills, by type of skill', 'ICT Skills Data');
SELECT create_standard_percentage_form('4.5.1', 'Education Parity', 'Parity indices (female/male, rural/urban, bottom/top wealth quintile) for all education indicators', 'Education Equity Data');
SELECT create_standard_percentage_form('4.6.1', 'Adult Literacy', 'Proportion of population in a given age group achieving at least a fixed level of proficiency in functional literacy and numeracy skills', 'Adult Literacy Data');
SELECT create_standard_percentage_form('4.7.1', 'Global Citizenship Education', 'Extent to which global citizenship education and education for sustainable development are mainstreamed', 'Global Education Data');
SELECT create_standard_percentage_form('4.a.1', 'School Infrastructure', 'Proportion of schools offering basic services', 'School Infrastructure Data');
SELECT create_standard_percentage_form('4.b.1', 'Education Scholarships', 'Volume of official development assistance flows for scholarships by sector and type of study', 'Scholarship Data');
SELECT create_standard_percentage_form('4.c.1', 'Qualified Teachers', 'Proportion of teachers with the minimum required qualifications, by education level', 'Teacher Qualification Data');

-- Create forms for Goal 5 indicators (remaining)
SELECT create_standard_percentage_form('5.1.1', 'Legal Discrimination', 'Whether or not legal frameworks are in place to promote, enforce and monitor equality and non‑discrimination on the basis of sex', 'Legal Framework Data');
SELECT create_standard_percentage_form('5.2.2', 'Sexual Violence', 'Proportion of women and girls aged 15 years and older subjected to sexual violence by persons other than an intimate partner', 'Sexual Violence Data');
SELECT create_standard_percentage_form('5.3.2', 'Female Genital Mutilation', 'Proportion of girls and women aged 15-49 years who have undergone female genital mutilation/cutting', 'FGM Data');
SELECT create_standard_percentage_form('5.4.1', 'Unpaid Care Work', 'Proportion of time spent on unpaid domestic and care work, by sex, age and location', 'Care Work Data');
SELECT create_standard_percentage_form('5.5.1', 'Political Participation', 'Proportion of seats held by women in (a) national parliaments and (b) local governments', 'Political Participation Data');
SELECT create_standard_percentage_form('5.5.2', 'Management Positions', 'Proportion of women in managerial positions', 'Management Data');
SELECT create_standard_percentage_form('5.6.1', 'Reproductive Health Decisions', 'Proportion of women aged 15-49 years who make their own informed decisions regarding sexual relations, contraceptive use and reproductive health care', 'Reproductive Health Data');
SELECT create_standard_percentage_form('5.6.2', 'Sexual Health Laws', 'Number of countries with laws and regulations that guarantee full and equal access to women and men aged 15 years and older to sexual and reproductive health care', 'Sexual Health Laws Data');
SELECT create_standard_percentage_form('5.a.1', 'Land Rights', 'Proportion of total agricultural population with ownership or secure rights over agricultural land, by sex', 'Land Rights Data');
SELECT create_standard_percentage_form('5.a.2', 'Legal Land Rights', 'Proportion of countries where the legal framework guarantees women equal rights to land ownership and/or control', 'Legal Land Rights Data');
SELECT create_standard_percentage_form('5.b.1', 'Mobile Phone Ownership', 'Proportion of individuals who own a mobile telephone, by sex', 'Mobile Access Data');
SELECT create_standard_percentage_form('5.c.1', 'Gender Budget', 'Proportion of countries with systems to track and make public allocations for gender equality and women empowerment', 'Gender Budget Data');

-- Clean up the helper function
DROP FUNCTION create_standard_percentage_form(TEXT, TEXT, TEXT, TEXT);