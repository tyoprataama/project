import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { SidebarContent } from "./Sidebar";
import { Footer } from "./Footer";
import { Drawer } from "../components/ui/Drawer";
import { useDisclosure } from "../hooks/useDisclosure";

export default function MainLayout() {
  const drawer = useDisclosure();
  return (
    <div className="dark-surface min-h-screen bg-slate-50 text-ink transition-colors duration-300 dark:bg-[#191919] dark:text-white">
      <Navbar onMenuClick={drawer.open} />
      {/* padding-top mengompensasi navbar floating yang fixed */}
      <div className="flex pt-20">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <SidebarContent />
        </aside>
        <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
          <SidebarContent onNavigate={drawer.close} />
        </Drawer>
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
