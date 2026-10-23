import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShieldCheck, Lock, User, Eye, EyeOff, LogOut, Check, AlertCircle, Loader2 } from 'lucide-react';

const BazaApp = lazy(() => import('../../baza/src/App'));

const STORAGE_KEY = 'dddesign_owner_token';
const REMEMBER_KEY = 'dddesign_owner_remember';

interface OwnerUser {
  id: number | string;
  username: string;
}

export default function OwnerPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<OwnerUser | null>(null);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      // Check localStorage first, then sessionStorage
      const token = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('/api/owner/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            return;
          }
        }

        // Invalid or expired token
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
      } catch (err) {
        console.error('Session verify error:', err);
        setIsAuthenticated(false);
      }
    }

    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Molimo unesite korisničko ime i lozinku.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Pogrešno korisničko ime ili lozinka.');
        setSubmitting(false);
        return;
      }

      // Login successful!
      // Handle "Zapamti me na ovom uređaju"
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, data.token);
        localStorage.setItem(REMEMBER_KEY, 'true');
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, data.token);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setPassword('');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage('Došlo je do greške prilikom povezivanja sa serverom.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  // 1. Initial Checking Session State
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-300 font-sans p-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-400 tracking-wider uppercase">Provera autorizacije...</p>
      </div>
    );
  }

  // 2. Unauthenticated: Render Dark Luxury Login Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-white">
        {/* Top Minimal Navigation */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Povratak na prodavnicu</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-xs uppercase text-zinc-300">DD DESIGN</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              Admin Portal
            </span>
          </div>
        </header>

        {/* Main Center Login Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
          <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge */}
            <div className="text-center mb-6 relative">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-indigo-400 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                Prijava za vlasnike
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Pristup bazi proizvoda, narudžbinama i upravljanju prodavnicom DD DESIGN.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Korisničko ime
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Unesite korisničko ime"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Lozinka
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Unesite lozinku"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me On This Device Checkbox */}
              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-zinc-300 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/40 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                  />
                  <span>Zapamti me na ovom uređaju</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Prijavljivanje...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Prijavi se na portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
              <p className="text-[11px] text-zinc-500">
                Pristup je strogo ograničen za vlasnike i administratore brenda DD DESIGN.
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="py-4 text-center text-xs text-zinc-600 border-t border-zinc-900">
          DD DESIGN • Siguran vlasnički pristup
        </footer>
      </div>
    );
  }

  // 3. Authenticated: Render Owner Portal with Dark Mode Top-Bar & Logout Action
  return (
    <div className="baza-portal min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Bar for Owners */}
      <header className="bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Povratak na prodavnicu</span>
            <span className="inline sm:hidden">Prodavnica</span>
          </Link>
          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-sm">DD DESIGN</span>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>Stranica za vlasnike</span>
            </span>
          </div>
        </div>

        {/* Right side: User Badge & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {currentUser && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Prijavljen:</span>
              <strong className="text-zinc-200 font-semibold">{currentUser.username}</strong>
            </div>
          )}

          <Link
            to="/shop"
            className="text-xs text-zinc-400 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-900"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 transition-colors cursor-pointer"
            title="Odjavi se sa ovog naloga"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Odjavi se</span>
          </button>
        </div>
      </header>

      {/* Main Baza Application */}
      <main className="flex-1 bg-zinc-950">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
            <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Učitavanje baze za vlasnike...</p>
          </div>
        }>
          <BazaApp />
        </Suspense>
      </main>
    </div>
  );
}
