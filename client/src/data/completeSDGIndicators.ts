// Complete SDG Indicators with authentic UN structures
// Based on official UN SDG metadata and indicator repository

export interface IndicatorStructure {
  code: string;
  title: string;
  goal_id: number;
  target_code: string;
  tier: 'I' | 'II' | 'III';
  custodian_agencies: string[];
  type: 'percentage' | 'ratio' | 'count' | 'index' | 'binary' | 'multi_dimensional' | 'time_series' | 'geographic';
  measurement_unit: string;
  collection_frequency: string;
  data_sources: string[];
  disaggregation: {
    required: string[];
    optional: string[];
  };
  form_structure: {
    fields: FormField[];
    calculation?: CalculationRule;
    validation?: ValidationRule[];
  };
  methodology_url?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'percentage' | 'select' | 'multi_select' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  help_text?: string;
}

export interface CalculationRule {
  type: 'direct' | 'ratio' | 'percentage' | 'sum' | 'average' | 'weighted_average';
  formula?: string;
  numerator?: string;
  denominator?: string;
  multiplier?: number;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

// Complete SDG Indicators Database (Sample of major indicators with full structures)
export const COMPLETE_SDG_INDICATORS: IndicatorStructure[] = [
  // GOAL 1: NO POVERTY
  {
    code: "1.1.1",
    title: "Proportion of the population living below the international poverty line by sex, age, employment status and geographic location (urban/rural)",
    goal_id: 1,
    target_code: "1.1",
    tier: "I",
    custodian_agencies: ["World Bank"],
    type: "percentage",
    measurement_unit: "percentage",
    collection_frequency: "Annual",
    data_sources: ["Household surveys", "Living standards surveys", "Income and expenditure surveys"],
    disaggregation: {
      required: ["sex", "age", "geographic_location"],
      optional: ["employment_status", "disability", "migratory_status"]
    },
    form_structure: {
      fields: [
        { name: "sex", label: "Sex", type: "select", required: true, options: ["Male", "Female", "Total"] },
        { name: "age_group", label: "Age Group", type: "select", required: true, options: ["0-14", "15-24", "25-64", "65+", "Total"] },
        { name: "location", label: "Geographic Location", type: "select", required: true, options: ["Urban", "Rural", "Total"] },
        { name: "employment_status", label: "Employment Status", type: "select", required: false, options: ["Employed", "Unemployed", "Not in labour force"] },
        { name: "poverty_headcount", label: "Poverty Headcount (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } },
        { name: "population_total", label: "Total Population", type: "number", required: true },
        { name: "population_poor", label: "Population Below Poverty Line", type: "number", required: true }
      ],
      calculation: {
        type: "percentage",
        formula: "(population_poor / population_total) * 100"
      }
    }
  },
  {
    code: "1.2.1",
    title: "Proportion of population living below the national poverty line, by sex and age",
    goal_id: 1,
    target_code: "1.2",
    tier: "I",
    custodian_agencies: ["World Bank"],
    type: "percentage", 
    measurement_unit: "percentage",
    collection_frequency: "Annual",
    data_sources: ["National household surveys", "National poverty studies"],
    disaggregation: {
      required: ["sex", "age"],
      optional: ["geographic_location", "disability"]
    },
    form_structure: {
      fields: [
        { name: "sex", label: "Sex", type: "select", required: true, options: ["Male", "Female", "Total"] },
        { name: "age_group", label: "Age Group", type: "select", required: true, options: ["0-17", "18-64", "65+", "Total"] },
        { name: "location", label: "Geographic Location", type: "select", required: false, options: ["Urban", "Rural", "Total"] },
        { name: "national_poverty_rate", label: "National Poverty Rate (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } },
        { name: "total_population", label: "Total Population", type: "number", required: true },
        { name: "poor_population", label: "Population Below National Poverty Line", type: "number", required: true }
      ]
    }
  },
  {
    code: "1.2.2",
    title: "Proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions",
    goal_id: 1,
    target_code: "1.2",
    tier: "II",
    custodian_agencies: ["UNICEF", "World Bank", "UNDP"],
    type: "multi_dimensional",
    measurement_unit: "percentage",
    collection_frequency: "Every 3-5 years",
    data_sources: ["MICS", "DHS", "National multidimensional poverty studies"],
    disaggregation: {
      required: ["sex", "age", "geographic_location"],
      optional: ["disability", "ethnicity"]
    },
    form_structure: {
      fields: [
        { name: "sex", label: "Sex", type: "select", required: true, options: ["Male", "Female", "Total"] },
        { name: "age_group", label: "Age Group", type: "select", required: true, options: ["0-17", "18-64", "65+", "Total"] },
        { name: "location", label: "Geographic Location", type: "select", required: true, options: ["Urban", "Rural", "Total"] },
        { name: "health_deprivation", label: "Health Deprivation (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } },
        { name: "education_deprivation", label: "Education Deprivation (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } },
        { name: "living_standards_deprivation", label: "Living Standards Deprivation (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } },
        { name: "multidimensional_poverty_rate", label: "Multidimensional Poverty Rate (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } },
        { name: "intensity_of_deprivation", label: "Average Intensity of Deprivation (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } }
      ],
      calculation: {
        type: "weighted_average",
        formula: "MPI = H × A (Headcount × Average intensity of deprivation)"
      }
    }
  },

  // GOAL 3: GOOD HEALTH AND WELL-BEING
  {
    code: "3.1.1",
    title: "Maternal mortality ratio",
    goal_id: 3,
    target_code: "3.1",
    tier: "I",
    custodian_agencies: ["WHO"],
    type: "ratio",
    measurement_unit: "per 100,000 live births",
    collection_frequency: "Annual",
    data_sources: ["Civil registration", "Health facility data", "Household surveys", "Census"],
    disaggregation: {
      required: ["geographic_location"],
      optional: ["age", "education", "wealth_quintile"]
    },
    form_structure: {
      fields: [
        { name: "location", label: "Geographic Location", type: "select", required: true, options: ["National", "Urban", "Rural", "Provincial"] },
        { name: "maternal_deaths", label: "Number of Maternal Deaths", type: "number", required: true, validation: { min: 0 } },
        { name: "live_births", label: "Number of Live Births", type: "number", required: true, validation: { min: 1 } },
        { name: "age_group", label: "Age Group", type: "select", required: false, options: ["15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49"] },
        { name: "education_level", label: "Education Level", type: "select", required: false, options: ["No education", "Primary", "Secondary", "Higher"] },
        { name: "wealth_quintile", label: "Wealth Quintile", type: "select", required: false, options: ["Poorest", "Second", "Middle", "Fourth", "Richest"] }
      ],
      calculation: {
        type: "ratio",
        numerator: "maternal_deaths",
        denominator: "live_births",
        multiplier: 100000,
        formula: "(maternal_deaths / live_births) * 100,000"
      }
    }
  },
  {
    code: "3.1.2", 
    title: "Proportion of births attended by skilled health personnel",
    goal_id: 3,
    target_code: "3.1",
    tier: "I",
    custodian_agencies: ["WHO", "UNICEF"],
    type: "percentage",
    measurement_unit: "percentage",
    collection_frequency: "Every 3-5 years",
    data_sources: ["DHS", "MICS", "Other household surveys", "Health facility surveys"],
    disaggregation: {
      required: ["geographic_location"],
      optional: ["age", "education", "wealth_quintile", "ethnicity"]
    },
    form_structure: {
      fields: [
        { name: "location", label: "Geographic Location", type: "select", required: true, options: ["Urban", "Rural", "Total"] },
        { name: "age_group", label: "Mother's Age Group", type: "select", required: false, options: ["15-19", "20-34", "35-49"] },
        { name: "education", label: "Mother's Education", type: "select", required: false, options: ["No education", "Primary", "Secondary", "Higher"] },
        { name: "wealth_quintile", label: "Wealth Quintile", type: "select", required: false, options: ["Poorest", "Second", "Middle", "Fourth", "Richest"] },
        { name: "total_births", label: "Total Births", type: "number", required: true, validation: { min: 1 } },
        { name: "skilled_births", label: "Births Attended by Skilled Personnel", type: "number", required: true, validation: { min: 0 } },
        { name: "coverage_percentage", label: "Coverage (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } }
      ],
      calculation: {
        type: "percentage",
        formula: "(skilled_births / total_births) * 100"
      }
    }
  },

  // GOAL 4: QUALITY EDUCATION
  {
    code: "4.1.1",
    title: "Proportion of children and young people achieving at least a minimum proficiency level in reading and mathematics",
    goal_id: 4,
    target_code: "4.1",
    tier: "III",
    custodian_agencies: ["UNESCO Institute for Statistics"],
    type: "percentage",
    measurement_unit: "percentage",
    collection_frequency: "Every 3-6 years",
    data_sources: ["International assessments", "Regional assessments", "National assessments"],
    disaggregation: {
      required: ["sex", "grade_level", "subject"],
      optional: ["geographic_location", "socioeconomic_status", "language", "disability"]
    },
    form_structure: {
      fields: [
        { name: "subject", label: "Subject", type: "select", required: true, options: ["Reading", "Mathematics"] },
        { name: "grade_level", label: "Grade Level", type: "select", required: true, options: ["Grade 2/3", "Grade 4/6", "End of primary", "End of lower secondary"] },
        { name: "sex", label: "Sex", type: "select", required: true, options: ["Boys", "Girls", "Total"] },
        { name: "location", label: "Geographic Location", type: "select", required: false, options: ["Urban", "Rural", "Total"] },
        { name: "socioeconomic_status", label: "Socioeconomic Status", type: "select", required: false, options: ["Low", "Medium", "High"] },
        { name: "total_students", label: "Total Students Assessed", type: "number", required: true, validation: { min: 1 } },
        { name: "proficient_students", label: "Students Achieving Minimum Proficiency", type: "number", required: true, validation: { min: 0 } },
        { name: "proficiency_rate", label: "Proficiency Rate (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } }
      ],
      calculation: {
        type: "percentage",
        formula: "(proficient_students / total_students) * 100"
      }
    }
  },
  {
    code: "4.2.1",
    title: "Proportion of children aged 24-59 months who are developmentally on track in health, learning and psychosocial well-being",
    goal_id: 4,
    target_code: "4.2",
    tier: "III",
    custodian_agencies: ["UNICEF"],
    type: "percentage",
    measurement_unit: "percentage", 
    collection_frequency: "Every 3-5 years",
    data_sources: ["MICS", "Other household surveys with child development modules"],
    disaggregation: {
      required: ["sex", "age"],
      optional: ["geographic_location", "wealth_quintile", "mother_education"]
    },
    form_structure: {
      fields: [
        { name: "sex", label: "Sex", type: "select", required: true, options: ["Boys", "Girls", "Total"] },
        { name: "age_months", label: "Age in Months", type: "select", required: true, options: ["24-35", "36-47", "48-59", "24-59 total"] },
        { name: "location", label: "Geographic Location", type: "select", required: false, options: ["Urban", "Rural", "Total"] },
        { name: "wealth_quintile", label: "Wealth Quintile", type: "select", required: false, options: ["Poorest", "Second", "Middle", "Fourth", "Richest"] },
        { name: "mother_education", label: "Mother's Education", type: "select", required: false, options: ["No education", "Primary", "Secondary", "Higher"] },
        { name: "total_children", label: "Total Children Assessed", type: "number", required: true, validation: { min: 1 } },
        { name: "on_track_literacy", label: "On Track in Literacy", type: "number", required: true, validation: { min: 0 } },
        { name: "on_track_numeracy", label: "On Track in Numeracy", type: "number", required: true, validation: { min: 0 } },
        { name: "on_track_physical", label: "On Track in Physical Development", type: "number", required: true, validation: { min: 0 } },
        { name: "on_track_social", label: "On Track in Social-Emotional Development", type: "number", required: true, validation: { min: 0 } },
        { name: "on_track_overall", label: "Overall Developmentally On Track (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } }
      ]
    }
  },

  // GOAL 5: GENDER EQUALITY
  {
    code: "5.2.1",
    title: "Proportion of ever-partnered women and girls aged 15 years and older subjected to physical, sexual or psychological violence by a current or former intimate partner in the previous 12 months",
    goal_id: 5,
    target_code: "5.2",
    tier: "II",
    custodian_agencies: ["UNICEF", "UN Women", "UNFPA", "WHO", "UNODC"],
    type: "percentage",
    measurement_unit: "percentage",
    collection_frequency: "Every 3-5 years",
    data_sources: ["Specialized violence against women surveys", "DHS", "MICS", "Other household surveys"],
    disaggregation: {
      required: ["age", "type_of_violence"],
      optional: ["education", "geographic_location", "wealth_quintile", "ethnicity", "disability"]
    },
    form_structure: {
      fields: [
        { name: "age_group", label: "Age Group", type: "select", required: true, options: ["15-19", "20-24", "25-34", "35-49", "50+", "15+ total"] },
        { name: "violence_type", label: "Type of Violence", type: "select", required: true, options: ["Physical", "Sexual", "Psychological", "Any type"] },
        { name: "location", label: "Geographic Location", type: "select", required: false, options: ["Urban", "Rural", "Total"] },
        { name: "education", label: "Education Level", type: "select", required: false, options: ["No education", "Primary", "Secondary", "Higher"] },
        { name: "wealth_quintile", label: "Wealth Quintile", type: "select", required: false, options: ["Poorest", "Second", "Middle", "Fourth", "Richest"] },
        { name: "total_women", label: "Total Ever-Partnered Women", type: "number", required: true, validation: { min: 1 } },
        { name: "women_experiencing_violence", label: "Women Experiencing Violence", type: "number", required: true, validation: { min: 0 } },
        { name: "prevalence_rate", label: "Prevalence Rate (%)", type: "percentage", required: true, validation: { min: 0, max: 100 } }
      ],
      calculation: {
        type: "percentage", 
        formula: "(women_experiencing_violence / total_women) * 100"
      }
    }
  }
];

// Standard fields that should be included in all indicator forms
export const STANDARD_FORM_FIELDS: FormField[] = [
  {
    name: "data_year",
    label: "Data Year",
    type: "number",
    required: true,
    validation: { min: 2000, max: 2030 },
    help_text: "Year when the data was collected"
  },
  {
    name: "data_source",
    label: "Data Source",
    type: "select",
    required: true,
    options: [
      "Administrative records",
      "Census", 
      "Civil registration",
      "DHS (Demographic and Health Survey)",
      "Health facility data",
      "Household survey",
      "Labour force survey",
      "MICS (Multiple Indicator Cluster Survey)",
      "National assessment",
      "PSLM (Pakistan Social and Living Standards Measurement)",
      "School census",
      "Other survey"
    ],
    help_text: "Source of the data being entered"
  },
  {
    name: "collection_period",
    label: "Data Collection Period",
    type: "text",
    required: false,
    help_text: "Specific period when data was collected (e.g., January-December 2023)"
  },
  {
    name: "geographic_coverage",
    label: "Geographic Coverage",
    type: "select",
    required: true,
    options: ["National", "Provincial", "District", "Urban only", "Rural only"],
    help_text: "Geographic scope of the data"
  },
  {
    name: "data_quality",
    label: "Data Quality Assessment",
    type: "select", 
    required: false,
    options: ["High", "Medium", "Low", "Not assessed"],
    help_text: "Assessment of data quality and reliability"
  },
  {
    name: "notes",
    label: "Additional Notes",
    type: "text",
    required: false,
    help_text: "Any additional information about the data or methodology"
  }
];

// Function to get all indicators by goal
export const getIndicatorsByGoal = (goalId: number): IndicatorStructure[] => {
  return COMPLETE_SDG_INDICATORS.filter(indicator => indicator.goal_id === goalId);
};

// Function to get indicators by target
export const getIndicatorsByTarget = (targetCode: string): IndicatorStructure[] => {
  return COMPLETE_SDG_INDICATORS.filter(indicator => indicator.target_code === targetCode);
};

// Function to get complete form structure with standard fields
export const getCompleteFormStructure = (indicatorCode: string): FormField[] => {
  const indicator = COMPLETE_SDG_INDICATORS.find(ind => ind.code === indicatorCode);
  if (!indicator) return STANDARD_FORM_FIELDS;
  
  return [...indicator.form_structure.fields, ...STANDARD_FORM_FIELDS];
};