// ============================================================================
// CAPA DE DATOS (Supabase): autenticación, lectura y escritura.
// Reglas de oro:
//   * Ninguna función "se traga" errores: todas lanzan una excepción que la
//     interfaz convierte en un aviso rojo con describeError().
//   * Nada se muestra como guardado hasta que Supabase confirma la operación.
// ============================================================================
import type { User } from '@supabase/supabase-js';
import { INITIAL_JOBS, INITIAL_PORTFOLIO, INITIAL_PROFILES, DEMO_JOB_IDS, DEMO_PROFILE_IDS } from './seed';
import {
  adminLogFromRow,
  applicationFromRow,
  jobFromRow,
  jobToRow,
  portfolioFromRow,
  portfolioToRow,
  profileFromRow,
  profileToRow,
  reportFromRow,
  type AdminLogRow,
  type ApplicationRow,
  type JobRow,
  type PortfolioRow,
  type ProfileRow,
  type ReportRow
} from './mappers';
import { PORTFOLIO_BUCKET, requireSupabase } from './supabase';
import type {
  AdminLog,
  ApplicationInput,
  JobApplication,
  JobInput,
  JobPosting,
  JobStatus,
  PortfolioInput,
  PortfolioItem,
  PortfolioStatus,
  Profile,
  ProfileInput,
  ProfileStatus,
  Report,
  ReportInput,
  ReportStatus,
  SessionUser
} from './types';
import { newId, todayISO } from './utils';

// ----------------------------------------------------------------------------
// Errores legibles para personas (no técnicas)
// ----------------------------------------------------------------------------
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

interface ErrorLike {
  code?: string;
  message?: string;
  status?: number;
  name?: string;
}

export function describeError(err: unknown, fallback = 'Ocurrió un error inesperado. Inténtalo de nuevo.'): string {
  if (err instanceof AppError) return err.message;
  const e = (err ?? {}) as ErrorLike;
  const raw = (e.message ?? '').toString();
  const msg = raw.toLowerCase();

  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
    return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  }

  // Autenticación
  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('email not confirmed')) {
    return 'Aún no has confirmado tu correo. Revisa tu bandeja de entrada (y la carpeta de spam).';
  }
  if (msg.includes('user already registered')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.';
  }
  if (msg.includes('password should be at least') || e.code === 'weak_password') {
    return 'La contraseña es muy débil. Usa mínimo 8 caracteres combinando letras y números.';
  }
  if (msg.includes('should be different from the old password') || e.code === 'same_password') {
    return 'La nueva contraseña debe ser diferente a la anterior.';
  }
  if (msg.includes('rate limit') || e.code === 'over_email_send_rate_limit' || e.status === 429) {
    return 'Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.';
  }
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled')) {
    return 'El registro de nuevas cuentas está desactivado en este momento.';
  }
  if (msg.includes('auth session missing')) {
    return 'Tu sesión expiró. Inicia sesión nuevamente.';
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) {
    return 'El correo electrónico no es válido.';
  }

  // Almacenamiento de fotos
  if (msg.includes('bucket not found')) {
    return 'El almacenamiento de fotos no está configurado. La Junta debe ejecutar supabase/schema.sql.';
  }
  if (msg.includes('maximum allowed size') || msg.includes('payload too large')) {
    return 'La fotografía supera el tamaño permitido (2 MB).';
  }
  if (msg.includes('mime type')) {
    return 'Formato de imagen no permitido. Usa JPG, PNG o WEBP.';
  }

  // Base de datos (PostgREST / PostgreSQL)
  switch (e.code) {
    case 'PGRST205':
    case '42P01':
      return 'La base de datos aún no está preparada. La Junta debe ejecutar el script supabase/schema.sql en Supabase.';
    case '42501':
      return 'No tienes permiso para realizar esta acción.';
    case '23505':
      return 'Ese registro ya existe.';
    case '23514':
      return 'Algún dato no cumple el formato permitido (revisa longitudes, fechas y el celular de 10 dígitos que empieza por 3).';
    case '23503':
      return 'El registro relacionado ya no existe. Recarga la página e inténtalo de nuevo.';
    case '22P02':
      return 'Identificador no válido. Recarga la página e inténtalo de nuevo.';
    case 'PGRST116':
      return 'No se encontró el registro o no tienes permiso para modificarlo.';
    default:
      break;
  }
  if (msg.includes('row-level security')) return 'No tienes permiso para realizar esta acción.';
  if (msg.includes('jwt expired')) return 'Tu sesión expiró. Inicia sesión nuevamente.';

  return raw ? `${fallback} (${raw})` : fallback;
}

function assertAffected(rows: unknown[] | null, message: string): void {
  if (!rows || rows.length === 0) throw new AppError(message);
}

// ----------------------------------------------------------------------------
// Autenticación
// ----------------------------------------------------------------------------
export function toSessionUser(user: User): SessionUser {
  const meta = (user.user_metadata ?? {}) as { full_name?: string };
  const email = user.email ?? '';
  return {
    id: user.id,
    email,
    displayName: (meta.full_name ?? '').trim() || email.split('@')[0] || 'Vecino de La Reliquia'
  };
}

export async function signUpAccount(
  email: string,
  password: string,
  fullName: string
): Promise<{ needsEmailConfirmation: boolean }> {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName.trim(),
        consent_habeas_data: true,
        consent_habeas_data_at: new Date().toISOString()
      }
    }
  });
  if (error) throw error;
  // Con confirmación de correo activa, Supabase no da error si el correo ya existe: devuelve identities vacío.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new AppError('Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.');
  }
  return { needsEmailConfirmation: !data.session };
}

export async function signInAccount(email: string, password: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (error) throw error;
}

export async function signOutAccount(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin
  });
  if (error) throw error;
}

export async function setNewPassword(password: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw error;
}

/** El rol de administrador vive en public.user_roles y lo valida el servidor (RLS). */
export async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await requireSupabase()
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[La Reliquia Trabaja] No se pudo verificar el rol de administrador:', error);
    return false;
  }
  return data?.role === 'admin';
}

// ----------------------------------------------------------------------------
// Lectura
// ----------------------------------------------------------------------------
export interface LoadContext {
  userId: string | null;
  isAdmin: boolean;
}

export interface LoadedData {
  profiles: Profile[];
  portfolio: PortfolioItem[];
  jobs: JobPosting[];
  applications: JobApplication[];
  reports: Report[];
  adminLogs: AdminLog[];
}

async function selectRows<T>(table: string, orderBy = 'created_at', filter?: { column: string; value: string }): Promise<T[]> {
  let query = requireSupabase().from(table).select('*');
  if (filter) query = query.eq(filter.column, filter.value);
  const { data, error } = await query.order(orderBy, { ascending: false }).limit(1000);
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function loadAllData(ctx: LoadContext): Promise<LoadedData> {
  const profileRowsPromise: Promise<ProfileRow[]> = ctx.isAdmin
    ? selectRows<ProfileRow>('profiles')
    : selectRows<ProfileRow>('public_profiles');
  const ownProfileRowsPromise: Promise<ProfileRow[]> =
    !ctx.isAdmin && ctx.userId
      ? selectRows<ProfileRow>('profiles', 'created_at', { column: 'owner_id', value: ctx.userId })
      : Promise.resolve([]);

  const [profileRows, ownRows, portfolioRows, jobRows, applicationRows, reportRows, logRows] = await Promise.all([
    profileRowsPromise,
    ownProfileRowsPromise,
    selectRows<PortfolioRow>('portfolio_items'),
    selectRows<JobRow>('job_postings', 'published_at'),
    ctx.userId ? selectRows<ApplicationRow>('job_applications') : Promise.resolve([] as ApplicationRow[]),
    ctx.isAdmin ? selectRows<ReportRow>('reports') : Promise.resolve([] as ReportRow[]),
    ctx.isAdmin ? selectRows<AdminLogRow>('admin_audit_logs') : Promise.resolve([] as AdminLogRow[])
  ]);

  // Los perfiles propios (con todos sus datos) reemplazan a su versión pública.
  const byId = new Map<string, Profile>();
  profileRows.forEach((row) => byId.set(row.id, profileFromRow(row)));
  ownRows.forEach((row) => byId.set(row.id, profileFromRow(row)));
  const profiles = Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const nameById = new Map(profiles.map((p) => [p.id, p.name] as const));
  const portfolio = portfolioRows.map((row) =>
    portfolioFromRow(row, nameById.get(row.profile_id) ?? 'Vecino de La Reliquia')
  );

  return {
    profiles,
    portfolio,
    jobs: jobRows.map(jobFromRow),
    applications: applicationRows.map(applicationFromRow),
    reports: reportRows.map(reportFromRow),
    adminLogs: logRows.map(adminLogFromRow)
  };
}

// ----------------------------------------------------------------------------
// Perfiles
// ----------------------------------------------------------------------------
function profileInputToColumns(input: ProfileInput) {
  return {
    full_name: input.name.trim(),
    profession: input.profession.trim(),
    category_id: input.category,
    sector: input.sector,
    experience_years: input.experienceYears,
    skills: input.skills,
    bio: input.bio.trim(),
    availability: input.availability,
    whatsapp_phone: input.whatsapp || null,
    email: input.email?.trim() || null,
    consent_habeas_data: input.consentHabeasData,
    consent_public_whatsapp: input.consentPublicWhatsapp
  };
}

/** Crea SIEMPRE un perfil nuevo e independiente (id único generado aquí). */
export async function createProfile(ownerId: string, input: ProfileInput): Promise<Profile> {
  const row = {
    id: newId(),
    owner_id: ownerId,
    ...profileInputToColumns(input),
    consent_habeas_data_at: new Date().toISOString()
  };
  const { data, error } = await requireSupabase().from('profiles').insert(row).select().single();
  if (error) throw error;
  return profileFromRow(data as ProfileRow);
}

export async function updateProfile(id: string, input: ProfileInput): Promise<Profile> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .update(profileInputToColumns(input))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return profileFromRow(data as ProfileRow);
}

async function removeStorageFiles(paths: Array<string | null>): Promise<void> {
  const clean = paths.filter((p): p is string => Boolean(p));
  if (clean.length === 0) return;
  const { error } = await requireSupabase().storage.from(PORTFOLIO_BUCKET).remove(clean);
  // Si falla la limpieza de archivos no se bloquea al usuario: el registro ya fue eliminado.
  if (error) console.warn('[La Reliquia Trabaja] No se pudieron borrar archivos del almacenamiento:', error);
}

export async function deleteProfile(profile: Profile, items: PortfolioItem[]): Promise<void> {
  const { data, error } = await requireSupabase().from('profiles').delete().eq('id', profile.id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo eliminar el perfil (no existe o no tienes permiso).');
  await removeStorageFiles(items.filter((i) => i.profileId === profile.id).map((i) => i.storagePath));
}

export async function setProfileStatus(id: string, status: ProfileStatus): Promise<void> {
  const { data, error } = await requireSupabase().from('profiles').update({ status }).eq('id', id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo actualizar el perfil (verifica que tu cuenta tenga rol de administrador).');
}

export async function setProfileVerified(id: string, verified: boolean): Promise<void> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .update({ is_verified: verified })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo actualizar la verificación (verifica que tu cuenta tenga rol de administrador).');
}

// ----------------------------------------------------------------------------
// Portafolio fotográfico (Supabase Storage + tabla portfolio_items)
// ----------------------------------------------------------------------------
export interface ProcessedImage {
  blob: Blob;
  sizeKB: number;
  format: string;
}

async function uploadPortfolioImage(
  ownerId: string,
  profileId: string,
  image: ProcessedImage
): Promise<{ path: string; url: string }> {
  const sb = requireSupabase();
  const path = `${ownerId}/${profileId}/${newId()}.jpg`;
  const { error } = await sb.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, image.blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
  if (error) throw error;
  const { data } = sb.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function createPortfolioItem(
  ownerId: string,
  profile: Profile,
  input: PortfolioInput,
  image: ProcessedImage
): Promise<PortfolioItem> {
  const uploaded = await uploadPortfolioImage(ownerId, profile.id, image);
  const row = {
    id: newId(),
    profile_id: profile.id,
    title: input.title.trim(),
    description: input.description.trim(),
    image_url: uploaded.url,
    storage_path: uploaded.path,
    file_format: image.format,
    file_size_kb: image.sizeKB
  };
  const { data, error } = await requireSupabase().from('portfolio_items').insert(row).select().single();
  if (error) {
    await removeStorageFiles([uploaded.path]);
    throw error;
  }
  return portfolioFromRow(data as PortfolioRow, profile.name);
}

export async function updatePortfolioItem(
  ownerId: string,
  item: PortfolioItem,
  input: PortfolioInput,
  image: ProcessedImage | null
): Promise<PortfolioItem> {
  const changes: Record<string, unknown> = {
    title: input.title.trim(),
    description: input.description.trim()
  };
  let uploadedPath: string | null = null;
  if (image) {
    const uploaded = await uploadPortfolioImage(ownerId, item.profileId, image);
    uploadedPath = uploaded.path;
    changes.image_url = uploaded.url;
    changes.storage_path = uploaded.path;
    changes.file_format = image.format;
    changes.file_size_kb = image.sizeKB;
  }
  const { data, error } = await requireSupabase()
    .from('portfolio_items')
    .update(changes)
    .eq('id', item.id)
    .select()
    .single();
  if (error) {
    await removeStorageFiles([uploadedPath]);
    throw error;
  }
  if (image) await removeStorageFiles([item.storagePath]);
  return portfolioFromRow(data as PortfolioRow, item.workerName);
}

export async function deletePortfolioItem(item: PortfolioItem): Promise<void> {
  const { data, error } = await requireSupabase().from('portfolio_items').delete().eq('id', item.id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo eliminar la fotografía (no existe o no tienes permiso).');
  await removeStorageFiles([item.storagePath]);
}

export async function setPortfolioStatus(id: string, status: PortfolioStatus): Promise<void> {
  const { data, error } = await requireSupabase().from('portfolio_items').update({ status }).eq('id', id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo moderar la fotografía (verifica que tu cuenta tenga rol de administrador).');
}

// ----------------------------------------------------------------------------
// Vacantes
// ----------------------------------------------------------------------------
function jobInputToColumns(input: JobInput) {
  return {
    title: input.title.trim(),
    company_name: input.company.trim(),
    category_id: input.category,
    sector: input.sector,
    job_type: input.jobType,
    modality: input.modality,
    salary_cop: input.salaryCOP.trim() || null,
    description: input.description.trim(),
    requirements: input.requirements,
    contact_whatsapp: input.contactWhatsapp || null,
    contact_email: input.contactEmail.trim() || null,
    status: input.status,
    closing_date: input.closingDate
  };
}

export async function createJob(authorId: string, input: JobInput): Promise<JobPosting> {
  const row = { id: newId(), author_id: authorId, published_at: todayISO(), ...jobInputToColumns(input) };
  const { data, error } = await requireSupabase().from('job_postings').insert(row).select().single();
  if (error) throw error;
  return jobFromRow(data as JobRow);
}

export async function updateJob(id: string, input: JobInput): Promise<JobPosting> {
  const { data, error } = await requireSupabase()
    .from('job_postings')
    .update(jobInputToColumns(input))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return jobFromRow(data as JobRow);
}

export async function setJobStatus(id: string, status: JobStatus): Promise<void> {
  const { data, error } = await requireSupabase().from('job_postings').update({ status }).eq('id', id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo cambiar el estado de la vacante (no existe o no tienes permiso).');
}

export async function deleteJob(id: string): Promise<void> {
  const { data, error } = await requireSupabase().from('job_postings').delete().eq('id', id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo eliminar la vacante (no existe o no tienes permiso).');
}

// ----------------------------------------------------------------------------
// Postulaciones
// ----------------------------------------------------------------------------
export async function createApplication(applicantId: string, input: ApplicationInput): Promise<JobApplication> {
  const row = {
    id: newId(),
    job_id: input.jobId,
    applicant_id: applicantId,
    applicant_name: input.applicantName.trim(),
    applicant_phone: input.applicantPhone,
    cover_message: input.applicantMessage.trim()
  };
  const { data, error } = await requireSupabase().from('job_applications').insert(row).select().single();
  if (error) {
    if (error.code === '23505') throw new AppError('Ya te postulaste a esta vacante anteriormente.');
    throw error;
  }
  return applicationFromRow(data as ApplicationRow);
}

// ----------------------------------------------------------------------------
// Reportes y auditoría
// ----------------------------------------------------------------------------
/** Cualquier visitante puede reportar. Se inserta sin RETURNING porque el público no puede leer reportes. */
export async function createReport(reporterId: string | null, input: ReportInput): Promise<Report> {
  const report: Report = {
    id: newId(),
    reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    targetTitle: input.targetTitle,
    reason: input.reason,
    details: input.details.trim(),
    status: 'pendiente',
    createdAt: new Date().toISOString()
  };
  const { error } = await requireSupabase().from('reports').insert({
    id: report.id,
    reporter_id: reporterId,
    target_type: report.targetType,
    target_id: report.targetId,
    target_title: report.targetTitle,
    reason: report.reason,
    details: report.details
  });
  if (error) throw error;
  return report;
}

export async function setReportStatus(id: string, status: ReportStatus): Promise<void> {
  const { data, error } = await requireSupabase().from('reports').update({ status }).eq('id', id).select('id');
  if (error) throw error;
  assertAffected(data, 'No se pudo actualizar el reporte (verifica que tu cuenta tenga rol de administrador).');
}

export async function insertAdminLog(
  admin: SessionUser,
  action: string,
  targetType: string,
  targetName: string,
  details: string
): Promise<AdminLog> {
  const { data, error } = await requireSupabase()
    .from('admin_audit_logs')
    .insert({
      admin_id: admin.id,
      admin_name: admin.displayName,
      action,
      target_type: targetType,
      target_name: targetName,
      details
    })
    .select()
    .single();
  if (error) throw error;
  return adminLogFromRow(data as AdminLogRow);
}

// ----------------------------------------------------------------------------
// Datos de demostración (solo administradores)
// ----------------------------------------------------------------------------
export async function loadDemoData(): Promise<void> {
  const sb = requireSupabase();
  const profiles = await sb.from('profiles').upsert(INITIAL_PROFILES.map(profileToRow), { onConflict: 'id' });
  if (profiles.error) throw profiles.error;
  const portfolio = await sb.from('portfolio_items').upsert(INITIAL_PORTFOLIO.map(portfolioToRow), { onConflict: 'id' });
  if (portfolio.error) throw portfolio.error;
  const jobs = await sb.from('job_postings').upsert(INITIAL_JOBS.map(jobToRow), { onConflict: 'id' });
  if (jobs.error) throw jobs.error;
}

export async function removeDemoData(): Promise<void> {
  const sb = requireSupabase();
  const jobs = await sb.from('job_postings').delete().in('id', DEMO_JOB_IDS);
  if (jobs.error) throw jobs.error;
  // Las fotos de demostración se eliminan en cascada junto con sus perfiles.
  const profiles = await sb.from('profiles').delete().in('id', DEMO_PROFILE_IDS);
  if (profiles.error) throw profiles.error;
}
