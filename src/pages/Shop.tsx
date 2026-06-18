import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, X, SlidersHorizontal, ChevronDown, ArrowUpDown, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, useMotionValue } from 'motion/react';

interface ShopProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
}

export default function Shop({ products, categories, loading, onAddToCart }: ShopProps) {
  const { theme } = useTheme();
  const { t, translateCategoryName, formatCurrency } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'Sve';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory);
  const [scrollProgress, setScrollProgress] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const categoriesInnerRef = useRef<HTMLDivElement>(null);
  const xCategories = useMotionValue(0);
  
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [priceLimit, setPriceLimit] = useState<number>(20000);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const initialSort = searchParams.get('sort') || 'default';
  const [sortType, setSortType] = useState(initialSort);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.price));
      setPriceLimit(highestPrice);
      
      const currentMin = searchParams.get('minPrice');
      const currentMax = searchParams.get('maxPrice');
      
      if (currentMin) setMinPrice(Number(currentMin));
      if (currentMax) {
        setMaxPrice(Number(currentMax));
      } else {
        setMaxPrice(highestPrice);
      }
    }
  }, [products]);

  const handleDragScroll = (infoValue: number) => {
    if (categoriesInnerRef.current && categoriesRef.current) {
      const scrollWidth = categoriesInnerRef.current.scrollWidth - categoriesRef.current.offsetWidth;
      const progress = -infoValue / scrollWidth;
      setScrollProgress(Math.max(0, Math.min(1, isNaN(progress) ? 0 : progress)));
    }
  };

  useEffect(() => {
    const unsub = xCategories.onChange(v => handleDragScroll(v));
    return () => unsub();
  }, []);

  const [catConstraints, setCatConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (categoriesRef.current && categoriesInnerRef.current) {
        setCatConstraints({
          left: -(categoriesInnerRef.current.scrollWidth - categoriesRef.current.offsetWidth),
          right: 0,
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    const timer = setTimeout(updateConstraints, 500);
    return () => {
      window.removeEventListener('resize', updateConstraints);
      clearTimeout(timer);
    };
  }, [categories, loading]);

  const allCategories = [{ id: 'Sve', Id: 'Sve', name: 'Sve' }, ...categories.map(c => ({ ...c, Id: String(c.Id) }))];
  const totalDots = 3;

  useEffect(() => {
    const q = searchParams.get('search');
    const c = searchParams.get('category');
    const mip = searchParams.get('minPrice');
    const mxp = searchParams.get('maxPrice');
    const s = searchParams.get('sort');
    if (q !== null) setSearchQuery(q);
    if (c !== null) setSelectedCategoryId(c);
    if (mip !== null) setMinPrice(Number(mip));
    if (mxp !== null) setMaxPrice(Number(mxp));
    if (s !== null) setSortType(s);
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams: { [key: string]: string } = {};
    if (val) newParams.search = val;
    if (selectedCategoryId !== 'Sve') newParams.category = selectedCategoryId;
    if (minPrice > 0) newParams.minPrice = String(minPrice);
    if (maxPrice < priceLimit) newParams.maxPrice = String(maxPrice);
    if (sortType !== 'default') newParams.sort = sortType;
    setSearchParams(newParams);
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategoryId(id);
    const newParams: { [key: string]: string } = {};
    if (searchQuery) newParams.search = searchQuery;
    if (id !== 'Sve') newParams.category = id;
    if (minPrice > 0) newParams.minPrice = String(minPrice);
    if (maxPrice < priceLimit) newParams.maxPrice = String(maxPrice);
    if (sortType !== 'default') newParams.sort = sortType;
    setSearchParams(newParams);
  };

  const handleMinPriceChange = (val: number) => {
    const finalVal = Math.min(val, maxPrice);
    setMinPrice(finalVal);
    const newParams: { [key: string]: string } = {};
    if (searchQuery) newParams.search = searchQuery;
    if (selectedCategoryId !== 'Sve') newParams.category = selectedCategoryId;
    if (finalVal > 0) newParams.minPrice = String(finalVal);
    if (maxPrice < priceLimit) newParams.maxPrice = String(maxPrice);
    if (sortType !== 'default') newParams.sort = sortType;
    setSearchParams(newParams);
  };

  const handleMaxPriceChange = (val: number) => {
    const finalVal = Math.max(val, minPrice);
    setMaxPrice(finalVal);
    const newParams: { [key: string]: string } = {};
    if (searchQuery) newParams.search = searchQuery;
    if (selectedCategoryId !== 'Sve') newParams.category = selectedCategoryId;
    if (minPrice > 0) newParams.minPrice = String(minPrice);
    if (finalVal < priceLimit) newParams.maxPrice = String(finalVal);
    if (sortType !== 'default') newParams.sort = sortType;
    setSearchParams(newParams);
  };

  const handleSortChange = (val: string) => {
    setSortType(val);
    const newParams: { [key: string]: string } = {};
    if (searchQuery) newParams.search = searchQuery;
    if (selectedCategoryId !== 'Sve') newParams.category = selectedCategoryId;
    if (minPrice > 0) newParams.minPrice = String(minPrice);
    if (maxPrice < priceLimit) newParams.maxPrice = String(maxPrice);
    if (val !== 'default') newParams.sort = val;
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    const newParams: { [key: string]: string } = {};
    if (selectedCategoryId !== 'Sve') newParams.category = selectedCategoryId;
    if (minPrice > 0) newParams.minPrice = String(minPrice);
    if (maxPrice < priceLimit) newParams.maxPrice = String(maxPrice);
    if (sortType !== 'default') newParams.sort = sortType;
    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = selectedCategoryId === 'Sve' || String(product.category_id) === String(selectedCategoryId);
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortType === 'price-asc') {
      return [...filtered].sort((a, b) => {
        const pA = a.discount_price ?? a.price;
        const pB = b.discount_price ?? b.price;
        return pA - pB;
      });
    } else if (sortType === 'price-desc') {
      return [...filtered].sort((a, b) => {
        const pA = a.discount_price ?? a.price;
        const pB = b.discount_price ?? b.price;
        return pB - pA;
      });
    } else if (sortType === 'newest') {
      return [...filtered].sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (tB !== tA) return tB - tA;
        return String(b.id).localeCompare(String(a.id));
      });
    } else if (sortType === 'alphabetical') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'sr'));
    }

    return filtered;
  }, [products, searchQuery, selectedCategoryId, minPrice, maxPrice, sortType]);

  const activeCategory = allCategories.find(c => String(c.Id) === String(selectedCategoryId));

  return (
    <div className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col space-y-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className={`text-5xl md:text-7xl font-extralight tracking-wide uppercase italic transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>{t('shop.title')}</h1>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Search Box */}
          <div className="relative w-full lg:w-80 group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              theme === 'dark' ? 'text-zinc-650 group-focus-within:text-white' : 'text-gray-400 group-focus-within:text-black'
            }`} />
            <input 
              type="text" 
              placeholder={t('shop.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full border pl-11 pr-10 py-3.5 rounded-full text-xs transition-with-all focus:outline-none focus:ring-1 ${
                theme === 'dark' 
                  ? 'bg-[#000000] border-zinc-900 focus:border-zinc-700 focus:ring-zinc-800 text-white placeholder:text-zinc-750' 
                  : 'bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-200 text-black placeholder:text-gray-400'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                  theme === 'dark' ? 'text-zinc-600 hover:text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Three Beautiful Minimalist Dropdown Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* 1. Kategorije Dropdown Group */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowCategoryMenu(!showCategoryMenu);
                  setShowPriceFilter(false);
                  setShowSortOptions(false);
                }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-full border text-[10px] font-light italic uppercase tracking-widest transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#000000] border-zinc-900 hover:border-zinc-700 text-white' 
                    : 'bg-white border-gray-200 hover:border-gray-300 text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('shop.filterCategory')}: {
                  activeCategory?.name === 'Sve' ? t('shop.filterAllCategory') : translateCategoryName(activeCategory?.name || 'Sve')
                }</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryMenu && (
                <div className={`absolute top-full left-0 mt-3 p-4 rounded-3xl border shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200 w-64 ${
                  theme === 'dark' ? 'bg-[#000000] border-zinc-800' : 'bg-white border-gray-100'
                }`}>
                  <div className="flex flex-col space-y-1">
                    {allCategories.map((cat, index) => {
                      const localizedCatName = cat.name === 'Sve' ? t('shop.filterAllCategory') : translateCategoryName(cat.name);
                      return (
                        <button
                          key={cat.Id || `cat-${index}`}
                          onClick={() => {
                            handleCategoryChange(String(cat.Id));
                            setShowCategoryMenu(false);
                          }}
                          className={`text-left px-4 py-3 rounded-xl text-[10px] font-light italic uppercase tracking-wider transition-all ${
                            String(selectedCategoryId) === String(cat.Id)
                              ? (theme === 'dark' ? 'bg-white text-black font-medium' : 'bg-black text-white font-medium')
                              : (theme === 'dark' ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'hover:bg-gray-50 text-gray-500 hover:text-black')
                          }`}
                        >
                          {localizedCatName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Filter (Cena) Dropdown Group */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowPriceFilter(!showPriceFilter);
                  setShowCategoryMenu(false);
                  setShowSortOptions(false);
                }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-full border text-[10px] font-light italic uppercase tracking-widest transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#000000] border-zinc-900 hover:border-zinc-700 text-white' 
                    : 'bg-white border-gray-200 hover:border-gray-300 text-black'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t('shop.filterPrice')}{minPrice > 0 || maxPrice < priceLimit ? `: ${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}` : ''}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPriceFilter ? 'rotate-180' : ''}`} />
              </button>

              {showPriceFilter && (
                <div className={`absolute top-full left-0 mt-3 p-8 rounded-[2rem] border shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200 w-80 ${
                  theme === 'dark' ? 'bg-[#000000] border-zinc-800' : 'bg-white border-gray-100'
                }`}>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-light italic uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>Od</span>
                        <span className={`text-xs font-light italic ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{formatCurrency(minPrice)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={priceLimit} 
                        value={minPrice} 
                        onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                        className="w-full accent-black dark:accent-zinc-650 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-light italic uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>Do</span>
                        <span className={`text-xs font-light italic ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{formatCurrency(maxPrice)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={priceLimit} 
                        value={maxPrice} 
                        onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                        className="w-full accent-black dark:accent-white h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] uppercase font-light italic tracking-tight text-zinc-500 pt-4 border-t border-zinc-800/10 dark:border-zinc-800">
                      <span>{formatCurrency(minPrice)}</span>
                      <span>{formatCurrency(maxPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sortiranje Dropdown Group */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSortOptions(!showSortOptions);
                  setShowCategoryMenu(false);
                  setShowPriceFilter(false);
                }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-full border text-[10px] font-light italic uppercase tracking-widest transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#000000] border-zinc-900 hover:border-zinc-700 text-white' 
                    : 'bg-white border-gray-200 hover:border-gray-300 text-black'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{t('shop.sortLabel')}: {
                  sortType === 'price-asc' ? t('shop.sortPriceLow') :
                  sortType === 'price-desc' ? t('shop.sortPriceHigh') :
                  sortType === 'newest' ? t('shop.sortNewest') :
                  sortType === 'alphabetical' ? 'Naziv: A-Z' :
                  'Podrazumevano'
                }</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
              </button>

              {showSortOptions && (
                <div className={`absolute top-full left-0 mt-3 p-4 rounded-3xl border shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200 w-64 ${
                  theme === 'dark' ? 'bg-[#000000] border-zinc-800' : 'bg-white border-gray-100'
                }`}>
                  <div className="flex flex-col space-y-1">
                    {[
                      { value: 'default', label: 'Podrazumevano' },
                      { value: 'price-asc', label: t('shop.sortPriceLow') },
                      { value: 'price-desc', label: t('shop.sortPriceHigh') },
                      { value: 'newest', label: t('shop.sortNewest') },
                      { value: 'alphabetical', label: 'Naziv: A-Z' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleSortChange(opt.value);
                          setShowSortOptions(false);
                        }}
                        className={`text-left px-4 py-3 rounded-xl text-[10px] font-light italic uppercase tracking-wider transition-all/300 ${
                          sortType === opt.value
                            ? (theme === 'dark' ? 'bg-white text-black font-medium' : 'bg-black text-white font-medium')
                            : (theme === 'dark' ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'hover:bg-gray-50 text-gray-500 hover:text-black')
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={`skeleton-${i}`} className="animate-pulse space-y-4">
              <div className="aspect-[4/5] bg-zinc-900 rounded-2xl" />
              <div className="h-4 bg-zinc-900 w-3/4 rounded" />
              <div className="h-4 bg-zinc-900 w-1/4 rounded" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 animate-in fade-in duration-1000">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id || `prod-${index}`} 
              product={product} 
              onAddToCart={onAddToCart} 
            />
          ))}
        </div>
      ) : (
        <div className={`py-32 text-center border rounded-[3rem] transition-colors ${
          theme === 'dark' ? 'border-zinc-900 bg-[#0c0c0c]' : 'bg-gray-50 border-gray-100'
        }`}>
          <p className={`font-medium font-sans ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>{t('shop.empty')}</p>
        </div>
      )}
    </div>
  );
}
