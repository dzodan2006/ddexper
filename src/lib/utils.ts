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
