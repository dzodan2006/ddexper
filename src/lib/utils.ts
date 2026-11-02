import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImageUrl(url: string | undefined | null, width?: number, quality = 75): string {
  if (!url) return '';
  
  // Normalize Unsplash images
  if (url.includes('images.unsplash.com')) {
    const parts = url.split('?');
    const baseUrl = parts[0];
    const params = new URLSearchParams(parts[1] || '');
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('fm', 'webp');
    return `${baseUrl}?${params.toString()}`;
  }

  // Optimize and clean images through images.weserv.nl proxy
  if (url.includes('images.weserv.nl')) {
    try {
      const match = url.match(/[?&]url=([^&]+)/);
      if (match) {
        const originalUrl = decodeURIComponent(match[1]);
        const cleanUrl = `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`;
        const extra = `${width ? `&w=${width}` : ''}&q=${quality}&output=webp`;
        return `${cleanUrl}${extra}`;
      }
    } catch {
      // ignore decoding issue
    }
    return `${url}${width ? `&w=${width}` : ''}&q=${quality}&output=webp`;
  }

  // Proxy normal remote images safely
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const cleanUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    const extra = `${width ? `&w=${width}` : ''}&q=${quality}&output=webp`;
    return `${cleanUrl}${extra}`;
  }

  return url;
}

/**
 * Normalizes product prices to clean integer RSD amounts for Google Search indexing & display.
 * Resolves the issue where prices like "18.000" or raw 18 (from dot separator misinterpretation)
 * appear as 18 instead of 18.000 RSD on Google Search and Rich Snippets.
 */
export function normalizePrice(raw: any): number {
  if (raw === null || raw === undefined || raw === '') return 0;

  if (typeof raw === 'number') {
    if (isNaN(raw)) return 0;
    // In DD DESIGN luxury silk garments (haute couture, suits, gowns, coats),
    // pieces cost between 4.000 RSD and 120.000 RSD.
    // If a price is <= 500 and > 0 (e.g. 18, 33.6, 28.8), it was entered with a dot separator
    // that JavaScript or the database parsed as a decimal rather than thousands.
    if (raw > 0 && raw < 500) {
      return Math.round(raw * 1000);
    }
    return Math.round(raw);
  }

  const str = String(raw).trim();
  if (!str) return 0;

  // Clean out currency texts and spaces: "18.000 RSD" -> "18.000"
  const cleaned = str.replace(/\s+/g, '').replace(/[^\d.,]/g, '');

  // Handle European thousands dot separator (e.g. "18.000" or "33.700")
  if (cleaned.includes('.') && !cleaned.includes(',')) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      // Exactly 3 digits after dot -> thousands separator!
      return parseInt(parts[0] + parts[1], 10);
    } else if (parts.length > 2) {
      return parseInt(parts.join(''), 10);
    }
  }

  // Remove dots and convert comma to dot for parsing
  const standardNumeric = cleaned.replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(standardNumeric);
  if (isNaN(num)) return 0;

  if (num > 0 && num < 500) {
    return Math.round(num * 1000);
  }
  return Math.round(num);
}
