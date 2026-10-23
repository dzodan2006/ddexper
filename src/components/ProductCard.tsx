import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { optimizeImageUrl } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  key?: React.Key;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { theme } = useTheme();
  const { t, translateProduct } = useLanguage();
  const [showSizes, setShowSizes] = React.useState(false);

  const p = translateProduct(product);

  // Reset showSizes when product changes or hover ends (though hover end reset is optional)
  React.useEffect(() => {
    setShowSizes(false);
  }, [p.id]);

  const handleMouseLeave = () => {
    setShowSizes(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseLeave={handleMouseLeave}
      className="group relative"
    >
      <div className={`aspect-[4/5] w-full overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-[1.02] ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'
      }`}>
        <Link 
          to={`/product/${p.id}`} 
          className="block h-full w-full"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        >
          <img
            src={optimizeImageUrl(p.image_url, 400)}
            alt={p.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            draggable="false"
            loading="lazy"
            width={400}
            height={500}
          />
        </Link>
        <div className="absolute inset-0 bg-black/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {p.new_collection && (
            <span className={`text-[8px] md:text-[9px] font-light italic uppercase tracking-widest px-2 py-1 rounded-full shadow-lg transition-colors ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              {t('product.badgeNew')}
            </span>
          )}
          {p.discount_price && (
            <span className="bg-red-500 text-white text-[8px] md:text-[9px] font-light italic uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
              {t('product.badgeSale')}
            </span>
          )}
        </div>
        
        <div className={`absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10`}>
          {p.stock === false ? (
            <div className={`w-full py-2 rounded-lg text-[10px] md:text-xs font-medium shadow-xl flex items-center justify-center space-x-1.5 backdrop-blur-sm ${
              theme === 'dark' ? 'bg-zinc-800/90 text-zinc-500' : 'bg-gray-200/90 text-gray-400'
            }`}>
              <span>{t('product.soldOut')}</span>
            </div>
          ) : p.colors && p.colors.length > 0 ? (
            <Link 
              to={`/product/${p.id}`}
              className={`w-full py-2 rounded-lg text-[9px] md:text-[10px] font-light italic uppercase tracking-widest shadow-xl flex items-center justify-center space-x-1.5 backdrop-blur-sm transition-all active:scale-95 ${
                theme === 'dark' ? 'bg-white/90 text-black hover:bg-white' : 'bg-black/90 text-white hover:bg-black'
              }`}
            >
              <span>{t('product.selectOptions')}</span>
            </Link>
          ) : p.sizes && p.sizes.length > 0 ? (
            <div className="w-full">
              {!showSizes ? (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSizes(true);
                  }}
                  className={`w-full py-2 rounded-lg text-[9px] md:text-[10px] font-light italic uppercase tracking-widest shadow-xl flex items-center justify-center space-x-1.5 backdrop-blur-sm transition-all active:scale-95 ${
                    theme === 'dark' ? 'bg-white/90 text-black hover:bg-white' : 'bg-black/90 text-white hover:bg-black'
                  }`}
                >
                  <span>{t('product.selectSize')}</span>
                </button>
              ) : (
                <div className="flex flex-wrap gap-1 justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {p.sizes.map((size, idx) => (
                    <button
                      key={size.id ? `${size.id}-${idx}` : idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddToCart(p, String(size.name));
                        setShowSizes(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-[9px] md:text-[10px] font-light italic uppercase tracking-wider shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
                        theme === 'dark' 
                          ? 'bg-white text-black hover:bg-zinc-100' 
                          : 'bg-black text-white hover:bg-zinc-800'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(p);
              }}
              className={`w-full py-2 rounded-lg text-[9px] md:text-[10px] font-light italic uppercase tracking-widest shadow-xl flex items-center justify-center space-x-1.5 backdrop-blur-sm transition-all active:scale-95 ${
                theme === 'dark' ? 'bg-white/90 text-black hover:bg-white' : 'bg-black/90 text-white hover:bg-black'
              }`}
            >
              <ShoppingCart className="w-3 h-3" />
              <span>{t('product.addBtn')}</span>
            </button>
          )}
        </div>
      </div>
      
      <Link to={`/product/${p.id}`} className="mt-2 flex justify-between items-start gap-1">
        <div className="min-w-0">
          <h3 className={`text-xs md:text-sm font-medium group-hover:underline truncate transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{p.name}</h3>
          <p className="mt-0.5 text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider truncate">{p.category || 'Ostalo'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {p.discount_price ? (
            <div className="flex flex-col items-end">
              <span className="text-[11px] md:text-sm font-light italic text-red-500 leading-none">{p.discount_price.toLocaleString()} {t('product.currencySymbol')}</span>
              <span className={`text-[9px] md:text-[10px] line-through mt-0.5 transition-colors ${
                theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
              }`}>{p.price.toLocaleString()} {t('product.currencySymbol')}</span>
            </div>
          ) : (
            <p className={`text-[11px] md:text-sm font-light italic transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{p.price.toLocaleString()} {t('product.currencySymbol')}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
