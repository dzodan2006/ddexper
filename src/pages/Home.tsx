import { useState, useEffect, useRef, RefObject } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Package, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { animate } from 'motion/react';
import ImageZoomModal from '../components/ImageZoomModal';
import { optimizeImageUrl } from '../lib/utils';

interface HomeProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
}

export default function Home({ products, categories, loading, onAddToCart }: HomeProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [featuredScrollProgress, setFeaturedScrollProgress] = useState(0);
  const [catConstraints, setCatConstraints] = useState({ left: 0, right: 0 });
  const [featuredConstraints, setFeaturedConstraints] = useState({ left: 0, right: 0 });
  const categoriesInnerRef = useRef<HTMLDivElement>(null);
  const featuredInnerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  const xCategories = useMotionValue(0);
  const xFeatured = useMotionValue(0);

  const handleNavScroll = (
    direction: 'left' | 'right', 
    motionValue: any, 
    constraints: { left: number; right: number },
    amount: number = 300
  ) => {
    const currentX = motionValue.get();
    let targetX = direction === 'left' ? currentX + amount : currentX - amount;
    targetX = Math.max(constraints.left, Math.min(constraints.right, targetX));
    
    animate(motionValue, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 30
    });
  };

  useEffect(() => {
    const unsub = xCategories.onChange(v => handleDragScroll(v, categoriesInnerRef, categoriesRef, setScrollProgress));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = xFeatured.onChange(v => handleDragScroll(v, featuredInnerRef, featuredRef, setFeaturedScrollProgress));
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (categoriesRef.current && categoriesInnerRef.current) {
        setCatConstraints({
          left: -(categoriesInnerRef.current.scrollWidth - categoriesRef.current.offsetWidth),
          right: 0,
        });
      }
      if (featuredRef.current && featuredInnerRef.current) {
        setFeaturedConstraints({
          left: -(featuredInnerRef.current.scrollWidth - featuredRef.current.offsetWidth),
          right: 0,
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    // Initial check after a short delay to ensure DOM is ready
    const timer = setTimeout(updateConstraints, 500);
    return () => {
      window.removeEventListener('resize', updateConstraints);
      clearTimeout(timer);
    }
  }, [categories, products, loading]);

  const handleDragScroll = (infoValue: number, innerRef: RefObject<HTMLDivElement>, containerRef: RefObject<HTMLDivElement>, setProgress: (p: number) => void) => {
    if (innerRef.current && containerRef.current) {
      const scrollWidth = innerRef.current.scrollWidth - containerRef.current.offsetWidth;
      const progress = -infoValue / scrollWidth;
      setProgress(Math.max(0, Math.min(1, isNaN(progress) ? 0 : progress)));
    }
  };

  const totalDots = 3;

  return (
    <>
      {/* Editorial Hero Section */}
      <section className="relative pt-32 pb-24 transition-colors duration-500 overflow-hidden min-h-[85vh] flex items-center bg-transparent">
        {/* Background image fading from right to left */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] z-0 select-none pointer-events-none">
          <img 
            src={optimizeImageUrl("https://64.media.tumblr.com/cb6f36c302200c648bf44670ada2305e/2b7c3e65e62eb0d6-47/s2048x3072/f4675eb55ccda97da38e96bf2cedb7b947b917f0.jpg", 1200)}
            alt="Hero Background"
            className="w-full h-full object-cover object-[center_20%] grayscale opacity-30 dark:opacity-20"
            referrerPolicy="no-referrer"
            width={1200}
            height={800}
          />
          {/* Fading from right to left overlay */}
          <div className={`absolute inset-0 z-10 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-[#000000] via-[#000000]/60 to-transparent' 
              : 'from-white via-white/60 to-transparent'
          }`} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Area (Columns 1-7 for better layout above background) */}
            <div className="lg:col-span-8 space-y-8 pr-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className={`text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-extralight tracking-wide leading-[1.1] uppercase mb-8 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  {t('home.heroTitle')}
                </h1>
                
                <p className={`text-base leading-relaxed mb-10 max-w-md transition-colors ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                }`}>
                  {t('home.heroDesc')}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate('/shop')}
                    className={`px-8 py-4 rounded-full font-light italic text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg transition-all ${
                      theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5' : 'bg-black text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span>{t('home.discoverCollection')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate('/saradnje/dd-modna-prica')}
                    className={`px-8 py-4 rounded-full font-light italic text-xs uppercase tracking-widest border transition-all ${
                      theme === 'dark' ? 'border-zinc-800 text-white hover:border-white' : 'border-gray-200 text-black hover:border-black'
                    }`}
                  >
                    {t('home.ourStory')}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
 
      {/* Handmade Quality Section */}
      <section className="py-24 transition-colors duration-500 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative p-12 md:p-20 rounded-[3rem] overflow-hidden ${
              theme === 'dark' ? 'bg-zinc-900/40 border border-zinc-800' : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <span className={`text-[10px] font-light italic uppercase tracking-[0.3em] mb-6 block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{t('home.handmadeTag')}</span>
                <h2 className={`text-3xl md:text-5xl font-extralight tracking-tight mb-8 transition-colors ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  {t('home.handmadeTitle')}
                </h2>
                <div className={`space-y-4 text-sm md:text-base transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <p>
                    {t('home.handmadeDescription')}
                  </p>
                </div>
              </div>
              <div 
                onClick={() => setZoomImage("https://64.media.tumblr.com/6d12019b559087745a3d1db1e01ebf6d/96ff0d2545ab50fb-5b/s2048x3072/10de0c48cbf4f18ed46249e525cb0dd9ebab8425.jpg")}
                className="relative w-full md:w-[45%] md:max-h-[550px] aspect-[2/3] rounded-[3rem] overflow-hidden group cursor-zoom-in shadow-2xl bg-zinc-900"
              >
                  <img 
                    src={optimizeImageUrl("https://64.media.tumblr.com/6d12019b559087745a3d1db1e01ebf6d/96ff0d2545ab50fb-5b/s2048x3072/10de0c48cbf4f18ed46249e525cb0dd9ebab8425.jpg", 800)} 
                    alt="Handmade process" 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-102 grayscale opacity-85 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    width={800}
                    height={1200}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white font-light italic tracking-widest text-[10px] uppercase">
                      {t('home.zoomLabel')}
                    </p>
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
 
      {/* Categories Showcase */}
      <section className="py-32 transition-colors duration-500 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className={`text-[10px] font-light italic uppercase tracking-[0.3em] mb-4 block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{t('home.categoriesTag')}</span>
            <h2 className={`text-3xl md:text-5xl font-extralight tracking-wide uppercase transition-colors ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('home.categoriesTitle')}</h2>
          </div>

          <div className="relative group/nav">
            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -left-4 -right-4 -translate-y-1/2 flex justify-between items-center pointer-events-none z-10 hidden md:flex opacity-0 group-hover/nav:opacity-100 transition-opacity">
              <button 
                onClick={() => handleNavScroll('left', xCategories, catConstraints)}
                className={`p-3 rounded-full border transition-all pointer-events-auto shadow-sm scale-90 hover:scale-100 active:scale-95 ${
                  theme === 'dark' ? 'border-zinc-800 bg-black text-white hover:bg-white hover:text-black' : 'border-gray-200 bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleNavScroll('right', xCategories, catConstraints)}
                className={`p-3 rounded-full border transition-all pointer-events-auto shadow-sm scale-90 hover:scale-100 active:scale-95 ${
                  theme === 'dark' ? 'border-zinc-800 bg-black text-white hover:bg-white hover:text-black' : 'border-gray-200 bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative overflow-hidden select-none" ref={categoriesRef}>
            <motion.div
              ref={categoriesInnerRef}
              drag="x"
              dragConstraints={catConstraints}
              dragElastic={0.2}
              dragMomentum={true}
              dragTransition={{ power: 0.3, timeConstant: 200 }}
              style={{ x: xCategories }}
              className="flex items-center space-x-6 pb-12 cursor-grab active:cursor-grabbing"
            >
              {categories.map((category, idx) => {
                const categoryProduct = products.find(p => p.category_id === category.Id || p.category === category.name);
                const bgImage = categoryProduct?.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=800';

                return (
                  <motion.div
                    key={category.Id || idx}
                    whileHover={{ y: -10 }}
                    onClick={() => navigate('/shop')}
                    onDragStart={(e) => e.preventDefault()}
                    className="relative min-w-[200px] md:min-w-[260px] h-[280px] md:h-[350px] rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 shrink-0"
                  >
                    <img 
                       src={optimizeImageUrl(bgImage, 400)} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 pointer-events-none"
                      alt={category.name}
                      draggable="false"
                      loading="lazy"
                      width={400}
                      height={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 pointer-events-none">
                      <h3 className="text-2xl font-light italic text-white mb-2 uppercase tracking-wide">{category.name}</h3>
                      <div className="flex items-center space-x-2 text-white/60 text-xs font-light italic uppercase tracking-widest group-hover:text-white transition-colors">
                        <span>{t('home.exploreModels')}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="flex justify-center space-x-2 mt-4">
              {[...Array(totalDots)].map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    Math.round(scrollProgress * (totalDots - 1)) === i 
                      ? (theme === 'dark' ? 'w-12 bg-white' : 'w-12 bg-black') 
                      : (theme === 'dark' ? 'w-2 bg-zinc-800' : 'w-2 bg-gray-200')
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
 
      {/* Featured Products */}
      <section className="py-24 transition-colors duration-500 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className={`text-3xl font-extralight tracking-wide mb-2 uppercase transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{t('home.featuredTitle')}</h2>
              <p className={`text-[10px] font-light italic uppercase tracking-widest transition-colors ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
              }`}>{t('home.featuredTag')}</p>
            </div>
            <Link to="/shop" className={`text-[10px] font-light italic uppercase tracking-widest border-b pb-0.5 transition-all mt-4 md:mt-0 ${
              theme === 'dark' ? 'border-white text-white hover:text-zinc-500 hover:border-zinc-500' : 'border-black text-black hover:text-gray-400 hover:border-gray-400'
            }`}>
              {t('home.viewAllModels')}
            </Link>
          </div>
 
          {loading ? (
            <div className="flex space-x-3 overflow-x-hidden">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="w-28 md:w-40 animate-pulse space-y-3 flex-none">
                  <div className="aspect-[4/5] bg-zinc-900 rounded-2xl" />
                  <div className="h-2.5 bg-zinc-900 w-3/4 rounded" />
                  <div className="h-2.5 bg-zinc-900 w-1/4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative group/nav">
              {/* Navigation Arrows */}
              <div className="absolute top-[40%] -left-4 -right-4 -translate-y-1/2 flex justify-between items-center pointer-events-none z-10 hidden md:flex opacity-0 group-hover/nav:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleNavScroll('left', xFeatured, featuredConstraints)}
                  className={`p-3 rounded-full border transition-all pointer-events-auto shadow-sm scale-90 hover:scale-100 active:scale-95 ${
                    theme === 'dark' ? 'border-zinc-800 bg-black text-white hover:bg-white hover:text-black' : 'border-gray-200 bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleNavScroll('right', xFeatured, featuredConstraints)}
                  className={`p-3 rounded-full border transition-all pointer-events-auto shadow-sm scale-90 hover:scale-100 active:scale-95 ${
                    theme === 'dark' ? 'border-zinc-800 bg-black text-white hover:bg-white hover:text-black' : 'border-gray-200 bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="relative overflow-hidden select-none" ref={featuredRef}>
              <motion.div
                ref={featuredInnerRef}
                drag="x"
                dragConstraints={featuredConstraints}
                dragElastic={0.2}
                dragMomentum={true}
                dragTransition={{ power: 0.3, timeConstant: 200 }}
                style={{ x: xFeatured }}
                className="flex items-start space-x-4 pb-8 cursor-grab active:cursor-grabbing"
              >
                {products.slice(0, 10).map((product, index) => (
                  <div 
                    key={product.id || `home-prod-${index}`} 
                    className="w-32 md:w-48 flex-none pointer-events-auto"
                    onDragStart={(e) => e.preventDefault()}
                  >
                    <ProductCard 
                      product={product} 
                      onAddToCart={onAddToCart} 
                    />
                  </div>
                ))}
              </motion.div>
 
              <div className="flex justify-center space-x-2 mt-6">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      Math.round(featuredScrollProgress * (5 - 1)) === i 
                        ? (theme === 'dark' ? 'w-10 bg-white' : 'w-10 bg-black') 
                        : (theme === 'dark' ? 'w-2 bg-zinc-800' : 'w-2 bg-gray-200')
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
 
      {/* Collaborations Section */}
      <section className={`py-32 transition-colors duration-500 border-y ${
        theme === 'dark' ? 'bg-zinc-950/40 border-zinc-900/60' : 'bg-zinc-50/40 border-gray-100'
      } overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-4">
            <div className="text-left">
              <span className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`}>{t('home.pressTag')}</span>
              <h2 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>PRESS</h2>
            </div>
            <Link to="/saradnje" className={`text-sm font-bold uppercase tracking-widest border-b pb-1 transition-colors ${
              theme === 'dark' ? 'text-zinc-500 hover:text-white border-zinc-800' : 'text-gray-400 hover:text-black border-gray-200'
            }`}>
              {t('home.viewAllPress')}
            </Link>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
            {[
              {
                id: 'dd-modna-prica',
                titles: {
                  sr: "D&D Modna Priča",
                  en: "D&D Fashion Story",
                  ru: "Модная история D&D"
                },
                categories: {
                  sr: "Lepa & Srećna / Editorijal",
                  en: "Lepa & Srećna / Editorial",
                  ru: "Lepa & Srećna / Редакционная статья"
                },
                image: "https://images.weserv.nl/?url=64.media.tumblr.com/76dc2883adea11944da040a1a7847267/dce9263cc4f8b5b7-c2/s2048x3072/2ef0942ea8f8d24999eef396e48bafb91c41e9b6.jpg",
                link: "/saradnje/dd-modna-prica",
                layoutClass: "aspect-[3/4.5] md:translate-y-0"
              },
              {
                id: 'lepaisrecna',
                titles: {
                  sr: "Olja Lević u DD odelu",
                  en: "Olja Lević in DD Suit",
                  ru: "Оля Левич в костюме DD"
                },
                categories: {
                  sr: "Naslovna strana",
                  en: "Cover Page",
                  ru: "Обложка"
                },
                image: "https://images.weserv.nl/?url=64.media.tumblr.com/dc0a7d20577b87803d85bce68571034b/49bb5b10ceb26ae9-16/s2048x3072/a87374b39ff7b8e1f20918b6afa086d5bed72ce4.jpg",
                link: "/saradnje/lepaisrecna",
                layoutClass: "aspect-[1.15] md:mt-16 md:translate-y-12"
              },
              {
                id: 'andjelka-stevic',
                titles: {
                  sr: "Anđelka Stević Žugić",
                  en: "Anđelka Stević Žugić",
                  ru: "Анджелка Стевич Жугич"
                },
                categories: {
                  sr: "Ekskluzivni Editorijal",
                  en: "Exclusive Editorial",
                  ru: "Эксклюзивная статья"
                },
                image: "https://images.weserv.nl/?url=64.media.tumblr.com/1bfee187e0ca0398f18dda06df01f18d/dce9263cc4f8b5b7-3c/s2048x3072/1124c1cda5bfefee44bbf99bb73a68d8507e2a44.jpg",
                link: "/saradnje/andjelka-stevic",
                layoutClass: "aspect-[3/4.2] md:mt-8 md:translate-y-4"
              }
            ].map((collab, i) => {
              const language = (useLanguage().language) as 'sr' | 'en' | 'ru';
              const title = collab.titles[language] || collab.titles['sr'];
              const category = collab.categories[language] || collab.categories['sr'];

              return (
                <motion.div
                  key={collab.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-zinc-900 ${collab.layoutClass}`}
                  onClick={() => navigate(collab.link)}
                >
                  <img 
                    src={optimizeImageUrl(collab.image, 600)} 
                    alt={title} 
                    className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    width={600}
                    height={800}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-8">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em] mb-2">{category}</span>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight italic mb-4">{title}</h3>
                    <div className="flex items-center space-x-3 text-white/80 group-hover:text-white transition-colors duration-300">
                      <span className="text-[10px] font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white pb-0.5">
                        {t('home.learnMore')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
  
          {/* Marquee effect for some magazine logos */}
          <div className="mt-16 md:mt-32 flex flex-col md:flex-row justify-center items-center opacity-40 grayscale hover:opacity-100 transition-opacity duration-700 gap-6 md:gap-20 py-4 px-10 text-center">
             <span className="text-xl md:text-2xl font-black tracking-tighter whitespace-nowrap">LEPA & SREĆNA</span>
             <span className="text-xl md:text-2xl font-bold tracking-widest whitespace-nowrap uppercase">BELGRADE FASHION WEEK</span>
          </div>
        </div>
      </section>
      <ImageZoomModal 
        isOpen={zoomImage !== null}
        onClose={() => setZoomImage(null)}
        imageSrc={zoomImage || ''}
        imageAlt="Atelje model"
      />
    </>
  );
}
