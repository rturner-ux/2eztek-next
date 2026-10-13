// Static text for BookingModal in English and Spanish. Dynamic/AI-generated
// text (diagnosis, equipment summary, intake brief, date-recommendation
// explanations, follow-up chat answers) is translated separately by passing
// `lang` through to the relevant API routes, not from this dictionary.

export type Lang = 'en' | 'es'

export const bookingT = {
  en: {
    estimateRequest: 'Estimate Request',
    serviceRequest: 'Service Request',
    titleEstimate: "Tell us about your equipment and we'll get you a price.",
    titleService: 'Tell us what you need repaired or installed.',
    close: 'Close booking modal',

    fullName: 'Full Name *',
    phoneNumber: 'Phone Number *',
    emailAddress: 'Email Address *',
    streetAddress: 'Street Address *',
    city: 'City *',
    state: 'State',
    zip: 'ZIP *',
    equipmentType: 'Equipment Type (e.g. Treadmill)',
    brandModel: 'Brand / Model (e.g. NordicTrack X22i)',
    details: 'Describe the issue or project details',
    searchQuery: 'What did you type in Google, ChatGPT, etc. to find us? (optional)',

    consent: 'I agree to receive text messages from 2EZ TEK about my appointment (confirmations, reminders, and updates). Message and data rates may apply. Message frequency varies. Reply STOP to opt out at any time.',
    consentNote: 'This is optional. We can still schedule your appointment without text updates. See our',
    privacyPolicy: 'Privacy Policy',
    and: 'and',
    termsOfService: 'Terms of Service',

    serviceTypes: {
      'Residential Service': 'Residential Service',
      'Commercial Service': 'Commercial Service',
      'Repair': 'Repair',
      'Installation': 'Installation',
      'Assembly': 'Assembly',
      'Preventative Maintenance': 'Preventative Maintenance',
      'Emergency Repair': 'Emergency Repair',
    } as Record<string, string>,

    errors: {
      nameRequired: 'Name is required',
      phoneRequired: 'Phone is required',
      phoneInvalid: 'Enter a valid phone number',
      emailRequired: 'Email is required',
      emailInvalid: 'Enter a valid email',
      addressRequired: 'Street address is required',
      cityRequired: 'City is required',
      zipRequired: 'ZIP code is required',
      zipInvalid: 'Enter a valid ZIP code',
    },

    calculatingDistance: 'Calculating distance…',
    milesFromShop: (miles: number) => `📍 ~${miles} miles from our shop`,
    pleaseCallToConfirmCoverage: ', please call to confirm coverage',

    lookingUpEquipment: 'Looking up your equipment…',
    aiEquipmentBrief: '2EZ TEK AI Equipment Brief',
    helpUsPrepare: 'Help us prepare',
    answerInDetailsBelow: 'Answer in the details field below',

    aiPhotoDiagnosis: 'AI Photo Diagnosis',
    optional: 'Optional',
    uploadPhotosHint: 'Upload photos and our AI will analyze the first one instantly.',
    tapToUpload: 'Tap to upload or take photos',
    addPhoto: 'Add photo',
    analyzingEquipment: 'Analyzing your equipment…',
    aiAssessment: 'AI Assessment',

    preferredAppointment: 'Preferred Appointment',
    pickDateHint: 'Pick a preferred date (Mon–Sat)',
    dimmedDatesHint: ' — dimmed dates are already tight for your area',
    dateTightTitle: 'Our route is already tight in your area that day, but you can still pick it',
    preferredTimeWindow: 'Preferred time window:',
    checkingEfficiency: 'Checking schedule efficiency for that date…',
    moreEfficientDate: '💡 A more efficient date is available',
    mayNeedReschedule: '⚠ This date may need to be rescheduled later',
    useThisDate: 'Use This Date',
    keepMyDate: 'Keep My Date',

    requiredFieldsNote: 'required fields. We will call to confirm your appointment date and time.',
    submitting: 'Submitting…',
    submitEstimate: 'Submit Estimate Request',
    submitService: 'Submit Service Request',

    // Confirmation screen
    youreConfirmed: "You're Confirmed",
    realAvailabilityChecked: 'Real availability was checked, this is locked in, not a placeholder.',
    requestReceived: 'Request Received',
    willCallToConfirm: (phone: string) => `We will call you at ${phone} to confirm.`,
    hoursNote: 'Mon–Sat, 8 am–6 pm. Usually within the hour.',
    yourConfirmedAppointment: 'Your Confirmed Appointment',
    yourRequestedAppointment: 'Your Requested Appointment',
    date: 'Date',
    timeWindow: 'Time Window',
    aiAssessmentBrief: '2EZ TEK AI Assessment',
    whatTechWillKnow: 'What our technician will know before arriving',
    whatToExpect: 'What to Expect',
    aiFoundArticles: 'Our AI found these articles for your situation',
    browseAllGuides: 'Browse all repair guides',
    askUsAnything: 'Ask us anything about your appointment',
    askPlaceholder: 'e.g. Do I need to be home the whole time?',
    ask: 'Ask',
    callUs: 'Call Us',
    done: 'Done',

    // Date conflict popup
    dateFullyBooked: 'Date Fully Booked',
    dateNotAvailable: 'Date Not Available',
    fullyBookedExplanation: 'That day is already full. Pick another date below and we will get you scheduled.',
    notAvailableExplanation: 'Our technician already has appointments in a different area of DFW on that day. Please choose a different date and we will get you scheduled.',
    suggestedDates: 'Suggested dates',
    nearYourArea: 'near your area',
    chooseDifferentDate: 'Choose a Different Date',
    callUsInstead: 'Call Us Instead',

    // Error popup
    unableToSubmit: 'Unable to Submit',
    tryAgain: 'Try Again',
    genericError: (phone: string) => `Something went wrong. Please call ${phone} or try again.`,

    timeWindows: {
      morning:   { label: 'Morning',   sub: '8 am – 12 pm' },
      afternoon: { label: 'Afternoon', sub: '12 pm – 5 pm'  },
      'all-day': { label: 'All Day',   sub: 'Flexible'      },
      asap:      { label: 'ASAP',      sub: 'Urgent'        },
    },

    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    asapLabel: 'ASAP',
  },

  es: {
    estimateRequest: 'Solicitud de Presupuesto',
    serviceRequest: 'Solicitud de Servicio',
    titleEstimate: 'Cuéntenos sobre su equipo y le daremos un precio.',
    titleService: 'Díganos qué necesita reparar o instalar.',
    close: 'Cerrar formulario',

    fullName: 'Nombre Completo *',
    phoneNumber: 'Número de Teléfono *',
    emailAddress: 'Correo Electrónico *',
    streetAddress: 'Dirección *',
    city: 'Ciudad *',
    state: 'Estado',
    zip: 'Código Postal *',
    equipmentType: 'Tipo de Equipo (ej. Caminadora)',
    brandModel: 'Marca / Modelo (ej. NordicTrack X22i)',
    details: 'Describa el problema o detalles del proyecto',
    searchQuery: '¿Qué escribió en Google, ChatGPT, etc. para encontrarnos? (opcional)',

    consent: 'Acepto recibir mensajes de texto de 2EZ TEK sobre mi cita (confirmaciones, recordatorios y actualizaciones). Pueden aplicar tarifas de mensajes y datos. La frecuencia de los mensajes varía. Responda STOP para cancelar en cualquier momento.',
    consentNote: 'Esto es opcional. Podemos programar su cita sin mensajes de texto. Consulte nuestra',
    privacyPolicy: 'Política de Privacidad',
    and: 'y',
    termsOfService: 'Términos de Servicio',

    serviceTypes: {
      'Residential Service': 'Servicio Residencial',
      'Commercial Service': 'Servicio Comercial',
      'Repair': 'Reparación',
      'Installation': 'Instalación',
      'Assembly': 'Ensamblaje',
      'Preventative Maintenance': 'Mantenimiento Preventivo',
      'Emergency Repair': 'Reparación de Emergencia',
    } as Record<string, string>,

    errors: {
      nameRequired: 'El nombre es obligatorio',
      phoneRequired: 'El teléfono es obligatorio',
      phoneInvalid: 'Ingrese un número de teléfono válido',
      emailRequired: 'El correo electrónico es obligatorio',
      emailInvalid: 'Ingrese un correo electrónico válido',
      addressRequired: 'La dirección es obligatoria',
      cityRequired: 'La ciudad es obligatoria',
      zipRequired: 'El código postal es obligatorio',
      zipInvalid: 'Ingrese un código postal válido',
    },

    calculatingDistance: 'Calculando distancia…',
    milesFromShop: (miles: number) => `📍 ~${miles} millas de nuestro taller`,
    pleaseCallToConfirmCoverage: ', por favor llame para confirmar cobertura',

    lookingUpEquipment: 'Buscando información de su equipo…',
    aiEquipmentBrief: 'Resumen de Equipo con IA de 2EZ TEK',
    helpUsPrepare: 'Ayúdenos a prepararnos',
    answerInDetailsBelow: 'Responda en el campo de detalles abajo',

    aiPhotoDiagnosis: 'Diagnóstico de Foto con IA',
    optional: 'Opcional',
    uploadPhotosHint: 'Suba fotos y nuestra IA analizará la primera al instante.',
    tapToUpload: 'Toque para subir o tomar fotos',
    addPhoto: 'Agregar foto',
    analyzingEquipment: 'Analizando su equipo…',
    aiAssessment: 'Evaluación de IA',

    preferredAppointment: 'Cita Preferida',
    pickDateHint: 'Elija una fecha preferida (Lun–Sáb)',
    dimmedDatesHint: ' — las fechas atenuadas ya están ajustadas en su área',
    dateTightTitle: 'Nuestra ruta ya está ajustada en su área ese día, pero aún puede elegirla',
    preferredTimeWindow: 'Horario preferido:',
    checkingEfficiency: 'Verificando eficiencia del horario para esa fecha…',
    moreEfficientDate: '💡 Hay una fecha más eficiente disponible',
    mayNeedReschedule: '⚠ Esta fecha podría necesitar reprogramarse después',
    useThisDate: 'Usar Esta Fecha',
    keepMyDate: 'Mantener Mi Fecha',

    requiredFieldsNote: 'campos obligatorios. Le llamaremos para confirmar la fecha y hora de su cita.',
    submitting: 'Enviando…',
    submitEstimate: 'Enviar Solicitud de Presupuesto',
    submitService: 'Enviar Solicitud de Servicio',

    // Confirmation screen
    youreConfirmed: 'Confirmado',
    realAvailabilityChecked: 'Se verificó la disponibilidad real, esto está confirmado, no es un marcador de posición.',
    requestReceived: 'Solicitud Recibida',
    willCallToConfirm: (phone: string) => `Le llamaremos al ${phone} para confirmar.`,
    hoursNote: 'Lun–Sáb, 8 am–6 pm. Generalmente dentro de la hora.',
    yourConfirmedAppointment: 'Su Cita Confirmada',
    yourRequestedAppointment: 'Su Cita Solicitada',
    date: 'Fecha',
    timeWindow: 'Horario',
    aiAssessmentBrief: 'Evaluación de IA de 2EZ TEK',
    whatTechWillKnow: 'Lo que nuestro técnico sabrá antes de llegar',
    whatToExpect: 'Qué Esperar',
    aiFoundArticles: 'Nuestra IA encontró estos artículos para su situación',
    browseAllGuides: 'Ver todas las guías de reparación',
    askUsAnything: 'Pregúntenos lo que quiera sobre su cita',
    askPlaceholder: 'ej. ¿Necesito estar en casa todo el tiempo?',
    ask: 'Preguntar',
    callUs: 'Llámenos',
    done: 'Listo',

    // Date conflict popup
    dateFullyBooked: 'Fecha Totalmente Reservada',
    dateNotAvailable: 'Fecha No Disponible',
    fullyBookedExplanation: 'Ese día ya está lleno. Elija otra fecha abajo y lo programaremos.',
    notAvailableExplanation: 'Nuestro técnico ya tiene citas en otra área de DFW ese día. Por favor elija otra fecha y lo programaremos.',
    suggestedDates: 'Fechas sugeridas',
    nearYourArea: 'cerca de su área',
    chooseDifferentDate: 'Elegir Otra Fecha',
    callUsInstead: 'Llámenos en su Lugar',

    // Error popup
    unableToSubmit: 'No se Pudo Enviar',
    tryAgain: 'Intentar de Nuevo',
    genericError: (phone: string) => `Algo salió mal. Por favor llame al ${phone} o intente de nuevo.`,

    timeWindows: {
      morning:   { label: 'Mañana', sub: '8 am – 12 pm' },
      afternoon: { label: 'Tarde',  sub: '12 pm – 5 pm'  },
      'all-day': { label: 'Todo el Día', sub: 'Flexible' },
      asap:      { label: 'Urgente', sub: 'Urgente'      },
    },

    days: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    asapLabel: 'URGENTE',
  },
} as const

export type BookingDict = typeof bookingT['en']
