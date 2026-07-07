import { ShoppingCart, Search, Menu, X, ArrowRight, Sun, Moon, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Category } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  products: Product[];
  categories?: Category[];
  cartCount: number;
  onCartToggle: () => void;
}

export default function Navbar({ products, categories = [], cartCount, onCartToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, formatCurrency, translateCategoryName } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = React.useRef<HTMLDivElement>(null);

  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const productsDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = searchQuery.trim() 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 backdrop-blur-md border-b ${
        theme === 'dark' ? 'bg-[#000000]/85 border-zinc-900' : 'bg-white/85 border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center" aria-label="DD Design Atelje Home">
              <img 
                src="https://images.weserv.nl/?url=64.media.tumblr.com/85a2897f98a2b096033b5b7b2baa4305/941158d434c8785d-07/s1280x1920/1770317d73e6ae1e7a6940ed7119efd4f78c57ce.jpg" 
                alt="DD Design Logo" 
                className={`h-10 w-auto object-contain rounded-sm transition-all duration-300 ${theme === 'dark' ? 'invert-0' : 'invert'}`}
                referrerPolicy="no-referrer"
              />
            </Link>
 
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('nav.home')}</Link>
              
              {/* Products Dropdown */}
              <div className="relative" ref={productsDropdownRef}>
                <button
                  onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    isProductsDropdownOpen 
                      ? (theme === 'dark' ? 'text-white' : 'text-black')
                      : (theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black')
                  }`}
                  aria-expanded={isProductsDropdownOpen}
                >
                  <span>{t('nav.products')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isProductsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute left-0 mt-2 py-2 w-56 rounded-2xl border shadow-2xl z-[90] overflow-hidden backdrop-blur-xl ${
                        theme === 'dark' 
                          ? 'bg-black/95 border-zinc-850 text-zinc-300' 
                          : 'bg-white/95 border-gray-100 text-gray-700'
                      }`}
                    >
                      {/* Option for ALL products */}
                      <button
                        onClick={() => {
                          navigate('/shop');
                          setIsProductsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                          theme === 'dark' ? 'hover:bg-zinc-900/50 hover:text-white' : 'hover:bg-gray-50 hover:text-black'
                        } border-b ${theme === 'dark' ? 'border-zinc-900' : 'border-gray-150'}`}
                      >
                        {language === 'sr' ? 'Svi Proizvodi' : language === 'ru' ? 'Все Продукты' : 'All Products'}
                      </button>
                      
                      {categories.map((category, idx) => (
                        <button
                          key={category.Id || idx}
                          onClick={() => {
                            navigate(`/shop?category=${category.Id}`);
                            setIsProductsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                            theme === 'dark' ? 'hover:bg-zinc-900/50 hover:text-white' : 'hover:bg-gray-50 hover:text-black'
                          }`}
                        >
                          {translateCategoryName(category.name)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/nova-kolekcija" className={`text-sm font-medium transition-colors uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('nav.new')}</Link>
              <Link to="/editorijali" className={`text-sm font-medium transition-colors uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('nav.editorial')}</Link>
              <Link to="/saradnje" className={`text-sm font-medium transition-colors uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('nav.press')}</Link>
              <Link to="/snizenja" className="text-sm font-light italic text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest text-[10px]">{t('nav.sale')}</Link>
            </div>
 
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Elegant Language Switcher Selection */}
              <div className="relative border-r border-zinc-800/10 dark:border-zinc-100/15 pr-3 mr-1" ref={langDropdownRef}>
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border transition-all ${
                    theme === 'dark' 
                      ? 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950/20' 
                      : 'border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 bg-gray-50/20'
                  }`}
                  aria-expanded={isLangDropdownOpen}
                  aria-haspopup="true"
                  title="Jezik / Language"
                >
                  <span className="font-serif text-[12px] font-bold tracking-normal leading-none mt-0.5">文</span>
                  <span className="text-[9px] uppercase font-mono tracking-widest">{language}</span>
                </button>
                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 py-2 w-32 rounded-2xl border shadow-2xl z-[90] overflow-hidden backdrop-blur-xl ${
                        theme === 'dark' 
                          ? 'bg-black/95 border-zinc-800 text-zinc-300' 
                          : 'bg-white/95 border-gray-100 text-gray-700'
                      }`}
                    >
                      {[
                        { code: 'sr', label: 'Srpski' },
                        { code: 'en', label: 'English' },
                        { code: 'ru', label: 'Русский' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[10px] uppercase tracking-wider font-semibold transition-all ${
                            language === lang.code
                              ? (theme === 'dark' ? 'bg-zinc-900 text-white font-bold' : 'bg-gray-100 text-black font-semibold')
                              : (theme === 'dark' ? 'hover:bg-zinc-900/50 hover:text-white' : 'hover:bg-gray-50 hover:text-black')
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={toggleTheme}
                className={`p-2 transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                title={theme === 'dark' ? t('nav.lightTheme') : t('nav.darkTheme')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                title="Pretraga"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={onCartToggle}
                className={`p-2 transition-colors relative ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                title="Korpa"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${
                    theme === 'dark' ? 'text-black bg-white' : 'text-white bg-black'
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                className={`md:hidden p-2 transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
 
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t overflow-hidden transition-colors ${
                theme === 'dark' ? 'bg-[#000000]' : 'bg-white border-gray-100'
              }`}
            >
              <div className="px-4 py-6 space-y-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className={`block text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('nav.home')}</Link>
                
                {/* Collapsible Products Categories menu for mobile */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                    className={`flex items-center justify-between w-full text-lg font-medium text-left ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    <span>{t('nav.products')}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isProductsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pt-2 pb-2 space-y-3 flex flex-col border-l border-zinc-200 dark:border-zinc-800 ml-1"
                      >
                        <Link 
                          to="/shop" 
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsProductsDropdownOpen(false);
                          }} 
                          className={`text-sm ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                        >
                          {language === 'sr' ? 'Svi Proizvodi' : language === 'ru' ? 'Все Продукты' : 'All Products'}
                        </Link>
                        {categories.map((category, idx) => (
                          <Link 
                            key={category.Id || idx}
                            to={`/shop?category=${category.Id}`}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsProductsDropdownOpen(false);
                            }}
                            className={`text-sm ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                          >
                            {translateCategoryName(category.name)}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/nova-kolekcija" onClick={() => setIsMenuOpen(false)} className={`block text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('nav.new')}</Link>
                <Link to="/editorijali" onClick={() => setIsMenuOpen(false)} className={`block text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('nav.editorial')}</Link>
                <Link to="/saradnje" onClick={() => setIsMenuOpen(false)} className={`block text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('nav.press')}</Link>
                <Link to="/snizenja" onClick={() => setIsMenuOpen(false)} className="block text-lg font-light italic text-red-500">{t('nav.sale')}</Link>
                
                {/* Mobile Language Choices */}
                <div className="flex flex-col pt-6 gap-2 border-t border-zinc-800/10 dark:border-zinc-100/10">
                  <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    Izaberite jezik / Select Language
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Select language">
                    {[
                      { code: 'sr', label: 'Srpski' },
                      { code: 'en', label: 'English' },
                      { code: 'ru', label: 'Русский' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setIsMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-all rounded-full border ${
                          language === lang.code
                            ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                            : (theme === 'dark' ? 'border-zinc-800 text-zinc-500 hover:text-white' : 'border-gray-200 text-gray-400 hover:text-black')
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[60] overflow-y-auto transition-colors duration-500 ${
              theme === 'dark' ? 'bg-[#000000]' : 'bg-white'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className={`p-2 transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="mt-20 max-w-3xl mx-auto text-center">
                <span className={`text-[10px] font-light italic uppercase tracking-[0.3em] mb-4 block ${theme === 'dark' ? 'text-zinc-550' : 'text-gray-400'}`}>{t('nav.searchStore')}</span>
                <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                  <div className="relative group">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.searchPlaceholder')}
                      className={`w-full border-none focus:ring-0 px-12 py-6 rounded-[2rem] text-xl md:text-2xl font-light italic tracking-wide text-center transition-all ${
                        theme === 'dark' 
                          ? 'bg-zinc-900 text-white placeholder:text-zinc-700' 
                          : 'bg-gray-50 text-black placeholder:text-gray-300'
                      }`}
                    />
                    <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${
                      theme === 'dark' ? 'text-zinc-700 group-focus-within:text-white' : 'text-gray-300 group-focus-within:text-black'
                    }`} />
                  </div>
                  {searchQuery.trim() && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="submit"
                      className={`mt-8 flex items-center space-x-2 mx-auto font-light italic uppercase tracking-widest text-xs hover:opacity-70 transition-all ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      <span>{t('nav.showResults')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </form>

                {searchQuery.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16 text-left"
                  >
                    <div className={`flex justify-between items-center mb-8 border-b pb-4 ${theme === 'dark' ? 'border-zinc-900' : 'border-gray-100'}`}>
                      <span className={`text-[10px] font-light italic uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t('nav.resultsFor')} "{searchQuery}" ({filteredResults.length})</span>
                      {filteredResults.length > 0 && (
                        <button 
                          onClick={handleSearch}
                          className={`text-[10px] font-light italic uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                        >
                          Prikaži sve
                        </button>
                      )}
                    </div>

                    {filteredResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {filteredResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="group"
                          >
                            <div className={`aspect-[3/4] rounded-2xl overflow-hidden mb-4 transition-colors ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <h4 className={`text-sm font-bold uppercase tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{product.name}</h4>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{product.category}</p>
                            <p className="text-sm font-bold mt-2">
                              {product.discount_price ? (
                                <span className="text-red-500">{formatCurrency(product.discount_price)}</span>
                              ) : (
                                <span className={theme === 'dark' ? 'text-white' : 'text-black'}>{formatCurrency(product.price)}</span>
                              )}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <p className={`text-sm italic ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>{t('nav.noResults')}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
