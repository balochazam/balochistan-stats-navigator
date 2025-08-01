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

// Complete 169 UN SDG Targets - Official Framework 2030
const sdgTargetsData = [
  // SDG 1: No Poverty (7 targets)
  { target_number: "1.1", sdg_goal_id: 1, title: "Eradicate extreme poverty", description: "By 2030, eradicate extreme poverty for all people everywhere, currently measured as people living on less than $1.25 a day" },
  { target_number: "1.2", sdg_goal_id: 1, title: "Reduce poverty by half", description: "By 2030, reduce at least by half the proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions" },
  { target_number: "1.3", sdg_goal_id: 1, title: "Social protection systems", description: "Implement nationally appropriate social protection systems and measures for all, including floors, and by 2030 achieve substantial coverage of the poor and the vulnerable" },
  { target_number: "1.4", sdg_goal_id: 1, title: "Equal access to basic services", description: "By 2030, ensure that all men and women, in particular the poor and the vulnerable, have equal rights to economic resources, as well as access to basic services, ownership and control over land and other forms of property, inheritance, natural resources, appropriate new technology and financial services, including microfinance" },
  { target_number: "1.5", sdg_goal_id: 1, title: "Resilience to disasters", description: "By 2030, build the resilience of the poor and those in vulnerable situations and reduce their exposure and vulnerability to climate-related extreme events and other economic, social and environmental shocks and disasters" },
  { target_number: "1.a", sdg_goal_id: 1, title: "Resource mobilization", description: "Ensure significant mobilization of resources from a variety of sources, including through enhanced development cooperation, in order to provide adequate and predictable means for developing countries, in particular least developed countries, to implement programmes and policies to end poverty in all its dimensions" },
  { target_number: "1.b", sdg_goal_id: 1, title: "Policy frameworks", description: "Create sound policy frameworks at the national, regional and international levels, based on pro-poor and gender-sensitive development strategies, to support accelerated investment in poverty eradication actions" },

  // SDG 2: Zero Hunger (8 targets)
  { target_number: "2.1", sdg_goal_id: 2, title: "End hunger", description: "By 2030, end hunger and ensure access by all people, in particular the poor and people in vulnerable situations, including infants, to safe, nutritious and sufficient food all year round" },
  { target_number: "2.2", sdg_goal_id: 2, title: "End malnutrition", description: "By 2030, end all forms of malnutrition, including achieving, by 2025, the internationally agreed targets on stunting and wasting in children under 5 years of age, and address the nutritional needs of adolescent girls, pregnant and lactating women and older persons" },
  { target_number: "2.3", sdg_goal_id: 2, title: "Double agricultural productivity", description: "By 2030, double the agricultural productivity and incomes of small-scale food producers, in particular women, indigenous peoples, family farmers, pastoralists and fishers, including through secure and equal access to land, other productive resources and inputs, knowledge, financial services, markets and opportunities for value addition and non-farm employment" },
  { target_number: "2.4", sdg_goal_id: 2, title: "Sustainable food production", description: "By 2030, ensure sustainable food production systems and implement resilient agricultural practices that increase productivity and production, that help maintain ecosystems, that strengthen capacity for adaptation to climate change, extreme weather, drought, flooding and other disasters and that progressively improve land and soil quality" },
  { target_number: "2.5", sdg_goal_id: 2, title: "Maintain genetic diversity", description: "By 2020, maintain the genetic diversity of seeds, cultivated plants and farmed and domesticated animals and their related wild species, including through soundly managed and diversified seed and plant banks at the national, regional and international levels, and promote access to and fair and equitable sharing of benefits arising from the utilization of genetic resources and associated traditional knowledge, as internationally agreed" },
  { target_number: "2.a", sdg_goal_id: 2, title: "Increase agricultural investment", description: "Increase investment, including through enhanced international cooperation, in rural infrastructure, agricultural research and extension services, technology development and plant and livestock gene banks in order to enhance agricultural productive capacity in developing countries, in particular least developed countries" },
  { target_number: "2.b", sdg_goal_id: 2, title: "Correct trade restrictions", description: "Correct and prevent trade restrictions and distortions in world agricultural markets, including through the parallel elimination of all forms of agricultural export subsidies and all export measures with equivalent effect, in accordance with the mandate of the Doha Development Round" },
  { target_number: "2.c", sdg_goal_id: 2, title: "Food commodity markets", description: "Adopt measures to ensure the proper functioning of food commodity markets and their derivatives and facilitate timely access to market information, including on food reserves, in order to help limit extreme food price volatility" },

  // SDG 3: Good Health and Well-being (13 targets)
  { target_number: "3.1", sdg_goal_id: 3, title: "Reduce maternal mortality", description: "By 2030, reduce the global maternal mortality ratio to less than 70 per 100,000 live births" },
  { target_number: "3.2", sdg_goal_id: 3, title: "End preventable deaths of children", description: "By 2030, end preventable deaths of newborns and children under 5 years of age, with all countries aiming to reduce neonatal mortality to at least as low as 12 per 1,000 live births and under‑5 mortality to at least as low as 25 per 1,000 live births" },
  { target_number: "3.3", sdg_goal_id: 3, title: "End epidemics", description: "By 2030, end the epidemics of AIDS, tuberculosis, malaria and neglected tropical diseases and combat hepatitis, water-borne diseases and other communicable diseases" },
  { target_number: "3.4", sdg_goal_id: 3, title: "Reduce non-communicable diseases", description: "By 2030, reduce by one third premature mortality from non-communicable diseases through prevention and treatment and promote mental health and well-being" },
  { target_number: "3.5", sdg_goal_id: 3, title: "Strengthen substance abuse prevention", description: "Strengthen the prevention and treatment of substance abuse, including narcotic drug abuse and harmful use of alcohol" },
  { target_number: "3.6", sdg_goal_id: 3, title: "Halve road traffic deaths", description: "By 2020, halve the number of global deaths and injuries from road traffic accidents" },
  { target_number: "3.7", sdg_goal_id: 3, title: "Universal reproductive health", description: "By 2030, ensure universal access to sexual and reproductive health-care services, including for family planning, information and education, and the integration of reproductive health into national strategies and programmes" },
  { target_number: "3.8", sdg_goal_id: 3, title: "Universal health coverage", description: "Achieve universal health coverage, including financial risk protection, access to quality essential health-care services and access to safe, effective, quality and affordable essential medicines and vaccines for all" },
  { target_number: "3.9", sdg_goal_id: 3, title: "Reduce pollution deaths", description: "By 2030, substantially reduce the number of deaths and illnesses from hazardous chemicals and air, water and soil pollution and contamination" },
  { target_number: "3.a", sdg_goal_id: 3, title: "Tobacco control", description: "Strengthen the implementation of the World Health Organization Framework Convention on Tobacco Control in all countries, as appropriate" },
  { target_number: "3.b", sdg_goal_id: 3, title: "Support vaccine research", description: "Support the research and development of vaccines and medicines for the communicable and non‑communicable diseases that primarily affect developing countries, provide access to affordable essential medicines and vaccines, in accordance with the Doha Declaration on the TRIPS Agreement and Public Health" },
  { target_number: "3.c", sdg_goal_id: 3, title: "Increase health financing", description: "Substantially increase health financing and the recruitment, development, training and retention of the health workforce in developing countries, especially in least developed countries and small island developing States" },
  { target_number: "3.d", sdg_goal_id: 3, title: "Strengthen health risk management", description: "Strengthen the capacity of all countries, in particular developing countries, for early warning, risk reduction and management of national and global health risks" },

  // SDG 4: Quality Education (10 targets)
  { target_number: "4.1", sdg_goal_id: 4, title: "Free primary and secondary education", description: "By 2030, ensure that all girls and boys complete free, equitable and quality primary and secondary education leading to relevant and effective learning outcomes" },
  { target_number: "4.2", sdg_goal_id: 4, title: "Early childhood development", description: "By 2030, ensure that all girls and boys have access to quality early childhood development, care and pre‑primary education so that they are ready for primary education" },
  { target_number: "4.3", sdg_goal_id: 4, title: "Equal access to technical/vocational education", description: "By 2030, ensure equal access for all women and men to affordable and quality technical, vocational and tertiary education, including university" },
  { target_number: "4.4", sdg_goal_id: 4, title: "Increase relevant skills for employment", description: "By 2030, substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs and entrepreneurship" },
  { target_number: "4.5", sdg_goal_id: 4, title: "Eliminate gender disparities", description: "By 2030, eliminate gender disparities in education and ensure equal access to all levels of education and vocational training for the vulnerable, including persons with disabilities, indigenous peoples and children in vulnerable situations" },
  { target_number: "4.6", sdg_goal_id: 4, title: "Adult literacy and numeracy", description: "By 2030, ensure that all youth and a substantial proportion of adults, both men and women, achieve literacy and numeracy" },
  { target_number: "4.7", sdg_goal_id: 4, title: "Education for sustainable development", description: "By 2030, ensure that all learners acquire the knowledge and skills needed to promote sustainable development, including, among others, through education for sustainable development and sustainable lifestyles, human rights, gender equality, promotion of a culture of peace and non-violence, global citizenship and appreciation of cultural diversity" },
  { target_number: "4.a", sdg_goal_id: 4, title: "Build and upgrade education facilities", description: "Build and upgrade education facilities that are child, disability and gender sensitive and provide safe, non-violent, inclusive and effective learning environments for all" },
  { target_number: "4.b", sdg_goal_id: 4, title: "Expand higher education scholarships", description: "By 2020, substantially expand globally the number of scholarships available to developing countries, in particular least developed countries, small island developing States and African countries, for enrolment in higher education" },
  { target_number: "4.c", sdg_goal_id: 4, title: "Increase supply of qualified teachers", description: "By 2030, substantially increase the supply of qualified teachers, including through international cooperation for teacher training in developing countries, especially least developed countries and small island developing States" },

  // SDG 5: Gender Equality (9 targets)
  { target_number: "5.1", sdg_goal_id: 5, title: "End discrimination against women", description: "End all forms of discrimination against all women and girls everywhere" },
  { target_number: "5.2", sdg_goal_id: 5, title: "Eliminate violence against women", description: "Eliminate all forms of violence against all women and girls in the public and private spheres, including trafficking and sexual and other types of exploitation" },
  { target_number: "5.3", sdg_goal_id: 5, title: "Eliminate harmful practices", description: "Eliminate all harmful practices, such as child, early and forced marriage and female genital mutilation" },
  { target_number: "5.4", sdg_goal_id: 5, title: "Value unpaid care work", description: "Recognize and value unpaid care and domestic work through the provision of public services, infrastructure and social protection policies and the promotion of shared responsibility within the household and the family as nationally appropriate" },
  { target_number: "5.5", sdg_goal_id: 5, title: "Ensure full participation in leadership", description: "Ensure women's full and effective participation and equal opportunities for leadership at all levels of decision-making in political, economic and public life" },
  { target_number: "5.6", sdg_goal_id: 5, title: "Universal access to reproductive rights", description: "Ensure universal access to sexual and reproductive health and reproductive rights as agreed in accordance with the Programme of Action of the International Conference on Population and Development and the Beijing Platform for Action" },
  { target_number: "5.a", sdg_goal_id: 5, title: "Equal rights to economic resources", description: "Undertake reforms to give women equal rights to economic resources, as well as access to ownership and control over land and other forms of property, financial services, inheritance and natural resources, in accordance with national laws" },
  { target_number: "5.b", sdg_goal_id: 5, title: "Enhance use of enabling technology", description: "Enhance the use of enabling technology, in particular information and communications technology, to promote the empowerment of women" },
  { target_number: "5.c", sdg_goal_id: 5, title: "Adopt policies for gender equality", description: "Adopt and strengthen sound policies and enforceable legislation for the promotion of gender equality and the empowerment of all women and girls at all levels" },

  // SDG 6: Clean Water and Sanitation (8 targets)
  { target_number: "6.1", sdg_goal_id: 6, title: "Safe and affordable drinking water", description: "By 2030, achieve universal and equitable access to safe and affordable drinking water for all" },
  { target_number: "6.2", sdg_goal_id: 6, title: "Adequate sanitation and hygiene", description: "By 2030, achieve access to adequate and equitable sanitation and hygiene for all and end open defecation, paying special attention to the needs of women and girls and those in vulnerable situations" },
  { target_number: "6.3", sdg_goal_id: 6, title: "Improve water quality", description: "By 2030, improve water quality by reducing pollution, eliminating dumping and minimizing release of hazardous chemicals and materials, halving the proportion of untreated wastewater and substantially increasing recycling and safe reuse globally" },
  { target_number: "6.4", sdg_goal_id: 6, title: "Increase water-use efficiency", description: "By 2030, substantially increase water-use efficiency across all sectors and ensure sustainable withdrawals and supply of freshwater to address water scarcity and substantially reduce the number of people suffering from water scarcity" },
  { target_number: "6.5", sdg_goal_id: 6, title: "Integrated water resources management", description: "By 2030, implement integrated water resources management at all levels, including through transboundary cooperation as appropriate" },
  { target_number: "6.6", sdg_goal_id: 6, title: "Protect water-related ecosystems", description: "By 2020, protect and restore water-related ecosystems, including mountains, forests, wetlands, rivers, aquifers and lakes" },
  { target_number: "6.a", sdg_goal_id: 6, title: "Expand water cooperation", description: "By 2030, expand international cooperation and capacity-building support to developing countries in water- and sanitation-related activities and programmes, including water harvesting, desalination, water efficiency, wastewater treatment, recycling and reuse technologies" },
  { target_number: "6.b", sdg_goal_id: 6, title: "Support local participation", description: "Support and strengthen the participation of local communities in improving water and sanitation management" },

  // SDG 7: Affordable and Clean Energy (5 targets)
  { target_number: "7.1", sdg_goal_id: 7, title: "Universal access to modern energy", description: "By 2030, ensure universal access to affordable, reliable and modern energy services" },
  { target_number: "7.2", sdg_goal_id: 7, title: "Increase renewable energy", description: "By 2030, increase substantially the share of renewable energy in the global energy mix" },
  { target_number: "7.3", sdg_goal_id: 7, title: "Double energy efficiency", description: "By 2030, double the global rate of improvement in energy efficiency" },
  { target_number: "7.a", sdg_goal_id: 7, title: "Enhance energy cooperation", description: "By 2030, enhance international cooperation to facilitate access to clean energy research and technology, including renewable energy, energy efficiency and advanced and cleaner fossil-fuel technology, and promote investment in energy infrastructure and clean energy technology" },
  { target_number: "7.b", sdg_goal_id: 7, title: "Expand energy infrastructure", description: "By 2030, expand infrastructure and upgrade technology for supplying modern and sustainable energy services for all in developing countries, in particular least developed countries, small island developing States, and land-locked developing countries, in accordance with their respective programmes of support" },

  // SDG 8: Decent Work and Economic Growth (12 targets)
  { target_number: "8.1", sdg_goal_id: 8, title: "Sustain economic growth", description: "Sustain per capita economic growth in accordance with national circumstances and, in particular, at least 7 per cent gross domestic product growth per annum in the least developed countries" },
  { target_number: "8.2", sdg_goal_id: 8, title: "Economic productivity through diversification", description: "Achieve higher levels of economic productivity through diversification, technological upgrading and innovation, including through a focus on high-value added and labour-intensive sectors" },
  { target_number: "8.3", sdg_goal_id: 8, title: "Promote development-oriented policies", description: "Promote development-oriented policies that support productive activities, decent job creation, entrepreneurship, creativity and innovation, and encourage the formalization and growth of micro-, small- and medium-sized enterprises, including through access to financial services" },
  { target_number: "8.4", sdg_goal_id: 8, title: "Improve resource efficiency", description: "Improve progressively, through 2030, global resource efficiency in consumption and production and endeavour to decouple economic growth from environmental degradation, in accordance with the 10-year framework of programmes on sustainable consumption and production, with developed countries taking the lead" },
  { target_number: "8.5", sdg_goal_id: 8, title: "Full employment and decent work", description: "By 2030, achieve full and productive employment and decent work for all women and men, including for young people and persons with disabilities, and equal pay for work of equal value" },
  { target_number: "8.6", sdg_goal_id: 8, title: "Reduce youth NEET", description: "By 2020, substantially reduce the proportion of youth not in employment, education or training" },
  { target_number: "8.7", sdg_goal_id: 8, title: "Eradicate forced labour", description: "Take immediate and effective measures to eradicate forced labour, end modern slavery and human trafficking and secure the prohibition and elimination of the worst forms of child labour, including recruitment and use of child soldiers, and by 2025 end child labour in all its forms" },
  { target_number: "8.8", sdg_goal_id: 8, title: "Protect labour rights", description: "Protect labour rights and promote safe and secure working environments for all workers, including migrant workers, in particular women migrants, and those in precarious employment" },
  { target_number: "8.9", sdg_goal_id: 8, title: "Promote sustainable tourism", description: "By 2030, devise and implement policies to promote sustainable tourism that creates jobs and promotes local culture and products" },
  { target_number: "8.10", sdg_goal_id: 8, title: "Strengthen financial institutions", description: "Strengthen the capacity of domestic financial institutions to encourage and expand access to banking, insurance and financial services for all" },
  { target_number: "8.a", sdg_goal_id: 8, title: "Increase Aid for Trade", description: "Increase Aid for Trade support for developing countries, in particular least developed countries, including through the Enhanced Integrated Framework for Trade-Related Technical Assistance to Least Developed Countries" },
  { target_number: "8.b", sdg_goal_id: 8, title: "Youth employment strategy", description: "By 2020, develop and operationalize a global strategy for youth employment and implement the Global Jobs Pact of the International Labour Organization" },

  // SDG 9: Industry, Innovation and Infrastructure (8 targets)
  { target_number: "9.1", sdg_goal_id: 9, title: "Develop resilient infrastructure", description: "Develop quality, reliable, sustainable and resilient infrastructure, including regional and transborder infrastructure, to support economic development and human well-being, with a focus on affordable and equitable access for all" },
  { target_number: "9.2", sdg_goal_id: 9, title: "Promote inclusive industrialization", description: "Promote inclusive and sustainable industrialization and, by 2030, significantly raise industry's share of employment and gross domestic product, in line with national circumstances, and double its share in least developed countries" },
  { target_number: "9.3", sdg_goal_id: 9, title: "Increase access to financial services", description: "Increase the access of small-scale industrial and other enterprises, in particular in developing countries, to financial services, including affordable credit, and their integration into value chains and markets" },
  { target_number: "9.4", sdg_goal_id: 9, title: "Upgrade infrastructure for sustainability", description: "By 2030, upgrade infrastructure and retrofit industries to make them sustainable, with increased resource-use efficiency and greater adoption of clean and environmentally sound technologies and industrial processes, with all countries taking action in accordance with their respective capabilities" },
  { target_number: "9.5", sdg_goal_id: 9, title: "Enhance scientific research", description: "Enhance scientific research, upgrade the technological capabilities of industrial sectors in all countries, in particular developing countries, including, by 2030, encouraging innovation and substantially increasing the number of research and development workers per 1 million people and public and private research and development spending" },
  { target_number: "9.a", sdg_goal_id: 9, title: "Facilitate sustainable infrastructure", description: "Facilitate sustainable and resilient infrastructure development in developing countries through enhanced financial, technological and technical support to African countries, least developed countries, landlocked developing countries and small island developing States" },
  { target_number: "9.b", sdg_goal_id: 9, title: "Support technology development", description: "Support domestic technology development, research and innovation in developing countries, including by ensuring a conducive policy environment for, inter alia, industrial diversification and value addition to commodities" },
  { target_number: "9.c", sdg_goal_id: 9, title: "Increase access to ICT", description: "Significantly increase access to information and communications technology and strive to provide universal and affordable access to the Internet in least developed countries by 2020" },

  // SDG 10: Reduced Inequalities (10 targets)
  { target_number: "10.1", sdg_goal_id: 10, title: "Reduce income inequalities", description: "By 2030, progressively achieve and sustain income growth of the bottom 40 per cent of the population at a rate higher than the national average" },
  { target_number: "10.2", sdg_goal_id: 10, title: "Promote universal social inclusion", description: "By 2030, empower and promote the social, economic and political inclusion of all, irrespective of age, sex, disability, race, ethnicity, origin, religion or economic or other status" },
  { target_number: "10.3", sdg_goal_id: 10, title: "Ensure equal opportunity", description: "Ensure equal opportunity and reduce inequalities of outcome, including by eliminating discriminatory laws, policies and practices and promoting appropriate legislation, policies and action in this regard" },
  { target_number: "10.4", sdg_goal_id: 10, title: "Adopt fiscal and social policies", description: "Adopt policies, especially fiscal, wage and social protection policies, and progressively achieve greater equality" },
  { target_number: "10.5", sdg_goal_id: 10, title: "Improve regulation of financial markets", description: "Improve the regulation and monitoring of global financial markets and institutions and strengthen the implementation of such regulations" },
  { target_number: "10.6", sdg_goal_id: 10, title: "Enhanced representation for developing countries", description: "Ensure enhanced representation and voice for developing countries in decision-making in global international economic and financial institutions in order to deliver more effective, credible, accountable and legitimate institutions" },
  { target_number: "10.7", sdg_goal_id: 10, title: "Facilitate safe migration", description: "Facilitate orderly, safe, regular and responsible migration and mobility of people, including through the implementation of planned and well-managed migration policies" },
  { target_number: "10.a", sdg_goal_id: 10, title: "Special treatment for least developed countries", description: "Implement the principle of special and differential treatment for developing countries, in particular least developed countries, in accordance with World Trade Organization agreements" },
  { target_number: "10.b", sdg_goal_id: 10, title: "Encourage development assistance", description: "Encourage official development assistance and financial flows, including foreign direct investment, to States where the need is greatest, in particular least developed countries, African countries, small island developing States and landlocked developing countries, in accordance with their national plans and programmes" },
  { target_number: "10.c", sdg_goal_id: 10, title: "Reduce transaction costs of remittances", description: "By 2030, reduce to less than 3 per cent the transaction costs of migrant remittances and eliminate remittance corridors with costs higher than 5 per cent" },

  // SDG 11: Sustainable Cities and Communities (10 targets)
  { target_number: "11.1", sdg_goal_id: 11, title: "Safe and affordable housing", description: "By 2030, ensure access for all to adequate, safe and affordable housing and basic services and upgrade slums" },
  { target_number: "11.2", sdg_goal_id: 11, title: "Sustainable transport systems", description: "By 2030, provide access to safe, affordable, accessible and sustainable transport systems for all, improving road safety, notably by expanding public transport, with special attention to the needs of those in vulnerable situations, women, children, persons with disabilities and older persons" },
  { target_number: "11.3", sdg_goal_id: 11, title: "Inclusive urbanization", description: "By 2030, enhance inclusive and sustainable urbanization and capacity for participatory, integrated and sustainable human settlement planning and management in all countries" },
  { target_number: "11.4", sdg_goal_id: 11, title: "Protect cultural heritage", description: "Strengthen efforts to protect and safeguard the world's cultural and natural heritage" },
  { target_number: "11.5", sdg_goal_id: 11, title: "Reduce disaster losses", description: "By 2030, significantly reduce the number of deaths and the number of people affected and substantially decrease the direct economic losses relative to global gross domestic product caused by disasters, including water-related disasters, with a focus on protecting the poor and people in vulnerable situations" },
  { target_number: "11.6", sdg_goal_id: 11, title: "Reduce environmental impact of cities", description: "By 2030, reduce the adverse per capita environmental impact of cities, including by paying special attention to air quality and municipal and other waste management" },
  { target_number: "11.7", sdg_goal_id: 11, title: "Provide access to safe spaces", description: "By 2030, provide universal access to safe, inclusive and accessible, green and public spaces, in particular for women and children, older persons and persons with disabilities" },
  { target_number: "11.a", sdg_goal_id: 11, title: "Support positive urban-rural linkages", description: "Support positive economic, social and environmental links between urban, peri-urban and rural areas by strengthening national and regional development planning" },
  { target_number: "11.b", sdg_goal_id: 11, title: "Implement integrated policies", description: "By 2020, substantially increase the number of cities and human settlements adopting and implementing integrated policies and plans towards inclusion, resource efficiency, mitigation and adaptation to climate change, resilience to disasters, and develop and implement, in line with the Sendai Framework for Disaster Risk Reduction 2015-2030, holistic disaster risk management at all levels" },
  { target_number: "11.c", sdg_goal_id: 11, title: "Support least developed countries", description: "Support least developed countries, including through financial and technical assistance, in building sustainable and resilient buildings utilizing local materials" },

  // SDG 12: Responsible Consumption and Production (11 targets)
  { target_number: "12.1", sdg_goal_id: 12, title: "Implement sustainable consumption patterns", description: "Implement the 10-year framework of programmes on sustainable consumption and production, all countries taking action, with developed countries taking the lead, taking into account the development and capabilities of developing countries" },
  { target_number: "12.2", sdg_goal_id: 12, title: "Sustainable management of natural resources", description: "By 2030, achieve the sustainable management and efficient use of natural resources" },
  { target_number: "12.3", sdg_goal_id: 12, title: "Halve food waste", description: "By 2030, halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains, including post-harvest losses" },
  { target_number: "12.4", sdg_goal_id: 12, title: "Responsible management of chemicals", description: "By 2020, achieve the environmentally sound management of chemicals and all wastes throughout their life cycle, in accordance with agreed international frameworks, and significantly reduce their release to air, water and soil in order to minimize their adverse impacts on human health and the environment" },
  { target_number: "12.5", sdg_goal_id: 12, title: "Reduce waste generation", description: "By 2030, substantially reduce waste generation through prevention, reduction, recycling and reuse" },
  { target_number: "12.6", sdg_goal_id: 12, title: "Encourage sustainable practices", description: "Encourage companies, especially large and transnational companies, to adopt sustainable practices and to integrate sustainability information into their reporting cycle" },
  { target_number: "12.7", sdg_goal_id: 12, title: "Promote sustainable procurement", description: "Promote public procurement practices that are sustainable, in accordance with national policies and priorities" },
  { target_number: "12.8", sdg_goal_id: 12, title: "Promote awareness of sustainable development", description: "By 2030, ensure that people everywhere have the relevant information and awareness for sustainable development and lifestyles in harmony with nature" },
  { target_number: "12.a", sdg_goal_id: 12, title: "Support developing countries' scientific capacity", description: "Support developing countries to strengthen their scientific and technological capacity to move towards more sustainable patterns of consumption and production" },
  { target_number: "12.b", sdg_goal_id: 12, title: "Develop sustainable tourism tools", description: "Develop and implement tools to monitor sustainable development impacts for sustainable tourism that creates jobs and promotes local culture and products" },
  { target_number: "12.c", sdg_goal_id: 12, title: "Remove market distortions in fossil fuels", description: "Rationalize inefficient fossil-fuel subsidies that encourage wasteful consumption by removing market distortions, in accordance with national circumstances, including by restructuring taxation and phasing out those harmful subsidies, where they exist, to reflect their environmental impacts, taking fully into account the specific needs and conditions of developing countries and minimizing the possible adverse impacts on their development in a manner that protects the poor and the affected communities" },

  // SDG 13: Climate Action (5 targets)
  { target_number: "13.1", sdg_goal_id: 13, title: "Strengthen resilience to climate hazards", description: "Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters in all countries" },
  { target_number: "13.2", sdg_goal_id: 13, title: "Integrate climate measures", description: "Integrate climate change measures into national policies, strategies and planning" },
  { target_number: "13.3", sdg_goal_id: 13, title: "Improve education on climate change", description: "Improve education, awareness-raising and human and institutional capacity on climate change mitigation, adaptation, impact reduction and early warning" },
  { target_number: "13.a", sdg_goal_id: 13, title: "Implement climate finance commitment", description: "Implement the commitment undertaken by developed-country parties to the United Nations Framework Convention on Climate Change to a goal of mobilizing jointly $100 billion annually by 2020 from all sources to address the needs of developing countries in the context of meaningful mitigation actions and transparency on implementation and fully operationalize the Green Climate Fund through its capitalization as soon as possible" },
  { target_number: "13.b", sdg_goal_id: 13, title: "Promote mechanisms for climate planning", description: "Promote mechanisms for raising capacity for effective climate change-related planning and management in least developed countries and small island developing States, including focusing on women, youth and local and marginalized communities" },

  // SDG 14: Life Below Water (10 targets)
  { target_number: "14.1", sdg_goal_id: 14, title: "Reduce marine pollution", description: "By 2025, prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities, including marine debris and nutrient pollution" },
  { target_number: "14.2", sdg_goal_id: 14, title: "Protect marine ecosystems", description: "By 2020, sustainably manage and protect marine and coastal ecosystems to avoid significant adverse impacts, including by strengthening their resilience, and take action for their restoration in order to achieve healthy and productive oceans" },
  { target_number: "14.3", sdg_goal_id: 14, title: "Minimize ocean acidification", description: "Minimize and address the impacts of ocean acidification, including through enhanced scientific cooperation at all levels" },
  { target_number: "14.4", sdg_goal_id: 14, title: "Regulate fishing", description: "By 2020, effectively regulate harvesting and end overfishing, illegal, unreported and unregulated fishing and destructive fishing practices and implement science-based management plans, in order to restore fish stocks in the shortest time feasible, at least to levels that can produce maximum sustainable yield as determined by their biological characteristics" },
  { target_number: "14.5", sdg_goal_id: 14, title: "Conserve marine areas", description: "By 2020, conserve at least 10 per cent of coastal and marine areas, consistent with national and international law and based on the best available scientific information" },
  { target_number: "14.6", sdg_goal_id: 14, title: "End subsidies contributing to overfishing", description: "By 2020, prohibit certain forms of fisheries subsidies which contribute to overcapacity and overfishing, eliminate subsidies that contribute to illegal, unreported and unregulated fishing and refrain from introducing new such subsidies, recognizing that appropriate and effective special and differential treatment for developing and least developed countries should be an integral part of the World Trade Organization fisheries subsidies negotiation" },
  { target_number: "14.7", sdg_goal_id: 14, title: "Increase economic benefits from marine resources", description: "By 2030, increase the economic benefits to Small Island developing States and least developed countries from the sustainable use of marine resources, including through sustainable management of fisheries, aquaculture and tourism" },
  { target_number: "14.a", sdg_goal_id: 14, title: "Increase scientific knowledge", description: "Increase scientific knowledge, develop research capacity and transfer marine technology, taking into account the Intergovernmental Oceanographic Commission Criteria and Guidelines on the Transfer of Marine Technology, in order to improve ocean health and to enhance the contribution of marine biodiversity to the development of developing countries, in particular small island developing States and least developed countries" },
  { target_number: "14.b", sdg_goal_id: 14, title: "Provide access for small-scale fishers", description: "Provide access for small-scale artisanal fishers to marine resources and markets" },
  { target_number: "14.c", sdg_goal_id: 14, title: "Enhance conservation through international law", description: "Enhance the conservation and sustainable use of oceans and their resources by implementing international law as reflected in UNCLOS, which provides the legal framework for the conservation and sustainable use of oceans and their resources, as recalled in paragraph 158 of The Future We Want" },

  // SDG 15: Life on Land (12 targets)
  { target_number: "15.1", sdg_goal_id: 15, title: "Conserve terrestrial ecosystems", description: "By 2020, ensure the conservation, restoration and sustainable use of terrestrial and inland freshwater ecosystems and their services, in particular forests, wetlands, mountains and drylands, in line with obligations under international agreements" },
  { target_number: "15.2", sdg_goal_id: 15, title: "End deforestation", description: "By 2020, promote the implementation of sustainable management of all types of forests, halt deforestation, restore degraded forests and substantially increase afforestation and reforestation globally" },
  { target_number: "15.3", sdg_goal_id: 15, title: "Combat desertification", description: "By 2030, combat desertification, restore degraded land and soil, including land affected by desertification, drought and floods, and strive to achieve a land degradation-neutral world" },
  { target_number: "15.4", sdg_goal_id: 15, title: "Conserve mountain ecosystems", description: "By 2030, ensure the conservation of mountain ecosystems, including their biodiversity, in order to enhance their capacity to provide benefits that are essential for sustainable development" },
  { target_number: "15.5", sdg_goal_id: 15, title: "Protect biodiversity", description: "Take urgent and significant action to reduce the degradation of natural habitats, halt the loss of biodiversity and, by 2020, protect and prevent the extinction of threatened species" },
  { target_number: "15.6", sdg_goal_id: 15, title: "Promote access to genetic resources", description: "Promote fair and equitable sharing of the benefits arising from the utilization of genetic resources and promote appropriate access to such resources, as internationally agreed" },
  { target_number: "15.7", sdg_goal_id: 15, title: "End poaching and trafficking", description: "Take urgent action to end poaching and trafficking of protected species of flora and fauna and address both demand and supply of illegal wildlife products" },
  { target_number: "15.8", sdg_goal_id: 15, title: "Prevent invasive species", description: "By 2020, introduce measures to prevent the introduction and significantly reduce the impact of invasive alien species on land and water ecosystems and control or eradicate the priority species" },
  { target_number: "15.9", sdg_goal_id: 15, title: "Integrate ecosystem values", description: "By 2020, integrate ecosystem and biodiversity values into national and local planning, development processes, poverty reduction strategies and accounts" },
  { target_number: "15.a", sdg_goal_id: 15, title: "Mobilize resources for biodiversity", description: "Mobilize and significantly increase financial resources from all sources to conserve and sustainably use biodiversity and ecosystems" },
  { target_number: "15.b", sdg_goal_id: 15, title: "Finance sustainable forest management", description: "Mobilize significant resources from all sources and at all levels to finance sustainable forest management and provide adequate incentives to developing countries to advance such management, including for conservation and reforestation" },
  { target_number: "15.c", sdg_goal_id: 15, title: "Combat poaching and trafficking", description: "Enhance global support for efforts to combat poaching and trafficking of protected species, including by increasing the capacity of local communities to pursue sustainable livelihood opportunities" },

  // SDG 16: Peace, Justice and Strong Institutions (12 targets)
  { target_number: "16.1", sdg_goal_id: 16, title: "Reduce violence", description: "Significantly reduce all forms of violence and related death rates everywhere" },
  { target_number: "16.2", sdg_goal_id: 16, title: "End abuse and trafficking of children", description: "End abuse, exploitation, trafficking and all forms of violence against and torture of children" },
  { target_number: "16.3", sdg_goal_id: 16, title: "Promote rule of law", description: "Promote the rule of law at the national and international levels and ensure equal access to justice for all" },
  { target_number: "16.4", sdg_goal_id: 16, title: "Combat illicit financial flows", description: "By 2030, significantly reduce illicit financial and arms flows, strengthen the recovery and return of stolen assets and combat all forms of organized crime" },
  { target_number: "16.5", sdg_goal_id: 16, title: "Reduce corruption and bribery", description: "Substantially reduce corruption and bribery in all their forms" },
  { target_number: "16.6", sdg_goal_id: 16, title: "Develop effective institutions", description: "Develop effective, accountable and transparent institutions at all levels" },
  { target_number: "16.7", sdg_goal_id: 16, title: "Ensure responsive decision-making", description: "Ensure responsive, inclusive, participatory and representative decision-making at all levels" },
  { target_number: "16.8", sdg_goal_id: 16, title: "Broaden participation in global governance", description: "Broaden and strengthen the participation of developing countries in the institutions of global governance" },
  { target_number: "16.9", sdg_goal_id: 16, title: "Legal identity for all", description: "By 2030, provide legal identity for all, including birth registration" },
  { target_number: "16.10", sdg_goal_id: 16, title: "Ensure public access to information", description: "Ensure public access to information and protect fundamental freedoms, in accordance with national legislation and international agreements" },
  { target_number: "16.a", sdg_goal_id: 16, title: "Strengthen institutions to prevent violence", description: "Strengthen relevant national institutions, including through international cooperation, for building capacity at all levels, in particular in developing countries, to prevent violence and combat terrorism and crime" },
  { target_number: "16.b", sdg_goal_id: 16, title: "Promote non-discriminatory laws", description: "Promote and enforce non-discriminatory laws and policies for sustainable development" },

  // SDG 17: Partnerships for the Goals (19 targets)
  { target_number: "17.1", sdg_goal_id: 17, title: "Strengthen domestic revenue collection", description: "Strengthen domestic resource mobilization, including through international support to developing countries, to improve domestic capacity for tax and other revenue collection" },
  { target_number: "17.2", sdg_goal_id: 17, title: "Implement ODA commitments", description: "Developed countries to implement fully their official development assistance commitments, including the commitment by many developed countries to achieve the target of 0.7 per cent of gross national income for official development assistance (ODA/GNI) to developing countries and 0.15 to 0.20 per cent of ODA/GNI to least developed countries" },
  { target_number: "17.3", sdg_goal_id: 17, title: "Mobilize financial resources", description: "Mobilize additional financial resources for developing countries from multiple sources" },
  { target_number: "17.4", sdg_goal_id: 17, title: "Assist developing countries in debt sustainability", description: "Assist developing countries in attaining long-term debt sustainability through coordinated policies aimed at fostering debt financing, debt relief and debt restructuring, as appropriate, and address the external debt of highly indebted poor countries to reduce debt distress" },
  { target_number: "17.5", sdg_goal_id: 17, title: "Adopt investment promotion regimes", description: "Adopt and implement investment promotion regimes for least developed countries" },
  { target_number: "17.6", sdg_goal_id: 17, title: "Enhance cooperation on science and technology", description: "Enhance North-South, South-South and triangular regional and international cooperation on and access to science, technology and innovation and enhance knowledge sharing on mutually agreed terms, including through improved coordination among existing mechanisms, in particular at the United Nations level, and through a global technology facilitation mechanism" },
  { target_number: "17.7", sdg_goal_id: 17, title: "Promote sustainable technologies", description: "Promote the development, transfer, dissemination and diffusion of environmentally sound technologies to developing countries on favourable terms, including on concessional and preferential terms, as mutually agreed" },
  { target_number: "17.8", sdg_goal_id: 17, title: "Operationalize technology bank", description: "Fully operationalize the technology bank and science, technology and innovation capacity-building mechanism for least developed countries by 2017 and enhance the use of enabling technology, in particular information and communications technology" },
  { target_number: "17.9", sdg_goal_id: 17, title: "Enhance capacity-building support", description: "Enhance international support for implementing effective and targeted capacity-building in developing countries to support national plans to implement all the sustainable development goals, including through North-South, South-South and triangular cooperation" },
  { target_number: "17.10", sdg_goal_id: 17, title: "Promote universal trading system", description: "Promote a universal, rules-based, open, non-discriminatory and equitable multilateral trading system under the World Trade Organization, including through the conclusion of negotiations under its Doha Development Agenda" },
  { target_number: "17.11", sdg_goal_id: 17, title: "Increase developing country exports", description: "Significantly increase the exports of developing countries, in particular with a view to doubling the least developed countries' share of global exports by 2020" },
  { target_number: "17.12", sdg_goal_id: 17, title: "Realize timely duty-free access", description: "Realize timely implementation of duty-free and quota-free market access on a lasting basis for all least developed countries, consistent with World Trade Organization decisions, including by ensuring that preferential rules of origin applicable to imports from least developed countries are transparent and simple, and contribute to facilitating market access" },
  { target_number: "17.13", sdg_goal_id: 17, title: "Enhance macroeconomic stability", description: "Enhance global macroeconomic stability, including through policy coordination and policy coherence" },
  { target_number: "17.14", sdg_goal_id: 17, title: "Enhance policy coherence", description: "Enhance policy coherence for sustainable development" },
  { target_number: "17.15", sdg_goal_id: 17, title: "Respect policy space", description: "Respect each country's policy space and leadership to establish and implement policies for poverty eradication and sustainable development" },
  { target_number: "17.16", sdg_goal_id: 17, title: "Enhance global partnership", description: "Enhance the global partnership for sustainable development, complemented by multi-stakeholder partnerships that mobilize and share knowledge, expertise, technology and financial resources, to support the achievement of the sustainable development goals in all countries, in particular developing countries" },
  { target_number: "17.17", sdg_goal_id: 17, title: "Encourage effective partnerships", description: "Encourage and promote effective public, public-private and civil society partnerships, building on the experience and resourcing strategies of partnerships" },
  { target_number: "17.18", sdg_goal_id: 17, title: "Enhance data availability", description: "By 2020, enhance capacity-building support to developing countries, including for least developed countries and small island developing States, to increase significantly the availability of high-quality, timely and reliable data disaggregated by income, gender, age, race, ethnicity, migratory status, disability, geographic location and other characteristics relevant in national contexts" },
  { target_number: "17.19", sdg_goal_id: 17, title: "Develop broader progress measures", description: "By 2030, build on existing initiatives to develop measurements of progress on sustainable development that complement gross domestic product, and support statistical capacity-building in developing countries" }
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

// Only run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSDGData().then((result) => {
    console.log('Seeding result:', result);
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}