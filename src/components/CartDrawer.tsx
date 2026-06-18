import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { CartItem } from '@/src/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number, selectedSize?: string, selectedColor?: string) => void;
  onRemove: (id: string, selectedSize?: string, selectedColor?: string) => void;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartDrawerProps) {
  const { theme } = useTheme();
  const { t, translateProduct, translateColorName, translateSizeName, formatCurrency } = useLanguage();
  const total = items.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);

  const shippingCost = total >= 10000 ? 0 : 400;
  const grandTotal = total + shippingCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full max-w-md shadow-2xl z-[70] flex flex-col transition-colors ${
              theme === 'dark' ? 'bg-[#000000]' : 'bg-white'
            }`}
          >
            <div className={`p-6 flex items-center justify-between border-b transition-colors ${
              theme === 'dark' ? 'border-zinc-900' : 'border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold tracking-tight uppercase transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{t('cart.title')}</h2>
              <button 
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-zinc-900 text-white' : 'hover:bg-gray-100 text-black'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'
                  }`}>
                    <Trash2 className={`w-8 h-8 transition-colors ${
                      theme === 'dark' ? 'text-zinc-800' : 'text-gray-300'
                    }`} />
                  </div>
                  <p className={`font-medium font-sans transition-colors ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                  }`}>{t('cart.empty')}</p>
                  <button 
                    onClick={onClose}
                    className={`text-sm font-semibold underline underline-offset-4 font-sans transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {t('cart.continue')}
                  </button>
                </div>
              ) : (
                items.map((item, index) => {
                  const p = translateProduct(item);
                  return (
                    <div key={`${p.id}-${p.selectedSize || ''}-${p.selectedColor || ''}-${index}`} className="flex space-x-4">
                      <div className={`w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 transition-colors ${
                        theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'
                      }`}>
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <h3 className={`text-sm font-medium transition-colors ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>{p.name}</h3>
                            <button 
                              onClick={() => onRemove(p.id, item.selectedSize, item.selectedColor)}
                              className={`transition-colors ${
                                theme === 'dark' ? 'text-zinc-600 hover:text-red-500' : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {item.selectedSize && (
                              <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors ${
                                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                              }`}>{t('cart.size')}: {translateSizeName(item.selectedSize)}</p>
                            )}
                            {item.selectedColor && (
                              <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                              }`}>{t('cart.color')}: {translateColorName(item.selectedColor)}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {p.discount_price ? (
                              <>
                                <p className="text-xs font-bold text-red-500">{formatCurrency(p.discount_price)}</p>
                                <p className={`text-[10px] line-through transition-colors ${
                                  theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
                                }`}>{formatCurrency(p.price)}</p>
                              </>
                            ) : (
                              <p className={`text-xs transition-colors ${
                                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                              }`}>{formatCurrency(p.price)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
                            theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
                          }`}>
                            <button 
                              onClick={() => onUpdateQuantity(p.id, -1, item.selectedSize, item.selectedColor)}
                              disabled={item.quantity <= 1}
                              className={`p-1 disabled:opacity-30 transition-colors ${
                                theme === 'dark' ? 'hover:bg-zinc-900 text-white' : 'hover:bg-gray-100 text-black'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`text-xs font-medium w-8 text-center transition-colors ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(p.id, 1, item.selectedSize, item.selectedColor)}
                              className={`p-1 transition-colors ${
                                theme === 'dark' ? 'hover:bg-zinc-900 text-white' : 'hover:bg-gray-100 text-black'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className={`text-sm font-bold uppercase transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}>{formatCurrency((p.discount_price || p.price) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className={`p-6 border-t space-y-4 transition-colors ${
                theme === 'dark' ? 'border-zinc-900' : 'border-gray-100'
              }`}>
                <div className={`space-y-2 border-t pt-4 mb-4 transition-colors ${
                  theme === 'dark' ? 'border-zinc-900' : 'border-gray-100'
                }`}>
                  <div className={`flex justify-between items-center text-sm transition-colors ${
                    theme === 'dark' ? 'text-zinc-550' : 'text-gray-550'
                  }`}>
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className={`flex justify-between items-center text-sm transition-colors ${
                    theme === 'dark' ? 'text-zinc-550' : 'text-gray-550'
                  }`}>
                    <span>{t('cart.shipping')}</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-bold uppercase tracking-wider">{t('cart.free')}</span>
                    ) : (
                      <span className={theme === 'dark' ? 'text-white' : 'text-black'}>{formatCurrency(shippingCost)}</span>
                    )}
                  </div>
                  {shippingCost > 0 && (
                    <p className={`text-[10px] italic transition-colors ${
                      theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                    }`}>{t('cart.addMoreForFree').replace('{amount}', formatCurrency(10000 - total))}</p>
                  )}
                </div>

                <div className={`p-4 rounded-xl border mb-2 transition-colors ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'
                }`}>
                  <p className={`text-[10px] leading-relaxed transition-colors font-medium ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                  }`}>
                    <span className="font-bold uppercase tracking-tighter">{t('cart.note')}</span> {t('cart.noteDesc')}
                  </p>
                </div>

                <div className={`flex justify-between items-center text-lg font-bold uppercase italic transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  <span>{t('cart.total')}</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <Link 
                  to="/checkout"
                  onClick={onClose}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                    theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <span>{t('cart.checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
