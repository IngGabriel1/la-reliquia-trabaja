import type { JobPosting, PortfolioItem, Profile } from './types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN (ficticios) — COMUNIDAD LA RELIQUIA
// Se muestran solo si Supabase no está configurado, o cuando la Junta pulsa
// "Cargar datos de demostración" en el panel de administración.
// Los ids son UUID fijos para que cargar/quitar la demostración sea idempotente.
// ============================================================================

export const DEMO_PROFILE_IDS: string[] = ['a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000006'];
export const DEMO_JOB_IDS: string[] = ['c0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000004'];

// Generador de imágenes SVG ilustrativas para portafolios semilla
export const createSvgPortfolioDataUri = (title: string, subtitle: string, bgHex: string, accentHex: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgHex}" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="800" height="520" fill="url(#bg)" />
    <circle cx="700" cy="90" r="160" fill="${accentHex}" opacity="0.18" />
    <circle cx="110" cy="440" r="210" fill="${accentHex}" opacity="0.12" />
    <rect x="48" y="48" width="704" height="424" rx="24" fill="none" stroke="${accentHex}" stroke-width="2" stroke-opacity="0.4" />
    <rect x="80" y="88" width="220" height="36" rx="18" fill="${accentHex}" />
    <text x="190" y="112" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">PORTAFOLIO VERIFICADO</text>
    <text x="80" y="230" font-family="system-ui, sans-serif" font-size="36" font-weight="800" fill="#ffffff">${title}</text>
    <text x="80" y="280" font-family="system-ui, sans-serif" font-size="22" font-weight="500" fill="#e2e8f0">${subtitle}</text>
    <text x="80" y="420" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="${accentHex}">Barrio La Reliquia • Villavicencio, Meta</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    ownerId: null,
    name: 'Carlos Julio Garzón',
    profession: 'Maestro de Obra Blanca y Enchape',
    category: 'construccion',
    sector: 'Sector 2 - La Reliquia',
    experienceYears: 14,
    skills: ['Enchape de baños y cocinas', 'Estuco plástico', 'Drywall y cielo raso', 'Pintura profesional', 'Impermeabilización'],
    bio: 'Maestro de construcción habitante de La Reliquia desde hace 12 años. Especialista en acabados de obra blanca, remodelación de cocinas, enchape cerámico y porcelanato con nivelación láser. Presupuestos honestos sin compromiso dentro del barrio y todo Villavicencio.',
    availability: 'Disponible ahora',
    whatsapp: '3114567890',
    email: 'carlos.garzon.obra@ejemplo.co',
    consentHabeasData: true,
    consentHabeasDataAt: null,
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.9,
    completedJobs: 64,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    ownerId: null,
    name: 'Luz Marina Castañeda',
    profession: 'Modista y Confeccionista Textil',
    category: 'confeccion',
    sector: 'Sector 1 - La Reliquia',
    experienceYears: 18,
    skills: ['Uniformes escolares', 'Dotaciones empresariales', 'Ropa deportiva', 'Máquina plana y fileteadora', 'Arreglos sobre medida'],
    bio: 'Cuento con taller propio de confección en el Sector 1 con máquina plana industrial, fileteadora y collarín. Confecciono uniformes para colegios de La Reliquia, conjuntos deportivos, dotaciones y arreglos de alta calidad.',
    availability: 'Por contrato o proyecto',
    whatsapp: '3129876543',
    email: 'luzmarina.modas@ejemplo.co',
    consentHabeasData: true,
    consentHabeasDataAt: null,
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 5.0,
    completedJobs: 112,
    createdAt: '2025-01-12T14:30:00Z',
    updatedAt: '2025-01-12T14:30:00Z'
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    ownerId: null,
    name: 'Jhonier Andrés Vargas',
    profession: 'Técnico Mecánico de Motos y Bicicletas',
    category: 'mecanica',
    sector: 'Zona Comercial Principal',
    experienceYears: 8,
    skills: ['Sincronización y carburación', 'Sistema eléctrico de motos', 'Frenos y kit de arrastre', 'Mantenimiento de bicicletas MTB', 'Despinchado a domicilio'],
    bio: 'Técnico certificado en mecánica de motocicletas de 2 y 4 tiempos (Bajaj, Yamaha, Honda, AKT, Suzuki). Servicio de taller en la calle principal y rescate/despinchado a domicilio en La Reliquia y Trece de Mayo.',
    availability: 'Disponible ahora',
    whatsapp: '3205551234',
    email: 'jhonier.motos@ejemplo.co',
    consentHabeasData: true,
    consentHabeasDataAt: null,
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.8,
    completedJobs: 89,
    createdAt: '2025-01-15T09:15:00Z',
    updatedAt: '2025-01-15T09:15:00Z'
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    ownerId: null,
    name: 'Yeimy Paola Poveda',
    profession: 'Tecnóloga en Sistemas y Soporte Técnico',
    category: 'tecnologia',
    sector: 'Sector 3 - La Reliquia',
    experienceYears: 5,
    skills: ['Mantenimiento de PC y portátiles', 'Instalación de cámaras CCTV', 'Configuración de routers Wi-Fi', 'Trámites digitales y hojas de vida', 'Diseño de piezas para negocios'],
    bio: 'Ayudo a las familias y comercios de La Reliquia a mantener sus equipos rápidos y seguros. Formateo, cambio a disco sólido SSD, instalación de cámaras de seguridad para tiendas y asesoría en diseño para redes sociales.',
    availability: 'Medio tiempo / Por horas',
    whatsapp: '3154443322',
    email: 'yeimy.sistemas@ejemplo.co',
    consentHabeasData: true,
    consentHabeasDataAt: null,
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.9,
    completedJobs: 41,
    createdAt: '2025-01-18T16:00:00Z',
    updatedAt: '2025-01-18T16:00:00Z'
  },
  {
    id: 'a0000000-0000-4000-8000-000000000005',
    ownerId: null,
    name: 'Álvaro Hernán Ríos',
    profession: 'Maestro Panadero y Amasijos Llaneros',
    category: 'gastronomia',
    sector: 'Sector 4 - La Reliquia',
    experienceYears: 20,
    skills: ['Pan de arroz llanero', 'Tungos y envueltos', 'Pastelería y tortas frías', 'Manejo de hornos rotativos', 'Producción por encargo'],
    bio: 'Panadero tradicional del Meta con 20 años de experiencia. Elaboro pan de arroz, almojábanas, roscones y tortas para eventos familiares o para surtir cafeterías y tiendas del barrio. También disponible para turnos en panaderías.',
    availability: 'Disponible ahora',
    whatsapp: '3102229988',
    email: 'alvaro.panaderia@ejemplo.co',
    consentHabeasData: true,
    consentHabeasDataAt: null,
    consentPublicWhatsapp: false,
    status: 'approved',
    verified: false,
    rating: 4.7,
    completedJobs: 53,
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-01-20T08:00:00Z'
  },
  {
    id: 'a0000000-0000-4000-8000-000000000006',
    ownerId: null,
    name: 'Cristian Camilo Mora',
    profession: 'Técnico Electricista y Plomero Residencial',
    category: 'electricidad',
    sector: 'Sector Polideportivo / Colegio',
    experienceYears: 9,
    skills: ['Instalaciones RETIE', 'Tableros de tacos y brekers', 'Reparación de fugas de agua', 'Lavado de tanques elevados', 'Instalación de duchas y grifería'],
    bio: 'Técnico electricista con matrícula CONTE. Soluciono cortos eléctricos, independización de circuitos para contadores en casas de varios pisos, instalación de bombas de agua y plomería general.',
    availability: 'Disponible ahora',
    whatsapp: '3187776655',
    email: 'camilo.electrico@ejemplo.co',
    consentHabeasData: true,
    consentHabeasDataAt: null,
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.9,
    completedJobs: 77,
    createdAt: '2025-01-22T11:30:00Z',
    updatedAt: '2025-01-22T11:30:00Z'
  }
];

export const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'b0000000-0000-4000-8000-000000000001',
    profileId: 'a0000000-0000-4000-8000-000000000001',
    workerName: 'Carlos Julio Garzón',
    title: 'Remodelación Total de Cocina Integral - Sector 2',
    description: 'Enchape en cerámica tipo metro, mesón en granito pulido e instalación de cielo raso en PVC con luces LED empotradas.',
    imageUrl: createSvgPortfolioDataUri('Cocina Integral Enchapada', 'Porcelanato + Mesón y Luces LED • Sector 2', '#1e3a8a', '#3b82f6'),
    storagePath: null,
    fileFormat: 'image/svg+xml',
    fileSizeKB: 42,
    createdAt: '2025-01-25T15:00:00Z',
    status: 'approved'
  },
  {
    id: 'b0000000-0000-4000-8000-000000000002',
    profileId: 'a0000000-0000-4000-8000-000000000001',
    workerName: 'Carlos Julio Garzón',
    title: 'Acabado de Fachada y Estuco Plástico Exterior',
    description: 'Resane general de fachada de dos pisos en La Reliquia, aplicación de koraza impermeable y enchape decorativo.',
    imageUrl: createSvgPortfolioDataUri('Fachada Impermeabilizada', 'Estuco Exterior y Pintura Koraza 2 Pisos', '#0f172a', '#3b82f6'),
    storagePath: null,
    fileFormat: 'image/svg+xml',
    fileSizeKB: 38,
    createdAt: '2025-01-28T11:20:00Z',
    status: 'approved'
  },
  {
    id: 'b0000000-0000-4000-8000-000000000003',
    profileId: 'a0000000-0000-4000-8000-000000000002',
    workerName: 'Luz Marina Castañeda',
    title: 'Lote de 40 Sudaderas y Camisetas Deportivas',
    description: 'Confección completa en tela antifluido y algodón perchado para escuela deportiva infantil del Polideportivo La Reliquia.',
    imageUrl: createSvgPortfolioDataUri('Uniformes Escuela Deportiva', '40 Conjuntos en Antifluido con Bordado', '#312e81', '#6366f1'),
    storagePath: null,
    fileFormat: 'image/svg+xml',
    fileSizeKB: 45,
    createdAt: '2025-01-29T17:10:00Z',
    status: 'approved'
  },
  {
    id: 'b0000000-0000-4000-8000-000000000004',
    profileId: 'a0000000-0000-4000-8000-000000000003',
    workerName: 'Jhonier Andrés Vargas',
    title: 'Mantenimiento General y Kit de Arrastre Pulsar NS 200',
    description: 'Sincronización completa, cambio de kit de arrastre reforzado, líquido de frenos y revisión de sistema de carga.',
    imageUrl: createSvgPortfolioDataUri('Sincronización y Kit Arrastre', 'Mantenimiento Preventivo Garantizado', '#0f172a', '#64748b'),
    storagePath: null,
    fileFormat: 'image/svg+xml',
    fileSizeKB: 40,
    createdAt: '2025-02-01T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'b0000000-0000-4000-8000-000000000005',
    profileId: 'a0000000-0000-4000-8000-000000000004',
    workerName: 'Yeimy Paola Poveda',
    title: 'Instalación de 4 Cámaras de Seguridad en Supermercado Local',
    description: 'Cableado estructurado, configuración de DVR con visualización en vivo desde el celular del propietario.',
    imageUrl: createSvgPortfolioDataUri('Circuito Cerrado 4 Cámaras HD', 'Monitoreo desde Celular • Zona Comercial', '#0c4a6e', '#0ea5e9'),
    storagePath: null,
    fileFormat: 'image/svg+xml',
    fileSizeKB: 41,
    createdAt: '2025-02-03T18:45:00Z',
    status: 'approved'
  },
  {
    id: 'b0000000-0000-4000-8000-000000000006',
    profileId: 'a0000000-0000-4000-8000-000000000006',
    workerName: 'Cristian Camilo Mora',
    title: 'Independización de Tablero Eléctrico Bifásico',
    description: 'Organización de acometida y caja de distribución con brekers certificados RETIE para vivienda multifamiliar.',
    imageUrl: createSvgPortfolioDataUri('Tablero Eléctrico Norma RETIE', 'Independización de Circuitos Residenciales', '#172554', '#60a5fa'),
    storagePath: null,
    fileFormat: 'image/svg+xml',
    fileSizeKB: 39,
    createdAt: '2025-02-05T09:10:00Z',
    status: 'approved'
  }
];

export const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'c0000000-0000-4000-8000-000000000001',
    title: 'Auxiliar de Panadería y Atención en Mostrador',
    company: 'Panadería y Cafetería El Trigal del Llano',
    category: 'gastronomia',
    sector: 'Zona Comercial Principal',
    jobType: 'Tiempo completo',
    modality: 'Presencial en La Reliquia',
    salaryCOP: '$1.450.000 + Prestaciones',
    description: 'Buscamos habitante del barrio La Reliquia con actitud de servicio para apoyo en horneo de pan, organización de vitrinas, preparación de bebidas calientes y atención de clientes en turno de mañana.',
    requirements: [
      'Vivir en el barrio La Reliquia o sectores aledaños',
      'Experiencia mínima de 6 meses en panadería o cafetería',
      'Curso de manipulación de alimentos vigente (o disposición para realizarlo)',
      'Puntualidad para turno de apertura (5:30 a.m.)'
    ],
    publishedAt: '2025-02-15',
    closingDate: '2026-12-30',
    status: 'abierta',
    contactWhatsapp: '3118889900',
    contactEmail: 'empleo.trigal@ejemplo.co',
    authorId: null,
    createdAt: '2025-02-15T00:00:00Z'
  },
  {
    id: 'c0000000-0000-4000-8000-000000000002',
    title: 'Operaria/o de Máquina Plana y Fileteadora',
    company: 'Confecciones Deportivas MetaSport',
    category: 'confeccion',
    sector: 'Sector 1 - La Reliquia',
    jobType: 'Por obra o labor',
    modality: 'Presencial en La Reliquia',
    salaryCOP: '$1.500.000 a $1.850.000 según producción',
    description: 'Taller ubicado en el Sector 1 de La Reliquia requiere operaria u operario con destreza en máquina plana y fileteadora para temporada de uniformes escolares y dotaciones.',
    requirements: [
      'Manejo ágil de máquina plana y fileteadora industrial',
      'Calidad en costuras rectas y ensamble de cuellos',
      'Disponibilidad inmediata de lunes a sábado'
    ],
    publishedAt: '2025-02-18',
    closingDate: '2026-12-25',
    status: 'abierta',
    contactWhatsapp: '3129876543',
    contactEmail: 'metasport.taller@ejemplo.co',
    authorId: null,
    createdAt: '2025-02-15T00:00:00Z'
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    title: 'Oficial y Ayudante Entendido de Construcción',
    company: 'Obras Civiles y Remodelaciones del Ariari',
    category: 'construccion',
    sector: 'Sector 3 - La Reliquia',
    jobType: 'Por obra o labor',
    modality: 'Presencial en La Reliquia',
    salaryCOP: '$75.000 - $95.000 día pagado semanalmente',
    description: 'Se requiere oficial de construcción y ayudante práctico para obra de ampliación de vivienda y placa fácil en el Sector 3 de La Reliquia. Duración estimada inicial: 6 semanas.',
    requirements: [
      'Experiencia comprobable en mampostería, pañete y mezcla',
      'Curso de alturas vigente (deseable)',
      'Compromiso, honestidad y cumplimiento de horario (7:00 a.m. a 4:30 p.m.)'
    ],
    publishedAt: '2025-02-20',
    closingDate: '2026-12-20',
    status: 'abierta',
    contactWhatsapp: '3114567890',
    contactEmail: 'carlos.garzon.obra@ejemplo.co',
    authorId: null,
    createdAt: '2025-02-15T00:00:00Z'
  },
  {
    id: 'c0000000-0000-4000-8000-000000000004',
    title: 'Domiciliario con Moto Propia (Fines de Semana)',
    company: 'Asadero y Restaurante Brasa Llanera',
    category: 'comercio',
    sector: 'Zona Comercial Principal',
    jobType: 'Fines de semana',
    modality: 'Ruta / Domicilios',
    salaryCOP: '$65.000 turno + recargo por cada domicilio',
    description: 'Restaurante familiar en La Reliquia busca domiciliario responsable con moto propia y documentos al día para trabajar sábados, domingos y festivos de 11:00 a.m. a 8:00 p.m.',
    requirements: [
      'Conocer bien la nomenclatura de los 4 sectores de La Reliquia y Trece de Mayo',
      'SOAT, tecnomecánica y licencia de conducción al día',
      'Excelente trato al vecino y cliente'
    ],
    publishedAt: '2025-02-21',
    closingDate: '2026-12-31',
    status: 'abierta',
    contactWhatsapp: '3209991122',
    contactEmail: 'brasallanera.reliquia@ejemplo.co',
    authorId: null,
    createdAt: '2025-02-15T00:00:00Z'
  }
];
