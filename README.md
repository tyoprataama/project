# Field Management System

Aplikasi frontend portfolio untuk **manajemen & dokumentasi operasi lapangan pertanian**. Dibuat dengan React + Vite + TypeScript + Tailwind CSS. Studi kasus pertanian, namun dirancang agar skill-nya transferable ke industri lain (mis. pertambangan).

> Tahap ini **frontend-only** dengan **mock data lokal**. Belum ada backend / autentikasi / Supabase.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- React Router 6
- Tailwind CSS 3
- Framer Motion (animasi & transisi halaman)
- React Icons (Feather)
- React Hook Form (form Decision Log)

## Menjalankan secara lokal

Butuh Node.js 18+ dan npm.

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev

# 3. Build untuk production
npm run build

# 4. Preview hasil build
npm run preview
```

Lalu buka URL yang ditampilkan di terminal (default http://localhost:5173).

## Struktur Folder

```
src/
  assets/            # aset statis (jika ada)
  components/
    ui/              # komponen dasar reusable (Button, Card, Badge, Modal, dst.)
    cards/           # kartu domain (FieldCard, StatisticCard, dst.)
  constants/         # konstanta (navigasi)
  data/              # mock data + helper akses data
  hooks/             # custom hooks (useDisclosure)
  layouts/           # Navbar, Sidebar, Footer, MainLayout
  pages/             # 12 halaman (Home, Overview, FieldMap, dst.)
  routes/            # definisi React Router
  types/             # tipe TypeScript domain
  utils/             # helper (format mata uang/tanggal/angka)
  App.tsx
  main.tsx
  index.css
```

## Halaman

| Route              | Halaman               | Deskripsi                             |
| ------------------ | --------------------- | ------------------------------------- |
| `/`                | Home                  | Landing + highlight fitur             |
| `/overview`        | Overview              | Ringkasan lahan & aktivitas           |
| `/field-map`       | Interactive Field Map | Peta skematik + detail lahan (modal)  |
| `/timeline`        | Activity Timeline     | Linimasa aktivitas, filter per lahan  |
| `/crop-monitoring` | Crop Monitoring       | Tinggi & kesehatan tanaman per minggu |
| `/economics`       | Economic Dashboard    | Biaya vs pendapatan, rincian kategori |
| `/comparison`      | Field Comparison      | Tabel perbandingan antar lahan        |
| `/gallery`         | Growth Gallery        | Galeri foto + lightbox                |
| `/practices`       | Field Practices       | Akordeon SOP/praktik lapangan         |
| `/decisions`       | Decision Log          | Catatan keputusan + form tambah       |
| `/about`           | About Project         | Latar belakang & teknologi            |
| `*`                | 404                   | Halaman tidak ditemukan               |

## Deploy ke GitHub Pages (nanti)

Proyek ini disiapkan untuk subfolder deploy. Untuk arsitektur `tyoprataama.github.io/project/<app>/`:

1. Set `base` di `vite.config.ts`, mis. `base: "/project/pertanian/"`.
2. Pastikan router pakai `basename={import.meta.env.BASE_URL}` (sudah diset di `main.tsx`).
3. Tambahkan trik `404.html` (copy dari `index.html`) untuk SPA fallback.
4. Tambahkan GitHub Actions workflow untuk build & publish folder `dist`.

Detail langkah deploy akan dipandu terpisah saat sudah siap.

---

Dibuat oleh **Tyo Pratama** sebagai portfolio project.
