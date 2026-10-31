import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function NewsletterPopup() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const STORAGE_KEY = 'dd_newsletter_subscriber_notice_v2';

  useEffect(() => {
    // Check if previously dismissed or subscribed
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (isDismissed) return;

    // Show after 4.5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage(
        language === 'sr'
          ? 'Molimo unesite ispravnu e-mail adresu.'
          : language === 'ru'
          ? 'Пожалуйста, укажите корректный e-mail.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        localStorage.setItem(STORAGE_KEY, 'true');
      } else {
        setStatus('error');
        setErrorMessage(
          data.error ||
            (language === 'sr'
              ? 'Došlo je do greške. Pokušajte ponovo.'
              : 'An error occurred. Please try again.')
        );
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        language === 'sr'
          ? 'Došlo je do mrežne greške. Pokušajte ponovo.'
          : 'Network error. Please try again.'
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card - Clean Quiet Luxury Minimalist */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative w-full max-w-md rounded-2xl p-8 sm:p-10 border shadow-2xl z-10 transition-colors ${
              theme === 'dark'
                ? 'bg-[#0a0a0a] border-zinc-800 text-white shadow-black/80'
                : 'bg-white border-zinc-200 text-black shadow-xl'
            }`}
          >
            {/* Minimal Close Button */}
            <button
              onClick={handleClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  : 'text-zinc-400 hover:text-black hover:bg-zinc-100'
              }`}
              aria-label="Zatvori"
            >
              <X className="w-4 h-4" />
            </button>

            {status !== 'success' ? (
              <div className="space-y-6 text-center">
                {/* Brand Monogram / Identity */}
                <div className="space-y-2 pt-2">
                  <span className="text-xl font-bold tracking-tight uppercase block font-serif">
                    DD DESIGN
                  </span>
                  <p className="text-[11px] uppercase tracking-[0.25em] font-serif text-zinc-400 dark:text-zinc-500">
                    Umetnost utkana u svilu
                  </p>
                </div>

                <div className="space-y-3">
                  <h3
                    className={`text-2xl sm:text-3xl font-light tracking-wide font-serif ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {language === 'sr'
                      ? 'Nove Kolekcije & Pogodnosti'
                      : language === 'ru'
                      ? 'Новые Коллекции и Привилегии'
                      : 'New Drops & Privileges'}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-light ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    }`}
                  >
                    {language === 'sr'
                      ? 'Ostavite svoj e-mail i saznajte prvi za predstojeća sniženja, limitirane svilene modele i ekskluzivne ponude našeg ateljea.'
                      : language === 'ru'
                      ? 'Оставьте свой e-mail, чтобы первыми узнавать о будущих скидках, лимитированных коллекциях из шелка и закрытых предложениях.'
                      : 'Subscribe to be the first to know about upcoming sales, limited silk drops, and private atelier opportunities.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      language === 'sr'
                        ? 'Vaša e-mail adresa'
                        : language === 'ru'
                        ? 'Ваш e-mail адрес'
                        : 'Your email address'
                    }
                    disabled={status === 'loading'}
                    required
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border transition-all outline-none text-center ${
                      theme === 'dark'
                        ? 'bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-400 focus:bg-zinc-900'
                        : 'bg-zinc-50 border-zinc-200 text-black placeholder-zinc-400 focus:border-black focus:bg-white'
                    }`}
                  />

                  {errorMessage && (
                    <p className="text-xs text-rose-500 font-medium">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full py-3.5 rounded-xl font-light text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'bg-black text-white hover:bg-zinc-800'
                    } disabled:opacity-50`}
                  >
                    <span>
                      {status === 'loading'
                        ? language === 'sr'
                          ? 'Prijavljivanje...'
                          : 'Subscribing...'
                        : language === 'sr'
                        ? 'Prijavite se za obaveštenja'
                        : language === 'ru'
                        ? 'Получать уведомления'
                        : 'Notify Me'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleClose}
                  className={`text-[11px] tracking-wider transition-colors pt-1 ${
                    theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-800'
                  }`}
                >
                  {language === 'sr' ? 'Možda kasnije' : 'Maybe later'}
                </button>
              </div>
            ) : (
              /* Success State - Minimalist */
              <div className="space-y-6 text-center py-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                    theme === 'dark'
                      ? 'border-zinc-700 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-zinc-100 text-black'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <h3
                    className={`text-2xl font-light font-serif ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {language === 'sr' ? 'Hvala vam na poverenju' : 'Thank You'}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.25em] font-serif text-zinc-400 dark:text-zinc-500">
                    Umetnost utkana u svilu
                  </p>
                </div>

                <p
                  className={`text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-light ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {language === 'sr'
                    ? 'Vaša prijava je zabeležena. Bićete među prvima koji će saznati za nove svilene kolekcije i buduće popuste.'
                    : 'Your email has been recorded. You will be among the first to hear about new silk collections and future sales.'}
                </p>

                <button
                  onClick={handleClose}
                  className={`w-full py-3.5 rounded-xl font-light text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                      : 'bg-zinc-100 text-black hover:bg-zinc-200'
                  }`}
                >
                  {language === 'sr' ? 'U redu, nastavi' : 'Continue Browsing'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
