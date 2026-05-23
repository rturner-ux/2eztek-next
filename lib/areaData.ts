// lib/areaData.ts

export interface AreaData {
  slug: string
  name: string
  county: string
  overview: string
  services: string[]
  landmarks: string[]
  whyChooseUs: string[]
  metaTitle: string
  metaDescription: string
}

export const areas: AreaData[] = [
  {
    slug: 'dallas',
    name: 'Dallas',
    county: 'Dallas County',
    overview:
      '2EZ TEK provides professional fitness equipment repair, assembly, and commercial gym maintenance throughout Dallas, TX. From luxury home gyms in Preston Hollow to apartment fitness centers in Uptown and commercial facilities across the city, our technicians service all major brands onsite.',
    services: [
      'Treadmill Repair Dallas',
      'Elliptical Repair Dallas',
      'Exercise Bike Repair Dallas',
      'Home Gym Assembly Dallas',
      'Commercial Gym Maintenance Dallas',
      'Strength Equipment Repair Dallas',
      'Cable Machine Repair Dallas',
      'Preventative Maintenance Dallas',
    ],
    landmarks: [
      'Uptown Dallas',
      'Preston Hollow',
      'Deep Ellum',
      'Oak Lawn',
      'North Dallas',
      'Downtown Dallas',
    ],
    whyChooseUs: [
      'Onsite repair throughout all of Dallas',
      'Same-day and next-day availability',
      'All major brands serviced',
      'Residential and commercial experience',
      'SmartGymOps-powered service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Dallas TX | 2EZ TEK',
    metaDescription:
      'Professional fitness equipment repair in Dallas, TX. Treadmill repair, elliptical repair, gym assembly, and commercial maintenance. Call 2EZ TEK today.',
  },
  {
    slug: 'fort-worth',
    name: 'Fort Worth',
    county: 'Tarrant County',
    overview:
      '2EZ TEK provides expert fitness equipment repair and maintenance throughout Fort Worth, TX. Whether you need treadmill repair in Westover Hills, gym assembly in the Cultural District, or commercial maintenance for a Fort Worth fitness facility, our technicians are ready.',
    services: [
      'Treadmill Repair Fort Worth',
      'Elliptical Repair Fort Worth',
      'Exercise Bike Repair Fort Worth',
      'Home Gym Assembly Fort Worth',
      'Commercial Gym Maintenance Fort Worth',
      'Strength Equipment Repair Fort Worth',
      'Cable Machine Repair Fort Worth',
      'Preventative Maintenance Fort Worth',
    ],
    landmarks: [
      'Westover Hills',
      'Cultural District',
      'Sundance Square',
      'TCU Area',
      'Alliance Corridor',
      'Tanglewood',
    ],
    whyChooseUs: [
      'Serving all of Fort Worth and Tarrant County',
      'Residential and commercial clients',
      'All major equipment brands',
      'Fast turnaround on most repairs',
      'SmartGymOps service documentation',
      '500+ five-star reviews across DFW',
    ],
    metaTitle: 'Fitness Equipment Repair Fort Worth TX | 2EZ TEK',
    metaDescription:
      'Professional fitness equipment repair in Fort Worth, TX. Treadmill repair, gym assembly, and commercial maintenance by 2EZ TEK. Call today.',
  },
  {
    slug: 'plano',
    name: 'Plano',
    county: 'Collin County',
    overview:
      '2EZ TEK services fitness equipment throughout Plano, TX — one of the most active fitness communities in the DFW area. From home gym setups in West Plano to apartment fitness centers and corporate gym maintenance, our technicians provide fast, professional onsite service.',
    services: [
      'Treadmill Repair Plano',
      'Elliptical Repair Plano',
      'Exercise Bike Repair Plano',
      'Home Gym Assembly Plano',
      'Commercial Gym Maintenance Plano',
      'Strength Equipment Repair Plano',
      'Cable Machine Repair Plano',
      'Preventative Maintenance Plano',
    ],
    landmarks: [
      'West Plano',
      'Legacy Business District',
      'Willow Bend',
      'East Plano',
      'Downtown Plano',
      'Plano Parkway Corridor',
    ],
    whyChooseUs: [
      'Serving all of Plano and Collin County',
      'Same-day availability in most cases',
      'Luxury home gym specialists',
      'Corporate and apartment fitness centers',
      'SmartGymOps service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Plano TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Plano, TX. Treadmill repair, elliptical service, home gym assembly, and commercial maintenance by 2EZ TEK.',
  },
  {
    slug: 'frisco',
    name: 'Frisco',
    county: 'Collin County',
    overview:
      '2EZ TEK provides premium fitness equipment repair and installation services throughout Frisco, TX. One of the fastest-growing cities in America, Frisco is home to luxury residential communities, world-class sports facilities, and high-end fitness centers — all of which we proudly service.',
    services: [
      'Treadmill Repair Frisco',
      'Elliptical Repair Frisco',
      'Exercise Bike Repair Frisco',
      'Home Gym Assembly Frisco',
      'Commercial Gym Maintenance Frisco',
      'Strength Equipment Repair Frisco',
      'Cable Machine Repair Frisco',
      'Preventative Maintenance Frisco',
    ],
    landmarks: [
      'The Star District',
      'Frisco Square',
      'Wade Park',
      'Newman Village',
      'Starwood',
      'Stonebriar Corridor',
    ],
    whyChooseUs: [
      'Serving all of Frisco and surrounding areas',
      'Luxury home gym installation specialists',
      'Commercial and residential experience',
      'All major brands serviced',
      'SmartGymOps-powered tracking',
      '500+ five-star reviews across DFW',
    ],
    metaTitle: 'Fitness Equipment Repair Frisco TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Frisco, TX. Treadmill repair, home gym assembly, and commercial maintenance by 2EZ TEK. Book your service today.',
  },
  {
    slug: 'irving',
    name: 'Irving',
    county: 'Dallas County',
    overview:
      '2EZ TEK services fitness equipment throughout Irving, TX — including the Las Colinas urban center, hotel fitness centers along the Airport Freeway corridor, and residential communities across the city. We provide fast onsite repair and maintenance for all major brands.',
    services: [
      'Treadmill Repair Irving',
      'Elliptical Repair Irving',
      'Exercise Bike Repair Irving',
      'Home Gym Assembly Irving',
      'Commercial Gym Maintenance Irving',
      'Hotel Fitness Center Maintenance Irving',
      'Strength Equipment Repair Irving',
      'Preventative Maintenance Irving',
    ],
    landmarks: [
      'Las Colinas',
      'Valley Ranch',
      'Irving Convention Center',
      'DFW Airport Corridor',
      'Hackberry Creek',
      'Los Colinas Urban Center',
    ],
    whyChooseUs: [
      'Hotel and hospitality fitness center specialists',
      'Corporate campus gym maintenance',
      'Serving all of Irving and Las Colinas',
      'All major brands serviced',
      'SmartGymOps service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Irving TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Irving, TX. Hotel fitness centers, home gyms, and commercial maintenance by 2EZ TEK. Las Colinas and all of Irving.',
  },
  {
    slug: 'arlington',
    name: 'Arlington',
    county: 'Tarrant County',
    overview:
      '2EZ TEK provides expert fitness equipment repair and maintenance throughout Arlington, TX. Home to AT&T Stadium, Globe Life Field, and a thriving fitness community, Arlington is a key service market for 2EZ TEK — from apartment fitness centers near UT Arlington to commercial gyms across the city.',
    services: [
      'Treadmill Repair Arlington',
      'Elliptical Repair Arlington',
      'Exercise Bike Repair Arlington',
      'Home Gym Assembly Arlington',
      'Commercial Gym Maintenance Arlington',
      'Strength Equipment Repair Arlington',
      'Cable Machine Repair Arlington',
      'Preventative Maintenance Arlington',
    ],
    landmarks: [
      'Entertainment District',
      'UT Arlington Area',
      'Viridian',
      'Pantego',
      'North Arlington',
      'Dalworthington Gardens',
    ],
    whyChooseUs: [
      'Serving all of Arlington and mid-cities',
      'Commercial and residential clients',
      'All major equipment brands',
      'Fast response times',
      'SmartGymOps documentation',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Arlington TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Arlington, TX. Treadmill repair, elliptical service, and commercial gym maintenance by 2EZ TEK. Book today.',
  },
  {
    slug: 'richardson',
    name: 'Richardson',
    county: 'Dallas County',
    overview:
      '2EZ TEK services fitness equipment throughout Richardson, TX — a growing tech hub with a strong residential fitness culture. From home gym setups near UTD to apartment fitness centers and corporate wellness rooms in the Telecom Corridor, we provide fast professional service.',
    services: [
      'Treadmill Repair Richardson',
      'Elliptical Repair Richardson',
      'Exercise Bike Repair Richardson',
      'Home Gym Assembly Richardson',
      'Commercial Gym Maintenance Richardson',
      'Strength Equipment Repair Richardson',
      'Corporate Gym Maintenance Richardson',
      'Preventative Maintenance Richardson',
    ],
    landmarks: [
      'Telecom Corridor',
      'UTD Area',
      'Spring Valley',
      'Canyon Creek',
      'Arapaho Road Corridor',
      'Downtown Richardson',
    ],
    whyChooseUs: [
      'Corporate and tech campus gym specialists',
      'Serving all of Richardson',
      'Residential and commercial experience',
      'All major brands serviced',
      'SmartGymOps service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Richardson TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Richardson, TX. Treadmill repair, home gym assembly, and corporate gym maintenance by 2EZ TEK.',
  },
  {
    slug: 'mckinney',
    name: 'McKinney',
    county: 'Collin County',
    overview:
      '2EZ TEK provides professional fitness equipment repair and installation throughout McKinney, TX. One of the top-ranked cities to live in America, McKinney is home to luxury residential communities and growing commercial fitness facilities — all of which we proudly service.',
    services: [
      'Treadmill Repair McKinney',
      'Elliptical Repair McKinney',
      'Exercise Bike Repair McKinney',
      'Home Gym Assembly McKinney',
      'Commercial Gym Maintenance McKinney',
      'Strength Equipment Repair McKinney',
      'Cable Machine Repair McKinney',
      'Preventative Maintenance McKinney',
    ],
    landmarks: [
      'Historic Downtown McKinney',
      'Craig Ranch',
      'Stonebridge Ranch',
      'Eldorado Parkway Corridor',
      'Adriatica Village',
      'West McKinney',
    ],
    whyChooseUs: [
      'Luxury home gym specialists',
      'Serving all of McKinney and Collin County',
      'Residential and commercial experience',
      'All major brands serviced',
      'SmartGymOps tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair McKinney TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in McKinney, TX. Treadmill repair, home gym installation, and commercial maintenance by 2EZ TEK.',
  },
  {
    slug: 'garland',
    name: 'Garland',
    county: 'Dallas County',
    overview:
      '2EZ TEK services fitness equipment throughout Garland, TX. From residential treadmill repairs to apartment fitness center maintenance, our technicians provide fast, professional onsite service across all of Garland and the surrounding area.',
    services: [
      'Treadmill Repair Garland',
      'Elliptical Repair Garland',
      'Exercise Bike Repair Garland',
      'Home Gym Assembly Garland',
      'Commercial Gym Maintenance Garland',
      'Strength Equipment Repair Garland',
      'Cable Machine Repair Garland',
      'Preventative Maintenance Garland',
    ],
    landmarks: [
      'Downtown Garland',
      'Firewheel Town Center',
      'Duck Creek',
      'North Garland',
      'Sachse border area',
      'Rowlett Road Corridor',
    ],
    whyChooseUs: [
      'Serving all of Garland and East Dallas County',
      'Residential and commercial clients',
      'All major equipment brands',
      'Fast response times',
      'SmartGymOps service documentation',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Garland TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Garland, TX. Treadmill repair, elliptical service, and commercial gym maintenance by 2EZ TEK.',
  },
  {
    slug: 'mesquite',
    name: 'Mesquite',
    county: 'Dallas County',
    overview:
      '2EZ TEK provides professional fitness equipment repair and maintenance throughout Mesquite, TX. From home gym setups to apartment fitness centers and commercial facilities, our technicians deliver fast onsite service across all of Mesquite.',
    services: [
      'Treadmill Repair Mesquite',
      'Elliptical Repair Mesquite',
      'Exercise Bike Repair Mesquite',
      'Home Gym Assembly Mesquite',
      'Commercial Gym Maintenance Mesquite',
      'Strength Equipment Repair Mesquite',
      'Cable Machine Repair Mesquite',
      'Preventative Maintenance Mesquite',
    ],
    landmarks: [
      'Downtown Mesquite',
      'Mesquite Rodeo Area',
      'Skyline Area',
      'North Mesquite',
      'Town East Corridor',
      'Mesquite Metro Area',
    ],
    whyChooseUs: [
      'Serving all of Mesquite and Southeast Dallas County',
      'Residential and commercial experience',
      'All major brands serviced',
      'Fast turnaround',
      'SmartGymOps tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Mesquite TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Mesquite, TX. Treadmill repair, home gym assembly, and commercial maintenance by 2EZ TEK. Call today.',
  },
  {
    slug: 'carrollton',
    name: 'Carrollton',
    county: 'Dallas County',
    overview:
      '2EZ TEK services fitness equipment throughout Carrollton, TX. Centrally located between Dallas and Denton, Carrollton is home to a diverse mix of residential communities and commercial fitness facilities — all served by our professional onsite repair and maintenance team.',
    services: [
      'Treadmill Repair Carrollton',
      'Elliptical Repair Carrollton',
      'Exercise Bike Repair Carrollton',
      'Home Gym Assembly Carrollton',
      'Commercial Gym Maintenance Carrollton',
      'Strength Equipment Repair Carrollton',
      'Cable Machine Repair Carrollton',
      'Preventative Maintenance Carrollton',
    ],
    landmarks: [
      'Downtown Carrollton',
      'Addison border area',
      'Frankford Road Corridor',
      'Old Town Carrollton',
      'Josey Ranch',
      'North Carrollton',
    ],
    whyChooseUs: [
      'Serving all of Carrollton and North Dallas County',
      'Residential and commercial clients',
      'All major equipment brands',
      'SmartGymOps service tracking',
      'Fast response times',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Carrollton TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Carrollton, TX. Treadmill repair, gym assembly, and commercial maintenance by 2EZ TEK. Book your service today.',
  },
  {
    slug: 'addison',
    name: 'Addison',
    county: 'Dallas County',
    overview:
      '2EZ TEK provides premium fitness equipment repair and maintenance throughout Addison, TX. Known for its restaurant row, corporate offices, and upscale apartments, Addison is a high-demand market for professional fitness equipment service — and 2EZ TEK delivers.',
    services: [
      'Treadmill Repair Addison',
      'Elliptical Repair Addison',
      'Exercise Bike Repair Addison',
      'Home Gym Assembly Addison',
      'Commercial Gym Maintenance Addison',
      'Hotel Fitness Center Maintenance Addison',
      'Apartment Gym Maintenance Addison',
      'Preventative Maintenance Addison',
    ],
    landmarks: [
      'Addison Circle',
      'Belt Line Road Corridor',
      'Vitruvian Park',
      'Addison Airport Area',
      'Quorum Drive Corridor',
      'North Dallas Tollway Area',
    ],
    whyChooseUs: [
      'Hotel and apartment gym specialists',
      'Serving all of Addison',
      'Corporate and residential experience',
      'All major brands serviced',
      'SmartGymOps service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Fitness Equipment Repair Addison TX | 2EZ TEK',
    metaDescription:
      'Fitness equipment repair in Addison, TX. Hotel fitness centers, apartment gyms, and home gym service by 2EZ TEK. Call today.',
  },
]

export function getAreaBySlug(slug: string): AreaData | undefined {
  return areas.find((a) => a.slug === slug)
}

export function getAllAreaSlugs(): string[] {
  return areas.map((a) => a.slug)
}