// lib/serviceData.ts

export interface ServiceFaq {
  question: string
  answer: string
}

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
  faqs?: ServiceFaq[]
}

export const services: ServiceData[] = [
  {
    slug: 'treadmill-repair-dallas',
    name: 'Treadmill Repair Dallas Fort Worth',
    shortName: 'Treadmill Repair',
    tagline: 'Professional Treadmill Repair in Dallas Fort Worth',
    overview:
      'A broken treadmill disrupts your routine and can become a bigger problem if left unaddressed. 2EZ TEK provides expert treadmill repair across Dallas Fort Worth for both residential and commercial clients, fast diagnostics, quality parts, and lasting repairs on all major brands.',
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
      'Onsite repair, we come to you across DFW',
      'All major brands serviced',
      'Residential and commercial experience',
      'SmartGymOps-powered service tracking',
      'Transparent diagnostics before any work begins',
      '500+ five-star reviews across Dallas Fort Worth',
    ],
    metaTitle: 'Treadmill Repair Dallas Fort Worth | 2EZ TEK',
    metaDescription:
      'Professional treadmill repair in Dallas Fort Worth. Belt replacement, motor repair, incline failures, console issues, and more. Call 2EZ TEK for fast onsite service.',
    faqs: [
      {
        question: 'How much does treadmill repair cost in Dallas?',
        answer: 'Treadmill repair in Dallas typically ranges from $100 to $400 depending on the issue. Belt replacement and lubrication usually fall in the $100 to $175 range. Motor or controller board repairs run $200 to $400. 2EZ TEK provides a diagnostic quote before any work begins so there are no surprises.',
      },
      {
        question: 'How long does treadmill repair take?',
        answer: 'Most treadmill repairs are completed in a single visit, typically 1 to 2 hours. 2EZ TEK technicians carry common parts on every truck, so belt replacements, lubrication, incline motor service, and many console repairs are resolved same day.',
      },
      {
        question: 'Do you repair NordicTrack and ProForm treadmills?',
        answer: 'Yes. 2EZ TEK services NordicTrack, ProForm, Bowflex, Peloton, Life Fitness, Precor, Matrix, Sole, Horizon, and most other major treadmill brands across Dallas Fort Worth.',
      },
      {
        question: 'Is it worth repairing a treadmill or should I replace it?',
        answer: 'In most cases repair is more cost-effective than replacement. If the repair cost is under 50% of the machine\'s replacement value, repair is almost always the better choice. 2EZ TEK provides an honest diagnostic before any work so you can make an informed decision.',
      },
      {
        question: 'Do you come to my home or do I have to bring the treadmill in?',
        answer: '2EZ TEK is fully mobile. Technicians come directly to your home, apartment, hotel, or gym anywhere in Dallas Fort Worth, no haul-away required. You stay home while we fix it onsite.',
      },
      {
        question: 'What areas in Dallas Fort Worth do you serve for treadmill repair?',
        answer: '2EZ TEK provides treadmill repair across Dallas, Fort Worth, Plano, Frisco, McKinney, Allen, Arlington, Irving, Richardson, Carrollton, Addison, Garland, Mesquite, Denton, Lewisville, Flower Mound, Southlake, Grapevine, and surrounding DFW communities.',
      },
    ],
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
      'Power issues, won\'t turn on',
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
    faqs: [
      {
        question: 'How much does elliptical repair cost in Dallas?',
        answer: 'Elliptical repair in Dallas Fort Worth typically costs between $100 and $350. Squeaking and drive belt service usually run $100 to $175. Resistance system and console repairs are typically $150 to $300. 2EZ TEK provides a firm quote after the initial diagnostic.',
      },
      {
        question: 'Why is my elliptical squeaking or making grinding noises?',
        answer: 'Squeaking on an elliptical is usually caused by dry or worn drive belts, worn pedal arm bushings, or loose flywheel hardware. Grinding typically points to bearing failure. 2EZ TEK technicians diagnose the exact cause onsite and repair it in a single visit in most cases.',
      },
      {
        question: 'Do you repair Precor, Life Fitness, and commercial ellipticals?',
        answer: 'Yes. 2EZ TEK services commercial ellipticals from Precor, Life Fitness, Matrix, Cybex, Technogym, Star Trac, and other commercial brands, as well as residential models from NordicTrack, ProForm, Bowflex, Sole, and more.',
      },
      {
        question: 'Can you fix an elliptical with resistance problems?',
        answer: 'Yes. Resistance issues are one of the most common elliptical repairs. Whether the resistance is stuck at one level, not responding, or completely gone, 2EZ TEK technicians diagnose the eddy brake, servo motor, or control board and repair it onsite.',
      },
      {
        question: 'How long does elliptical repair take?',
        answer: 'Most elliptical repairs are completed in one visit, typically 1 to 2 hours. 2EZ TEK carries common parts on every service truck so belt replacements, bearing swaps, and resistance system repairs can often be done the same day.',
      },
    ],
  },
  {
    slug: 'exercise-bike-repair-dallas',
    name: 'Exercise Bike Repair Dallas Fort Worth',
    shortName: 'Exercise Bike Repair',
    tagline: 'Professional Exercise Bike Repair in Dallas Fort Worth',
    overview:
      '2EZ TEK services all types of exercise bikes across Dallas Fort Worth, from upright and recumbent bikes to indoor cycling bikes and air bikes. We diagnose and repair resistance issues, console failures, flywheel problems, and more for both home and commercial clients.',
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
    faqs: [
      {
        question: 'How much does exercise bike repair cost in Dallas?',
        answer: 'Exercise bike repair in Dallas typically costs $75 to $275 depending on the issue. Resistance and drive belt repairs usually run $100 to $200. Console and display repairs are typically $100 to $250. 2EZ TEK provides a diagnostic estimate before any work starts.',
      },
      {
        question: 'Do you repair Peloton bikes?',
        answer: 'Yes. 2EZ TEK services Peloton bikes for mechanical issues including resistance motor failures, drive belt wear, crank and pedal problems, and touchscreen issues. We are not Peloton-authorized but our technicians are experienced with all Peloton models.',
      },
      {
        question: 'Why is my exercise bike resistance not working?',
        answer: 'Exercise bike resistance issues are commonly caused by a failed magnetic resistance unit, a worn or snapped drive belt, a faulty console control board, or a damaged servo motor. 2EZ TEK diagnoses the exact component onsite and repairs it in most cases during the same visit.',
      },
      {
        question: 'Do you repair spin bikes and indoor cycling bikes?',
        answer: 'Yes. 2EZ TEK services all spin and indoor cycling bikes including Peloton, Schwinn, NordicTrack, ProForm, Keiser, and commercial models. We handle flywheel issues, drive belt replacements, resistance adjustments, and console repairs.',
      },
      {
        question: 'How long does exercise bike repair take?',
        answer: 'Most exercise bike repairs take 45 minutes to 2 hours and are completed in a single visit. 2EZ TEK carries common replacement parts on every truck to resolve most repairs same day.',
      },
    ],
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
    faqs: [
      {
        question: 'How much does fitness equipment assembly cost in Dallas?',
        answer: 'Fitness equipment assembly in Dallas Fort Worth typically costs $75 to $200 per piece depending on the equipment type and complexity. Treadmill assembly is usually $100 to $150. Full home gym systems and functional trainers run $150 to $300. 2EZ TEK provides a flat-rate quote before the appointment.',
      },
      {
        question: 'Do you assemble equipment purchased from Amazon, Dick\'s Sporting Goods, or NordicTrack?',
        answer: 'Yes. 2EZ TEK assembles fitness equipment regardless of where it was purchased. We bring the right tools, follow the manufacturer assembly guide, and calibrate the machine before we leave.',
      },
      {
        question: 'How long does fitness equipment assembly take?',
        answer: 'A single piece like a treadmill or elliptical typically takes 1 to 2 hours to assemble. Multi-piece home gym systems may take 3 to 5 hours. 2EZ TEK schedules enough time to complete the full assembly in one visit.',
      },
      {
        question: 'Do you also do commercial gym equipment installation?',
        answer: 'Yes. 2EZ TEK handles commercial fitness equipment installation for hotels, apartment complexes, corporate fitness rooms, training studios, and health clubs across Dallas Fort Worth. Multi-unit projects are welcome.',
      },
      {
        question: 'Do you move and reassemble existing equipment?',
        answer: 'Yes. 2EZ TEK provides relocation and reassembly services. Whether you are moving to a new home or rearranging your gym, we disassemble, transport within the facility, and reassemble with post-move calibration.',
      },
    ],
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
    faqs: [
      {
        question: 'How much does home gym installation cost in Dallas?',
        answer: 'Home gym installation in Dallas Fort Worth depends on scope. A single-machine setup runs $100 to $200. A multi-piece home gym with 3 to 6 machines typically costs $350 to $800. Full luxury home gym build-outs with 10 or more pieces are quoted on a project basis. 2EZ TEK provides a fixed quote before any work begins.',
      },
      {
        question: 'Can you help me plan the layout of my home gym?',
        answer: 'Yes. 2EZ TEK technicians offer placement and layout guidance as part of every installation. We help you optimize equipment spacing for safety, movement flow, and best use of the room.',
      },
      {
        question: 'Do you install rubber flooring or gym mats?',
        answer: 'While our specialty is equipment assembly and installation, we work alongside flooring installers and can recommend the right mat placement under each piece of equipment during the setup.',
      },
      {
        question: 'What home gym brands do you install?',
        answer: 'We install equipment from all major brands including NordicTrack, ProForm, Bowflex, Life Fitness, Precor, Matrix, Rogue, Body-Solid, Inspire Fitness, Hammer Strength, and most others available in the US market.',
      },
      {
        question: 'Do you offer ongoing maintenance after installation?',
        answer: 'Yes. 2EZ TEK offers preventative maintenance programs for home gyms after installation. Quarterly and annual maintenance visits keep your equipment performing safely and extend its lifespan.',
      },
    ],
  },
  {
    slug: 'preventative-maintenance-dallas',
    name: 'Fitness Equipment Preventative Maintenance Dallas',
    shortName: 'Preventative Maintenance',
    tagline: 'Preventative Maintenance for Fitness Equipment in Dallas Fort Worth',
    overview:
      '2EZ TEK provides preventative maintenance programs for residential and commercial fitness equipment across Dallas Fort Worth. Regular maintenance extends equipment life, prevents costly breakdowns, and keeps your machines performing at their best, powered by SmartGymOps service tracking.',
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
    faqs: [
      {
        question: 'How much does fitness equipment preventative maintenance cost in Dallas?',
        answer: 'Preventative maintenance for fitness equipment in Dallas typically runs $75 to $150 per machine per visit for residential equipment. Commercial maintenance contracts for apartment gyms, hotels, and health clubs are priced based on machine count and visit frequency. Contact 2EZ TEK for a custom quote.',
      },
      {
        question: 'How often should treadmills and ellipticals be serviced?',
        answer: 'Light home use equipment should be serviced annually. Moderate residential use benefits from twice-yearly service. Commercial equipment in apartments, hotels, and gyms should be serviced quarterly. High-traffic commercial equipment may need monthly attention.',
      },
      {
        question: 'What is included in a preventative maintenance visit?',
        answer: 'A 2EZ TEK preventative maintenance visit includes belt lubrication and tension check, drive system inspection, roller and deck inspection, console and electrical systems check, hardware tightening, overall safety inspection, and a documented service report via SmartGymOps.',
      },
      {
        question: 'Do you offer maintenance contracts for apartment complexes and hotels?',
        answer: 'Yes. 2EZ TEK provides ongoing maintenance contracts for apartment fitness centers, hotel gyms, corporate wellness rooms, and training studios across Dallas Fort Worth. Contracts include scheduled visits, priority service response, and SmartGymOps tracking with QR reports for facility managers.',
      },
      {
        question: 'What brands of commercial equipment do you maintain?',
        answer: 'We maintain all major commercial brands including Life Fitness, Precor, Matrix, Cybex, Technogym, Hammer Strength, Star Trac, StairMaster, and all NordicTrack, ProForm, Bowflex, and Peloton commercial-grade equipment.',
      },
    ],
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
    faqs: [
      {
        question: 'How much does strength equipment repair cost in Dallas?',
        answer: 'Strength equipment repair in Dallas Fort Worth typically ranges from $75 to $400. Cable replacement on a selectorized machine usually runs $100 to $200. Pulley and bearing replacement costs $75 to $150 per pulley. Upholstery and pad replacement is $100 to $250 per pad. 2EZ TEK quotes every job before work begins.',
      },
      {
        question: 'How do I know if my cable machine cable needs to be replaced?',
        answer: 'Signs that a cable needs replacement include visible fraying or kinking, popping or snapping sounds during use, uneven resistance, or a broken strand. 2EZ TEK recommends replacing cables that show any fraying immediately as worn cables are a safety hazard.',
      },
      {
        question: 'Do you repair Life Fitness, Cybex, and Hammer Strength machines?',
        answer: 'Yes. 2EZ TEK services commercial strength equipment from Life Fitness, Cybex, Hammer Strength, Matrix, Precor, Technogym, Body-Solid, Inspire Fitness, and most other commercial and residential strength brands.',
      },
      {
        question: 'Do you repair functional trainers and cable crossover machines?',
        answer: 'Yes. Functional trainers and cable crossover machines are among our most common strength equipment repairs. We replace cables, pulleys, weight stacks, selector pins, and perform full overhauls on all major cable machine brands.',
      },
      {
        question: 'Can you repair strength equipment at a commercial gym?',
        answer: 'Yes. 2EZ TEK serves commercial gyms, hotel fitness centers, apartment complexes, training studios, and corporate wellness facilities across Dallas Fort Worth. We offer same-day emergency service for commercial clients to minimize downtime.',
      },
    ],
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
    faqs: [
      {
        question: 'How much does cable machine repair cost in Dallas?',
        answer: 'Cable machine repair in Dallas Fort Worth typically costs $100 to $300. A full cable replacement on a dual cable cross or functional trainer usually runs $150 to $250 including parts and labor. Pulley and bearing replacements are typically $75 to $150 per station. 2EZ TEK provides a flat quote before any work starts.',
      },
      {
        question: 'How long does cable replacement take?',
        answer: 'A single cable replacement on a lat pulldown or selectorized machine takes about 45 minutes to 1 hour. A full dual cable cross or functional trainer cable replacement with both stacks takes 1.5 to 3 hours. Most cable jobs are completed in one visit.',
      },
      {
        question: 'How often should cable machine cables be replaced?',
        answer: 'Commercial cable machines in high-use gyms should have cables inspected every 6 months and replaced every 1 to 3 years depending on use. Home cable machines can go 3 to 5 years between replacements. Any visible fraying should be addressed immediately.',
      },
      {
        question: 'Do you carry cable machine replacement parts?',
        answer: 'Yes. 2EZ TEK stocks common cable sizes and pulleys on every service truck. For less common or commercial-grade parts we typically source and schedule a follow-up visit within a few days.',
      },
      {
        question: 'Do you repair cable machines at gyms and apartment complexes?',
        answer: 'Yes. 2EZ TEK is a preferred vendor for commercial cable machine repair at gyms, hotels, apartment complexes, and training studios across Dallas Fort Worth. We offer priority scheduling for commercial facilities.',
      },
    ],
  },
]

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find((s) => s.slug === slug)
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.slug)
}