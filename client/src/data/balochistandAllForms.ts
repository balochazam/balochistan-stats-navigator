// Balochistan-specific SDG Indicator Forms based on actual data document
// Only includes indicators that have data in the provided document

export interface BalochistanFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'radio' | 'percentage';
  required: boolean;
  options?: string[];
  description?: string;
  unit?: string;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

export interface BalochistanFormSection {
  title: string;
  description?: string;
  fields: BalochistanFormField[];
}

export interface BalochistanIndicatorForm {
  indicator_code: string;
  form_sections: BalochistanFormSection[];
  calculation: {
    formula: string;
    description: string;
  };
  data_quality_requirements: string[];
  minimum_sample_size?: number;
}

export const balochistandAllForms: BalochistanIndicatorForm[] = [
  // 1.2.2 - Multidimensional Poverty
  {
    indicator_code: "1.2.2",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (2014-15)', 'Progress (2019-20)', 'Latest Value (In Process)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['MPI Report 2014-15', 'MICS 2019-20', 'Federal MPI Computation'] }
        ]
      },
      {
        title: "Multidimensional Poverty Index Results",
        fields: [
          { name: 'overall_mpi', label: 'Overall MPI (%)', type: 'percentage', required: true },
          { name: 'urban_mpi', label: 'Urban MPI (%)', type: 'percentage', required: true },
          { name: 'rural_mpi', label: 'Rural MPI (%)', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "Direct survey percentages", description: "MPI from survey data" },
    data_quality_requirements: ["Use MPI Report 2014-15 for baseline", "Use MICS 2019-20 for progress"]
  },

  // 1.3.1 - Social Protection Coverage
  {
    indicator_code: "1.3.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (Not Available)', 'Progress (PDHS 2017-18)', 'Latest Value (MICS 2019-20)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PDHS 2017-18', 'MICS 2019-20', 'Not Available'] }
        ]
      },
      {
        title: "Social Protection Coverage",
        fields: [
          { name: 'bisp_coverage', label: 'BISP Coverage for Ever-married Women (15-49) (%)', type: 'percentage', required: false },
          { name: 'social_transfers', label: 'Household Social Transfers (last 3 months) (%)', type: 'percentage', required: false },
          { name: 'data_availability', label: 'Data Availability', type: 'select', required: true,
            options: ['Data Available', 'Not Available'] }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Coverage from PDHS and MICS" },
    data_quality_requirements: ["PDHS 2017-18 for BISP", "MICS 2019-20 for social transfers"]
  },

  // 1.4.1 - Access to Basic Services
  {
    indicator_code: "1.4.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (PSLM 2014-15)', 'Progress (PSLM 2018-19)', 'Latest Value (MICS 2019-20)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PSLM 2014-15', 'PSLM 2018-19', 'MICS 2019-20'] }
        ]
      },
      {
        title: "Water and Sanitation Services",
        fields: [
          { name: 'improved_water_source', label: 'Improved Water Source (%)', type: 'percentage', required: false },
          { name: 'flush_toilet_overall', label: 'Flush Toilet - Overall (%)', type: 'percentage', required: false },
          { name: 'flush_toilet_urban', label: 'Flush Toilet - Urban (%)', type: 'percentage', required: false },
          { name: 'flush_toilet_rural', label: 'Flush Toilet - Rural (%)', type: 'percentage', required: false },
          { name: 'basic_drinking_water', label: 'Basic Drinking Water Services (%)', type: 'percentage', required: false },
          { name: 'basic_sanitation', label: 'Basic Sanitation Services (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Energy Services",
        fields: [
          { name: 'electricity_overall', label: 'Electricity - Overall (%)', type: 'percentage', required: false },
          { name: 'electricity_urban', label: 'Electricity - Urban (%)', type: 'percentage', required: false },
          { name: 'electricity_rural', label: 'Electricity - Rural (%)', type: 'percentage', required: false },
          { name: 'gas_cooking_overall', label: 'Gas Cooking - Overall (%)', type: 'percentage', required: false },
          { name: 'gas_cooking_urban', label: 'Gas Cooking - Urban (%)', type: 'percentage', required: false },
          { name: 'gas_cooking_rural', label: 'Gas Cooking - Rural (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: { formula: "Service access percentages", description: "PSLM and MICS survey data" },
    data_quality_requirements: ["PSLM for baseline and progress", "MICS for latest values"]
  },

  // 1.5.1 - Disaster Impact
  {
    indicator_code: "1.5.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (NDMA 2015)', 'Progress (NDMA 2018)', 'Latest Value (NDMA 2021)'] },
          { name: 'data_source', label: 'Data Source', type: 'select', required: true,
            options: ['NDMA Annual Report 2015', 'NDMA Annual Report 2018', 'NDMA Annual Report 2021'] }
        ]
      },
      {
        title: "Disaster Impact per 100,000 Population",
        fields: [
          { name: 'deaths_per_100k', label: 'Deaths per 100,000', type: 'number', required: true, validation: { step: 0.01 } },
          { name: 'injured_per_100k', label: 'Injured per 100,000', type: 'number', required: true, validation: { step: 0.01 } },
          { name: 'affected_per_100k', label: 'Directly Affected per 100,000', type: 'number', required: true, validation: { step: 0.01 } }
        ]
      }
    ],
    calculation: { formula: "Per 100,000 population rates", description: "NDMA disaster impact data" },
    data_quality_requirements: ["Use NDMA Annual Reports", "Calculate per 100,000 population"]
  },

  // 1.a.2 - Government Spending
  {
    indicator_code: "1.a.2",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (2014-15)', 'Progress (2018-19)', 'Latest Value (2022-23)'] },
          { name: 'data_source', label: 'Data Source', type: 'select', required: true,
            options: ['Budget Statements 2014-15', 'Budget Statements 2018-19', 'Revised Budget 2022-23'] }
        ]
      },
      {
        title: "Essential Services Spending (%)",
        fields: [
          { name: 'total_spending', label: 'Total Essential Services (%)', type: 'percentage', required: true },
          { name: 'education_spending', label: 'Education (%)', type: 'percentage', required: true },
          { name: 'health_spending', label: 'Health (%)', type: 'percentage', required: true },
          { name: 'social_protection_spending', label: 'Social Protection (%)', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "Budget percentages", description: "Government budget allocations" },
    data_quality_requirements: ["Use official budget statements", "Calculate as % of total budget"]
  },

  // 2.2.1 - Stunting
  {
    indicator_code: "2.2.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (NNS 2011)', 'Progress (PDHS 2017-18)', 'Latest Value (MICS 2019-20)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['NNS 2011', 'PDHS 2017-18', 'MICS 2019-20'] }
        ]
      },
      {
        title: "Stunting Prevalence",
        fields: [
          { name: 'overall_stunting', label: 'Overall Stunting (%)', type: 'percentage', required: false },
          { name: 'moderate_severe_stunting', label: 'Moderate and Severe Stunting (%)', type: 'percentage', required: false },
          { name: 'severe_stunting', label: 'Severe Stunting (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Child stunting from nutrition surveys" },
    data_quality_requirements: ["Use NNS, PDHS, MICS data", "Children under 5 years"]
  },

  // 2.2.2 - Malnutrition
  {
    indicator_code: "2.2.2",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (NNS 2011)', 'Progress (PDHS 2017-18)', 'Latest Value (MICS 2019-20)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['NNS 2011', 'PDHS 2017-18', 'MICS 2019-20'] }
        ]
      },
      {
        title: "Malnutrition Types",
        fields: [
          { name: 'wasting', label: 'Wasting (%)', type: 'percentage', required: false },
          { name: 'moderate_severe_wasting', label: 'Moderate and Severe Wasting (%)', type: 'percentage', required: false },
          { name: 'severe_wasting', label: 'Severe Wasting (%)', type: 'percentage', required: false },
          { name: 'overweight', label: 'Overweight (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Child malnutrition from nutrition surveys" },
    data_quality_requirements: ["Use NNS, PDHS, MICS data", "Children under 5 years"]
  },

  // 3.1.1 - Maternal Mortality
  {
    indicator_code: "3.1.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (PDHS 2006-07)', 'Progress (MMR Survey 2019)', 'Latest Value (Not Available)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PDHS 2006-07', 'Pakistan MMR Survey 2019', 'Not Available'] }
        ]
      },
      {
        title: "Maternal Mortality Ratio",
        fields: [
          { name: 'mmr', label: 'Maternal Mortality Ratio (per 100,000 live births)', type: 'number', required: false },
          { name: 'data_availability', label: 'Data Availability', type: 'select', required: true,
            options: ['Data Available', 'Not Available'] }
        ]
      }
    ],
    calculation: { formula: "Deaths per 100,000 live births", description: "Maternal mortality from surveys" },
    data_quality_requirements: ["Use PDHS and MMR survey data", "Per 100,000 live births"]
  },

  // 3.2.1 - Under-5 Mortality
  {
    indicator_code: "3.2.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (PDHS 2012-13)', 'Progress (PSLM 2018-19)', 'Latest Value (MICS 2019-20)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PDHS 2012-13', 'PSLM 2018-19', 'MICS 2019-20'] }
        ]
      },
      {
        title: "Under-5 Mortality Rate",
        fields: [
          { name: 'overall_u5mr', label: 'Overall Under-5 Mortality Rate (per 1,000 live births)', type: 'number', required: true },
          { name: 'urban_u5mr', label: 'Urban Under-5 Mortality Rate', type: 'number', required: false },
          { name: 'rural_u5mr', label: 'Rural Under-5 Mortality Rate', type: 'number', required: false }
        ]
      }
    ],
    calculation: { formula: "Deaths per 1,000 live births", description: "Child mortality from surveys" },
    data_quality_requirements: ["Use PDHS, PSLM, MICS data", "Per 1,000 live births"]
  },

  // 4.6.1 - Literacy
  {
    indicator_code: "4.6.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (PSLM 2013-14)', 'Progress (PSLM 2019-20)', 'Latest Value (LFS 2020-21)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PSLM 2013-14', 'PSLM 2019-20', 'LFS 2020-21'] }
        ]
      },
      {
        title: "Literacy Rate",
        fields: [
          { name: 'literacy_rate', label: 'Literacy Rate (%)', type: 'percentage', required: true },
          { name: 'age_group', label: 'Age Group', type: 'text', required: false,
            description: 'Specify age group (e.g., 10 years and above)' }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Literacy from PSLM and LFS" },
    data_quality_requirements: ["Use PSLM and LFS data", "Consistent age group definition"]
  },

  // 8.5.2 - Unemployment
  {
    indicator_code: "8.5.2",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (LFS 2014-15)', 'Progress (LFS 2018-19)', 'Latest Value (LFS 2020-21)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['LFS 2014-15', 'LFS 2018-19', 'LFS 2020-21'] }
        ]
      },
      {
        title: "Unemployment Rate by Sex",
        fields: [
          { name: 'overall_unemployment', label: 'Overall Unemployment Rate (%)', type: 'percentage', required: true },
          { name: 'male_unemployment', label: 'Male Unemployment Rate (%)', type: 'percentage', required: true },
          { name: 'female_unemployment', label: 'Female Unemployment Rate (%)', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Unemployment from Labour Force Survey" },
    data_quality_requirements: ["Use LFS data", "Sex-disaggregated data"]
  },

  // 8.6.1 - Youth NEET
  {
    indicator_code: "8.6.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (LFS 2014-15)', 'Progress (LFS 2018-19)', 'Latest Value (LFS 2020-21)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['LFS 2014-15', 'LFS 2018-19', 'LFS 2020-21'] }
        ]
      },
      {
        title: "Youth NEET Rate",
        fields: [
          { name: 'overall_neet', label: 'Overall Youth NEET Rate (%)', type: 'percentage', required: true },
          { name: 'urban_neet', label: 'Urban Youth NEET Rate (%)', type: 'percentage', required: false },
          { name: 'rural_neet', label: 'Rural Youth NEET Rate (%)', type: 'percentage', required: false },
          { name: 'male_neet_overall', label: 'Male NEET Rate - Overall (%)', type: 'percentage', required: false },
          { name: 'male_neet_urban', label: 'Male NEET Rate - Urban (%)', type: 'percentage', required: false },
          { name: 'male_neet_rural', label: 'Male NEET Rate - Rural (%)', type: 'percentage', required: false },
          { name: 'female_neet_overall', label: 'Female NEET Rate - Overall (%)', type: 'percentage', required: false },
          { name: 'female_neet_urban', label: 'Female NEET Rate - Urban (%)', type: 'percentage', required: false },
          { name: 'female_neet_rural', label: 'Female NEET Rate - Rural (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Youth NEET from Labour Force Survey" },
    data_quality_requirements: ["Use LFS data", "Youth aged 15-24 years", "Sex and location disaggregation"]
  },

  // 15.1.1 - Forest Area
  {
    indicator_code: "15.1.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (Dev Stats 2014-15)', 'Progress (Dev Stats 2018-19)', 'Latest Value (Agri Stats 2021-22)'] },
          { name: 'data_source', label: 'Data Source', type: 'select', required: true,
            options: ['Balochistan Development Statistics 2014-15', 'Balochistan Development Statistics 2018-19', 'Balochistan Agriculture Statistics 2021-22'] }
        ]
      },
      {
        title: "Forest Area Proportion",
        fields: [
          { name: 'forest_area_percentage', label: 'Forest Area as % of Total Land Area', type: 'percentage', required: true }
        ]
      }
    ],
    calculation: { formula: "Forest area / Total land area × 100", description: "Forest coverage from official statistics" },
    data_quality_requirements: ["Use official Balochistan statistics", "Consistent measurement methodology"]
  },

  // 16.9.1 - Birth Registration
  {
    indicator_code: "16.9.1",
    form_sections: [
      {
        title: "Data Source and Period",
        fields: [
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline (PDHS 2012-13)', 'Progress (PDHS 2017-18)', 'Latest Value (MICS 2019-20)'] },
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PDHS 2012-13', 'PDHS 2017-18', 'MICS 2019-20'] }
        ]
      },
      {
        title: "Birth Registration Rate",
        fields: [
          { name: 'overall_registration', label: 'Overall Birth Registration Rate (%)', type: 'percentage', required: true },
          { name: 'urban_registration', label: 'Urban Birth Registration Rate (%)', type: 'percentage', required: false },
          { name: 'rural_registration', label: 'Rural Birth Registration Rate (%)', type: 'percentage', required: false }
        ]
      }
    ],
    calculation: { formula: "Survey percentages", description: "Birth registration from PDHS and MICS" },
    data_quality_requirements: ["Use PDHS and MICS data", "Children under 5 years", "Civil authority registration"]
  }
];

// Function to get Balochistan-specific form structure
export const getBalochistandFormStructure = (indicatorCode: string): BalochistanIndicatorForm | null => {
  return balochistandAllForms.find(form => form.indicator_code === indicatorCode) || null;
};

// Function to check if indicator has a Balochistan form
export const hasBalochistanForm = (indicatorCode: string): boolean => {
  return balochistandAllForms.some(form => form.indicator_code === indicatorCode);
};