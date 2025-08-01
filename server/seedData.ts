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

// Sample targets for key SDGs
const sdgTargetsData = [
  { id: "1.1", sdg_goal_id: 1, title: "Eradicate extreme poverty", description: "By 2030, eradicate extreme poverty for all people everywhere, currently measured as people living on less than $1.25 a day" },
  { id: "1.2", sdg_goal_id: 1, title: "Reduce poverty by half", description: "By 2030, reduce at least by half the proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions" },
  { id: "2.1", sdg_goal_id: 2, title: "End hunger", description: "By 2030, end hunger and ensure access by all people, in particular the poor and people in vulnerable situations, including infants, to safe, nutritious and sufficient food all year round" },
  { id: "2.2", sdg_goal_id: 2, title: "End malnutrition", description: "By 2030, end all forms of malnutrition, including achieving, by 2025, the internationally agreed targets on stunting and wasting in children under 5 years of age" },
  { id: "3.1", sdg_goal_id: 3, title: "Reduce maternal mortality", description: "By 2030, reduce the global maternal mortality ratio to less than 70 per 100,000 live births" },
  { id: "3.2", sdg_goal_id: 3, title: "End preventable deaths of children", description: "By 2030, end preventable deaths of newborns and children under 5 years of age" },
  { id: "4.1", sdg_goal_id: 4, title: "Free primary and secondary education", description: "By 2030, ensure that all girls and boys complete free, equitable and quality primary and secondary education leading to relevant and effective learning outcomes" },
  { id: "5.1", sdg_goal_id: 5, title: "End discrimination against women", description: "End all forms of discrimination against all women and girls everywhere" },
];

// Sample indicators based on Pakistan's SDG data
const sdgIndicatorsData = [
  {
    id: "1.2.2",
    sdg_target_id: "1.2",
    indicator_code: "1.2.2",
    title: "Proportion of population living in poverty (national poverty line)",
    description: "Percentage of population below national poverty line",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on Pakistan Social and Living Standards Measurement (PSLM) survey data",
    data_collection_frequency: "Every 2-3 years",
    responsible_departments: ["PBS", "Planning Commission"]
  },
  {
    id: "2.2.1", 
    sdg_target_id: "2.2",
    indicator_code: "2.2.1",
    title: "Prevalence of stunting among children under 5 years",
    description: "Percentage of children under 5 who are stunted (height-for-age)",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on National Nutrition Survey (NNS) and PDHS data",
    data_collection_frequency: "Every 5 years",
    responsible_departments: ["Ministry of Health", "UNICEF"]
  },
  {
    id: "3.1.2",
    sdg_target_id: "3.1", 
    indicator_code: "3.1.2",
    title: "Proportion of births attended by skilled health personnel",
    description: "Percentage of deliveries attended by skilled birth attendants",
    indicator_type: "percentage",
    unit: "percentage", 
    methodology: "Based on Pakistan Demographic and Health Survey (PDHS)",
    data_collection_frequency: "Every 5 years",
    responsible_departments: ["Ministry of Health", "PBS"]
  },
  {
    id: "4.1.1",
    sdg_target_id: "4.1",
    indicator_code: "4.1.1", 
    title: "Primary education completion rate",
    description: "Percentage of children completing primary education",
    indicator_type: "percentage",
    unit: "percentage",
    methodology: "Based on Pakistan Social and Living Standards Measurement (PSLM)",
    data_collection_frequency: "Annual",
    responsible_departments: ["Ministry of Education", "PBS"]
  }
];

// Data sources used in Pakistan
const sdgDataSourcesData = [
  {
    id: "MICS",
    name: "MICS",
    full_name: "Multiple Indicator Cluster Survey", 
    description: "UNICEF-supported household survey program",
    organization: "UNICEF Pakistan",
    frequency: "Every 3-5 years",
    last_survey_year: 2018
  },
  {
    id: "PDHS", 
    name: "PDHS",
    full_name: "Pakistan Demographic and Health Survey",
    description: "National demographic and health survey",
    organization: "National Institute of Population Studies",
    frequency: "Every 5-7 years", 
    last_survey_year: 2018
  },
  {
    id: "PSLM",
    name: "PSLM", 
    full_name: "Pakistan Social and Living Standards Measurement",
    description: "National socio-economic survey",
    organization: "Pakistan Bureau of Statistics",
    frequency: "Every 2-3 years",
    last_survey_year: 2020
  },
  {
    id: "NNS",
    name: "NNS",
    full_name: "National Nutrition Survey", 
    description: "Comprehensive nutrition and health survey",
    organization: "Aga Khan University",
    frequency: "Every 5-10 years",
    last_survey_year: 2018
  }
];

// We'll skip indicator values for now since we need proper user IDs
const sdgIndicatorValuesData: any[] = [
  // Will be populated after users are created
];

export async function seedSDGData() {
  try {
    console.log('Starting SDG data seeding...');

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
        console.log(`Target ${target.id} already exists or error:`, error);
      }
    }

    // Insert Data Sources
    console.log('Inserting Data Sources...');
    for (const source of sdgDataSourcesData) {
      try {
        await db.insert(sdg_data_sources).values(source).onConflictDoNothing();
      } catch (error) {
        console.log(`Data source ${source.id} already exists or error:`, error);
      }
    }

    // Insert SDG Indicators
    console.log('Inserting SDG Indicators...');
    for (const indicator of sdgIndicatorsData) {
      try {
        await db.insert(sdg_indicators).values(indicator).onConflictDoNothing();
      } catch (error) {
        console.log(`Indicator ${indicator.id} already exists or error:`, error);
      }
    }

    // Insert Indicator Values
    console.log('Inserting Indicator Values...');
    for (const value of sdgIndicatorValuesData) {
      try {
        await db.insert(sdg_indicator_values).values(value).onConflictDoNothing();
      } catch (error) {
        console.log(`Indicator value already exists or error:`, error);
      }
    }

    console.log('SDG data seeding completed successfully!');
    return { success: true, message: 'SDG data seeded successfully' };
  } catch (error) {
    console.error('Error seeding SDG data:', error);
    return { success: false, error: error };
  }
}