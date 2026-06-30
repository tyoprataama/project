import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CATATAN DEPLOY (GitHub Pages):
// - App ini dideploy ke sub-path: https://<username>.github.io/project/
// - Maka base produksi = "/project/". Untuk dev lokal tetap "/".
// - basename React Router di main.tsx otomatis mengikuti import.meta.env.BASE_URL.
// - Jika nama repo/sub-path berubah, cukup ubah PROJECT_BASE di bawah.
const PROJECT_BASE = "/project/";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? PROJECT_BASE : "/",
}));
