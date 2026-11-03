import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, Sparkles, X, RotateCw, AlertCircle, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export interface CaptchaWidgetRef {
  refresh: () => void;
  getToken: () => string;
  getAnswer: () => string;
  isVerified: () => boolean;
  resetAnswer: () => void;
}

interface CaptchaWidgetProps {
  onTokenChange?: (token: string) => void;
  onAnswerChange?: (answer: string) => void;
  error?: string | null;
  size?: 'sm' | 'md';
  className?: string;
  showTitle?: boolean;
  titleText?: string;
}

// Visual puzzle cards for the popup
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

export const CaptchaWidget = forwardRef<CaptchaWidgetRef, CaptchaWidgetProps>(({
  onTokenChange,
  onAnswerChange,
  error: externalError,
  size = 'md',
  className = '',
  showTitle = false,
  titleText
}, ref) => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const [status, setStatus] = useState<'idle' | 'verifying' | 'popup' | 'verified'>('idle');
  const [token, setToken] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<number | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setToken('');
    setSelectedPuzzleId(null);
    setLocalError(null);
    if (onTokenChange) onTokenChange('');
    if (onAnswerChange) onAnswerChange('');
  }, [onTokenChange, onAnswerChange]);

  useImperativeHandle(ref, () => ({
    refresh: reset,
    getToken: () => token,
    getAnswer: () => (status === 'verified' ? 'HUMAN_VERIFIED' : ''),
    isVerified: () => status === 'verified',
    resetAnswer: reset
  }), [reset, token, status]);

  // Performs human verification request to server
  const executeVerification = async () => {
    try {
      setStatus('verifying');
      setLocalError(null);

      const res = await fetch('/api/captcha/verify-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientTimestamp: Date.now() })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setToken(data.token);
        setStatus('verified');
        if (onTokenChange) onTokenChange(data.token);
        if (onAnswerChange) onAnswerChange('HUMAN_VERIFIED');
      } else {
        throw new Error(data.error || 'Verifikacija nije uspela.');
      }
    } catch (err: any) {
      console.error('[Captcha] Verification error:', err);
      setStatus('idle');
      setLocalError(
        language === 'sr'
          ? 'Greška pri verifikaciji. Kliknite ponovo na polje.'
          : 'Verification failed. Please click again.'
      );
    }
  };

  const handleCheckboxClick = () => {
    if (status === 'verified' || status === 'verifying') return;

    // Show stylish popup challenge or direct verification
    setStatus('popup');
  };

  const handlePuzzleSelect = (id: number) => {
    setSelectedPuzzleId(id);
    setTimeout(() => {
      executeVerification();
    }, 350);
  };

  const handleQuickVerify = () => {
    executeVerification();
  };

  const defaultTitle = titleText || (
    language === 'sr'
      ? 'Sigurnosna provera'
      : language === 'ru'
      ? 'Проверка безопасности'
      : 'Security Verification'
  );

  const labelNotRobot = language === 'sr' ? 'Nisam robot' : language === 'ru' ? 'Я не робот' : "I'm not a robot";
  const displayError = externalError || localError;

  return (
    <div className={`relative ${className}`}>
      {showTitle && (
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className={`text-xs font-medium tracking-wide uppercase font-serif ${
            theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
          }`}>
            {defaultTitle}
          </span>
        </div>
      )}

      {/* Modern "I am not a robot" Checkbox Box */}
      <div className={`w-full flex items-center justify-between transition-all rounded-xl border select-none ${
        size === 'sm' ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'
      } ${
        status === 'verified'
          ? theme === 'dark'
            ? 'bg-zinc-900/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'bg-emerald-50/60 border-emerald-500/40'
          : theme === 'dark'
            ? 'bg-[#121214] border-zinc-800 hover:border-zinc-700'
            : 'bg-white border-zinc-200 hover:border-zinc-300'
      }`}>
        {/* Left Side: Checkbox + Label */}
        <div 
          onClick={handleCheckboxClick}
          className={`flex items-center space-x-3.5 flex-1 ${status === 'verified' ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <div className={`relative flex items-center justify-center transition-all ${
            size === 'sm' ? 'w-6 h-6 rounded-md' : 'w-7 h-7 rounded-lg'
          } ${
            status === 'verified'
              ? 'bg-emerald-500 text-black border border-emerald-400 scale-105'
              : status === 'verifying'
              ? 'bg-zinc-800 border border-zinc-600'
              : theme === 'dark'
              ? 'bg-zinc-900 border border-zinc-600 hover:border-zinc-400'
              : 'bg-zinc-100 border border-zinc-300 hover:border-zinc-500'
          }`}>
            {status === 'verified' && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <Check className={`stroke-[3.5] text-white ${size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5'}`} />
              </motion.div>
            )}

            {status === 'verifying' && (
              <RotateCw className={`animate-spin text-zinc-300 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
            )}
          </div>

          <div className="flex flex-col">
            <span className={`font-medium tracking-wide transition-colors ${
              size === 'sm' ? 'text-xs sm:text-sm' : 'text-sm'
            } ${
              status === 'verified'
                ? theme === 'dark' ? 'text-emerald-400 font-semibold' : 'text-emerald-700 font-semibold'
                : theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
            }`}>
              {status === 'verifying' ? (language === 'sr' ? 'Verifikujem...' : 'Verifying...') : labelNotRobot}
            </span>

            {status === 'verified' && (
              <span className="text-[10px] text-emerald-500 font-sans tracking-wider uppercase font-medium">
                {language === 'sr' ? '✓ Potvrđeno' : '✓ Verified'}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Security Logo */}
        <div className="flex items-center space-x-2 pl-3 border-l border-zinc-700/40 text-right flex-shrink-0">
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1">
              <ShieldCheck className={`text-zinc-400 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
              <span className="text-[10px] font-serif uppercase tracking-widest text-zinc-400">
                DD
              </span>
            </div>
            <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">
              Zaštita
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex items-center space-x-1.5 text-rose-500 text-xs font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Stylish reCAPTCHA-style Modal Popup Challenge */}
      <AnimatePresence>
        {status === 'popup' && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatus('idle')}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Popup Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
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
                      DD Sigurnosna Provera
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      {language === 'sr' ? 'Jedan klik za potvrdu' : 'One click verification'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-xs sm:text-sm font-medium">
                    {language === 'sr'
                      ? 'Kliknite na bilo koju kreaciju iz ateljea:'
                      : 'Click any creation to verify:'}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-serif italic">
                    Umetnost utkana u svilu
                  </p>
                </div>

                {/* 3 Clickable Fashion Tiles (1 single tap solves it, zero typing!) */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {PUZZLE_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handlePuzzleSelect(item.id)}
                      className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-95 ${
                        selectedPuzzleId === item.id
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

                      {selectedPuzzleId === item.id && (
                        <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white stroke-[3] drop-shadow" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Instant Verify Button Alternative */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleQuickVerify}
                    className={`w-full py-3 rounded-xl text-xs uppercase tracking-widest font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-black'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'sr' ? 'Potvrdi: Nisam robot' : 'Verify: I am not a robot'}</span>
                  </button>
                </div>
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
    </div>
  );
});

CaptchaWidget.displayName = 'CaptchaWidget';
export default CaptchaWidget;
