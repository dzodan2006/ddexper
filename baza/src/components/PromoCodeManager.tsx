/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Category, PromoCode } from '../types';
import { 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Layers, 
  Search, 
  AlertTriangle, 
  Check, 
  X,
  HelpCircle,
  Calculator,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PromoCodeManagerProps {
  categories: Category[];
}

export default function PromoCodeManager({ categories }: PromoCodeManagerProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form Modal (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formPercent, setFormPercent] = useState<string>('15');
  const [formCategoryId, setFormCategoryId] = useState<string>(''); // '' means null (all categories)
  const [formStatus, setFormStatus] = useState<boolean>(true);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [codeToDelete, setCodeToDelete] = useState<PromoCode | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Quick Calculator / Tester state
  const [testAmount, setTestAmount] = useState<number>(10000);
  const [selectedTestCode, setSelectedTestCode] = useState<string>('');

  // Fetch Promo Codes from Supabase
  const loadPromoCodes = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      setPromoCodes(data || []);
    } catch (err: any) {
      console.error('Error fetching promo_codes:', err);
      setErrorMsg(err.message || 'Greška pri učitavanju promo kodova iz baze.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingCode(null);
    setFormCode('');
    setFormPercent('15');
    setFormCategoryId('');
    setFormStatus(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormCode(code.promo_code);
    setFormPercent(String(code.amount_of_discount_in_percent));
    setFormCategoryId(code.Category_id !== null && code.Category_id !== undefined ? String(code.Category_id) : '');
    setFormStatus(code.status !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Quick Toggle Status
  const handleToggleStatus = async (code: PromoCode) => {
    const newStatus = !code.status;
    // Optimistic UI update
    setPromoCodes(prev => prev.map(p => p.id === code.id ? { ...p, status: newStatus } : p));

    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ status: newStatus })
        .eq('id', code.id);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      // Revert on error
      setPromoCodes(prev => prev.map(p => p.id === code.id ? { ...p, status: code.status } : p));
      alert('Greška pri promeni statusa: ' + (err.message || 'Pokušajte ponovo.'));
    }
  };

  // Submit Save / Create
  const handleSavePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase();
    const percentNum = parseFloat(formPercent);

    if (!cleanCode) {
      setFormError('Naziv promo koda je obavezan.');
      return;
    }

    if (isNaN(percentNum) || percentNum <= 0 || percentNum > 100) {
      setFormError('Popust mora biti broj između 1 i 100%.');
      return;
    }

    setFormSaving(true);
    setFormError(null);

    const payload = {
      promo_code: cleanCode,
      amount_of_discount_in_percent: percentNum,
      status: formStatus,
      Category_id: formCategoryId ? Number(formCategoryId) : null
    };

    try {
      if (editingCode && editingCode.id) {
        // Update existing
        const { error } = await supabase
          .from('promo_codes')
          .update(payload)
          .eq('id', editingCode.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('promo_codes')
          .insert([payload]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadPromoCodes(true);
    } catch (err: any) {
      console.error('Error saving promo code:', err);
      setFormError(err.message || 'Došlo je do greške pri čuvanju promo koda.');
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Promo Code
  const handleDeleteConfirm = async () => {
    if (!codeToDelete || !codeToDelete.id) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', codeToDelete.id);

      if (error) throw error;

      setCodeToDelete(null);
      await loadPromoCodes(true);
    } catch (err: any) {
      console.error('Error deleting promo code:', err);
      alert('Greška pri brisanju promo koda: ' + (err.message || 'Nepoznata greška.'));
    } finally {
      setDeleting(false);
    }
  };

  // Helper to find category name
  const getCategoryName = (catId?: number | null) => {
    if (!catId) return 'Sve kategorije (Ceo asortiman)';
    const found = categories.find(c => {
      const id = c.Id ?? c.id;
      return Number(id) === Number(catId);
    });
    return found ? found.name : `Kategorija #${catId}`;
  };

  // Filtered Codes
  const filteredCodes = promoCodes.filter(c => {
    const matchesSearch = c.promo_code.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? c.status :
      !c.status;
    const matchesCategory = 
      categoryFilter === 'all' ? true :
      categoryFilter === 'global' ? (c.Category_id === null || c.Category_id === undefined) :
      Number(c.Category_id) === Number(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const totalCount = promoCodes.length;
  const activeCount = promoCodes.filter(c => c.status).length;
  const avgDiscount = totalCount > 0 
    ? Math.round(promoCodes.reduce((acc, c) => acc + Number(c.amount_of_discount_in_percent || 0), 0) / totalCount)
    : 0;
  const categorySpecificCount = promoCodes.filter(c => c.Category_id !== null && c.Category_id !== undefined).length;

  // Calculation tester
  const activeTestCodeObj = promoCodes.find(c => c.promo_code === selectedTestCode);
  const testDiscountPercent = activeTestCodeObj ? activeTestCodeObj.amount_of_discount_in_percent : 0;
  const testSavings = Math.round((testAmount * testDiscountPercent) / 100);
  const testFinalPrice = testAmount - testSavings;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Top Banner & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Codes */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">Ukupno kodova</span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-display mt-0.5 block">{totalCount}</span>
            </div>
            <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            U tabeli baze <code className="text-zinc-300 font-mono">promo_codes</code>
          </div>
        </div>

        {/* Active Codes */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">Aktivni na sajtu</span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-display mt-0.5 block">{activeCount}</span>
            </div>
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            Kupci ih mogu odmah uneti u korpu
          </p>
        </div>

        {/* Average Discount */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">Prosečan popust</span>
              <span className="text-2xl sm:text-3xl font-bold text-amber-300 font-display mt-0.5 block">{avgDiscount}%</span>
            </div>
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/60 text-amber-400 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            Procentualna ušteda po kodu
          </p>
        </div>

        {/* Category specific */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">Kategorijski kodovi</span>
              <span className="text-2xl sm:text-3xl font-bold text-violet-400 font-display mt-0.5 block">{categorySpecificCount}</span>
            </div>
            <div className="p-2.5 bg-violet-950/60 border border-violet-800/60 text-violet-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            {totalCount - categorySpecificCount} važe za sve proizvode
          </p>
        </div>
      </div>

      {/* Main Controls & Search Strip */}
      <div className="bg-zinc-900/90 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Pretraži promo kodove..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Svi statusi</option>
            <option value="active">Samo aktivni</option>
            <option value="inactive">Samo neaktivni</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-xs truncate"
          >
            <option value="all">Sve kategorije (opseg)</option>
            <option value="global">Samo globalni (ceo sajt)</option>
            {categories.map(cat => {
              const catId = cat.Id ?? cat.id;
              return (
                <option key={catId} value={String(catId)}>
                  Kategorija: {cat.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadPromoCodes(true)}
            disabled={refreshing}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Osveži listu iz baze"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novi Promo Kod</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table / Grid of Promo Codes */}
      <div className="bg-zinc-900/90 rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Učitavanje promo kodova iz baze...</p>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-800/80 rounded-2xl mx-auto flex items-center justify-center text-zinc-500 border border-zinc-700/60">
              <Tag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Nema pronađenih promo kodova</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {promoCodes.length === 0 
                ? 'Još uvek niste kreirali nijedan promo kod. Kliknite na dugme iznad da dodate prvi kod za popust.'
                : 'Nijedan kod ne odgovara unetim parametrima pretrage i filtera.'}
            </p>
            {promoCodes.length === 0 && (
              <button
                onClick={handleOpenAdd}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kreiraj prvi kod</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Kod za popust</th>
                  <th className="py-3.5 px-4">Iznos popusta</th>
                  <th className="py-3.5 px-4">Odnosi se na</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredCodes.map(code => {
                  const isGlobal = code.Category_id === null || code.Category_id === undefined;
                  const catName = getCategoryName(code.Category_id);

                  return (
                    <tr key={code.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* Code Badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold tracking-wider px-3 py-1 rounded-lg bg-zinc-950 text-indigo-300 border border-zinc-700/80 shadow-inner inline-flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-indigo-400" />
                            {code.promo_code}
                          </span>
                        </div>
                      </td>

                      {/* Percentage */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-sm text-emerald-400 font-mono inline-flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          {code.amount_of_discount_in_percent}%
                        </span>
                      </td>

                      {/* Category Scope */}
                      <td className="py-4 px-4">
                        {isGlobal ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Sve kategorije (Ceo asortiman)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-violet-300 bg-violet-950/50 px-2.5 py-0.5 rounded-lg border border-violet-800/50">
                            <Layers className="w-3.5 h-3.5 text-violet-400" />
                            {catName}
                          </span>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(code)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            code.status
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70 hover:bg-emerald-900/60'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                          }`}
                          title="Kliknite da promenite status (Aktivan / Neaktivan)"
                        >
                          {code.status ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Aktivan</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-zinc-400" />
                              <span>Neaktivan</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(code)}
                            className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            title="Izmeni promo kod"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCodeToDelete(code)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            title="Obriši promo kod"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Tester & Simulator */}
      <div className="bg-zinc-900/90 rounded-2xl sm:rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Simulator obračuna popusta na sajtu</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Izaberite promo kod
            </label>
            <select
              value={selectedTestCode}
              onChange={e => setSelectedTestCode(e.target.value)}
              className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Izaberite kod za test --</option>
              {promoCodes.map(c => (
                <option key={c.id} value={c.promo_code}>
                  {c.promo_code} ({c.amount_of_discount_in_percent}% {c.status ? '' : '- Neaktivan'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Primer iznosa artikla (RSD)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={e => setTestAmount(Math.max(0, Number(e.target.value)))}
              className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Nova cena za kupca:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {testFinalPrice.toLocaleString('sr-RS')} RSD
                </span>
                {testSavings > 0 && (
                  <span className="text-[11px] text-zinc-500 line-through">
                    {testAmount.toLocaleString('sr-RS')} RSD
                  </span>
                )}
              </div>
            </div>
            {testSavings > 0 && (
              <span className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold font-mono">
                Ušteda: -{testSavings.toLocaleString('sr-RS')} RSD
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Promo Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-800 overflow-hidden text-left animate-slide-up">
            {/* Header */}
            <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 rounded-xl">
                  <Tag className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-white text-base font-display">
                  {editingCode ? 'Izmena Promo Koda' : 'Novi Promo Kod'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePromoCode} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  Naziv promo koda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Unesite kod..."
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-mono font-bold tracking-wider text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-zinc-500 font-mono">Automatski se formatira velikim slovima.</span>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  Iznos popusta u procentima (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    required
                    placeholder="15"
                    value={formPercent}
                    onChange={e => setFormPercent(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                </div>
              </div>

              {/* Category Scope */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  Kategorija na koju se popust odnosi
                </label>
                <select
                  value={formCategoryId}
                  onChange={e => setFormCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">🌟 Sve kategorije (Važi za ceo asortiman)</option>
                  {categories.map(cat => {
                    const catId = cat.Id ?? cat.id;
                    return (
                      <option key={catId} value={String(catId)}>
                        Kategorija: {cat.name}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Ako izaberete konkretnu kategoriju, popust će se u korpi primeniti samo na artikle koji pripadaju toj kategoriji.
                </p>
              </div>

              {/* Status Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formStatus}
                    onChange={e => setFormStatus(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/40 cursor-pointer accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">Aktivan promo kod</span>
                    <span className="text-[10px] text-zinc-400 block">Kupci mogu odmah iskoristiti kod pri poručivanju</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {formSaving ? 'Čuvanje...' : editingCode ? 'Sačuvaj izmene' : 'Kreiraj promo kod'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {codeToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-800 overflow-hidden text-left animate-slide-up">
            <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex items-center gap-3">
              <div className="p-2 bg-rose-950/60 border border-rose-800/60 text-rose-400 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-base">Brisanje promo koda</h4>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-zinc-300 text-sm leading-relaxed">
                Da li ste sigurni da želite da trajno obrišete promo kod <strong className="text-white font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{codeToDelete.promo_code}</strong>?
              </p>
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCodeToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
                >
                  Otkaži
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  {deleting ? 'Brisanje...' : 'Da, obriši'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
