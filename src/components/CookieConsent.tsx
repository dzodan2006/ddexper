import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, RefreshCw, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Proveri da li je korisnik već prihvatio najnoviju verziju kolačića i keša (v4)
    const consent = localStorage.getItem('dd_cookie_consent_v4');
    if (!consent) {
      // Prikaži nakon kratkog odlaganja za bolji efekat
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dd_cookie_consent_v4', 'true');
    setIsVisible(false);
  };

  const handleClearCacheAndReload = () => {
    // Očisti sve stare verzije keša proizvoda i kategorija kako bi povukao sveže podatke iz baze
    localStorage.removeItem('dd_products_cache');
    localStorage.removeItem('dd_categories_cache');
    localStorage.removeItem('dd_products_cache_v2');
    localStorage.removeItem('dd_categories_cache_v2');
    localStorage.removeItem('dd_products_cache_v3');
    localStorage.removeItem('dd_categories_cache_v3');
    localStorage.removeItem('dd_products_cache_v4');
    localStorage.removeItem('dd_categories_cache_v4');
    localStorage.removeItem('dd_categories_cache_v5');
    
    // Obavesti korisnika
    setIsVisible(false);
    localStorage.setItem('dd_cookie_consent_v4', 'true');
    
    // Ponovo učitaj stranicu sa očišćenim kešom
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-50"
        >
          <div className={`p-6 rounded-[2rem] shadow-2xl border backdrop-blur-xl ${
            theme === 'dark' 
              ? 'bg-[#000000]/90 border-zinc-800 text-white' 
              : 'bg-white/90 border-gray-100 text-black'
          }`}>
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl ${
                theme === 'dark' ? 'bg-zinc-900 animate-pulse' : 'bg-gray-50 animate-pulse'
              }`}>
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Kolačići i Lokalni Keš</h3>
                <p className={`text-xs leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                }`}>
                  Koristimo kolačiće i lokalni keš podataka kako bismo osigurali najbrže učitavanje slika i kolekcija. Ako primećujete da se nove slike ne prikazuju, možete očistiti lokalni keš jednim klikom ispod.
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAccept}
                      className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        theme === 'dark'
                          ? 'bg-white text-black hover:bg-zinc-200'
                          : 'bg-black text-white hover:bg-zinc-800'
                      }`}
                    >
                      Prihvati
                    </button>
                    <button
                      onClick={() => setIsVisible(false)}
                      className={`p-3 rounded-full transition-colors ${
                        theme === 'dark' ? 'hover:bg-zinc-900 text-zinc-500' : 'hover:bg-gray-100 text-gray-400'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleClearCacheAndReload}
                    className={`w-full py-2.5 rounded-full text-[10px] font-medium uppercase tracking-widest border flex items-center justify-center space-x-2 transition-all ${
                      theme === 'dark'
                        ? 'border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white bg-zinc-905'
                        : 'border-gray-200 hover:border-gray-400 text-gray-500 hover:text-black bg-gray-50'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Očisti keš i osveži slike</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
