import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Edit2, Trash2, Eye, EyeOff, Check, X, AlertCircle, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
  isReordering?: boolean;
  orderIndex?: number;
  totalCount?: number;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
}

export default function ProductCard({ 
  product, 
  categories, 
  onEdit, 
  onDelete,
  isReordering = false,
  orderIndex = 0,
  totalCount = 0,
  onMoveLeft,
  onMoveRight,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging = false
}: ProductCardProps) {
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleting, setDeleting] = useState(false);

  // Get matching category name
  const categoryName = categories.find(
    cat => {
      const catId = cat.Id ?? cat.id;
      return Number(catId) === Number(product.category_id);
    }
  )?.name || 'Nema kategoriju';

  // Load product image or fallback
  const fallbackImage = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600';
  let mainImage = fallbackImage;

  if (product.images && product.images.length > 0) {
    const imgUrl = product.images[0].image_url;
    if (imgUrl && imgUrl.trim() !== '') {
      mainImage = imgUrl.startsWith('http') || imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl;
    }
  }

  // Calculate if there's an active discount
  const hasDiscount = product.discount_price !== null && Number(product.discount_price) > 0;

  const formatRSD = (value: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(value);
  };

  const handleDeleteClick = async () => {
    if (!product.id) return;
    setDeleting(true);
    try {
      await onDelete(product.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteStep(0);
    }
  };

  return (
    <div
      draggable={isReordering}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`bg-zinc-900 rounded-3xl border overflow-hidden shadow-md transition-all flex flex-col group h-full relative select-none ${
        isDragging ? 'opacity-40 scale-95 border-indigo-500 ring-2 ring-indigo-500' : 'border-zinc-800 hover:border-zinc-700 hover:shadow-xl'
      } ${isReordering ? 'cursor-grab active:cursor-grabbing ring-1 ring-indigo-500/40 hover:border-indigo-500/80' : ''}`}
    >
      {/* Reordering Header Handle */}
      {isReordering && (
        <div className="bg-indigo-950/90 border-b border-indigo-800/80 px-3 py-2 flex items-center justify-between text-indigo-200">
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
            <GripVertical className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              #{orderIndex + 1}
            </span>
            <span className="text-[11px] text-zinc-300 hidden sm:inline">Prevucite</span>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onMoveLeft}
              disabled={orderIndex === 0}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Pomeri levo / unazad"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveRight}
              disabled={orderIndex >= totalCount - 1}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Pomeri desno / unapred"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Image Container with Badges */}
      <div className="relative aspect-video sm:aspect-square w-full bg-zinc-950 overflow-hidden shrink-0">
        <img 
          src={mainImage} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          onError={(e)=>{ (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'; }}
          referrerPolicy="no-referrer"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
          {product.new_collection && (
            <span className="px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-md">
              Novo
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-md">
              Popust
            </span>
          )}
        </div>

        {/* Toggleable Stock badges inside card */}
        <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${
            product.stock 
              ? 'bg-emerald-600/90 text-white' 
              : 'bg-rose-600/90 text-white'
          }`}>
            {product.stock ? 'Na stanju' : 'Nema na stanju'}
          </span>

          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 shadow-sm ${
            product.is_active 
              ? 'bg-indigo-600/90 text-white' 
              : 'bg-zinc-800/90 text-zinc-300 border border-zinc-700/50'
          }`}>
            {product.is_active ? <Eye className="h-2.5 w-2.5 inline" /> : <EyeOff className="h-2.5 w-2.5 inline" />}
            {product.is_active ? 'Aktivno' : 'Skriveno'}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-zinc-900">
        
        <div className="space-y-2">
          {/* Category */}
          <span className="text-[11px] font-semibold text-zinc-400 font-mono tracking-wider uppercase block">
            {categoryName}
          </span>

          {/* Product Name */}
          <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 text-sm sm:text-base pr-2" title={product.name}>
            {product.name}
          </h4>

          {/* Description */}
          {product.description ? (
            <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
              {product.description}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic min-h-[2rem]">
              Nema opisa za ovaj proizvod.
            </p>
          )}

          {/* Display sizes */}
          <div className="pt-1.5 pb-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Dostupne Veličine
            </span>
            <div className="flex flex-wrap gap-1">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((s, idx) => (
                  <span 
                    key={s.id ? `${s.id}-${idx}` : idx} 
                    className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/80 rounded text-[10px] font-mono font-bold text-zinc-200"
                  >
                    {s.name}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-zinc-500 italic">— podaci nisu uneti —</span>
              )}
            </div>
          </div>

          {/* Display colors */}
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Dostupne Boje
            </span>
            <div className="flex flex-wrap gap-1">
              {product.colors && product.colors.length > 0 ? (
                product.colors.map((c, idx) => (
                  <span 
                    key={c.id ? `${c.id}-${idx}` : idx} 
                    className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/80 rounded text-[10px] font-mono font-bold text-zinc-200"
                  >
                    {c.Color || c.color || c.name || 'Boja'}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-zinc-500 italic">Proizvod nema boje</span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Deletion Actions Section */}
        <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
          {/* Prices */}
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-[10px] text-zinc-500 line-through font-mono">
                  {formatRSD(Number(product.price))}
                </span>
                <span className="text-base font-bold text-rose-400 font-display">
                  {formatRSD(Number(product.discount_price))}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-zinc-100 font-display">
                {formatRSD(Number(product.price))}
              </span>
            )}
          </div>

          {/* Quick edit / delete */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Izmeni proizvod"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteStep(1)}
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Obriši proizvod"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Popup Modal */}
        {deleteStep > 0 && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-fade-in">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-zinc-800 overflow-hidden text-left">
              
              {/* Step 1 popup content */}
              {deleteStep === 1 && (
                <div>
                  <div className="bg-amber-950/40 p-5 border-b border-amber-900/50 flex items-center gap-3">
                    <div className="p-2.5 bg-amber-900/60 text-amber-300 rounded-xl">
                      <AlertCircle className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-amber-900/50 border border-amber-700/50 text-amber-200 font-bold text-[10px] tracking-wider uppercase font-mono rounded mb-1">
                        Korak 1 od 2
                      </span>
                      <h4 className="font-extrabold text-amber-100 text-base">Potvrda brisanja</h4>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Da li ste sigurni da želite da obrišete proizvod <strong className="text-white font-bold select-all">"{product.name}"</strong>?
                    </p>
                    <div className="pt-2 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeleteStep(0)}
                        className="px-4 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Ne, odustani
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteStep(2)}
                        className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors shadow-sm cursor-pointer"
                      >
                        Da, nastavi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 popup content (extremely high-contrast warnings) */}
              {deleteStep === 2 && (
                <div>
                  <div className="bg-rose-950/40 p-5 border-b border-rose-900/50 flex items-center gap-3">
                    <div className="p-2.5 bg-rose-900/60 text-rose-300 rounded-xl animate-bounce">
                      <AlertCircle className="h-6 w-6 stroke-[3]" />
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-rose-900/50 border border-rose-700/50 text-rose-200 font-bold text-[10px] tracking-wider uppercase font-mono rounded mb-1">
                        Korak 2 od 2
                      </span>
                      <h4 className="font-extrabold text-rose-100 text-base">KONAČNA POTVRDA</h4>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div className="p-4 bg-rose-950/70 border border-rose-800 rounded-xl text-left shadow-sm">
                      <p className="text-rose-200 font-extrabold text-sm leading-relaxed mb-1.5 flex items-center gap-1.5">
                        ⚠️ PAŽNJA! GUBITAK PODATAKA!
                      </p>
                      <p className="text-rose-300 font-medium text-xs leading-relaxed">
                        Kada potvrdite ovaj korak, proizvod će biti trajno obrisan iz baze podataka i NEĆE ga više biti moguće vratiti nazad niti povratiti!
                      </p>
                    </div>
                    
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                      Sve reference o proizvodu će nestati. Pritisnite crveno dugme ispod samo ako ste apsolutno sigurni.
                    </p>

                    <div className="pt-2 flex justify-end gap-2.5">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => setDeleteStep(0)}
                        className="px-4 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Odustani i sačuvaj
                      </button>
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={handleDeleteClick}
                        className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {deleting ? 'Brisanje...' : 'DA, TRAJNO OBRIŠI!'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
