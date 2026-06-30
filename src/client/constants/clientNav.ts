export interface ClientNavItem {
  label: string;
  path: string;
}

// Navigasi situs publik (untuk HR / pengunjung)
export const clientNav: ClientNavItem[] = [
  { label: "Beranda", path: "/" },
  { label: "Showcase Data", path: "/showcase" },
  { label: "Studi Kasus", path: "/case-study" },
  { label: "Kontak", path: "/contact" },
];

// Identitas pemilik portfolio (dipakai di navbar, footer, kontak)
export const profile = {
  name: "Tyo Pratama",
  role: "Frontend / Full-Stack Developer",
  github: "https://github.com/tyoprataama",
  githubHandle: "tyoprataama",
  email: "tyfaka71@gmail.com",
  location: "Kediri, Indonesia",
};
