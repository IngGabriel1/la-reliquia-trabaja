// ============================================================================
// MAPEO camelCase (React)  <->  snake_case (PostgreSQL)
// Es el ÚNICO lugar donde se traducen nombres de propiedades. Si cambia una
// columna en supabase/schema.sql, solo se ajusta aquí.
// ============================================================================
import type {
  AdminLog,
  JobApplication,
  JobPosting,
  PortfolioItem,
  Profile,
  Report
} from './types';

// ---------------------------- Filas de la base de datos ---------------------
export interface ProfileRow {
  id: string;
  owner_id: string | null;
  full_name: string;
  profession: string;
  category_id: string;
  sector: string;
  experience_years: number;
  skills: string[] | null;
  bio: string;
  availability: string;
  whatsapp_phone: string | null;
  email: string | null;
  consent_habeas_data: boolean;
  consent_habeas_data_at: string | null;
  consent_public_whatsapp: boolean;
  status: Profile['status'];
  is_verified: boolean;
  rating: number | string | null;
  completed_jobs: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioRow {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  image_url: string;
  storage_path: string | null;
  file_format: string;
  file_size_kb: number;
  status: PortfolioItem['status'];
  created_at: string;
}

export interface JobRow {
  id: string;
  author_id: string | null;
  title: string;
  company_name: string;
  category_id: string;
  sector: string;
  job_type: string;
  modality: string;
  salary_cop: string | null;
  description: string;
  requirements: string[] | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  status: JobPosting['status'];
  published_at: string;
  closing_date: string;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  job_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_phone: string;
  cover_message: string;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string | null;
  target_type: Report['targetType'];
  target_id: string;
  target_title: string;
  reason: string;
  details: string;
  status: Report['status'];
  created_at: string;
}

export interface AdminLogRow {
  id: string;
  admin_id: string | null;
  admin_name: string;
  action: string;
  target_type: string;
  target_name: string;
  details: string | null;
  created_at: string;
}

// ---------------------------- Base de datos -> React ------------------------
export function profileFromRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.full_name,
    profession: row.profession,
    category: row.category_id,
    sector: row.sector,
    experienceYears: row.experience_years ?? 0,
    skills: row.skills ?? [],
    bio: row.bio,
    availability: row.availability,
    whatsapp: row.whatsapp_phone,
    email: row.email,
    consentHabeasData: row.consent_habeas_data,
    consentHabeasDataAt: row.consent_habeas_data_at,
    consentPublicWhatsapp: row.consent_public_whatsapp,
    status: row.status,
    verified: row.is_verified,
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    completedJobs: row.completed_jobs ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function portfolioFromRow(row: PortfolioRow, workerName = ''): PortfolioItem {
  return {
    id: row.id,
    profileId: row.profile_id,
    workerName,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    fileFormat: row.file_format,
    fileSizeKB: row.file_size_kb,
    status: row.status,
    createdAt: row.created_at
  };
}

export function jobFromRow(row: JobRow): JobPosting {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    company: row.company_name,
    category: row.category_id,
    sector: row.sector,
    jobType: row.job_type,
    modality: row.modality,
    salaryCOP: row.salary_cop ?? '',
    description: row.description,
    requirements: row.requirements ?? [],
    contactWhatsapp: row.contact_whatsapp ?? '',
    contactEmail: row.contact_email ?? '',
    status: row.status,
    publishedAt: row.published_at,
    closingDate: row.closing_date,
    createdAt: row.created_at
  };
}

export function applicationFromRow(row: ApplicationRow): JobApplication {
  return {
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    applicantName: row.applicant_name,
    applicantPhone: row.applicant_phone,
    applicantMessage: row.cover_message,
    createdAt: row.created_at
  };
}

export function reportFromRow(row: ReportRow): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type,
    targetId: row.target_id,
    targetTitle: row.target_title,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at
  };
}

export function adminLogFromRow(row: AdminLogRow): AdminLog {
  return {
    id: row.id,
    adminId: row.admin_id,
    adminName: row.admin_name,
    action: row.action,
    targetType: row.target_type,
    targetName: row.target_name,
    details: row.details ?? '',
    createdAt: row.created_at
  };
}

// ---------------------------- React -> Base de datos ------------------------
/** Los campos controlados por el servidor (status, is_verified, rating...) los fija el trigger de RLS. */
export function profileToRow(p: Profile): ProfileRow {
  return {
    id: p.id,
    owner_id: p.ownerId,
    full_name: p.name,
    profession: p.profession,
    category_id: p.category,
    sector: p.sector,
    experience_years: p.experienceYears,
    skills: p.skills,
    bio: p.bio,
    availability: p.availability,
    whatsapp_phone: p.whatsapp || null,
    email: p.email || null,
    consent_habeas_data: p.consentHabeasData,
    consent_habeas_data_at: p.consentHabeasDataAt,
    consent_public_whatsapp: p.consentPublicWhatsapp,
    status: p.status,
    is_verified: p.verified,
    rating: p.rating,
    completed_jobs: p.completedJobs,
    created_at: p.createdAt,
    updated_at: p.updatedAt
  };
}

export function portfolioToRow(i: PortfolioItem): PortfolioRow {
  return {
    id: i.id,
    profile_id: i.profileId,
    title: i.title,
    description: i.description,
    image_url: i.imageUrl,
    storage_path: i.storagePath,
    file_format: i.fileFormat,
    file_size_kb: i.fileSizeKB,
    status: i.status,
    created_at: i.createdAt
  };
}

export function jobToRow(j: JobPosting): JobRow {
  return {
    id: j.id,
    author_id: j.authorId,
    title: j.title,
    company_name: j.company,
    category_id: j.category,
    sector: j.sector,
    job_type: j.jobType,
    modality: j.modality,
    salary_cop: j.salaryCOP || null,
    description: j.description,
    requirements: j.requirements,
    contact_whatsapp: j.contactWhatsapp || null,
    contact_email: j.contactEmail || null,
    status: j.status,
    published_at: j.publishedAt,
    closing_date: j.closingDate,
    created_at: j.createdAt
  };
}
