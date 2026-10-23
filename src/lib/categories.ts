import { Category, Product } from '../types';

/**
 * Zvanične slike za kategorije ("Istražite po kategorijama")
 */
export const CATEGORY_CUSTOM_IMAGES: Record<string, string> = {
  haljine: 'https://64.media.tumblr.com/cc453752475cde88dc8c4a1e86db681b/4eaf65ab9dd6a06b-11/s2048x3072/a56655804ced162678b584cce95de8578b25affa.jpg',
  'odela/kompleti': 'https://64.media.tumblr.com/cff1ac66a2099dd6ba0c1b509060c131/4eaf65ab9dd6a06b-e6/s2048x3072/c7e95c8abe86ee1ff6cf03a73de0a66dfc56c5e8.jpg',
  kombinezoni: 'https://64.media.tumblr.com/af5e5ba9be374eb1e6deff990f3b755e/4eaf65ab9dd6a06b-ce/s2048x3072/a1580d871ba400f3703b3d056aca7cc623470318.jpg',
  'majice/košulje': 'https://64.media.tumblr.com/1359190c56a1f99d3b883f35499aafc2/4eaf65ab9dd6a06b-3c/s2048x3072/c179814048cddb262be5aaac7ac414eb8dabf90e.jpg',
  'pantalone/suknje': 'https://64.media.tumblr.com/170819dee132285fe4112d31b961b0e0/4eaf65ab9dd6a06b-39/s2048x3072/917c9391526dc0ce1ff061b46fabb0d1f5d25fc3.jpg',
};

/**
 * Prioritetni redosled kategorija:
 * 1. Haljine
 * 2. Odela/kompleti
 * 3. Kombinezoni
 * 4. Košulje/majice
 * 5. Pantalone/suknje
 * 6. Kaputi (kaputi/mantili)
 */
export function getCategoryOrderIndex(cat: { name?: string; Id?: string | number }): number {
  const norm = (cat?.name || '').toLowerCase().trim();
  const id = String(cat?.Id || '');

  // 1. Haljine
  if (norm.includes('haljin') || id === '3') return 1;
  // 2. Odela/kompleti
  if (norm.includes('odel') || norm.includes('komplet') || id === '2') return 2;
  // 3. Kombinezoni
  if (norm.includes('kombinezon') || id === '4') return 3;
  // 4. Košulje/majice
  if (norm.includes('košulj') || norm.includes('kosulj') || norm.includes('majic') || id === '5') return 4;
  // 5. Pantalone/suknje
  if (norm.includes('pantalon') || norm.includes('suknj') || id === '6') return 5;
  // 6. Kaputi
  if (norm.includes('kaput') || norm.includes('mantil') || id === '1') return 6;

  return 99;
}

/**
 * Sortira niz kategorija prema definisanom redosledu ili sačuvanom rasporedu
 */
export function sortCategories<T extends { name?: string; Id?: string | number }>(categories: T[], customOrder?: (string | number)[]): T[] {
  if (!categories || !Array.isArray(categories)) return [];

  let orderList = customOrder;
  if (!orderList && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('dd_category_order');
      if (cached) orderList = JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  if (Array.isArray(orderList) && orderList.length > 0) {
    const orderMap = new Map<string, number>();
    orderList.forEach((item, idx) => {
      orderMap.set(String(item).toLowerCase().trim(), idx);
    });

    return [...categories].sort((a, b) => {
      const idA = String(a.Id ?? (a as any).id ?? '').toLowerCase().trim();
      const idB = String(b.Id ?? (b as any).id ?? '').toLowerCase().trim();
      const nameA = (a.name || '').toLowerCase().trim();
      const nameB = (b.name || '').toLowerCase().trim();

      const rankA = orderMap.has(idA) ? orderMap.get(idA)! : (orderMap.has(nameA) ? orderMap.get(nameA)! : getCategoryOrderIndex(a) + 100);
      const rankB = orderMap.has(idB) ? orderMap.get(idB)! : (orderMap.has(nameB) ? orderMap.get(nameB)! : getCategoryOrderIndex(b) + 100);

      return rankA - rankB;
    });
  }

  return [...categories].sort((a, b) => getCategoryOrderIndex(a) - getCategoryOrderIndex(b));
}

/**
 * Sortira niz proizvoda prema sačuvanom korisničkom redosledu
 */
export function sortProductsByCustomOrder<T extends { id: string | number }>(products: T[], customOrder?: (string | number)[]): T[] {
  if (!products || !Array.isArray(products)) return [];

  let orderList = customOrder;
  if (!orderList && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('dd_product_order');
      if (cached) orderList = JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  if (!Array.isArray(orderList) || orderList.length === 0) {
    return products;
  }

  const orderMap = new Map<string, number>();
  orderList.forEach((id, idx) => {
    orderMap.set(String(id), idx);
  });

  return [...products].sort((a, b) => {
    const idA = String(a.id);
    const idB = String(b.id);
    const rankA = orderMap.has(idA) ? orderMap.get(idA)! : 999999;
    const rankB = orderMap.has(idB) ? orderMap.get(idB)! : 999999;
    return rankA - rankB;
  });
}

/**
 * Vraća sliku za kategoriju:
 * - Koristi definisanu sliku ukoliko postoji
 * - Za Kapute (ili bilo koju bez eksplicitne slike) koristi postojeću sliku proizvoda
 */
export function getCategoryImage(category: { name?: string; Id?: string | number }, products: Product[] = []): string {
  const norm = (category?.name || '').toLowerCase().trim();
  const id = String(category?.Id || '');

  // 1. Haljine
  if (norm.includes('haljin') || id === '3') {
    return CATEGORY_CUSTOM_IMAGES.haljine;
  }
  // 2. Odela / kompleti
  if (norm.includes('odel') || norm.includes('komplet') || id === '2') {
    return CATEGORY_CUSTOM_IMAGES['odela/kompleti'];
  }
  // 3. Kombinezoni
  if (norm.includes('kombinezon') || id === '4') {
    return CATEGORY_CUSTOM_IMAGES.kombinezoni;
  }
  // 4. Košulje / majice
  if (norm.includes('košulj') || norm.includes('kosulj') || norm.includes('majic') || id === '5') {
    return CATEGORY_CUSTOM_IMAGES['majice/košulje'];
  }
  // 5. Pantalone / suknje
  if (norm.includes('pantalon') || norm.includes('suknj') || id === '6') {
    return CATEGORY_CUSTOM_IMAGES['pantalone/suknje'];
  }

  // 6. Kaputi / mantili (kaputi za sad nemaju novu sliku): preuzima sliku proizvoda (npr. Kaput Calista)
  const categoryProduct = products.find(p => String(p.category_id) === id || p.category?.toLowerCase() === norm);
  return categoryProduct?.image_url || 'https://64.media.tumblr.com/cb6f36c302200c648bf44670ada2305e/2b7c3e65e62eb0d6-47/s2048x3072/f4675eb55ccda97da38e96bf2cedb7b947b917f0.jpg';
}
