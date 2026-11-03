import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, X, RotateCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (token: string) => void;
  title?: string;
  subtitle?: string;
}

const PUZZLE_ITEMS = [
  {
    id: 1,
    title: 'Svilena haljina',
    img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Taft kaput',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Svileno odelo',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop'
  }
];

export default function CaptchaModal({
  isOpen,
  onClose,
  onVerified,
  title,
  subtitle
}: CaptchaModalProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleVerify = async (itemId?: number) => {
    if (verifying || verified) return;
    if (itemId) setSelectedId(itemId);

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/captcha/verify-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientTimestamp: Date.now() })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setVerified(true);
        setVerifying(false);

        // Small delay to let the user see the satisfying green checkmark
        setTimeout(() => {
          onVerified(data.token);
          setVerified(false);
          setSelectedId(null);
          onClose();
        }, 550);
      } else {
        throw new Error(data.error || 'Verifikacija nije uspela.');
      }
    } catch (err: any) {
      console.error('[CaptchaModal] Error:', err);
      setVerifying(false);
      setSelectedId(null);
      setError(
        language === 'sr'
          ? 'Došlo je do greške. Pokušajte ponovo.'
          : 'Verification failed. Please try again.'
      );
    }
  };

  const handleModalClose = () => {
    if (verifying) return;
    setVerified(false);
    setSelectedId(null);
    setError(null);
    onClose();
  };

  const modalTitle = title || (
    language === 'sr'
      ? 'Sigurnosna provera'
      : language === 'ru'
      ? 'Проверка безопасности'
      : 'Security Verification'
  );

  const modalSubtitle = subtitle || (
    language === 'sr'
      ? 'Potvrdite jednim klikom da niste robot'
      : language === 'ru'
      ? 'Подтвердите в один клик, что вы не робот'
      : 'One click confirmation that you are human'
  );

  const labelNotRobot = language === 'sr' ? 'Nisam robot' : language === 'ru' ? 'Я не робот' : "I'm not a robot";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`relative z-10 w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-[#101012] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-serif tracking-[0.2em] font-light">
                    {modalTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    {modalSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalClose}
                className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* The "I'm not a robot" Checkbox Box */}
              <div
                onClick={() => handleVerify()}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  verified
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : theme === 'dark'
                    ? 'bg-zinc-900/90 border-zinc-700 hover:border-zinc-500'
                    : 'bg-zinc-50 border-zinc-300 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      verified
                        ? 'bg-emerald-500 text-white border border-emerald-400 scale-105'
                        : verifying
                        ? 'bg-zinc-800 border border-zinc-600'
                        : theme === 'dark'
                        ? 'bg-zinc-900 border border-zinc-500 hover:border-white'
                        : 'bg-white border-zinc-400 hover:border-black'
                    }`}
                  >
                    {verified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                      >
                        <Check className="w-4.5 h-4.5 stroke-[3.5] text-white" />
                      </motion.div>
                    )}

                    {verifying && (
                      <RotateCw className="w-4 h-4 animate-spin text-zinc-300" />
                    )}
                  </div>

                  <span className={`text-sm font-medium ${
                    verified ? 'text-emerald-500 font-semibold' : ''
                  }`}>
                    {verifying
                      ? (language === 'sr' ? 'Verifikujem...' : 'Verifying...')
                      : verified
                      ? (language === 'sr' ? 'Potvrđeno ✓' : 'Verified ✓')
                      : labelNotRobot}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-zinc-400 text-right text-[10px] uppercase font-serif tracking-widest">
                  <span>DD Zaštita</span>
                </div>
              </div>

              {/* Optional 1-tap Silk Creation Tiles */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-zinc-400 text-center font-sans">
                  {language === 'sr'
                    ? 'Ili kliknite na kreaciju za instant potvrdu:'
                    : 'Or tap any creation for instant verification:'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {PUZZLE_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleVerify(item.id)}
                      className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
                        selectedId === item.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                          : theme === 'dark'
                          ? 'border-zinc-800 hover:border-zinc-500'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[9px] text-white font-medium truncate w-full text-center">
                          {item.title}
                        </span>
                      </div>

                      {selectedId === item.id && (
                        <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white stroke-[3] drop-shadow" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-1.5 text-rose-500 text-xs font-medium pt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-5 py-3 border-t text-[10px] flex items-center justify-between ${
              theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800/60 text-zinc-500' : 'bg-zinc-50 border-zinc-100 text-zinc-400'
            }`}>
              <span>DD DESIGN Sigurnost</span>
              <span className="hover:underline cursor-pointer">Privatnost • Uslovi</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
