# Panduan Setup Supabase (Backend)

App ini berjalan dalam dua mode otomatis:

- **Mode Supabase** — aktif jika file `.env` berisi kredensial. Data ditarik
  dari Supabase saat app dibuka, dan setiap perubahan admin langsung disimpan
  ke Supabase (tersinkron lintas perangkat).
- **Mode demo** — aktif jika `.env` kosong/tidak ada. Data berasal dari seed
  dan disimpan di `localStorage` browser (untuk uji coba UI tanpa backend).

---

## 1. Pakai project Supabase yang sudah ada (berbagi dengan portfolio)

App ini **berbagi satu project Supabase** dengan app portfolio/blog kamu — tidak
perlu membuat project baru. Semua tabel app ini memakai prefix **`fms_`**
(mis. `fms_fields`, `fms_seasons`) sehingga **dijamin tidak bentrok** dengan
tabel portfolio yang sudah ada di database yang sama.

1. Buka project Supabase portfolio kamu → **Project Settings → API**.
2. Pakai nilai yang **sama** dengan app portfolio:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

> Catatan: `anon key` memang aman ditaruh di front-end. Keamanan ditegakkan
> oleh **Row Level Security (RLS)**, bukan oleh kerahasiaan key ini. Auth
> (user login) otomatis dipakai bersama kedua app — itu tidak masalah.

## 2. Jalankan skema database

1. Di dashboard Supabase, buka **SQL Editor → New query**.
2. Salin seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql) lalu
   **Run**.
3. Skema ini membuat 10 tabel berprefix `fms_` + mengaktifkan RLS dengan kebijakan:
   - **Publik boleh membaca** semua tabel (showcase publik).
   - **Hanya user terautentikasi** yang boleh insert/update/delete (edit data).

## 3. Buat akun admin

1. Buka **Authentication → Users → Add user**.
2. Isi **email** dan **password** untuk diri Anda (pemilik sistem).
3. (Opsional) Matikan konfirmasi email di **Authentication → Sign In / Providers
   → Email** agar bisa langsung login saat development.

Inilah email + password yang Anda pakai di halaman **/admin/login**.

## 4. Isi `.env` lokal

1. Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Isi nilainya:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   File `.env` sudah masuk `.gitignore` (tidak ikut ter-commit).

## 5. Install & jalankan

```bash
npm install
npm run dev
```

## 6. Migrasi data awal ke Supabase

Database masih kosong setelah skema dibuat. Untuk mengisinya dengan data tebu
yang sudah ada:

1. Login ke **/admin/login** (email + password dari langkah 3).
2. Buka halaman **Field Management**.
3. Klik tombol **“Migrasi Data Awal”** (hanya muncul saat mode Supabase aktif).
4. Konfirmasi. Data seed akan di-*upsert* ke Supabase dan langsung dimuat ulang.

Cukup dilakukan **sekali**. Setelah ini, semua input nyata Anda tersimpan di
Supabase dan tersinkron di semua perangkat.

---

## Catatan teknis

- Nama kolom di tabel memakai **camelCase** (mis. `areaM2`, `fieldId`) agar
  cocok 1:1 dengan tipe TypeScript — itulah sebabnya kolom dikutip ganda di SQL.
- Tabel anak (activities, expenses, dll) memiliki foreign key ke `fields`/
  `seasons` dengan `on delete cascade`, sehingga menghapus lahan/musim ikut
  menghapus turunannya.
- Jika layar **“Gagal memuat data”** muncul: pastikan skema sudah dijalankan,
  `.env` benar, dan project Supabase aktif.
