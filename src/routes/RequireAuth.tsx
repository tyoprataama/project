import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

// Membungkus area admin. Jika belum login, alihkan ke halaman login admin.
// Saat status sesi masih ditentukan (mode Supabase), tampilkan loading agar
// pengguna yang sudah login tidak salah dialihkan ke halaman login.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const redirectState = { from: location.pathname };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tulus-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <p className="text-sm text-white/80">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={redirectState} />;
  }
  return <>{children}</>;
}
