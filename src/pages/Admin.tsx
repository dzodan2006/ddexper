import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Calendar, User, Mail, Phone, MapPin, CreditCard, 
  Search, RefreshCw, CheckCircle, AlertTriangle, ChevronRight, 
  HelpCircle, Archive, ClipboardList, TrendingUp, DollarSign, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

// High-level types config
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  products?: {
    name: string;
  } | null;
}

interface Order {
  id: number;
  created_at: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  order_items?: OrderItem[];
}

export default function Admin() {
  const { theme } = useTheme();
  
  // Security
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dd_admin_auth_v1') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Refund UI State
  const [activeRefundOrder, setActiveRefundOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState<boolean>(false);

  // Authenticate Admin
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'dd-admin-2026') {
      setIsAuthenticated(true);
      localStorage.setItem('dd_admin_auth_v1', 'true');
      setPinError('');
    } else {
      setPinError('Neispravna administratorska lozinka.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dd_admin_auth_v1');
  };

  // Fetch orders with nested items
  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
      } else if (data) {
        setOrders(data as Order[]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  // Extract RaiAccept dynamic credentials from address string
  // Format: "Ulica 123 [RaiAccept: <orderId> | <transactionId>]"
  const parseRaiAcceptDetails = (address: string) => {
    const regex = /\[RaiAccept:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/;
    const match = address.match(regex);
    if (match) {
      return {
        orderId: match[1].trim(),
        transactionId: match[2].trim(),
        cleanAddress: address.replace(regex, '').trim()
      };
    }
    return null;
  };

  // Initiate Refund interface
  const openRefundModal = (order: Order, maxAmount: number) => {
    setActiveRefundOrder(order);
    setRefundAmount(maxAmount);
    setRefundError(null);
    setRefundSuccess(false);
  };

  const closeRefundModal = () => {
    setActiveRefundOrder(null);
    setRefundAmount(0);
    setRefundError(null);
    setRefundSuccess(false);
  };

  const executeRefund = async () => {
    if (!activeRefundOrder) return;
    const details = parseRaiAcceptDetails(activeRefundOrder.address);
    if (!details) {
      setRefundError("Nije moguće pronaći RaiAccept OrderID/TransactionID.");
      return;
    }

    if (refundAmount <= 0 || refundAmount > activeRefundOrder.total_price) {
      setRefundError(`Iznos mora biti između 1 i ${activeRefundOrder.total_price} RSD.`);
      return;
    }

    setRefundLoading(true);
    setRefundError(null);

    try {
      const payload = {
        orderId: details.orderId,
        transactionId: details.transactionId,
        amount: refundAmount,
        currency: "RSD"
      };

      const res = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        // Update database with refunded state
        const isFullRefund = Number(refundAmount) >= activeRefundOrder.total_price;
        const targetStatus = isFullRefund ? 'refunded' : 'partially_refunded';
        const targetOrderStatus = isFullRefund ? 'cancelled' : activeRefundOrder.order_status;

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: targetStatus,
            order_status: targetOrderStatus
          })
          .eq('id', activeRefundOrder.id);

        if (updateError) {
          console.error("Failed to update status in Supabase DB:", updateError);
        }

        setRefundSuccess(true);
        // Refresh local orders cache immediately
        setTimeout(() => {
          fetchOrders();
          closeRefundModal();
        }, 2200);
      } else {
        setRefundError(resData.error || resData.details || "Refundacija nije odobrena od strane banke.");
      }
    } catch (err: any) {
      console.error("Refund transaction failed:", err);
      setRefundError(err.message || "Greška pri komunikaciji sa serverom.");
    } finally {
      setRefundLoading(false);
    }
  };

  // Sync / check transaction status with bank manually
  const syncTransactionStatus = async (order: Order) => {
    const details = parseRaiAcceptDetails(order.address);
    if (!details) return;

    try {
      const response = await fetch(`/api/payments/transaction-status?orderId=${details.orderId}&transactionId=${details.transactionId}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          // Look at both order and transactions list
          const tx = json.transactions?.transaction || 
                     (Array.isArray(json.transactions) ? json.transactions[0] : (json.transactions?.transactions ? json.transactions.transactions[0] : null));
          const orderState = json.order?.status?.toUpperCase();
          const txStatus = tx?.status?.toUpperCase();

          // Combined status check
          const activeStatus = txStatus || orderState;

          if (activeStatus === 'SUCCESS' || activeStatus === 'SETTLED' || activeStatus === 'CAPTURED' || activeStatus === 'COMPLETED' || activeStatus === 'PAID') {
            if (order.payment_status !== 'paid') {
              await supabase.from('orders').update({ payment_status: 'paid', order_status: 'processing' }).eq('id', order.id);
              fetchOrders();
            }
            alert(`Bankovni status: ${activeStatus} (USPEŠNO PLAĆENO! Narudžbina je ažurirana u bazi).`);
          } else if (activeStatus === 'CANCELED' || activeStatus === 'CANCELLED') {
            if (order.payment_status !== 'failed') {
              await supabase.from('orders').update({ payment_status: 'failed', order_status: 'cancelled' }).eq('id', order.id);
              fetchOrders();
            }
            alert(`Bankovni status: ${activeStatus} (OTKAZANO! Korisnik je odustao ili prekinuo plaćanje).`);
          } else if (activeStatus === 'FAILED' || activeStatus === 'DECLINED') {
            if (order.payment_status !== 'failed') {
              await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
              fetchOrders();
            }
            alert(`Bankovni status: ${activeStatus} (NEUSPEŠNO! Banka je odbila transakciju).`);
          } else if (activeStatus === 'CHECKOUT') {
            alert(`Bankovni status: CHECKOUT (Korisnik je trenutno preusmeren na stranu banke za plaćanje ili je zatvorio pregledač pre unosa detalja kartice).`);
          } else if (activeStatus === 'DRAFT') {
            alert(`Bankovni status: DRAFT (Nalog za plaćanje je uspešno registrovan u RaiAccept sistemu, ali korisnik još uvek nije otvorio stranu za plaćanje).`);
          } else if (activeStatus) {
            alert(`Bankovni status: ${activeStatus}`);
          } else {
            alert('Status transakcije nije dostupan na bankovnom sistemu.');
          }
        }
      } else {
        alert('Neuspešno dohvatanje statusa sa RaiAccept-a.');
      }
    } catch (err) {
      console.error(err);
      alert('Greška pri komunikaciji sa API-jem.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.order_number.toLowerCase().includes(searchLower) ||
      order.email.toLowerCase().includes(searchLower) ||
      order.phone.includes(searchLower);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'paid') return matchesSearch && order.payment_status === 'paid';
    if (statusFilter === 'pending') return matchesSearch && order.payment_status === 'pending';
    if (statusFilter === 'refunded') return matchesSearch && (order.payment_status === 'refunded' || order.payment_status === 'partially_refunded');
    if (statusFilter === 'card') return matchesSearch && order.payment_method === 'card';
    return matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-3xl border transition-all duration-500 shadow-2xl ${
            theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-white border-gray-100'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
              <Lock className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              DD DESIGN Admin
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
              Molimo unesite lozinku za pristup menadžmentu porudžbina i refundacija.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>
                Sifra za pristup
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Unesite administratorsku šifru..."
                className={`w-full px-4 py-3 rounded-xl border text-sm font-sans font-medium focus:outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-white' 
                    : 'bg-white border-gray-200 text-black focus:border-black'
                }`}
              />
              {pinError && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 transform hover:scale-[1.02] ${
                theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              Uloguj se
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4 border-b pb-8 border-current/10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase">
            Kontrolna Tabla
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            Pregled porudžbina, provera bankovnih transakcija i upravljanje refundacijama (RaiAccept API).
          </p>
        </div>
        <button
          onClick={handleLogout}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-colors ${
            theme === 'dark' ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:text-black'
          }`}
        >
          Odjavi se
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-extrabold">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-1">Primljenih porudžbina</p>
        </div>
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-500">Plaćeno</span>
          </div>
          <p className="text-3xl font-extrabold text-green-500">
            {orders.filter(o => o.payment_status === 'paid').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Uspešno realizovanih</p>
        </div>
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Promet</span>
          </div>
          <p className="text-3xl font-extrabold text-amber-500">
            {orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_price, 0).toLocaleString()} <span className="text-sm font-bold">RSD</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Iz realizovanih uplata</p>
        </div>
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111] border-zinc-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Refund</span>
          </div>
          <p className="text-3xl font-extrabold">
            {orders.filter(o => o.payment_status === 'refunded' || o.payment_status === 'partially_refunded').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Povraćaja sredstava</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraga po kupcu, broju porudžbine, email-u ili telefonu..."
            className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-all ${
              theme === 'dark' 
                ? 'bg-zinc-900/40 border-zinc-900 text-white focus:border-white' 
                : 'bg-white border-gray-100 text-black focus:border-black'
            }`}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Sve' },
            { id: 'paid', label: 'Plaćene' },
            { id: 'pending', label: 'Na čekanju' },
            { id: 'refunded', label: 'Refundirane' },
            { id: 'card', label: 'Kartične' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white')
                  : (theme === 'dark' ? 'bg-zinc-900/50 text-zinc-400 hover:text-white border-zinc-805' : 'bg-gray-100 hover:bg-gray-200 text-gray-600')
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Accordion */}
      <div className="space-y-4">
        {loadingOrders ? (
          <div className="text-center py-20">
            <RefreshCw className="w-10 h-10 mx-auto animate-spin mb-4 text-zinc-400" />
            <p className="text-sm text-zinc-500">Učitavam porudžbine iz baze podataka...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 border rounded-3xl border-dashed">
            <Archive className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
            <p className="text-sm text-zinc-500">Nije pronađena nijedna porudžbina.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const raiaccept = parseRaiAcceptDetails(order.address);
            
            return (
              <div 
                key={order.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded 
                    ? (theme === 'dark' ? 'bg-zinc-950/40 border-white' : 'bg-gray-50 border-black')
                    : (theme === 'dark' ? 'bg-zinc-900/10 border-zinc-900 hover:border-zinc-700' : 'bg-white border-gray-100 hover:bg-gray-50')
                }`}
              >
                {/* Header structure */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-extrabold tracking-wider">{order.order_number}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded ${
                        order.payment_method === 'card' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {order.payment_method === 'card' ? 'KARTICA (RaiAccept)' : 'POUZEĆE'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{order.customer_name}</h3>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-400">Ukupan iznos</p>
                      <p className="font-extrabold font-mono text-lg">{order.total_price.toLocaleString()} RSD</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        order.payment_status === 'paid' 
                          ? 'bg-green-500/10 text-green-500' 
                          : order.payment_status === 'refunded'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : order.payment_status === 'partially_refunded'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {order.payment_status === 'paid' ? 'PLAĆENO' 
                          : order.payment_status === 'refunded' ? 'REFUNDIRANO'
                          : order.payment_status === 'partially_refunded' ? 'DELIMIČNO REFUND.'
                          : 'NEPLAĆENO'}
                      </span>

                      <ChevronRight className={`w-5 h-5 transition-transform text-gray-400 ${isExpanded ? 'rotate-90 text-current' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-current/5 p-6 bg-current/[0.02]"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Contact details */}
                        <div className="space-y-4">
                          <h4 className="font-bold uppercase tracking-wider text-xs text-gray-400 border-b pb-2">Kupac & Dostava</h4>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex items-center gap-2.5">
                              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                              <a href={`mailto:${order.email}`} className="hover:underline font-medium">{order.email}</a>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                              <a href={`tel:${order.phone}`} className="hover:underline font-medium">{order.phone}</a>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">{raiaccept ? raiaccept.cleanAddress : order.address}</p>
                                <p className="text-xs text-gray-400">{order.postal_code} {order.city}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-xs font-mono text-gray-400">
                                {new Date(order.created_at).toLocaleString('sr-RS')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="space-y-4">
                          <h4 className="font-bold uppercase tracking-wider text-xs text-gray-400 border-b pb-2">Artikli u porudžbini</h4>
                          <div className="space-y-2.5">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm font-sans">
                                <div>
                                  <p className="font-medium">{item.products?.name || 'DD DESIGN Artikal'}</p>
                                  <p className="text-xs text-zinc-500">Količina: {item.quantity} x {item.price.toLocaleString()} RSD</p>
                                </div>
                                <span className="font-bold font-mono">{(item.quantity * item.price).toLocaleString()} RSD</span>
                              </div>
                            )) || <p className="text-xs text-zinc-500">Nema evidentiranih artikala.</p>}
                          </div>
                        </div>

                        {/* RaiAccept Management & Actions */}
                        <div className="space-y-4">
                          <h4 className="font-bold uppercase tracking-wider text-xs text-gray-400 border-b pb-2">RaiAccept Integracija</h4>
                          
                          {order.payment_method === 'card' && raiaccept ? (
                            <div className="space-y-3.5">
                              <div className="p-3.5 rounded-xl text-xs font-mono bg-current/[0.03] space-y-2 border border-current/[0.05]">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">OrderID:</span>
                                  <span className="font-medium text-right select-all">{raiaccept.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">TxID:</span>
                                  <span className="font-medium text-right select-all">{raiaccept.transactionId}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => syncTransactionStatus(order)}
                                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                                    theme === 'dark' 
                                      ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-900' 
                                      : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Proveri status
                                </button>

                                {(order.payment_status === 'paid' || order.payment_status === 'partially_refunded') && (
                                  <button
                                    onClick={() => openRefundModal(order, order.total_price)}
                                    className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Refundiraj
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : order.payment_method === 'card' ? (
                            <div className="p-4 rounded-xl text-xs bg-amber-500/5 text-amber-500 flex gap-2 border border-amber-500/10">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <p>ID transakcije nije zapisan za ovu porudžbinu (moguće je da plaćanje nije preusmereno ili započeto).</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Ova porudžbina koristi plaćanje pouzećem (gotovinski), stoga kartični povraćaj (Refund) nije dostupan.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Refund Flow Modal UI */}
      <AnimatePresence>
        {activeRefundOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRefundModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-lg p-8 rounded-3xl border shadow-2xl z-10 transition-colors duration-500 ${
                theme === 'dark' ? 'bg-[#111] border-zinc-900 text-white' : 'bg-white border-gray-100 text-black'
              }`}
            >
              <button 
                onClick={closeRefundModal}
                className={`absolute right-6 top-6 p-1 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded">
                    Banka Refund API
                  </span>
                  <h3 className="text-2xl font-black mt-2 tracking-tight">POKRENI REFUNDACIJU</h3>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                    Izdajete novčani povraćaj za porudžbinu <span className="font-mono font-bold text-current">{activeRefundOrder.order_number}</span>.
                  </p>
                </div>

                {refundSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold">Povraćaj uspešno evidentiran!</h4>
                    <p className={`text-sm max-w-sm mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                      Sredstva su uspešno povučena i bazu smo ažurirali. Prozor će se sada zatvoriti.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 rounded-2xl bg-current/[0.03]">
                        <div>
                          <p className="text-zinc-500">IZNOS PORUDŽBINE:</p>
                          <p className="font-extrabold text-sm">{activeRefundOrder.total_price.toLocaleString()} RSD</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">MOGUĆ POVRAT:</p>
                          <p className="font-extrabold text-sm text-amber-500">{activeRefundOrder.total_price.toLocaleString()} RSD</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`}>
                          Iznos za refundaciju (RSD)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(Math.max(1, Number(e.target.value)))}
                            placeholder="Unesite iznos..."
                            className={`w-full px-4 py-3.5 rounded-xl border text-base font-bold font-mono focus:outline-none transition-all ${
                              theme === 'dark' 
                                ? 'bg-zinc-900 border-zinc-805 text-white focus:border-white' 
                                : 'bg-gray-50 border-gray-150 text-black focus:border-black'
                            }`}
                          />
                        </div>
                      </div>

                      {refundError && (
                        <div className="p-4 rounded-xl text-xs bg-red-500/10 text-red-500 flex gap-2 border border-red-500/15">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p className="leading-relaxed font-semibold">{refundError}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={closeRefundModal}
                        disabled={refundLoading}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase border transition-colors ${
                          theme === 'dark' 
                            ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 disabled:opacity-50' 
                            : 'border-gray-250 text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                        }`}
                      >
                        Otkaži
                      </button>

                      <button
                        onClick={executeRefund}
                        disabled={refundLoading}
                        className="flex-1 py-3.5 bg-red-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-red-650 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {refundLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Slanje zahteva...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Potvrdi Refund
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
