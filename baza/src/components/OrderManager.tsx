/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Order, OrderItem, Product, Size, Color } from '../types';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  CreditCard, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  SlidersHorizontal, 
  RefreshCcw, 
  DollarSign, 
  Package,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Check,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface OrderManagerProps {
  orders: Order[];
  products: Product[];
  sizes: Size[];
  colors: Color[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

export default function OrderManager({
  orders,
  products,
  sizes,
  colors,
  onRefresh,
  refreshing
}: OrderManagerProps) {
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'valueDesc' | 'valueAsc'>('newest');

  // Expanded Orders State
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  // Action states
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Delete Order
  const handleDeleteOrder = async (order: Order) => {
    const orderNum = order.order_number || `#${order.id}`;
    const confirmMessage = `Da li ste sigurni da želite trajno da obrišete porudžbinu ${orderNum} od kupca "${order.customer_name}"?\n\nOva akcija će obrisati porudžbinu i sve vezane stavke iz baze podataka i ne može se poništiti.`;
    
    if (!window.confirm(confirmMessage)) return;

    setDeletingId(order.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      // 1. Try server-side deletion
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' });
      if (!res.ok) {
        // Direct database fallback: delete items then order
        await supabase.from('order_items').delete().eq('order_id', order.id);
        const { error: directError } = await supabase.from('orders').delete().eq('id', order.id);
        if (directError) throw directError;
      }

      setActionSuccess(`Porudžbina ${orderNum} je uspešno obrisana!`);
      setExpandedOrders(prev => prev.filter(id => id !== order.id));
      await onRefresh();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Delete order error:', err);
      setActionError(`Greška pri brisanju porudžbine: ${err.message || 'Nepoznata greška'}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle order expanded view
  const toggleOrderExpand = (orderId: number) => {
    if (expandedOrders.includes(orderId)) {
      setExpandedOrders(expandedOrders.filter(id => id !== orderId));
    } else {
      setExpandedOrders([...expandedOrders, orderId]);
    }
  };

  // Status badge style generator
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    switch (s) {
      case 'completed':
      case 'završeno':
      case 'isporučeno':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: 'Završeno',
          icon: <CheckCircle className="h-3 w-3 inline mr-1" />
        };
      case 'pending':
      case 'na čekanju':
      case 'novo':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          label: 'Na čekanju',
          icon: <Clock className="h-3 w-3 inline mr-1" />
        };
      case 'processing':
      case 'u obradi':
        return {
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          label: 'U obradi',
          icon: <SlidersHorizontal className="h-3 w-3 inline mr-1" />
        };
      case 'shipped':
      case 'poslato':
        return {
          bg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
          label: 'Poslato',
          icon: <Truck className="h-3 w-3 inline mr-1" />
        };
      case 'cancelled':
      case 'otkazano':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          label: 'Otkazano',
          icon: <XCircle className="h-3 w-3 inline mr-1" />
        };
      default:
        return {
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          label: status || 'Nepoznato',
          icon: null
        };
    }
  };

  // Payment Status Badge Style
  const getPaymentStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    switch (s) {
      case 'paid':
      case 'plaćeno':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: 'Plaćeno',
          icon: <Check className="h-3 w-3 inline mr-1" />
        };
      case 'unpaid':
      case 'neplaćeno':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          label: 'Neplaćeno',
          icon: <AlertTriangle className="h-3 w-3 inline mr-1" />
        };
      case 'refunded':
      case 'refundirano':
        return {
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          label: 'Refundirano',
          icon: <RefreshCcw className="h-3 w-3 inline mr-1" />
        };
      default:
        return {
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          label: status || 'Nepoznato',
          icon: null
        };
    }
  };

  // Payment Method Labels Translation
  const getPaymentMethodLabel = (method: string) => {
    const m = (method || '').toLowerCase().trim();
    if (m === 'cash_on_delivery' || m === 'cash' || m === 'pouzećem' || m === 'pouzecem') {
      return { label: 'Pouzećem', icon: <Truck className="h-3.5 w-3.5 text-slate-500" /> };
    }
    if (m === 'card' || m === 'kartica' || m === 'online') {
      return { label: 'Kartica / Online', icon: <CreditCard className="h-3.5 w-3.5 text-indigo-500" /> };
    }
    return { label: method || 'Drugo', icon: <CreditCard className="h-3.5 w-3.5 text-slate-400" /> };
  };

  // Update order status action in Supabase
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Flash success message
      setActionSuccess(`Status narudžbine #${orderId} uspešno promenjen na "${newStatus}"`);
      await onRefresh();
      
      // Auto fade out success message
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setActionError(`Neuspelo ažuriranje statusa: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update payment status action in Supabase
  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setActionSuccess(`Status plaćanja za narudžbinu #${orderId} uspesno postavljen na "${newPaymentStatus}"`);
      await onRefresh();
      
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setActionError(`Neuspelo ažuriranje statusa plaćanja: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Formatting date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nepoznato';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Formatting RSD price
  const formatRSD = (val: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Order List statistics calculations
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => {
    const s = (o.order_status || '').toLowerCase().trim();
    return s === 'pending' || s === 'na čekanju' || s === 'novo';
  }).length;
  
  const totalRevenue = orders
    .filter(o => (o.order_status || '').toLowerCase().trim() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  const completedOrdersCount = orders.filter(o => {
    const s = (o.order_status || '').toLowerCase().trim();
    return s === 'completed' || s === 'završeno' || s === 'isporučeno';
  }).length;

  // Filter & Sort Logic
  const filteredOrders = orders
    .filter(o => {
      // 1. Search filter
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = 
        !search ||
        (o.order_number || '').toLowerCase().includes(search) ||
        (o.customer_name || '').toLowerCase().includes(search) ||
        (o.email || '').toLowerCase().includes(search) ||
        (o.phone || '').toLowerCase().includes(search) ||
        (o.city || '').toLowerCase().includes(search);

      // 2. Order status filter
      let matchStatus = true;
      if (statusFilter !== 'all') {
        const os = (o.order_status || '').toLowerCase().trim();
        if (statusFilter === 'pending') matchStatus = os === 'pending' || os === 'na čekanju' || os === 'novo';
        else if (statusFilter === 'completed') matchStatus = os === 'completed' || os === 'završeno' || os === 'isporučeno';
        else if (statusFilter === 'processing') matchStatus = os === 'processing' || os === 'u obradi';
        else if (statusFilter === 'shipped') matchStatus = os === 'shipped' || os === 'poslato';
        else if (statusFilter === 'cancelled') matchStatus = os === 'cancelled' || os === 'otkazano';
      }

      // 3. Payment status filter
      let matchPayment = true;
      if (paymentFilter !== 'all') {
        const ps = (o.payment_status || '').toLowerCase().trim();
        if (paymentFilter === 'paid') matchPayment = ps === 'paid' || ps === 'plaćeno';
        else if (paymentFilter === 'unpaid') matchPayment = ps === 'unpaid' || ps === 'neplaćeno';
        else if (paymentFilter === 'refunded') matchPayment = ps === 'refunded' || ps === 'refundirano';
      }

      // 4. Payment method filter
      let matchMethod = true;
      if (methodFilter !== 'all') {
        const pm = (o.payment_method || '').toLowerCase().trim();
        if (methodFilter === 'cash') matchMethod = pm === 'cash_on_delivery' || pm === 'cash' || pm === 'pouzećem' || pm === 'pouzecem';
        else if (methodFilter === 'card') matchMethod = pm === 'card' || pm === 'kartica' || pm === 'online';
      }

      return matchSearch && matchStatus && matchPayment && matchMethod;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'valueDesc') {
        return (Number(b.total_price) || 0) - (Number(a.total_price) || 0);
      }
      if (sortBy === 'valueAsc') {
        return (Number(a.total_price) || 0) - (Number(b.total_price) || 0);
      }
      return 0;
    });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setMethodFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      
      {/* Top action toasts */}
      {actionError && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-sm rounded-2xl flex items-center gap-2.5 animate-fade-in font-medium">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-sm rounded-2xl flex items-center gap-2.5 animate-fade-in font-medium">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 block">Ukupno porudžbina</span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-display font-mono">{totalOrdersCount}</span>
            <span className="text-[10px] text-zinc-500 block">Sve vreme</span>
          </div>
          <div className="p-3 bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700/60">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 block">Nove / Na čekanju</span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-display font-mono">{pendingOrdersCount}</span>
            <span className="text-[10px] text-amber-500/80 block font-medium">Zahtevaju obradu</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 block">Isporučene porudžbine</span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-display font-mono">{completedOrdersCount}</span>
            <span className="text-[10px] text-emerald-500/80 block font-medium">Uspešno završeno</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Active Revenue */}
        <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 block">Ukupan promet</span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-400 font-display font-mono">{formatRSD(totalRevenue)}</span>
            <span className="text-[10px] text-indigo-400/80 block font-medium">Otkazane nisu uračunate</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border border-zinc-800 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search field */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pretraži porudžbine, kupce, grad, br..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:col-span-8">
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="all">Svi Statusi</option>
                <option value="pending">Na čekanju</option>
                <option value="processing">U obradi</option>
                <option value="shipped">Poslato / Kurir</option>
                <option value="completed">Završeno</option>
                <option value="cancelled">Otkazano</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="all">Sva plaćanja</option>
                <option value="paid">Plaćeno</option>
                <option value="unpaid">Neplaćeno</option>
                <option value="refunded">Refundirano</option>
              </select>
            </div>

            {/* Method Filter */}
            <div>
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="all">Sve metode</option>
                <option value="cash">Pouzećem (Cash)</option>
                <option value="card">Preko kartice</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="newest">Najnovije prvo</option>
                <option value="oldest">Najstarije prvo</option>
                <option value="valueDesc">Vrednost opadajuće</option>
                <option value="valueAsc">Vrednost rastuće</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clear active filters badge */}
        {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || methodFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-1 border-t border-zinc-800 flex-wrap">
            <span className="text-xs text-zinc-400">
              Pronađeno <b>{filteredOrders.length}</b> rezultata sa filterima:
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md cursor-pointer"
            >
              Resetuj filtere
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Sync Status strip */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800">
        <div className="text-xs font-semibold text-zinc-400 px-2 text-center sm:text-left">
          Prikazano: <span className="text-indigo-400 font-bold font-mono text-sm">{filteredOrders.length}</span> od <span className="font-mono text-sm text-zinc-200">{orders.length}</span> narudžbina
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
        >
          <RefreshCcw className={`h-4 w-4 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
          Osveži podatke
        </button>
      </div>

      {/* Orders Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-zinc-900/80 rounded-2xl border border-dashed border-zinc-800 py-16 text-center space-y-3">
          <div className="text-zinc-600 flex justify-center">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h4 className="text-base font-bold text-zinc-200">Nema pronađenih narudžbina</h4>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            Bilo da je baza prazna ili nijedna narudžbina ne odgovara zadatim filterima pretrage.
          </p>
          {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || methodFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs font-bold bg-zinc-800 px-3.5 py-1.5 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Resetuj filtere
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => {
            const isExpanded = expandedOrders.includes(order.id);
            const statusStyle = getStatusBadge(order.order_status);
            const paymentStyle = getPaymentStatusBadge(order.payment_status);
            const methodStyle = getPaymentMethodLabel(order.payment_method);
            const hasItems = order.items && order.items.length > 0;

            return (
              <div 
                key={order.id ? `${order.id}-${idx}` : idx}
                className={`bg-zinc-900/90 rounded-2xl border transition-all duration-300 ${
                  isExpanded 
                    ? 'border-indigo-500/50 shadow-xl ring-1 ring-indigo-500/20' 
                    : 'border-zinc-800 hover:border-zinc-700 shadow-sm'
                }`}
              >
                {/* Order Summary Line Header */}
                <div 
                  onClick={() => toggleOrderExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    {/* Order Identifier */}
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 bg-zinc-800 text-indigo-400 rounded-xl border border-zinc-700/60">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-widest uppercase block">Broj porudžbine</span>
                        <span className="font-bold text-white text-sm sm:text-base font-mono">
                          {order.order_number || `#ORD-${order.id}`}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-zinc-800"></div>

                    {/* Customer */}
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 font-mono block">Kupac</span>
                      <span className="font-semibold text-zinc-200 text-sm flex items-center gap-1">
                        <User className="h-3 w-3 text-zinc-400" />
                        {order.customer_name}
                      </span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-zinc-800"></div>

                    {/* Date */}
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 font-mono block">Datum poručivanja</span>
                      <span className="text-zinc-400 text-xs sm:text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-500" />
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges, Price, and Expand toggler */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t border-zinc-800/80 md:border-none pt-3 md:pt-0">
                    
                    {/* Sum cost */}
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-zinc-500 font-mono block">Ukupan iznos</span>
                      <span className="font-bold text-indigo-400 text-sm sm:text-base font-mono">
                        {formatRSD(order.total_price)}
                      </span>
                    </div>

                    {/* Order Status Badge */}
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}>
                      {statusStyle.icon}
                      {statusStyle.label}
                    </div>

                    {/* Payment Status Badge */}
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${paymentStyle.bg}`}>
                      {paymentStyle.icon}
                      {paymentStyle.label}
                    </div>

                    {/* Delete button (quick action) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(order);
                      }}
                      disabled={deletingId === order.id}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Obriši porudžbinu"
                    >
                      {deletingId === order.id ? (
                        <RefreshCcw className="h-4 w-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                    {/* Expand Trigger Icon */}
                    <div className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Extended Details Body (Accordion) */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 rounded-b-2xl space-y-6 animate-fade-in">
                    
                    {/* Information cards split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      
                      {/* Customer contact card */}
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 lg:col-span-4 space-y-3.5 shadow-sm">
                        <h4 className="font-bold text-zinc-100 text-xs sm:text-sm border-b border-zinc-800 pb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-400" />
                          Informacije o kupcu
                        </h4>
                        
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-zinc-500 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-zinc-500 block font-semibold uppercase font-mono">puno ime i prezime</span>
                              <span className="font-medium text-zinc-200">{order.customer_name}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-zinc-500 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-zinc-500 block font-semibold uppercase font-mono">Email Adresa</span>
                              <a href={`mailto:${order.email}`} className="font-medium text-indigo-400 hover:underline">
                                {order.email || '— nije uneto —'}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-zinc-500 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-zinc-500 block font-semibold uppercase font-mono">Telefon kupca</span>
                              <a href={`tel:${order.phone}`} className="font-mono font-bold text-zinc-200 hover:text-indigo-400">
                                {order.phone || '— nije uneto —'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping information details */}
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 lg:col-span-5 space-y-3.5 shadow-sm">
                        <h4 className="font-bold text-zinc-100 text-xs sm:text-sm border-b border-zinc-800 pb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          Dostava i Plaćanje
                        </h4>

                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-zinc-500 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-zinc-500 block font-semibold uppercase font-mono">Adresa isporuke</span>
                              <span className="font-medium text-zinc-200 block">{order.address}</span>
                              <span className="font-medium text-zinc-300 block">
                                {order.postal_code ? `${order.postal_code} ` : ''}{order.city}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            {methodStyle.icon}
                            <div>
                              <span className="text-[10px] text-zinc-500 block font-semibold uppercase font-mono">Modus plaćanja</span>
                              <span className="font-semibold text-zinc-200">{methodStyle.label}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-zinc-500 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-zinc-500 block font-semibold uppercase font-mono">Vreme za procesuiranje</span>
                              <span className="font-medium text-zinc-400">Isporuka u roku od 24h-48h</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status administrator panel actions */}
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 lg:col-span-3 space-y-3.5 shadow-sm">
                        <h4 className="font-bold text-zinc-100 text-xs sm:text-sm border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                          Upravljanje statusima
                        </h4>

                        <div className="space-y-3">
                          {/* Order Status Select Control */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Status Porudžbine</label>
                            <select
                              value={order.order_status || 'Pending'}
                              onChange={e => updateOrderStatus(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className="px-2 py-1.5 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="Pending" className="bg-zinc-900">Na čekanju (Novo)</option>
                              <option value="Processing" className="bg-zinc-900">U obradi</option>
                              <option value="Shipped" className="bg-zinc-900">Poslato (Kurir)</option>
                              <option value="Completed" className="bg-zinc-900">Završeno</option>
                              <option value="Cancelled" className="bg-zinc-900">Otkazano</option>
                            </select>
                          </div>

                          {/* Payment Status Select Control */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Status Plaćanja</label>
                            <select
                              value={order.payment_status || 'Unpaid'}
                              onChange={e => updatePaymentStatus(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className="px-2 py-1.5 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="Unpaid" className="bg-zinc-900">Neplaćeno</option>
                              <option value="Paid" className="bg-zinc-900">Plaćeno</option>
                              <option value="Refunded" className="bg-zinc-900">Refundirano</option>
                            </select>
                          </div>

                          {/* Delete Order Button */}
                          <div className="pt-2 border-t border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order)}
                              disabled={deletingId === order.id}
                              className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 text-rose-300 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Trajno obriši ovu porudžbinu iz baze"
                            >
                              {deletingId === order.id ? (
                                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Obriši porudžbinu
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order items listing */}
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
                      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                        <h4 className="font-bold text-zinc-200 text-xs sm:text-sm flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-zinc-400" />
                          Stavke porudžbine
                        </h4>
                        <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 text-xs font-bold font-mono rounded-full border border-zinc-700">
                          {order.items?.length || 0} stavka(e)
                        </span>
                      </div>

                      {!hasItems ? (
                        <div className="p-6 text-center text-zinc-500 text-xs italic">
                          Trenutno nema stavki ili detalja o artiklima za ovu porudžbinu u bazi.
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-800 overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                            <thead>
                              <tr className="bg-zinc-950/80 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800">
                                <th className="p-3">Artikal</th>
                                <th className="p-3 text-center">Atributi</th>
                                <th className="p-3 text-center">Cena</th>
                                <th className="p-3 text-center">Količina</th>
                                <th className="p-3 text-right">Ukupno stavka</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/80">
                              {order.items?.map((item, idx) => {
                                const prodObj = item.product;
                                // Resolve images
                                const imageSrc = prodObj?.images && prodObj.images.length > 0
                                  ? prodObj.images[0].image_url
                                  : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100';

                                const colorLabel = item.color
                                  ? (item.color.Color || item.color.color || item.color.name || 'Izabrana boja')
                                  : (item.color_id ? `Boja #${item.color_id}` : 'Nije navedena');

                                const sizeLabel = item.size 
                                  ? item.size.name 
                                  : (item.size_id ? `Veličina #${item.size_id}` : 'Nije navedena');

                                const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                                return (
                                  <tr key={item.id ?? idx} className="hover:bg-zinc-800/40 text-xs sm:text-sm">
                                    <td className="p-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg border border-zinc-700 overflow-hidden bg-black shrink-0">
                                          <img 
                                            src={imageSrc} 
                                            alt={prodObj?.name || 'Proizvod'} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200';
                                            }}
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <div>
                                          <span className="font-semibold text-zinc-100 block line-clamp-1 select-all" title={prodObj?.name}>
                                            {prodObj?.name || `Artikal #${item.product_id}`}
                                          </span>
                                          <span className="text-[10px] text-zinc-500 block font-mono">
                                            ID Proizvoda: #{item.product_id}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    
                                    <td className="p-3 text-center">
                                      <div className="flex flex-col items-center justify-center gap-1">
                                        <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-bold rounded-md font-mono">
                                          Veličina: {sizeLabel}
                                        </span>
                                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-bold rounded-md font-mono">
                                          Boja: {colorLabel}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="p-3 text-center font-semibold text-zinc-300 font-mono">
                                      {formatRSD(Number(item.price))}
                                    </td>

                                    <td className="p-3 text-center font-bold text-white font-mono">
                                      {Number(item.quantity)} kom.
                                    </td>

                                    <td className="p-3 text-right font-bold text-indigo-400 font-mono">
                                      {formatRSD(itemSubtotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
