// Authentic Goal 1 SDG Indicator Form Structures
// Based on official UN methodologies and data collection requirements

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'percentage' | 'currency' | 'date' | 'multiselect' | 'radio';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  description?: string;
  unit?: string;
}

export interface IndicatorFormStructure {
  indicator_code: string;
  form_sections: {
    title: string;
    description?: string;
    fields: FormField[];
  }[];
  calculation?: {
    formula: string;
    description: string;
  };
  data_quality_requirements: string[];
  minimum_sample_size?: number;
}

export const GOAL_1_INDICATOR_FORMS: IndicatorFormStructure[] = [
  // 1.1.1 - International Poverty Line
  {
    indicator_code: "1.1.1",
    form_sections: [
      {
        title: "Survey Identification",
        fields: [
          { name: 'survey_name', label: 'Survey Name', type: 'select', required: true, 
            options: ['HIES', 'LSMS', 'Living Standards Survey', 'Household Budget Survey', 'Other'] },
          { name: 'survey_year', label: 'Survey Year', type: 'number', required: true, 
            validation: { min: 2000, max: 2030 } },
          { name: 'data_collection_period', label: 'Data Collection Period', type: 'text', required: true,
            description: 'e.g., January 2023 - December 2023' },
          { name: 'sample_size', label: 'Sample Size (Households)', type: 'number', required: true },
          { name: 'response_rate', label: 'Response Rate (%)', type: 'percentage', required: true }
        ]
      },
      {
        title: "Poverty Line Calculation",
        fields: [
          { name: 'international_poverty_line_ppp', label: 'International Poverty Line (PPP $)', type: 'currency', 
            required: true, description: 'Current: $2.15 per day (2017 PPP)' },
          { name: 'national_currency_conversion', label: 'Conversion to Local Currency', type: 'currency', 
            required: true, unit: 'local currency per day' },
          { name: 'cpi_adjustment', label: 'CPI Adjustment Factor', type: 'number', required: true,
            description: 'To convert to survey period prices' }
        ]
      },
      {
        title: "Disaggregated Results",
        description: "Proportion of population below international poverty line",
        fields: [
          { name: 'total_population_below_line', label: 'Total Population (%)', type: 'percentage', required: true },
          { name: 'male_below_line', label: 'Male (%)', type: 'percentage', required: true },
          { name: 'female_below_line', label: 'Female (%)', type: 'percentage', required: true },
          { name: 'urban_below_line', label: 'Urban (%)', type: 'percentage', required: true },
          { name: 'rural_below_line', label: 'Rural (%)', type: 'percentage', required: true },
          { name: 'children_0_14_below_line', label: 'Children 0-14 (%)', type: 'percentage', required: true },
          { name: 'youth_15_24_below_line', label: 'Youth 15-24 (%)', type: 'percentage', required: false },
          { name: 'adults_25_64_below_line', label: 'Adults 25-64 (%)', type: 'percentage', required: false },
          { name: 'elderly_65_plus_below_line', label: 'Elderly 65+ (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Employment Status Breakdown",
        fields: [
          { name: 'employed_below_line', label: 'Employed (%)', type: 'percentage', required: true },
          { name: 'unemployed_below_line', label: 'Unemployed (%)', type: 'percentage', required: true },
          { name: 'inactive_below_line', label: 'Economically Inactive (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: {
      formula: "(Number of persons in households with per capita consumption < poverty line / Total population) × 100",
      description: "Consumption or income per capita compared to PPP-adjusted international poverty line"
    },
    data_quality_requirements: [
      "Nationally representative household survey",
      "Consumption data preferred over income",
      "Include consumption from own production",
      "PPP conversion using latest available rates",
      "CPI adjustment to survey period"
    ],
    minimum_sample_size: 5000
  },

  // 1.2.1 - National Poverty Line  
  {
    indicator_code: "1.2.1",
    form_sections: [
      {
        title: "National Poverty Line Definition",
        fields: [
          { name: 'national_poverty_line_rural', label: 'Rural Poverty Line', type: 'currency', required: true,
            unit: 'local currency per month' },
          { name: 'national_poverty_line_urban', label: 'Urban Poverty Line', type: 'currency', required: true,
            unit: 'local currency per month' },
          { name: 'poverty_line_methodology', label: 'Methodology Used', type: 'select', required: true,
            options: ['Cost of Basic Needs', 'Food Energy Intake', 'Relative Income', 'Other'] },
          { name: 'base_year', label: 'Base Year for Poverty Line', type: 'number', required: true },
          { name: 'food_component_share', label: 'Food Component Share (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Population Below National Poverty Line",
        fields: [
          { name: 'total_below_national_line', label: 'Total Population (%)', type: 'percentage', required: true },
          { name: 'male_below_national', label: 'Male (%)', type: 'percentage', required: true },
          { name: 'female_below_national', label: 'Female (%)', type: 'percentage', required: true },
          { name: 'children_below_national', label: 'Children 0-17 (%)', type: 'percentage', required: true },
          { name: 'adults_below_national', label: 'Adults 18+ (%)', type: 'percentage', required: true },
          { name: 'rural_below_national', label: 'Rural (%)', type: 'percentage', required: true },
          { name: 'urban_below_national', label: 'Urban (%)', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: {
      formula: "(Population with income/consumption < national poverty line / Total population) × 100",
      description: "Based on country-specific monetary poverty thresholds"
    },
    data_quality_requirements: [
      "Officially endorsed national poverty line",
      "Household income/expenditure survey data",
      "Urban/rural poverty line differentiation if applicable"
    ]
  },

  // 1.2.2 - Multidimensional Poverty
  {
    indicator_code: "1.2.2", 
    form_sections: [
      {
        title: "Multidimensional Poverty Framework",
        fields: [
          { name: 'dimensions_used', label: 'Dimensions Used', type: 'multiselect', required: true,
            options: ['Health', 'Education', 'Living Standards', 'Work', 'Social Protection', 'Empowerment'] },
          { name: 'number_of_indicators', label: 'Total Number of Indicators', type: 'number', required: true },
          { name: 'poverty_cutoff', label: 'Poverty Cut-off (% of weighted indicators)', type: 'percentage', required: true },
          { name: 'weighting_method', label: 'Weighting Method', type: 'select', required: true,
            options: ['Equal weights', 'Nested weights', 'Expert-determined', 'Participatory'] }
        ]
      },
      {
        title: "Health Dimension Indicators",
        fields: [
          { name: 'health_nutrition_deprived', label: 'Nutrition Deprived (%)', type: 'percentage', required: false },
          { name: 'health_child_mortality_deprived', label: 'Child Mortality Deprived (%)', type: 'percentage', required: false },
          { name: 'health_access_deprived', label: 'Health Access Deprived (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Education Dimension Indicators", 
        fields: [
          { name: 'education_years_schooling_deprived', label: 'Years of Schooling Deprived (%)', type: 'percentage', required: false },
          { name: 'education_school_attendance_deprived', label: 'School Attendance Deprived (%)', type: 'percentage', required: false },
          { name: 'education_literacy_deprived', label: 'Literacy Deprived (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Living Standards Dimension",
        fields: [
          { name: 'living_cooking_fuel_deprived', label: 'Cooking Fuel Deprived (%)', type: 'percentage', required: false },
          { name: 'living_sanitation_deprived', label: 'Sanitation Deprived (%)', type: 'percentage', required: false },
          { name: 'living_water_deprived', label: 'Drinking Water Deprived (%)', type: 'percentage', required: false },
          { name: 'living_electricity_deprived', label: 'Electricity Deprived (%)', type: 'percentage', required: false },
          { name: 'living_housing_deprived', label: 'Housing Deprived (%)', type: 'percentage', required: false },
          { name: 'living_assets_deprived', label: 'Assets Deprived (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Multidimensional Poverty Results",
        fields: [
          { name: 'mpi_headcount_total', label: 'MPI Headcount - Total (%)', type: 'percentage', required: true },
          { name: 'mpi_headcount_male', label: 'MPI Headcount - Male (%)', type: 'percentage', required: true },
          { name: 'mpi_headcount_female', label: 'MPI Headcount - Female (%)', type: 'percentage', required: true },
          { name: 'mpi_intensity', label: 'MPI Intensity (Average % of deprivations)', type: 'percentage', required: true },
          { name: 'mpi_index_value', label: 'MPI Index Value', type: 'number', required: true,
            validation: { min: 0, max: 1 } }
        ]
      }
    ],
    calculation: {
      formula: "MPI = Headcount Ratio × Intensity of Deprivation",
      description: "Based on nationally defined multidimensional poverty framework"
    },
    data_quality_requirements: [
      "Nationally representative household survey", 
      "Individual-level data on all indicators",
      "Clear definition of deprivation thresholds",
      "Transparent weighting system"
    ]
  },

  // 1.4.2 - Secure Tenure Rights to Land
  {
    indicator_code: "1.4.2",
    form_sections: [
      {
        title: "Survey Methodology",
        fields: [
          { name: 'survey_type', label: 'Survey Type', type: 'select', required: true,
            options: ['National Housing Survey', 'DHS with land module', 'MICS with land module', 'Dedicated land tenure survey'] },
          { name: 'adult_population_sampled', label: 'Adult Population Sampled', type: 'number', required: true },
          { name: 'landholding_adults', label: 'Adults with Land/Property Rights', type: 'number', required: true }
        ]
      },
      {
        title: "Sub-indicator 1.4.2(a): Legal Documentation",
        description: "Adults with legally recognized documentation of land rights",
        fields: [
          { name: 'documented_total', label: 'Total with Legal Documentation (%)', type: 'percentage', required: true },
          { name: 'documented_male', label: 'Male with Documentation (%)', type: 'percentage', required: true },
          { name: 'documented_female', label: 'Female with Documentation (%)', type: 'percentage', required: true },
          { name: 'documented_freehold', label: 'Freehold Tenure Documented (%)', type: 'percentage', required: false },
          { name: 'documented_leasehold', label: 'Leasehold Tenure Documented (%)', type: 'percentage', required: false },
          { name: 'documented_customary', label: 'Customary Tenure Documented (%)', type: 'percentage', required: false },
          { name: 'documented_collective', label: 'Collective Tenure Documented (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Sub-indicator 1.4.2(b): Perceived Security", 
        description: "Adults who perceive their land rights as secure",
        fields: [
          { name: 'perceived_secure_total', label: 'Total Perceiving Security (%)', type: 'percentage', required: true },
          { name: 'perceived_secure_male', label: 'Male Perceiving Security (%)', type: 'percentage', required: true },
          { name: 'perceived_secure_female', label: 'Female Perceiving Security (%)', type: 'percentage', required: true },
          { name: 'perceived_secure_freehold', label: 'Freehold Perceived Secure (%)', type: 'percentage', required: false },
          { name: 'perceived_secure_leasehold', label: 'Leasehold Perceived Secure (%)', type: 'percentage', required: false },
          { name: 'perceived_secure_customary', label: 'Customary Perceived Secure (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Vulnerability Analysis",
        fields: [
          { name: 'vulnerable_groups_documentation', label: 'Vulnerable Groups Documentation (%)', type: 'percentage', required: false,
            description: 'Indigenous, ethnic minorities, female-headed households' },
          { name: 'rural_urban_gap_documentation', label: 'Rural-Urban Documentation Gap (%)', type: 'percentage', required: false },
          { name: 'inheritance_rights_secure', label: 'Inheritance Rights Perceived Secure (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: {
      formula: "Two separate calculations: (a) % with legal docs, (b) % perceiving security",
      description: "Measured among adult population with land/property rights, disaggregated by sex and tenure type"
    },
    data_quality_requirements: [
      "Representative sample of adult population",
      "Clear definition of 'legally recognized documentation'",
      "Standardized perception security questions",
      "Gender-disaggregated data collection"
    ]
  },

  // 1.3.1 - Social Protection Coverage
  {
    indicator_code: "1.3.1",
    form_sections: [
      {
        title: "Social Protection System Definition",
        fields: [
          { name: 'social_protection_definition', label: 'National Definition Used', type: 'select', required: true,
            options: ['ILO R202 Definition', 'National Framework', 'Regional Standard', 'Other'] },
          { name: 'floors_included', label: 'Social Protection Floors Included', type: 'multiselect', required: true,
            options: ['Healthcare', 'Child Benefits', 'Maternity Benefits', 'Disability Benefits', 'Old-age Benefits', 'Unemployment Benefits', 'Employment Injury'] },
          { name: 'data_source', label: 'Primary Data Source', type: 'select', required: true,
            options: ['Administrative Records', 'Household Survey', 'Mixed Sources', 'Social Registry'] }
        ]
      },
      {
        title: "Population Coverage by Benefit Type",
        fields: [
          { name: 'children_coverage', label: 'Children Covered (%)', type: 'percentage', required: true },
          { name: 'mothers_newborns_coverage', label: 'Mothers with Newborns (%)', type: 'percentage', required: true },
          { name: 'persons_disabilities_coverage', label: 'Persons with Disabilities (%)', type: 'percentage', required: true },
          { name: 'unemployed_coverage', label: 'Unemployed Persons (%)', type: 'percentage', required: true },
          { name: 'older_persons_coverage', label: 'Older Persons (%)', type: 'percentage', required: true },
          { name: 'employment_injury_coverage', label: 'Employment Injury (%)', type: 'percentage', required: true },
          { name: 'poor_vulnerable_coverage', label: 'Poor and Vulnerable (%)', type: 'percentage', required: true }
        ]
      },
      {
        title: "Disaggregated Coverage",
        fields: [
          { name: 'male_coverage', label: 'Male Coverage (%)', type: 'percentage', required: true },
          { name: 'female_coverage', label: 'Female Coverage (%)', type: 'percentage', required: true },
          { name: 'rural_coverage', label: 'Rural Coverage (%)', type: 'percentage', required: true },
          { name: 'urban_coverage', label: 'Urban Coverage (%)', type: 'percentage', required: true },
          { name: 'total_population_coverage', label: 'Total Population (%)', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: {
      formula: "(Number of persons covered by social protection / Total population in each category) × 100",
      description: "Coverage rates calculated separately for different population groups and benefit types"
    },
    data_quality_requirements: [
      "Administrative data from social protection agencies",
      "Clear definition of 'covered' vs 'eligible'",
      "Avoid double counting across programs",
      "Annual or biannual data collection"
    ]
  },

  // 1.4.1 - Access to Basic Services
  {
    indicator_code: "1.4.1",
    form_sections: [
      {
        title: "Basic Services Definition",
        fields: [
          { name: 'services_included', label: 'Basic Services Included', type: 'multiselect', required: true,
            options: ['Drinking Water', 'Sanitation', 'Waste Management', 'Energy', 'Mobility/Transport', 'ICT'] },
          { name: 'survey_type', label: 'Survey Type', type: 'select', required: true,
            options: ['DHS', 'MICS', 'National Household Survey', 'Census', 'Living Standards Survey'] },
          { name: 'reference_period', label: 'Reference Period', type: 'text', required: true }
        ]
      },
      {
        title: "Water and Sanitation Access",
        fields: [
          { name: 'basic_water_access', label: 'Basic Drinking Water (%)', type: 'percentage', required: true,
            description: 'Improved source within 30 minutes round trip' },
          { name: 'basic_sanitation_access', label: 'Basic Sanitation (%)', type: 'percentage', required: true,
            description: 'Improved facility not shared with other households' },
          { name: 'handwashing_facility', label: 'Handwashing Facility (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Energy and Technology Access",
        fields: [
          { name: 'electricity_access', label: 'Electricity Access (%)', type: 'percentage', required: true },
          { name: 'clean_cooking_access', label: 'Clean Cooking Fuels (%)', type: 'percentage', required: true },
          { name: 'internet_access', label: 'Internet Access (%)', type: 'percentage', required: false },
          { name: 'mobile_phone_access', label: 'Mobile Phone Access (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Disaggregated Results",
        fields: [
          { name: 'total_basic_services', label: 'Total Population with Basic Services (%)', type: 'percentage', required: true },
          { name: 'male_basic_services', label: 'Male (%)', type: 'percentage', required: true },
          { name: 'female_basic_services', label: 'Female (%)', type: 'percentage', required: true },
          { name: 'rural_basic_services', label: 'Rural (%)', type: 'percentage', required: true },
          { name: 'urban_basic_services', label: 'Urban (%)', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: {
      formula: "(Households with access to ALL defined basic services / Total households) × 100",
      description: "Composite indicator requiring access to all included basic services"
    },
    data_quality_requirements: [
      "Nationally representative household survey",
      "Individual-level data for disaggregation",
      "Clear service accessibility thresholds",
      "Geographic coordinates for spatial analysis"
    ]
  },

  // 1.5.1 - Disaster-related Deaths and Affected Persons
  {
    indicator_code: "1.5.1",
    form_sections: [
      {
        title: "Disaster Event Classification",
        fields: [
          { name: 'disaster_types', label: 'Disaster Types Recorded', type: 'multiselect', required: true,
            options: ['Drought', 'Earthquake', 'Epidemic', 'Extreme Temperature', 'Flood', 'Storm', 'Wildfire', 'Landslide', 'Volcanic Activity'] },
          { name: 'reporting_period', label: 'Reporting Period', type: 'text', required: true,
            description: 'e.g., Calendar Year 2023' },
          { name: 'data_sources', label: 'Data Sources', type: 'multiselect', required: true,
            options: ['National Disaster Management Agency', 'Emergency Services', 'Health Ministry', 'Local Authorities', 'International Organizations'] }
        ]
      },
      {
        title: "Deaths and Missing Persons",
        fields: [
          { name: 'total_deaths', label: 'Total Deaths', type: 'number', required: true },
          { name: 'missing_persons', label: 'Missing Persons', type: 'number', required: true },
          { name: 'deaths_per_100k', label: 'Deaths per 100,000 Population', type: 'number', required: true,
            validation: { min: 0 } },
          { name: 'missing_per_100k', label: 'Missing per 100,000 Population', type: 'number', required: true,
            validation: { min: 0 } }
        ]
      },
      {
        title: "Directly Affected Persons",
        fields: [
          { name: 'directly_affected_total', label: 'Total Directly Affected', type: 'number', required: true },
          { name: 'affected_per_100k', label: 'Affected per 100,000 Population', type: 'number', required: true },
          { name: 'injured_persons', label: 'Injured Persons', type: 'number', required: false },
          { name: 'displaced_persons', label: 'Displaced Persons', type: 'number', required: false },
          { name: 'homeless_persons', label: 'Homeless Persons', type: 'number', required: false }
        ]
      },
      {
        title: "Disaggregation by Disaster Type",
        fields: [
          { name: 'hydrometeorological_deaths', label: 'Hydrometeorological Deaths', type: 'number', required: false },
          { name: 'geophysical_deaths', label: 'Geophysical Deaths', type: 'number', required: false },
          { name: 'biological_deaths', label: 'Biological Deaths', type: 'number', required: false }
        ]
      }
    ],
    calculation: {
      formula: "(Deaths + Missing + Directly Affected) / Total Population × 100,000",
      description: "Sendai Framework methodology for disaster impact measurement"
    },
    data_quality_requirements: [
      "Consistent disaster classification using Sendai Framework",
      "Verification of death and missing person counts",
      "Clear definition of 'directly affected'",
      "Annual reporting cycle"
    ]
  },

  // 1.a.2 - Government Spending on Essential Services
  {
    indicator_code: "1.a.2",
    form_sections: [
      {
        title: "Government Budget Classification",
        fields: [
          { name: 'budget_year', label: 'Budget/Fiscal Year', type: 'number', required: true,
            validation: { min: 2000, max: 2030 } },
          { name: 'budget_classification_system', label: 'Budget Classification System', type: 'select', required: true,
            options: ['COFOG', 'National Classification', 'GFS 2014', 'Other'] },
          { name: 'government_levels_included', label: 'Government Levels', type: 'multiselect', required: true,
            options: ['Central Government', 'Provincial/State', 'Local Government', 'Social Security Funds'] }
        ]
      },
      {
        title: "Education Spending",
        fields: [
          { name: 'education_total_spending', label: 'Total Education Spending', type: 'currency', required: true,
            unit: 'local currency (millions)' },
          { name: 'education_current_spending', label: 'Education Current Expenditure', type: 'currency', required: true },
          { name: 'education_capital_spending', label: 'Education Capital Expenditure', type: 'currency', required: true },
          { name: 'education_percent_total_budget', label: 'Education % of Total Budget', type: 'percentage', required: true }
        ]
      },
      {
        title: "Health Spending",
        fields: [
          { name: 'health_total_spending', label: 'Total Health Spending', type: 'currency', required: true,
            unit: 'local currency (millions)' },
          { name: 'health_current_spending', label: 'Health Current Expenditure', type: 'currency', required: true },
          { name: 'health_capital_spending', label: 'Health Capital Expenditure', type: 'currency', required: true },
          { name: 'health_percent_total_budget', label: 'Health % of Total Budget', type: 'percentage', required: true }
        ]
      },
      {
        title: "Social Protection Spending",
        fields: [
          { name: 'social_protection_total', label: 'Total Social Protection Spending', type: 'currency', required: true,
            unit: 'local currency (millions)' },
          { name: 'social_assistance_spending', label: 'Social Assistance', type: 'currency', required: true },
          { name: 'social_insurance_spending', label: 'Social Insurance', type: 'currency', required: true },
          { name: 'social_protection_percent_budget', label: 'Social Protection % of Total Budget', type: 'percentage', required: true }
        ]
      },
      {
        title: "Summary Calculations",
        fields: [
          { name: 'total_government_spending', label: 'Total Government Spending', type: 'currency', required: true },
          { name: 'essential_services_total', label: 'Essential Services Total', type: 'currency', required: true },
          { name: 'essential_services_percentage', label: 'Essential Services % of Total Budget', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: {
      formula: "(Education + Health + Social Protection) / Total Government Spending × 100",
      description: "Proportion of total government spending allocated to essential services"
    },
    data_quality_requirements: [
      "Audited government financial statements",
      "Consistent budget classification",
      "Include all levels of government",
      "Annual budget execution data"
    ]
  },

  // Additional remaining indicators with basic structures
  {
    indicator_code: "1.5.2",
    form_sections: [
      {
        title: "Economic Loss Assessment",
        fields: [
          { name: 'total_economic_loss', label: 'Total Direct Economic Loss', type: 'currency', required: true, unit: 'USD millions' },
          { name: 'gdp_current_year', label: 'GDP Current Year', type: 'currency', required: true, unit: 'USD millions' },
          { name: 'loss_percentage_gdp', label: 'Loss as % of GDP', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "Direct Economic Loss / GDP × 100", description: "Economic impact relative to national economy" },
    data_quality_requirements: ["Post-disaster damage assessments", "GDP data from national accounts"]
  },

  {
    indicator_code: "1.5.3",
    form_sections: [
      {
        title: "National DRR Strategy Status",
        fields: [
          { name: 'strategy_adopted', label: 'National DRR Strategy Adopted', type: 'radio', required: true, options: ['Yes', 'No'] },
          { name: 'sendai_alignment', label: 'Aligned with Sendai Framework', type: 'radio', required: true, options: ['Yes', 'No'] },
          { name: 'implementation_status', label: 'Implementation Status', type: 'select', required: true, 
            options: ['Not Started', 'In Progress', 'Substantially Implemented', 'Fully Implemented'] }
        ]
      }
    ],
    calculation: { formula: "Binary indicator: 1 if adopted and implemented, 0 otherwise", description: "National policy commitment" },
    data_quality_requirements: ["Official government documentation", "Sendai Framework alignment verification"]
  },

  {
    indicator_code: "1.5.4",
    form_sections: [
      {
        title: "Local DRR Strategies",
        fields: [
          { name: 'total_local_governments', label: 'Total Local Governments', type: 'number', required: true },
          { name: 'local_drr_strategies', label: 'Local Governments with DRR Strategies', type: 'number', required: true },
          { name: 'percentage_with_strategies', label: 'Percentage with DRR Strategies', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "(Local governments with DRR strategies / Total local governments) × 100", description: "Local implementation coverage" },
    data_quality_requirements: ["Survey of local government entities", "Strategy documentation verification"]
  },

  {
    indicator_code: "1.a.1",
    form_sections: [
      {
        title: "ODA for Poverty Reduction",
        fields: [
          { name: 'total_oda_poverty', label: 'Total ODA for Poverty Reduction', type: 'currency', required: true, unit: 'USD millions' },
          { name: 'gross_national_income', label: 'Gross National Income', type: 'currency', required: true, unit: 'USD millions' },
          { name: 'oda_percentage_gni', label: 'ODA as % of GNI', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "ODA for poverty reduction / GNI × 100", description: "Development assistance focus on poverty" },
    data_quality_requirements: ["OECD-DAC reporting standards", "Purpose code classification"]
  },

  {
    indicator_code: "1.b.1",
    form_sections: [
      {
        title: "Pro-poor Public Spending",
        fields: [
          { name: 'pro_poor_spending_total', label: 'Total Pro-poor Public Spending', type: 'currency', required: true, unit: 'local currency millions' },
          { name: 'total_public_spending', label: 'Total Public Spending', type: 'currency', required: true, unit: 'local currency millions' },
          { name: 'pro_poor_percentage', label: 'Pro-poor as % of Total', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "Pro-poor public spending / Total public spending × 100", description: "Budget allocation favoring the poor" },
    data_quality_requirements: ["Benefit incidence analysis", "Poverty-focused program identification"]
  }
];

// Helper function to get form structure by indicator code
export const getIndicatorFormStructure = (indicatorCode: string): IndicatorFormStructure | undefined => {
  return GOAL_1_INDICATOR_FORMS.find(form => form.indicator_code === indicatorCode);
};

// Helper function to get all Goal 1 indicator codes
export const getGoal1IndicatorCodes = (): string[] => {
  return GOAL_1_INDICATOR_FORMS.map(form => form.indicator_code);
};