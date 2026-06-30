import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { FiCheckCircle } from "react-icons/fi";

const stack = [
  "React",
  "Vite",
  "TypeScript",
  "Tailwind CSS",
  "React Router",
  "Framer Motion",
  "React Icons",
  "React Hook Form",
];
const goals = [
  "Manajemen operasional lapangan terstruktur",
  "Analisis data & pelaporan yang jelas",
  "Dokumentasi visual dan timeline aktivitas",
  "Pengambilan keputusan berbasis catatan",
];

export default function AboutProject() {
  return (
    <PageTransition>
      <PageHeader
        title="About Project"
        description="Latar belakang, tujuan, dan teknologi proyek ini."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800">
            Tentang Field Management System
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Field Management System adalah proyek portofolio yang
            mendokumentasikan dan mengelola operasi lapangan pertanian. Meskipun
            studi kasusnya pertanian, tujuannya adalah menunjukkan keterampilan
            manajemen operasional, analisis data, pelaporan, manajemen proyek,
            dan dokumentasi lapangan yang transferable ke industri lain seperti
            pertambangan.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Pada tahap ini seluruh data masih berupa mock data lokal. Backend,
            autentikasi, dan integrasi Supabase akan ditambahkan pada tahap
            berikutnya tanpa mengubah struktur antarmuka yang sudah ada.
          </p>

          <h4 className="mt-6 font-semibold text-slate-800">
            Tujuan yang Ditunjukkan
          </h4>
          <ul className="mt-2 space-y-2">
            {goals.map((g) => (
              <li
                key={g}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <FiCheckCircle className="mt-0.5 shrink-0 text-brand-500" /> {g}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="h-fit p-6">
          <h3 className="font-semibold text-slate-800">Teknologi</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {stack.map((s) => (
              <span
                key={s}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {s}
              </span>
            ))}
          </div>
          <h3 className="mt-6 font-semibold text-slate-800">Dibuat oleh</h3>
          <p className="mt-2 text-sm text-slate-600">
            Tyo Pratama — Portfolio Project
          </p>
        </Card>
      </div>
    </PageTransition>
  );
}
