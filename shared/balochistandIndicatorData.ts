// Authentic Balochistan SDG Indicator Data from official reports
export interface IndicatorDataPoint {
  year: string;
  source: string;
  value: string | number;
  breakdown?: {
    urban?: string | number;
    rural?: string | number;
    male?: string | number;
    female?: string | number;
    overall?: string | number;
    education?: string | number;
    health?: string | number;
    social_protection?: string | number;
    moderate_severe?: string | number;
    severe?: string | number;
    moderate_severe_wasting?: string | number;
    severe_wasting?: string | number;
    overweight?: string | number;
    [key: string]: string | number | undefined;
  };
  notes?: string;
}

export interface IndicatorTimeSeries {
  indicator_code: string;
  title: string;
  unit: string;
  baseline: IndicatorDataPoint;
  progress: IndicatorDataPoint;
  latest: IndicatorDataPoint;
  trend_analysis?: string;
  data_quality?: string;
}

export const balochistandIndicatorData: IndicatorTimeSeries[] = [
  {
    indicator_code: "1.2.2",
    title: "Proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions",
    unit: "Percentage",
    baseline: {
      year: "2014-15",
      source: "MPI Report",
      value: "71.2%",
      breakdown: {
        overall: "71.2%",
        urban: "37.7%",
        rural: "84.6%"
      }
    },
    progress: {
      year: "2019-20",
      source: "MICS",
      value: "63.4%",
      breakdown: {
        overall: "63.4%",
        urban: "41.7%",
        rural: "71.0%"
      }
    },
    latest: {
      year: "2023",
      source: "Federal MPI Report",
      value: "In Process",
      notes: "Latest MPI computation is in process and the report is being finalized at the Federal level"
    },
    trend_analysis: "Improvement from 71.2% to 63.4% shows progress in poverty reduction, though rural areas remain significantly higher than urban"
  },
  {
    indicator_code: "1.3.1",
    title: "Proportion of population covered by social protection floors/systems",
    unit: "Percentage",
    baseline: {
      year: "2014-15",
      source: "Provincial Data",
      value: "Not Available"
    },
    progress: {
      year: "2017-18",
      source: "PDHS",
      value: "8.0%",
      notes: "Percentage of ever-married women (15-49) receiving benefits from BISP"
    },
    latest: {
      year: "2019-20",
      source: "MICS",
      value: "14.4%",
      notes: "Percentage of household members received social transfers in the last 3 months"
    },
    trend_analysis: "Significant improvement from 8.0% to 14.4% indicates expanding social protection coverage"
  },
  {
    indicator_code: "1.4.1",
    title: "Proportion of population living in households with access to basic services",
    unit: "Percentage by Service Type",
    baseline: {
      year: "2014-15",
      source: "PSLM",
      value: "Multiple Services",
      breakdown: {
        overall: "Improved water source: 67%, Flush Toilet: 31%, Electricity: 80.73%, Gas: 25%"
      },
      notes: "Flush Toilet (Urban: 78%, Rural: 14%); Electricity (Urban: 97.59%, Rural: 74.42%); Gas (Urban: 60%, Rural: 12%)"
    },
    progress: {
      year: "2018-19",
      source: "PSLM",
      value: "Multiple Services",
      breakdown: {
        overall: "Improved water source: 84%, Flush Toilet: 41%, Electricity: 75%, Gas: 37%"
      },
      notes: "Flush Toilet (Urban: 82%, Rural: 25%); Electricity (Urban: 95%, Rural: 67%); Gas (Urban: 70%, Rural: 24%)"
    },
    latest: {
      year: "2019-20",
      source: "MICS",
      value: "Water & Sanitation",
      breakdown: {
        overall: "Basic drinking water: 79.6%, Basic sanitation: 62.8%"
      }
    },
    trend_analysis: "Mixed progress with improvements in water access and sanitation, but electricity access declined slightly"
  },
  {
    indicator_code: "1.5.1",
    title: "Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population",
    unit: "Per 100,000 population",
    baseline: {
      year: "2015",
      source: "NDMA Annual Report",
      value: "Deaths: 0.13, Injured: 0.29, Affected: 70.35"
    },
    progress: {
      year: "2018",
      source: "NDMA Annual Reports",
      value: "Deaths: 0.04, Injured: 0.08, Affected: 24.62"
    },
    latest: {
      year: "2021",
      source: "NDMA Annual Reports",
      value: "Deaths: 0.17, Injured: 0.06, Affected: 19.92"
    },
    trend_analysis: "Overall reduction in disaster impact with fewer directly affected persons, though death rates fluctuated"
  },
  {
    indicator_code: "1.a.2",
    title: "Proportion of total government spending on essential services (education, health and social protection)",
    unit: "Percentage of Total Spending",
    baseline: {
      year: "2014-15",
      source: "PRSP, Ministry of Finance & Annual Budget Statements",
      value: "26.78%",
      breakdown: {
        overall: "26.78%",
        education: "18.35%",
        health: "7.8%",
        social_protection: "0.62%"
      }
    },
    progress: {
      year: "2018-19",
      source: "PRSP, Ministry of Finance & Annual Budget Statements",
      value: "30.20%",
      breakdown: {
        overall: "30.20%",
        education: "21.26%",
        health: "8.42%",
        social_protection: "0.53%"
      }
    },
    latest: {
      year: "2022-23",
      source: "Revised Budget 2022-23, White Paper 2023-24",
      value: "27.90%",
      breakdown: {
        overall: "27.90%",
        education: "17.60%",
        health: "7.39%",
        social_protection: "2.91%"
      }
    },
    trend_analysis: "Fluctuating spending with notable increase in social protection allocation in latest period"
  },
  {
    indicator_code: "2.2.1",
    title: "Prevalence of stunting among children under 5 years of age",
    unit: "Percentage",
    baseline: {
      year: "2011",
      source: "NNS",
      value: "32%"
    },
    progress: {
      year: "2017-18",
      source: "PDHS",
      value: "47%"
    },
    latest: {
      year: "2019-20",
      source: "MICS",
      value: "49.7%",
      breakdown: {
        moderate_severe: "49.7%",
        severe: "29.1%"
      }
    },
    trend_analysis: "Concerning deterioration in child nutrition with stunting rates increasing significantly",
    data_quality: "High confidence - consistent measurement methodology across surveys"
  },
  {
    indicator_code: "2.2.2",
    title: "Prevalence of malnutrition among children under 5 years of age, by type (wasting and overweight)",
    unit: "Percentage by Type",
    baseline: {
      year: "2011",
      source: "NNS",
      value: "18%",
      notes: "Wasting only"
    },
    progress: {
      year: "2017-18",
      source: "PDHS",
      value: "18.3%",
      notes: "Wasting only"
    },
    latest: {
      year: "2019-20",
      source: "MICS",
      value: "Multiple Types",
      breakdown: {
        moderate_severe_wasting: "9.2%",
        severe_wasting: "4.3%",
        overweight: "11.5%"
      }
    },
    trend_analysis: "Improvement in wasting rates but emergence of overweight as new concern"
  },
  {
    indicator_code: "3.1.1",
    title: "Maternal mortality ratio",
    unit: "Deaths per 100,000 live births",
    baseline: {
      year: "2006-07",
      source: "PDHS",
      value: "785"
    },
    progress: {
      year: "2019",
      source: "Pakistan MMR Survey",
      value: "298"
    },
    latest: {
      year: "2023",
      source: "Not available",
      value: "Not available"
    },
    trend_analysis: "Significant improvement from 785 to 298 deaths per 100,000 live births represents major progress in maternal health"
  },
  {
    indicator_code: "3.2.1",
    title: "Under-5 mortality rate",
    unit: "Deaths per 1,000 live births",
    baseline: {
      year: "2012-13",
      source: "PDHS",
      value: "111",
      breakdown: {
        overall: "111",
        urban: "101",
        rural: "102"
      }
    },
    progress: {
      year: "2018-19",
      source: "PSLM",
      value: "35",
      breakdown: {
        overall: "35",
        urban: "32",
        rural: "36"
      }
    },
    latest: {
      year: "2019-20",
      source: "MICS",
      value: "53"
    },
    trend_analysis: "Dramatic improvement from 111 to 35-53 range showing significant child health gains"
  },
  {
    indicator_code: "4.6.1",
    title: "Proportion of population in a given age group achieving at least a fixed level of proficiency in functional literacy and numeracy skills by sex",
    unit: "Percentage",
    baseline: {
      year: "2013-14",
      source: "PSLM",
      value: "44%"
    },
    progress: {
      year: "2019-20",
      source: "PSLM",
      value: "46%"
    },
    latest: {
      year: "2020-21",
      source: "LFS",
      value: "54.5%",
      notes: "Literacy Rate (10 years and above)"
    },
    trend_analysis: "Steady improvement in literacy rates with accelerated progress in recent years"
  },
  {
    indicator_code: "8.5.2",
    title: "Unemployment rate by sex, age and persons with disabilities",
    unit: "Percentage",
    baseline: {
      year: "2014-15",
      source: "LFS",
      value: "3.92%",
      breakdown: {
        overall: "3.92%",
        male: "2.84%",
        female: "8.54%"
      }
    },
    progress: {
      year: "2018-19",
      source: "LFS",
      value: "4.6%",
      breakdown: {
        overall: "4.6%",
        male: "4.2%",
        female: "7.4%"
      }
    },
    latest: {
      year: "2020-21",
      source: "LFS",
      value: "4.3%",
      breakdown: {
        overall: "4.3%",
        male: "4.2%",
        female: "5.0%"
      }
    },
    trend_analysis: "Slight increase followed by stabilization, with notable improvement in female unemployment rates"
  },
  {
    indicator_code: "8.6.1",
    title: "Proportion of youth (aged 15–24 years) not in education, employment or training",
    unit: "Percentage",
    baseline: {
      year: "2014-15",
      source: "LFS",
      value: "24%",
      breakdown: {
        urban: "23%",
        rural: "25%"
      }
    },
    progress: {
      year: "2018-19",
      source: "LFS",
      value: "27%",
      breakdown: {
        urban: "27%",
        rural: "27%"
      }
    },
    latest: {
      year: "2020-21",
      source: "LFS",
      value: "41.8%",
      breakdown: {
        overall: "41.8%",
        urban: "41.0%",
        rural: "42.1%",
        male: "14.1%",
        female: "75.4%"
      },
      notes: "Male breakdown: Urban=15.8%, Rural=13.3%; Female breakdown: Urban=71.6%, Rural=77.6%"
    },
    trend_analysis: "Concerning deterioration with significant gender disparities, particularly affecting young women"
  },
  {
    indicator_code: "15.1.1",
    title: "Forest area as a proportion of total land area",
    unit: "Percentage",
    baseline: {
      year: "2014-15",
      source: "Balochistan Development Statistics",
      value: "3.25%"
    },
    progress: {
      year: "2018-19",
      source: "Balochistan Development Statistics",
      value: "3.35%"
    },
    latest: {
      year: "2021-22",
      source: "Balochistan Agriculture Statistics",
      value: "5.15%"
    },
    trend_analysis: "Positive trend with significant increase in forest coverage, likely due to afforestation programs"
  },
  {
    indicator_code: "16.9.1",
    title: "Proportion of children under 5 years of age whose births have been registered with a civil authority by age",
    unit: "Percentage",
    baseline: {
      year: "2012-13",
      source: "PDHS",
      value: "7.7%"
    },
    progress: {
      year: "2017-18",
      source: "PDHS",
      value: "37.6%",
      breakdown: {
        urban: "46%",
        rural: "34%"
      }
    },
    latest: {
      year: "2019-20",
      source: "MICS",
      value: "44.1%"
    },
    trend_analysis: "Dramatic improvement in birth registration from 7.7% to 44.1% showing strengthened civil registration systems"
  }
];

// Helper function to get indicator data by code
export const getIndicatorData = (code: string): IndicatorTimeSeries | undefined => {
  return balochistandIndicatorData.find(indicator => indicator.indicator_code === code);
};

// Helper function to get all available indicator codes
export const getAvailableIndicatorCodes = (): string[] => {
  return balochistandIndicatorData.map(indicator => indicator.indicator_code);
};