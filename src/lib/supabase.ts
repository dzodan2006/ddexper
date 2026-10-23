import { createClient } from '@supabase/supabase-js';

const rawUrl = 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : '') ||
  '';

// Čistimo URL ako sadrži /rest/v1/ na kraju jer ga SDK sam dodaje
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey = 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') ||
  '';

// Provera da li su kredencijali zaista validni i nisu placeholderi
const isRealUrl = supabaseUrl && 
                  supabaseUrl.startsWith('https://') && 
                  !supabaseUrl.includes('your-project-id') && 
                  !supabaseUrl.includes('placeholder-project') &&
                  supabaseUrl !== '';

const isRealKey = supabaseAnonKey && 
                  !supabaseAnonKey.includes('your-anon-key') && 
                  !supabaseAnonKey.includes('placeholder-key') &&
                  supabaseAnonKey !== '';

export const isSupabaseConfigured = !!(isRealUrl && isRealKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing or invalid! Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured.');
}

// Custom mock graditelj koji bezbedno presreće ulančane query pozive
const createMockBuilder = () => {
  const builder: any = {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => builder,
    delete: () => builder,
    eq: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    order: () => Promise.resolve({ data: [], error: null }),
    limit: () => Promise.resolve({ data: [], error: null }),
    range: () => Promise.resolve({ data: [], error: null }),
    match: () => Promise.resolve({ data: [], error: null }),
    or: () => Promise.resolve({ data: [], error: null }),
    filter: () => Promise.resolve({ data: [], error: null })
  };
  
  const handler: ProxyHandler<any> = {
    get(target: any, prop: string) {
      if (typeof target[prop] === 'function') {
        return (...args: any[]) => {
          const res = target[prop](...args);
          return typeof res === 'object' && res !== null && 'select' in res ? res : ProxyHelper(res);
        };
      }
      return target[prop] === undefined ? ProxyHelper(() => Promise.resolve({ data: [], error: null })) : target[prop];
    }
  };
  
  function ProxyHelper(obj: any): any {
    return new Proxy(obj, handler);
  }
  
  return new Proxy(builder, handler);
};

const mockSupabase = {
  from: () => createMockBuilder(),
  channel: () => ({
    on: () => ({
      subscribe: () => {}
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockSupabase as any);

