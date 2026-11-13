// ============================================================================
// UTILIDADES GENERALES
// ============================================================================
import type { JobPosting } from './types';

/** UUID v4 (crypto.randomUUID cuando existe; respaldo seguro con getRandomValues). */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Deja solo dígitos y quita el indicativo +57 si viene incluido. */
export function normalizePhone(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  return digits;
}

/** Celular colombiano: 10 dígitos que empiezan por 3. */
export function isValidColombianMobile(digits: string): boolean {
  return /^3\d{9}$/.test(digits);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Fecha local de hoy en formato YYYY-MM-DD (evita desfases por zona horaria de toISOString). */
export function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Suma días a hoy y devuelve YYYY-MM-DD. */
export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Una vacante está abierta si su estado es "abierta" y no ha vencido su fecha de cierre. */
export function isJobOpen(job: Pick<JobPosting, 'status' | 'closingDate'>): boolean {
  return job.status === 'abierta' && (!job.closingDate || job.closingDate >= todayISO());
}

export function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_INPUT_IMAGE_MB = 10;
export const MAX_STORED_IMAGE_KB = 2048;

function loadImageElement(file: File): Promise<{ img: HTMLImageElement; revoke: () => void }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, revoke: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen. Prueba con otra fotografía (JPG, PNG o WEBP).'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo optimizar la imagen.'))),
      'image/jpeg',
      quality
    );
  });
}

/**
 * Reduce la fotografía a un JPEG de máximo 1280 px y menos de 2 MB
 * para que cargue rápido en celulares y cumpla la regla file_size_kb <= 2048.
 */
export async function compressImage(
  file: File
): Promise<{ blob: Blob; sizeKB: number; format: 'image/jpeg' }> {
  const { img, revoke } = await loadImageElement(file);
  try {
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Tu navegador no permite procesar imágenes.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let blob = await canvasToBlob(canvas, 0.82);
    for (const quality of [0.7, 0.55, 0.4]) {
      if (blob.size / 1024 <= MAX_STORED_IMAGE_KB) break;
      blob = await canvasToBlob(canvas, quality);
    }
    const sizeKB = Math.max(1, Math.round(blob.size / 1024));
    if (sizeKB > MAX_STORED_IMAGE_KB) {
      throw new Error('La imagen sigue pesando más de 2 MB después de optimizarla. Usa una más pequeña.');
    }
    return { blob, sizeKB, format: 'image/jpeg' };
  } finally {
    revoke();
  }
}
