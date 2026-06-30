import { createClient } from "@supabase/supabase-js";

// =====================================================
// Klien Supabase
//
// Nilai diambil dari environment variable (lihat .env.example):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// Bila .env belum diisi, `supabase` bernilai null dan aplikasi otomatis
// jatuh ke mode demo (seed + localStorage). Dengan begitu app tetap bisa
// dijalankan tanpa backend, mis. saat pengembangan UI.
// =====================================================

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True bila kedua kredensial Supabase tersedia. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
