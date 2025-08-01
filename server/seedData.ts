import { db } from './db';
import { sdg_goals, sdg_targets, sdg_indicators, sdg_data_sources, sdg_indicator_values } from '../shared/schema';

// Official UN SDG Goals data
const sdgGoalsData = [
  { id: 1, title: "No Poverty", description: "End poverty in all its forms everywhere", color: "#e5243b" },
  { id: 2, title: "Zero Hunger", description: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture", color: "#dda63a" },
  { id: 3, title: "Good Health and Well-being", description: "Ensure healthy lives and promote well-being for all at all ages", color: "#4c9f38" },
  { id: 4, title: "Quality Education", description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all", color: "#c5192d" },
  { id: 5, title: "Gender Equality", description: "Achieve gender equality and empower all women and girls", color: "#ff3a21" },
  { id: 6, title: "Clean Water and Sanitation", description: "Ensure availability and sustainable management of water and sanitation for all", color: "#26bde2" },
  { id: 7, title: "Affordable and Clean Energy", description: "Ensure access to affordable, reliable, sustainable and modern energy for all", color: "#fcc30b" },
  { id: 8, title: "Decent Work and Economic Growth", description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all", color: "#a21942" },
  { id: 9, title: "Industry, Innovation and Infrastructure", description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation", color: "#fd6925" },
  { id: 10, title: "Reduced Inequalities", description: "Reduce inequality within and among countries", color: "#dd1367" },
  { id: 11, title: "Sustainable Cities and Communities", description: "Make cities and human settlements inclusive, safe, resilient and sustainable", color: "#fd9d24" },
  { id: 12, title: "Responsible Consumption and Production", description: "Ensure sustainable consumption and production patterns", color: "#bf8b2e" },
  { id: 13, title: "Climate Action", description: "Take urgent action to combat climate change and its impacts", color: "#3f7e44" },
  { id: 14, title: "Life Below Water", description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development", color: "#0a97d9" },
  { id: 15, title: "Life on Land", description: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss", color: "#56c02b" },
  { id: 16, title: "Peace, Justice and Strong Institutions", description: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels", color: "#00689d" },
  { id: 17, title: "Partnerships for the Goals", description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development", color: "#19486a" },
];

// Comprehensive SDG targets based on actual indicators with data
const sdgTargetsData = [
  { target_number: "1.2", sdg_goal_id: 1, title: "Reduce poverty by half", description: "By 2030, reduce at least by half the proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions" },
  { target_number: "1.3", sdg_goal_id: 1, title: "Social protection systems", description: "Implement nationally appropriate social protection systems and measures for all, including floors, and by 2030 achieve substantial coverage of the poor and the vulnerable" },
  { target_number: "1.4", sdg_goal_id: 1, title: "Equal access to basic services", description: "By 2030, ensure that all men and women, in particular the poor and the vulnerable, have equal rights to economic resources, as well as access to basic services" },
  { target_number: "1.5", sdg_goal_id: 1, title: "Resilience to disasters", description: "By 2030, build the resilience of the poor and those in vulnerable situations and reduce their exposure and vulnerability to climate-related extreme events" },
  { target_number: "1.a", sdg_goal_id: 1, title: "Resource mobilization", description: "Ensure significant mobilization of resources from a variety of sources, including through enhanced development cooperation, in order to provide adequate and predictable means for developing countries" },
  { target_number: "2.2", sdg_goal_id: 2, title: "End malnutrition", description: "By 2030, end all forms of malnutrition, including achieving, by 2025, the internationally agreed targets on stunting and wasting in children under 5 years of age" },
  { target_number: "3.1", sdg_goal_id: 3, title: "Reduce maternal mortality", description: "By 2030, reduce the global maternal mortality ratio to less than 70 per 100,000 live births" },
  { target_number: "3.2", sdg_goal_id: 3, title: "End preventable deaths of children", description: "By 2030, end preventable deaths of newborns and children under 5 years of age" },
  { target_number: "4.6", sdg_goal_id: 4, title: "Adult literacy and numeracy", description: "By 2030, ensure that all youth and a substantial proportion of adults, both men and women, achieve literacy and numeracy" },
  { target_number: "8.5", sdg_goal_id: 8, title: "Full employment and decent work", description: "By 2030, achieve full and productive employment and decent work for all women and men, including for young people and persons with disabilities" },
  { target_number: "8.6", sdg_goal_id: 8, title: "Reduce youth NEET", description: "By 2020, substantially reduce the proportion of youth not in employment, education or training" },
  { target_number: "15.1", sdg_goal_id: 15, title: "Conserve terrestrial ecosystems", description: "By 2020, ensure the conservation, restoration and sustainable use of terrestrial and inland freshwater ecosystems" },
  { target_number: "16.9", sdg_goal_id: 16, title: "Legal identity for all", description: "By 2030, provide legal identity for all, including birth registration" },
];

// SDG Indicators data - static definition
const sdgIndicatorsData = [
  {
    id: "1.2.2",
    sdg_target_id: "1.2",
    indicator_code: "1.2.2",
    title: "Proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions",
    description: "Multi-dimensional Poverty Index (MPI) measuring poverty across health, education and living standards",
    indicator_type: "percentage" as const,
    unit: "percentage",
    methodology: "Multi-dimensional Poverty Index computation based on MICS and PSLM data",
    data_collection_frequency: "Every 3-5 years",
    responsible_departments: ["Planning Commission", "PBS", "UNICEF"]
  },
  {
    id: "1.3.1",
    sdg_target_id: "1.3",
    indicator_code: "1.3.1",
    title: "Proportion of population covered by social protection floors/systems",
    description: "Percentage of population receiving social protection benefits including BISP and other transfers",
    indicator_type: "percentage" as const, 
    unit: "percentage",
    methodology: "Based on PDHS and MICS household surveys on social protection coverage",
    data_collection_frequency: "Every 3-5 years",
    responsible_departments: ["Ministry of Social Protection", "BISP", "PBS"]
  },
  {
    id: "1.4.1",
    sdg_target_id: "1.4",
    indicator_code: "1.4.1",
    title: "Proportion of population living in households with access to basic services",
    description: "Access to improved water source, sanitation, electricity and cooking fuel",
    indicator_type: "multi_dimensional",
    unit: "percentage",
    methodology: "Based on PSLM and MICS data on household access to basic services",
    data_collection_frequency: "Every 2-3 years",
    responsible_departments: ["PBS", "Ministry of Water Resources", "Ministry of Energy"]
  },
  {
    id: "1.5.1",
    sdg_target_id: "1.5",
    indicator_code: "1.5.1", 
    title: "Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population",
    description: "Disaster impact statistics including fatalities, injuries and affected population",
    indicator_type: "rate",
    unit: "per 100,000 population",
    methodology: "Based on NDMA annual disaster reports and provincial disaster management data",
    data_collection_frequency: "Annual",
    responsible_departments: ["NDMA", "PDMA Balochistan"]
  },
  {
    id: "1.a.2",
    sdg_target_id: "1.a",
    indicator_code: "1.a.2",
    title: "Proportion of total government spending on essential services (education, health and social protection)",
    description: "Government budget allocation to education, health and social protection as percentage of total spending",
    indicator_type: "budget",
    unit: "percentage",
    methodology: "Based on provincial budget statements and PRSP Ministry of Finance data",
    data_collection_frequency: "Annual",
    responsible_departments: ["Ministry of Finance Balochistan", "Planning & Development"]
  },
  {
    id: "2.2.1",
    sdg_target_id: "2.2",
    indicator_code: "2.2.1",
    title: "Prevalence of stunting among children under 5 years of age",
    description: "Percentage of children under 5 with height-for-age below -2 standard deviations from median",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on National Nutrition Survey (NNS), PDHS and MICS anthropometric measurements",
    data_collection_frequency: "Every 3-5 years",
    responsible_departments: ["Ministry of Health", "UNICEF", "Aga Khan University"]
  },
  {
    id: "2.2.2",
    sdg_target_id: "2.2",
    indicator_code: "2.2.2",
    title: "Prevalence of malnutrition among children under 5 years of age, by type (wasting and overweight)",
    description: "Percentage of children under 5 with wasting (weight-for-height) and overweight conditions",
    indicator_type: "multi_dimensional",
    unit: "percentage",
    methodology: "Based on NNS, PDHS and MICS anthropometric measurements for wasting and overweight",
    data_collection_frequency: "Every 3-5 years",
    responsible_departments: ["Ministry of Health", "UNICEF", "Aga Khan University"]
  },
  {
    id: "3.1.1",
    sdg_target_id: "3.1",
    indicator_code: "3.1.1",
    title: "Maternal mortality ratio",
    description: "Number of maternal deaths per 100,000 live births",
    indicator_type: "rate",
    unit: "per 100,000 live births",
    methodology: "Based on PDHS and Pakistan MMR Survey data on maternal deaths",
    data_collection_frequency: "Every 5-7 years",
    responsible_departments: ["Ministry of Health", "NIPS", "PBS"]
  },
  {
    id: "3.2.1",
    sdg_target_id: "3.2",
    indicator_code: "3.2.1",
    title: "Under-5 mortality rate",
    description: "Probability of dying between birth and exactly 5 years of age per 1,000 live births",
    indicator_type: "rate",
    unit: "per 1,000 live births",
    methodology: "Based on PDHS, PSLM and MICS data on child mortality",
    data_collection_frequency: "Every 3-5 years",
    responsible_departments: ["Ministry of Health", "PBS", "UNICEF"]
  },
  {
    id: "4.6.1",
    sdg_target_id: "4.6",
    indicator_code: "4.6.1",
    title: "Proportion of population in a given age group achieving at least a fixed level of proficiency in functional literacy and numeracy skills by sex",
    description: "Adult literacy rate for population 10 years and above",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on PSLM and Labour Force Survey (LFS) data on literacy rates",
    data_collection_frequency: "Every 2-3 years",
    responsible_departments: ["Ministry of Education", "PBS"]
  },
  {
    id: "8.5.2",
    sdg_target_id: "8.5",
    indicator_code: "8.5.2",
    title: "Unemployment rate by sex, age and persons with disabilities",
    description: "Percentage of labour force that is unemployed, disaggregated by sex",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on Labour Force Survey (LFS) quarterly data on employment status",
    data_collection_frequency: "Quarterly/Annual",
    responsible_departments: ["PBS", "Ministry of Labour"]
  },
  {
    id: "8.6.1",
    sdg_target_id: "8.6",
    indicator_code: "8.6.1",
    title: "Proportion of youth (aged 15–24 years) not in education, employment or training",
    description: "NEET rate - youth not engaged in education, employment or training",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on Labour Force Survey (LFS) data on youth education and employment status",
    data_collection_frequency: "Annual",
    responsible_departments: ["PBS", "Ministry of Education", "Ministry of Labour"]
  },
  {
    id: "15.1.1",
    sdg_target_id: "15.1",
    indicator_code: "15.1.1",
    title: "Forest area as a proportion of total land area",
    description: "Percentage of total land area covered by forests",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on Balochistan Development Statistics and Agriculture Statistics forest cover data",
    data_collection_frequency: "Annual",
    responsible_departments: ["Forest Department Balochistan", "Agriculture Department"]
  },
  {
    id: "16.9.1",
    sdg_target_id: "16.9",
    indicator_code: "16.9.1",
    title: "Proportion of children under 5 years of age whose births have been registered with a civil authority by age",
    description: "Birth registration coverage for children under 5 years",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on PDHS and MICS data on civil registration and vital statistics",
    data_collection_frequency: "Every 3-5 years",
    responsible_departments: ["NADRA", "Civil Registration", "PBS"]
  }
];

// All data sources mentioned in your document
const sdgDataSourcesData = [
  {
    name: "MPI Report 2014-15",
    full_name: "Multi-dimensional Poverty Index Report 2014-15", 
    source_type: "Custom" as const,
    description: "Baseline MPI computation for poverty measurement"
  },
  {
    name: "MICS",
    full_name: "Multiple Indicator Cluster Survey", 
    source_type: "MICS" as const,
    description: "UNICEF-supported household survey program"
  },
  {
    name: "PDHS",
    full_name: "Pakistan Demographic and Health Survey",
    source_type: "PDHS" as const,
    description: "National demographic and health survey"
  },
  {
    name: "PSLM", 
    full_name: "Pakistan Social and Living Standards Measurement",
    source_type: "PSLM" as const,
    description: "National socio-economic survey"
  },
  {
    name: "NNS",
    full_name: "National Nutrition Survey", 
    source_type: "NNS" as const,
    description: "Comprehensive nutrition and health survey"
  },
  {
    name: "NDMA Reports",
    full_name: "National Disaster Management Authority Annual Reports",
    source_type: "NDMA" as const,
    description: "Disaster impact and response data"
  },
  {
    name: "Budget Statements",
    full_name: "Provincial Budget Statements and PRSP Reports",
    source_type: "PBS" as const,
    description: "Government spending and budget allocation data"
  },
  {
    name: "Pakistan MMR Survey",
    full_name: "Pakistan Maternal Mortality Rate Survey",
    source_type: "Custom" as const,
    description: "Specialized survey on maternal mortality"
  },
  {
    name: "LFS",
    full_name: "Labour Force Survey",
    source_type: "PBS" as const,
    description: "Quarterly employment and labour statistics"
  },
  {
    name: "Balochistan Development Statistics",
    full_name: "Balochistan Development Statistics and Agriculture Statistics",
    source_type: "Custom" as const,
    description: "Provincial development and agriculture data including forestry"
  }
];

// All actual SDG indicator values from your document - using admin user ID that exists
async function getAdminUserId() {
  // Query to get the admin user ID - this will be called during seeding
  const result = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.role, 'admin')
  });
  return result?.id || null;
}

// Sample data values based on your document (will use admin ID dynamically)
const createSdgIndicatorValuesData = (adminId: string) => [
  // 1.2.2 - Poverty (MPI)
  {
    indicator_id: "1.2.2",
    data_source_id: "MPI2014",
    year: 2015,
    value: "71.2",
    value_numeric: 71.2,
    breakdown_data: { overall: 71.2, urban: 37.7, rural: 84.6 },
    baseline_indicator: true,
    notes: "Baseline MPI from 2014-15 showing high poverty rates in Balochistan",
    reference_document: "MPI Report 2014-15",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "1.2.2",
    data_source_id: "MICS",
    year: 2020,
    value: "63.4",
    value_numeric: 63.4,
    breakdown_data: { overall: 63.4, urban: 41.7, rural: 71.0 },
    progress_indicator: true,
    notes: "Progress measurement showing improvement in MPI",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 1.3.1 - Social Protection
  {
    indicator_id: "1.3.1",
    data_source_id: "PDHS",
    year: 2018,
    value: "8.0",
    value_numeric: 8.0,
    breakdown_data: { bisp_coverage: 8.0 },
    baseline_indicator: true,
    notes: "BISP coverage among ever-married women (15-49)",
    reference_document: "PDHS 2017-18",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "1.3.1",
    data_source_id: "MICS",
    year: 2020,
    value: "14.4",
    value_numeric: 14.4,
    breakdown_data: { social_transfers: 14.4 },
    progress_indicator: true,
    notes: "Household members receiving social transfers in last 3 months",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 1.4.1 - Access to Basic Services (Multiple sub-indicators)
  {
    indicator_id: "1.4.1",
    data_source_id: "PSLM",
    year: 2015,
    value: "Multiple Services",
    breakdown_data: { 
      improved_water: 67, 
      flush_toilet: 31, 
      flush_toilet_urban: 78, 
      flush_toilet_rural: 14,
      electricity: 80.73,
      electricity_urban: 97.59,
      electricity_rural: 74.42,
      gas_cooking: 25,
      gas_urban: 60,
      gas_rural: 12
    },
    baseline_indicator: true,
    notes: "Baseline access to basic services across multiple indicators",
    reference_document: "PSLM 2014-15",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "1.4.1",
    data_source_id: "PSLM",
    year: 2019,
    value: "Multiple Services",
    breakdown_data: { 
      improved_water: 84, 
      flush_toilet: 41, 
      flush_toilet_urban: 82, 
      flush_toilet_rural: 25,
      electricity: 75,
      electricity_urban: 95,
      electricity_rural: 67,
      gas_cooking: 37,
      gas_urban: 70,
      gas_rural: 24
    },
    progress_indicator: true,
    notes: "Progress in access to basic services showing improvements",
    reference_document: "PSLM 2018-19",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "1.4.1",
    data_source_id: "MICS",
    year: 2020,
    value: "Water and Sanitation",
    breakdown_data: { 
      basic_drinking_water: 79.6,
      basic_sanitation: 62.8
    },
    progress_indicator: true,
    notes: "Latest data on water and sanitation services",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 1.5.1 - Disaster Impact
  {
    indicator_id: "1.5.1",
    data_source_id: "NDMA",
    year: 2015,
    value: "Disaster Impact",
    breakdown_data: { 
      deaths_per_100k: 0.13,
      injured_per_100k: 0.29,
      affected_per_100k: 70.35
    },
    baseline_indicator: true,
    notes: "Baseline disaster impact statistics",
    reference_document: "NDMA Annual Report 2015",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "1.5.1",
    data_source_id: "NDMA",
    year: 2018,
    value: "Disaster Impact",
    breakdown_data: { 
      deaths_per_100k: 0.04,
      injured_per_100k: 0.08,
      affected_per_100k: 24.62
    },
    progress_indicator: true,
    notes: "Improved disaster management and reduced impact",
    reference_document: "NDMA Annual Report 2018",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "1.5.1",
    data_source_id: "NDMA",
    year: 2021,
    value: "Disaster Impact",
    breakdown_data: { 
      deaths_per_100k: 0.17,
      injured_per_100k: 0.06,
      affected_per_100k: 19.92
    },
    progress_indicator: true,
    notes: "Latest disaster impact data",
    reference_document: "NDMA Annual Report 2021",
    data_quality_score: 4,
    submitted_by: adminId
  },
  // 1.a.2 - Government Spending
  {
    indicator_id: "1.a.2",
    data_source_id: "BUDGET",
    year: 2015,
    value: "26.78",
    value_numeric: 26.78,
    breakdown_data: { 
      total_spending: 26.78,
      education: 18.35,
      health: 7.8,
      social_protection: 0.62
    },
    baseline_indicator: true,
    notes: "Baseline government spending on essential services",
    reference_document: "Annual Budget Statements 2014-15",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "1.a.2",
    data_source_id: "BUDGET",
    year: 2019,
    value: "30.20",
    value_numeric: 30.20,
    breakdown_data: { 
      total_spending: 30.20,
      education: 21.26,
      health: 8.42,
      social_protection: 0.53
    },
    progress_indicator: true,
    notes: "Increased spending on essential services",
    reference_document: "Annual Budget Statements 2018-19",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "1.a.2",
    data_source_id: "BUDGET",
    year: 2023,
    value: "27.90",
    value_numeric: 27.90,
    breakdown_data: { 
      total_spending: 27.90,
      education: 17.60,
      health: 7.39,
      social_protection: 2.91
    },
    progress_indicator: true,
    notes: "Latest budget allocation with significant increase in social protection",
    reference_document: "Revised Budget 2022-23",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 2.2.1 - Stunting
  {
    indicator_id: "2.2.1",
    data_source_id: "NNS",
    year: 2011,
    value: "32.0",
    value_numeric: 32.0,
    breakdown_data: { stunting_rate: 32.0 },
    baseline_indicator: true,
    notes: "Baseline stunting rate from NNS",
    reference_document: "National Nutrition Survey 2011",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "2.2.1",
    data_source_id: "PDHS",
    year: 2018,
    value: "47.0",
    value_numeric: 47.0,
    breakdown_data: { stunting_rate: 47.0 },
    progress_indicator: true,
    notes: "Concerning increase in stunting rates",
    reference_document: "PDHS 2017-18",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "2.2.1",
    data_source_id: "MICS",
    year: 2020,
    value: "49.7",
    value_numeric: 49.7,
    breakdown_data: { 
      moderate_severe_stunting: 49.7,
      severe_stunting: 29.1
    },
    progress_indicator: true,
    notes: "Latest stunting data showing continued challenges",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 2.2.2 - Malnutrition (Wasting)
  {
    indicator_id: "2.2.2",
    data_source_id: "NNS",
    year: 2011,
    value: "18.0",
    value_numeric: 18.0,
    breakdown_data: { wasting_rate: 18.0 },
    baseline_indicator: true,
    notes: "Baseline wasting rate",
    reference_document: "National Nutrition Survey 2011",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "2.2.2",
    data_source_id: "PDHS",
    year: 2018,
    value: "18.3",
    value_numeric: 18.3,
    breakdown_data: { wasting_rate: 18.3 },
    progress_indicator: true,
    notes: "Stable wasting rates",
    reference_document: "PDHS 2017-18",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "2.2.2",
    data_source_id: "MICS",
    year: 2020,
    value: "9.2",
    value_numeric: 9.2,
    breakdown_data: { 
      moderate_severe_wasting: 9.2,
      severe_wasting: 4.3,
      overweight: 11.5
    },
    progress_indicator: true,
    notes: "Significant improvement in wasting rates",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 3.1.1 - Maternal Mortality
  {
    indicator_id: "3.1.1",
    data_source_id: "PDHS",
    year: 2007,
    value: "785",
    value_numeric: 785,
    breakdown_data: { mmr: 785 },
    baseline_indicator: true,
    notes: "High baseline maternal mortality ratio",
    reference_document: "PDHS 2006-07",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "3.1.1",
    data_source_id: "MMR",
    year: 2019,
    value: "298",
    value_numeric: 298,
    breakdown_data: { mmr: 298 },
    progress_indicator: true,
    notes: "Significant improvement in maternal mortality",
    reference_document: "Pakistan MMR Survey 2019",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 3.2.1 - Under-5 Mortality
  {
    indicator_id: "3.2.1",
    data_source_id: "PDHS",
    year: 2013,
    value: "111",
    value_numeric: 111,
    breakdown_data: { 
      overall: 111,
      urban: 101,
      rural: 102
    },
    baseline_indicator: true,
    notes: "Baseline under-5 mortality rate",
    reference_document: "PDHS 2012-13",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "3.2.1",
    data_source_id: "PSLM",
    year: 2019,
    value: "35",
    value_numeric: 35,
    breakdown_data: { 
      overall: 35,
      urban: 32,
      rural: 36
    },
    progress_indicator: true,
    notes: "Dramatic improvement in child survival",
    reference_document: "PSLM 2018-19",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "3.2.1",
    data_source_id: "MICS",
    year: 2020,
    value: "53",
    value_numeric: 53,
    breakdown_data: { under5_mortality: 53 },
    progress_indicator: true,
    notes: "Latest under-5 mortality data",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 4.6.1 - Literacy
  {
    indicator_id: "4.6.1",
    data_source_id: "PSLM",
    year: 2014,
    value: "44.0",
    value_numeric: 44.0,
    breakdown_data: { literacy_rate: 44.0 },
    baseline_indicator: true,
    notes: "Baseline literacy rate",
    reference_document: "PSLM 2013-14",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "4.6.1",
    data_source_id: "PSLM",
    year: 2020,
    value: "46.0",
    value_numeric: 46.0,
    breakdown_data: { literacy_rate: 46.0 },
    progress_indicator: true,
    notes: "Modest improvement in literacy",
    reference_document: "PSLM 2019-20",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "4.6.1",
    data_source_id: "LFS",
    year: 2021,
    value: "54.5",
    value_numeric: 54.5,
    breakdown_data: { literacy_rate_10plus: 54.5 },
    progress_indicator: true,
    notes: "Latest literacy rate showing good progress",
    reference_document: "Labour Force Survey 2020-21",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 8.5.2 - Unemployment
  {
    indicator_id: "8.5.2",
    data_source_id: "LFS",
    year: 2015,
    value: "3.92",
    value_numeric: 3.92,
    breakdown_data: { 
      overall: 3.92,
      male: 2.84,
      female: 8.54
    },
    baseline_indicator: true,
    notes: "Baseline unemployment rate",
    reference_document: "Labour Force Survey 2014-15",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "8.5.2",
    data_source_id: "LFS",
    year: 2019,
    value: "4.6",
    value_numeric: 4.6,
    breakdown_data: { 
      overall: 4.6,
      male: 4.2,
      female: 7.4
    },
    progress_indicator: true,
    notes: "Slight increase in unemployment",
    reference_document: "Labour Force Survey 2018-19",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "8.5.2",
    data_source_id: "LFS",
    year: 2021,
    value: "4.3",
    value_numeric: 4.3,
    breakdown_data: { 
      overall: 4.3,
      male: 4.2,
      female: 5.0
    },
    progress_indicator: true,
    notes: "Recent improvement in unemployment, especially for women",
    reference_document: "Labour Force Survey 2020-21",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 8.6.1 - Youth NEET
  {
    indicator_id: "8.6.1",
    data_source_id: "LFS",
    year: 2015,
    value: "24.0",
    value_numeric: 24.0,
    breakdown_data: { 
      overall: 24.0,
      urban: 23.0,
      rural: 25.0
    },
    baseline_indicator: true,
    notes: "Baseline youth NEET rate",
    reference_document: "Labour Force Survey 2014-15",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "8.6.1",
    data_source_id: "LFS",
    year: 2019,
    value: "27.0",
    value_numeric: 27.0,
    breakdown_data: { 
      overall: 27.0,
      urban: 27.0,
      rural: 27.0
    },
    progress_indicator: true,
    notes: "Increase in youth NEET rate",
    reference_document: "Labour Force Survey 2018-19",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "8.6.1",
    data_source_id: "LFS",
    year: 2021,
    value: "41.8",
    value_numeric: 41.8,
    breakdown_data: { 
      overall: 41.8,
      urban: 41.0,
      rural: 42.1,
      male_overall: 14.1,
      male_urban: 15.8,
      male_rural: 13.3,
      female_overall: 75.4,
      female_urban: 71.6,
      female_rural: 77.6
    },
    progress_indicator: true,
    notes: "Significant increase in youth NEET, particularly affecting females",
    reference_document: "Labour Force Survey 2020-21",
    data_quality_score: 5,
    submitted_by: adminId
  },
  // 15.1.1 - Forest Area
  {
    indicator_id: "15.1.1",
    data_source_id: "FORESTRY",
    year: 2015,
    value: "3.25",
    value_numeric: 3.25,
    breakdown_data: { forest_percentage: 3.25 },
    baseline_indicator: true,
    notes: "Baseline forest coverage",
    reference_document: "Balochistan Development Statistics 2014-15",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "15.1.1",
    data_source_id: "FORESTRY",
    year: 2019,
    value: "3.35",
    value_numeric: 3.35,
    breakdown_data: { forest_percentage: 3.35 },
    progress_indicator: true,
    notes: "Slight increase in forest coverage",
    reference_document: "Balochistan Development Statistics 2018-19",
    data_quality_score: 4,
    submitted_by: adminId
  },
  {
    indicator_id: "15.1.1",
    data_source_id: "FORESTRY",
    year: 2022,
    value: "5.15",
    value_numeric: 5.15,
    breakdown_data: { forest_percentage: 5.15 },
    progress_indicator: true,
    notes: "Significant improvement in forest coverage",
    reference_document: "Balochistan Agriculture Statistics 2021-22",
    data_quality_score: 4,
    submitted_by: adminId
  },
  // 16.9.1 - Birth Registration
  {
    indicator_id: "16.9.1",
    data_source_id: "PDHS",
    year: 2013,
    value: "7.7",
    value_numeric: 7.7,
    breakdown_data: { birth_registration: 7.7 },
    baseline_indicator: true,
    notes: "Very low baseline birth registration",
    reference_document: "PDHS 2012-13",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "16.9.1",
    data_source_id: "PDHS",
    year: 2018,
    value: "37.6",
    value_numeric: 37.6,
    breakdown_data: { 
      overall: 37.6,
      urban: 46.0,
      rural: 34.0
    },
    progress_indicator: true,
    notes: "Significant improvement in birth registration",
    reference_document: "PDHS 2017-18",
    data_quality_score: 5,
    submitted_by: adminId
  },
  {
    indicator_id: "16.9.1",
    data_source_id: "MICS",
    year: 2020,
    value: "44.1",
    value_numeric: 44.1,
    breakdown_data: { birth_registration: 44.1 },
    progress_indicator: true,
    notes: "Continued improvement in birth registration",
    reference_document: "MICS 2019-20",
    data_quality_score: 5,
    submitted_by: adminId
  }
];

export async function seedSDGData() {
  try {
    console.log('Starting comprehensive SDG data seeding...');

    // Insert SDG Goals
    console.log('Inserting SDG Goals...');
    for (const goal of sdgGoalsData) {
      try {
        await db.insert(sdg_goals).values(goal).onConflictDoNothing();
      } catch (error) {
        console.log(`Goal ${goal.id} already exists or error:`, error);
      }
    }

    // Insert SDG Targets
    console.log('Inserting SDG Targets...');
    for (const target of sdgTargetsData) {
      try {
        await db.insert(sdg_targets).values(target).onConflictDoNothing();
      } catch (error) {
        console.log(`Target ${target.target_number} already exists or error:`, error);
      }
    }

    // Insert Data Sources
    console.log('Inserting Data Sources...');
    for (const source of sdgDataSourcesData) {
      try {
        await db.insert(sdg_data_sources).values(source).onConflictDoNothing();
      } catch (error) {
        console.log(`Data source ${source.name} already exists or error:`, error);
      }
    }

    // Insert SDG Indicators
    console.log('Inserting SDG Indicators...');
    for (const indicator of sdgIndicatorsData) {
      try {
        await db.insert(sdg_indicators).values([indicator]).onConflictDoNothing();
      } catch (error) {
        console.log(`Indicator ${indicator.id} already exists or error:`, error);
      }
    }

    // Get admin user ID for data values
    const adminUser = await getAdminUserId();
    if (!adminUser) {
      console.log('No admin user found, skipping indicator values');
      return { success: true, message: 'SDG structure seeded successfully (no admin user for values)' };
    }

    // Insert Indicator Values with actual data
    console.log('Inserting comprehensive indicator values...');
    const indicatorValues = createSdgIndicatorValuesData(adminUser);
    for (const value of indicatorValues) {
      try {
        await db.insert(sdg_indicator_values).values(value).onConflictDoNothing();
      } catch (error) {
        console.log(`Indicator value error:`, error);
      }
    }

    console.log('SDG data seeding completed successfully!');
    console.log(`Seeded: ${sdgGoalsData.length} goals, ${sdgTargetsData.length} targets, ${sdgIndicatorsData.length} indicators, ${sdgDataSourcesData.length} data sources, ${indicatorValues.length} data values`);
    return { success: true, message: 'Complete SDG database populated with authentic Balochistan data' };
  } catch (error) {
    console.error('Error seeding SDG data:', error);
    return { success: false, error: error };
  }
}