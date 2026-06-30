import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Container } from "../components/Container";

export default function ClientNotFound() {
  return (
    <section className="bg-white">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-7xl font-medium text-tulus-700 sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-medium text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-tulus-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-tulus-800"
        >
          <FiArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </Container>
    </section>
  );
}
