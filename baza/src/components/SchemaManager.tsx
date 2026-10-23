/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, Size, Product, Color } from '../types';
import { supabase } from '../supabaseClient';
import { Layers, Plus, Trash2, Hash, RefreshCw, CheckCircle2, AlertTriangle, ListOrdered, GripVertical, ChevronUp, ChevronDown, Check, RotateCcw } from 'lucide-react';

interface SchemaManagerProps {
  categories: Category[];
  sizes: Size[];
  colors: Color[];
  products: Product[];
  onRefresh: () => void;
}

export default function SchemaManager({ categories, sizes, colors, products, onRefresh }: SchemaManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'sizes' | 'colors'>('categories');
  
  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Category Reorder State
  const [orderedCats, setOrderedCats] = useState<Category[]>(categories);
  const [snapshotCats, setSnapshotCats] = useState<Category[]>(categories);
  const [draggedCatIdx, setDraggedCatIdx] = useState<number | null>(null);
  const [catOrderSaving, setCatOrderSaving] = useState(false);

  useEffect(() => {
    setOrderedCats(categories);
    setSnapshotCats(categories);
  }, [categories]);

  // Check if category order has changed
  const hasCatChanges = orderedCats.some((c, i) => (c.Id ?? c.id) !== (snapshotCats[i]?.Id ?? snapshotCats[i]?.id));

  const moveCategory = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderedCats.length) return;
    const updated = [...orderedCats];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setOrderedCats(updated);
  };

  const cancelCatOrder = () => {
    setOrderedCats([...snapshotCats]);
    setCatSuccess('Izmene redosleda kategorija su otkazane.');
    setTimeout(() => setCatSuccess(''), 3000);
  };

  const saveCatOrder = async () => {
    const newIds = orderedCats.map(c => Number(c.Id ?? c.id));
    setCatOrderSaving(true);
    try {
      localStorage.setItem('dd_category_order', JSON.stringify(newIds));
      await fetch('/api/ordering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryOrder: newIds })
      });
      setSnapshotCats([...orderedCats]);
      setCatSuccess('Redosled kategorija uspešno sačuvan!');
      setTimeout(() => setCatSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save category order:', err);
      setCatError('Greška pri čuvanju redosleda kategorija.');
      setTimeout(() => setCatError(''), 3000);
    } finally {
      setCatOrderSaving(false);
    }
  };

  // Size Form
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeSort, setNewSizeSort] = useState('');
  const [sizeLoading, setSizeLoading] = useState(false);
  const [sizeError, setSizeError] = useState('');
  const [sizeSuccess, setSizeSuccess] = useState('');

  // Color Form
  const [newColorName, setNewColorName] = useState('');
  const [colorLoading, setColorLoading] = useState(false);
  const [colorError, setColorError] = useState('');
  const [colorSuccess, setColorSuccess] = useState('');

  // Get products count per category
  const getProductCountForCategory = (catId: number) => {
    return products.filter(p => Number(p.category_id) === Number(catId)).length;
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);
    setCatError('');
    setCatSuccess('');

    try {
      // Find max Id across categories to guarantee no collision on explicit primary keys
      const maxId = categories.reduce((max, c) => {
        const currentId = Number(c.Id ?? c.id ?? 0);
        return currentId > max ? currentId : max;
      }, 0);
      const nextId = maxId + 1;

      // Try explicit Id payload
      const { error } = await supabase
        .from('categories')
        .insert([{ Id: nextId, name: newCatName.trim() }]);

      if (error) {
        // Fallback to auto ID if explicit fails due to identity constraint
        const { error: fallbackError } = await supabase
          .from('categories')
          .insert([{ name: newCatName.trim() }]);
          
        if (fallbackError) throw fallbackError;
      }

      setNewCatName('');
      setCatSuccess('Kategorija uspešno kreirana!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setCatError(err.message || 'Greška pri dodavanju kategorije.');
    } finally {
      setCatLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: Category) => {
    const catId = cat.Id ?? cat.id;
    if (!catId) return;

    const prodCount = getProductCountForCategory(Number(catId));
    if (prodCount > 0) {
      setCatError(`Ne možete obrisati kategoriju koja sadrži ${prodCount} proizvoda. Prvo premestite ili obrišite te proizvode.`);
      return;
    }

    if (!window.confirm(`Da li ste sigurni da želite da obrišete kategoriju "${cat.name}"?`)) return;

    setCatLoading(true);
    setCatError('');
    setCatSuccess('');

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .or(`Id.eq.${catId},id.eq.${catId}`);

      if (error) throw error;
      setCatSuccess('Kategorija obrisana!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setCatError(err.message || 'Greška pri brisanju kategorije.');
    } finally {
      setCatLoading(false);
    }
  };

  // Add Size
  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;
    
    setSizeLoading(true);
    setSizeError('');
    setSizeSuccess('');

    try {
      const sortVal = newSizeSort ? Number(newSizeSort) : sizes.length + 1;
      
      const { error } = await supabase
        .from('sizes')
        .insert([{ name: newSizeName.trim(), sort_order: sortVal }]);

      if (error) throw error;

      setNewSizeName('');
      setNewSizeSort('');
      setSizeSuccess('Veličina uspešno kreirana!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setSizeError(err.message || 'Greška pri dodavanju veličine.');
    } finally {
      setSizeLoading(false);
    }
  };

  // Delete Size
  const handleDeleteSize = async (sizeId: number, sizeName: string) => {
    // Check if any product is using this size in association table product_sizes
    if (!window.confirm(`Da li ste sigurni da želite da obrišete veličinu "${sizeName}"?`)) return;

    setSizeLoading(true);
    setSizeError('');
    setSizeSuccess('');

    try {
      // Delete associations first
      await supabase
        .from('product_sizes')
        .delete()
        .eq('size_id', sizeId);

      // Delete size from DB
      const { error } = await supabase
        .from('sizes')
        .delete()
        .eq('id', sizeId);

      if (error) throw error;
      setSizeSuccess('Veličina uspešno obrisana!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setSizeError(err.message || 'Greška pri brisanju veličine.');
    } finally {
      setSizeLoading(false);
    }
  };

  // Add Color
  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    
    setColorLoading(true);
    setColorError('');
    setColorSuccess('');

    try {
      const maxId = colors.reduce((max, c) => {
        const idVal = Number(c.id);
        return idVal > max ? idVal : max;
      }, 0);
      const nextId = maxId + 1;

      let inserted = false;
      try {
        const { error } = await supabase
          .from('colors')
          .insert([{ id: nextId, Color: newColorName.trim() }]);
        if (!error) inserted = true;
      } catch (e) {}

      if (!inserted) {
        try {
          const { error } = await supabase
            .from('Colors')
            .insert([{ id: nextId, Color: newColorName.trim() }]);
          if (!error) inserted = true;
        } catch (e) {}
      }

      if (!inserted) {
        try {
          const { error } = await supabase
            .from('colors')
            .insert([{ color: newColorName.trim() }]);
          if (!error) inserted = true;
        } catch (e) {}
      }

      if (!inserted) {
        const { error } = await supabase
          .from('colors')
          .insert([{ Color: newColorName.trim() }]);
        if (error) throw error;
      }

      setNewColorName('');
      setColorSuccess('Boja uspešno kreirana!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setColorError(err.message || 'Greška pri dodavanju boje.');
    } finally {
      setColorLoading(false);
    }
  };

  // Delete Color
  const handleDeleteColor = async (colorId: number, colorName: string) => {
    if (!window.confirm(`Da li ste sigurni da želite da obrišete boju "${colorName}"?`)) return;

    setColorLoading(true);
    setColorError('');
    setColorSuccess('');

    try {
      try {
        await supabase
          .from('product_colors')
          .delete()
          .eq('color_id', colorId);
      } catch (assocErr) {
        try {
          await supabase
            .from('Product_colors')
            .delete()
            .eq('color_id', colorId);
        } catch (assocErr2) {
          console.warn('Could not delete product_colors during color deletion', assocErr2);
        }
      }

      let deleted = false;
      try {
        const { error } = await supabase
          .from('colors')
          .delete()
          .eq('id', colorId);
        if (!error) deleted = true;
      } catch (e) {}

      if (!deleted) {
        const { error } = await supabase
          .from('Colors')
          .delete()
          .eq('id', colorId);
        if (error) throw error;
      }

      setColorSuccess('Boja uspešno obrisana!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setColorError(err.message || 'Greška pri brisanju boje.');
    } finally {
      setColorLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar Selector */}
      <div className="lg:col-span-3 space-y-2">
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSubTab === 'categories'
              ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold shadow-xs'
              : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
          }`}
        >
          <Layers className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-sm block">Uređivanje Kategorija</span>
            <span className="text-[10px] text-zinc-400 font-mono font-bold block mt-0.5">{categories.length} kategorija</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('sizes')}
          className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSubTab === 'sizes'
              ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold shadow-xs'
              : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
          }`}
        >
          <ListOrdered className="h-5 w-5 text-violet-400" />
          <div>
            <span className="text-sm block">Uređivanje Veličina</span>
            <span className="text-[10px] text-zinc-400 font-mono font-bold block mt-0.5">{sizes.length} veličina</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('colors')}
          className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSubTab === 'colors'
              ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold shadow-xs'
              : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
          }`}
        >
          <Layers className="h-5 w-5 text-emerald-400" />
          <div>
            <span className="text-sm block">Uređivanje Boja</span>
            <span className="text-[10px] text-zinc-400 font-mono font-bold block mt-0.5">{colors?.length || 0} boja</span>
          </div>
        </button>
      </div>

      {/* Main Form Worksheets */}
      <div className="lg:col-span-9 bg-zinc-900/90 rounded-2xl sm:rounded-3xl border border-zinc-800 p-4 sm:p-6 shadow-md text-zinc-100">
        
        {/* SUBTAB 1: CATEGORIES */}
        {activeSubTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Sve Kategorije</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Dodajte nove ili obrišite neaktivne kategorije za svoje proizvode</p>
              </div>
            </div>

            {/* Error / Success */}
            {catError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs sm:text-sm rounded-xl font-medium">
                ⚠️ {catError}
              </div>
            )}
            {catSuccess && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {catSuccess}
              </div>
            )}

            {/* In-Line Create Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2.5 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Naziv nove kategorije</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Npr. Obuća, Majice na bretele, Aksesoari..."
                  className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={catLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 self-end cursor-pointer disabled:opacity-50"
              >
                {catLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Dodaj
              </button>
            </form>

            {/* Category Reorder Banner with Cancel & Save */}
            <div className={`p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs transition-all ${
              hasCatChanges 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200' 
                : 'bg-zinc-950/80 border border-zinc-800 text-zinc-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-5 w-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">Redosled kategorija (Drag & Drop)</span>
                    {hasCatChanges ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-500/40">
                        Nesačuvane izmene
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
                        Sinhronizovano
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Prevucite redove mišem ili koristite strelice ⬆ / ⬇. Kliknite na <strong>Sačuvaj</strong> za primenu ili na <strong>Otkaži</strong> za poništavanje izmena.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                {hasCatChanges && (
                  <button
                    type="button"
                    onClick={cancelCatOrder}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300"
                    title="Poništi izmene redosleda kategorija"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Otkaži
                  </button>
                )}

                <button
                  type="button"
                  onClick={saveCatOrder}
                  disabled={catOrderSaving || !hasCatChanges}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    hasCatChanges
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-60'
                  }`}
                  title="Sačuvaj redosled kategorija"
                >
                  {catOrderSaving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Sačuvaj raspored
                </button>
              </div>
            </div>

            {/* Database Category List */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto bg-zinc-950/50">
              <table className="w-full text-left border-collapse min-w-[550px] sm:min-w-0">
                <thead>
                  <tr className="bg-zinc-950 text-xs font-bold text-zinc-400 border-b border-zinc-800">
                    <th className="p-4 w-28 text-center">Redosled</th>
                    <th className="p-4 w-24">ID Kolone</th>
                    <th className="p-4">Naziv Kategorije</th>
                    <th className="p-4 text-center">Dodato proizvoda</th>
                    <th className="p-4 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orderedCats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-zinc-500 italic">
                        Nema kategorija u bazi podataka.
                      </td>
                    </tr>
                  ) : (
                    orderedCats.map((cat, idx) => {
                      const dbId = cat.Id ?? cat.id ?? idx;
                      const prodCount = getProductCountForCategory(Number(dbId));
                      const isDragging = draggedCatIdx === idx;
                      return (
                        <tr 
                          key={dbId}
                          draggable
                          onDragStart={(e) => {
                            setDraggedCatIdx(idx);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(idx));
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedCatIdx !== null && draggedCatIdx !== idx) {
                              moveCategory(draggedCatIdx, idx);
                            }
                            setDraggedCatIdx(null);
                          }}
                          onDragEnd={() => setDraggedCatIdx(null)}
                          className={`transition-all text-sm ${
                            isDragging 
                              ? 'opacity-30 bg-indigo-950/40' 
                              : 'hover:bg-zinc-800/40'
                          }`}
                        >
                          {/* Reorder drag handle & nudge buttons */}
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
                              <span className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-500 hover:text-indigo-400 transition-colors" title="Prevucite za promenu pozicije">
                                <GripVertical className="h-4 w-4" />
                              </span>
                              <span className="font-mono text-xs font-bold text-zinc-300 min-w-[18px]">
                                #{idx + 1}
                              </span>
                              <div className="flex flex-col ml-0.5">
                                <button
                                  type="button"
                                  onClick={() => moveCategory(idx, idx - 1)}
                                  disabled={idx === 0}
                                  className="text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer p-0.5"
                                  title="Pomeri gore"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveCategory(idx, idx + 1)}
                                  disabled={idx === orderedCats.length - 1}
                                  className="text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer p-0.5"
                                  title="Pomeri dole"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono font-bold text-[11px] text-zinc-500">
                            #{dbId}
                          </td>
                          <td className="p-4 font-semibold text-zinc-100">
                            {cat.name}
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold font-mono rounded-lg">
                              {prodCount}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors inline-flex cursor-pointer"
                              title="Obriši"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* SUBTAB 2: SIZES */}
        {activeSubTab === 'sizes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Sve Veličine</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Uredite dostupne dimenzije i njihov redosled za optimalnu selekciju</p>
              </div>
            </div>

            {/* Error / Success */}
            {sizeError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs sm:text-sm rounded-xl font-medium">
                ⚠️ {sizeError}
              </div>
            )}
            {sizeSuccess && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {sizeSuccess}
              </div>
            )}

            {/* In-Line Size Create Form */}
            <form onSubmit={handleAddSize} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-7 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Oznaka Veličine</label>
                <input
                  type="text"
                  value={newSizeName}
                  onChange={e => setNewSizeName(e.target.value)}
                  placeholder="Npr. M, XL, XXL, 38, 42..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Redosled sortiranja</label>
                <input
                  type="number"
                  value={newSizeSort}
                  onChange={e => setNewSizeSort(e.target.value)}
                  placeholder="Npr. 1"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={sizeLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {sizeLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Dodaj
                </button>
              </div>
            </form>

            {/* Database Sizes List */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto bg-zinc-950/50">
              <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                <thead>
                  <tr className="bg-zinc-950 text-xs font-bold text-zinc-400 border-b border-zinc-800">
                    <th className="p-4">Redni broj (PK)</th>
                    <th className="p-4">Oznaka</th>
                    <th className="p-4">Poredak sortiranja</th>
                    <th className="p-4 text-right">Akcija</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {sizes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm text-zinc-500 italic">
                        Nema veličina u bazi podataka.
                      </td>
                    </tr>
                  ) : (
                    sizes.map((size, idx) => (
                      <tr key={size.id ? `${size.id}-${idx}` : idx} className="hover:bg-zinc-800/40 text-sm">
                        <td className="p-4 font-mono font-bold text-[11px] text-zinc-500">
                          #{size.id}
                        </td>
                        <td className="p-4 font-bold text-zinc-100 font-mono">
                          {size.name}
                        </td>
                        <td className="p-4 font-medium text-zinc-300 font-mono">
                          {size.sort_order}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteSize(size.id, size.name)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors inline-flex cursor-pointer"
                            title="Obriši"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* SUBTAB 3: COLORS */}
        {activeSubTab === 'colors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Sve Boje</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Uredite dostupne boje artikala u bazi podataka</p>
              </div>
            </div>

            {/* Error / Success */}
            {colorError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs sm:text-sm rounded-xl font-medium">
                ⚠️ {colorError}
              </div>
            )}
            {colorSuccess && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {colorSuccess}
              </div>
            )}

            {/* In-Line Color Create Form */}
            <form onSubmit={handleAddColor} className="flex gap-2.5 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Naziv/Oznaka nove boje</label>
                <input
                  type="text"
                  value={newColorName}
                  onChange={e => setNewColorName(e.target.value)}
                  placeholder="Npr. Crna, Bela, Midnight Blue, Mint Zelena..."
                  className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={colorLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 self-end cursor-pointer disabled:opacity-50"
              >
                {colorLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Dodaj
              </button>
            </form>

            {/* Database Color List */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto bg-zinc-950/50">
              <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                <thead>
                  <tr className="bg-zinc-950 text-xs font-bold text-zinc-400 border-b border-zinc-800">
                    <th className="p-4">Boja ID (PK)</th>
                    <th className="p-4">Boja (Naziv)</th>
                    <th className="p-4 text-right">Akcija</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {colors.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-sm text-zinc-500 italic">
                        Nema boja u bazi podataka.
                      </td>
                    </tr>
                  ) : (
                    colors.map((color, idx) => {
                      const colorLabel = color.Color || color.color || color.name || 'Boja';
                      return (
                        <tr key={color.id ? `${color.id}-${idx}` : idx} className="hover:bg-zinc-800/40 text-sm">
                          <td className="p-4 font-mono font-bold text-[11px] text-zinc-500">
                            #{color.id}
                          </td>
                          <td className="p-4 font-bold text-zinc-100">
                            {colorLabel}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteColor(color.id, colorLabel)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors inline-flex cursor-pointer"
                              title="Obriši"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
