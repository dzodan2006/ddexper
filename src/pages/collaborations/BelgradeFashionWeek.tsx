import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Quote, Star, ArrowRight, Sparkles, ShoppingBag, Eye, X, ZoomIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { optimizeImageUrl } from '../../lib/utils';

interface BelgradeFashionWeekProps {
  products?: Product[];
  onAddToCart?: (product: Product, selectedSize?: string, selectedColor?: string) => void;
}

const BFW_COVER_IMAGE = "https://64.media.tumblr.com/0812bcdf2faa71a33f222fe226422c40/0d7527b57eae372d-e3/s1280x1920/111704562e537f25ada5d008c1cba6efa57880ab.jpg";

export default function BelgradeFashionWeek({ products = [], onAddToCart }: BelgradeFashionWeekProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'new' | 'dresses' | 'suits'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  // If products prop is empty, try loading cached products from localStorage
  useEffect(() => {
    if (products && products.length > 0) {
      setLocalProducts(products);
      return;
    }
    try {
      const cached = localStorage.getItem('dd_products_cache_v5') || localStorage.getItem('dd_products_cache_v4');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocalProducts(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [products]);

  // Curate products for the showcase
  const displayedProducts = useMemo(() => {
    if (!localProducts || localProducts.length === 0) return [];

    let filtered = [...localProducts].filter(p => p.is_active !== false);

    if (selectedCategoryFilter === 'new') {
      filtered = filtered.filter(p => p.new_collection);
      if (filtered.length === 0) filtered = localProducts.slice(0, 4);
    } else if (selectedCategoryFilter === 'dresses') {
      filtered = filtered.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes('haljin') || desc.includes('haljin') || name.includes('svil') || desc.includes('svil');
      });
      if (filtered.length === 0) filtered = localProducts.slice(0, 4);
    } else if (selectedCategoryFilter === 'suits') {
      filtered = filtered.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes('odel') || desc.includes('odel') || name.includes('komplet') || desc.includes('komplet') || name.includes('sako') || name.includes('kaput') || name.includes('mantil');
      });
      if (filtered.length === 0) filtered = localProducts.slice(0, 4);
    }

    // Default: show up to 8 items
    return filtered.slice(0, 8);
  }, [localProducts, selectedCategoryFilter]);

  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    if (onAddToCart) {
      onAddToCart(product, size, color);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-500 overflow-x-hidden bg-transparent">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button 
          onClick={() => navigate('/saradnje')}
          className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            theme === 'dark' ? 'text-zinc-600 hover:text-white' : 'text-gray-400 hover:text-black'
          }`}
          id="back-to-collaborations-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Nazad na press</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Column 1: Elegant Sticky Sidebar Image */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[3/4.5] rounded-[3rem] overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer"
              id="bfw-hero-image-wrapper"
              onClick={() => setLightboxOpen(true)}
            >
              <img 
                src={BFW_COVER_IMAGE} 
                alt="Belgrade Fashion Week Runway Review" 
                className="w-full h-full object-cover object-top opacity-95 group-hover:scale-[1.03] transition-all duration-1000 ease-out"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('weserv.nl')) {
                    target.src = optimizeImageUrl(BFW_COVER_IMAGE, 1200);
                  }
                }}
                id="bfw-hero-img"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/20">
                  <ZoomIn className="w-3.5 h-3.5" /> Uvećaj sliku
                </span>
              </div>
            </motion.div>
            
            <div className={`flex flex-col items-center text-center p-8 rounded-3xl border transition-all duration-500 ${
              theme === 'dark' ? 'bg-zinc-900/40 border-zinc-900' : 'bg-gray-50 border-gray-100'
            }`} id="bfw-sidebar-badge">
              <Star className="w-6 h-6 text-zinc-500 mb-3" />
              <span className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-1 ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
              }`}>Prestižno Prepoznavanje</span>
              <span className={`text-xs font-serif italic ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}>Liderstvo u autorskom modnom krugu</span>
            </div>
          </div>

          {/* Column 2: Review Content */}
          <div className="lg:col-span-7 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-6"
              id="bfw-content-header"
            >
              <span className={`text-[10px] font-bold uppercase tracking-[0.4em] block ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`}>
                Belgrade Fashion Week
              </span>
              
              <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] uppercase italic transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`} id="bfw-content-title">
                Šta o nama kaže <br />
                <span className="text-zinc-500">Belgrade Fashion Week</span>
              </h1>
              
              <div className="h-0.5 w-16 bg-zinc-500 mt-8" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-lg leading-relaxed font-light transition-colors ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}
              id="bfw-intro-paragraph"
            >
              Izuzetno smo ponosni na dugogodišnje prepoznavanje našeg rada od strane vodećih modnih institucija u regionu. Prenosimo vam u celosti osvrt koji je o našem brendu objavio <strong>Belgrade Fashion Week</strong>:
            </motion.div>

            {/* Quote block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`p-10 md:p-14 rounded-[3rem] border relative overflow-hidden group space-y-8 ${
                theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-gray-50 border-gray-100'
              }`}
              id="bfw-quote-card"
            >
              <Quote className="absolute -top-6 -right-6 w-32 h-32 text-zinc-500/5 group-hover:text-zinc-500/10 transition-all duration-700" />
              
              <div className="space-y-4">
                <span className={`text-xs font-bold uppercase tracking-[0.3em] block ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Modni Osvrt
                </span>
                <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight uppercase italic leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  „DD DESIGN – Modna arhitektura koja slavi žensku individualnost“
                </h3>
              </div>

              <div className={`space-y-6 text-base md:text-lg leading-relaxed font-serif italic ${
                theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}>
                <p>
                  „Na domaćoj modnoj sceni, brend DD DESIGN, iza kojeg stoje dizajnerke Danijela Stojkovski i Danijela Gojković, pozicionirao se kao sinonim za autentični luksuz i vrhunsku zanatsku egzekuciju. Njihov rad predstavlja savršen primer kako se tradicija poznavanja tekstila može pretočiti u moderan modni jezik.
                </p>
                <p>
                  Nova kolekcija brenda donosi maestralnu igru kontrasta. Koristeći rigidnost taft svile naspram fluidnosti muslina i senzualnosti francuske čipke, dizajnerke su uspele da vizuelno definišu dualnost savremene žene – njenu nepokolebljivu snagu i prefinjenu nežnost.
                </p>
                <p>
                  Sa savršenom paletom u biserno beloj i crnoj boji, DD DESIGN ne nudi samo odeću, već kompletan vizuelni identitet. To je autentična, bezvremenska elegancija koja nam u vremenu brze mode vraća veru u istinsku umetnost kreiranja.“
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-800/10 dark:border-zinc-800 flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-widest ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  — Belgrade Fashion Week
                </span>
              </div>
            </motion.div>

            {/* Custom Brand Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 pt-6"
              id="bfw-features-block"
            >
              <h4 className={`text-sm font-bold uppercase tracking-widest ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Vizija bezvremenske elegancije
              </h4>
              <p className={`text-sm leading-relaxed ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
              }`}>
                Ovo prestižno priznanje nas dodatno motiviše da svakom detalju u našim ateljeima posvetimo bezrezervno vreme i pažnju. Ručna izrada, vrhunski materijali poput najfinije svile i prefinjenih čipki, ostaju srž identiteta DD DESIGN brenda.
              </p>
            </motion.div>

          </div>
        </div>

        {/* Explore Collections & Featured Products Section */}
        <section className="mt-32 pt-20 border-t border-zinc-800/20 dark:border-zinc-800" id="bfw-explore-collections">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            {/* Header & Category Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/10 dark:border-zinc-800/60">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-500" />
                  <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                  }`}>
                    Atelje DD DESIGN • Kolekcije
                  </span>
                </div>
                <h2 className={`text-3xl md:text-5xl font-black tracking-tight uppercase italic ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Istražite Kolekcije
                </h2>
                <p className={`text-sm md:text-base max-w-2xl font-light ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                }`}>
                  Otkrijte modele od najfinije svile, autorska odela i taft kapute koji su osvojili priznanja modnih kritičara na pisti i u editorijalima.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategoryFilter === 'all'
                      ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white shadow-md')
                      : (theme === 'dark' ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-gray-100 text-gray-600 hover:text-black border border-gray-200')
                  }`}
                >
                  Svi Modeli
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('new')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategoryFilter === 'new'
                      ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white shadow-md')
                      : (theme === 'dark' ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-gray-100 text-gray-600 hover:text-black border border-gray-200')
                  }`}
                >
                  Nova Kolekcija
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('dresses')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategoryFilter === 'dresses'
                      ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white shadow-md')
                      : (theme === 'dark' ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-gray-100 text-gray-600 hover:text-black border border-gray-200')
                  }`}
                >
                  Svilene Haljine
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('suits')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategoryFilter === 'suits'
                      ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white shadow-md')
                      : (theme === 'dark' ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-gray-100 text-gray-600 hover:text-black border border-gray-200')
                  }`}
                >
                  Odela i Kompleti
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-10 h-10 mx-auto text-zinc-500 opacity-60" />
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                  Učitavanje ponuđenih modela...
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest underline underline-offset-4"
                >
                  Pogledajte kompletnu ponudu u prodavnici
                </Link>
              </div>
            )}

            {/* Bottom Actions & Highlights */}
            <div className={`mt-12 p-8 md:p-12 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-8 transition-colors ${
              theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-2 text-center md:text-left">
                <span className={`text-[10px] font-bold uppercase tracking-[0.25em] block ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                }`}>
                  Unikatna Izrada & Po Meri
                </span>
                <h3 className={`text-xl md:text-2xl font-bold tracking-tight uppercase italic ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  Želite personalizovani model iz ateljea?
                </h3>
                <p className={`text-xs md:text-sm font-light max-w-xl ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                }`}>
                  Svaki komad možemo krojiti po vašim tačnim merama, uz izbor najfinijih italijanskih svila i francuske čipke.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <Link
                  to="/izrada-po-meri"
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center transition-all border ${
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  Izrada po meri
                </Link>
                <Link
                  to="/shop"
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 group ${
                    theme === 'dark'
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-black text-white hover:bg-zinc-800 shadow-lg'
                  }`}
                >
                  <span>Svi Proizvodi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Brand Trust Section */}
      <div className={`mt-32 py-24 border-t border-b transition-all duration-500 ${
        theme === 'dark' ? 'border-zinc-900 bg-[#0e0e0e]' : 'border-gray-100 bg-gray-50'
      }`} id="bfw-trust-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-sm font-bold mb-16 uppercase tracking-[0.3em] transition-colors ${
            theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
          }`}>Prepoznatljivost našeg brenda</h2>
          <div className={`flex flex-wrap justify-center items-center gap-x-20 gap-y-12 grayscale opacity-40 hover:opacity-100 transition-opacity duration-1000 uppercase font-bold tracking-tighter ${
            theme === 'dark' ? 'text-zinc-500' : 'text-gray-450'
          }`}>
            <span className="text-2xl md:text-3xl italic">Lepa & Srećna</span>
            <span className="text-2xl md:text-3xl tracking-[0.2em]">Belgrade Fashion Week</span>
            <span className="text-2xl md:text-3xl tracking-[0.2em]">Lepota & Zdravlje</span>
            <span className="text-2xl md:text-3xl font-serif">Elle</span>
            <span className="text-2xl md:text-2xl tracking-widest italic">Harper's Bazaar</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Cover Image */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Zatvori"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={BFW_COVER_IMAGE}
                alt="Belgrade Fashion Week Uvećana slika"
                className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 text-center text-white/70 text-xs font-light tracking-widest uppercase">
                Belgrade Fashion Week • DD DESIGN
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
