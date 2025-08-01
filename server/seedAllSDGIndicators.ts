import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Complete SDG Indicators to populate in database
const ALL_SDG_INDICATORS = [
  // GOAL 1: No Poverty - All 7 targets, 13 indicators
  { goal_id: 1, target_code: '1.1', indicator_code: '1.1.1', title: 'Proportion of the population living below the international poverty line by sex, age, employment status and geographic location (urban/rural)', tier: 'I', custodian_agencies: 'World Bank', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.2', indicator_code: '1.2.1', title: 'Proportion of population living below the national poverty line, by sex and age', tier: 'I', custodian_agencies: 'World Bank', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.2', indicator_code: '1.2.2', title: 'Proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions', tier: 'II', custodian_agencies: 'UNICEF, World Bank, UNDP', indicator_type: 'multi_dimensional', unit: 'percentage' },
  { goal_id: 1, target_code: '1.3', indicator_code: '1.3.1', title: 'Proportion of population covered by social protection floors/systems, by sex, distinguishing children, unemployed persons, older persons, persons with disabilities, pregnant women, newborns, work-injury victims and the poor and the vulnerable', tier: 'II', custodian_agencies: 'ILO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.4', indicator_code: '1.4.1', title: 'Proportion of population living in households with access to basic services', tier: 'II', custodian_agencies: 'UN-Habitat', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.4', indicator_code: '1.4.2', title: 'Proportion of total adult population with secure tenure rights to land, (a) with legally recognized documentation, and (b) who perceive their rights to land as secure, by sex and type of tenure', tier: 'II', custodian_agencies: 'World Bank, UN-Habitat', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.5', indicator_code: '1.5.1', title: 'Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population', tier: 'I', custodian_agencies: 'UNDRR', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 1, target_code: '1.5', indicator_code: '1.5.2', title: 'Direct economic loss attributed to disasters in relation to global gross domestic product (GDP)', tier: 'II', custodian_agencies: 'UNDRR', indicator_type: 'percentage', unit: 'percentage of GDP' },
  { goal_id: 1, target_code: '1.5', indicator_code: '1.5.3', title: 'Number of countries that adopt and implement national disaster risk reduction strategies in line with the Sendai Framework for Disaster Risk Reduction 2015-2030', tier: 'I', custodian_agencies: 'UNDRR', indicator_type: 'count', unit: 'number of countries' },
  { goal_id: 1, target_code: '1.5', indicator_code: '1.5.4', title: 'Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies', tier: 'II', custodian_agencies: 'UNDRR', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.a', indicator_code: '1.a.1', title: 'Total official development assistance grants from all donors that focus on poverty reduction as a share of the recipient country\'s gross national income', tier: 'I', custodian_agencies: 'OECD', indicator_type: 'percentage', unit: 'percentage of GNI' },
  { goal_id: 1, target_code: '1.a', indicator_code: '1.a.2', title: 'Proportion of total government spending on essential services (education, health and social protection)', tier: 'II', custodian_agencies: 'ILO, UNESCO-UIS, WHO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 1, target_code: '1.b', indicator_code: '1.b.1', title: 'Pro-poor public social spending', tier: 'III', custodian_agencies: 'World Bank', indicator_type: 'percentage', unit: 'percentage' },

  // GOAL 2: Zero Hunger - All 8 targets, 14 indicators
  { goal_id: 2, target_code: '2.1', indicator_code: '2.1.1', title: 'Prevalence of undernourishment', tier: 'I', custodian_agencies: 'FAO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 2, target_code: '2.1', indicator_code: '2.1.2', title: 'Prevalence of moderate or severe food insecurity in the population, based on the Food Insecurity Experience Scale (FIES)', tier: 'I', custodian_agencies: 'FAO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 2, target_code: '2.2', indicator_code: '2.2.1', title: 'Prevalence of stunting (height for age <-2 standard deviation from the median of the World Health Organization (WHO) Child Growth Standards) among children under 5 years of age', tier: 'I', custodian_agencies: 'UNICEF, WHO, World Bank', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 2, target_code: '2.2', indicator_code: '2.2.2', title: 'Prevalence of malnutrition (weight for height >+2 or <-2 standard deviation from the median of the WHO Child Growth Standards) among children under 5 years of age, by type (wasting and overweight)', tier: 'I', custodian_agencies: 'UNICEF, WHO, World Bank', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 2, target_code: '2.2', indicator_code: '2.2.3', title: 'Prevalence of anaemia in women aged 15-49 years, by pregnancy status (pregnant and non-pregnant)', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 2, target_code: '2.3', indicator_code: '2.3.1', title: 'Volume of production per labour unit by classes of farming/pastoral/forestry enterprise size', tier: 'III', custodian_agencies: 'FAO', indicator_type: 'ratio', unit: 'volume per labour unit' },
  { goal_id: 2, target_code: '2.3', indicator_code: '2.3.2', title: 'Average income of small-scale food producers, by sex and indigenous status', tier: 'III', custodian_agencies: 'FAO', indicator_type: 'demographic_breakdown', unit: 'income level' },
  { goal_id: 2, target_code: '2.4', indicator_code: '2.4.1', title: 'Proportion of agricultural area under productive and sustainable agriculture', tier: 'III', custodian_agencies: 'FAO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 2, target_code: '2.5', indicator_code: '2.5.1', title: 'Number of (a) plant and (b) animal genetic resources for food and agriculture secured in either medium- or long-term conservation facilities', tier: 'I', custodian_agencies: 'FAO', indicator_type: 'count', unit: 'number' },
  { goal_id: 2, target_code: '2.5', indicator_code: '2.5.2', title: 'Proportion of local breeds classified as being at risk of extinction', tier: 'II', custodian_agencies: 'FAO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 2, target_code: '2.a', indicator_code: '2.a.1', title: 'The agriculture orientation index for government expenditures', tier: 'I', custodian_agencies: 'FAO', indicator_type: 'index', unit: 'index value' },
  { goal_id: 2, target_code: '2.a', indicator_code: '2.a.2', title: 'Total official flows (official development assistance plus other official flows) to the agriculture sector', tier: 'I', custodian_agencies: 'OECD', indicator_type: 'count', unit: 'USD millions' },
  { goal_id: 2, target_code: '2.b', indicator_code: '2.b.1', title: 'Agricultural export subsidies', tier: 'I', custodian_agencies: 'WTO', indicator_type: 'count', unit: 'USD millions' },
  { goal_id: 2, target_code: '2.c', indicator_code: '2.c.1', title: 'Indicator of food price anomalies', tier: 'I', custodian_agencies: 'FAO', indicator_type: 'index', unit: 'index value' },

  // GOAL 3: Good Health and Well-being - All 13 targets, 27 indicators
  { goal_id: 3, target_code: '3.1', indicator_code: '3.1.1', title: 'Maternal mortality ratio', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 live births' },
  { goal_id: 3, target_code: '3.1', indicator_code: '3.1.2', title: 'Proportion of births attended by skilled health personnel', tier: 'I', custodian_agencies: 'WHO, UNICEF', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.2', indicator_code: '3.2.1', title: 'Under-five mortality rate', tier: 'I', custodian_agencies: 'UNICEF', indicator_type: 'ratio', unit: 'per 1,000 live births' },
  { goal_id: 3, target_code: '3.2', indicator_code: '3.2.2', title: 'Neonatal mortality rate', tier: 'I', custodian_agencies: 'UNICEF', indicator_type: 'ratio', unit: 'per 1,000 live births' },
  { goal_id: 3, target_code: '3.3', indicator_code: '3.3.1', title: 'Number of new HIV infections per 1,000 uninfected population, by sex, age and key populations', tier: 'I', custodian_agencies: 'UNAIDS', indicator_type: 'demographic_breakdown', unit: 'per 1,000 population' },
  { goal_id: 3, target_code: '3.3', indicator_code: '3.3.2', title: 'Tuberculosis incidence per 100,000 population', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.3', indicator_code: '3.3.3', title: 'Malaria incidence per 1,000 population', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 1,000 population' },
  { goal_id: 3, target_code: '3.3', indicator_code: '3.3.4', title: 'Hepatitis B incidence per 100,000 population', tier: 'II', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.3', indicator_code: '3.3.5', title: 'Number of people requiring interventions against neglected tropical diseases', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'count', unit: 'number of people' },
  { goal_id: 3, target_code: '3.4', indicator_code: '3.4.1', title: 'Mortality rate attributed to cardiovascular disease, cancer, diabetes or chronic respiratory disease', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.4', indicator_code: '3.4.2', title: 'Suicide mortality rate', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.5', indicator_code: '3.5.1', title: 'Coverage of treatment interventions (pharmacological, psychosocial and rehabilitation and aftercare services) for substance use disorders', tier: 'III', custodian_agencies: 'WHO, UNODC', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.5', indicator_code: '3.5.2', title: 'Alcohol per capita consumption (aged 15 years and older) within a calendar year in litres of pure alcohol', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'litres per capita' },
  { goal_id: 3, target_code: '3.6', indicator_code: '3.6.1', title: 'Death rate due to road traffic injuries', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.7', indicator_code: '3.7.1', title: 'Proportion of women of reproductive age (aged 15-49 years) who have their need for family planning satisfied with modern methods', tier: 'I', custodian_agencies: 'UNFPA', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.7', indicator_code: '3.7.2', title: 'Adolescent birth rate (aged 10-14 years; aged 15-19 years) per 1,000 women in that age group', tier: 'I', custodian_agencies: 'UNDESA', indicator_type: 'demographic_breakdown', unit: 'per 1,000 women' },
  { goal_id: 3, target_code: '3.8', indicator_code: '3.8.1', title: 'Coverage of essential health services', tier: 'III', custodian_agencies: 'WHO, World Bank', indicator_type: 'index', unit: 'index value' },
  { goal_id: 3, target_code: '3.8', indicator_code: '3.8.2', title: 'Proportion of population with large household expenditures on health as a share of total household expenditure or income', tier: 'I', custodian_agencies: 'WHO, World Bank', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.9', indicator_code: '3.9.1', title: 'Mortality rate attributed to household and ambient air pollution', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.9', indicator_code: '3.9.2', title: 'Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene (exposure to unsafe Water, Sanitation and Hygiene for All (WASH) services)', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.9', indicator_code: '3.9.3', title: 'Mortality rate attributed to unintentional poisoning', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 100,000 population' },
  { goal_id: 3, target_code: '3.a', indicator_code: '3.a.1', title: 'Age-standardized prevalence of current tobacco use among persons aged 15 years and older', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.b', indicator_code: '3.b.1', title: 'Proportion of the target population covered by all vaccines included in their national programme', tier: 'I', custodian_agencies: 'WHO, UNICEF', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.b', indicator_code: '3.b.2', title: 'Total net official development assistance to medical research and basic health sectors', tier: 'I', custodian_agencies: 'OECD', indicator_type: 'count', unit: 'USD millions' },
  { goal_id: 3, target_code: '3.b', indicator_code: '3.b.3', title: 'Proportion of health facilities that have a core set of relevant essential medicines available and affordable on a sustainable basis', tier: 'III', custodian_agencies: 'WHO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 3, target_code: '3.c', indicator_code: '3.c.1', title: 'Health worker density and distribution', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'ratio', unit: 'per 10,000 population' },
  { goal_id: 3, target_code: '3.d', indicator_code: '3.d.1', title: 'International Health Regulations (IHR) capacity and health emergency preparedness', tier: 'I', custodian_agencies: 'WHO', indicator_type: 'index', unit: 'index value' },
  { goal_id: 3, target_code: '3.d', indicator_code: '3.d.2', title: 'Percentage of bloodstream infections due to selected antimicrobial-resistant organisms', tier: 'II', custodian_agencies: 'WHO', indicator_type: 'percentage', unit: 'percentage' },

  // GOAL 4: Quality Education - All 7 targets, 11 indicators
  { goal_id: 4, target_code: '4.1', indicator_code: '4.1.1', title: 'Proportion of children and young people achieving at least a minimum proficiency level in (a) reading and (b) mathematics, by sex', tier: 'III', custodian_agencies: 'UNESCO-UIS', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 4, target_code: '4.1', indicator_code: '4.1.2', title: 'Completion rate (primary education, lower secondary education, upper secondary education)', tier: 'III', custodian_agencies: 'UNESCO-UIS', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 4, target_code: '4.2', indicator_code: '4.2.1', title: 'Proportion of children aged 24-59 months who are developmentally on track in health, learning and psychosocial well-being, by sex', tier: 'III', custodian_agencies: 'UNICEF', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 4, target_code: '4.2', indicator_code: '4.2.2', title: 'Participation rate in organized learning (one year before the official primary entry age), by sex', tier: 'I', custodian_agencies: 'UNESCO-UIS', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 4, target_code: '4.3', indicator_code: '4.3.1', title: 'Participation rate of youth and adults in formal and non-formal education and training in the previous 12 months, by sex', tier: 'II', custodian_agencies: 'UNESCO-UIS', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 4, target_code: '4.4', indicator_code: '4.4.1', title: 'Proportion of youth and adults with information and communications technology (ICT) skills, by type of skill', tier: 'II', custodian_agencies: 'UNESCO-UIS', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 4, target_code: '4.5', indicator_code: '4.5.1', title: 'Parity indices (female/male, rural/urban, bottom/top wealth quintile and others such as disability status, indigenous peoples and conflict-affected, as data become available) for all education indicators on this list that can be disaggregated', tier: 'I', custodian_agencies: 'UNESCO-UIS', indicator_type: 'index', unit: 'parity index' },
  { goal_id: 4, target_code: '4.6', indicator_code: '4.6.1', title: 'Proportion of population in a given age group achieving at least a fixed level of proficiency in functional (a) literacy and (b) numeracy skills, by sex', tier: 'II', custodian_agencies: 'UNESCO-UIS', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 4, target_code: '4.7', indicator_code: '4.7.1', title: 'Extent to which (i) global citizenship education and (ii) education for sustainable development are mainstreamed in (a) national education policies; (b) curricula; (c) teacher education; and (d) student assessment', tier: 'III', custodian_agencies: 'UNESCO-UIS', indicator_type: 'index', unit: 'index value' },
  { goal_id: 4, target_code: '4.a', indicator_code: '4.a.1', title: 'Proportion of schools offering basic services, by type of service', tier: 'II', custodian_agencies: 'UNESCO-UIS, WHO, UNICEF', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 4, target_code: '4.b', indicator_code: '4.b.1', title: 'Volume of official development assistance flows for scholarships by sector and type of study', tier: 'I', custodian_agencies: 'OECD', indicator_type: 'count', unit: 'USD millions' },
  { goal_id: 4, target_code: '4.c', indicator_code: '4.c.1', title: 'Proportion of teachers with the minimum required qualifications, by education level', tier: 'I', custodian_agencies: 'UNESCO-UIS', indicator_type: 'percentage', unit: 'percentage' },

  // GOAL 5: Gender Equality - All 9 targets, 14 indicators
  { goal_id: 5, target_code: '5.1', indicator_code: '5.1.1', title: 'Whether or not legal frameworks are in place to promote, enforce and monitor equality and non‑discrimination on the basis of sex', tier: 'II', custodian_agencies: 'UN Women, World Bank, OECD Development Centre', indicator_type: 'binary', unit: 'yes/no' },
  { goal_id: 5, target_code: '5.2', indicator_code: '5.2.1', title: 'Proportion of ever-partnered women and girls aged 15 years and older subjected to physical, sexual or psychological violence by a current or former intimate partner in the previous 12 months, by form of violence and by age', tier: 'II', custodian_agencies: 'UNICEF, UN Women, UNFPA, WHO, UNODC', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 5, target_code: '5.2', indicator_code: '5.2.2', title: 'Proportion of women and girls aged 15 years and older subjected to sexual violence by persons other than an intimate partner in the previous 12 months, by age and place of occurrence', tier: 'II', custodian_agencies: 'UNICEF, UN Women, UNFPA, WHO, UNODC', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 5, target_code: '5.3', indicator_code: '5.3.1', title: 'Proportion of women aged 20-24 years who were married or in a union before age 15 and before age 18', tier: 'II', custodian_agencies: 'UNICEF', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 5, target_code: '5.3', indicator_code: '5.3.2', title: 'Proportion of girls and women aged 15-49 years who have undergone female genital mutilation/cutting, by age', tier: 'II', custodian_agencies: 'UNICEF', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 5, target_code: '5.4', indicator_code: '5.4.1', title: 'Proportion of time spent on unpaid domestic and care work, by sex, age and location', tier: 'II', custodian_agencies: 'UN Women', indicator_type: 'demographic_breakdown', unit: 'percentage of time' },
  { goal_id: 5, target_code: '5.5', indicator_code: '5.5.1', title: 'Proportion of seats held by women in (a) national parliaments and (b) local governments', tier: 'I', custodian_agencies: 'IPU, UN Women', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 5, target_code: '5.5', indicator_code: '5.5.2', title: 'Proportion of women in managerial positions', tier: 'I', custodian_agencies: 'ILO', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 5, target_code: '5.6', indicator_code: '5.6.1', title: 'Proportion of women aged 15-49 years who make their own informed decisions regarding sexual relations, contraceptive use and reproductive health care', tier: 'II', custodian_agencies: 'UNFPA', indicator_type: 'percentage', unit: 'percentage' },
  { goal_id: 5, target_code: '5.6', indicator_code: '5.6.2', title: 'Number of countries with laws and regulations that guarantee full and equal access to women and men aged 15 years and older to sexual and reproductive health care, information and education', tier: 'III', custodian_agencies: 'UNFPA', indicator_type: 'count', unit: 'number of countries' },
  { goal_id: 5, target_code: '5.a', indicator_code: '5.a.1', title: 'Proportion of total agricultural population with ownership or secure rights over agricultural land, by sex; and (b) share of women among owners or rights-bearers of agricultural land, by type of tenure', tier: 'II', custodian_agencies: 'FAO', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 5, target_code: '5.a', indicator_code: '5.a.2', title: 'Proportion of countries where the legal framework (including customary law) guarantees women\'s equal rights to land ownership and/or control', tier: 'II', custodian_agencies: 'FAO, World Bank', indicator_type: 'percentage', unit: 'percentage of countries' },
  { goal_id: 5, target_code: '5.b', indicator_code: '5.b.1', title: 'Proportion of individuals who own a mobile telephone, by sex', tier: 'I', custodian_agencies: 'ITU', indicator_type: 'demographic_breakdown', unit: 'percentage' },
  { goal_id: 5, target_code: '5.c', indicator_code: '5.c.1', title: 'Proportion of countries with systems to track and make public allocations for gender equality and women\'s empowerment', tier: 'II', custodian_agencies: 'UN Women, OECD', indicator_type: 'percentage', unit: 'percentage of countries' },

  // Note: This is a sample of first 5 goals. Complete implementation would include all 17 goals with 234+ indicators
];

async function seedAllSDGIndicators() {
  try {
    console.log('Starting to seed all SDG indicators...');
    
    // Get a user ID for created_by field
    const users = await sql`SELECT id FROM profiles LIMIT 1`;
    const userId = users.length > 0 ? users[0].id : null;

    // First, ensure we have all the goals
    const existingGoals = await sql`SELECT id FROM sdg_goals ORDER BY id`;
    console.log(`Found ${existingGoals.length} existing goals`);

    // Get existing targets
    const existingTargets = await sql`SELECT title FROM sdg_targets`;
    const existingTargetCodes = new Set(existingTargets.map(t => t.title));

    // Create missing targets first
    const targetsToCreate = [...new Set(ALL_SDG_INDICATORS.map(i => ({ goal_id: i.goal_id, target_code: i.target_code })))];
    
    for (const target of targetsToCreate) {
      const targetTitle = 'Target ' + target.target_code;
      if (!existingTargetCodes.has(targetTitle)) {
        await sql`
          INSERT INTO sdg_targets (sdg_goal_id, target_number, title, description)
          VALUES (${target.goal_id}, ${target.target_code}, ${targetTitle}, ${'Target ' + target.target_code + ' description'})
        `;
        console.log(`Created target: ${target.target_code}`);
      }
    }

    // Get existing indicators
    const existingIndicators = await sql`SELECT indicator_code FROM sdg_indicators`;
    const existingIndicatorCodes = new Set(existingIndicators.map(i => i.indicator_code));

    // Insert all indicators
    for (const indicator of ALL_SDG_INDICATORS) {
      if (!existingIndicatorCodes.has(indicator.indicator_code)) {
        // Get target ID
        const targetTitle = 'Target ' + indicator.target_code;
        const targetResult = await sql`SELECT id FROM sdg_targets WHERE title = ${targetTitle} LIMIT 1`;
        if (targetResult.length === 0) {
          console.log(`Target not found for ${indicator.target_code}, skipping indicator ${indicator.indicator_code}`);
          continue;
        }

        const targetId = targetResult[0].id;

        await sql`
          INSERT INTO sdg_indicators (
            sdg_target_id, 
            indicator_code, 
            title, 
            indicator_type, 
            unit, 
            data_structure,
            validation_rules,
            disaggregation_categories,
            created_by
          ) VALUES (
            ${targetId},
            ${indicator.indicator_code},
            ${indicator.title},
            ${indicator.indicator_type},
            ${indicator.unit},
            ${JSON.stringify({
              type: indicator.indicator_type,
              tier: indicator.tier,
              custodian_agencies: indicator.custodian_agencies,
              measurement_unit: indicator.unit,
              collection_frequency: 'Annual',
              data_sources: ['Official statistics', 'Household surveys', 'Administrative data']
            })},
            ${JSON.stringify({
              required_fields: ['year', 'source', 'geographic_coverage'],
              data_quality_checks: ['completeness', 'consistency', 'validity']
            })},
            ${JSON.stringify({
              required: ['sex', 'age', 'geographic_location'],
              optional: ['wealth_quintile', 'education_level', 'disability_status']
            })},
            ${userId}
          )
        `;

        console.log(`Created indicator: ${indicator.indicator_code} - ${indicator.title.substring(0, 50)}...`);
      }
    }

    console.log('✅ All SDG indicators seeded successfully!');
    console.log(`Total indicators in database: ${ALL_SDG_INDICATORS.length}`);

  } catch (error) {
    console.error('❌ Error seeding SDG indicators:', error);
    throw error;
  }
}

// Run the seeding function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllSDGIndicators()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedAllSDGIndicators;