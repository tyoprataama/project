import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiMail, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

const cardHidden = { opacity: 0, y: 24 };
const cardShown = { opacity: 1, y: 0 };
const cardTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

export default function AdminLogin() {
  const { login, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  const fromState = location.state as { from?: string } | null;
  const redirectTo = fromState?.from ?? "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    const res = await login(values.email, values.password);
    if (res.ok) {
      const target = redirectTo.startsWith("/admin/login")
        ? "/admin"
        : redirectTo;
      navigate(target, { replace: true });
    } else {
      setAuthError(res.error ?? "Gagal masuk. Silakan coba lagi.");
    }
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-tulus-900 px-5 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-tulus-600 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-leaf-600 blur-3xl" />
      </div>

      <motion.div
        initial={cardHidden}
        animate={cardShown}
        transition={cardTransition}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 text-ink shadow-2xl sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tulus-700 text-white">
            <FiLock className="text-2xl" />
          </span>
          <h1 className="font-display mt-5 text-2xl font-semibold text-tulus-900">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Halaman ini khusus untuk pemilik sistem. Masuk untuk mengelola data.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-ink-soft"
            >
              Email
            </label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-tulus-600 focus:ring-2 focus:ring-tulus-600/20"
                {...register("email", {
                  required: "Email wajib diisi",
                })}
                onChange={() => authError && setAuthError(null)}
              />
            </div>
            {errors.email ? (
              <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-ink-soft"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-tulus-600 focus:ring-2 focus:ring-tulus-600/20"
                {...register("password", { required: "Kata sandi wajib diisi" })}
                onChange={() => authError && setAuthError(null)}
              />
            </div>
            {errors.password ? (
              <p className="mt-2 text-xs text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {authError ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <span>{authError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-tulus-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-tulus-600 disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Masuk Dashboard"}
            <FiArrowRight className="transition group-hover:translate-x-0.5" />
          </button>

          {!configured ? (
            <p className="text-center text-xs text-ink-muted">
              Mode demo aktif (Supabase belum dikonfigurasi). Email diabaikan,
              gunakan kata sandi demo.
            </p>
          ) : null}
        </form>
      </motion.div>
    </main>
  );
}
