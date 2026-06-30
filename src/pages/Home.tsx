import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiMap, FiBarChart2, FiActivity } from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { FieldCard } from "../components/cards/FieldCard";
import { PageTransition } from "../components/ui/PageTransition";
import { fields } from "../data";

const highlights = [
  {
    icon: FiMap,
    title: "Peta Lahan Interaktif",
    text: "Visualisasi lokasi & status tiap lahan secara ringkas.",
  },
  {
    icon: FiActivity,
    title: "Monitoring Tanaman",
    text: "Pantau tinggi, kesehatan, dan risiko hama per minggu.",
  },
  {
    icon: FiBarChart2,
    title: "Dashboard Ekonomi",
    text: "Analisis biaya, pendapatan, dan margin tiap lahan.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <section className="overflow-hidden rounded-3xl bg-tulus-900 p-8 text-white lg:p-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-leaf-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tulus-100">
              Dashboard Admin
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium leading-tight lg:text-4xl">
            Field Management System
          </h1>
          <p className="mt-3 leading-relaxed text-tulus-100">
            Dokumentasi & manajemen operasi lapangan pertanian — menampilkan
            skill manajemen operasional, analisis data, dan pelaporan yang
            transferable ke industri seperti pertambangan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/admin/fields")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-tulus-900 transition-colors hover:bg-tulus-50"
            >
              Kelola Lahan <FiArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/admin/overview")}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Lihat Overview
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-tulus-200"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-tulus-50 text-tulus-700">
              <h.icon size={20} />
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-ink">
              {h.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {h.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-medium text-ink">
          Lahan Unggulan
        </h2>
        <Link
          to="/admin/overview"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-tulus-700 hover:text-tulus-800"
        >
          Lihat semua <FiArrowRight size={15} />
        </Link>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.slice(0, 3).map((f) => (
          <FieldCard
            key={f.id}
            field={f}
            onClick={() => navigate("/admin/fields")}
          />
        ))}
      </div>
    </PageTransition>
  );
}
