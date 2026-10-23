import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';
import { Search, Plus, Filter, Grid, RefreshCcw, ChevronsUpDown, X, GripVertical, CheckCircle2, ArrowRightLeft, Check, RotateCcw } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => Promise<void>;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function ProductList({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onRefresh,
  refreshing
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'out'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'custom' | 'priceAsc' | 'priceDesc' | 'alphabetical'>('newest');
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  // Drag and drop reordering state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [customList, setCustomList] = useState<Product[]>(products);
  const [snapshotList, setSnapshotList] = useState<Product[]>(products);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isReorderMode) {
      setCustomList(products);
      setSnapshotList(products);
    }
  }, [products, isReorderMode]);

  // Check if current list differs from snapshot
  const hasOrderChanges = customList.some((p, i) => p.id !== snapshotList[i]?.id);

  const startReorderMode = () => {
    setSnapshotList([...products]);
    setCustomList([...products]);
    setIsReorderMode(true);
    setSaveStatus(null);
    handleClearFilters();
  };

  const cancelReorder = () => {
    setCustomList([...snapshotList]);
    setIsReorderMode(false);
    setSaveStatus('Izmene rasporeda su otkazane.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const saveReorder = async () => {
    setIsSaving(true);
    const newOrderIds = customList.map(p => p.id);
    try {
      localStorage.setItem('dd_product_order', JSON.stringify(newOrderIds));
      const res = await fetch('/api/ordering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productOrder: newOrderIds })
      });
      if (!res.ok) throw new Error('Neuspešno čuvanje');
      setSnapshotList([...customList]);
      setIsReorderMode(false);
      setSaveStatus('Novi redosled je uspešno sačuvan!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error('Failed to persist product ordering:', err);
      setSaveStatus('Greška pri čuvanju novog redosleda.');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const moveProduct = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= customList.length) return;
    const updated = [...customList];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setCustomList(updated);
  };

  const handleDragStart = (idx: number, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (toIdx: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIdx) return;
    moveProduct(draggedIndex, toIdx);
    setDraggedIndex(null);
  };

  // Helper to determine if a product is new
  const isProductNew = (prod: Product) => {
    if (prod.new_collection) return true;
    
    // Fallback: 8 most recently created products overall
    const sortedByDate = [...products]
      .filter(p => p.created_at)
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    const newest8Ids = sortedByDate.slice(0, 8).map(p => p.id);
    return newest8Ids.includes(prod.id);
  };

  const newProductsCount = products.filter(isProductNew).length;

  // Search and filter logic
  const sourceProducts = isReorderMode ? customList : products;

  const filteredProducts = sourceProducts.filter(product => {
    if (isReorderMode) return true; // Keep full catalog in view when reordering
    // Search
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category
    const matchesCategory = 
      selectedCategory === 'all' || 
      Number(product.category_id) === Number(selectedCategory);

    // Stock
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'instock' && product.stock) ||
      (stockFilter === 'out' && !product.stock);

    // Active
    const matchesActive = 
      activeFilter === 'all' ||
      (activeFilter === 'active' && product.is_active) ||
      (activeFilter === 'hidden' && !product.is_active);

    // Show only new if activated
    const matchesNew = !showOnlyNew || isProductNew(product);

    return matchesSearch && matchesCategory && matchesStock && matchesActive && matchesNew;
  });

  // Sort
  const sortedProducts = isReorderMode ? customList : [...filteredProducts].sort((a, b) => {
    if (sortOption === 'newest') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    }
    if (sortOption === 'oldest') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (dateA !== dateB) return dateA - dateB;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    }
    if (sortOption === 'priceAsc') {
      const getEffectivePrice = (p: Product) => (p.discount_price !== null && Number(p.discount_price) > 0) ? Number(p.discount_price) : Number(p.price);
      return getEffectivePrice(a) - getEffectivePrice(b);
    }
    if (sortOption === 'priceDesc') {
      const getEffectivePrice = (p: Product) => (p.discount_price !== null && Number(p.discount_price) > 0) ? Number(p.discount_price) : Number(p.price);
      return getEffectivePrice(b) - getEffectivePrice(a);
    }
    if (sortOption === 'alphabetical') {
      return a.name.localeCompare(b.name, 'sr');
    }
    return 0;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setStockFilter('all');
    setActiveFilter('all');
    setSortOption('newest');
    setShowOnlyNew(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Strip */}
      <div className="bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border border-zinc-800 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pretraži proizvode po nazivu ili opisu..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-zinc-500"
            />
          </div>

          {/* Filters Group */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:col-span-8">
            
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Sve Kategorije</option>
                {categories.map(cat => {
                  const idVal = cat.Id ?? cat.id;
                  return (
                    <option key={idVal} value={idVal}>
                      {cat.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Sva Stanja</option>
                <option value="instock">Na stanju</option>
                <option value="out">Nema na stanju</option>
              </select>
            </div>

            {/* Active state filter */}
            <div>
              <select
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Sve Vidljivosti</option>
                <option value="active">Samo Aktivno</option>
                <option value="hidden">Samo Skriveno</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none font-medium text-zinc-200"
              >
                <option value="newest">🕒 Poslednji dodati (Najnoviji)</option>
                <option value="oldest">⏮️ Prvi dodati (Najstariji)</option>
                <option value="custom">✋ Prilagođeni redosled</option>
                <option value="priceAsc">Cena: Rastuća</option>
                <option value="priceDesc">Cena: Opadajuća</option>
                <option value="alphabetical">Naziv: A-Z</option>
              </select>
            </div>

          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 mr-1 uppercase tracking-wider">Brzi filteri i sortiranje:</span>
          
          {/* All Products */}
          <button
            type="button"
            onClick={() => {
              setShowOnlyNew(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              !showOnlyNew
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
          >
            Svi proizvodi ({products.length})
          </button>

          {/* Poslednji dodati */}
          <button
            type="button"
            onClick={() => setSortOption('newest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              sortOption === 'newest'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
            title="Prikaži prvo poslednje dodate proizvode (najnoviji po datumu/ID-u)"
          >
            <span>🕒</span>
            Poslednji dodati
          </button>

          {/* Prvi dodati */}
          <button
            type="button"
            onClick={() => setSortOption('oldest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              sortOption === 'oldest'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
            title="Prikaži prvo najstarije / prve dodate proizvode"
          >
            <span>⏮️</span>
            Prvi dodati
          </button>

          {/* New Products */}
          <button
            type="button"
            onClick={() => setShowOnlyNew(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showOnlyNew
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
          >
            <span>✨</span>
            Šta je novo?
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
              showOnlyNew ? 'bg-violet-900 text-white font-bold' : 'bg-zinc-700 text-zinc-200 font-bold'
            }`}>
              {newProductsCount}
            </span>
          </button>
        </div>

        {/* Clear filters row */}
        {(searchTerm || selectedCategory !== 'all' || stockFilter !== 'all' || activeFilter !== 'all' || showOnlyNew) && (
          <div className="flex items-center gap-2 pt-1.5 border-t border-zinc-800 flex-wrap">
            <span className="text-xs text-zinc-400">Pronađeno {sortedProducts.length} rezultata sa filterima:</span>
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded cursor-pointer"
            >
              Ukloni sve filtere
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800">
        <div className="text-xs font-semibold text-zinc-400 px-2 text-center sm:text-left">
          Prikazano: <span className="text-indigo-400 font-bold font-mono text-sm">{sortedProducts.length}</span> od <span className="font-mono text-sm text-zinc-200">{products.length}</span> proizvoda
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {isReorderMode ? (
            <>
              {/* Cancel Button */}
              <button
                type="button"
                onClick={cancelReorder}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300"
                title="Poništi sve promene i vrati početni redosled"
              >
                <RotateCcw className="h-4 w-4" />
                Otkaži
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={saveReorder}
                disabled={isSaving}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  hasOrderChanges
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Sačuvaj novi redosled proizvoda"
              >
                {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {hasOrderChanges ? 'Sačuvaj novi redosled' : 'Završi raspoređivanje'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startReorderMode}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                title="Promeni redosled prevlačenjem kartica"
              >
                <GripVertical className="h-4 w-4" />
                Promeni redosled
              </button>

              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all text-xs flex items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Osveži bazu podataka"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onAddProduct}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Dodaj proizvod
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reorder Notification Banner */}
      {isReorderMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300 shrink-0">
              <GripVertical className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-100">Režim raspoređivanja proizvoda</span>
                {hasOrderChanges ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-500/40">
                    Nesačuvane izmene
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Nema izmena
                  </span>
                )}
              </div>
              <p className="text-amber-200/80 text-xs mt-0.5">
                Prevucite kartice (Drag & Drop) ili koristite strelice ◀ / ▶. Kliknite na <strong>Sačuvaj</strong> da primenite novi redosled u prodavnici, ili na <strong>Otkaži</strong> da poništite promene.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={cancelReorder}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300"
            >
              <RotateCcw className="h-4 w-4" />
              Otkaži
            </button>
            <button
              type="button"
              onClick={saveReorder}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
            >
              {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Sačuvaj raspored
            </button>
          </div>
        </div>
      )}

      {/* Persistent Toast for Save or Cancel when not in reorder mode */}
      {!isReorderMode && saveStatus && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3.5 flex items-center justify-between text-xs text-zinc-200 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus(null)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Grid Display */}
      {sortedProducts.length === 0 ? (
        <div className="bg-zinc-900/80 rounded-2xl border border-dashed border-zinc-800 py-16 text-center space-y-3">
          <div className="text-zinc-600 flex justify-center">
            <Search className="h-12 w-12" />
          </div>
          <h4 className="text-base font-bold text-zinc-200">Nema rezultata</h4>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            Pokušajte da ublažite uslove pretrage ili dodajte novi proizvod ako je baza prazna.
          </p>
          {(searchTerm || selectedCategory !== 'all' || stockFilter !== 'all' || activeFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="mt-2 text-xs font-bold bg-zinc-800 px-3.5 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Resetuj filtere
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedProducts.map((product, idx) => (
            <ProductCard
              key={product.id ?? idx}
              product={product}
              categories={categories}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              isReordering={isReorderMode}
              orderIndex={idx}
              totalCount={sortedProducts.length}
              onMoveLeft={() => moveProduct(idx, idx - 1)}
              onMoveRight={() => moveProduct(idx, idx + 1)}
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragOver={handleDragOver}
              onDragEnd={() => setDraggedIndex(null)}
              onDrop={(e) => handleDrop(idx, e)}
              isDragging={draggedIndex === idx}
            />
          ))}
        </div>
      )}

    </div>
  );
}
