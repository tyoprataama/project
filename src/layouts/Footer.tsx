export function Footer() {
  return (
    <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-400 lg:px-8">
      <p>
        © {new Date().getFullYear()} Tyo Putra. Dibuat dengan 💙 Vite,
        TypeScript, Tailwind CSS & Claude.
      </p>
    </footer>
  );
}
