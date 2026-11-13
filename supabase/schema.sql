-- ============================================================================
-- LA RELIQUIA TRABAJA — Barrio La Reliquia, Villavicencio (Meta, Colombia)
-- Script SQL DEFINITIVO para Supabase (PostgreSQL 15+, Auth, RLS y Storage)
--
-- Cómo usarlo:
--   1) Supabase > SQL Editor > New query > pegar TODO este archivo > Run.
--   2) Es idempotente: se puede volver a ejecutar sin perder datos. Si ya tenías
--      tablas de una versión anterior, se respaldan como *_legacy_backup (sección 0).
--   3) Al final hay un bloque para nombrar a los administradores de la Junta.
--
-- Alineación con el código React (camelCase <-> snake_case) en lib/mappers.ts:
--   profiles          full_name, category_id, experience_years, whatsapp_phone,
--                     consent_habeas_data, consent_public_whatsapp, is_verified, owner_id
--   portfolio_items   profile_id, image_url, storage_path, file_format, file_size_kb
--   job_postings      author_id, company_name, category_id, job_type, salary_cop,
--                     contact_whatsapp, contact_email, published_at, closing_date
--   job_applications  job_id, applicant_id, applicant_name, applicant_phone, cover_message
--   reports           reporter_id, target_type, target_id, target_title
--
-- SEGURIDAD (Ley 1581 de 2012 / Habeas Data):
--   * La tabla "profiles" (con celular y correo) SOLO la leen su dueño y la Junta.
--   * El público lee la vista "public_profiles": solo perfiles APROBADOS y con el
--     celular enmascarado si el titular no autorizó publicarlo. El correo nunca es público.
--   * Los permisos de administrador NO se pueden auto-asignar: viven en "user_roles"
--     y solo se modifican desde el SQL Editor (rol postgres / service_role).
-- ============================================================================

-- ============================================================================
-- 0. MIGRACIÓN SEGURA DESDE VERSIONES ANTERIORES (no borra nada)
--    La primera vez que se ejecuta este script, si ya existían tablas con estos
--    nombres (esquema antiguo con columnas camelCase como "uid" o "profileId"),
--    se RENOMBRAN a <tabla>_legacy_backup y se BLOQUEAN (RLS sin políticas) para
--    que sus datos personales dejen de ser públicos. Tus datos antiguos quedan
--    intactos en esas tablas por si necesitas recuperarlos.
-- ============================================================================
create table if not exists public.app_schema_version (
  version    integer primary key,
  applied_at timestamptz not null default now()
);
alter table public.app_schema_version enable row level security;
revoke all on public.app_schema_version from anon, authenticated;

do $$
declare
  t text;
begin
  if not exists (select 1 from public.app_schema_version where version = 1) then
    drop view if exists public.public_profiles;
    foreach t in array array[
      'admin_audit_logs', 'reports', 'job_applications', 'job_postings',
      'portfolio_items', 'profiles', 'categories', 'user_roles'
    ] loop
      if to_regclass('public.' || t) is not null then
        execute format('alter table public.%I rename to %I', t, t || '_legacy_backup');
        execute format('alter table public.%I enable row level security', t || '_legacy_backup');
        execute format('revoke all on public.%I from anon, authenticated', t || '_legacy_backup');
      end if;
    end loop;
    insert into public.app_schema_version (version) values (1);
  end if;
end
$$;

-- ============================================================================
-- 1. ROLES ADMINISTRATIVOS DE LA JUNTA
-- ============================================================================
create table if not exists public.user_roles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'admin' check (role = 'admin'),
  assigned_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- 2. CATEGORÍAS DE OFICIOS (deben coincidir con CATEGORIES en lib/catalogs.ts)
-- ============================================================================
create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

insert into public.categories (id, name, description) values
  ('construccion',  'Construcción y Obra Blanca',       'Maestros de obra, enchape, estuco, pintura, drywall y remodelaciones.'),
  ('confeccion',    'Confección y Textil',              'Modistería, arreglos de ropa, dotaciones, ropa deportiva y bordados.'),
  ('mecanica',      'Mecánica de Motos y Bicis',        'Mantenimiento preventivo, electricidad de motos, despinchado y repuestos.'),
  ('gastronomia',   'Gastronomía y Panadería',          'Panadería artesanal, amasijos llaneros, almuerzos caseros y repostería.'),
  ('tecnologia',    'Tecnología y Sistemas',            'Mantenimiento de computadores, celulares, redes Wi-Fi y cámaras.'),
  ('belleza',       'Belleza y Barbería',               'Cortes modernos, peluquería, manicure, pedicure y maquillaje social.'),
  ('electricidad',  'Electricidad y Plomería',          'Instalaciones eléctricas residenciales, fugas de agua y tanques elevados.'),
  ('hogar',         'Servicios del Hogar y Cuidado',    'Aseo general, jardinería, guadaña, cuidado de niños y adulto mayor.'),
  ('comercio',      'Comercio, Ventas y Domicilios',    'Atención de locales, domicilios en moto, impulsadores y logística.')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- ============================================================================
-- 3. PERFILES PROFESIONALES (un usuario puede tener VARIOS perfiles)
-- ============================================================================
create table if not exists public.profiles (
  id                      uuid primary key default gen_random_uuid(),
  owner_id                uuid references auth.users(id) on delete cascade,
  full_name               text not null check (char_length(btrim(full_name)) between 3 and 120),
  profession              text not null check (char_length(btrim(profession)) between 2 and 120),
  category_id             text not null references public.categories(id),
  sector                  text not null,
  experience_years        integer not null default 0 check (experience_years between 0 and 70),
  skills                  text[] not null default '{}' check (cardinality(skills) <= 15),
  bio                     text not null check (char_length(btrim(bio)) between 10 and 1200),
  availability            text not null default 'Disponible ahora',
  whatsapp_phone          text check (whatsapp_phone is null or whatsapp_phone ~ '^3[0-9]{9}$'),
  email                   text check (email is null or char_length(email) <= 200),
  consent_habeas_data     boolean not null default false check (consent_habeas_data),
  consent_habeas_data_at  timestamptz,
  consent_public_whatsapp boolean not null default false,
  status                  text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  is_verified             boolean not null default false,
  rating                  numeric(2,1) check (rating is null or rating between 0 and 5),
  completed_jobs          integer not null default 0 check (completed_jobs >= 0),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists profiles_owner_idx  on public.profiles (owner_id);
create index if not exists profiles_status_idx on public.profiles (status);

-- Funciones auxiliares (SECURITY DEFINER para no depender del RLS de quien consulta)
create or replace function public.owns_profile(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = pid and owner_id = auth.uid());
$$;

create or replace function public.is_profile_approved(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = pid and status = 'approved');
$$;

-- Un usuario normal NUNCA puede aprobarse, verificarse ni cambiar de dueño.
create or replace function public.profiles_guard()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  -- auth.uid() es NULL cuando se ejecuta desde el SQL Editor / service_role: se permite todo.
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.owner_id := auth.uid();
      new.status := 'pending';
      new.is_verified := false;
      new.rating := null;
      new.completed_jobs := 0;
      new.consent_habeas_data_at := now();
    else
      new.owner_id := old.owner_id;
      new.status := old.status;
      new.is_verified := old.is_verified;
      new.rating := old.rating;
      new.completed_jobs := old.completed_jobs;
      new.consent_habeas_data_at := old.consent_habeas_data_at;
      new.created_at := old.created_at;
    end if;
  elsif tg_op = 'INSERT' and new.consent_habeas_data_at is null then
    new.consent_habeas_data_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_trg on public.profiles;
create trigger profiles_guard_trg
  before insert or update on public.profiles
  for each row execute function public.profiles_guard();

-- Vista PÚBLICA: solo perfiles aprobados, celular enmascarado y sin correo.
drop view if exists public.public_profiles;
create view public.public_profiles as
select
  p.id,
  null::uuid                                              as owner_id,
  p.full_name,
  p.profession,
  p.category_id,
  p.sector,
  p.experience_years,
  p.skills,
  p.bio,
  p.availability,
  case when p.consent_public_whatsapp then p.whatsapp_phone end as whatsapp_phone,
  null::text                                              as email,
  p.consent_habeas_data,
  null::timestamptz                                       as consent_habeas_data_at,
  p.consent_public_whatsapp,
  p.status,
  p.is_verified,
  p.rating,
  p.completed_jobs,
  p.created_at,
  p.updated_at
from public.profiles p
where p.status = 'approved';

-- ============================================================================
-- 4. PORTAFOLIO FOTOGRÁFICO
-- ============================================================================
create table if not exists public.portfolio_items (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (char_length(btrim(title)) between 3 and 120),
  description  text not null check (char_length(btrim(description)) between 3 and 500),
  image_url    text not null,
  storage_path text,
  file_format  text not null check (file_format in ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
  file_size_kb integer not null check (file_size_kb between 1 and 2048),
  status       text not null default 'approved' check (status in ('approved', 'flagged')),
  created_at   timestamptz not null default now()
);

create index if not exists portfolio_profile_idx on public.portfolio_items (profile_id);

create or replace function public.portfolio_guard()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'approved';
    else
      new.status := old.status;
      new.profile_id := old.profile_id;
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists portfolio_guard_trg on public.portfolio_items;
create trigger portfolio_guard_trg
  before insert or update on public.portfolio_items
  for each row execute function public.portfolio_guard();

-- ============================================================================
-- 5. BOLSA DE EMPLEO
-- ============================================================================
create table if not exists public.job_postings (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid references auth.users(id) on delete cascade,
  title            text not null check (char_length(btrim(title)) between 3 and 120),
  company_name     text not null check (char_length(btrim(company_name)) between 2 and 120),
  category_id      text not null references public.categories(id),
  sector           text not null,
  job_type         text not null,
  modality         text not null,
  salary_cop       text,
  description      text not null check (char_length(btrim(description)) between 10 and 2000),
  requirements     text[] not null default '{}' check (cardinality(requirements) <= 20),
  contact_whatsapp text check (contact_whatsapp is null or contact_whatsapp ~ '^3[0-9]{9}$'),
  contact_email    text check (contact_email is null or char_length(contact_email) <= 200),
  status           text not null default 'abierta' check (status in ('abierta', 'cerrada')),
  published_at     date not null default current_date,
  closing_date     date not null,
  created_at       timestamptz not null default now(),
  check (contact_whatsapp is not null or contact_email is not null),
  check (closing_date >= published_at)
);

create index if not exists jobs_author_idx on public.job_postings (author_id);
create index if not exists jobs_status_idx on public.job_postings (status);

create or replace function public.is_job_author(jid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.job_postings where id = jid and author_id = auth.uid());
$$;

create or replace function public.jobs_guard()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.author_id := auth.uid();
    else
      new.author_id := old.author_id;
      new.published_at := old.published_at;
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_guard_trg on public.job_postings;
create trigger jobs_guard_trg
  before insert or update on public.job_postings
  for each row execute function public.jobs_guard();

-- ============================================================================
-- 6. POSTULACIONES A VACANTES
-- ============================================================================
create table if not exists public.job_applications (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references public.job_postings(id) on delete cascade,
  applicant_id    uuid not null references auth.users(id) on delete cascade,
  applicant_name  text not null check (char_length(btrim(applicant_name)) between 3 and 120),
  applicant_phone text not null check (applicant_phone ~ '^3[0-9]{9}$'),
  cover_message   text not null check (char_length(btrim(cover_message)) between 5 and 1000),
  created_at      timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index if not exists applications_job_idx on public.job_applications (job_id);

-- ============================================================================
-- 7. REPORTES COMUNITARIOS Y AUDITORÍA
-- ============================================================================
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references auth.users(id) on delete set null,
  target_type  text not null check (target_type in ('profile', 'job', 'portfolio')),
  target_id    text not null,
  target_title text not null default '',
  reason       text not null check (char_length(btrim(reason)) between 3 and 200),
  details      text not null check (char_length(btrim(details)) between 5 and 1000),
  status       text not null default 'pendiente' check (status in ('pendiente', 'resuelto', 'descartado')),
  created_at   timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references auth.users(id) on delete set null,
  admin_name  text not null default '',
  action      text not null,
  target_type text not null,
  target_name text not null,
  details     text,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.portfolio_items  enable row level security;
alter table public.job_postings     enable row level security;
alter table public.job_applications enable row level security;
alter table public.reports          enable row level security;
alter table public.admin_audit_logs enable row level security;

-- user_roles: cada usuario solo ve su propio rol; la Junta ve todos. Nadie escribe desde la app.
drop policy if exists "roles_select_own_or_admin" on public.user_roles;
create policy "roles_select_own_or_admin" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- categories: lectura pública
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (true);

-- profiles: dueño y Junta (el público usa la vista public_profiles)
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_own_or_admin" on public.profiles;
create policy "profiles_delete_own_or_admin" on public.profiles
  for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- portfolio_items: público ve fotos aprobadas de perfiles aprobados; dueño y Junta ven todo
drop policy if exists "portfolio_select" on public.portfolio_items;
create policy "portfolio_select" on public.portfolio_items
  for select to anon, authenticated
  using (
    (status = 'approved' and public.is_profile_approved(profile_id))
    or public.owns_profile(profile_id)
    or public.is_admin()
  );

drop policy if exists "portfolio_insert_own" on public.portfolio_items;
create policy "portfolio_insert_own" on public.portfolio_items
  for insert to authenticated
  with check (public.owns_profile(profile_id) or public.is_admin());

drop policy if exists "portfolio_update_own_or_admin" on public.portfolio_items;
create policy "portfolio_update_own_or_admin" on public.portfolio_items
  for update to authenticated
  using (public.owns_profile(profile_id) or public.is_admin())
  with check (public.owns_profile(profile_id) or public.is_admin());

drop policy if exists "portfolio_delete_own_or_admin" on public.portfolio_items;
create policy "portfolio_delete_own_or_admin" on public.portfolio_items
  for delete to authenticated
  using (public.owns_profile(profile_id) or public.is_admin());

-- job_postings: lectura pública; escribe el autor o la Junta
drop policy if exists "jobs_public_read" on public.job_postings;
create policy "jobs_public_read" on public.job_postings
  for select to anon, authenticated
  using (true);

drop policy if exists "jobs_insert_own" on public.job_postings;
create policy "jobs_insert_own" on public.job_postings
  for insert to authenticated
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "jobs_update_own_or_admin" on public.job_postings;
create policy "jobs_update_own_or_admin" on public.job_postings
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "jobs_delete_own_or_admin" on public.job_postings;
create policy "jobs_delete_own_or_admin" on public.job_postings
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- job_applications: las ve el postulante, el autor de la vacante y la Junta
drop policy if exists "applications_select" on public.job_applications;
create policy "applications_select" on public.job_applications
  for select to authenticated
  using (applicant_id = auth.uid() or public.is_job_author(job_id) or public.is_admin());

drop policy if exists "applications_insert_own" on public.job_applications;
create policy "applications_insert_own" on public.job_applications
  for insert to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (
      select 1 from public.job_postings j
      where j.id = job_id and j.status = 'abierta' and j.closing_date >= current_date
    )
  );

drop policy if exists "applications_delete_own_or_admin" on public.job_applications;
create policy "applications_delete_own_or_admin" on public.job_applications
  for delete to authenticated
  using (applicant_id = auth.uid() or public.is_admin());

-- reports: cualquiera reporta; solo la Junta lee y resuelve
drop policy if exists "reports_insert_any" on public.reports;
create policy "reports_insert_any" on public.reports
  for insert to anon, authenticated
  with check (status = 'pendiente' and (reporter_id is null or reporter_id = auth.uid()));

drop policy if exists "reports_admin_select" on public.reports;
create policy "reports_admin_select" on public.reports
  for select to authenticated
  using (public.is_admin());

drop policy if exists "reports_admin_update" on public.reports;
create policy "reports_admin_update" on public.reports
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "reports_admin_delete" on public.reports;
create policy "reports_admin_delete" on public.reports
  for delete to authenticated
  using (public.is_admin());

-- admin_audit_logs: solo la Junta, y solo se puede leer/insertar (inmutable)
drop policy if exists "audit_admin_select" on public.admin_audit_logs;
create policy "audit_admin_select" on public.admin_audit_logs
  for select to authenticated
  using (public.is_admin());

drop policy if exists "audit_admin_insert" on public.admin_audit_logs;
create policy "audit_admin_insert" on public.admin_audit_logs
  for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

-- ============================================================================
-- 9. PERMISOS (GRANT) — mínimos necesarios; el RLS decide qué filas se ven
-- ============================================================================
grant usage on schema public to anon, authenticated;

revoke all on public.user_roles, public.categories, public.profiles, public.portfolio_items,
              public.job_postings, public.job_applications, public.reports,
              public.admin_audit_logs, public.public_profiles
  from anon, authenticated;

grant select on public.user_roles                                   to authenticated;
grant select on public.categories                                   to anon, authenticated;
grant select on public.public_profiles                              to anon, authenticated;
grant select, insert, update, delete on public.profiles             to authenticated;
grant select                         on public.portfolio_items      to anon;
grant select, insert, update, delete on public.portfolio_items      to authenticated;
grant select                         on public.job_postings         to anon;
grant select, insert, update, delete on public.job_postings         to authenticated;
grant select, insert, delete         on public.job_applications     to authenticated;
grant insert                         on public.reports              to anon;
grant select, insert, update, delete on public.reports              to authenticated;
grant select, insert                 on public.admin_audit_logs     to authenticated;

-- ============================================================================
-- 10. STORAGE: bucket público "portfolio" (fotos de trabajos, máx. 2 MB)
--     Ruta de cada archivo: <uid-del-dueño>/<id-del-perfil>/<id-de-la-foto>.jpg
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_files_insert_own" on storage.objects;
create policy "portfolio_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio_files_select_own_or_admin" on storage.objects;
create policy "portfolio_files_select_own_or_admin" on storage.objects
  for select to authenticated
  using (bucket_id = 'portfolio' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists "portfolio_files_update_own" on storage.objects;
create policy "portfolio_files_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio_files_delete_own_or_admin" on storage.objects;
create policy "portfolio_files_delete_own_or_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ============================================================================
-- 11. NOMBRAR ADMINISTRADORES DE LA JUNTA
--     Paso 1: la persona crea su cuenta normal en la plataforma (Registrarse).
--     Paso 2: ejecuta esto con SU correo (descomenta y reemplaza el correo):
-- ============================================================================
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'correo.de.la.junta@ejemplo.com'
-- on conflict (user_id) do nothing;
--
-- Para quitar el permiso:
-- delete from public.user_roles where user_id = (select id from auth.users where email = 'correo.de.la.junta@ejemplo.com');
