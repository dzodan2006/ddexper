import { motion } from 'motion/react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface NewCollectionProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
}

export default function NewCollection({ products, loading, onAddToCart }: NewCollectionProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const newProducts = products.filter(p => p.new_collection === true);

  return (
    <div className={`py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2 ${
            theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-gray-50 text-black'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${
            theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
          }`}>{t('new.subtitle')}</span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>{t('new.title')}</h1>
          <p className={`text-lg leading-relaxed ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            {t('new.desc')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className={`aspect-[3/4] rounded-[2rem] ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`} />
                <div className={`h-4 rounded w-3/4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`} />
                <div className={`h-4 rounded w-1/4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`} />
              </div>
            ))}
          </div>
        ) : newProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-gray-400 text-lg italic">{t('new.empty')}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
