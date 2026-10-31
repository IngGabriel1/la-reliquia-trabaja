import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Briefcase,
  Users,
  MapPin,
  Phone,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Edit3,
  AlertTriangle,
  Flag,
  Lock,
  Unlock,
  Eye,
  X,
  Menu,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  Building2,
  FileText,
  Terminal,
  Copy,
  Check,
  Hammer,
  Scissors,
  Wrench,
  Utensils,
  Laptop,
  Sparkles,
  Zap,
  Home,
  ShoppingBag,
  UserCheck,
  LogOut,
  KeyRound,
  Mail,
  Send,
  Filter,
  Award,
  ExternalLink,
  RefreshCw,
  Info,
  Scale,
  Database,
  FolderGit2
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE BASE DE DATOS EN TIEMPO REAL
// ============================================================================


// ============================================================================
// 2. CATÁLOGOS OFICIALES DEL BARRIO LA RELIQUIA, VILLAVICENCIO
// ============================================================================
const CATEGORIES = [
  {
    id: 'construccion',
    name: 'Construcción y Obra Blanca',
    icon: Hammer,
    description: 'Maestros de obra, enchape, estuco, pintura, drywall y remodelaciones.',
    color: 'bg-blue-100 text-blue-900 border-blue-200'
  },
  {
    id: 'confeccion',
    name: 'Confección y Textil',
    icon: Scissors,
    description: 'Modistería, arreglos de ropa, dotaciones, ropa deportiva y bordados.',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'mecanica',
    name: 'Mecánica de Motos y Bicis',
    icon: Wrench,
    description: 'Mantenimiento preventivo, electricidad de motos, despinchado y repuestos.',
    color: 'bg-slate-200 text-slate-900 border-slate-300'
  },
  {
    id: 'gastronomia',
    name: 'Gastronomía y Panadería',
    icon: Utensils,
    description: 'Panadería artesanal, amasijos llaneros, almuerzos caseros y repostería.',
    color: 'bg-sky-100 text-sky-900 border-sky-200'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología y Sistemas',
    icon: Laptop,
    description: 'Mantenimiento de computadores, celulares, redes Wi-Fi y cámaras.',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-200'
  },
  {
    id: 'belleza',
    name: 'Belleza y Barbería',
    icon: Sparkles,
    description: 'Cortes modernos, peluquería, manicure, pedicure y maquillaje social.',
    color: 'bg-violet-100 text-violet-900 border-violet-200'
  },
  {
    id: 'electricidad',
    name: 'Electricidad y Plomería',
    icon: Zap,
    description: 'Instalaciones eléctricas residenciales, fugas de agua y tanques elevados.',
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'hogar',
    name: 'Servicios del Hogar y Cuidado',
    icon: Home,
    description: 'Aseo general, jardinería, guadaña, cuidado de niños y adulto mayor.',
    color: 'bg-teal-100 text-teal-900 border-teal-200'
  },
  {
    id: 'comercio',
    name: 'Comercio, Ventas y Domicilios',
    icon: ShoppingBag,
    description: 'Atención de locales, domicilios en moto, impulsadores y logística.',
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  }
];

const SECTORS = [
  'Sector 1 - La Reliquia',
  'Sector 2 - La Reliquia',
  'Sector 3 - La Reliquia',
  'Sector 4 - La Reliquia',
  'Zona Comercial Principal',
  'Sector Polideportivo / Colegio',
  'Alrededores (Trece de Mayo / San Antonio)'
];

const AVAILABILITY_OPTIONS = [
  'Disponible ahora',
  'Tiempo completo',
  'Medio tiempo / Por horas',
  'Por contrato o proyecto',
  'Fines de semana'
];

const JOB_TYPES = [
  'Tiempo completo',
  'Medio tiempo',
  'Por obra o labor',
  'Por días / Turnos',
  'Fines de semana'
];

const JOB_MODALITIES = [
  'Presencial en La Reliquia',
  'Presencial en Villavicencio',
  'Ruta / Domicilios',
  'Trabajo desde taller en casa'
];

// ============================================================================
// 3. GENERADOR DE IMÁGENES SVG ILUSTRATIVAS PARA PORTAFOLIOS SEMILLA
// ============================================================================
const createSvgPortfolioDataUri = (title, subtitle, bgHex, accentHex) => {
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

// ============================================================================
// 4. DATOS SEMILLA REALISTAS Y FICTICIOS (COMUNIDAD LA RELIQUIA)
// ============================================================================
const INITIAL_PROFILES = [
  {
    id: 'worker-carlos-garzon',
    uid: 'demo-worker-1',
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
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.9,
    completedJobs: 64,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'worker-luz-marina',
    uid: 'demo-worker-2',
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
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 5.0,
    completedJobs: 112,
    createdAt: '2025-01-12T14:30:00Z'
  },
  {
    id: 'worker-jhonier-vargas',
    uid: 'demo-worker-3',
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
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.8,
    completedJobs: 89,
    createdAt: '2025-01-15T09:15:00Z'
  },
  {
    id: 'worker-yeimy-poveda',
    uid: 'demo-worker-4',
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
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.9,
    completedJobs: 41,
    createdAt: '2025-01-18T16:00:00Z'
  },
  {
    id: 'worker-don-alvaro',
    uid: 'demo-worker-5',
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
    consentPublicWhatsapp: false,
    status: 'approved',
    verified: false,
    rating: 4.7,
    completedJobs: 53,
    createdAt: '2025-01-20T08:00:00Z'
  },
  {
    id: 'worker-camilo-electricista',
    uid: 'demo-worker-6',
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
    consentPublicWhatsapp: true,
    status: 'approved',
    verified: true,
    rating: 4.9,
    completedJobs: 77,
    createdAt: '2025-01-22T11:30:00Z'
  }
];

const INITIAL_PORTFOLIO = [
  {
    id: 'port-1',
    profileId: 'worker-carlos-garzon',
    workerName: 'Carlos Julio Garzón',
    title: 'Remodelación Total de Cocina Integral - Sector 2',
    description: 'Enchape en cerámica tipo metro, mesón en granito pulido e instalación de cielo raso en PVC con luces LED empotradas.',
    category: 'construccion',
    imageUrl: createSvgPortfolioDataUri('Cocina Integral Enchapada', 'Porcelanato + Mesón y Luces LED • Sector 2', '#1e3a8a', '#3b82f6'),
    fileFormat: 'image/svg+xml',
    fileSizeKB: 42,
    createdAt: '2025-01-25T15:00:00Z',
    status: 'approved'
  },
  {
    id: 'port-2',
    profileId: 'worker-carlos-garzon',
    workerName: 'Carlos Julio Garzón',
    title: 'Acabado de Fachada y Estuco Plástico Exterior',
    description: 'Resane general de fachada de dos pisos en La Reliquia, aplicación de koraza impermeable y enchape decorativo.',
    category: 'construccion',
    imageUrl: createSvgPortfolioDataUri('Fachada Impermeabilizada', 'Estuco Exterior y Pintura Koraza 2 Pisos', '#0f172a', '#3b82f6'),
    fileFormat: 'image/svg+xml',
    fileSizeKB: 38,
    createdAt: '2025-01-28T11:20:00Z',
    status: 'approved'
  },
  {
    id: 'port-3',
    profileId: 'worker-luz-marina',
    workerName: 'Luz Marina Castañeda',
    title: 'Lote de 40 Sudaderas y Camisetas Deportivas',
    description: 'Confección completa en tela antifluido y algodón perchado para escuela deportiva infantil del Polideportivo La Reliquia.',
    category: 'confeccion',
    imageUrl: createSvgPortfolioDataUri('Uniformes Escuela Deportiva', '40 Conjuntos en Antifluido con Bordado', '#312e81', '#6366f1'),
    fileFormat: 'image/svg+xml',
    fileSizeKB: 45,
    createdAt: '2025-01-29T17:10:00Z',
    status: 'approved'
  },
  {
    id: 'port-4',
    profileId: 'worker-jhonier-vargas',
    workerName: 'Jhonier Andrés Vargas',
    title: 'Mantenimiento General y Kit de Arrastre Pulsar NS 200',
    description: 'Sincronización completa, cambio de kit de arrastre reforzado, líquido de frenos y revisión de sistema de carga.',
    category: 'mecanica',
    imageUrl: createSvgPortfolioDataUri('Sincronización y Kit Arrastre', 'Mantenimiento Preventivo Garantizado', '#0f172a', '#64748b'),
    fileFormat: 'image/svg+xml',
    fileSizeKB: 40,
    createdAt: '2025-02-01T10:00:00Z',
    status: 'approved'
  },
  {
    id: 'port-5',
    profileId: 'worker-yeimy-poveda',
    workerName: 'Yeimy Paola Poveda',
    title: 'Instalación de 4 Cámaras de Seguridad en Supermercado Local',
    description: 'Cableado estructurado, configuración de DVR con visualización en vivo desde el celular del propietario.',
    category: 'tecnologia',
    imageUrl: createSvgPortfolioDataUri('Circuito Cerrado 4 Cámaras HD', 'Monitoreo desde Celular • Zona Comercial', '#0c4a6e', '#0ea5e9'),
    fileFormat: 'image/svg+xml',
    fileSizeKB: 41,
    createdAt: '2025-02-03T18:45:00Z',
    status: 'approved'
  },
  {
    id: 'port-6',
    profileId: 'worker-camilo-electricista',
    workerName: 'Cristian Camilo Mora',
    title: 'Independización de Tablero Eléctrico Bifásico',
    description: 'Organización de acometida y caja de distribución con brekers certificados RETIE para vivienda multifamiliar.',
    category: 'electricidad',
    imageUrl: createSvgPortfolioDataUri('Tablero Eléctrico Norma RETIE', 'Independización de Circuitos Residenciales', '#172554', '#60a5fa'),
    fileFormat: 'image/svg+xml',
    fileSizeKB: 39,
    createdAt: '2025-02-05T09:10:00Z',
    status: 'approved'
  }
];

const INITIAL_JOBS = [
  {
    id: 'job-panaderia-reliquia',
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
    closingDate: '2025-04-30',
    status: 'abierta',
    contactWhatsapp: '3118889900',
    contactEmail: 'empleo.trigal@ejemplo.co',
    authorUid: 'demo-employer-1',
    applicantsCount: 4
  },
  {
    id: 'job-operaria-confeccion',
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
    closingDate: '2025-04-25',
    status: 'abierta',
    contactWhatsapp: '3129876543',
    contactEmail: 'metasport.taller@ejemplo.co',
    authorUid: 'demo-worker-2',
    applicantsCount: 7
  },
  {
    id: 'job-ayudante-construccion',
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
    closingDate: '2025-04-20',
    status: 'abierta',
    contactWhatsapp: '3114567890',
    contactEmail: 'carlos.garzon.obra@ejemplo.co',
    authorUid: 'demo-worker-1',
    applicantsCount: 5
  },
  {
    id: 'job-domiciliario-moto',
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
    closingDate: '2025-05-01',
    status: 'abierta',
    contactWhatsapp: '3209991122',
    contactEmail: 'brasallanera.reliquia@ejemplo.co',
    authorUid: 'demo-employer-2',
    applicantsCount: 3
  }
];

// ============================================================================
// 5. ESQUEMA SQL SUPABASE + RLS + STORAGE + ARQUITECTURA NEXT.JS (DOCUMENTACIÓN)
// ============================================================================
const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- PROYECTO: LA RELIQUIA TRABAJA (Villavicencio, Meta, Colombia)
-- MOTOR: Supabase (PostgreSQL 15+ con Auth, Row Level Security y Storage)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE ROLES ADMINISTRATIVOS (Seguridad: Nunca se asigna automáticamente)
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función auxiliar segura (SECURITY DEFINER) para validar si el usuario es Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLA DE CATEGORÍAS DE OFICIOS Y SERVICIOS
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE PERFILES PROFESIONALES DEL DIRECTORIO
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  profession TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  sector TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  skills TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Disponible ahora',
  whatsapp_phone TEXT,
  consent_habeas_data BOOLEAN NOT NULL DEFAULT FALSE,
  consent_public_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_category ON public.profiles(category_id);
CREATE INDEX idx_profiles_sector ON public.profiles(sector);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- 4. TABLA DE PORTAFOLIO DE TRABAJOS REALIZADOS (FOTOGRAFÍAS)
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_format TEXT NOT NULL CHECK (file_format IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size_kb INTEGER NOT NULL CHECK (file_size_kb <= 2048),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_profile ON public.portfolio_items(profile_id);

-- 5. TABLA DE VACANTES DE LA BOLSA DE EMPLEO
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  sector TEXT NOT NULL,
  job_type TEXT NOT NULL,
  modality TEXT NOT NULL,
  salary_cop TEXT,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  contact_whatsapp TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada', 'en_revision')),
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  closing_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_category_status ON public.job_postings(category_id, status);

-- 6. TABLA DE POSTULACIONES A VACANTES
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  cover_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- 7. TABLA DE REPORTES COMUNITARIOS Y AUDITORÍA ADMIN
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'job', 'portfolio')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'resuelto', 'descartado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_name TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- POLÍTICAS ROW LEVEL SECURITY (RLS) ESTRICTAS
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Perfiles: Lectura pública de perfiles aprobados; edición exclusiva del dueño o Admin
CREATE POLICY "Lectura publica perfiles aprobados" ON public.profiles
  FOR SELECT USING (status = 'approved' OR auth.uid() = id OR public.is_admin());

CREATE POLICY "Creacion de propio perfil con Habeas Data" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND consent_habeas_data = TRUE);

CREATE POLICY "Actualizacion exclusivo dueno o admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Eliminacion derecho supresion Ley 1581" ON public.profiles
  FOR DELETE USING (auth.uid() = id OR public.is_admin());

-- Portafolio: Solo el dueño puede subir/editar/borrar sus fotos
CREATE POLICY "Portafolio visible publicamente" ON public.portfolio_items
  FOR SELECT USING (status = 'approved' OR auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "Subir fotos solo al propio portafolio" ON public.portfolio_items
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Modificar o eliminar propias fotos" ON public.portfolio_items
  FOR ALL USING (auth.uid() = profile_id OR public.is_admin());

-- Vacantes: Visibles para todos; creadas por autenticados; editadas por autor o Admin
CREATE POLICY "Vacantes visibles para comunidad" ON public.job_postings
  FOR SELECT USING (TRUE);

CREATE POLICY "Publicar vacantes usuarios autenticados" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Editar vacante solo autor o admin" ON public.job_postings
  FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

-- ============================================================================
-- SUPABASE STORAGE: BUCKET 'portfolios' CON RESTRICCIÓN DE CARPETA POR UID
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolios', 'portfolios', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Subida de imagenes en carpeta propia auth.uid"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Eliminacion de archivos propios o admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolios' AND
  ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
);`;

const NEXTJS_STRUCTURE_DOC = `la-reliquia-trabaja/
├── .env.local.example                 # Variables públicas de Supabase (Sin claves secretas en cliente)
├── next.config.ts                     # Configuración de dominios de imágenes de Supabase Storage
├── middleware.ts                      # Protección de rutas (/mi-perfil, /admin) vía @supabase/ssr
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Header institucional, Footer y contexto de sesión
│   │   ├── page.tsx                   # Inicio: Hero, Buscador, Categorías, Destacados y Vacantes
│   │   ├── auth/
│   │   │   ├── login/page.tsx         # Inicio de sesión y recuperación de contraseña
│   │   │   ├── registro/page.tsx      # Registro con casilla Ley 1581 Habeas Data
│   │   │   └── callback/route.ts      # Intercambio PKCE para verificación de correo
│   │   ├── directorio/
│   │   │   ├── page.tsx               # Buscador y filtros por oficio, sector y disponibilidad
│   │   │   └── [id]/page.tsx          # Página individual del trabajador + Galería Portafolio
│   │   ├── empleos/
│   │   │   ├── page.tsx               # Bolsa de empleo comunitaria + Filtros
│   │   │   └── nueva/page.tsx         # Publicación y edición de ofertas laborales
│   │   ├── mi-perfil/
│   │   │   └── page.tsx               # Gestión de perfil, subida de fotos, switch WhatsApp y borrado
│   │   └── admin/
│   │       └── page.tsx               # Panel protegido por public.is_admin() + Auditoría
│   ├── components/
│   │   ├── WorkerCard.tsx
│   │   ├── PortfolioUploader.tsx      # Validación cliente/servidor JPG/PNG/WEBP <= 2MB
│   │   └── LegalComplianceBanner.tsx  # Aviso Ley 1581 de 2012 y SPE Ministerio del Trabajo
│   └── lib/
│       └── supabase/
│           ├── client.ts              # createBrowserClient
│           └── server.ts              # createServerClient (Cookies HTTP-only)`;

// ============================================================================
// 6. COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================================================
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Briefcase, Users, MapPin, Phone, CheckCircle2, ShieldCheck, PlusCircle, Camera, Image as ImageIcon, Trash2, Edit3, AlertTriangle, Flag, Lock, Unlock, Eye, X, Menu, ChevronRight, Star, Clock, DollarSign, Building2, FileText, Terminal, Copy, Check, Hammer, Scissors, Wrench, Utensils, Laptop, Sparkles, Zap, Home as HomeIcon, ShoppingBag, UserCheck, LogOut, KeyRound, ExternalLink, RefreshCw, Scale, Database, FolderGit2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'construccion', name: 'Construcción y Obra', icon: Hammer, description: 'Maestros de obra, enchape, estuco, pintura.', color: 'bg-blue-100 text-blue-900 border-blue-200' },
  { id: 'confeccion', name: 'Confección y Textil', icon: Scissors, description: 'Modistería, arreglos de ropa, dotaciones.', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
  { id: 'mecanica', name: 'Mecánica de Motos', icon: Wrench, description: 'Mantenimiento preventivo, electricidad, despinchado.', color: 'bg-slate-200 text-slate-900 border-slate-300' },
  { id: 'gastronomia', name: 'Gastronomía', icon: Utensils, description: 'Panadería artesanal, amasijos llaneros.', color: 'bg-sky-100 text-sky-900 border-sky-200' },
  { id: 'tecnologia', name: 'Tecnología y Sistemas', icon: Laptop, description: 'Mantenimiento de PC, celulares, cámaras.', color: 'bg-cyan-100 text-cyan-900 border-cyan-200' },
  { id: 'belleza', name: 'Belleza y Barbería', icon: Sparkles, description: 'Cortes, peluquería, manicure, maquillaje.', color: 'bg-violet-100 text-violet-900 border-violet-200' },
  { id: 'electricidad', name: 'Electricidad y Plomería', icon: Zap, description: 'Instalaciones eléctricas, fugas de agua.', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'hogar', name: 'Servicios del Hogar', icon: HomeIcon, description: 'Aseo general, jardinería, cuidado de niños.', color: 'bg-teal-100 text-teal-900 border-teal-200' },
  { id: 'comercio', name: 'Comercio y Domicilios', icon: ShoppingBag, description: 'Atención de locales, domicilios en moto.', color: 'bg-slate-100 text-slate-800 border-slate-200' }
];

const SECTORS = ['Sector 1 - La Reliquia', 'Sector 2 - La Reliquia', 'Sector 3 - La Reliquia', 'Sector 4 - La Reliquia', 'Zona Comercial Principal', 'Sector Polideportivo / Colegio', 'Alrededores (Trece de Mayo)'];
const AVAILABILITY_OPTIONS = ['Disponible ahora', 'Tiempo completo', 'Medio tiempo / Por horas', 'Por contrato o proyecto', 'Fines de semana'];
const JOB_TYPES = ['Tiempo completo', 'Medio tiempo', 'Por obra o labor', 'Por días / Turnos', 'Fines de semana'];
const JOB_MODALITIES = ['Presencial en La Reliquia', 'Presencial en Villavicencio', 'Ruta / Domicilios', 'Trabajo desde taller en casa'];

const createSvgPortfolioDataUri = (title, subtitle, bgHex, accentHex) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><rect width="800" height="520" fill="${bgHex}"/><text x="400" y="260" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${title}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const INITIAL_PROFILES = [
  { id: 'worker-1', uid: 'demo-worker-1', name: 'Carlos Julio Garzón', profession: 'Maestro de Obra Blanca', category: 'construccion', sector: 'Sector 2 - La Reliquia', experienceYears: 14, skills: ['Enchape', 'Estuco', 'Drywall'], bio: 'Maestro de construcción habitante de La Reliquia.', availability: 'Disponible ahora', whatsapp: '3114567890', email: 'carlos@test.co', consentHabeasData: true, consentPublicWhatsapp: true, status: 'approved', verified: true, rating: 4.9 },
  { id: 'worker-2', uid: 'demo-worker-2', name: 'Luz Marina Castañeda', profession: 'Modista Textil', category: 'confeccion', sector: 'Sector 1 - La Reliquia', experienceYears: 18, skills: ['Uniformes', 'Dotaciones'], bio: 'Taller propio de confección en el Sector 1.', availability: 'Por contrato o proyecto', whatsapp: '3129876543', email: 'luz@test.co', consentHabeasData: true, consentPublicWhatsapp: true, status: 'approved', verified: true, rating: 5.0 }
];

const INITIAL_PORTFOLIO = [
  { id: 'port-1', profileId: 'worker-1', workerName: 'Carlos Julio Garzón', title: 'Remodelación Cocina', description: 'Enchape en cerámica tipo metro.', category: 'construccion', imageUrl: createSvgPortfolioDataUri('Cocina Integral', 'Sector 2', '#1e3a8a', '#3b82f6'), fileFormat: 'image/svg+xml', fileSizeKB: 42, status: 'approved' }
];

const INITIAL_JOBS = [
  { id: 'job-1', title: 'Auxiliar de Panadería', company: 'Panadería El Trigal', category: 'gastronomia', sector: 'Zona Comercial Principal', jobType: 'Tiempo completo', modality: 'Presencial en La Reliquia', salaryCOP: '$1.450.000', description: 'Apoyo en horneo y atención.', requirements: ['Vivir en La Reliquia'], publishedAt: '2025-02-15', closingDate: '2025-04-30', status: 'abierta', contactWhatsapp: '3118889900', authorUid: 'demo-employer-1' }
];

export default function App() {
  const [activePersonaUid, setActivePersonaUid] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [sessionAccount, setSessionAccount] = useState({ email: 'vecino@reliquia.co', displayName: 'Habitante' });
  const [activeTab, setActiveTab] = useState('inicio');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [portfolioItems, setPortfolioItems] = useState(INITIAL_PORTFOLIO);
  const [jobPostings, setJobPostings] = useState(INITIAL_JOBS);
  const [jobApplications, setJobApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dirSearch, setDirSearch] = useState('');
  const [dirCategory, setDirCategory] = useState('todas');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => { setToast({ message }); setTimeout(() => setToast(null), 3000); };
  const effectiveUid = activePersonaUid || 'anon-user';
  const myProfile = profiles.find((p) => p.uid === effectiveUid);
  const approvedProfiles = profiles.filter((p) => p.status === 'approved');
  
  const filteredProfiles = approvedProfiles.filter(w => (dirCategory === 'todas' || w.category === dirCategory) && (!dirSearch || w.name.toLowerCase().includes(dirSearch.toLowerCase())));
  const filteredJobs = jobPostings.filter(j => j.status === 'abierta');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <button onClick={() => setActiveTab('inicio')} className="flex items-center gap-2 font-black text-xl"><div className="w-8 h-8 bg-blue-600 rounded flex justify-center items-center">LR</div> La Reliquia</button>
          <nav className="hidden md:flex gap-4">
            <button onClick={() => setActiveTab('inicio')} className={activeTab==='inicio'?'text-blue-400':'text-white'}>Inicio</button>
            <button onClick={() => setActiveTab('directorio')} className={activeTab==='directorio'?'text-blue-400':'text-white'}>Directorio</button>
            <button onClick={() => setActiveTab('empleos')} className={activeTab==='empleos'?'text-blue-400':'text-white'}>Empleos</button>
            {isLoggedIn && <button onClick={() => setActiveTab('mi_panel')} className={activeTab==='mi_panel'?'text-blue-400':'text-white'}>Mi Panel</button>}
          </nav>
          <div>
            {!isLoggedIn ? <button onClick={() => setAuthModalOpen(true)} className="bg-blue-600 px-4 py-2 rounded font-bold text-sm">Entrar</button> : <button onClick={() => setIsLoggedIn(false)} className="bg-red-600 px-4 py-2 rounded font-bold text-sm">Salir</button>}
          </div>
        </div>
      </header>

      {toast && <div className="fixed bottom-5 right-5 bg-slate-900 text-white p-4 rounded-xl z-50 shadow-xl">{toast.message}</div>}

      <main className="flex-1">
        {activeTab === 'inicio' && (
          <div>
            <div className="bg-slate-900 text-white py-16 text-center px-4">
              <h1 className="text-4xl font-black mb-4">Talento local en <span className="text-blue-500">La Reliquia</span></h1>
              <div className="max-w-md mx-auto flex gap-2"><input type="text" value={globalSearch} onChange={e=>setGlobalSearch(e.target.value)} className="w-full p-3 rounded text-black" placeholder="Buscar..."/><button onClick={()=>{setDirSearch(globalSearch); setActiveTab('directorio');}} className="bg-blue-600 px-6 font-bold rounded">Buscar</button></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.slice(0,6).map(c => (
                <div key={c.id} onClick={()=>{setDirCategory(c.id); setActiveTab('directorio');}} className="bg-white p-6 rounded-xl shadow cursor-pointer border hover:border-blue-500">
                  <c.icon className="w-8 h-8 text-blue-600 mb-2"/>
                  <h3 className="font-bold">{c.name}</h3><p className="text-sm text-slate-500">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'directorio' && (
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-black mb-6">Directorio de Trabajadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProfiles.map(w => (
                <div key={w.id} className="bg-white p-5 rounded-xl shadow border">
                  <h3 className="font-bold text-lg">{w.name} {w.verified && <CheckCircle2 className="inline w-4 text-blue-500"/>}</h3>
                  <p className="text-blue-600 text-sm font-bold">{w.profession}</p>
                  <p className="text-sm mt-2 text-slate-600">{w.bio}</p>
                  <button onClick={() => setSelectedWorker(w)} className="mt-4 w-full bg-slate-100 py-2 rounded font-bold text-sm">Ver Perfil</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'empleos' && (
          <div className="max-w-7xl mx-auto px-4 py-10">
             <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black">Bolsa de Empleo</h2><button onClick={()=>setIsJobFormOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">+ Vacante</button></div>
             <div className="space-y-4">
               {filteredJobs.map(j => (
                 <div key={j.id} className="bg-white p-5 rounded-xl shadow border flex justify-between items-center">
                   <div><h3 className="font-bold">{j.title}</h3><p className="text-blue-600 text-sm">{j.company}</p></div>
                   <button onClick={() => setSelectedJob(j)} className="bg-slate-900 text-white px-4 py-2 rounded font-bold text-sm">Ver</button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'mi_panel' && (
          <div className="max-w-3xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-black mb-6">Mi Perfil Profesional</h2>
            <form onSubmit={e => {e.preventDefault(); showToast('Perfil Guardado Correctamente');}} className="bg-white p-6 rounded-xl shadow border space-y-4">
               <input type="text" placeholder="Nombre completo" defaultValue={myProfile?.name} className="w-full p-2 border rounded" required/>
               <input type="text" placeholder="Profesión" defaultValue={myProfile?.profession} className="w-full p-2 border rounded" required/>
               <textarea placeholder="Descripción" defaultValue={myProfile?.bio} className="w-full p-2 border rounded" required/>
               <label className="flex gap-2"><input type="checkbox" required defaultChecked={myProfile?.consentHabeasData}/> Acepto Ley 1581 (Habeas Data)</label>
               <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded">Guardar Cambios</button>
            </form>
          </div>
        )}
      </main>

      {/* Modales Básicos Integrados */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-black">{selectedWorker.name}</h2>
            <p className="text-blue-600 font-bold mb-4">{selectedWorker.profession}</p>
            <p className="text-slate-600 text-sm mb-6">{selectedWorker.bio}</p>
            <div className="flex gap-2"><button onClick={()=>setSelectedWorker(null)} className="flex-1 bg-slate-200 py-2 rounded font-bold text-sm">Cerrar</button><button onClick={()=>{showToast('Abriendo WhatsApp...'); setSelectedWorker(null);}} className="flex-1 bg-green-600 text-white py-2 rounded font-bold text-sm">Contactar WhatsApp</button></div>
          </div>
        </div>
      )}
      
      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-black">{selectedJob.title}</h2>
            <p className="text-blue-600 font-bold mb-2">{selectedJob.company}</p>
            <p className="text-slate-600 text-sm mb-6">{selectedJob.description}</p>
            <div className="flex gap-2"><button onClick={()=>setSelectedJob(null)} className="flex-1 bg-slate-200 py-2 rounded font-bold text-sm">Cerrar</button><button onClick={()=>{showToast('Postulación enviada exitosamente'); setSelectedJob(null);}} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-sm">Enviar Postulación</button></div>
          </div>
        </div>
      )}

      {authModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-black mb-4">Bienvenido a La Reliquia</h2>
            <button onClick={()=>{setIsLoggedIn(true); setActiveTab('mi_panel'); setAuthModalOpen(false); showToast('Sesión Iniciada');}} className="w-full bg-blue-600 text-white font-bold py-3 rounded">Simular Ingreso Vecino</button>
            <button onClick={()=>setAuthModalOpen(false)} className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded mt-2">Cancelar</button>
          </div>
        </div>
      )}
      
      {isJobFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black mb-4">Publicar Vacante</h2>
            <form onSubmit={e=>{e.preventDefault(); showToast('Vacante publicada'); setIsJobFormOpen(false);}}>
              <input type="text" placeholder="Título del empleo" required className="w-full p-2 border rounded mb-3"/>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Publicar</button>
              <button type="button" onClick={()=>setIsJobFormOpen(false)} className="w-full bg-slate-100 font-bold py-2 rounded mt-2">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



  // ==========================================================================
  // REGLA FIREBASE 1 Y 3: Inicialización de Auth antes de cualquier consulta
  // ==========================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Error al inicializar autenticación:', err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !activePersonaUid) {
        setActivePersonaUid(currentUser.uid);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // ==========================================================================
  // REGLA FIREBASE 2 Y 3: Suscripciones en tiempo real en rutas estrictas
  // ==========================================================================
  useEffect(() => {
    if (!user) return;

    const profilesRef = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    const portfolioRef = collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_items');
    const jobsRef = collection(db, 'artifacts', appId, 'public', 'data', 'job_postings');
    const appsRef = collection(db, 'artifacts', appId, 'public', 'data', 'job_applications');
    const reportsRef = collection(db, 'artifacts', appId, 'public', 'data', 'reports');
    const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'admin_logs');

    let initialProfilesLoaded = false;

    const unsubProfiles = onSnapshot(
      profilesRef,
      async (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (items.length === 0 && !initialProfilesLoaded && !seedingInProgress) {
          initialProfilesLoaded = true;
          await seedCommunityDatabase();
        } else {
          setProfiles(items);
          setDbLoading(false);
        }
      },
      (err) => {
        console.error('Error leyendo profiles:', err);
        setDbLoading(false);
      }
    );

    const unsubPortfolio = onSnapshot(
      portfolioRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPortfolioItems(items);
      },
      (err) => console.error('Error leyendo portfolio_items:', err)
    );

    const unsubJobs = onSnapshot(
      jobsRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobPostings(items);
      },
      (err) => console.error('Error leyendo job_postings:', err)
    );

    const unsubApps = onSnapshot(
      appsRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobApplications(items);
      },
      (err) => console.error('Error leyendo job_applications:', err)
    );

    const unsubReports = onSnapshot(
      reportsRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReports(items);
      },
      (err) => console.error('Error leyendo reports:', err)
    );

    const unsubLogs = onSnapshot(
      logsRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAdminLogs(items);
      },
      (err) => console.error('Error leyendo admin_logs:', err)
    );

    return () => {
      unsubProfiles();
      unsubPortfolio();
      unsubJobs();
      unsubApps();
      unsubReports();
      unsubLogs();
    };
  }, [user]);

  // Función para poblar la base de datos con talento local de La Reliquia si está vacía
  const seedCommunityDatabase = async () => {
    if (!user || seedingInProgress) return;
    try {
      setSeedingInProgress(true);
      for (const p of INITIAL_PROFILES) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', p.id), p);
      }
      for (const item of INITIAL_PORTFOLIO) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_items', item.id), item);
      }
      for (const job of INITIAL_JOBS) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'job_postings', job.id), job);
      }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_logs'), {
        action: 'INICIALIZACIÓN DE SISTEMA',
        targetType: 'sistema',
        targetName: 'Semilla Comunitaria La Reliquia',
        adminName: 'Sistema Automático',
        timestamp: new Date().toISOString(),
        details: 'Carga inicial de perfiles verificados, portafolios fotográficos y vacantes locales.'
      });
      setDbLoading(false);
    } catch (error) {
      console.error('Error poblando datos iniciales:', error);
      setDbLoading(false);
    } finally {
      setSeedingInProgress(false);
    }
  };

  // Registrar acción en el log de auditoría administrativa
  const recordAdminLog = async (action, targetType, targetName, details) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_logs'), {
        action,
        targetType,
        targetName,
        adminName: sessionAccount.displayName || 'Administrador La Reliquia',
        timestamp: new Date().toISOString(),
        details
      });
    } catch (e) {
      console.error('Error registrando log administrativo:', e);
    }
  };

  // ==========================================================================
  // DATOS DERIVADOS Y FILTROS EN MEMORIA
  // ==========================================================================
  const effectiveUid = activePersonaUid || user?.uid || 'anon-user';

  // Perfil propio del usuario activo
  const myProfile = useMemo(() => {
    return profiles.find((p) => p.uid === effectiveUid);
  }, [profiles, effectiveUid]);

  // Portafolio propio del usuario activo
  const myPortfolio = useMemo(() => {
    if (!myProfile) return [];
    return portfolioItems
      .filter((item) => item.profileId === myProfile.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [portfolioItems, myProfile]);

  // Perfiles aprobados para el directorio público
  const approvedProfiles = useMemo(() => {
    return profiles.filter((p) => p.status === 'approved');
  }, [profiles]);

  // Filtrado del Directorio de Trabajadores
  const filteredProfiles = useMemo(() => {
    return approvedProfiles.filter((worker) => {
      const q = dirSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        worker.name?.toLowerCase().includes(q) ||
        worker.profession?.toLowerCase().includes(q) ||
        worker.bio?.toLowerCase().includes(q) ||
        (worker.skills || []).some((s) => s.toLowerCase().includes(q));

      const matchesCategory = dirCategory === 'todas' || worker.category === dirCategory;
      const matchesSector = dirSector === 'todos' || worker.sector === dirSector;
      const matchesAvailability =
        dirAvailability === 'todas' || worker.availability === dirAvailability;

      const workerPhotosCount = portfolioItems.filter(
        (item) => item.profileId === worker.id && item.status !== 'flagged'
      ).length;
      const matchesPhotos = !dirOnlyWithPhotos || workerPhotosCount > 0;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesSector &&
        matchesAvailability &&
        matchesPhotos
      );
    });
  }, [
    approvedProfiles,
    dirSearch,
    dirCategory,
    dirSector,
    dirAvailability,
    dirOnlyWithPhotos,
    portfolioItems
  ]);

  // Filtrado de la Bolsa de Empleo
  const filteredJobs = useMemo(() => {
    return jobPostings
      .filter((job) => {
        const q = jobSearch.trim().toLowerCase();
        const matchesQuery =
          !q ||
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q);

        const matchesCategory = jobCategory === 'todas' || job.category === jobCategory;
        const matchesType = jobTypeFilter === 'todos' || job.jobType === jobTypeFilter;
        const matchesModality =
          jobModalityFilter === 'todas' || job.modality === jobModalityFilter;
        const matchesStatus = jobShowClosed ? true : job.status === 'abierta';

        return (
          matchesQuery &&
          matchesCategory &&
          matchesType &&
          matchesModality &&
          matchesStatus
        );
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [
    jobPostings,
    jobSearch,
    jobCategory,
    jobTypeFilter,
    jobModalityFilter,
    jobShowClosed
  ]);

  // Conteo de trabajadores y vacantes por categoría
  const categoryStats = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((cat) => {
      map[cat.id] = {
        workers: approvedProfiles.filter((p) => p.category === cat.id).length,
        jobs: jobPostings.filter((j) => j.category === cat.id && j.status === 'abierta').length
      };
    });
    return map;
  }, [approvedProfiles, jobPostings]);

  // Manejo del buscador general en la página de inicio
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const term = globalSearch.trim();
    setDirSearch(term);
    setJobSearch(term);
    setActiveTab('directorio');
  };

  // Navegar directamente a una categoría en el directorio
  const handleSelectCategory = (categoryId) => {
    setDirCategory(categoryId);
    setActiveTab('directorio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper para obtener metadatos de categoría
  const getCategoryInfo = (catId) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
  };

  // ==========================================================================
  // RENDERIZADO PRINCIPAL
  // ==========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* BANNER SUPERIOR INSTITUCIONAL Y DEMO SWITCHER */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
              COMUNIDAD ACTIVA
            </span>
            <span className="font-medium">
              Barrio La Reliquia • Villavicencio, Meta, Colombia
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Identidad de Prueba para el Director del Proyecto */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-slate-300">Probar como:</span>
              <select
                value={effectiveUid}
                onChange={(e) => {
                  const val = e.target.value;
                  setActivePersonaUid(val);
                  const found = profiles.find((p) => p.uid === val);
                  if (found) {
                    setSessionAccount({
                      email: found.email || 'vecino@lareliquia.co',
                      emailVerified: true,
                      displayName: found.name
                    });
                    showToast(`Sesión activa como: ${found.name} (${found.profession})`);
                  } else {
                    setSessionAccount({
                      email: 'nuevo.habitante@villavicencio.co',
                      emailVerified: true,
                      displayName: 'Nuevo Habitante (Sin Perfil Aún)'
                    });
                    showToast('Sesión activa como Nuevo Habitante para probar creación de perfil');
                  }
                }}
                className="bg-transparent text-blue-400 font-semibold text-xs focus:outline-none cursor-pointer"
              >
                <option value={user?.uid || 'new-resident'} className="bg-slate-950 text-white">
                  Mi Sesión Actual ({myProfile ? myProfile.name : 'Nuevo Vecino'})
                </option>
                <option value="demo-worker-1" className="bg-slate-950 text-white">
                  Carlos Garzón (Maestro de Obra - Con Portafolio)
                </option>
                <option value="demo-worker-2" className="bg-slate-950 text-white">
                  Luz Marina Castañeda (Modista y Empleadora)
                </option>
                <option value="demo-worker-5" className="bg-slate-950 text-white">
                  Álvaro Ríos (Panadero - WhatsApp Privado)
                </option>
              </select>
            </div>

            {/* Conmutador de Rol Administrador Autorizado */}
            <button
              onClick={() => {
                const nextState = !isAdminMode;
                setIsAdminMode(nextState);
                showToast(
                  nextState
                    ? 'Rol Administrador Autorizado activado para moderación'
                    : 'Modo Estándar de Habitante activado'
                );
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isAdminMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Permiso administrativo verificado"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdminMode ? 'Admin Activo' : 'Activar Vista Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGACIÓN PRINCIPAL */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo e Identidad */}
            <button
              onClick={() => setActiveTab('inicio')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                LR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    La Reliquia <span className="text-blue-500">Trabaja</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Talento local, oportunidades para todos
                </p>
              </div>
            </button>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {[
                { id: 'inicio', label: 'Inicio', icon: Home },
                {
                  id: 'directorio',
                  label: 'Directorio de Talento',
                  icon: Users,
                  badge: approvedProfiles.length
                },
                {
                  id: 'empleos',
                  label: 'Bolsa de Empleo',
                  icon: Briefcase,
                  badge: jobPostings.filter((j) => j.status === 'abierta').length
                },
                ...(isLoggedIn ? [{
                  id: 'mi_panel',
                  label: 'Mi Panel',
                  icon: UserCheck
                }] : []),
                ...(isAdminMode
                  ? [
                      {
                        id: 'admin',
                        label: 'Administración',
                        icon: ShieldCheck,
                        badge:
                          profiles.filter((p) => p.status === 'pending').length +
                          reports.filter((r) => r.status === 'pendiente').length
                      }
                    ]
                  : []),
                {
                  id: 'arquitectura',
                  label: 'Supabase SQL & Next.js',
                  icon: Database
                }
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
                          active
                            ? 'bg-blue-800 text-white'
                            : 'bg-slate-700 text-blue-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Botones de Acción Rápida y Cuenta */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={() => {
                  if(!isLoggedIn) {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                    return;
                  }
                  setEditingJob(null);
                  setIsJobFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Vacante</span>
              </button>

              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setActiveTab('mi_panel')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {(sessionAccount.displayName || 'V').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{sessionAccount.displayName}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setActiveTab('inicio');
                      showToast('Sesión cerrada correctamente');
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 transition-all"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Botón Menú Móvil */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 focus:outline-none"
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-5 space-y-2">
            {[
              { id: 'inicio', label: 'Inicio', icon: Home },
              { id: 'directorio', label: 'Directorio de Trabajadores', icon: Users },
              { id: 'empleos', label: 'Bolsa de Empleo', icon: Briefcase },
              ...(isLoggedIn ? [{ id: 'mi_panel', label: 'Mi Panel', icon: UserCheck }] : []),
              ...(isAdminMode
                ? [{ id: 'admin', label: 'Panel de Administración', icon: ShieldCheck }]
                : []),
              { id: 'arquitectura', label: 'Supabase SQL & Next.js', icon: Database }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if(!isLoggedIn){
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                    return;
                  }
                  setEditingJob(null);
                  setIsJobFormOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Publicar Vacante
              </button>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setMobileMenuOpen(false);
                    setActiveTab('inicio');
                    showToast('Sesión cerrada');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  Entrar / Registro
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border-2 border-blue-600 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL DINÁMICO SEGÚN PESTAÑA */}
      <main className="flex-1">
        {dbLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="w-14 h-14 border-4 border-slate-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-950">
              Conectando con el directorio comunitario de La Reliquia...
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Cargando perfiles profesionales, portafolios fotográficos y bolsa de empleo.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'inicio' && (
              <HomeView
                approvedProfiles={approvedProfiles}
                portfolioItems={portfolioItems}
                jobPostings={jobPostings}
                categoryStats={categoryStats}
                globalSearch={globalSearch}
                setGlobalSearch={setGlobalSearch}
                onHeroSearch={handleHeroSearch}
                onSelectCategory={handleSelectCategory}
                onNavigate={setActiveTab}
                onOpenWorker={(w) => setSelectedWorker(w)}
                onOpenJob={(j) => setSelectedJob(j)}
                onOpenNewJob={() => {
                  setEditingJob(null);
                  setIsJobFormOpen(true);
                }}
                getCategoryInfo={getCategoryInfo}
              />
            )}

            {activeTab === 'directorio' && (
              <DirectoryView
                filteredProfiles={filteredProfiles}
                portfolioItems={portfolioItems}
                dirSearch={dirSearch}
                setDirSearch={setDirSearch}
                dirCategory={dirCategory}
                setDirCategory={setDirCategory}
                dirSector={dirSector}
                setDirSector={setDirSector}
                dirAvailability={dirAvailability}
                setDirAvailability={setDirAvailability}
                dirOnlyWithPhotos={dirOnlyWithPhotos}
                setDirOnlyWithPhotos={setDirOnlyWithPhotos}
                onOpenWorker={(w) => setSelectedWorker(w)}
                onContactWhatsapp={(w) => setWhatsappPreviewData(w)}
                onNavigate={setActiveTab}
                getCategoryInfo={getCategoryInfo}
              />
            )}

            {activeTab === 'empleos' && (
              <JobsBoardView
                filteredJobs={filteredJobs}
                jobSearch={jobSearch}
                setJobSearch={setJobSearch}
                jobCategory={jobCategory}
                setJobCategory={setJobCategory}
                jobTypeFilter={jobTypeFilter}
                setJobTypeFilter={setJobTypeFilter}
                jobModalityFilter={jobModalityFilter}
                setJobModalityFilter={setJobModalityFilter}
                jobShowClosed={jobShowClosed}
                setJobShowClosed={setJobShowClosed}
                onOpenJob={(j) => setSelectedJob(j)}
                onOpenNewJob={() => {
                  if(!isLoggedIn){
                     setAuthModalMode('login');
                     setAuthModalOpen(true);
                     return;
                  }
                  setEditingJob(null);
                  setIsJobFormOpen(true);
                }}
                onEditJob={(j) => {
                  setEditingJob(j);
                  setIsJobFormOpen(true);
                }}
                effectiveUid={effectiveUid}
                isAdminMode={isAdminMode}
                getCategoryInfo={getCategoryInfo}
              />
            )}

            {activeTab === 'mi_panel' && (
              <MyDashboardView
                effectiveUid={effectiveUid}
                myProfile={myProfile}
                myPortfolio={myPortfolio}
                sessionAccount={sessionAccount}
                db={db}
                appId={appId}
                showToast={showToast}
                onOpenDeleteAccount={() => setDeleteAccountConfirmOpen(true)}
                onOpenLightbox={(img) => setLightboxImage(img)}
                onOpenWorkerPreview={(w) => setSelectedWorker(w)}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboardView
                isAdminMode={isAdminMode}
                setIsAdminMode={setIsAdminMode}
                profiles={profiles}
                portfolioItems={portfolioItems}
                jobPostings={jobPostings}
                reports={reports}
                adminLogs={adminLogs}
                db={db}
                appId={appId}
                recordAdminLog={recordAdminLog}
                showToast={showToast}
                onOpenWorker={(w) => setSelectedWorker(w)}
                onOpenJob={(j) => setSelectedJob(j)}
                onResetSeed={seedCommunityDatabase}
              />
            )}

            {activeTab === 'arquitectura' && (
              <TechnicalArchitectureView
                sqlSchema={SUPABASE_SQL_SCHEMA}
                nextjsStructure={NEXTJS_STRUCTURE_DOC}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* PIE DE PÁGINA INSTITUCIONAL Y CUMPLIMIENTO REGULATORIO COLOMBIANO */}
      <footer className="bg-slate-950 text-slate-200 border-t-4 border-blue-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                  LR
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    La Reliquia Trabaja
                  </h3>
                  <p className="text-xs text-blue-400 font-semibold">
                    Talento local, oportunidades para todos
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Plataforma comunitaria de directorio de oficios, emprendimientos y bolsa de empleo local para los habitantes del barrio La Reliquia, Villavicencio, Meta, Colombia. Impulsando la economía popular y el trabajo digno entre vecinos.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  📍 Comuna 4 • Villavicencio, Meta
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  🔒 Protección Ley 1581 de 2012
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                Navegación Rápida
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setActiveTab('inicio')}
                    className="hover:text-blue-300 transition-colors"
                  >
                    Página Principal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('directorio')}
                    className="hover:text-blue-300 transition-colors"
                  >
                    Directorio de Trabajadores
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('empleos')}
                    className="hover:text-blue-300 transition-colors"
                  >
                    Bolsa de Empleo Comunitaria
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        setAuthModalMode('register');
                        setAuthModalOpen(true);
                      } else {
                        setActiveTab('mi_panel');
                      }
                    }}
                    className="hover:text-blue-300 transition-colors"
                  >
                    Publicar mi Oficio / Portafolio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('arquitectura')}
                    className="hover:text-blue-300 transition-colors"
                  >
                    Documentación Técnica Supabase
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                Marco Legal Colombia
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                <p>
                  <strong className="text-white">Habeas Data (Ley 1581 de 2012):</strong> Todo habitante controla la publicación de su perfil, fotografías y número de WhatsApp, con derecho permanente a actualizar o suprimir su cuenta.
                </p>
                <p>
                  <strong className="text-white">Aviso Regulatorio (Ley 1636 de 2013):</strong> Esta plataforma opera como un directorio comunitario gratuito de contacto vecinal directo y cartelera informativa; no realiza cobros ni intermediación laboral comercial sin autorización del Ministerio del Trabajo / SPE.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              © {new Date().getFullYear()} Proyecto Comunitario La Reliquia Trabaja — Villavicencio, Meta, Colombia.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                   if (!isLoggedIn) {
                     setAuthModalMode('register');
                     setAuthModalOpen(true);
                   } else {
                     setActiveTab('mi_panel');
                   }
                }}
                className="underline hover:text-blue-400"
              >
                Política de Tratamiento de Datos
              </button>
              <button
                onClick={() => setActiveTab('arquitectura')}
                className="underline hover:text-blue-400"
              >
                Esquema PostgreSQL & RLS
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* MODALES FLOTANTES DE LA PLATAFORMA                                   */}
      {/* ==================================================================== */}

      {/* 1. MODAL DETALLE DE TRABAJADOR Y PORTAFOLIO FOTOGRÁFICO */}
      {selectedWorker && (
        <WorkerProfileModal
          worker={selectedWorker}
          portfolio={portfolioItems.filter(
            (p) => p.profileId === selectedWorker.id && p.status !== 'flagged'
          )}
          categoryInfo={getCategoryInfo(selectedWorker.category)}
          onClose={() => setSelectedWorker(null)}
          onOpenLightbox={(item) => setLightboxImage(item)}
          onContactWhatsapp={(w) => setWhatsappPreviewData(w)}
          onReport={(target) => {
            setReportModalData({
              targetType: 'profile',
              targetId: target.id,
              targetTitle: `Perfil: ${target.name} (${target.profession})`
            });
          }}
        />
      )}

      {/* 2. LIGHTBOX DE FOTOGRAFÍA EN PANTALLA COMPLETA */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
              <div>
                <h4 className="font-bold text-base">{lightboxImage.title}</h4>
                <p className="text-xs text-blue-400">
                  Trabajo realizado por {lightboxImage.workerName}
                </p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black max-h-[70vh] overflow-auto">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="px-6 py-4 bg-slate-950 text-slate-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p>{lightboxImage.description}</p>
              <span className="text-xs text-slate-500 shrink-0">
                Formato verificado • {lightboxImage.fileSizeKB || 40} KB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL DETALLE DE VACANTE Y POSTULACIÓN */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          categoryInfo={getCategoryInfo(selectedJob.category)}
          effectiveUid={effectiveUid}
          myProfile={myProfile}
          isAdminMode={isAdminMode}
          applications={jobApplications.filter((a) => a.jobId === selectedJob.id)}
          db={db}
          appId={appId}
          showToast={showToast}
          onClose={() => setSelectedJob(null)}
          onEditJob={(j) => {
            setSelectedJob(null);
            setEditingJob(j);
            setIsJobFormOpen(true);
          }}
          onReport={(j) => {
            setReportModalData({
              targetType: 'job',
              targetId: j.id,
              targetTitle: `Vacante: ${j.title} - ${j.company}`
            });
          }}
        />
      )}

      {/* 4. MODAL PUBLICAR O EDITAR VACANTE DE EMPLEO */}
      {isJobFormOpen && (
        <JobFormModal
          editingJob={editingJob}
          effectiveUid={effectiveUid}
          db={db}
          appId={appId}
          showToast={showToast}
          onClose={() => {
            setIsJobFormOpen(false);
            setEditingJob(null);
          }}
        />
      )}

      {/* 5. MODAL DE REPORTE COMUNITARIO */}
      {reportModalData && (
        <ReportModal
          reportData={reportModalData}
          effectiveUid={effectiveUid}
          db={db}
          appId={appId}
          showToast={showToast}
          onClose={() => setReportModalData(null)}
        />
      )}

      {/* 6. MODAL DE CONTACTO SEGURO POR WHATSAPP */}
      {whatsappPreviewData && (
        <WhatsappContactModal
          worker={whatsappPreviewData}
          onClose={() => setWhatsappPreviewData(null)}
        />
      )}

      {/* 7. MODAL DE AUTENTICACIÓN, VERIFICACIÓN DE CORREO Y RECUPERACIÓN */}
      {authModalOpen && (
        <AuthAccountModal
          mode={authModalMode}
          setMode={setAuthModalMode}
          sessionAccount={sessionAccount}
          setSessionAccount={setSessionAccount}
          setIsLoggedIn={setIsLoggedIn}
          setActiveTab={setActiveTab}
          showToast={showToast}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* 8. MODAL DE CONFIRMACIÓN PARA ELIMINAR CUENTA (DERECHO DE SUPRESIÓN LEY 1581) */}
      {deleteAccountConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              ¿Confirmas la eliminación definitiva de tu perfil y portafolio?
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              En cumplimiento del derecho de supresión (Habeas Data - Ley 1581 de 2012), esta acción eliminará tu perfil profesional del directorio de La Reliquia y borrará todas las fotografías de tu portafolio.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteAccountConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    if (myProfile) {
                      for (const item of myPortfolio) {
                        await deleteDoc(
                          doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_items', item.id)
                        );
                      }
                      await deleteDoc(
                        doc(db, 'artifacts', appId, 'public', 'data', 'profiles', myProfile.id)
                      );
                    }
                    setDeleteAccountConfirmOpen(false);
                    showToast('Tu perfil y fotografías han sido eliminados permanentemente.');
                    setActiveTab('inicio');
                  } catch (err) {
                    console.error('Error eliminando cuenta:', err);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
              >
                Sí, eliminar mis datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISTA 1: PÁGINA PRINCIPAL (INICIO)
// ============================================================================
function HomeView({
  approvedProfiles,
  portfolioItems,
  jobPostings,
  categoryStats,
  globalSearch,
  setGlobalSearch,
  onHeroSearch,
  onSelectCategory,
  onNavigate,
  onOpenWorker,
  onOpenJob,
  onOpenNewJob,
  getCategoryInfo
}) {
  const openJobs = jobPostings.filter((j) => j.status === 'abierta');

  return (
    <div>
      {/* HERO PRINCIPAL */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>PLATAFORMA OFICIAL COMUNITARIA • BARRIO LA RELIQUIA, VILLAVICENCIO</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Conectamos el <span className="text-blue-500">talento de nuestros vecinos</span> con oportunidades reales de trabajo.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Encuentra maestros de obra, modistas, mecánicos, técnicos, gastronomía llanera y emprendimientos dentro del barrio La Reliquia, o postúlate a las vacantes locales sin intermediarios.
              </p>

              {/* Buscador General Unificado */}
              <form
                onSubmit={onHeroSearch}
                className="bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
              >
                <div className="flex items-center gap-3 px-3 py-2 flex-1">
                  <Search className="w-5 h-5 text-blue-800 shrink-0" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="¿Qué necesitas hoy? Ej: Maestro de obra, modista, electricista..."
                    className="w-full text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shrink-0 shadow-sm"
                >
                  Buscar en La Reliquia
                </button>
              </form>

              {/* Botones Principales de Acción */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setAuthModalMode('register');
                      setAuthModalOpen(true);
                    } else {
                      onNavigate('mi_panel');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  Registrar mi Oficio y Portafolio
                </button>
                <button
                  onClick={onOpenNewJob}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                  Publicar Oferta de Empleo
                </button>
              </div>
            </div>

            {/* Tarjeta de Impacto Comunitario en Vivo */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                      IMPACTO EN TIEMPO REAL
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      Comunidad La Reliquia Activa
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {approvedProfiles.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Trabajadores y Emprendedores
                    </p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {portfolioItems.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Fotos de Trabajos Reales
                    </p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {openJobs.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Vacantes de Empleo Abiertas
                    </p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-3xl font-black text-blue-400">
                      {SECTORS.length}
                    </p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Sectores del Barrio Cubiertos
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">
                      Trato directo y sin comisiones
                    </p>
                    <p className="mt-0.5 text-slate-400">
                      Contacta por WhatsApp directamente a los trabajadores que han autorizado mostrar su número conforme a la Ley 1581 de 2012.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CATEGORÍAS DE TRABAJADORES Y SERVICIOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
              DIRECTORIO POR OFICIOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Categorías de Trabajadores y Servicios
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Selecciona una categoría para explorar los perfiles y portafolios fotográficos del barrio.
            </p>
          </div>
          <button
            onClick={() => onNavigate('directorio')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 hover:text-blue-900"
          >
            <span>Ver todo el directorio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const stats = categoryStats[cat.id] || { workers: 0, jobs: 0 };
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group text-left bg-white hover:bg-blue-50/50 p-5 rounded-2xl border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${cat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-blue-900 truncate">
                      {cat.name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-800 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] font-bold">
                    <span className="text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md">
                      {stats.workers} {stats.workers === 1 ? 'trabajador' : 'trabajadores'}
                    </span>
                    {stats.jobs > 0 && (
                      <span className="text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                        {stats.jobs} {stats.jobs === 1 ? 'vacante' : 'vacantes'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN DE TRABAJADORES DESTACADOS EN LA RELIQUIA */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                TALENTO VERIFICADO DEL BARRIO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Trabajadores y Emprendimientos Destacados
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Conoce la experiencia y fotografías reales de los trabajos realizados por tus vecinos.
              </p>
            </div>
            <button
              onClick={() => onNavigate('directorio')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
            >
              Explorar todos los perfiles ({approvedProfiles.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedProfiles.slice(0, 6).map((worker) => {
              const catInfo = getCategoryInfo(worker.category);
              const workerPhotos = portfolioItems.filter(
                (p) => p.profileId === worker.id && p.status !== 'flagged'
              );
              return (
                <div
                  key={worker.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-600 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* Cabecera con miniatura de portafolio si tiene */}
                  {workerPhotos.length > 0 ? (
                    <div
                      onClick={() => onOpenWorker(worker)}
                      className="h-40 bg-slate-950 relative cursor-pointer overflow-hidden group"
                    >
                      <img
                        src={workerPhotos[0].imageUrl}
                        alt={workerPhotos[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <span className="absolute top-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        {workerPhotos.length} {workerPhotos.length === 1 ? 'foto' : 'fotos'}
                      </span>
                      <p className="absolute bottom-2.5 left-3 right-3 text-xs text-blue-300 font-semibold truncate">
                        📷 {workerPhotos[0].title}
                      </p>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-r from-slate-900 to-blue-900 flex items-center px-5">
                      <span className="text-xs font-bold text-slate-100">
                        {catInfo.name}
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-lg text-slate-900">
                              {worker.name}
                            </h3>
                            {worker.verified && (
                              <CheckCircle2
                                className="w-4 h-4 text-blue-600 shrink-0"
                                title="Vecino con perfil verificado"
                              />
                            )}
                          </div>
                          <p className="text-sm font-bold text-blue-800">
                            {worker.profession}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {worker.rating || '5.0'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-700" />
                          {worker.sector}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-blue-800">
                          {worker.experienceYears} años exp.
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {worker.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(worker.skills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-lg">
                        {worker.availability}
                      </span>
                      <button
                        onClick={() => onOpenWorker(worker)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
                      >
                        Ver Perfil y Portafolio
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECCIÓN DE OPORTUNIDADES RECIENTES EN LA BOLSA DE EMPLEO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
              CONTRATACIÓN LOCAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Oportunidades Laborales Recientes
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Vacantes activas publicadas por comercios, talleres y contratistas de La Reliquia y Villavicencio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewJob}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm"
            >
              + Publicar Vacante
            </button>
            <button
              onClick={() => onNavigate('empleos')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm"
            >
              Ver todas ({openJobs.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {openJobs.slice(0, 4).map((job) => {
            const cat = getCategoryInfo(job.category);
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                      {cat.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                      ● Vacante Abierta
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {job.title}
                  </h3>
                  <p className="text-sm font-bold text-blue-800 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </p>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{job.sector}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 font-bold text-blue-900">
                      <DollarSign className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>Remuneración: {job.salaryCOP || 'A convenir'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Cierre: {job.closingDate}
                  </span>
                  <button
                    onClick={() => onOpenJob(job)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all"
                  >
                    Ver Requisitos y Postularse
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BANNER INSTITUCIONAL DE PROTECCIÓN DE DATOS Y MARCO REGULATORIO COLOMBIANO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600/80 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="inline-flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Seguridad Jurídica y Protección de Datos en Colombia</span>
              </div>
              <h3 className="text-xl font-black">
                Compromiso con la Ley 1581 de 2012 (Habeas Data) y Normativa Laboral
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                En <strong>La Reliquia Trabaja</strong> ningún número telefónico ni fotografía se publica sin el consentimiento libre, previo y expreso de su titular. Además, informamos a la comunidad que esta plataforma funciona como un directorio vecinal gratuito de auto-publicación; para operar servicios formales de gestión y colocación de empleo se debe revisar la autorización ante el <strong>Ministerio del Trabajo / Unidad del Servicio Público de Empleo (Ley 1636 de 2013)</strong>.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  } else {
                    onNavigate('mi_panel');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs text-center"
              >
                Configurar mi Privacidad y Consentimiento
              </button>
              <button
                onClick={() => onNavigate('arquitectura')}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs text-center"
              >
                Ver Políticas RLS y Requisitos Legales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// VISTA 2: DIRECTORIO DE TRABAJADORES Y EMPRENDIMIENTOS
// ============================================================================
function DirectoryView({
  filteredProfiles,
  portfolioItems,
  dirSearch,
  setDirSearch,
  dirCategory,
  setDirCategory,
  dirSector,
  setDirSector,
  dirAvailability,
  setDirAvailability,
  dirOnlyWithPhotos,
  setDirOnlyWithPhotos,
  onOpenWorker,
  onContactWhatsapp,
  onNavigate,
  getCategoryInfo
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            TALENTO DEL BARRIO LA RELIQUIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Directorio de Trabajadores, Oficios y Profesionales
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Filtra por oficio, sector del barrio o disponibilidad y revisa las fotos de sus trabajos antes de contratar.
          </p>
        </div>
        <button
          onClick={() => {
            onNavigate('mi_panel');
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          Publicar o Editar mi Perfil
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              placeholder="Buscar por nombre, profesión o habilidad (ej. enchape, moto, costura)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={dirCategory}
              onChange={(e) => setDirCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dirSector}
              onChange={(e) => setDirSector(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todos">Todos los sectores</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dirAvailability}
              onChange={(e) => setDirAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Cualquier disponibilidad</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={dirOnlyWithPhotos}
              onChange={(e) => setDirOnlyWithPhotos(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
            />
            <span>Mostrar únicamente perfiles con fotografías de trabajos en su portafolio</span>
          </label>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-semibold">
              Mostrando <strong>{filteredProfiles.length}</strong> profesionales
            </span>
            {(dirSearch ||
              dirCategory !== 'todas' ||
              dirSector !== 'todos' ||
              dirAvailability !== 'todas' ||
              dirOnlyWithPhotos) && (
              <button
                onClick={() => {
                  setDirSearch('');
                  setDirCategory('todas');
                  setDirSector('todos');
                  setDirAvailability('todas');
                  setDirOnlyWithPhotos(false);
                }}
                className="text-blue-800 font-bold underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listado de Tarjetas del Directorio */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-800">
            No encontramos trabajadores con esos filtros específicos
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Intenta ampliar tu búsqueda a todos los sectores de La Reliquia o registra tu propio perfil si ofreces este servicio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((worker) => {
            const cat = getCategoryInfo(worker.category);
            const photos = portfolioItems.filter(
              (p) => p.profileId === worker.id && p.status !== 'flagged'
            );
            return (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Franja superior de categoría */}
                  <div className="px-5 py-3 bg-slate-950 text-white flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400 truncate">
                      {cat.name}
                    </span>
                    <span className="text-slate-300 font-medium shrink-0">
                      {worker.experienceYears} años exp.
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{worker.name}</span>
                          {worker.verified && (
                            <CheckCircle2
                              className="w-4 h-4 text-blue-600 shrink-0"
                              title="Perfil Verificado"
                            />
                          )}
                        </h3>
                        <p className="text-sm font-bold text-blue-800">
                          {worker.profession}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-[11px] shrink-0">
                        {worker.availability}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{worker.sector}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {worker.bio}
                    </p>

                    {/* Habilidades */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {(worker.skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Mini Galería de Portafolio en Tarjeta */}
                    {photos.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-blue-700" />
                          Portafolio de trabajos ({photos.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {photos.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => onOpenWorker(worker)}
                              className="h-20 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer group"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Tarjeta */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenWorker(worker)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs text-center transition-all"
                  >
                    Ver Portafolio Completo
                  </button>

                  {worker.consentPublicWhatsapp && worker.whatsapp ? (
                    <button
                      onClick={() => onContactWhatsapp(worker)}
                      className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-white" />
                      <span>WhatsApp</span>
                    </button>
                  ) : (
                    <span
                      className="py-2 px-2.5 rounded-xl bg-slate-200 text-slate-600 font-semibold text-[11px] inline-flex items-center gap-1"
                      title="El trabajador reservó su número telefónico público (Ley 1581)"
                    >
                      <Lock className="w-3 h-3" />
                      Teléfono Privado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISTA 3: BOLSA DE EMPLEO COMUNITARIA
// ============================================================================
function JobsBoardView({
  filteredJobs,
  jobSearch,
  setJobSearch,
  jobCategory,
  setJobCategory,
  jobTypeFilter,
  setJobTypeFilter,
  jobModalityFilter,
  setJobModalityFilter,
  jobShowClosed,
  setJobShowClosed,
  onOpenJob,
  onOpenNewJob,
  onEditJob,
  effectiveUid,
  isAdminMode,
  getCategoryInfo
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
            OPORTUNIDADES EN VILLAVICENCIO Y LA RELIQUIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Bolsa de Empleo Comunitaria
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Consulta vacantes locales o publica una oferta si necesitas contratar personal de nuestro barrio.
          </p>
        </div>

        <button
          onClick={onOpenNewJob}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Publicar Nueva Vacante
        </button>
      </div>

      {/* Filtros de Vacantes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              placeholder="Cargo, empresa o palabra clave..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todos">Cualquier tipo de jornada</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={jobModalityFilter}
              onChange={(e) => setJobModalityFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todas">Toda modalidad</option>
              {JOB_MODALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <label className="inline-flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={jobShowClosed}
              onChange={(e) => setJobShowClosed(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
            />
            <span>Incluir también convocatorias cerradas en el listado</span>
          </label>
          <span className="text-slate-500 font-semibold">
            {filteredJobs.length} vacantes encontradas
          </span>
        </div>
      </div>

      {/* Listado de Vacantes */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const cat = getCategoryInfo(job.category);
          const isOwner = job.authorUid === effectiveUid || isAdminMode;
          const isOpen = job.status === 'abierta';

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-600 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs">
                    {cat.name}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                      isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isOpen ? '● Convocatoria Abierta' : 'Convocatoria Cerrada'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Publicada: {job.publishedAt} • Cierra: {job.closingDate}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5 text-blue-800">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    {job.sector} ({job.modality})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-700" />
                    {job.jobType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    <DollarSign className="w-4 h-4 text-slate-600" />
                    {job.salaryCOP || 'Salario a convenir'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-2.5 shrink-0">
                <button
                  onClick={() => onOpenJob(job)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all text-center"
                >
                  Ver Detalles y Postularme
                </button>
                {isOwner && (
                  <button
                    onClick={() => onEditJob(job)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar / Cambiar Estado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// VISTA 4: MI PERFIL PROFESIONAL, PORTAFOLIO FOTOGRÁFICO Y PRIVACIDAD LEY 1581
// ============================================================================
function MyDashboardView({
  effectiveUid,
  myProfile,
  myPortfolio,
  sessionAccount,
  db,
  appId,
  showToast,
  onOpenDeleteAccount,
  onOpenLightbox,
  onOpenWorkerPreview
}) {
  const [dashboardTab, setDashboardTab] = useState('perfil');
  
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    category: 'construccion',
    sector: SECTORS[0],
    experienceYears: 3,
    skillsText: '',
    bio: '',
    availability: AVAILABILITY_OPTIONS[0],
    whatsapp: '',
    email: sessionAccount.email,
    consentHabeasData: false,
    consentPublicWhatsapp: false
  });

  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoMeta, setPhotoMeta] = useState({ format: 'image/jpeg', sizeKB: 45 });
  const [photoError, setPhotoError] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        name: myProfile.name || '',
        profession: myProfile.profession || '',
        category: myProfile.category || 'construccion',
        sector: myProfile.sector || SECTORS[0],
        experienceYears: myProfile.experienceYears ?? 2,
        skillsText: (myProfile.skills || []).join(', '),
        bio: myProfile.bio || '',
        availability: myProfile.availability || AVAILABILITY_OPTIONS[0],
        whatsapp: myProfile.whatsapp || '',
        email: myProfile.email || sessionAccount.email,
        consentHabeasData: Boolean(myProfile.consentHabeasData),
        consentPublicWhatsapp: Boolean(myProfile.consentPublicWhatsapp)
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        email: sessionAccount.email,
        name: sessionAccount.displayName || ''
      }));
    }
  }, [myProfile, effectiveUid, sessionAccount]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.consentHabeasData) {
      showToast(
        'Debes autorizar el tratamiento de datos personales (Ley 1581 de 2012) para publicar tu perfil.',
        'error'
      );
      return;
    }

    const skillsArray = formData.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const profileId = myProfile ? myProfile.id : `worker-${effectiveUid.slice(0, 8)}`;

    const payload = {
      id: profileId,
      uid: effectiveUid,
      name: formData.name.trim(),
      profession: formData.profession.trim(),
      category: formData.category,
      sector: formData.sector,
      experienceYears: Number(formData.experienceYears) || 0,
      skills: skillsArray.length > 0 ? skillsArray : ['Servicio garantizado en La Reliquia'],
      bio: formData.bio.trim(),
      availability: formData.availability,
      whatsapp: formData.whatsapp.replace(/\D/g, ''),
      email: formData.email.trim(),
      consentHabeasData: formData.consentHabeasData,
      consentPublicWhatsapp: formData.consentPublicWhatsapp,
      status: myProfile ? myProfile.status : 'approved',
      verified: myProfile ? myProfile.verified : false,
      rating: myProfile ? myProfile.rating : 5.0,
      completedJobs: myProfile ? myProfile.completedJobs : 0,
      createdAt: myProfile ? myProfile.createdAt : new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profileId), payload);
      showToast('¡Perfil profesional guardado y actualizado en el directorio de La Reliquia!');
    } catch (error) {
      console.error('Error guardando perfil:', error);
    }
  };

  const handleFileChange = (e) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Formato no permitido. Usa únicamente imágenes JPG, PNG o WEBP.');
      return;
    }

    const sizeKB = Math.round(file.size / 1024);
    if (sizeKB > 2048) {
      setPhotoError(`El archivo pesa ${sizeKB} KB y supera el límite máximo permitido de 2MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoPreview(compressedDataUrl);
        setPhotoMeta({ format: file.type, sizeKB });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePortfolioItem = async (e) => {
    e.preventDefault();
    if (!myProfile) {
      showToast('Primero guarda tus datos básicos de perfil profesional (Pestaña "Editar Perfil").');
      return;
    }
    if (!photoTitle.trim() || !photoDescription.trim() || !photoPreview) {
      setPhotoError('Completa el título, la descripción y selecciona una fotografía.');
      return;
    }

    try {
      if (editingPhotoId) {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_items', editingPhotoId),
          {
            title: photoTitle.trim(),
            description: photoDescription.trim(),
            imageUrl: photoPreview
          }
        );
        showToast('Fotografía del portafolio actualizada correctamente.');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_items'), {
          profileId: myProfile.id,
          workerName: myProfile.name,
          title: photoTitle.trim(),
          description: photoDescription.trim(),
          category: myProfile.category,
          imageUrl: photoPreview,
          fileFormat: photoMeta.format,
          fileSizeKB: photoMeta.sizeKB,
          createdAt: new Date().toISOString(),
          status: 'approved'
        });
        showToast('¡Nueva fotografía añadida a tu portafolio profesional!');
      }

      setPhotoTitle('');
      setPhotoDescription('');
      setPhotoPreview('');
      setEditingPhotoId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error guardando item de portafolio:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Cabecera del Dashboard */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-2xl border-4 border-slate-800">
            {(sessionAccount.displayName || 'V').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider mb-2 inline-block">
              MI PANEL DE USUARIO
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Hola, {sessionAccount.displayName || 'Vecino'}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Administra tu información de oficio y sube fotografías de tus mejores trabajos.
            </p>
          </div>
        </div>

        {myProfile && (
          <button
            onClick={() => onOpenWorkerPreview(myProfile)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shrink-0 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            Ver mi perfil público
          </button>
        )}
      </div>

      {/* Navegación por Pestañas Internas */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setDashboardTab('perfil')}
          className={`px-6 py-3.5 font-extrabold text-sm border-b-4 transition-all ${
            dashboardTab === 'perfil'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Editar Perfil y Privacidad
        </button>
        <button
          onClick={() => setDashboardTab('portafolio')}
          className={`px-6 py-3.5 font-extrabold text-sm border-b-4 transition-all ${
            dashboardTab === 'portafolio'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mi Portafolio (Fotos)
        </button>
      </div>

      <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* ========================================= */}
        {/* PESTAÑA 1: EDITAR PERFIL                  */}
        {/* ========================================= */}
        {dashboardTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-extrabold text-slate-900">
                Información Profesional y de Oficio
              </h2>
              <p className="text-xs text-slate-500 mt-1">Completa los campos para aparecer en las búsquedas del barrio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej. María Fernanda López" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profesión, Oficio o Emprendimiento *</label>
                <input type="text" required value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Ej. Maestra de Modistería" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría Principal *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600">
                  {CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sector de Atención *</label>
                <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600">
                  {SECTORS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Años de Experiencia *</label>
                <input type="number" min="0" required value={formData.experienceYears} onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disponibilidad Actual *</label>
                <select value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600">
                  {AVAILABILITY_OPTIONS.map((a) => (<option key={a} value={a}>{a}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Habilidades y Especialidades (separadas por coma) *</label>
              <input type="text" required value={formData.skillsText} onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })} placeholder="Ej. Enchape, Estuco, Pintura" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descripción de Servicios *</label>
              <textarea rows={3} required value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Describe qué servicios ofreces a los habitantes de La Reliquia..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
                <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="Ej. 3114567890" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            {/* PRIVACIDAD */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-950 font-extrabold text-xs uppercase">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                <span>Consentimiento Informado (Ley 1581 de 2012)</span>
              </div>
              <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer">
                <input type="checkbox" required checked={formData.consentHabeasData} onChange={(e) => setFormData({ ...formData, consentHabeasData: e.target.checked })} className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 shrink-0" />
                <span><strong>Autorización obligatoria:</strong> Autorizo de manera voluntaria a la plataforma para publicar mi perfil en el directorio comunitario.</span>
              </label>
              <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer pt-3 border-t border-blue-200/70">
                <input type="checkbox" checked={formData.consentPublicWhatsapp} onChange={(e) => setFormData({ ...formData, consentPublicWhatsapp: e.target.checked })} className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 shrink-0" />
                <span><strong>WhatsApp público (Opcional):</strong> Autorizo mostrar un botón de contacto directo a mi número de WhatsApp en mi perfil público.</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              {myProfile ? (
                <button type="button" onClick={onOpenDeleteAccount} className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                  Eliminar cuenta y datos (Derecho de Supresión)
                </button>
              ) : (
                <div />
              )}
              <button type="submit" className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-sm transition-all ml-auto">
                {myProfile ? 'Guardar Cambios del Perfil' : 'Publicar mi Perfil Oficial'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================= */}
        {/* PESTAÑA 2: MI PORTAFOLIO DE FOTOS         */}
        {/* ========================================= */}
        {dashboardTab === 'portafolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <form onSubmit={handleSavePortfolioItem} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-800" />
                    Subir Fotografía
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Título del Trabajo *</label>
                  <input type="text" required value={photoTitle} onChange={(e) => setPhotoTitle(e.target.value)} placeholder="Ej. Enchape de baño" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descripción del Trabajo *</label>
                  <textarea rows={2} required value={photoDescription} onChange={(e) => setPhotoDescription(e.target.value)} placeholder="Explica brevemente qué hiciste..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fotografía (JPG/PNG/WEBP • Máx 2MB) *</label>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 cursor-pointer" />
                  
                  <div className="mt-2 text-right">
                    <button type="button" onClick={() => {
                        const generated = createSvgPortfolioDataUri(photoTitle || 'Trabajo Verificado', myProfile?.profession || 'Talento La Reliquia', '#1e3a8a', '#3b82f6');
                        setPhotoPreview(generated); setPhotoMeta({ format: 'image/webp', sizeKB: 44 }); setPhotoError('');
                      }} className="text-[11px] font-bold text-blue-800 underline">
                      Generar foto de prueba
                    </button>
                  </div>
                </div>

                {photoError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{photoError}</div>}
                
                {photoPreview && (
                  <div className="rounded-xl overflow-hidden border border-slate-300 bg-black relative">
                    <img src={photoPreview} alt="Vista previa" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {editingPhotoId && (
                    <button type="button" onClick={() => { setEditingPhotoId(null); setPhotoTitle(''); setPhotoDescription(''); setPhotoPreview(''); }} className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm transition-all">
                    {editingPhotoId ? 'Guardar Cambios' : '+ Subir al Portafolio'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-7">
              <h3 className="font-extrabold text-lg text-slate-900 mb-4 border-b border-slate-200 pb-2">
                Mis Fotografías Publicadas ({myPortfolio.length})
              </h3>
              
              {!myProfile ? (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-sm font-semibold text-center">
                  Primero debes guardar tu información en la pestaña "Editar Perfil" antes de subir fotografías.
                </div>
              ) : myPortfolio.length === 0 ? (
                <div className="p-10 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold">No tienes fotos en tu portafolio.</p>
                  <p className="text-xs mt-1">Los perfiles con fotografías reales reciben más contactos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {myPortfolio.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
                      <div className="h-32 bg-slate-900 relative">
                        <img src={item.imageUrl} alt={item.title} onClick={() => onOpenLightbox(item)} className="w-full h-full object-cover cursor-pointer hover:opacity-90" />
                      </div>
                      <div className="p-3 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button onClick={() => { setEditingPhotoId(item.id); setPhotoTitle(item.title); setPhotoDescription(item.description); setPhotoPreview(item.imageUrl); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-800 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 hover:bg-blue-50">
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={async () => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_items', item.id)); showToast('Foto eliminada.'); }} className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VISTA 5: PANEL PRIVADO DE ADMINISTRACIÓN Y MODERACIÓN
// ============================================================================
function AdminDashboardView({
  isAdminMode,
  setIsAdminMode,
  profiles,
  portfolioItems,
  jobPostings,
  reports,
  adminLogs,
  db,
  appId,
  recordAdminLog,
  showToast,
  onOpenWorker,
  onOpenJob,
  onResetSeed
}) {
  const [adminSubTab, setAdminSubTab] = useState('perfiles');

  if (!isAdminMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Acceso Restringido a Administradores Autorizados
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Por seguridad, los permisos administrativos de <strong>La Reliquia Trabaja</strong> nunca se asignan automáticamente al registrarse. En producción se validan mediante la tabla <code>public.user_roles</code> y la función <code>public.is_admin()</code> en Supabase RLS.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAdminMode(true)}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm"
            >
              Habilitar Credencial de Administrador (Modo Director de Proyecto)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Encabezado Admin */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
            PANEL DE GOBERNANZA Y MODERACIÓN COMUNITARIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            Administración — La Reliquia Trabaja
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aprueba perfiles, modera fotografías, gestiona vacantes y audita cada acción administrativa.
          </p>
        </div>

        <button
          onClick={onResetSeed}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs border border-slate-700 self-start md:self-center"
        >
          <RefreshCw className="w-4 h-4" />
          Restaurar Datos Semilla
        </button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Total Perfiles</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{profiles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Perfiles Aprobados</p>
          <p className="text-2xl font-black text-blue-800 mt-1">
            {profiles.filter((p) => p.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Fotos en Portafolio</p>
          <p className="text-2xl font-black text-blue-800 mt-1">
            {portfolioItems.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Vacantes Activas</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {jobPostings.filter((j) => j.status === 'abierta').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold">Reportes Pendientes</p>
          <p className="text-2xl font-black text-red-600 mt-1">
            {reports.filter((r) => r.status === 'pendiente').length}
          </p>
        </div>
      </div>

      {/* Sub-pestañas de Moderación */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'perfiles', label: `Perfiles de Trabajadores (${profiles.length})` },
          { id: 'portafolios', label: `Moderación de Fotos (${portfolioItems.length})` },
          { id: 'vacantes', label: `Revisión de Vacantes (${jobPostings.length})` },
          { id: 'reportes', label: `Reportes y Auditoría (${reports.length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setAdminSubTab(t.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              adminSubTab === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. GESTIÓN Y APROBACIÓN DE PERFILES */}
      {adminSubTab === 'perfiles' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3.5 font-extrabold">Trabajador / Oficio</th>
                  <th className="p-3.5 font-extrabold">Sector</th>
                  <th className="p-3.5 font-extrabold">Consentimiento Ley 1581</th>
                  <th className="p-3.5 font-extrabold">Estado</th>
                  <th className="p-3.5 font-extrabold text-right">Acciones de Moderación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {p.name}
                        {p.verified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </p>
                      <p className="text-blue-800 font-semibold">{p.profession}</p>
                    </td>
                    <td className="p-3.5 text-slate-600">{p.sector}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                        Habeas Data: {p.consentHabeasData ? 'Sí' : 'No'} • WhatsApp:{' '}
                        {p.consentPublicWhatsapp ? 'Público' : 'Privado'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          p.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.status === 'approved' ? 'Aprobado' : 'Pendiente / Oculto'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenWorker(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        Inspeccionar
                      </button>
                      <button
                        onClick={async () => {
                          const nextStatus =
                            p.status === 'approved' ? 'pending' : 'approved';
                          await updateDoc(
                            doc(db, 'artifacts', appId, 'public', 'data', 'profiles', p.id),
                            { status: nextStatus }
                          );
                          await recordAdminLog(
                            nextStatus === 'approved'
                              ? 'APROBACIÓN DE PERFIL'
                              : 'SUSPENSIÓN DE PERFIL',
                            'profile',
                            p.name,
                            `Cambio de estado a ${nextStatus}`
                          );
                          showToast(`Estado del perfil de ${p.name} actualizado a ${nextStatus}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                      >
                        {p.status === 'approved' ? 'Suspender' : 'Aprobar'}
                      </button>
                      <button
                        onClick={async () => {
                          await updateDoc(
                            doc(db, 'artifacts', appId, 'public', 'data', 'profiles', p.id),
                            { verified: !p.verified }
                          );
                          await recordAdminLog(
                            'INSIGNIA VERIFICACIÓN',
                            'profile',
                            p.name,
                            `Verificación cambiada a ${!p.verified}`
                          );
                          showToast(`Verificación de ${p.name} actualizada`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        {p.verified ? 'Quitar Sello' : 'Verificar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. MODERACIÓN DE FOTOGRAFÍAS DE PORTAFOLIO */}
      {adminSubTab === 'portafolios' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-44 object-cover bg-slate-900"
                />
                <div className="p-4">
                  <span className="text-[11px] font-bold text-blue-800">
                    Autor: {item.workerName}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {item.fileFormat} • {item.fileSizeKB} KB
                </span>
                <button
                  onClick={async () => {
                    await deleteDoc(
                      doc(
                        db,
                        'artifacts',
                        appId,
                        'public',
                        'data',
                        'portfolio_items',
                        item.id
                      )
                    );
                    await recordAdminLog(
                      'MODERACIÓN FOTO',
                      'portfolio',
                      item.title,
                      `Eliminada foto de ${item.workerName}`
                    );
                    showToast('Fotografía retirada por moderación.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Retirar Imagen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. REVISIÓN DE VACANTES */}
      {adminSubTab === 'vacantes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3.5 font-extrabold">Cargo / Empleador</th>
                  <th className="p-3.5 font-extrabold">Sector</th>
                  <th className="p-3.5 font-extrabold">Salario</th>
                  <th className="p-3.5 font-extrabold">Estado</th>
                  <th className="p-3.5 font-extrabold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {jobPostings.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm">{j.title}</p>
                      <p className="text-blue-800 font-semibold">{j.company}</p>
                    </td>
                    <td className="p-3.5 text-slate-600">{j.sector}</td>
                    <td className="p-3.5 font-semibold">{j.salaryCOP}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          j.status === 'abierta'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenJob(j)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold"
                      >
                        Ver
                      </button>
                      <button
                        onClick={async () => {
                          const next = j.status === 'abierta' ? 'cerrada' : 'abierta';
                          await updateDoc(
                            doc(db, 'artifacts', appId, 'public', 'data', 'job_postings', j.id),
                            { status: next }
                          );
                          await recordAdminLog(
                            'ESTADO DE VACANTE',
                            'job',
                            j.title,
                            `Vacante cambiada a ${next}`
                          );
                          showToast(`Vacante marcada como ${next}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white font-bold"
                      >
                        {j.status === 'abierta' ? 'Cerrar' : 'Reabrir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GESTIÓN DE REPORTES Y REGISTRO DE AUDITORÍA ADMINISTRATIVA */}
      {adminSubTab === 'reportes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-600" />
              Reportes Comunitarios Recibidos ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No hay reportes pendientes de moderación en este momento.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.targetTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          r.status === 'pendiente'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <strong>Motivo:</strong> {r.reason} — {r.details}
                    </p>
                    {r.status === 'pendiente' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={async () => {
                            await updateDoc(
                              doc(db, 'artifacts', appId, 'public', 'data', 'reports', r.id),
                              { status: 'resuelto' }
                            );
                            await recordAdminLog(
                              'RESOLUCIÓN DE REPORTE',
                              r.targetType,
                              r.targetTitle,
                              'Reporte marcado como resuelto'
                            );
                            showToast('Reporte marcado como resuelto.');
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-800 text-white font-bold"
                        >
                          Marcar Resuelto
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-800" />
              Registro de Acciones Administrativas (Audit Log)
            </h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 text-xs">
              {adminLogs
                .slice()
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900">
                        {log.action}
                      </span>{' '}
                      — <span className="font-semibold">{log.targetName}</span>
                      <p className="text-slate-600 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISTA 6: CENTRO TÉCNICO (SUPABASE SQL + RLS + STORAGE + NEXT.JS APP ROUTER)
// ============================================================================
function TechnicalArchitectureView({ sqlSchema, nextjsStructure, showToast }) {
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    showToast('Script SQL completo con RLS y Storage copiado al portapapeles.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
        <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
          ARQUITECTURA FULL-STACK LISTA PARA DESPLIEGUE
        </span>
        <h1 className="text-2xl sm:text-3xl font-black mt-2">
          Ingeniería de Base de Datos (Supabase PostgreSQL + RLS) y Next.js
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Además de la aplicación interactiva conectada en vivo que estás operando ahora mismo, aquí tienes los artefactos de infraestructura listos para tu repositorio GitHub, Supabase y Vercel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SQL de Supabase */}
        <div className="lg:col-span-8 bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold text-blue-400">
                supabase/migrations/001_la_reliquia_trabaja_schema.sql
              </span>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs font-mono overflow-x-auto max-h-[560px] leading-relaxed text-slate-300">
            {sqlSchema}
          </pre>
        </div>

        {/* Estructura Next.js, Variables de Entorno y Cumplimiento Legal */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <FolderGit2 className="w-4 h-4" />
              <span>Estructura Next.js (App Router + TypeScript)</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-blue-300 text-[11px] font-mono overflow-x-auto leading-relaxed">
              {nextjsStructure}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Variables de Entorno (.env.local)
            </h3>
            <p className="text-xs text-slate-600">
              Nunca expongas <code>SUPABASE_SERVICE_ROLE_KEY</code> en el cliente. Usa únicamente la clave pública anónima protegida por políticas RLS:
            </p>
            <pre className="p-3 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-mono overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
NEXT_PUBLIC_SITE_URL=https://lareliquiatrabaja.co`}
            </pre>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2.5 text-xs text-slate-800">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600" />
              Checklist Regulatorio Colombia
            </h3>
            <p>
              <strong>1. Ley 1581 de 2012 y Decreto 1377 de 2013:</strong> Se exige autorización previa e informada para publicar datos personales y número de WhatsApp, con opción de revocatoria y supresión inmediata.
            </p>
            <p>
              <strong>2. Servicio Público de Empleo (Ley 1636 de 2013):</strong> Mientras opere como directorio comunitario de contacto vecinal directo y cartelera abierta, no constituye agencia privada de colocación. Si en el futuro se realiza preselección, envío de candidatos o intermediación laboral formal, requiere autorización de la <em>Unidad Administrativa Especial del Servicio Público de Empleo (UAESPE)</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES DE MODALES INTERACTIVOS
// ============================================================================

// Modal de Perfil Individual del Trabajador y Galería de Portafolio
function WorkerProfileModal({
  worker,
  portfolio,
  categoryInfo,
  onClose,
  onOpenLightbox,
  onContactWhatsapp,
  onReport
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Cabecera */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                {categoryInfo.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 flex items-center gap-2">
                <span>{worker.name}</span>
                {worker.verified && (
                  <CheckCircle2
                    className="w-6 h-6 text-blue-500"
                    title="Identidad y oficio verificados en La Reliquia"
                  />
                )}
              </h2>
              <p className="text-base font-bold text-slate-300">
                {worker.profession}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-1 shrink-0">
              <p className="font-bold text-blue-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {worker.sector}
              </p>
              <p className="text-slate-300">
                Experiencia: <strong>{worker.experienceYears} años</strong>
              </p>
              <p className="text-slate-300">
                Disponibilidad: <strong>{worker.availability}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Perfil y Galería */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                Sobre mis servicios en La Reliquia
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {worker.bio}
              </p>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Habilidades y Especialidades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(worker.skills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tarjeta de Contacto con Respeto de Privacidad */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Contacto Directo
                </h4>
                {worker.consentPublicWhatsapp && worker.whatsapp ? (
                  <>
                    <p className="text-xs text-slate-600">
                      Este trabajador autorizó publicar su línea de WhatsApp para cotizaciones y contrataciones:
                    </p>
                    <p className="text-base font-black text-blue-900">
                      +57 {worker.whatsapp}
                    </p>
                    <button
                      onClick={() => onContactWhatsapp(worker)}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="w-4 h-4 text-white" />
                      Escribir por WhatsApp
                    </button>
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-200/80 text-xs text-slate-700 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-slate-600" />
                      Número Telefónico Reservado
                    </p>
                    <p>
                      Por configuración de privacidad (Ley 1581), este vecino prefiere recibir mensajes únicamente por correo ({worker.email || 'registrado'}).
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => onReport(worker)}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 inline-flex items-center gap-1 self-start"
              >
                <Flag className="w-3.5 h-3.5" />
                Reportar perfil a moderación
              </button>
            </div>
          </div>

          {/* Galería Fotográfica del Portafolio */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-800" />
                  Portafolio de Trabajos Realizados ({portfolio.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Haz clic sobre cualquier fotografía para ampliarla en pantalla completa.
                </p>
              </div>
            </div>

            {portfolio.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Este trabajador aún no ha subido fotografías a su galería.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenLightbox(item)}
                    className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-600 transition-all"
                  >
                    <div className="h-48 bg-slate-950 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        Ampliar foto
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de Contacto por WhatsApp
function WhatsappContactModal({ worker, onClose }) {
  const cleanPhone = (worker.whatsapp || '').replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hola ${worker.name}, vi tu perfil de *${worker.profession}* en la plataforma comunitaria *La Reliquia Trabaja* (Villavicencio) y me gustaría cotizar un servicio.`
  );
  const waUrl = `https://wa.me/57${cleanPhone}?text=${message}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs">
            CONTACTO VECINAL DIRECTO
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">
            Contactar a {worker.name}
          </h3>
          <p className="text-xs font-bold text-blue-800">{worker.profession}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <p className="text-slate-500 font-semibold">
            Línea autorizada en Colombia: <strong>+57 {cleanPhone}</strong>
          </p>
          <p className="text-slate-700 italic">
            "Hola {worker.name}, vi tu perfil de {worker.profession} en la plataforma comunitaria La Reliquia Trabaja y me gustaría cotizar un servicio."
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
          >
            Cerrar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-white" />
            Abrir WhatsApp Ahora
          </a>
        </div>
      </div>
    </div>
  );
}

// Modal de Detalle de Vacante y Postulación en Línea
function JobDetailModal({
  job,
  categoryInfo,
  effectiveUid,
  myProfile,
  isAdminMode,
  applications,
  db,
  appId,
  showToast,
  onClose,
  onEditJob,
  onReport
}) {
  const [applicantName, setApplicantName] = useState(myProfile?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(myProfile?.whatsapp || '');
  const [applicantMessage, setApplicantMessage] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) return;

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'job_applications'), {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        applicantUid: effectiveUid,
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim(),
        applicantMessage: applicantMessage.trim(),
        createdAt: new Date().toISOString()
      });
      showToast(`¡Tu postulación a "${job.title}" fue enviada con éxito!`);
      setApplicantMessage('');
    } catch (err) {
      console.error('Error enviando postulación:', err);
    }
  };

  const isOwner = job.authorUid === effectiveUid || isAdminMode;

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="bg-slate-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
            {categoryInfo.name}
          </span>
          <h2 className="text-2xl font-black mt-2 pr-10">{job.title}</h2>
          <p className="text-sm font-bold text-slate-300 mt-0.5">
            {job.company} • {job.sector}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Tipo de jornada</span>
              <strong className="text-slate-900">{job.jobType}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Modalidad</span>
              <strong className="text-slate-900">{job.modality}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Remuneración (COP)</span>
              <strong className="text-blue-900">{job.salaryCOP || 'A convenir'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha límite</span>
              <strong className="text-slate-900">{job.closingDate}</strong>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-500 mb-2">
              Descripción de la Vacante
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{job.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-500 mb-2">
              Requisitos del Cargo
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {(job.requirements || []).map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulario de Postulación Rápida */}
          {job.status === 'abierta' ? (
            <form
              onSubmit={handleApply}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3.5"
            >
              <h4 className="font-extrabold text-base text-blue-950">
                Postularme a esta vacante
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Tu nombre completo *"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="Tu celular / WhatsApp *"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <textarea
                rows={2}
                required
                value={applicantMessage}
                onChange={(e) => setApplicantMessage(e.target.value)}
                placeholder="Cuéntale brevemente al empleador tu experiencia y en qué sector de La Reliquia vives..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-blue-900">
                  Contacto directo del empleador: <strong>{job.contactWhatsapp || job.contactEmail}</strong>
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs"
                >
                  Enviar Postulación Ahora
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold text-center">
              Esta convocatoria ya se encuentra cerrada.
            </div>
          )}

          {/* Postulantes registrados */}
          {applications.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-2">
                Vecinos postulados recientemente ({applications.length})
              </h4>
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900">{app.applicantName}</strong> —{' '}
                      <span className="text-slate-600">{app.applicantMessage}</span>
                    </div>
                    <span className="text-blue-800 font-bold">{app.applicantPhone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <button
              onClick={() => onReport(job)}
              className="text-slate-500 hover:text-red-600 font-semibold inline-flex items-center gap-1"
            >
              <Flag className="w-3.5 h-3.5" />
              Reportar oferta
            </button>
            {isOwner && (
              <button
                onClick={() => onEditJob(job)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                Editar o Cerrar Vacante
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para Crear o Editar Vacante de Empleo
function JobFormModal({ editingJob, effectiveUid, db, appId, showToast, onClose }) {
  const [form, setForm] = useState({
    title: editingJob?.title || '',
    company: editingJob?.company || '',
    category: editingJob?.category || 'construccion',
    sector: editingJob?.sector || SECTORS[0],
    jobType: editingJob?.jobType || JOB_TYPES[0],
    modality: editingJob?.modality || JOB_MODALITIES[0],
    salaryCOP: editingJob?.salaryCOP || '',
    description: editingJob?.description || '',
    requirementsText: (editingJob?.requirements || []).join('\n'),
    closingDate: editingJob?.closingDate || '2025-05-30',
    status: editingJob?.status || 'abierta',
    contactWhatsapp: editingJob?.contactWhatsapp || '',
    contactEmail: editingJob?.contactEmail || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reqs = form.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      category: form.category,
      sector: form.sector,
      jobType: form.jobType,
      modality: form.modality,
      salaryCOP: form.salaryCOP.trim() || 'A convenir',
      description: form.description.trim(),
      requirements: reqs.length > 0 ? reqs : ['Vivir en La Reliquia o Villavicencio'],
      publishedAt: editingJob?.publishedAt || new Date().toISOString().slice(0, 10),
      closingDate: form.closingDate,
      status: form.status,
      contactWhatsapp: form.contactWhatsapp.trim(),
      contactEmail: form.contactEmail.trim(),
      authorUid: editingJob?.authorUid || effectiveUid
    };

    try {
      if (editingJob) {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'job_postings', editingJob.id),
          payload
        );
        showToast('Oferta laboral actualizada correctamente.');
      } else {
        await addDoc(
          collection(db, 'artifacts', appId, 'public', 'data', 'job_postings'),
          payload
        );
        showToast('¡Nueva vacante publicada en la Bolsa de Empleo de La Reliquia!');
      }
      onClose();
    } catch (err) {
      console.error('Error guardando vacante:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {editingJob ? 'Editar Vacante de Empleo' : 'Publicar Vacante en La Reliquia'}
            </h3>
            <p className="text-xs text-slate-500">
              Conecta tu negocio, taller u obra con trabajadores del barrio.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nombre del Cargo *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Oficial de Construcción / Auxiliar de Panadería"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Empresa, Negocio o Contratista *
              </label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Ej. Panadería El Trigal / Maestro Carlos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Categoría *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ubicación / Sector *
              </label>
              <select
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tipo de Trabajo *
              </label>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Modalidad *
              </label>
              <select
                value={form.modality}
                onChange={(e) => setForm({ ...form, modality: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {JOB_MODALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Remuneración en Pesos (COP $)
              </label>
              <input
                type="text"
                value={form.salaryCOP}
                onChange={(e) => setForm({ ...form, salaryCOP: e.target.value })}
                placeholder="Ej. $1.450.000 mensual o $75.000 día"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Fecha de Cierre *
              </label>
              <input
                type="date"
                required
                value={form.closingDate}
                onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Descripción de Funciones y Horario *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Requisitos (uno por línea) *
            </label>
            <textarea
              rows={3}
              required
              value={form.requirementsText}
              onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
              placeholder={`Vivir en La Reliquia\nExperiencia mínima de 6 meses`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                WhatsApp para Postulaciones
              </label>
              <input
                type="tel"
                value={form.contactWhatsapp}
                onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                placeholder="3110000000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Correo de Contacto
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="empleo@negocio.co"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Estado de la Oferta
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm"
            >
              {editingJob ? 'Guardar Cambios' : 'Publicar Vacante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de Reporte Comunitario
function ReportModal({ reportData, effectiveUid, db, appId, showToast, onClose }) {
  const [reason, setReason] = useState('Información falsa o engañosa');
  const [details, setDetails] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reports'), {
      targetType: reportData.targetType,
      targetId: reportData.targetId,
      targetTitle: reportData.targetTitle,
      reason,
      details,
      reporterUid: effectiveUid,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    });
    showToast('Reporte enviado al equipo de moderación de La Reliquia Trabaja.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
      >
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-600" />
          Reportar Publicación a Moderación
        </h3>
        <p className="text-xs font-bold text-slate-600">{reportData.targetTitle}</p>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Motivo del reporte
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            <option>Información falsa o engañosa</option>
            <option>Cobro indebido por postulación</option>
            <option>Fotografía inapropiada o que no corresponde</option>
            <option>Suplantación de identidad</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detalles adicionales *
          </label>
          <textarea
            rows={3}
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe qué ocurre para que el administrador lo revise..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs"
          >
            Enviar Reporte
          </button>
        </div>
      </form>
    </div>
  );
}

// Modal de Cuenta, Registro, Verificación de Correo y Recuperación de Contraseña
function AuthAccountModal({
  mode,
  setMode,
  sessionAccount,
  setSessionAccount,
  setIsLoggedIn,
  setActiveTab,
  showToast,
  onClose
}) {
  const [emailInput, setEmailInput] = useState(sessionAccount.email || '');
  const [nameInput, setNameInput] = useState(sessionAccount.displayName || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [acceptHabeasData, setAcceptHabeasData] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'recover') {
      showToast(`Enlace de recuperación enviado a ${emailInput}`);
      onClose();
      return;
    }

    if (mode === 'register' && !acceptHabeasData) {
      showToast('Debes aceptar el tratamiento de datos personales para registrarte.', 'error');
      return;
    }

    setSessionAccount({
      email: emailInput,
      emailVerified: true,
      displayName: nameInput || 'Vecino de La Reliquia'
    });
    
    setIsLoggedIn(true);
    showToast(
      mode === 'register'
        ? `Cuenta creada. ¡Bienvenido/a, ${nameInput || 'vecino/a'}!`
        : `Sesión iniciada correctamente.`
    );
    setActiveTab('mi_panel');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-black text-slate-900">
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Registro en La Reliquia'}
            {mode === 'recover' && 'Recuperar Contraseña'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 text-xs bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {mode !== 'recover' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {mode === 'register' && (
            <label className="flex items-start gap-3 bg-blue-50 p-3.5 rounded-xl border border-blue-200 cursor-pointer mt-2">
              <input
                type="checkbox"
                required
                checked={acceptHabeasData}
                onChange={(e) => setAcceptHabeasData(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 shrink-0"
              />
              <span className="text-slate-800 text-[11px] leading-relaxed">
                <strong>Autorización (Ley 1581 de 2012):</strong> Acepto el tratamiento de mis datos personales para crear mi cuenta y perfil en la plataforma comunitaria La Reliquia Trabaja.
              </span>
            </label>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm transition-all mt-4"
          >
            {mode === 'login' && 'Entrar a mi Cuenta'}
            {mode === 'register' && 'Completar Registro'}
            {mode === 'recover' && 'Recuperar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}