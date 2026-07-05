import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ClientNavbar } from "./ClientNavbar";
import { ClientFooter } from "./ClientFooter";

// ThemeProvider kini dipasang di root (App.tsx) agar tema light/dark berlaku
// untuk situs publik DAN dashboard admin.
export default function ClientLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink transition-colors duration-300 dark:bg-[#191919] dark:text-white">
      <ClientNavbar />
      {/* padding-top mengompensasi navbar floating yang fixed di atas */}
      <main className="flex-1 pt-[4.75rem] sm:pt-24">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}
