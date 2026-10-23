/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product, Category } from '../types';
import { ShoppingBag, CheckCircle, AlertTriangle, Tag, Percent, Layers } from 'lucide-react';

interface StatsOverviewProps {
  products: Product[];
  categories: Category[];
}

export default function StatsOverview({ products, categories }: StatsOverviewProps) {
  const totalProducts = products.length;
  
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = totalProducts - activeProducts;
  
  const inStockProducts = products.filter(p => p.stock).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  
  const newCollectionProducts = products.filter(p => p.new_collection).length;

  // Calculate prices
  const averagePrice = totalProducts > 0 
    ? products.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / totalProducts 
    : 0;

  const discountedProducts = products.filter(p => p.discount_price !== null && Number(p.discount_price) > 0);
  const averageDiscount = discountedProducts.length > 0
    ? discountedProducts.reduce((acc, p) => acc + (Number(p.price) - (Number(p.discount_price) || 0)), 0) / discountedProducts.length
    : 0;

  // Category breakdown
  const categoryStats = categories.map(cat => {
    const catId = cat.Id ?? cat.id;
    const count = products.filter(p => p.category_id !== null && Number(p.category_id) === Number(catId)).length;
    return {
      name: cat.name,
      count
    };
  }).sort((a, b) => b.count - a.count);

  const formatRSD = (value: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Products Card */}
        <div className="bg-zinc-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-medium text-zinc-400 block">Ukupno proizvoda</span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-display">{totalProducts}</span>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 rounded-xl">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            U bazi podataka
          </div>
        </div>

        {/* Active Products Card */}
        <div className="bg-zinc-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-medium text-zinc-400 block">Aktivno na sajtu</span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-display">{activeProducts}</span>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 rounded-xl">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-zinc-400">
            {inactiveProducts} proizvoda trenutno sklonjeno/neaktivno
          </p>
        </div>

        {/* Stock Status Card */}
        <div className="bg-zinc-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-medium text-zinc-400 block">Na stanju</span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-display">{inStockProducts}</span>
            </div>
            <div className="p-2 sm:p-3 bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 rounded-xl">
              <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 inline shrink-0" />
            {outOfStockProducts} proizvoda nema na stanju
          </p>
        </div>

        {/* Average Price Card */}
        <div className="bg-zinc-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-medium text-zinc-400 block">Prosečna cena</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-300 font-display">{formatRSD(averagePrice)}</span>
            </div>
            <div className="p-2 sm:p-3 bg-amber-950/50 text-amber-400 border border-amber-900/50 rounded-xl">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-zinc-400">
            {discountedProducts.length} na popustu (prosek popusta: {formatRSD(averageDiscount)})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Category Breakdown */}
        <div className="bg-zinc-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-sm lg:col-span-2">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 font-display flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            Raspodela po kategorijama
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">Nema definisanih kategorija.</p>
            ) : (
              categoryStats.map((stat, idx) => {
                const percentage = totalProducts > 0 ? (stat.count / totalProducts) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="font-medium text-zinc-300">{stat.name}</span>
                      <span className="font-semibold text-white font-mono">
                        {stat.count} {stat.count === 1 ? 'proizvod' : stat.count > 1 && stat.count < 5 ? 'proizvoda' : 'proizvoda'} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fast Insights */}
        <div className="bg-zinc-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 font-display">Brzi uvid</h3>
            
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
                <div>
                  <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm">Nova Kolekcija</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-400">Označen tag &quot;new_collection&quot;</p>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-violet-950/60 text-violet-300 border border-violet-800/60 text-xs font-bold rounded-lg font-mono">
                  {newCollectionProducts}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 sm:p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
                <div>
                  <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm">Popusti i Akcije</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-400">Proizvodi sa sniženom cenom</p>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-rose-950/60 text-rose-300 border border-rose-800/60 text-xs font-bold rounded-lg font-mono flex items-center gap-0.5">
                  <Percent className="h-3 w-3" />
                  {discountedProducts.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 sm:p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
                <div>
                  <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm">Ukupno Kategorija</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-400">Kategorije u bazi podataka</p>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 text-xs font-bold rounded-lg font-mono">
                  {categories.length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-zinc-800 mt-4 sm:mt-6 text-[11px] text-zinc-500 text-center">
            Podaci povučeni direktno iz baze podataka
          </div>
        </div>
      </div>
    </div>
  );
}
