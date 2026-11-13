import type { ComponentType } from 'react';
import {
  Hammer,
  Scissors,
  Wrench,
  Utensils,
  Laptop,
  Sparkles,
  Zap,
  Home,
  ShoppingBag
} from 'lucide-react';
import type { CategoryInfo } from './types';

// ============================================================================
// CATÁLOGOS OFICIALES DEL BARRIO LA RELIQUIA, VILLAVICENCIO
// (los ids de CATEGORIES deben coincidir con la tabla public.categories de Supabase)
// ============================================================================
export interface CategoryDef extends CategoryInfo {
  icon: ComponentType<{ className?: string }>;
}

export const CATEGORIES: CategoryDef[] = [
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

export const SECTORS: string[] = [
  'Sector 1 - La Reliquia',
  'Sector 2 - La Reliquia',
  'Sector 3 - La Reliquia',
  'Sector 4 - La Reliquia',
  'Zona Comercial Principal',
  'Sector Polideportivo / Colegio',
  'Alrededores (Trece de Mayo / San Antonio)'
];

export const AVAILABILITY_OPTIONS: string[] = [
  'Disponible ahora',
  'Tiempo completo',
  'Medio tiempo / Por horas',
  'Por contrato o proyecto',
  'Fines de semana'
];

export const JOB_TYPES: string[] = [
  'Tiempo completo',
  'Medio tiempo',
  'Por obra o labor',
  'Por días / Turnos',
  'Fines de semana'
];

export const JOB_MODALITIES: string[] = [
  'Presencial en La Reliquia',
  'Presencial en Villavicencio',
  'Ruta / Domicilios',
  'Trabajo desde taller en casa'
];
