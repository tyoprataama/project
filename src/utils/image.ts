// Kompres & resize gambar di browser pakai Canvas (tanpa library tambahan).
// Mengembalikan File JPEG yang jauh lebih kecil dari aslinya.
export async function compressImage(
  file: File,
  opts: { maxDimension?: number; quality?: number; maxBytes?: number } = {},
): Promise<File> {
  const { maxDimension = 1280, quality = 0.8, maxBytes = 1_000_000 } = opts;

  const dataUrl = await fileToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  // Jaga rasio, batasi sisi terpanjang ke maxDimension
  let { width, height } = img;
  if (width >= height && width > maxDimension) {
    height = Math.round((height * maxDimension) / width);
    width = maxDimension;
  } else if (height > width && height > maxDimension) {
    width = Math.round((width * maxDimension) / height);
    height = maxDimension;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  // Turunkan quality bertahap sampai <= maxBytes
  let q = quality;
  let blob = await canvasToBlob(canvas, q);
  while (blob && blob.size > maxBytes && q > 0.4) {
    q -= 0.1;
    blob = await canvasToBlob(canvas, q);
  }
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Ubah link "share" Google Drive jadi URL yang bisa dirender <img>.
// Inilah penyebab gambar Drive-mu tidak tampil sebelumnya.
export function normalizeImageUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  const m = u.match(/\/file\/d\/([^/]+)/) || u.match(/[?&]id=([^&]+)/);
  if (u.includes("drive.google.com") && m) {
    return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;
  }
  return u;
}