-- =====================================================================
-- Field Management System — Skema Supabase (PostgreSQL)
--
-- Cara pakai:
--   1. Buka dashboard Supabase > SQL Editor.
--   2. Tempel SELURUH isi file ini, lalu klik RUN.
--
-- Catatan: kolom memakai camelCase (dikutip dengan ") agar cocok 1:1
-- dengan tipe data TypeScript, sehingga tidak perlu mapping di kode.
-- =====================================================================

-- 1) LAHAN (informasi permanen)
create table if not exists fms_fields (
  id            text primary key,
  name          text not null,
  "areaM2"      numeric not null default 0,
  ownership     text not null default 'owned',
  "rentalCost"  numeric,
  notes         text not null default '',
  location      text not null default '',
  "soilType"    text not null default '',
  "bmkgCode"    text
);

-- 2) MUSIM TANAM
create table if not exists fms_seasons (
  id                  text primary key,
  "fieldId"           text not null references fms_fields(id) on delete cascade,
  year                integer not null,
  label               text not null default '',
  crop                text not null default '',
  status              text not null default 'active',
  "plantingDate"      text not null default '',
  "harvestDate"       text not null default '',
  "actualHarvestDate" text,
  "harvestNote"       text,
  progress            numeric not null default 0,
  notes               text not null default ''
);

-- 3) AKTIVITAS
create table if not exists fms_activities (
  id            text primary key,
  "seasonId"    text references fms_seasons(id) on delete cascade,
  "fieldId"     text references fms_fields(id) on delete cascade,
  date          text not null default '',
  type          text not null,
  title         text not null default '',
  description   text not null default '',
  "performedBy" text not null default '',
  cost          numeric,
  status        text not null default 'completed'
);

-- 4) PENGELUARAN
create table if not exists fms_expenses (
  id          text primary key,
  "seasonId"  text references fms_seasons(id) on delete cascade,
  "fieldId"   text references fms_fields(id) on delete cascade,
  date        text not null default '',
  category    text not null,
  description text not null default '',
  amount      numeric not null default 0
);

-- 5) PENDAPATAN
create table if not exists fms_revenues (
  id            text primary key,
  "seasonId"    text references fms_seasons(id) on delete cascade,
  "fieldId"     text references fms_fields(id) on delete cascade,
  date          text not null default '',
  product       text not null default '',
  "quantityKg"  numeric,
  "pricePerKg"  numeric,
  amount        numeric not null default 0
);

-- 6) GALERI
create table if not exists fms_gallery (
  id          text primary key,
  "seasonId"  text references fms_seasons(id) on delete cascade,
  "fieldId"   text references fms_fields(id) on delete cascade,
  date        text not null default '',
  title       text not null default '',
  stage       text not null default '',
  "imageUrl"  text not null default '',
  notes       text not null default ''
);

-- 7) LAPORAN
create table if not exists fms_reports (
  id          text primary key,
  "seasonId"  text references fms_seasons(id) on delete cascade,
  "fieldId"   text references fms_fields(id) on delete cascade,
  period      text not null default '',
  "yieldTon"  numeric not null default 0,
  "targetTon" numeric not null default 0,
  summary     text not null default ''
);

-- 8) PRAKTIK BUDIDAYA
create table if not exists fms_practices (
  id          text primary key,
  "seasonId"  text references fms_seasons(id) on delete cascade,
  "fieldId"   text references fms_fields(id) on delete cascade,
  category    text not null default '',
  title       text not null default '',
  description text not null default '',
  steps       jsonb not null default '[]'::jsonb
);

-- 9) CATATAN KEPUTUSAN
create table if not exists fms_decisions (
  id          text primary key,
  date        text not null default '',
  "seasonId"  text references fms_seasons(id) on delete cascade,
  "fieldId"   text references fms_fields(id) on delete cascade,
  title       text not null default '',
  context     text not null default '',
  decision    text not null default '',
  rationale   text not null default '',
  impact      text not null default 'medium',
  outcome     text,
  "decidedBy" text not null default ''
);

-- 10) PEMANTAUAN TANAMAN
create table if not exists "fms_cropMonitors" (
  id            text primary key,
  "seasonId"    text references fms_seasons(id) on delete cascade,
  "fieldId"     text references fms_fields(id) on delete cascade,
  week          integer not null default 0,
  date          text not null default '',
  "heightCm"    numeric not null default 0,
  "healthScore" numeric not null default 0,
  "pestRisk"    text not null default 'low',
  notes         text not null default ''
);

-- =====================================================================
-- ROW LEVEL SECURITY
--   * Baca (SELECT): publik / anon  -> showcase bisa dilihat siapa saja.
--   * Tulis (INSERT/UPDATE/DELETE): hanya user login (authenticated).
-- =====================================================================
do $$
declare
  t text;
  tables text[] := array[
    'fms_fields','fms_seasons','fms_activities','fms_expenses','fms_revenues',
    'fms_gallery','fms_reports','fms_practices','fms_decisions','fms_cropMonitors'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);

    execute format('drop policy if exists "public_read" on public.%I;', t);
    execute format('create policy "public_read" on public.%I for select using (true);', t);

    execute format('drop policy if exists "auth_insert" on public.%I;', t);
    execute format('create policy "auth_insert" on public.%I for insert to authenticated with check (true);', t);

    execute format('drop policy if exists "auth_update" on public.%I;', t);
    execute format('create policy "auth_update" on public.%I for update to authenticated using (true) with check (true);', t);

    execute format('drop policy if exists "auth_delete" on public.%I;', t);
    execute format('create policy "auth_delete" on public.%I for delete to authenticated using (true);', t);
  end loop;
end $$;
