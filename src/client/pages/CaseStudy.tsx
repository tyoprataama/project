import { Link } from "react-router-dom";
import {
  SiReact,
  SiTypescript,
  SiVite,
  SiReactrouter,
  SiTailwindcss,
  SiFramer,
  SiReacthookform,
  SiClaude,
  SiSupabase,
} from "react-icons/si";
import {
  FiTarget,
  FiCompass,
  FiCheckCircle,
  FiLayers,
  FiArrowUpRight,
} from "react-icons/fi";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { SectionTitle } from "../components/SectionTitle";

const techStack = [
  { name: "React 18", role: "UI library berbasis komponen", icon: SiReact },
  {
    name: "TypeScript",
    role: "Keamanan tipe di seluruh kode",
    icon: SiTypescript,
  },
  { name: "Vite", role: "Build tool & dev server cepat", icon: SiVite },
  {
    name: "React Router",
    role: "Routing client-side & nested route",
    icon: SiReactrouter,
  },
  {
    name: "Tailwind CSS",
    role: "Desain sistem utility-first",
    icon: SiTailwindcss,
  },
  {
    name: "Framer Motion",
    role: "Animasi & micro-interaction",
    icon: SiFramer,
  },
  {
    name: "React Hook Form",
    role: "Form input data yang ringan",
    icon: SiReacthookform,
  },
  { name: "React Icons", role: "Set ikon konsisten", icon: FiLayers },
  { name: "Claude Opus", role: "Asisten vibe coding", icon: SiClaude },
  { name: "Supabase", role: "Project database", icon: SiSupabase },
];

const features = [
  "Timeline aktivitas operasional yang dapat difilter",
  "Monitoring kondisi & risiko di lapangan secara berkala",
  "Dashboard ekonomi: biaya, pendapatan, dan margin",
  "Perbandingan antar lokasi secara berdampingan",
  "Galeri dokumentasi visual antar fase",
  "Catatan praktik (SOP) dan log pengambilan keputusan",
  "Satu sumber data di admin yang mengalir ke sisi publik",
];

const process = [
  {
    icon: FiTarget,
    title: "Masalah",
    text: "Operasi lapangan menghasilkan banyak data harian aktivitas, biaya, kondisi aset, namun sering tercecer dan sulit dibaca untuk mengambil keputusan cepat. Tantangan ini sama persis di kebun maupun di area industri.",
  },
  {
    icon: FiCompass,
    title: "Pendekatan",
    text: "Merancang satu sistem terpusat: sisi admin sebagai sumber data tunggal untuk input dan pengelolaan, serta sisi publik yang menyajikan data secara ringkas bagi pemangku kepentingan.",
  },
  {
    icon: FiCheckCircle,
    title: "Hasil",
    text: "Antarmuka konsisten dan mudah dipahami, dengan komponen reusable, dapat diadaptasi ke konteks industri lain.",
  },
];

const miningParallels = [
  {
    farm: "Lahan & musim tanam",
    mining: "Blok / pit & periode produksi",
  },
  {
    farm: "Aktivitas lapangan & SOP",
    mining: "Aktivitas operasional & prosedur K3",
  },
  {
    farm: "Biaya, hasil panen, & margin",
    mining: "Biaya operasi, tonase, & produktivitas",
  },
  {
    farm: "Monitoring kondisi tanaman",
    mining: "Monitoring kondisi alat & lingkungan",
  },
];

export default function CaseStudy() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-tulus-50/70 to-white dark:border-white/10 dark:from-[#202020] dark:to-[#191919]">
        <Container className="py-16 lg:py-24">
          <Reveal>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-leaf-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tulus-600 dark:text-[#5E9FE8]">
                Studi Kasus
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.1] text-ink dark:text-white sm:text-5xl">
              Taniku, dari data lapangan menjadi keputusan
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted dark:text-white/65">
              Aplikasi web yang mendokumentasikan dan memvisualisasikan operasi
              lapangan berbasis aset. Studinya memakai konteks pertanian, namun
              polanya sengaja dirancang transferable ke industri padat aset
              khususnya pertambangan, bidang tempat saya ingin meniti karier.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Process */}
      <section className="bg-white py-20 dark:bg-[#191919]">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {process.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-[#202020]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-tulus-50 text-tulus-700 dark:bg-white/10 dark:text-[#8fbdf0]">
                    <p.icon size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-medium text-ink dark:text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-white/60">
                    {p.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 dark:border-white/10 dark:bg-[#1c1c1c]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <SectionTitle
                eyebrow="Fitur"
                title="Apa yang dibangun"
                description="Halaman fungsional dengan komponen yang dapat dipakai ulang, semuanya berjalan di atas satu sumber data yang dikelola dari sisi admin."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <FiCheckCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-leaf-500"
                    />
                    <span className="text-sm leading-relaxed text-ink-soft dark:text-white/75">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Mining relevance */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#191919]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Relevansi Pertambangan"
              title="Pola yang sama, konteks tambang"
              description="Tujuan karier saya adalah berkontribusi di industri pertambangan. Sistem ini sengaja dibangun dengan kerangka manajemen aset & operasi yang langsung relevan dengan kebutuhan operasional tambang, cukup mengganti entitas datanya."
            />
          </Reveal>
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="grid grid-cols-2 bg-tulus-900 text-sm font-medium text-white dark:bg-[#0f1f38]">
              <div className="px-5 py-3.5">Konteks Pertanian</div>
              <div className="px-5 py-3.5">Konteks Pertambangan</div>
            </div>
            {miningParallels.map((row, i) => (
              <div
                key={row.farm}
                className={`grid grid-cols-2 text-sm ${
                  i % 2 === 0
                    ? "bg-white dark:bg-[#202020]"
                    : "bg-slate-50/70 dark:bg-[#1c1c1c]"
                }`}
              >
                <div className="border-t border-slate-100 px-5 py-3.5 text-ink-soft dark:border-white/10 dark:text-white/70">
                  {row.farm}
                </div>
                <div className="border-t border-slate-100 px-5 py-3.5 font-medium text-tulus-800 dark:border-white/10 dark:text-[#8fbdf0]">
                  {row.mining}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Tech stack */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 dark:border-white/10 dark:bg-[#1c1c1c]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Teknologi"
              title="Tech stack"
              description="Dipilih agar ringan, modern, dan mudah dikembangkan."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {techStack.map((t, i) => {
              const Icon = t.icon;
              return (
                <Reveal key={t.name} delay={(i % 4) * 0.05}>
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#202020]">
                    <Icon
                      size={18}
                      className="text-tulus-600 dark:text-[#8fbdf0]"
                    />
                    <p className="mt-3 font-medium text-ink dark:text-white">
                      {t.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted dark:text-white/55">
                      {t.role}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#191919]">
        <Container>
          <Reveal>
            <div className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-slate-50/60 p-8 dark:border-white/10 dark:bg-[#202020] sm:p-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <SectionTitle
                  eyebrow="Langkah berikutnya"
                  title="Siap diadaptasi untuk sektor industri lain"
                  description="Kerangka data, halaman, dan komponen pada sistem ini dapat dikonfigurasi ulang menjadi dashboard operasional industri yang lain."
                />
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/showcase"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-tulus-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-tulus-800 dark:bg-[#2f6bb0] dark:hover:bg-[#3a7ac2]"
                >
                  Lihat Showcase Data <FiArrowUpRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-tulus-300 hover:text-tulus-700 dark:border-white/20 dark:text-white dark:hover:border-white/40"
                >
                  Hubungi saya
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
