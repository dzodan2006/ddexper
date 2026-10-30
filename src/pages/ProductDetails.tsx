import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  CornerUpLeft, 
  Ruler,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import SizeChart from '../components/SizeChart';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailsProps {
  products: Product[];
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
}

export default function ProductDetails({ products, onAddToCart }: ProductDetailsProps) {
  const { theme } = useTheme();
  const { t, translateProduct, formatCurrency } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const rawProduct = products.find(p => p.id === id);
  const product = translateProduct(rawProduct);

  const images = product?.all_images && product.all_images.length > 0 
    ? product.all_images 
    : (product?.image_url ? [product.image_url] : []);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  if (!product) {
    return (
      <div className="py-40 text-center">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('product.notFound')}</h2>
        <button 
          onClick={() => navigate('/shop')}
          className={`underline underline-offset-4 ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
        >
          {t('product.backToShop')}
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert(t('product.alertSize'));
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert(t('product.alertColor'));
      return;
    }
    onAddToCart(product, selectedSize, selectedColor);
  };

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center space-x-2 text-sm transition-colors mb-12 ${
          theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-500 hover:text-black'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('product.backBtn')}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:items-start">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="relative group">
            <motion.div 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors m-1 ${
                theme === 'dark' ? 'bg-zinc-900 border border-zinc-950/20' : 'bg-gray-100 border border-zinc-200/10'
              }`}
            >
              <img 
                src={images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === 'dark' ? 'bg-zinc-800/80 hover:bg-zinc-700 text-white' : 'bg-white/80 hover:bg-white text-black'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === 'dark' ? 'bg-zinc-800/80 hover:bg-zinc-700 text-white' : 'bg-white/80 hover:bg-white text-black'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[4/5] rounded-2xl overflow-hidden transition-all ${
                    activeImage === idx 
                      ? (theme === 'dark' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'ring-2 ring-black ring-offset-2 ring-offset-white') 
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} thumbnail ${idx + 1}`} referrerPolicy="no-referrer" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`text-xs font-light italic uppercase tracking-widest transition-colors ${
                theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
              }`}>
                {product.category || t('product.detailsCategory')}
              </span>
              {product.new_collection && (
                <span className={`text-[10px] font-light italic uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
                  {t('product.badgeNew')}
                </span>
              )}
            </div>
            <h1 className={`text-4xl md:text-5xl font-extralight tracking-wide mb-4 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>{product.name}</h1>
            <div className="flex items-baseline space-x-4">
              {product.discount_price ? (
                <>
                  <p className="text-3xl font-light italic text-red-600">{formatCurrency(product.discount_price)}</p>
                  <p className={`text-lg line-through transition-colors ${
                    theme === 'dark' ? 'text-zinc-650' : 'text-gray-400'
                  }`}>{formatCurrency(product.price)}</p>
                </>
              ) : (
                <p className={`text-3xl font-light italic transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{formatCurrency(product.price)}</p>
              )}
            </div>
          </div>

          <div className={`prose prose-sm leading-relaxed max-w-none transition-colors ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-650'
          }`}>
            {product.description?.includes('\n') ? (
              <ul className="space-y-2 list-none p-0">
                {product.description.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                  <li key={index} className="flex px-0">
                    <span className={`mr-3 font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>•</span>
                    <span>{line.trim()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{product.description}</p>
            )}
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-light italic uppercase tracking-widest transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>{t('product.selectSize')}</h4>
                <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  className={`flex items-center space-x-1.5 text-xs font-light italic transition-colors uppercase tracking-widest ${
                    theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{t('product.sizeChartBtn')}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size: any, idx: number) => (
                  <button
                    key={size.id ? `${size.id}-${idx}` : idx}
                    onClick={() => setSelectedSize(String(size.name))}
                    className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedSize === size.name
                        ? (theme === 'dark' ? 'bg-white text-black border-white shadow-lg shadow-white/5' : 'bg-black text-white border-black shadow-lg shadow-black/5')
                        : (theme === 'dark' ? 'bg-zinc-900 text-zinc-450 border-zinc-800 hover:border-white' : 'bg-white text-gray-600 border-gray-200 hover:border-black')
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="space-y-4 pt-4 border-t border-zinc-800 transition-colors" style={{ borderColor: theme === 'dark' ? '#1f1f1f' : '#f3f4f6' }}>
            <h4 className={`text-sm font-light italic uppercase tracking-widest transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>{t('product.selectColor')}</h4>
            
            {product.colors && product.colors.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color: any, idx: number) => (
                  <button
                    key={color.id ? `${color.id}-${idx}` : idx}
                    onClick={() => setSelectedColor(String(color.name))}
                    className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedColor === color.name
                        ? (theme === 'dark' ? 'bg-white text-black border-white shadow-lg shadow-white/5' : 'bg-black text-white border-black shadow-lg shadow-black/5')
                        : (theme === 'dark' ? 'bg-zinc-900 text-zinc-450 border-zinc-800 hover:border-white' : 'bg-white text-gray-600 border-gray-200 hover:border-black')
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className={`text-xs italic transition-colors ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`}>{t('product.noColors')}</p>
            )}
          </div>

          <div className="space-y-4 pt-6">
            <div className={`p-4 rounded-2xl border flex items-start space-x-3 transition-colors ${
              theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-600'
            }`}>
              <div className="shrink-0 p-1">
                <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                {t('product.handmadeNotice')}
              </p>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === false}
              className={`w-full py-5 rounded-2xl font-light italic uppercase tracking-widest flex items-center justify-center space-x-3 transition-all shadow-xl ${
                product.stock === false 
                ? (theme === 'dark' ? 'bg-zinc-800 text-zinc-650' : 'bg-gray-200 text-gray-400') + ' cursor-not-allowed shadow-none' 
                : (theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-900')
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{product.stock === false ? t('product.soldOut') : t('product.addBtn')}</span>
            </button>
            <p className={`text-xs text-center transition-colors ${
              theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
            }`}>{t('product.paymentTagline')}</p>

            {/* Bespoke / Izrada po meri Notice */}
            <div className={`p-4 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-zinc-950/60 border-amber-500/20 text-zinc-300'
                : 'bg-amber-50/40 border-amber-200/60 text-gray-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                  <Scissors className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>
                      Izrada po meri
                    </h5>
                    <Link
                      to="/editorijali?prica=po-meri"
                      className="text-[11px] font-semibold text-amber-500 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Detaljnije</span>
                      <span>→</span>
                    </Link>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-400">
                    Ovaj model se može izraditi prema vašim individualnim merama i prilagoditi specifičnostima prilike.
                  </p>
                </div>
              </div>
            </div>

            {/* Natural Silk & Fabric Guide Link */}
            <div className={`p-4 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                : 'bg-gray-50/60 border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-zinc-800/60 text-zinc-300 dark:text-zinc-300 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Plemeniti materijali & Nega
                    </h5>
                    <Link
                      to="/editorijali?prica=taft"
                      className={`text-[11px] font-semibold hover:underline inline-flex items-center gap-0.5 ${theme === 'dark' ? 'text-zinc-300' : 'text-black'}`}
                    >
                      <span>Vodič o svili</span>
                      <span>→</span>
                    </Link>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    Saznajte više o taft, šantung i grež svili, prirodnim higijenskim svojstvima i načinu održavanja.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t transition-colors ${
            theme === 'dark' ? 'border-zinc-900' : 'border-gray-100'
          }`}>
            <div className="flex items-start space-x-3">
              <Truck className={`w-5 h-5 mt-0.5 transition-colors ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`} />
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-tight transition-colors ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-black'
                }`}>{t('product.deliveryTitle')}</h4>
                <p className={`text-xs mt-1 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
                }`}>{t('product.deliveryDesc1')}</p>
                <p className={`text-[10px] mt-0.5 leading-tight italic transition-colors font-medium ${
                  theme === 'dark' ? 'text-zinc-700 font-normal' : 'text-gray-400'
                }`}>{t('product.deliveryDesc2')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ShieldCheck className={`w-5 h-5 mt-0.5 transition-colors ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`} />
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-tight transition-colors ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-black'
                }`}>{t('product.securityTitle')}</h4>
                <p className={`text-xs mt-1 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
                }`}>{t('product.securityDesc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CornerUpLeft className={`w-5 h-5 mt-0.5 transition-colors ${
                theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
              }`} />
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-tight transition-colors ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-black'
                }`}>{t('product.returnTitle')}</h4>
                <p className={`text-xs mt-1 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600' : 'text-gray-500'
                }`}>{t('product.returnDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SizeChart 
        isOpen={isSizeChartOpen} 
        onClose={() => setIsSizeChartOpen(false)} 
      />
    </div>
  );
}
