import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONEXIÓN A SUPABASE (variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)
// Solo se usa la clave pública (anon). La seguridad real la imponen las
// políticas RLS definidas en supabase/schema.sql.
// ============================================================================
const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured: boolean =
  rawUrl.startsWith('https://') &&
  rawKey.length > 20 &&
  !rawUrl.includes('tu-proyecto') &&
  !rawUrl.includes('tu-url-de-supabase');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/** Devuelve el cliente o lanza un error claro si falta la configuración. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'La plataforma no está conectada a Supabase. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example).'
    );
  }
  return supabase;
}

export const PORTFOLIO_BUCKET = 'portfolio';
