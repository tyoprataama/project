import { Routes, Route } from "react-router-dom";

// --- Sisi client (untuk HR / publik) ---
import ClientLayout from "../client/layouts/ClientLayout";
import ClientHome from "../client/pages/ClientHome";
import Showcase from "../client/pages/Showcase";
import CaseStudy from "../client/pages/CaseStudy";
import Contact from "../client/pages/Contact";
import ClientNotFound from "../client/pages/ClientNotFound";

// --- Sisi admin (dashboard internal) ---
import { RequireAuth } from "./RequireAuth";
import AdminLogin from "../pages/AdminLogin";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import FieldManagement from "../pages/FieldManagement";
import Overview from "../pages/Overview";
import ActivityTimeline from "../pages/ActivityTimeline";
import EconomicDashboard from "../pages/EconomicDashboard";
import FieldComparison from "../pages/FieldComparison";
import GrowthGallery from "../pages/GrowthGallery";
import FieldPractices from "../pages/FieldPractices";
import DecisionLog from "../pages/DecisionLog";
import AboutProject from "../pages/AboutProject";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Situs publik / showcase untuk HR */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<ClientHome />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/case-study" element={<CaseStudy />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Halaman login admin (akses manual via URL) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Dashboard admin — hanya untuk pemilik, wajib login */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Home />} />
        <Route path="fields" element={<FieldManagement />} />
        <Route path="overview" element={<Overview />} />
        <Route path="timeline" element={<ActivityTimeline />} />
        <Route path="economics" element={<EconomicDashboard />} />
        <Route path="comparison" element={<FieldComparison />} />
        <Route path="gallery" element={<GrowthGallery />} />
        <Route path="practices" element={<FieldPractices />} />
        <Route path="decisions" element={<DecisionLog />} />
        <Route path="about" element={<AboutProject />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Catch-all publik */}
      <Route path="*" element={<ClientNotFound />} />
    </Routes>
  );
}
