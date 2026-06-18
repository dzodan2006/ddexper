/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Product, CartItem, Category } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Complaints = lazy(() => import('./pages/Complaints'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Contact = lazy(() => import('./pages/Contact'));
const Sale = lazy(() => import('./pages/Sale'));
const Categories = lazy(() => import('./pages/Categories'));
const NewCollection = lazy(() => import('./pages/NewCollection'));
const Collaborations = lazy(() => import('./pages/Collaborations'));
const Editorijali = lazy(() => import('./pages/Editorijali'));
const LepaISrecna = lazy(() => import('./pages/collaborations/LepaISrecna'));
const DDModnaPrica = lazy(() => import('./pages/collaborations/DDModnaPrica'));
const AndjelkaStevic = lazy(() => import('./pages/collaborations/AndjelkaStevic'));
const DraganaKosjerina = lazy(() => import('./pages/collaborations/DraganaKosjerina'));
const LjubicaKaradjordjevic = lazy(() => import('./pages/collaborations/LjubicaKaradjordjevic'));
const AleksandraPerisic = lazy(() => import('./pages/collaborations/AleksandraPerisic'));
const DraganaRadakovic = lazy(() => import('./pages/collaborations/DraganaRadakovic'));
const DraganaMicalovic = lazy(() => import('./pages/collaborations/DraganaMicalovic'));
const TamaraMisirlic = lazy(() => import('./pages/collaborations/TamaraMisirlic'));
const DajanaSvraka = lazy(() => import('./pages/collaborations/DajanaSvraka'));
const DanijelaPantic = lazy(() => import('./pages/collaborations/DanijelaPantic'));
const BelgradeFashionWeek = lazy(() => import('./pages/collaborations/BelgradeFashionWeek'));
const Admin = lazy(() => import('./pages/Admin'));


function FadingBackground() {
  const location = useLocation();
  const { theme } = useTheme();

  const images: Record<string, string> = {
    '/': "https://images.weserv.nl/?url=64.media.tumblr.com/cb6f36c302200c648bf44670ada2305e/2b7c3e65e62eb0d6-47/s2048x3072/f4675eb55ccda97da38e96bf2cedb7b947b917f0.jpg",
    '/shop': "https://images.weserv.nl/?url=64.media.tumblr.com/6d12019b559087745a3d1db1e01ebf6d/96ff0d2545ab50fb-5b/s2048x3072/10de0c48cbf4f18ed46249e525cb0dd9ebab8425.jpg",
    
    // Press specific background images (ONLY for the press section)
    '/saradnje': "https://images.weserv.nl/?url=64.media.tumblr.com/ee4b31ecf786d70664b9543ad1425c80/dce9263cc4f8b5b7-61/s2048x3072/98a7d5868f7f46dc540af884a18c4e23abd71911.jpg",
    '/saradnje/lepaisrecna': "https://images.weserv.nl/?url=64.media.tumblr.com/dc0a7d20577b87803d85bce68571034b/49bb5b10ceb26ae9-16/s2048x3072/a87374b39ff7b8e1f20918b6afa086d5bed72ce4.jpg",
    '/saradnje/dd-modna-prica': "https://images.weserv.nl/?url=64.media.tumblr.com/76dc2883adea11944da040a1a7847267/dce9263cc4f8b5b7-c2/s2048x3072/2ef0942ea8f8d24999eef396e48bafb91c41e9b6.jpg",
    '/saradnje/andjelka-stevic': "https://images.weserv.nl/?url=64.media.tumblr.com/1bfee187e0ca0398f18dda06df01f18d/dce9263cc4f8b5b7-3c/s2048x3072/1124c1cda5bfefee44bbf99bb73a68d8507e2a44.jpg",
    '/saradnje/dragana-kosjerina': "https://images.weserv.nl/?url=64.media.tumblr.com/890f7e197f51ea99ffa089f8d9c9a9ae/dce9263cc4f8b5b7-7b/s2048x3072/c224efc0f44e718917caabc814849f7a0c05eaf4.jpg",
    '/saradnje/ljubica-karadjordjevic': "https://images.weserv.nl/?url=64.media.tumblr.com/ee4b31ecf786d70664b9543ad1425c80/dce9263cc4f8b5b7-61/s2048x3072/98a7d5868f7f46dc540af884a18c4e23abd71911.jpg",
    '/saradnje/aleksandra-perisic': "https://images.weserv.nl/?url=64.media.tumblr.com/399513ff7549a952a3acdd8f65e50b67/dce9263cc4f8b5b7-78/s2048x3072/fc0d00d6a3e44d27b68b792710ec6b5837b65de6.jpg",
    '/saradnje/dragana-micalovic': "https://images.weserv.nl/?url=64.media.tumblr.com/6ca196db17bf36375f7b9a0ab4a310b8/dce9263cc4f8b5b7-61/s2048x3072/064fb37fa5581ab2516646d1c5c79c9c35b1fe58.jpg",
    '/saradnje/dajana-svraka': "https://images.weserv.nl/?url=64.media.tumblr.com/effe353d3bf33a5e79529f568d01627a/dce9263cc4f8b5b7-af/s2048x3072/626cb32846e8056a1dcaf9bf058e53c2317e5138.jpg",
    '/saradnje/danijela-pantic': "https://images.weserv.nl/?url=64.media.tumblr.com/5a9a9c8275d2e2e09baa013f341cfff0/dce9263cc4f8b5b7-53/s2048x3072/a4c625ab22a8d6069430de77bc01643618fa3d79.jpg"
  };

  const isPressPage = location.pathname.startsWith('/saradnje');

  // Avoid using press/collaboration images for general views
  const bgImage = isPressPage 
    ? (images[location.pathname] || images['/saradnje'])
    : (location.pathname === '/shop' ? images['/shop'] : images['/']);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: theme === 'dark' ? 0.14 : 0.09 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-full h-full"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: theme === 'dark' ? 'grayscale(100%) brightness(0.6)' : 'grayscale(100%) contrast(1.1)',
          }}
        />
      </AnimatePresence>
      {/* Light theme gradient overlay shadow */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/75 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: theme === 'dark' ? 0 : 1 }}
      />
      {/* Dark theme gradient overlay shadow */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#000000]/60 via-[#000000]/10 to-[#000000]/75 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: theme === 'dark' ? 1 : 0 }}
      />
    </div>
  );
}

// Custom SEO and JSON-LD schema builder to MAX SEO & Best practices
function useSEO() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const seoData: Record<string, Record<string, { title: string; desc: string; keywords: string }>> = {
      'sr': {
        '/': {
          title: 'DD Design | Unikatne Kreacije & Luksuzna Moda',
          desc: 'Unikatni modni komadi, kaputi, luksuzna odela i ekskluzivne haljine od najfinije taft svile. Dizajn Danijele Gojković koji slavi autentičnost.',
          keywords: 'dd design, danijela gojkovic, taft svila, modni kutak, unikatne haljine, kaputi srbija'
        },
        '/shop': {
          title: 'Prodavnica | Luksuzni Modni Komadi | DD Design',
          desc: 'Istražite našu kolekciju unikatnih haljina, luksuznih odela, brendiranih sakoa i ručno šivenih kaputa. Sigurna kupovina online.',
          keywords: 'kupovina haljina, zenska odela, taft svilene suknje, mantili unikatni, rucni rad'
        },
        '/editorijali': {
          title: 'Umetnički Digitalni Editorijal | Taft Svila | DD Design',
          desc: 'Zavirite u digitalni časopis brenda DD Design. Ekskluzivne priče o luksuznoj teksturi taft svile, stilski predlozi, estetične rečenice i storytelling.',
          keywords: 'taft svila, luksuzna svila, šušti haljina, modni editorijal, haljine od taft svile, srbija sako svila'
        },
        '/saradnje': {
          title: 'Press & Saradnje | Danijela Gojković u Medijima',
          desc: 'Zabeleženi trenuci rada brenda DD Design. Pogledajte prikaze u vodećim magazinima, intervjue i priče sa naslovnih strana.',
          keywords: 'lepa i srecna dddesign, milos nadazdin, andjelka stevic haljina'
        }
      },
      'en': {
        '/': {
          title: 'DD Design | Unique Handcrafted Creations & Luxury Fashion',
          desc: 'Unique designer pieces, coats, luxury suits, and exclusive dresses crafted from pure taffeta silk. Experience high-end fashion design by Danijela Gojković.',
          keywords: 'dd design wardrobe, danijela gojkovic, taffeta silk gown, unique fashion brand'
        },
        '/shop': {
          title: 'Boutique Shop | Luxury Collection | DD Design',
          desc: 'Explore or buy handcrafted designer coats, tailored suits, evening gowns, and limited silk pieces. Premium packaging and fast worldwide delivery.',
          keywords: 'exclusive online boutique, buy hand-stitched coat, designer evening dresses'
        },
        '/editorijali': {
          title: 'Digital Editorials | Art of Taffeta Silk | DD Design',
          desc: 'The official digital fashion magazine of DD Design. Immersive visual storytelling, styling guides, and premium thoughts on taffeta silk texture.',
          keywords: 'taffeta silk texture, luxury editorials, high couture europe'
        },
        '/saradnje': {
          title: 'Press & Collaborations | DD Design in the Spotlight',
          desc: 'Official featured publications, covers, and editorials with top celebrities and premium magazines highlighting our artistic range.',
          keywords: 'fashion brand tv appearances, design portfolio'
        }
      },
      'ru': {
        '/': {
          title: 'DD Design | Лимитированные Дизайнерские Вещи и Эксклюзивный Шелк',
          desc: 'Авторские пальто, роскошные костюмы и платья из благородной шелковой тафты от дизайнера Даниелы Гойкович. Высокий уровень женственности.',
          keywords: 'дизайнерская одежда сербия, Даниела Гойкович, шелковая тафта, купить пальто белград'
        },
        '/shop': {
          title: 'Магазин | Премиум Коллекция Одежды | DD Design',
          desc: 'Купить уникальные вечерние платья, элегантные костюмы и пальто ручной работы. Быстрая доставка, превосходное качество пошива.',
          keywords: 'купить платье у дизайнера, шелк тафта юбка, брендовые пиджаки'
        },
        '/editorijali': {
          title: 'Модный Редакция | Искусство и Шелковая Тафта | DD Design',
          desc: 'Официальный интерактивный журнал DD Design. Художественные съемки в замках, истории создания коллекций из тафты и гиды по стилю.',
          keywords: 'шелковая тафта, обзоры моды, эксклюзивные платья кокон'
        },
        '/saradnje': {
          title: 'Пресса и Сотрудничество | Бренд DD Design в Медиа',
          desc: 'Сюжеты из ведущих глянцевых изданий, обложки журналов и репортажи о наших показах с известными медиа-персонами.',
          keywords: 'коллаборации брендов, пресса мода'
        }
      }
    };

    const currentLangData = seoData[language] || seoData['sr'];
    const currentRouteData = currentLangData[location.pathname] || {
      title: 'DD Design | Haute Couture',
      desc: 'Unikatni krojeni modeli visokog kvaliteta koji spajaju bezvremensku klasiku i savremenost.',
      keywords: 'dd design, haute couture, srpski dizajneri'
    };

    document.title = currentRouteData.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', currentRouteData.desc);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', currentRouteData.keywords);

    let schemaScript = document.getElementById('jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }
    schemaScript = document.createElement('script');
    schemaScript.id = 'jsonld-schema';
    schemaScript.setAttribute('type', 'application/ld+json');

    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": "DD Design Atelier",
      "url": window.location.origin,
      "image": "https://images.weserv.nl/?url=64.media.tumblr.com/85a2897f98a2b096033b5b7b2baa4305/941158d434c8785d-07/s1280x1920/1770317d73e6ae1e7a6940ed7119efd4f78c57ce.jpg",
      "description": currentRouteData.desc,
      "brand": {
        "@type": "Brand",
        "name": "DD Design",
        "slogan": "Unikatni i bezvremeni dizajn koji slavi snažan karakter i suptilnu ženstvenost"
      }
    };
    schemaScript.innerHTML = JSON.stringify(schemaOrg);
    document.head.appendChild(schemaScript);

  }, [location.pathname, language]);
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { theme } = useTheme();
  useSEO(); // Run dynamic SEO optimization on route change

  
  // Inicijalizacija stanja iz localStorage (keša) ako postoji
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('dd_products_cache_v4');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const cached = localStorage.getItem('dd_categories_cache_v4');
    return cached ? JSON.parse(cached) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('dd_cart_cache');
    return cached ? JSON.parse(cached) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(products.length === 0); // Ako imamo keširane proizvode, nemoj prikazivati spinner

  // Sačuvaj korpu u localStorage pri svakoj promeni
  useEffect(() => {
    localStorage.setItem('dd_cart_cache', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Osvežavam podatke iz baze...");

        // Dohvati kategorije
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*");
        
        if (catData) {
          setCategories(catData);
          localStorage.setItem('dd_categories_cache_v4', JSON.stringify(catData));
        }

        // Dohvati proizvode
        let data: any = null;
        let error: any = null;

        const queryOptions = [
          // Opcija 1: lowercase product_colors i lowercase colors (sa Color/color poljem)
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            product_colors (
              colors (
                id,
                Color,
                color
              )
            )
          `,
          // Opcija 2: Velika slova Product_colors i Colors (sa Color poljem)
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            Product_colors (
              Colors (
                id,
                Color
              )
            )
          `,
          // Opcija 3: mala slova product_colors sa velikim Colors
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            product_colors (
              Colors (
                id,
                Color
              )
            )
          `,
          // Opcija 4: Velika slova Product_colors sa malim colors
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            ),
            Product_colors (
              colors (
                id,
                color
              )
            )
          `,
          // Opcija 5: Bez boja ako ništa od ovoga ne prođe
          `
            id,
            name,
            description,
            price,
            discount_price,
            stock,
            is_active,
            category_id,
            new_collection,
            categories:category_id (
              name,
              Id
            ),
            product_images (
              id,
              image_url,
              image_url2,
              image_url3,
              image_url4,
              image_url5,
              is_main
            ),
            product_sizes (
              sizes (
                id,
                name
              )
            )
          `
        ];

        for (let i = 0; i < queryOptions.length; i++) {
          const res = await supabase
            .from("products")
            .select(queryOptions[i]);

          if (!res.error) {
            data = res.data;
            error = null;
            break;
          } else {
            error = res.error;
          }
        }

        if (data && !error) {
          const mappedProducts: Product[] = data.map((product: any) => {
            const categoryName = product.categories?.name || 'Ostalo';
            const sizes = product.product_sizes?.map((ps: any) => ps.sizes).filter(Boolean) || [];
            
            const rawColors = product.product_colors || product.Product_colors || [];
            const colors = rawColors.map((pc: any) => {
              const colorObj = pc.colors || pc.Colors;
              if (!colorObj) return null;
              return {
                id: colorObj.id,
                name: colorObj.Color || colorObj.color || colorObj.name || ''
              };
            }).filter(Boolean) || [];
            
            const allImages: string[] = [];
            if (product.product_images && product.product_images.length > 0) {
              product.product_images.forEach((img: any) => {
                if (img.image_url) allImages.push(img.image_url);
                if (img.image_url2) allImages.push(img.image_url2);
                if (img.image_url3) allImages.push(img.image_url3);
                if (img.image_url4) allImages.push(img.image_url4);
                if (img.image_url5) allImages.push(img.image_url5);
              });
            }
            
            const uniqueImages = Array.from(new Set(allImages)).filter(Boolean);

            return {
              id: String(product.id),
              name: product.name,
              description: product.description,
              price: Number(product.price),
              discount_price: product.discount_price
                ? Number(product.discount_price)
                : null,
              stock: product.stock,
              is_active: product.is_active,
              category_id: product.category_id,
              category: categoryName,
              new_collection: product.new_collection,
              sizes: sizes,
              colors: colors,
              all_images: uniqueImages,
              image_url:
                product.product_images?.find(
                  (img: any) => img.is_main === true
                )?.image_url ||
                uniqueImages[0] ||
                "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800"
            };
          }).filter((p: Product) => p.is_active !== false); // Ne prikazuj proizvode ako im je vrednost is_active false

          setProducts(mappedProducts);
          // Sačuvaj osvežene proizvode u keš
          localStorage.setItem('dd_products_cache_v4', JSON.stringify(mappedProducts));
        }
      } catch (err) {
        console.error("Greška pri dohvatanju:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize, selectedColor }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => prev.map(item => 
      (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className={`fixed inset-0 z-0 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#000000]' : 'bg-white'
      }`} />
      <ScrollToTop />
      <Navbar products={products} cartCount={cartCount} onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      <FadingBackground />
      <div className={`min-h-screen font-sans transition-colors duration-500 flex flex-col relative z-10 bg-transparent ${
        theme === 'dark' 
          ? 'text-white selection:bg-white selection:text-black' 
          : 'text-gray-900 selection:bg-black selection:text-white'
      }`}>
        <main className="flex-1 pt-16">
          <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-zinc-500 animate-spin rounded-full" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home products={products} categories={categories} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/shop" element={<Shop products={products} categories={categories} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/product/:id" element={<ProductDetails products={products} onAddToCart={addToCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
              <Route path="/reklamacije" element={<Complaints />} />
              <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
              <Route path="/uslovi-koriscenja" element={<TermsOfService />} />
              <Route path="/kontakt" element={<Contact />} />
              <Route path="/snizenja" element={<Sale products={products} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/kategorije" element={<Categories categories={categories} products={products} loading={loading} />} />
              <Route path="/nova-kolekcija" element={<NewCollection products={products} loading={loading} onAddToCart={addToCart} />} />
              <Route path="/editorijali" element={<Editorijali />} />
              <Route path="/saradnje" element={<Collaborations />} />
              <Route path="/saradnje/lepaisrecna" element={<LepaISrecna />} />
              <Route path="/saradnje/dd-modna-prica" element={<DDModnaPrica />} />
              <Route path="/saradnje/andjelka-stevic" element={<AndjelkaStevic />} />
              <Route path="/saradnje/dragana-kosjerina" element={<DraganaKosjerina />} />
              <Route path="/saradnje/ljubica-karadjordjevic" element={<LjubicaKaradjordjevic />} />
              <Route path="/saradnje/aleksandra-perisic" element={<AleksandraPerisic />} />
              <Route path="/saradnje/dragana-radakovic" element={<DraganaRadakovic />} />
              <Route path="/saradnje/dragana-micalovic" element={<DraganaMicalovic />} />
              <Route path="/saradnje/tamara-misirlic" element={<TamaraMisirlic />} />
              <Route path="/saradnje/dajana-svraka" element={<DajanaSvraka />} />
              <Route path="/saradnje/danijela-pantic" element={<DanijelaPantic />} />
              <Route path="/saradnje/belgrade-fashion-week" element={<BelgradeFashionWeek />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
        </main>
        <footer className={`pt-24 pb-12 border-t mt-auto transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="space-y-6">
                <span className={`text-2xl font-bold tracking-tighter uppercase transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>DD DESIGN</span>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} text-sm leading-relaxed`}>
                  DD DESIGN je vaš izvor za moderni dizajn i vrhunsku kvalitetu. Svaki proizvod je pažljivo odabran.
                </p>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com/dddesign.rs" target="_blank" rel="noopener noreferrer" className={`${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}>
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://www.facebook.com/dddesign.rs/" target="_blank" rel="noopener noreferrer" className={`${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}>
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-widest mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Proizvodi</h4>
                <ul className={`space-y-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <li><Link to="/shop" className="hover:text-current transition-colors">Svi proizvodi</Link></li>
                  <li><Link to="/nova-kolekcija" className="hover:text-current transition-colors">Nova kolekcija</Link></li>
                  <li><Link to="/editorijali" className="hover:text-current transition-colors">Editorijali</Link></li>
                  <li><Link to="/saradnje" className="hover:text-current transition-colors">Press</Link></li>
                  <li><Link to="/snizenja" className="hover:text-current transition-colors">Sniženja</Link></li>
                  <li><Link to="/kategorije" className="hover:text-current transition-colors">Kategorije</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={`font-bold text-sm uppercase tracking-widest mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Informacije</h4>
                <ul className={`space-y-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <li><Link to="/saradnje/dd-modna-prica" className="hover:text-current transition-colors">O nama</Link></li>
                  <li><Link to="/kontakt" className="hover:text-current transition-colors">Kontakt</Link></li>
                  <li><Link to="/reklamacije" className="hover:text-current transition-colors">Reklamacije i prigovori</Link></li>
                  <li><Link to="/politika-privatnosti" className="hover:text-current transition-colors">Politika privatnosti</Link></li>
                  <li><Link to="/uslovi-koriscenja" className="hover:text-current transition-colors">Uslovi korišćenja</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={`font-bold text-sm uppercase tracking-widest mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Newsletter</h4>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} text-sm mb-6`}>Pretplatite se za novosti i posebne ponude.</p>
                <form className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="E-mail adresa" 
                    className={`${
                      theme === 'dark' 
                        ? 'bg-[#1a1a1a] border-zinc-800 text-white focus:border-white' 
                        : 'bg-white border-gray-200 text-black focus:border-black'
                    } border px-4 py-3 rounded-xl text-sm w-full focus:outline-none transition-colors`}
                  />
                  <button className={`${
                    theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-800'
                  } px-6 py-3 rounded-xl transition-all font-bold text-sm`}>
                    OK
                  </button>
                </form>
              </div>
            </div>
            
            <div className={`pt-12 border-t space-y-8 ${
              theme === 'dark' ? 'border-zinc-900 text-zinc-500' : 'border-gray-200 text-gray-400'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Bank Partner & Explanation */}
                <div className="text-center md:text-left space-y-2">
                  <p className={`font-semibold text-xs tracking-wider uppercase ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                    Kartično plaćanje omogućila Raiffeisen Banka
                  </p>
                  <p className="max-w-md text-xs leading-relaxed">
                    Sva plaćanja platnim karticama se vrše preko sigurnog sistema Raiffeisen Banke, uz punu primenu 3D Secure bezbednosnih standarda.
                  </p>
                </div>
                
                {/* Bank Logo */}
                <div className="flex items-center">
                  <a 
                    href="https://www.raiffeisenbank.rs" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <img 
                      src={theme === 'dark' 
                        ? "https://64.media.tumblr.com/c1584ae68b2f48317cbd88238bd874ad/be374ee1549e32c7-66/s2048x3072/afb06bfe59086f121fd16817657251752c802f5f.pnj" 
                        : "https://64.media.tumblr.com/3630fb26e86214e277bfa6c46dd176e7/be374ee1549e32c7-96/s2048x3072/94b3386d70a1b82f1f8bc8f64a4e4ab540cbc73d.pnj"
                      } 
                      alt="Raiffeisen Banka" 
                      className="h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </a>
                </div>
              </div>

              {/* Logos row containing Accepted Cards and 3D Secure Protection, properly separated */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-zinc-900/5 dark:border-zinc-900/40">
                {/* Section A: Accepted Cards */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 dark:text-zinc-500">
                    Prihvatamo platne kartice:
                  </span>
                  <div className="flex items-center gap-4">
                    <img 
                      src={theme === 'dark'
                        ? "https://64.media.tumblr.com/50b921f4fb3be41ec9b3fca5c71063dd/be374ee1549e32c7-fe/s400x600/bfa46d7af96b5e56171240f4c72e17c2afc5bf2e.pnj"
                        : "https://64.media.tumblr.com/6f9301afac67cf4d471a4a64f7bf213d/be374ee1549e32c7-3f/s400x600/4428685ad1cb542fd18244721435056416cbeca8.pnj"
                      } 
                      alt="Visa, MasterCard, DinaCard" 
                      className="h-8 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Section B: 3D Secure Programs (Visa Secure and MasterCard Identity Check) */}
                <div className="flex flex-col items-center md:items-end gap-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 dark:text-zinc-500">
                    Bezbedna kupovina (3D Secure Programi):
                  </span>
                  <div className="flex items-center gap-6">
                    <a 
                      href="https://rs.visa.com/run-your-business/small-business-tools/payment-technology/visa-secure.html"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src="https://64.media.tumblr.com/f7790a9a5b8145f326c457f03eb2fc23/be374ee1549e32c7-cd/s250x400/2d1802a688b5228d5a91594dc2175fae2aa99e2d.pnj" 
                        alt="Visa Secure" 
                        className="h-8 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                    <a 
                      href="https://www.mastercard.rs/sr-rs/korisnici/podrska/sigurnost-i-zastita/identity-check.html"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src={theme === 'dark'
                          ? "https://64.media.tumblr.com/fa0e2cbbf2063ba977d0cffb0907eec4/be374ee1549e32c7-d9/s2048x3072/58da21de1a7a2c1740a5885ee6b7ed5d99bf2b2c.pnj"
                          : "https://64.media.tumblr.com/b69c1fd18e808fa9977ef1bdec1965d6/be374ee1549e32c7-89/s2048x3072/fdc7ee611bd3c042becbd04b3870e56ecd9f93a8.pnj"
                        } 
                        alt="MasterCard Identity Check" 
                        className="h-8 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                  </div>
                </div>
              </div>

              {/* Copyright Row */}
              <div className="flex flex-col md:flex-row justify-between items-center text-xs pt-4 border-t border-zinc-900/5 dark:border-zinc-900/40">
                <p>© 2026 DD DESIGN. Sva prava pridržana.</p>
              </div>
            </div>
          </div>
        </footer>

        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />
        <CookieConsent />
      </div>
    </>
  );
}
