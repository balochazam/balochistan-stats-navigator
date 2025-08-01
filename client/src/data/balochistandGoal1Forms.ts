// Balochistan-specific Goal 1 SDG Indicator Forms
// Based on actual Balochistan data structure and survey sources

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

export const balochistandGoal1Forms: BalochistanIndicatorForm[] = [
  // 1.2.2 - Multidimensional Poverty (Balochistan Format)
  {
    indicator_code: "1.2.2",
    form_sections: [
      {
        title: "Data Source and Survey Information",
        fields: [
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['MPI Report', 'MICS', 'PDHS', 'PSLM', 'Other'] },
          { name: 'survey_year', label: 'Survey Year', type: 'select', required: true,
            options: ['2014-15', '2017-18', '2018-19', '2019-20', '2020-21', '2021-22', '2022-23'] },
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline', 'Progress', 'Latest Value'] }
        ]
      },
      {
        title: "Multidimensional Poverty Index (MPI) Results",
        fields: [
          { name: 'overall_mpi', label: 'Overall MPI (%)', type: 'percentage', required: true,
            description: 'Overall percentage living in multidimensional poverty' },
          { name: 'urban_mpi', label: 'Urban MPI (%)', type: 'percentage', required: true,
            description: 'Urban areas multidimensional poverty rate' },
          { name: 'rural_mpi', label: 'Rural MPI (%)', type: 'percentage', required: true,
            description: 'Rural areas multidimensional poverty rate' }
        ]
      },
      {
        title: "Additional Disaggregation (if available)",
        fields: [
          { name: 'male_mpi', label: 'Male MPI (%)', type: 'percentage', required: false },
          { name: 'female_mpi', label: 'Female MPI (%)', type: 'percentage', required: false },
          { name: 'district_level_data', label: 'District-level Data Available', type: 'radio', required: false,
            options: ['Yes', 'No'] }
        ]
      },
      {
        title: "Data Quality and Notes",
        fields: [
          { name: 'sample_size', label: 'Sample Size', type: 'number', required: false },
          { name: 'methodology_notes', label: 'Methodology Notes', type: 'textarea', required: false,
            description: 'Any specific methodology or calculation notes' },
          { name: 'data_limitations', label: 'Data Limitations', type: 'textarea', required: false }
        ]
      }
    ],
    calculation: {
      formula: "Direct survey results - no calculation required",
      description: "MPI percentages directly from Balochistan survey data"
    },
    data_quality_requirements: [
      "Use authentic survey data from MICS, PDHS, PSLM, or MPI reports",
      "Ensure urban/rural breakdown is available",
      "Document survey methodology and sample size",
      "Note any changes in methodology between survey rounds"
    ]
  },

  // 1.3.1 - Social Protection Coverage (Balochistan Format)
  {
    indicator_code: "1.3.1",
    form_sections: [
      {
        title: "Data Source and Survey Information",
        fields: [
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PDHS', 'MICS', 'BISP Records', 'Other Social Protection Survey'] },
          { name: 'survey_year', label: 'Survey Year', type: 'select', required: true,
            options: ['2017-18', '2019-20', '2020-21', '2021-22', '2022-23'] },
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline', 'Progress', 'Latest Value'] }
        ]
      },
      {
        title: "Social Protection Coverage Results",
        fields: [
          { name: 'bisp_coverage', label: 'BISP Coverage for Ever-married Women (15-49) (%)', type: 'percentage', required: false,
            description: 'Percentage receiving BISP benefits (PDHS data)' },
          { name: 'social_transfers_coverage', label: 'Household Social Transfers Coverage (%)', type: 'percentage', required: false,
            description: 'Households receiving social transfers in last 3 months (MICS data)' },
          { name: 'overall_coverage', label: 'Overall Social Protection Coverage (%)', type: 'percentage', required: true,
            description: 'General population covered by social protection systems' }
        ]
      },
      {
        title: "Geographic and Demographic Breakdown",
        fields: [
          { name: 'urban_coverage', label: 'Urban Coverage (%)', type: 'percentage', required: false },
          { name: 'rural_coverage', label: 'Rural Coverage (%)', type: 'percentage', required: false },
          { name: 'male_coverage', label: 'Male Coverage (%)', type: 'percentage', required: false },
          { name: 'female_coverage', label: 'Female Coverage (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Program Details and Notes",
        fields: [
          { name: 'programs_included', label: 'Social Protection Programs Included', type: 'multiselect', required: false,
            options: ['BISP', 'Zakat', 'Pakistan Bait-ul-Mal', 'Employee Social Security', 'Workers Welfare Fund', 'Other'] },
          { name: 'data_availability', label: 'Data Availability Status', type: 'select', required: true,
            options: ['Data Available', 'Not Available', 'Partially Available', 'Under Collection'] },
          { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
        ]
      }
    ],
    calculation: {
      formula: "Direct survey percentages - no calculation required",
      description: "Social protection coverage from Balochistan survey data"
    },
    data_quality_requirements: [
      "Use PDHS data for BISP coverage among women",
      "Use MICS data for household social transfers",
      "Document specific programs included in coverage",
      "Note baseline availability issues"
    ]
  },

  // 1.4.1 - Access to Basic Services (Balochistan Format)
  {
    indicator_code: "1.4.1",
    form_sections: [
      {
        title: "Data Source and Survey Information",
        fields: [
          { name: 'survey_source', label: 'Survey Source', type: 'select', required: true,
            options: ['PSLM', 'MICS', 'Census', 'Other Household Survey'] },
          { name: 'survey_year', label: 'Survey Year', type: 'select', required: true,
            options: ['2014-15', '2018-19', '2019-20', '2020-21', '2021-22'] },
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline', 'Progress', 'Latest Value'] }
        ]
      },
      {
        title: "Water and Sanitation Services",
        fields: [
          { name: 'improved_water_source', label: 'Improved Water Source (%)', type: 'percentage', required: true,
            description: 'Access to improved drinking water source' },
          { name: 'flush_toilet_overall', label: 'Flush Toilet Access - Overall (%)', type: 'percentage', required: true },
          { name: 'flush_toilet_urban', label: 'Flush Toilet Access - Urban (%)', type: 'percentage', required: false },
          { name: 'flush_toilet_rural', label: 'Flush Toilet Access - Rural (%)', type: 'percentage', required: false },
          { name: 'basic_drinking_water', label: 'Basic Drinking Water Services (%)', type: 'percentage', required: false,
            description: 'MICS definition of basic drinking water' },
          { name: 'basic_sanitation', label: 'Basic Sanitation Services (%)', type: 'percentage', required: false,
            description: 'MICS definition of basic sanitation' }
        ]
      },
      {
        title: "Energy Services",
        fields: [
          { name: 'electricity_overall', label: 'Electricity Access - Overall (%)', type: 'percentage', required: true },
          { name: 'electricity_urban', label: 'Electricity Access - Urban (%)', type: 'percentage', required: false },
          { name: 'electricity_rural', label: 'Electricity Access - Rural (%)', type: 'percentage', required: false },
          { name: 'gas_cooking_overall', label: 'Gas for Cooking - Overall (%)', type: 'percentage', required: true },
          { name: 'gas_cooking_urban', label: 'Gas for Cooking - Urban (%)', type: 'percentage', required: false },
          { name: 'gas_cooking_rural', label: 'Gas for Cooking - Rural (%)', type: 'percentage', required: false }
        ]
      },
      {
        title: "Composite Access Indicator",
        fields: [
          { name: 'basic_services_composite', label: 'Overall Basic Services Access (%)', type: 'percentage', required: false,
            description: 'Composite indicator if calculated' },
          { name: 'methodology_notes', label: 'Methodology Notes', type: 'textarea', required: false,
            description: 'How composite indicator was calculated or services were combined' }
        ]
      }
    ],
    calculation: {
      formula: "Individual service percentages from household surveys",
      description: "Access rates for water, sanitation, electricity, and gas services"
    },
    data_quality_requirements: [
      "Use PSLM data for baseline and progress measurements",
      "Use MICS data for latest values with WHO/UNICEF definitions",
      "Ensure urban/rural breakdown for all services",
      "Document any methodology changes between surveys"
    ]
  },

  // 1.5.1 - Disaster Impact (Balochistan Format)
  {
    indicator_code: "1.5.1",
    form_sections: [
      {
        title: "Data Source and Reporting Period",
        fields: [
          { name: 'data_source', label: 'Data Source', type: 'select', required: true,
            options: ['NDMA Annual Report', 'PDMA Balochistan', 'Emergency Response Reports', 'Other'] },
          { name: 'reporting_year', label: 'Reporting Year', type: 'select', required: true,
            options: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'] },
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline', 'Progress', 'Latest Value'] }
        ]
      },
      {
        title: "Disaster Impact per 100,000 Population",
        fields: [
          { name: 'deaths_per_100k', label: 'Deaths per 100,000 Population', type: 'number', required: true,
            validation: { min: 0, step: 0.01 },
            description: 'Deaths attributed to disasters per 100,000 population' },
          { name: 'injured_per_100k', label: 'Injured per 100,000 Population', type: 'number', required: true,
            validation: { min: 0, step: 0.01 },
            description: 'Injured persons per 100,000 population' },
          { name: 'directly_affected_per_100k', label: 'Directly Affected per 100,000 Population', type: 'number', required: true,
            validation: { min: 0, step: 0.01 },
            description: 'Directly affected persons per 100,000 population' }
        ]
      },
      {
        title: "Absolute Numbers (for reference)",
        fields: [
          { name: 'total_deaths', label: 'Total Deaths', type: 'number', required: false },
          { name: 'total_injured', label: 'Total Injured', type: 'number', required: false },
          { name: 'total_affected', label: 'Total Directly Affected', type: 'number', required: false },
          { name: 'population_reference', label: 'Reference Population', type: 'number', required: false,
            description: 'Total population used for per 100,000 calculation' }
        ]
      },
      {
        title: "Disaster Details and Notes",
        fields: [
          { name: 'major_disasters', label: 'Major Disasters Reported', type: 'multiselect', required: false,
            options: ['Floods', 'Earthquakes', 'Droughts', 'Cyclones', 'Landslides', 'Extreme Weather', 'Other'] },
          { name: 'data_quality_notes', label: 'Data Quality Notes', type: 'textarea', required: false,
            description: 'Any limitations or quality issues with disaster data' }
        ]
      }
    ],
    calculation: {
      formula: "Deaths/Injured/Affected per 100,000 population from NDMA reports",
      description: "Direct disaster impact rates from National Disaster Management Authority"
    },
    data_quality_requirements: [
      "Use NDMA Annual Reports as primary source",
      "Ensure consistent population base for per 100,000 calculations",
      "Document major disaster events included",
      "Note any missing or incomplete data periods"
    ]
  },

  // 1.a.2 - Government Spending on Essential Services (Balochistan Format)
  {
    indicator_code: "1.a.2",
    form_sections: [
      {
        title: "Budget Data Source and Period",
        fields: [
          { name: 'data_source', label: 'Data Source', type: 'select', required: true,
            options: ['Annual Budget Statements Balochistan', 'PRSP Ministry of Finance', 'White Paper Budget', 'Other'] },
          { name: 'budget_year', label: 'Budget Year', type: 'select', required: true,
            options: ['2014-15', '2018-19', '2022-23', '2023-24', '2024-25'] },
          { name: 'data_phase', label: 'Data Phase', type: 'select', required: true,
            options: ['Baseline', 'Progress', 'Latest Value'] }
        ]
      },
      {
        title: "Essential Services Spending (% of Total Budget)",
        fields: [
          { name: 'total_essential_spending', label: 'Total Essential Services Spending (%)', type: 'percentage', required: true,
            description: 'Combined education + health + social protection as % of total budget' },
          { name: 'education_spending', label: 'Education Spending (%)', type: 'percentage', required: true,
            description: 'Education spending as % of total government budget' },
          { name: 'health_spending', label: 'Health Spending (%)', type: 'percentage', required: true,
            description: 'Health spending as % of total government budget' },
          { name: 'social_protection_spending', label: 'Social Protection Spending (%)', type: 'percentage', required: true,
            description: 'Social protection spending as % of total government budget' }
        ]
      },
      {
        title: "Budget Details (Optional)",
        fields: [
          { name: 'total_budget_amount', label: 'Total Budget Amount (Million PKR)', type: 'number', required: false },
          { name: 'education_amount', label: 'Education Amount (Million PKR)', type: 'number', required: false },
          { name: 'health_amount', label: 'Health Amount (Million PKR)', type: 'number', required: false },
          { name: 'social_protection_amount', label: 'Social Protection Amount (Million PKR)', type: 'number', required: false }
        ]
      },
      {
        title: "Data Quality and Notes",
        fields: [
          { name: 'budget_type', label: 'Budget Type', type: 'select', required: false,
            options: ['Original Budget', 'Revised Budget', 'Actual Expenditure'] },
          { name: 'methodology_notes', label: 'Methodology Notes', type: 'textarea', required: false,
            description: 'How essential services were classified and calculated' },
          { name: 'data_limitations', label: 'Data Limitations', type: 'textarea', required: false }
        ]
      }
    ],
    calculation: {
      formula: "(Education + Health + Social Protection) / Total Government Budget × 100",
      description: "Essential services spending as percentage of total government budget"
    },
    data_quality_requirements: [
      "Use official budget documents from Government of Balochistan",
      "Ensure consistent classification of essential services",
      "Document whether original or revised budget figures used",
      "Note any changes in budget structure between years"
    ]
  }
];

// Function to get Balochistan-specific form structure
export const getBalochistandFormStructure = (indicatorCode: string): BalochistanIndicatorForm | null => {
  return balochistandGoal1Forms.find(form => form.indicator_code === indicatorCode) || null;
};