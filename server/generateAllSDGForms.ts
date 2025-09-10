import { createSDGForm, standardDemographicFields, standardPercentageFields } from "./createSDGForms.js";

// User ID who will be the creator of all forms
const ADMIN_USER_ID = "bbb55fbb-dc8d-44a4-9389-5842618fb3a4";

// Specific form definitions for each indicator type
export async function generateAllSDGForms() {
  console.log("Starting generation of all SDG indicator forms...");

  try {
    // Goal 1: No Poverty
    await createPovertyIndicatorForms();
    
    // Goal 2: Zero Hunger  
    await createHungerIndicatorForms();
    
    // Goal 3: Good Health and Well-being
    await createHealthIndicatorForms();
    
    // Goal 4: Quality Education
    await createEducationIndicatorForms();
    
    // Goal 5: Gender Equality
    await createGenderIndicatorForms();
    
    console.log("Successfully generated all SDG indicator forms!");
    
  } catch (error) {
    console.error("Error generating SDG forms:", error);
    throw error;
  }
}

async function createPovertyIndicatorForms() {
  console.log("Creating poverty indicator forms...");
  
  // 1.1.1 - International poverty line
  await createSDGForm(
    "1.1.1",
    "Proportion of the population living below the international poverty line by sex, age, employment status and geographic location (urban/rural)",
    "Data collection for international poverty measurements with demographic and geographic breakdowns",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information", 
        group_type: "section",
        display_order: 1,
        fields: [
          ...standardDemographicFields,
          {
            field_name: "age_group",
            field_label: "Age Group",
            field_type: "select",
            is_required: false,
            placeholder_text: "0-14, 15-64, 65+, or Total",
            field_order: 6
          },
          {
            field_name: "employment_status", 
            field_label: "Employment Status",
            field_type: "select",
            is_required: false,
            placeholder_text: "Employed, Unemployed, or Total",
            field_order: 7
          }
        ]
      },
      {
        group_name: "poverty_data",
        group_label: "Poverty Data",
        group_type: "section", 
        display_order: 2,
        fields: [
          ...standardPercentageFields,
          {
            field_name: "poverty_line_amount",
            field_label: "International Poverty Line (PKR)",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 350",
            field_order: 13
          },
          {
            field_name: "total_population",
            field_label: "Total Population in Category",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 1250000",
            field_order: 14
          },
          {
            field_name: "population_below_line",
            field_label: "Population Below Poverty Line",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 278750",
            field_order: 15
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  // 1.2.1 - National poverty line
  await createSDGForm(
    "1.2.1", 
    "Proportion of population living below the national poverty line, by sex and age",
    "Data collection for national poverty measurements with sex and age breakdowns",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information",
        group_type: "section",
        display_order: 1,
        fields: [
          ...standardDemographicFields,
          {
            field_name: "age_group",
            field_label: "Age Group", 
            field_type: "select",
            is_required: false,
            placeholder_text: "Children (0-17), Adults (18-64), Elderly (65+), or Total",
            field_order: 6
          }
        ]
      },
      {
        group_name: "poverty_data",
        group_label: "National Poverty Data",
        group_type: "section",
        display_order: 2,
        fields: [
          ...standardPercentageFields,
          {
            field_name: "national_poverty_line",
            field_label: "National Poverty Line (PKR)",
            field_type: "number", 
            is_required: false,
            placeholder_text: "e.g., 4000",
            field_order: 13
          },
          {
            field_name: "household_count",
            field_label: "Total Households Surveyed", 
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 15000",
            field_order: 14
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  // 1.2.2 - Multidimensional poverty
  await createSDGForm(
    "1.2.2",
    "Proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions", 
    "Data collection for multidimensional poverty index covering health, education, and living standards",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information",
        group_type: "section",
        display_order: 1,
        fields: standardDemographicFields
      },
      {
        group_name: "poverty_dimensions",
        group_label: "Poverty Dimensions",
        group_type: "section",
        display_order: 2,
        fields: [
          {
            field_name: "health_dimension_score",
            field_label: "Health Dimension Score",
            field_type: "number",
            is_required: false,
            placeholder_text: "0.0 to 1.0",
            field_order: 10
          },
          {
            field_name: "education_dimension_score", 
            field_label: "Education Dimension Score",
            field_type: "number",
            is_required: false,
            placeholder_text: "0.0 to 1.0",
            field_order: 11
          },
          {
            field_name: "living_standards_score",
            field_label: "Living Standards Score", 
            field_type: "number",
            is_required: false,
            placeholder_text: "0.0 to 1.0",
            field_order: 12
          },
          {
            field_name: "mpi_value",
            field_label: "Multidimensional Poverty Index",
            field_type: "number",
            is_required: true,
            placeholder_text: "e.g., 0.285",
            field_order: 13
          },
          {
            field_name: "poverty_headcount_ratio",
            field_label: "Poverty Headcount Ratio (%)",
            field_type: "number", 
            is_required: true,
            placeholder_text: "e.g., 38.4",
            field_order: 14
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  console.log("Completed poverty indicator forms");
}

async function createHungerIndicatorForms() {
  console.log("Creating hunger indicator forms...");
  
  // 2.2.1 - Stunting in children
  await createSDGForm(
    "2.2.1",
    "Prevalence of stunting (height for age <-2 standard deviation from the median of the World Health Organization (WHO) Child Growth Standards) among children under 5 years of age",
    "Data collection for child stunting prevalence with age and sex breakdowns",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information",
        group_type: "section", 
        display_order: 1,
        fields: [
          ...standardDemographicFields,
          {
            field_name: "age_months",
            field_label: "Age Group (Months)",
            field_type: "select",
            is_required: false,
            placeholder_text: "0-5, 6-11, 12-23, 24-35, 36-47, 48-59, or Total",
            field_order: 6
          }
        ]
      },
      {
        group_name: "stunting_data",
        group_label: "Stunting Measurements",
        group_type: "section",
        display_order: 2,
        fields: [
          ...standardPercentageFields,
          {
            field_name: "children_measured", 
            field_label: "Total Children Measured",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 2500",
            field_order: 13
          },
          {
            field_name: "children_stunted",
            field_label: "Children with Stunting",
            field_type: "number",
            is_required: false, 
            placeholder_text: "e.g., 1075",
            field_order: 14
          },
          {
            field_name: "who_standard_applied",
            field_label: "WHO Child Growth Standards Applied",
            field_type: "select",
            is_required: true,
            placeholder_text: "Yes or No",
            field_order: 15
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  // 2.2.2 - Malnutrition (wasting and overweight)
  await createSDGForm(
    "2.2.2",
    "Prevalence of malnutrition (weight for height >+2 or <-2 standard deviation from the median of the WHO Child Growth Standards) among children under 5 years of age, by type (wasting and overweight)",
    "Data collection for child malnutrition including both wasting and overweight measurements",
    [
      {
        group_name: "basic_info", 
        group_label: "Basic Information",
        group_type: "section",
        display_order: 1,
        fields: [
          ...standardDemographicFields,
          {
            field_name: "age_months",
            field_label: "Age Group (Months)",
            field_type: "select",
            is_required: false,
            placeholder_text: "0-5, 6-11, 12-23, 24-35, 36-47, 48-59, or Total",
            field_order: 6
          },
          {
            field_name: "malnutrition_type",
            field_label: "Malnutrition Type",
            field_type: "select", 
            is_required: true,
            placeholder_text: "Wasting, Overweight, or Both",
            field_order: 7
          }
        ]
      },
      {
        group_name: "malnutrition_data",
        group_label: "Malnutrition Measurements", 
        group_type: "section",
        display_order: 2,
        fields: [
          {
            field_name: "wasting_prevalence",
            field_label: "Wasting Prevalence (%)",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 17.7",
            field_order: 10
          },
          {
            field_name: "overweight_prevalence",
            field_label: "Overweight Prevalence (%)", 
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 3.2",
            field_order: 11
          },
          {
            field_name: "total_prevalence",
            field_label: "Total Malnutrition Prevalence (%)",
            field_type: "number",
            is_required: true,
            placeholder_text: "e.g., 20.9",
            field_order: 12
          },
          {
            field_name: "children_assessed",
            field_label: "Total Children Assessed",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 3000",
            field_order: 13
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  console.log("Completed hunger indicator forms");
}

async function createHealthIndicatorForms() {
  console.log("Creating health indicator forms...");
  
  // 3.1.1 - Maternal mortality ratio
  await createSDGForm(
    "3.1.1",
    "Maternal mortality ratio",
    "Data collection for maternal deaths per 100,000 live births",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information",
        group_type: "section",
        display_order: 1,
        fields: standardDemographicFields
      },
      {
        group_name: "maternal_mortality_data",
        group_label: "Maternal Mortality Data",
        group_type: "section",
        display_order: 2,
        fields: [
          {
            field_name: "maternal_deaths",
            field_label: "Maternal Deaths",
            field_type: "number",
            is_required: true,
            placeholder_text: "e.g., 186",
            field_order: 10
          },
          {
            field_name: "live_births",
            field_label: "Live Births", 
            field_type: "number",
            is_required: true,
            placeholder_text: "e.g., 125000",
            field_order: 11
          },
          {
            field_name: "maternal_mortality_ratio",
            field_label: "Maternal Mortality Ratio (per 100,000 live births)",
            field_type: "number",
            is_required: true,
            placeholder_text: "e.g., 148.8",
            field_order: 12
          },
          {
            field_name: "baseline_ratio",
            field_label: "Baseline MMR (per 100,000)",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 260",
            field_order: 13
          },
          {
            field_name: "target_ratio",
            field_label: "Target MMR (per 100,000)",
            field_type: "number", 
            is_required: false,
            placeholder_text: "e.g., 70",
            field_order: 14
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  console.log("Completed health indicator forms");
}

async function createEducationIndicatorForms() {
  console.log("Creating education indicator forms...");
  
  // 4.1.1 - Reading and mathematics proficiency
  await createSDGForm(
    "4.1.1",
    "Proportion of children and young people achieving at least a minimum proficiency level in (a) reading and (b) mathematics, by sex",
    "Data collection for student achievement in reading and mathematics with sex disaggregation",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information",
        group_type: "section",
        display_order: 1,
        fields: [
          ...standardDemographicFields,
          {
            field_name: "grade_level",
            field_label: "Grade Level",
            field_type: "select",
            is_required: true,
            placeholder_text: "Grade 2-3, Grade 4-5, or Grade 8-9",
            field_order: 6
          },
          {
            field_name: "subject",
            field_label: "Subject", 
            field_type: "select",
            is_required: true,
            placeholder_text: "Reading, Mathematics, or Both",
            field_order: 7
          }
        ]
      },
      {
        group_name: "achievement_data",
        group_label: "Achievement Data",
        group_type: "section",
        display_order: 2, 
        fields: [
          {
            field_name: "reading_proficiency",
            field_label: "Reading Proficiency (%)",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 45.2",
            field_order: 10
          },
          {
            field_name: "mathematics_proficiency",
            field_label: "Mathematics Proficiency (%)",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 38.7",
            field_order: 11
          },
          {
            field_name: "overall_proficiency",
            field_label: "Overall Proficiency (%)",
            field_type: "number",
            is_required: true,
            placeholder_text: "e.g., 41.9",
            field_order: 12
          },
          {
            field_name: "students_tested",
            field_label: "Total Students Tested",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 8500",
            field_order: 13
          },
          {
            field_name: "students_proficient",
            field_label: "Students Achieving Minimum Proficiency",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 3565",
            field_order: 14
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  console.log("Completed education indicator forms");
}

async function createGenderIndicatorForms() {
  console.log("Creating gender indicator forms...");
  
  // 5.2.1 - Violence against women
  await createSDGForm(
    "5.2.1",
    "Proportion of ever-partnered women and girls aged 15 years and older subjected to physical, sexual or psychological violence by a current or former intimate partner in the previous 12 months, by form of violence and by age",
    "Data collection for intimate partner violence with age breakdown and violence type",
    [
      {
        group_name: "basic_info",
        group_label: "Basic Information",
        group_type: "section",
        display_order: 1,
        fields: [
          ...standardDemographicFields.filter(f => f.field_name !== 'sex'), // Remove sex field since this is women-specific
          {
            field_name: "age_group",
            field_label: "Age Group",
            field_type: "select",
            is_required: true,
            placeholder_text: "15-19, 20-24, 25-34, 35-49, 15-49 (Total)",
            field_order: 6
          },
          {
            field_name: "violence_type",
            field_label: "Violence Type",
            field_type: "select", 
            is_required: true,
            placeholder_text: "Physical, Sexual, Psychological, or Any",
            field_order: 7
          }
        ]
      },
      {
        group_name: "violence_data",
        group_label: "Violence Data",
        group_type: "section",
        display_order: 2,
        fields: [
          ...standardPercentageFields,
          {
            field_name: "women_interviewed",
            field_label: "Ever-partnered Women Interviewed",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 12500",
            field_order: 13
          },
          {
            field_name: "women_experienced_violence",
            field_label: "Women Who Experienced Violence",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 4250",
            field_order: 14
          },
          {
            field_name: "reporting_rate",
            field_label: "Reporting Rate (%)",
            field_type: "number",
            is_required: false,
            placeholder_text: "e.g., 15.2",
            field_order: 15
          }
        ]
      }
    ],
    ADMIN_USER_ID
  );

  console.log("Completed gender indicator forms");
}

// Run the generation if this file is executed directly
if (require.main === module) {
  generateAllSDGForms()
    .then(() => {
      console.log("All SDG forms generated successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to generate SDG forms:", error);
      process.exit(1);
    });
}