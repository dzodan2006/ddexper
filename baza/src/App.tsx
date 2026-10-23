/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, getClientConfig, updateClientConfig, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON, DEFAULT_SUPABASE_SERVICE_ROLE, DEFAULT_SUPABASE_JWT_SECRET } from './supabaseClient';
import { Product, Category, Size, ProductImage, Color, Order } from './types';
import { sortCategories, sortProductsByCustomOrder } from '../../src/lib/categories';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import StatsOverview from './components/StatsOverview';
import SchemaManager from './components/SchemaManager';
import OrderManager from './components/OrderManager';
import NewsletterManager from './components/NewsletterManager';
import PromoCodeManager from './components/PromoCodeManager';
import { 
  ShoppingBag, 
  Layers, 
  BarChart3, 
  RefreshCw, 
  ExternalLink, 
  Database,
  HelpCircle,
  AlertCircle,
  Settings,
  Key,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Mail,
  Tag
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'schema' | 'promo' | 'stats' | 'orders' | 'newsletter'>('products');
  
  // Db Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Supabase client settings state
  const [config, setConfig] = useState(getClientConfig());
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(config.url);

  // Modals & Forms State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load everything on startup
  const loadAllData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMsg('');

    try {
      // 0. Fetch custom order config
      try {
        const ordRes = await fetch('/api/ordering');
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData.success) {
            if (Array.isArray(ordData.categoryOrder) && ordData.categoryOrder.length > 0) {
              localStorage.setItem('dd_category_order', JSON.stringify(ordData.categoryOrder));
            }
            if (Array.isArray(ordData.productOrder) && ordData.productOrder.length > 0) {
              localStorage.setItem('dd_product_order', JSON.stringify(ordData.productOrder));
            }
          }
        }
      } catch {
        // ignore
      }

      // 1. Fetch Categories
      const { data: cats, error: catsErr } = await supabase
        .from('categories')
        .select('*');
      if (catsErr) throw catsErr;

      // 2. Fetch Sizes (ordered by sort_order ascending)
      const { data: szs, error: szsErr } = await supabase
        .from('sizes')
        .select('*')
        .order('sort_order', { ascending: true });
      if (szsErr) throw szsErr;

      // 3. Fetch Products
      const { data: prods, error: prodsErr } = await supabase
        .from('products')
        .select('*');
      if (prodsErr) throw prodsErr;

      // 4. Fetch Images
      const { data: imgs, error: imgsErr } = await supabase
        .from('product_images')
        .select('*');
      if (imgsErr) throw imgsErr;

      // 5. Fetch Product Sizes
      const { data: prodSzs, error: prodSzsErr } = await supabase
        .from('product_sizes')
        .select('*');
      if (prodSzsErr) throw prodSzsErr;

      // 6. Fetch Colors (with resilient fallbacks for capitalisation)
      let cols: any[] = [];
      try {
        const { data: colorsRes, error: colorsErr } = await supabase
          .from('colors')
          .select('*');
        if (colorsErr) {
          const { data: colorsResCap, error: colorsErrCap } = await supabase
            .from('Colors')
            .select('*');
          if (colorsErrCap) throw colorsErrCap;
          cols = colorsResCap || [];
        } else {
          cols = colorsRes || [];
        }
      } catch (errCol) {
        console.warn('Colors table load warning:', errCol);
      }

      // 7. Fetch Product Colors
      let prodCols: any[] = [];
      try {
        const { data: prodColsRes, error: prodColsErr } = await supabase
          .from('product_colors')
          .select('*');
        if (prodColsErr) {
          const { data: prodColsResCap, error: prodColsErrCap } = await supabase
            .from('Product_colors')
            .select('*');
          if (prodColsErrCap) throw prodColsErrCap;
          prodCols = prodColsResCap || [];
        } else {
          prodCols = prodColsRes || [];
        }
      } catch (errPCD) {
        console.warn('Product_colors table load warning:', errPCD);
      }

      // 8. Fetch Orders
      let fetchedOrders: any[] = [];
      let fetchedOrderItems: any[] = [];
      try {
        const { data: ords, error: ordsErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (ordsErr) throw ordsErr;
        fetchedOrders = ords || [];

        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('*');
        if (itemsErr) throw itemsErr;
        fetchedOrderItems = items || [];
      } catch (errOrders) {
        console.warn('Orders/order_items load warning:', errOrders);
      }

      // Map everything
      const mappedProducts = (prods || []).map(prod => {
        // Matching images
        const matchingImages = (imgs || []).filter(img => Number(img.product_id) === Number(prod.id));

        // Matching sizes (deduplicated)
        const matchingSizesRaw = (prodSzs || [])
          .filter(ps => Number(ps.product_id) === Number(prod.id))
          .map(ps => (szs || []).find(s => Number(s.id) === Number(ps.size_id)))
          .filter(Boolean) as Size[];
        const matchingSizes = Array.from(new Map(matchingSizesRaw.map(s => [s.id, s])).values());

        // Matching colors (deduplicated)
        const matchingColorsRaw = (prodCols || [])
          .filter(pc => Number(pc.product_id) === Number(prod.id))
          .map(pc => (cols || []).find(c => Number(c.id) === Number(pc.color_id)))
          .filter(Boolean) as Color[];
        const matchingColors = Array.from(new Map(matchingColorsRaw.map(c => [c.id, c])).values());

        return {
          ...prod,
          images: matchingImages,
          sizes: matchingSizes,
          colors: matchingColors
        };
      });

      // Map orders
      const mappedOrders = fetchedOrders.map(order => {
        const matchingItems = fetchedOrderItems
          .filter(item => Number(item.order_id) === Number(order.id))
          .map(item => {
            const product = (prods || []).find(p => Number(p.id) === Number(item.product_id));
            const size = (szs || []).find(s => Number(s.id) === Number(item.size_id));
            const color = (cols || []).find(c => Number(c.id) === Number(item.color_id));

            return {
              ...item,
              product,
              size,
              color
            };
          });

        return {
          ...order,
          items: matchingItems
        };
      });

      // Update state
      setCategories(sortCategories(cats || []));
      setSizes(szs || []);
      setColors(cols || []);
      setProducts(sortProductsByCustomOrder(mappedProducts));
      setOrders(mappedOrders);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setErrorMsg(err.message || 'Neuspelo povezivanje sa bazom podataka. Proverite vezu sa serverom.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Delete product action
  const handleDeleteProduct = async (id: number) => {
    try {
      let isDeleted = false;

      // 1. Try server-side delete first (uses service role key to bypass RLS and reliably clear child rows)
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            isDeleted = true;
          }
        }
      } catch (srvErr) {
        console.warn('Backend product delete API call failed, falling back to direct Supabase client:', srvErr);
      }

      // 2. Direct Supabase fallback
      if (!isDeleted) {
        // Delete matching entries in Product_colors (Note capital P as per schema)
        const { error: colErr1 } = await supabase
          .from('Product_colors')
          .delete()
          .eq('product_id', id);

        if (colErr1) {
          // Fallback to lowercase table if exists
          await supabase
            .from('product_colors')
            .delete()
            .eq('product_id', id);
        }

        // Delete matching entries in product_sizes
        await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', id);

        // Delete matching entries in product_images
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', id);

        // Safely unlink from order_items if product was in an order
        try {
          await supabase
            .from('order_items')
            .update({ product_id: null })
            .eq('product_id', id);
        } catch (orderItemErr: any) {
          console.warn('Notice unlinking order_items:', orderItemErr?.message);
        }

        // Delete from products table
        const { error: prodError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (prodError) throw prodError;
      }

      // Reload all data
      await loadAllData(true);
    } catch (err: any) {
      console.error(err);
      alert('Greška pri brisanju proizvoda: ' + (err.message || 'Nepoznata greška.'));
    }
  };

  const handleOpenAddForm = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSaveSuccess = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    loadAllData(true);
  };

  const handleKeyModeChange = (mode: 'anon' | 'service_role') => {
    updateClientConfig(config.url, mode);
    const newConfig = getClientConfig();
    setConfig(newConfig);
    loadAllData(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white">
      
      {/* Top Ambient Highlight */}
      <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0"></div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-8 space-y-4 sm:space-y-6 flex flex-col">
        
        {/* Workspace Title Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-900/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-800 border border-zinc-700/60 text-indigo-400 rounded-2xl shrink-0 shadow-inner">
              <Database className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold font-display text-white leading-tight">
                  DDDesign baza proizvoda
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Vlasnički panel
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upravljanje proizvodima, narudžbinama i marketingom
              </p>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="flex bg-zinc-950 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-zinc-800/80 w-full lg:w-auto shrink-0 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 lg:flex-none py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 bg-transparent'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
              <span>Proizvodi</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex-1 lg:flex-none py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 bg-transparent'
              }`}
            >
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
              <span className="hidden sm:inline">Kategorije i veličine</span>
              <span className="inline sm:hidden">Atributi</span>
            </button>
            <button
              onClick={() => setActiveTab('promo')}
              className={`flex-1 lg:flex-none py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'promo'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 bg-transparent'
              }`}
            >
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
              <span>Promo Kodovi</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 lg:flex-none py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 bg-transparent'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
              <span className="hidden sm:inline">Statistika</span>
              <span className="inline sm:hidden">Stat.</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 lg:flex-none py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 bg-transparent'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
              <span>Narudžbine</span>
            </button>
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`flex-1 lg:flex-none py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'newsletter'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 bg-transparent'
              }`}
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
              <span>Newsletter i Marketing</span>
            </button>
          </nav>
        </header>

        {/* Dynamic Database Settings Accordion Panel */}
        {isDbSettingsOpen && (
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-md space-y-4 animate-fade-in text-zinc-200">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
              <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                Postavke baze podataka
              </h3>
              <button 
                onClick={() => setIsDbSettingsOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 font-semibold cursor-pointer"
              >
                Zatvori [x]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Izbor modusa rada ključa:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Anon Key toggler */}
                  <button
                    type="button"
                    onClick={() => handleKeyModeChange('anon')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.keyMode === 'anon'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200 font-bold shadow-xs'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                      Standard (Anon)
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Koristi anonimni ključ. Ukoliko je RLS aktivan na tabelama bez javnih polisa, modifikacije će biti odbijene.
                    </p>
                  </button>

                  {/* Service Role Key toggler */}
                  <button
                    type="button"
                    onClick={() => handleKeyModeChange('service_role')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.keyMode === 'service_role'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-bold shadow-xs'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Admin (Service Role)
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Zaobilazi RLS polise. Neophodno za nesmetano ubacivanje, izmene i brisanje proizvoda i veličina.
                    </p>
                  </button>
                </div>
              </div>

              {/* Informative description with connection stats */}
              <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <Key className="h-3.5 w-3.5 text-zinc-400" />
                    Kredencijali vaše baze podataka:
                  </h4>
                  <div className="space-y-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 select-all overflow-x-auto max-w-full">
                    <div><span className="font-bold text-zinc-300">Endpoint:</span> {config.url}</div>
                    <div><span className="font-bold text-zinc-300">Project Key Secret:</span> {DEFAULT_SUPABASE_JWT_SECRET}</div>
                    <div><span className="font-bold text-zinc-300">Service Key Status:</span> eyJhbGciOi... 🔒 (Učitano i bezbedno)</div>
                  </div>
                </div>
                <p className="text-[9.5px] text-zinc-500 leading-normal mt-3">
                  * Admin panel se povezuje klijentski i ne deli saznanja o vašim ključevima van ove sesije. Koristi se isključivo za administraciju.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-2xl text-rose-300 text-sm flex gap-3 items-start animate-fade-in shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-rose-200">Greška sa bazom podataka</h4>
              <p className="text-xs text-rose-300 leading-relaxed font-medium">
                {errorMsg}
              </p>
              <button
                onClick={() => loadAllData()}
                className="text-xs font-bold text-rose-200 underline hover:no-underline mt-1.5 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 inline" /> Pokušaj ponovo
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace Body */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="relative">
                <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-500"></div>
              </div>
              <p className="text-sm font-medium text-zinc-400 font-display">
                Učitavanje baze podataka...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'products' && (
                <ProductList
                  products={products}
                  categories={categories}
                  onAddProduct={handleOpenAddForm}
                  onEditProduct={handleOpenEditForm}
                  onDeleteProduct={handleDeleteProduct}
                  onRefresh={() => loadAllData(true)}
                  refreshing={refreshing}
                />
              )}

              {activeTab === 'schema' && (
                <SchemaManager
                  categories={categories}
                  sizes={sizes}
                  colors={colors}
                  products={products}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {activeTab === 'promo' && (
                <PromoCodeManager
                  categories={categories}
                />
              )}

              {activeTab === 'stats' && (
                <StatsOverview
                  products={products}
                  categories={categories}
                />
              )}

              {activeTab === 'orders' && (
                <OrderManager
                  orders={orders}
                  products={products}
                  sizes={sizes}
                  colors={colors}
                  onRefresh={() => loadAllData(true)}
                  refreshing={refreshing}
                />
              )}

              {activeTab === 'newsletter' && (
                <NewsletterManager
                  orders={orders}
                  onRefresh={() => loadAllData(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          categories={categories}
          sizes={sizes}
          colors={colors}
          onClose={() => setIsFormOpen(false)}
          onSave={handleFormSaveSuccess}
        />
      )}

      {/* Styled Human Footer */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-6 mt-12 text-center text-zinc-500 text-xs tracking-wide shrink-0 font-mono">
        <div>
          DDDesign baza proizvoda • Sigurno vlasničko upravljanje
        </div>
        <div className="mt-1 text-[10px] text-zinc-600">
          Učitano {products.length} proizvoda, {categories.length} kategorija, {sizes.length} veličina, {colors.length} boja i {orders.length} porudžbina
        </div>
      </footer>

    </div>
  );
}
