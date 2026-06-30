import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Maaf, halaman yang kamu cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link to="/admin" className="mt-6">
          <Button>
            <FiArrowLeft /> Kembali ke Home
          </Button>
        </Link>
      </div>
    </PageTransition>
  );
}
