import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../types';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { sortCategories, getCategoryImage } from '../lib/categories';
import LazyCategoryImage from '../components/LazyCategoryImage';

interface CategoriesProps {
  categories: Category[];
  products: Product[];
  loading: boolean;
}

export default function Categories({ categories, products, loading }: CategoriesProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, translateCategoryName } = useLanguage();

  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

  return (
    <div className={`py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2 ${
            theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-gray-50 text-black'
          }`}>
            <LayoutGrid className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${
            theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
          }`}>{t('cat.organized')}</span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>{t('cat.title')}</h1>
          <p className={`text-lg leading-relaxed ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            {t('cat.desc')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-[400px] rounded-[2.5rem] animate-pulse ${
                theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'
               }`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCategories.map((category, idx) => {
              const bgImage = getCategoryImage(category, products);
              const name = translateCategoryName(category.name);

              return (
                <motion.div
                  key={category.Id || idx}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/shop?category=${category.Id}`)}
                  className={`relative h-[450px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 m-1 ${
                    theme === 'dark' ? 'border border-zinc-900' : 'border border-transparent'
                  }`}
                >
                  <LazyCategoryImage 
                    src={bgImage} 
                    alt={name}
                    width={800}
                    height={1000}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">{name}</h3>
                    <div className="flex items-center space-x-2 text-white/60 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                      <span>{t('cat.viewBtn')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
