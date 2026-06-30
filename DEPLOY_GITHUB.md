# Panduan Deploy ke GitHub Pages (subpath /project)

Target: app ini tampil di **`https://<username>.github.io/project/`**, terpisah
dari project lain yang sudah ada di repo `<username>.github.io` (root domain).

Ganti `<username>` dengan username GitHub Anda di semua langkah.

---

## Konsep penting

GitHub Pages menyajikan **repo bernama `project`** (milik akun Anda) secara
otomatis di `https://<username>.github.io/project/`. Jadi cara paling rapi
adalah membuat **repo baru terpisah bernama `project`** — tidak mengganggu repo
`<username>.github.io` yang sudah berisi app lain.

Karena itu, `vite.config.ts` sudah disetel:

```ts
base: command === "build" ? "/project/" : "/";
```

> Jika nanti Anda memakai nama repo lain (mis. `tebu`), ubah `PROJECT_BASE` di
> `vite.config.ts` menjadi `"/tebu/"`. `base` harus sama persis dengan nama repo.

Deep-link (mis. `/project/admin`) ditangani oleh `public/404.html` +
script pemulih di `index.html`, jadi refresh halaman dalam tidak error 404.

---

## Langkah 1 — Buat repo `project`

1. GitHub → **New repository**.
2. **Repository name:** `project` (huruf kecil, persis).
3. Visibilitas **Public** (wajib untuk Pages gratis).
4. Buat tanpa README agar tidak bentrok saat push pertama.

## Langkah 2 — Push kode

Dari dalam folder project ini:

```bash
git init
git add .
git commit -m "Field Management System + Supabase"
git branch -M main
git remote add origin https://github.com/<username>/project.git
git push -u origin main
```

## Langkah 3 — Masukkan ENV di pengaturan GitHub

Variabel `VITE_*` dibaca **saat build** (di GitHub Actions), jadi harus
didaftarkan sebagai **repository secret**:

1. Buka repo `project` → **Settings**.
2. Sidebar: **Secrets and variables → Actions**.
3. Tab **Secrets** → **New repository secret**. Tambahkan dua secret:

   | Name                     | Secret (value)                          |
   | ------------------------ | --------------------------------------- |
   | `VITE_SUPABASE_URL`      | `https://xxxxxxxx.supabase.co`          |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (anon public key)       |

4. **Save** masing-masing.

> Nilai-nilai ini akan dibaca workflow lewat
> `${SECRET_REF_URL}` dan `${SECRET_REF_KEY}` (lihat
> `.github/workflows/deploy.yml`). `anon key` aman tampil di bundle publik
> karena keamanan ditegakkan oleh RLS di Supabase.

## Langkah 4 — Aktifkan GitHub Pages (sumber: Actions)

1. Repo `project` → **Settings → Pages**.
2. **Build and deployment → Source:** pilih **GitHub Actions**.
   (Bukan “Deploy from a branch”.)

## Langkah 5 — Jalankan deploy

Workflow `.github/workflows/deploy.yml` otomatis berjalan setiap push ke
`main`. Untuk memicu manual: tab **Actions → Deploy to GitHub Pages → Run
workflow**.

Workflow akan: `npm install` → `npm run build` (menyuntik kedua secret) →
unggah folder `dist` → publish ke Pages.

Setelah hijau, app tampil di:

```
https://<username>.github.io/project/
```

## Langkah 6 — Izinkan domain di Supabase

Agar autentikasi & request dari domain Pages diterima:

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL / Redirect URLs:** tambahkan
   `https://<username>.github.io/project/`.

---

## Alternatif: tetap di repo `<username>.github.io`

Jika Anda lebih suka menaruh app ini sebagai sub-folder di repo
`<username>.github.io` yang sudah ada (bukan repo terpisah), itu memungkinkan
tetapi lebih rumit karena harus menggabungkan dua pipeline build dalam satu
repo. Pendekatan **repo `project` terpisah** di atas jauh lebih sederhana,
deploy-nya independen, dan secret-nya pun terpisah. Disarankan memakai cara itu.

---

## Checklist ringkas

- [ ] Repo bernama `project` (Public)
- [ ] Secret `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` ditambahkan
- [ ] Pages Source = GitHub Actions
- [ ] `base` di `vite.config.ts` = `/project/`
- [ ] Skema Supabase sudah dijalankan + user admin dibuat
- [ ] URL Pages didaftarkan di Supabase Auth
