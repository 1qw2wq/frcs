import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type BackendEngine = 'supabase' | 'sqlite' | 'none';

let cached: SupabaseClient | null | undefined;

/** True when NEXT_PUBLIC_SUPABASE_URL + service/anon key are present. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('YOUR_') && !key.includes('YOUR_'));
}

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  // Prefer service role on server so clear/reset/seed work without RLS friction
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!url || !key || url.includes('YOUR_') || key.includes('YOUR_')) {
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function getBackendInfo(): {
  engine: BackendEngine;
  configured: boolean;
  url?: string;
  message: string;
} {
  if (isSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    return {
      engine: 'supabase',
      configured: true,
      url,
      message: 'Connected to Supabase PostgreSQL (SQL Server compatible API)',
    };
  }
  return {
    engine: 'sqlite',
    configured: true,
    message: 'Local SQLite fallback (set SUPABASE env vars for cloud SQL)',
  };
}
