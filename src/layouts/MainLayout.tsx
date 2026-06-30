import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { SidebarContent } from "./Sidebar";
import { Footer } from "./Footer";
import { Drawer } from "../components/ui/Drawer";
import { useDisclosure } from "../hooks/useDisclosure";

export default function MainLayout() {
  const drawer = useDisclosure();
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuClick={drawer.open} />
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
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
