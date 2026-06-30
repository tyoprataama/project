import type { IconType } from "react-icons";
import {
  FiHome,
  FiGrid,
  FiLayers,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiImage,
  FiBookOpen,
  FiList,
  FiInfo,
} from "react-icons/fi";

export interface NavItem {
  label: string;
  path: string;
  icon: IconType;
}

// Semua menu admin berada di bawah prefix /admin
export const navItems: NavItem[] = [
  { label: "Home", path: "/admin", icon: FiHome },
  { label: "Field Management", path: "/admin/fields", icon: FiLayers },
  { label: "Overview", path: "/admin/overview", icon: FiGrid },
  { label: "Activity Timeline", path: "/admin/timeline", icon: FiClock },
  {
    label: "Economic Dashboard",
    path: "/admin/economics",
    icon: FiDollarSign,
  },
  { label: "Field Comparison", path: "/admin/comparison", icon: FiBarChart2 },
  { label: "Growth Gallery", path: "/admin/gallery", icon: FiImage },
  { label: "Field Practices", path: "/admin/practices", icon: FiBookOpen },
  { label: "Decision Log", path: "/admin/decisions", icon: FiList },
  { label: "About Project", path: "/admin/about", icon: FiInfo },
];
