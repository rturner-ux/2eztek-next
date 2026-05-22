// lib/serviceData.ts

export interface ServiceData {
  slug: string
  name: string
  shortName: string
  tagline: string
  overview: string
  equipmentTypes: string[]
  commonIssues: string[]
  repairServices: string[]
  whyChooseUs: string[]
  metaTitle: string
  metaDescription: string
}

export const services: ServiceData[] = [
  {
    slug: 'treadmill-repair-dallas',
    name: 'Treadmill Repair Dallas Fort Worth',
    shortName: 'Treadmill Repair',
    tagline: 'Professional Treadmill Repair in Dallas Fort Worth',
    overview:
      'A broken treadmill disrupts your routine and can become a bigger problem if left unaddressed. 2EZ TEK provides expert treadmill repair across Dallas Fort Worth for both residential and commercial clients — fast diagnostics, quality parts, and lasting repairs on all major brands.',
    equipmentTypes: [
      'Residential Treadmills',
      'Commercial Treadmills',
      'Folding Treadmills',
      'Incline Trainers',
      'Manual Treadmills',
      'Smart / iFit Treadmills',
      'Hotel & Apartment Treadmills',
    ],
    commonIssues: [
      'Belt slipping, fraying, or not moving',
      'Treadmill won\'t turn on',
      'Motor overheating or burning smell',
      'Incline not working or stuck',
      'Console errors or display failures',
      'Loud squeaking or grinding noise',
      'Speed inconsistency or surging',
      'Drive belt wear or snapping',
    ],
    repairServices: [
      'Treadmill belt replacement and lubrication',
      'Motor and controller board diagnostics',
      'Incline motor repair and calibration',
      'Console and display repair',
      'Drive belt and roller replacement',
      'Deck replacement and resurfacing',
      'Full preventative tune-up',
      'Emergency same-day repair',
    ],
    whyChooseUs: [
      'Onsite repair — we come to you across DFW',
      'All major brands serviced',
      'Residential and commercial experience',
      'SmartGymOps-powered service tracking',
      'Transparent diagnostics before any work begins',
      '500+ five-star reviews across Dallas Fort Worth',
    ],
    metaTitle: 'Treadmill Repair Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Professional treadmill repair in Dallas Fort Worth. Belt replacement, motor repair, incline failures, console issues, and more. Call 2EZ TEK for fast onsite service.',
  },
  {
    slug: 'elliptical-repair-dallas',
    name: 'Elliptical Repair Dallas Fort Worth',
    shortName: 'Elliptical Repair',
    tagline: 'Expert Elliptical Repair in Dallas Fort Worth',
    overview:
      '2EZ TEK provides professional elliptical repair across Dallas Fort Worth for home gyms, apartments, hotels, and commercial fitness facilities. Whether your elliptical is squeaking, has resistance issues, or won\'t power on, our technicians diagnose and fix it right.',
    equipmentTypes: [
      'Residential Ellipticals',
      'Commercial Ellipticals',
      'Cross-Trainers',
      'Adaptive Motion Trainers (AMT)',
      'Lateral Ellipticals',
      'Front-Drive Ellipticals',
      'Rear-Drive Ellipticals',
    ],
    commonIssues: [
      'Elliptical squeaking or grinding during use',
      'Resistance not working or stuck',
      'Console display errors or blank screen',
      'Stride length issues or uneven motion',
      'Pedal arms loose or wobbling',
      'Drive belt slipping or snapping',
      'Power issues — won\'t turn on',
      'Flywheel noise or vibration',
    ],
    repairServices: [
      'Drive belt and flywheel service',
      'Resistance system diagnostics and repair',
      'Console and display repair',
      'Pedal arm and stride mechanism repair',
      'Bearing and roller replacement',
      'Full elliptical tune-up and lubrication',
      'Preventative maintenance visits',
      'Emergency commercial repair',
    ],
    whyChooseUs: [
      'Onsite repair across all of DFW',
      'All major elliptical brands serviced',
      'Same-day and next-day availability',
      'Commercial and residential experience',
      'SmartGymOps service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Elliptical Repair Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Expert elliptical repair in Dallas Fort Worth. Resistance issues, squeaking, console failures, drive belt repair, and more. Book 2EZ TEK for fast onsite service.',
  },
  {
    slug: 'exercise-bike-repair-dallas',
    name: 'Exercise Bike Repair Dallas Fort Worth',
    shortName: 'Exercise Bike Repair',
    tagline: 'Professional Exercise Bike Repair in Dallas Fort Worth',
    overview:
      '2EZ TEK services all types of exercise bikes across Dallas Fort Worth — from upright and recumbent bikes to indoor cycling bikes and air bikes. We diagnose and repair resistance issues, console failures, flywheel problems, and more for both home and commercial clients.',
    equipmentTypes: [
      'Upright Exercise Bikes',
      'Recumbent Bikes',
      'Indoor Cycling / Spin Bikes',
      'Air Bikes (Airdyne)',
      'Smart Bikes (Peloton-style)',
      'Commercial Cardio Bikes',
      'Seated Elliptical Bikes',
    ],
    commonIssues: [
      'Resistance not adjusting or stuck',
      'Flywheel noise or grinding',
      'Console display errors or blank screen',
      'Pedal and crank arm wear',
      'Belt drive slipping or snapping',
      'Seat adjustment mechanism failure',
      'Power issues on smart bikes',
      'Magnetic resistance unit failure',
    ],
    repairServices: [
      'Resistance system diagnostics and repair',
      'Flywheel and drive belt service',
      'Console and display repair',
      'Pedal, crank, and bottom bracket service',
      'Magnetic resistance unit replacement',
      'Full bike tune-up and lubrication',
      'Smart bike connectivity and screen repair',
      'Preventative maintenance visits',
    ],
    whyChooseUs: [
      'All bike types and brands serviced',
      'Onsite repair across DFW',
      'Residential and commercial clients',
      'Fast turnaround on most repairs',
      'SmartGymOps service tracking',
      '500+ five-star reviews',
    ],
    metaTitle: 'Exercise Bike Repair Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Exercise bike repair in Dallas Fort Worth. Upright, recumbent, spin bikes, and air bikes serviced by 2EZ TEK. Resistance, flywheel, console, and more.',
  },
  {
    slug: 'fitness-equipment-assembly-dallas',
    name: 'Fitness Equipment Assembly Dallas Fort Worth',
    shortName: 'Equipment Assembly',
    tagline: 'Professional Fitness Equipment Assembly in Dallas Fort Worth',
    overview:
      '2EZ TEK provides expert fitness equipment assembly and installation across Dallas Fort Worth. From treadmills and ellipticals to home gym systems and commercial strength equipment, we assemble it correctly so it\'s safe, calibrated, and ready to use from day one.',
    equipmentTypes: [
      'Treadmill Assembly',
      'Elliptical Assembly',
      'Exercise Bike Assembly',
      'Home Gym System Assembly',
      'Functional Trainer Assembly',
      'Strength Machine Assembly',
      'Commercial Equipment Installation',
    ],
    commonIssues: [
      'Equipment delivered unassembled',
      'Incomplete or confusing assembly instructions',
      'Incorrect assembly causing noise or instability',
      'Calibration needed after assembly',
      'Relocation and reassembly after a move',
      'Commercial facility new equipment installs',
      'White-glove setup for luxury home gyms',
    ],
    repairServices: [
      'Full assembly and installation',
      'White-glove home gym setup',
      'Commercial facility equipment installs',
      'Relocation and reassembly',
      'Post-assembly calibration and testing',
      'Console and connectivity setup',
      'Multi-unit commercial project installs',
      'Same-day assembly availability',
    ],
    whyChooseUs: [
      'All major brands and equipment types',
      'Commercial and residential experience',
      'Proper calibration included with every assembly',
      'White-glove setup for premium clients',
      'SmartGymOps service documentation',
      '500+ five-star reviews across DFW',
    ],
    metaTitle: 'Fitness Equipment Assembly Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Professional fitness equipment assembly in Dallas Fort Worth. Treadmills, ellipticals, home gyms, and commercial equipment assembled and installed by 2EZ TEK.',
  },
  {
    slug: 'home-gym-installation-dallas',
    name: 'Home Gym Installation Dallas Fort Worth',
    shortName: 'Home Gym Installation',
    tagline: 'Expert Home Gym Installation in Dallas Fort Worth',
    overview:
      '2EZ TEK specializes in home gym installation across Dallas Fort Worth. Whether you\'re setting up a single piece of equipment or building out a full luxury home gym, our technicians handle assembly, placement, calibration, and setup so everything is ready to use from day one.',
    equipmentTypes: [
      'Full Home Gym Setup',
      'Treadmill Installation',
      'Elliptical Installation',
      'Strength Machine Installation',
      'Functional Trainer Setup',
      'Cable Machine Installation',
      'Multi-Station Home Gym',
    ],
    commonIssues: [
      'New equipment needs professional assembly',
      'Existing equipment needs relocation',
      'Dedicated gym room build-out',
      'Multiple pieces need coordinated setup',
      'Equipment placement and layout planning',
      'Post-move gym reassembly',
      'White-glove luxury home gym setup',
    ],
    repairServices: [
      'Full home gym assembly and installation',
      'White-glove luxury setup service',
      'Equipment placement and layout',
      'Relocation and reassembly',
      'Multi-piece coordinated installation',
      'Post-assembly calibration and testing',
      'Ongoing maintenance programs',
      'Equipment sourcing guidance',
    ],
    whyChooseUs: [
      'Specialized in luxury home gym setups',
      'All equipment types and brands',
      'Professional placement and layout advice',
      'SmartGymOps service documentation',
      'Ongoing maintenance available after install',
      '500+ five-star reviews across DFW',
    ],
    metaTitle: 'Home Gym Installation Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Professional home gym installation in Dallas Fort Worth. Full setup, assembly, placement, and calibration by 2EZ TEK. White-glove service available.',
  },
  {
    slug: 'preventative-maintenance-dallas',
    name: 'Fitness Equipment Preventative Maintenance Dallas',
    shortName: 'Preventative Maintenance',
    tagline: 'Preventative Maintenance for Fitness Equipment in Dallas Fort Worth',
    overview:
      '2EZ TEK provides preventative maintenance programs for residential and commercial fitness equipment across Dallas Fort Worth. Regular maintenance extends equipment life, prevents costly breakdowns, and keeps your machines performing at their best — powered by SmartGymOps service tracking.',
    equipmentTypes: [
      'Commercial Gym Equipment',
      'Apartment Fitness Centers',
      'Hotel Gym Equipment',
      'Corporate Fitness Rooms',
      'Residential Home Gyms',
      'School & University Gyms',
      'Training Studio Equipment',
    ],
    commonIssues: [
      'Equipment breaking down unexpectedly',
      'High repair costs from deferred maintenance',
      'Short equipment lifespan from lack of service',
      'No documentation of service history',
      'Member complaints about equipment condition',
      'Regulatory compliance for commercial facilities',
      'Multiple machines needing coordinated care',
    ],
    repairServices: [
      'Scheduled quarterly maintenance visits',
      'Annual full-service inspections',
      'Belt lubrication and tension checks',
      'Drive system inspection and adjustment',
      'Console and electrical system checks',
      'SmartGymOps service history tracking',
      'QR reporting for facility managers',
      'Multi-unit commercial maintenance contracts',
    ],
    whyChooseUs: [
      'SmartGymOps-powered tracking and reporting',
      'Flexible scheduling for commercial facilities',
      'All major brands and equipment types',
      'Documented service history per machine',
      'Priority response for contract clients',
      '500+ five-star reviews across DFW',
    ],
    metaTitle: 'Fitness Equipment Preventative Maintenance Dallas | 2EZ TEK',
    metaDescription:
      'Preventative maintenance for fitness equipment in Dallas Fort Worth. Residential and commercial programs powered by SmartGymOps. Call 2EZ TEK today.',
  },
  {
    slug: 'strength-equipment-repair-dallas',
    name: 'Strength Equipment Repair Dallas Fort Worth',
    shortName: 'Strength Equipment Repair',
    tagline: 'Professional Strength Equipment Repair in Dallas Fort Worth',
    overview:
      '2EZ TEK provides expert strength equipment repair across Dallas Fort Worth for commercial gyms, training facilities, and home gyms. From selectorized machines and cable systems to plate-loaded equipment and functional trainers, we keep your strength equipment safe and performing.',
    equipmentTypes: [
      'Selectorized Strength Machines',
      'Cable Cross Machines',
      'Functional Trainers',
      'Plate-Loaded Equipment',
      'Smith Machines',
      'Multi-Station Home Gyms',
      'Commercial Strength Systems',
    ],
    commonIssues: [
      'Cable fraying or snapping',
      'Weight stack and selector pin failures',
      'Pulley wear and bearing failures',
      'Upholstery and pad deterioration',
      'Seat and adjustment mechanism failures',
      'Frame and weld stress on high-use machines',
      'Roller and pivot bearing wear',
    ],
    repairServices: [
      'Cable replacement and tensioning',
      'Pulley and bearing service',
      'Weight stack and selector pin repair',
      'Upholstery and pad replacement',
      'Seat and adjustment mechanism repair',
      'Full strength equipment tune-up',
      'Commercial strength room maintenance',
      'Preventative maintenance programs',
    ],
    whyChooseUs: [
      'All major strength brands serviced',
      'Commercial and residential experience',
      'Onsite repair across all of DFW',
      'SmartGymOps service tracking',
      'Same-day availability for emergencies',
      '500+ five-star reviews',
    ],
    metaTitle: 'Strength Equipment Repair Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Strength equipment repair in Dallas Fort Worth. Cable machines, functional trainers, selectorized machines, and plate-loaded equipment serviced by 2EZ TEK.',
  },
  {
    slug: 'cable-machine-repair-dallas',
    name: 'Cable Machine Repair Dallas Fort Worth',
    shortName: 'Cable Machine Repair',
    tagline: 'Expert Cable Machine Repair in Dallas Fort Worth',
    overview:
      '2EZ TEK provides professional cable machine repair across Dallas Fort Worth. From dual cable crosses and functional trainers to selectorized cable stacks and lat pulldown machines, we diagnose and repair cable systems quickly to minimize downtime.',
    equipmentTypes: [
      'Dual Cable Cross Machines',
      'Functional Trainers',
      'Lat Pulldown / Row Machines',
      'Cable Crossover Stations',
      'Selectorized Cable Stacks',
      'Multi-Functional Cable Systems',
      'Commercial Cable Equipment',
    ],
    commonIssues: [
      'Cable fraying, kinking, or snapping',
      'Pulley bearing wear or failure',
      'Weight stack pin and selector issues',
      'Cable tension imbalance',
      'Carabiner and attachment wear',
      'Frame and upright structural issues',
      'Handle and attachment damage',
    ],
    repairServices: [
      'Full cable replacement',
      'Pulley and bearing replacement',
      'Weight stack and selector service',
      'Cable tension adjustment and calibration',
      'Carabiner and attachment replacement',
      'Structural inspection and repair',
      'Full cable machine tune-up',
      'Preventative maintenance programs',
    ],
    whyChooseUs: [
      'All cable machine brands and types',
      'Onsite repair across DFW',
      'Commercial facility specialists',
      'SmartGymOps service tracking',
      'Fast turnaround to minimize downtime',
      '500+ five-star reviews',
    ],
    metaTitle: 'Cable Machine Repair Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Cable machine repair in Dallas Fort Worth. Functional trainers, dual cable cross, lat pulldowns, and selectorized cable stacks serviced by 2EZ TEK.',
  },
]

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find((s) => s.slug === slug)
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.slug)
}