import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ClientNavbar } from "./ClientNavbar";
import { ClientFooter } from "./ClientFooter";

export default function ClientLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <ClientNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}
