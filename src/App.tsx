import { useEffect } from "react";
import type { ReactNode } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SeasonProvider } from "./context/SeasonContext";
import { ThemeProvider } from "./client/theme";
import { GlassFilter } from "./components/GlassFilter";
import { initData, reloadData, useDataStatus, getDataError } from "./data";

// Gerbang pemuatan data: pastikan data (dari Supabase) siap sebelum render
// agar konteks musim & seluruh halaman membaca data yang sudah lengkap.
// Pada mode demo (tanpa Supabase) status langsung "ready".
function DataGate({ children }: { children: ReactNode }) {
  const status = useDataStatus();

  useEffect(() => {
    void initData();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tulus-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <p className="text-sm text-white/80">Memuat data dari server...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tulus-900 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 text-center text-ink">
          <h1 className="font-display text-xl font-semibold text-tulus-900">
            Gagal memuat data
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {getDataError() ?? "Terjadi kesalahan saat menghubungi server."}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Periksa konfigurasi .env (VITE_SUPABASE_URL &
            VITE_SUPABASE_ANON_KEY) serta apakah skema SQL sudah dijalankan.
          </p>
          <button
            onClick={() => void reloadData()}
            className="mt-5 rounded-xl bg-tulus-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-tulus-600"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      {/* Filter SVG untuk efek kaca navbar (light & dark) */}
      <GlassFilter />
      <AuthProvider>
        <DataGate>
          <SeasonProvider>
            <AppRoutes />
          </SeasonProvider>
        </DataGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
