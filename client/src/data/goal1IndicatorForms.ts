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

  // Additional indicators would continue with similar detailed structures...
  // 1.3.1, 1.4.1, 1.5.1, 1.5.2, 1.5.3, 1.5.4, 1.a.1, 1.a.2, 1.b.1
];

// Helper function to get form structure by indicator code
export const getIndicatorFormStructure = (indicatorCode: string): IndicatorFormStructure | undefined => {
  return GOAL_1_INDICATOR_FORMS.find(form => form.indicator_code === indicatorCode);
};

// Helper function to get all Goal 1 indicator codes
export const getGoal1IndicatorCodes = (): string[] => {
  return GOAL_1_INDICATOR_FORMS.map(form => form.indicator_code);
};