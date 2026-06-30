import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getAvailableYears, getLatestYear } from "../data";

// =====================================================
// Pilihan musim tanam global untuk situs publik.
// Mengubah tahun otomatis memperbarui seluruh section.
// =====================================================

interface SeasonContextValue {
  year: number;
  setYear: (year: number) => void;
  years: number[];
}

const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<number>(() => getLatestYear());

  const value = useMemo(
    () => ({ year, setYear, years: getAvailableYears() }),
    [year],
  );

  return (
    <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx)
    throw new Error("useSeason harus dipakai di dalam <SeasonProvider>");
  return ctx;
}
