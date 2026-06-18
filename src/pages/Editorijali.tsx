import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Quote, Sparkles, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Editorijali() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(0);

  // High fashion photography selected for ultimate brand feeling
  const editorialSpreads = [
    {
      title: t('ed.taftSilkTitle'),
      subtitle: language === 'sr' 
        ? 'Skulpturalne forme i "šuštavi" zvuk čistog luksuza'
        : language === 'ru'
        ? 'Скульптурные формы и "шуршащий" шепот чистого люкса'
        : 'Sculptural Forms & The "Rustle" of Pure Luxury',
      text: t('ed.taftSilkDesc'),
      quote: t('ed.taftSilkQuote'),
      image: "https://images.weserv.nl/?url=64.media.tumblr.com/cb6f36c302200c648bf44670ada2305e/2b7c3e65e62eb0d6-47/s2048x3072/f4675eb55ccda97da38e96bf2cedb7b947b917f0.jpg",
      styleTips: [
        t('ed.taftSilkStyle1'),
        t('ed.taftSilkStyle2'),
        t('ed.taftSilkStyle3')
      ],
      ctaText: t('ed.exploreTaftBtn'),
      searchKeyword: 'taft'
    }
  ];

  const handleNextPage = () => {
    setActivePage((prev) => (prev + 1) % editorialSpreads.length);
  };

  const handlePrevPage = () => {
    setActivePage((prev) => (prev - 1 + editorialSpreads.length) % editorialSpreads.length);
  };

  const currentSpread = editorialSpreads[activePage];

  return (
    <article className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-between" aria-label="DD Design Atelje Digital Editorial">
      {/* Dynamic SEO Hook helper info */}
      <h1 className="sr-only">DD Design Digital Magazine — Taft Svila i Priče iz Ateljea</h1>

      <header className="flex flex-col md:flex-row items-center justify-between border-b pb-6 mb-10 border-zinc-500/10 dark:border-zinc-100/10">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-bold flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-3 h-3" />
            {t('ed.tag')}
          </p>
          <h2 className={`text-2xl md:text-3xl font-light uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {t('ed.title')}
          </h2>
        </div>
        
        {/* Page Switcher Info & Controls */}
        {editorialSpreads.length > 1 && (
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                {t('ed.subtitle')}
              </p>
              <p className="text-xs font-serif font-semibold italic">
                {language === 'sr' ? `Priča ${activePage + 1} od ${editorialSpreads.length}` : 
                 language === 'ru' ? `История ${activePage + 1} из ${editorialSpreads.length}` : 
                 `Spread ${activePage + 1} of ${editorialSpreads.length}`}
              </p>
            </div>
            <div className="flex bg-zinc-800/5 dark:bg-zinc-100/5 p-1 rounded-sm border border-zinc-500/15">
              <button 
                onClick={handlePrevPage} 
                className="p-1 px-2 hover:opacity-75 transition-opacity"
                aria-label="Previous editorial spread"
              >
                <ChevronLeft className="w-5 h-5 pointer-events-none" />
              </button>
              <span className="w-[1px] bg-zinc-500/20 my-1 mx-1" />
              <button 
                onClick={handleNextPage} 
                className="p-1 px-2 hover:opacity-75 transition-opacity"
                aria-label="Next editorial spread"
              >
                <ChevronRight className="w-5 h-5 pointer-events-none" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Brand Identity / Introduction */}
      <section className="mb-14 max-w-4xl mx-auto text-center" aria-label="Brand Philosophy">
        <p className={`text-sm md:text-base tracking-wide leading-relaxed font-light italic ${
          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-750'
        }`}>
          {t('ed.brandIdentity')}
        </p>
        <div className="flex justify-center mt-6">
          <BookOpen className="w-4 h-4 text-red-500/70 animate-pulse" />
        </div>
      </section>

      {/* Main Magazine Layout / Staggered Spread System with Framer-Motion */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
          >
            {/* COLUMN A: Majestic Full-Height Portrait Photography Frame */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative group overflow-hidden max-w-md mx-auto border border-zinc-500/10 shadow-2xl rounded-sm">
                {/* Premium Aspect Ratio suited for print fashion magazines */}
                <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-900 relative">
                  <motion.img
                    src={currentSpread.image}
                    alt={currentSpread.title}
                    className="w-full h-full object-cover saturate-90 group-hover:scale-105 transition-transform duration-1000 object-center"
                    referrerPolicy="referrer"
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Micro photography details for authenticity */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white select-none pointer-events-none">
                  <p className="font-mono text-[9px] tracking-widest uppercase opacity-75">
                    Location Vol. II / DD Atelier
                  </p>
                  <p className="font-serif italic text-xs opacity-90">
                    Art direction: Danijela G.
                  </p>
                </div>
              </div>
            </div>

            {/* COLUMN B: Premium Print Editorial Typography Flow */}
            <div className="lg:col-span-7 space-y-8 md:pl-6">
              <div className="space-y-3">
                <span className="text-red-500 font-serif italic text-xs tracking-wider uppercase">
                  {currentSpread.subtitle}
                </span>
                <h3 className={`text-3xl md:text-4xl font-extralight tracking-widest uppercase leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                }`}>
                  {currentSpread.title}
                </h3>
                <div className="w-16 h-[1px] bg-red-550/40" />
              </div>

              {/* Story Description with Dropped Cap for Elegant Look & Feel */}
              <div className={`text-sm md:text-base leading-relaxed tracking-wide font-light space-y-4 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-neutral-750'
              }`}>
                <p className="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-red-500">
                  {currentSpread.text}
                </p>
              </div>

              {/* Majestic Aesthetic Quote section with luxury styling */}
              <div className={`p-6 border-l-2 border-red-500/40 bg-zinc-800/5 dark:bg-zinc-100/5 rounded-r-md ${
                theme === 'dark' ? 'text-zinc-300' : 'text-neutral-800'
              }`}>
                <Quote className="w-6 h-6 text-red-500/40 mb-3" />
                <p className="font-serif italic text-base leading-relaxed tracking-wide">
                  {currentSpread.quote}
                </p>
              </div>

              {/* Style Guide & Creative Suggestions ("Stilski Predlozi") */}
              <div className="space-y-4 pt-4 border-t border-zinc-500/10 dark:border-zinc-100/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {t('ed.taftSilkStyleTitle')}
                </h4>
                <ul className="space-y-3 pl-1">
                  {currentSpread.styleTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-xs leading-relaxed tracking-wide">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span className={theme === 'dark' ? 'text-zinc-400' : 'text-neutral-700'}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to action (Natural bridge to ready-to-buy products) */}
              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => navigate(`/shop?search=${currentSpread.searchKeyword}`)}
                  className={`flex items-center space-x-4 py-4 px-8 border text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'border-zinc-800 bg-white text-black hover:bg-black hover:text-white hover:border-zinc-800 hover:shadow-lg' 
                      : 'border-neutral-250 bg-black text-white hover:bg-white hover:text-black hover:border-black hover:shadow-lg'
                  }`}
                  aria-label={`Buy items related to ${currentSpread.title}`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{currentSpread.ctaText}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="mt-14 pt-6 border-t border-zinc-500/10 dark:border-zinc-100/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-mono tracking-widest text-zinc-500">
        <p>DD DESIGN DIGITAL MAGAZINE — ISSUE 01 / 2026</p>
        <Link to="/shop" className="hover:text-red-500 transition-colors mt-2 md:mt-0">
          ← {t('ed.backToShop')}
        </Link>
      </footer>
    </article>
  );
}
