// ============================================================================
// MODELO DE DATOS DE LA APLICACIÓN (camelCase en React)
// La traducción a las columnas de PostgreSQL (snake_case) vive en lib/mappers.ts
// ============================================================================

export type ProfileStatus = 'pending' | 'approved' | 'suspended';
export type PortfolioStatus = 'approved' | 'flagged';
export type JobStatus = 'abierta' | 'cerrada';
export type ReportStatus = 'pendiente' | 'resuelto' | 'descartado';
export type ReportTargetType = 'profile' | 'job' | 'portfolio';
export type ToastType = 'success' | 'error' | 'info';

export interface Profile {
  id: string;
  /** UID real del usuario autenticado (auth.users.id) dueño del perfil. null = perfil de demostración. */
  ownerId: string | null;
  name: string;
  profession: string;
  category: string;
  sector: string;
  experienceYears: number;
  skills: string[];
  bio: string;
  availability: string;
  /** Solo 10 dígitos (celular colombiano). Llega enmascarado (null) si el titular no autorizó publicarlo. */
  whatsapp: string | null;
  /** Correo privado: solo lo ven el dueño y la Junta. */
  email: string | null;
  consentHabeasData: boolean;
  consentHabeasDataAt: string | null;
  consentPublicWhatsapp: boolean;
  status: ProfileStatus;
  verified: boolean;
  /** Promedio de calificación. null = aún sin calificaciones (no se muestra estrella). */
  rating: number | null;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  profileId: string;
  /** Dato derivado del perfil (no se guarda en la tabla). */
  workerName: string;
  title: string;
  description: string;
  imageUrl: string;
  /** Ruta dentro del bucket de Storage. null para imágenes de demostración. */
  storagePath: string | null;
  fileFormat: string;
  fileSizeKB: number;
  status: PortfolioStatus;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  authorId: string | null;
  title: string;
  company: string;
  category: string;
  sector: string;
  jobType: string;
  modality: string;
  salaryCOP: string;
  description: string;
  requirements: string[];
  contactWhatsapp: string;
  contactEmail: string;
  status: JobStatus;
  publishedAt: string;
  closingDate: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantPhone: string;
  applicantMessage: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string | null;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string | null;
  adminName: string;
  action: string;
  targetType: string;
  targetName: string;
  details: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

export interface ToastState {
  message: string;
  type: ToastType;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  color: string;
}

/** Datos para crear/editar un perfil (sin campos controlados por el servidor). */
export type ProfileInput = Pick<
  Profile,
  | 'name'
  | 'profession'
  | 'category'
  | 'sector'
  | 'experienceYears'
  | 'skills'
  | 'bio'
  | 'availability'
  | 'whatsapp'
  | 'email'
  | 'consentHabeasData'
  | 'consentPublicWhatsapp'
>;

export type JobInput = Pick<
  JobPosting,
  | 'title'
  | 'company'
  | 'category'
  | 'sector'
  | 'jobType'
  | 'modality'
  | 'salaryCOP'
  | 'description'
  | 'requirements'
  | 'contactWhatsapp'
  | 'contactEmail'
  | 'status'
  | 'closingDate'
>;

export interface ApplicationInput {
  jobId: string;
  applicantName: string;
  applicantPhone: string;
  applicantMessage: string;
}

export interface ReportInput {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
}

export interface PortfolioInput {
  title: string;
  description: string;
}

export interface ReportTarget {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
}

export type TabId = 'inicio' | 'directorio' | 'empleos' | 'mi_panel' | 'admin' | 'arquitectura';
