import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// =====================================================
// Autentikasi admin
//
//   * Mode Supabase (.env terisi): autentikasi nyata via Supabase Auth
//     (email + kata sandi). Sesi otomatis dipertahankan di browser.
//
//   * Mode demo (.env kosong): fallback sederhana memakai kata sandi statis
//     agar UI tetap bisa dijelajahi tanpa backend.
// =====================================================

const DEMO_PASSWORD = "admin123";
const DEMO_KEY = "fms-admin-auth";

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  /** Sedang menentukan status sesi (mode Supabase). */
  isLoading: boolean;
  /** Email admin yang sedang login (mode Supabase). */
  email: string | null;
  /** True bila autentikasi nyata (Supabase) aktif. */
  configured: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemoInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_KEY) === "true";
  } catch {
    return false;
  }
}

/** Terjemahkan pesan error Supabase ke bahasa Indonesia yang ramah. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed"))
    return "Email belum dikonfirmasi. Cek kotak masuk Anda.";
  if (m.includes("network"))
    return "Gagal terhubung ke server. Periksa koneksi internet.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoAuthed, setDemoAuthed] = useState<boolean>(
    () => !isSupabaseConfigured && readDemoInitial(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    const client = supabase;

    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      if (!isSupabaseConfigured || !supabase) {
        // Mode demo: abaikan email, cek kata sandi statis.
        const ok = password === DEMO_PASSWORD;
        if (ok) {
          setDemoAuthed(true);
          try {
            window.localStorage.setItem(DEMO_KEY, "true");
          } catch {
            // abaikan
          }
          return { ok: true };
        }
        return { ok: false, error: "Kata sandi salah." };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, error: translateAuthError(error.message) };
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setDemoAuthed(false);
      try {
        window.localStorage.removeItem(DEMO_KEY);
      } catch {
        // abaikan
      }
      return;
    }
    await supabase.auth.signOut();
  }, []);

  const isAuthenticated = isSupabaseConfigured ? !!session : demoAuthed;
  const email = session?.user?.email ?? null;

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      email,
      configured: isSupabaseConfigured,
      login,
      logout,
    }),
    [isAuthenticated, isLoading, email, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
