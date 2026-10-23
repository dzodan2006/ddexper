/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Category, Size, ProductImage, Color } from '../types';
import { supabase } from '../supabaseClient';
import { X, Save, Image, RefreshCw, Layers, Check, CheckSquare, Square, Mail } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null; // If null, we are adding new product
  categories: Category[];
  sizes: Size[];
  colors: Color[];
  onClose: () => void;
  onSave: () => void;
}

export default function ProductForm({ product, categories, sizes, colors, onClose, onSave }: ProductFormProps) {
  const isEdit = !!product;

  // Values
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [newCollection, setNewCollection] = useState(false);

  // Images
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [imageUrl3, setImageUrl3] = useState('');
  const [imageUrl4, setImageUrl4] = useState('');
  const [imageUrl5, setImageUrl5] = useState('');
  const [imageUrl6, setImageUrl6] = useState('');

  // Selected Size IDs
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);

  // Selected Color IDs
  const [selectedColors, setSelectedColors] = useState<number[]>([]);

  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'osnovno' | 'slike' | 'velicine' | 'boje'>('osnovno');

  // Load existing values if editing
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? product.price.toString() : '');
      setDiscountPrice(product.discount_price ? product.discount_price.toString() : '');
      setCategoryId(product.category_id ? product.category_id.toString() : '');
      setStock(product.stock !== false);
      setIsActive(product.is_active !== false);
      setNewCollection(!!product.new_collection);

      // Load images
      if (product.images && product.images.length > 0) {
        const img = product.images[0];
        setImageUrl(img.image_url || '');
        setImageUrl2(img.image_url2 || '');
        setImageUrl3(img.image_url3 || '');
        setImageUrl4(img.image_url4 || '');
        setImageUrl5(img.image_url5 || '');
        setImageUrl6(img.image_url6 || '');
      } else {
        setImageUrl('');
        setImageUrl2('');
        setImageUrl3('');
        setImageUrl4('');
        setImageUrl5('');
        setImageUrl6('');
      }

      // Load sizes
      if (product.sizes) {
         setSelectedSizes(product.sizes.map(s => s.id));
      } else {
        setSelectedSizes([]);
      }

      // Load colors
      if (product.colors) {
        setSelectedColors(product.colors.map(c => c.id));
      } else {
        setSelectedColors([]);
      }
    } else {
      // Clear values for new product
      setName('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setCategoryId(categories.length > 0 ? (categories[0].Id ?? categories[0].id ?? '').toString() : '');
      setStock(true);
      setIsActive(true);
      setNewCollection(false);
      setImageUrl('');
      setImageUrl2('');
      setImageUrl3('');
      setImageUrl4('');
      setImageUrl5('');
      setImageUrl6('');
      setSelectedSizes([]);
      setSelectedColors([]);
    }
  }, [product, categories]);

  // Image pre-fill triggers for easier testing
  const setDemoUrls = () => {
    setImageUrl('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600');
    setImageUrl2('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600');
  };

  const handleToggleSize = (sizeId: number) => {
    if (selectedSizes.includes(sizeId)) {
      setSelectedSizes(selectedSizes.filter(id => id !== sizeId));
    } else {
      setSelectedSizes([...selectedSizes, sizeId]);
    }
  };

  const handleToggleColor = (colorId: number) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter(id => id !== colorId));
    } else {
      setSelectedColors([...selectedColors, colorId]);
    }
  };

  const handleSelectAllSizes = () => {
    if (selectedSizes.length === sizes.length) {
      setSelectedSizes([]);
    } else {
      setSelectedSizes(sizes.map(s => s.id));
    }
  };

  const handleSelectAllColors = () => {
    if (selectedColors.length === colors.length) {
      setSelectedColors([]);
    } else {
      setSelectedColors(colors.map(c => c.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Naziv proizvoda je obavezan.');
      setActiveTab('osnovno');
      return;
    }
    if (!price || isNaN(Number(price))) {
      setErrorMsg('Unesite ispravnu cenu.');
      setActiveTab('osnovno');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Morate izabrati kategoriju.');
      setActiveTab('osnovno');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const productPayload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        stock,
        is_active: isActive,
        category_id: Number(categoryId),
        new_collection: newCollection
      };

      let productId: number;

      if (isEdit && product?.id) {
        productId = product.id;
        // Update product table
        const { error: prodError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);

        if (prodError) throw prodError;

        // Update product images
        const { data: existingImg, error: checkImgErr } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', productId);

        if (checkImgErr) throw checkImgErr;

        const imgPayload = {
          product_id: productId,
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
          is_main: true,
          image_url2: imageUrl2.trim() || null,
          image_url3: imageUrl3.trim() || null,
          image_url4: imageUrl4.trim() || null,
          image_url5: imageUrl5.trim() || null,
          image_url6: imageUrl6.trim() || null,
        };

        if (existingImg && existingImg.length > 0) {
          // Update
          const { error: imgError } = await supabase
            .from('product_images')
            .update(imgPayload)
            .eq('product_id', productId);
          if (imgError) throw imgError;
        } else {
          // Insert
          const { error: imgError } = await supabase
            .from('product_images')
            .insert([imgPayload]);
          if (imgError) throw imgError;
        }

        // Update sizes (Delete old first, then insert new)
        const { error: delSizeErr } = await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', productId);

        if (delSizeErr) throw delSizeErr;

        if (selectedSizes.length > 0) {
          const sizesPayload = selectedSizes.map(sizeId => ({
            product_id: productId,
            size_id: sizeId
          }));

          const { error: insSizeErr } = await supabase
            .from('product_sizes')
            .insert(sizesPayload);

          if (insSizeErr) throw insSizeErr;
        }

        // Update colors (Delete old first, then insert new)
        const { error: colorDelErr1 } = await supabase.from('Product_colors').delete().eq('product_id', productId);
        if (colorDelErr1) {
          const { error: colorDelErr2 } = await supabase.from('product_colors').delete().eq('product_id', productId);
          if (colorDelErr2) {
            console.warn('Notice deleting product_colors during update:', colorDelErr2.message);
          }
        }

        if (selectedColors.length > 0) {
          const colorsPayload = selectedColors.map(colorId => ({
            product_id: productId,
            color_id: colorId
          }));

          try {
            const { error: colorInsErr } = await supabase.from('product_colors').insert(colorsPayload);
            if (colorInsErr) throw colorInsErr;
          } catch (colorInsErrCatch) {
            try {
              const { error: colorInsErrCap } = await supabase.from('Product_colors').insert(colorsPayload);
              if (colorInsErrCap) throw colorInsErrCap;
            } catch (colorInsErrCapCatch: any) {
              console.error('Could not insert product colors:', colorInsErrCapCatch);
              throw new Error('Greška pri dodeli boja: ' + colorInsErrCapCatch.message);
            }
          }
        }

      } else {
        // Insert new product
        const { data: newProd, error: prodError } = await supabase
          .from('products')
          .insert([productPayload])
          .select();

        if (prodError) throw prodError;
        if (!newProd || newProd.length === 0) throw new Error('Kreiranje proizvoda nije uspelo.');

        productId = newProd[0].id;

        // Insert product images
        const imgPayload = {
          product_id: productId,
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
          is_main: true,
          image_url2: imageUrl2.trim() || null,
          image_url3: imageUrl3.trim() || null,
          image_url4: imageUrl4.trim() || null,
          image_url5: imageUrl5.trim() || null,
          image_url6: imageUrl6.trim() || null,
        };

        const { error: imgError } = await supabase
          .from('product_images')
          .insert([imgPayload]);

        if (imgError) throw imgError;

        // Insert product sizes
        if (selectedSizes.length > 0) {
          const sizesPayload = selectedSizes.map(sizeId => ({
            product_id: productId,
            size_id: sizeId
          }));

          const { error: insSizeErr } = await supabase
            .from('product_sizes')
            .insert(sizesPayload);

          if (insSizeErr) throw insSizeErr;
        }

        // Insert product colors
        if (selectedColors.length > 0) {
          const colorsPayload = selectedColors.map(colorId => ({
            product_id: productId,
            color_id: colorId
          }));

          try {
            const { error: colorInsErr } = await supabase.from('product_colors').insert(colorsPayload);
            if (colorInsErr) throw colorInsErr;
          } catch (colorInsErrCatch) {
            try {
              const { error: colorInsErrCap } = await supabase.from('Product_colors').insert(colorsPayload);
              if (colorInsErrCap) throw colorInsErrCap;
            } catch (colorInsErrCapCatch: any) {
              console.error('Could not insert product colors:', colorInsErrCapCatch);
              throw new Error('Greška pri dodeljivanju boja: ' + colorInsErrCapCatch.message);
            }
          }
        }

        // Notify newsletter subscribers if requested
        if (notifyNewsletter) {
          try {
            const selectedCat = categories.find(c => {
              const catId = c.Id ?? c.id;
              return String(catId) === String(categoryId);
            });
            fetch('/api/newsletter/notify-new-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId,
                name: name.trim(),
                price: parseFloat(price) || 0,
                discount_price: discountPrice ? parseFloat(discountPrice) : null,
                description: description.trim(),
                image_url: imageUrl.trim() || undefined,
                categoryName: selectedCat?.name
              })
            }).catch(e => console.warn('Newsletter background notification failed:', e));
          } catch (notifyErr) {
            console.warn('Newsletter notify error:', notifyErr);
          }
        }
      }

      onSave();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Došlo je do greške pri čuvanju proizvoda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[95vh] sm:h-auto max-h-[95vh] sm:max-h-[90vh] border border-zinc-800 animate-slide-up text-zinc-100">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg font-display">
              {isEdit ? 'Izmena Proizvoda' : 'Novi Proizvod'}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              {isEdit ? `Ažurirajte proizvod #${product?.id}` : 'Dodajte novi proizvod u bazu podataka'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800 bg-zinc-900 px-4 sm:px-6 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('osnovno')}
            className={`py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'osnovno'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Osnovno
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('slike')}
            className={`py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'slike'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Slike
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('velicine')}
            className={`py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'velicine'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Veličine ({selectedSizes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('boje')}
            className={`py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'boje'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
            Boje ({selectedColors.length})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-sm rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* TAB 1: OSNOVNO */}
          {activeTab === 'osnovno' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">
                    Naziv Proizvoda *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Npr. Haljina od tafta"
                    className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">
                    Kategorija *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="" disabled className="bg-zinc-900 text-zinc-400">--- Izaberi kategoriju ---</option>
                    {categories.map(cat => {
                      const idVal = cat.Id ?? cat.id;
                      return (
                        <option key={idVal} value={idVal} className="bg-zinc-900 text-zinc-100">
                          {cat.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">
                    Cena (RSD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Npr. 4500"
                    className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300 flex justify-between">
                    <span>Snižena / Akcijska cena (RSD)</span>
                    <span className="text-zinc-500 font-normal">Opciono</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={e => setDiscountPrice(e.target.value)}
                    placeholder="Npr. 3900 (ostaviti prazno ako nema popusta)"
                    className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-semibold text-zinc-300">
                  Opis proizvoda
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Unesite opis materijala, namene, veličine i sl..."
                  rows={4}
                  className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 grid grid-cols-3 gap-4">
                {/* Stock Toggle */}
                <label className="flex flex-col gap-2 cursor-pointer select-none">
                  <span className="text-xs font-semibold text-zinc-400">Na stanju</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={stock}
                      onChange={e => setStock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                    <span className="text-sm font-medium text-zinc-200">
                      {stock ? 'Da' : 'Ne'}
                    </span>
                  </div>
                </label>

                {/* Active Toggle */}
                <label className="flex flex-col gap-2 cursor-pointer select-none">
                  <span className="text-xs font-semibold text-zinc-400">Prikaži na sajtu</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                    <span className="text-sm font-medium text-zinc-200">
                      {isActive ? 'Aktivno' : 'Skriveno'}
                    </span>
                  </div>
                </label>

                {/* New Collection Toggle */}
                <label className="flex flex-col gap-2 cursor-pointer select-none">
                  <span className="text-xs font-semibold text-zinc-400">Nova kolekcija</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newCollection}
                      onChange={e => setNewCollection(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 relative"></div>
                    <span className="text-sm font-medium text-zinc-200">
                      {newCollection ? 'Da' : 'Ne'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Newsletter Notification Option (Only for new products) */}
              {!isEdit && (
                <div className="bg-indigo-950/30 rounded-2xl p-4 border border-indigo-900/50 flex items-start gap-3">
                  <div className="p-2 bg-indigo-950/70 border border-indigo-800/60 rounded-xl text-indigo-400 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifyNewsletter}
                        onChange={e => setNotifyNewsletter(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/40 cursor-pointer accent-indigo-600"
                      />
                      <span className="text-xs font-bold text-zinc-100">
                        Obavesti newsletter pretplatnike o novom proizvodu
                      </span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                      Automatski šalje stilizovan e-mail svim prijavljenim kupcima sa slikom, cenom i linkom ka ovom novom modelu.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SLIKE (UP TO 6 IMAGES) */}
          {activeTab === 'slike' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                <span className="text-xs font-medium text-zinc-400">
                  Unesite URL linkove za slike modela
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={setDemoUrls}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ✨ Ubaci demo linkove
                  </button>
                </div>
              </div>

              {/* Main Image */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                  Glava / Glavna slika (Gde se klikće) *
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/slika1.jpg"
                    className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  {imageUrl && (
                    <div className="w-11 h-11 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                      <img src={imageUrl} alt="Glavna" className="w-full h-full object-cover" onError={(e)=>{ (e.target as HTMLImageElement).src='https://placehold.co/100?text=Greška'; }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Images 2 - 6 in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image 2 */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">Druga slika</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl2}
                      onChange={e => setImageUrl2(e.target.value)}
                      placeholder="https://example.com/slika2.jpg"
                      className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    {imageUrl2 && (
                      <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                        <img src={imageUrl2} alt="Slika 2" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Image 3 */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">Treća slika</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl3}
                      onChange={e => setImageUrl3(e.target.value)}
                      placeholder="https://example.com/slika3.jpg"
                      className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    {imageUrl3 && (
                      <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                        <img src={imageUrl3} alt="Slika 3" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Image 4 */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">Četvrta slika</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl4}
                      onChange={e => setImageUrl4(e.target.value)}
                      placeholder="https://example.com/slika4.jpg"
                      className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    {imageUrl4 && (
                      <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                        <img src={imageUrl4} alt="Slika 4" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Image 5 */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">Peta slika</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl5}
                      onChange={e => setImageUrl5(e.target.value)}
                      placeholder="https://example.com/slika5.jpg"
                      className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    {imageUrl5 && (
                      <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                        <img src={imageUrl5} alt="Slika 5" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Image 6 */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-zinc-300">Šesta slika</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl6}
                      onChange={e => setImageUrl6(e.target.value)}
                      placeholder="https://example.com/slika6.jpg"
                      className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    {imageUrl6 && (
                      <div className="w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                        <img src={imageUrl6} alt="Slika 6" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VELIČINE */}
          {activeTab === 'velicine' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div>
                   <h4 className="font-semibold text-white text-sm">Izaberite dostupne veličine</h4>
                   <p className="text-xs text-zinc-400">Možete obeležiti klikom koje veličine ovaj proizvod ima.</p>
                </div>
                {sizes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllSizes}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {selectedSizes.length === sizes.length ? 'Odznači sve' : 'Obeleži sve'}
                  </button>
                )}
              </div>

              {sizes.length === 0 ? (
                <div className="text-center py-6 text-sm text-zinc-400 border border-dashed border-zinc-800 rounded-xl">
                  Nema definisanih veličina u bazi. Definišite ih u sekciji za veličine pa se vratite.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {sizes.map((size, idx) => {
                    const isSelected = selectedSizes.includes(size.id);
                    return (
                      <button
                        key={size.id ? `${size.id}-${idx}` : idx}
                        type="button"
                        onClick={() => handleToggleSize(size.id)}
                        className={`p-3 border rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold shadow-xs'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-600 bg-zinc-900'
                        }`}>
                           {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm">{size.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BOJE */}
          {activeTab === 'boje' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div>
                  <h4 className="font-semibold text-white text-sm">Izaberite dostupne boje</h4>
                  <p className="text-xs text-zinc-400">Obeležite koje boje ovaj proizvod poseduje.</p>
                </div>
                {colors.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllColors}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    {selectedColors.length === colors.length ? 'Odznači sve' : 'Obeleži sve'}
                  </button>
                )}
              </div>

              {colors.length === 0 ? (
                <div className="text-center py-6 text-sm text-zinc-400 border border-dashed border-zinc-800 rounded-xl">
                  Nema definisanih boja u bazi podataka. Definišite ih u admin tabu baze pa se vratite.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {colors.map((color, idx) => {
                    const isSelected = selectedColors.includes(color.id);
                    const colorLabel = color.Color || color.color || color.name || 'Boja';
                    return (
                      <button
                        key={color.id ? `${color.id}-${idx}` : idx}
                        type="button"
                        onClick={() => handleToggleColor(color.id)}
                        className={`p-3 border rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold shadow-xs'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 relative ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-600 bg-zinc-900'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm">{colorLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </form>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center rounded-b-2xl shrink-0">
          <div className="text-xs text-zinc-500">
            * Obavezna polja
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Otkaži
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Sačuvaj proizvod
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
