/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Default project credentials
export const DEFAULT_SUPABASE_URL = 'https://xorvrwulsfpltkfruyse.supabase.co';
export const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcnZyd3Vsc2ZwbHRrZnJ1eXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzYzMjIsImV4cCI6MjA5MjQ1MjMyMn0.CM1dI1XyVsDjFpd5DDQM9ClGCIPvuywkeLh1JMUdLbw';
export const DEFAULT_SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcnZyd3Vsc2ZwbHRrZnJ1eXNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg3NjMyMiwiZXhwIjoyMDkyNDUyMzIyfQ.qWAOcE-pLJHhUHRJauEMRrLX02pdqiNRmW6u_67xcJ4';
export const DEFAULT_SUPABASE_JWT_SECRET = '304a23d8-6df8-476e-a2a9-48f403c48a9b';

// Check local storage values
const storedUrl = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
const storedKeyMode = localStorage.getItem('supabase_key_mode') || 'service_role'; // Default to service_role for admins

const getActiveKey = (mode: string) => {
  if (mode === 'anon') return DEFAULT_SUPABASE_ANON;
  return DEFAULT_SUPABASE_SERVICE_ROLE;
};

// Create actual client instance
let clientInstance = createClient(storedUrl, getActiveKey(storedKeyMode));

// Export proxy to allow live-updating the client without breaking ES modules imports
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const value = (clientInstance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(clientInstance);
    }
    return value;
  }
});

// Update function
export function updateClientConfig(url: string, keyMode: 'anon' | 'service_role') {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key_mode', keyMode);
  clientInstance = createClient(url, getActiveKey(keyMode));
}

// Get current configuration
export function getClientConfig() {
  return {
    url: localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL,
    keyMode: (localStorage.getItem('supabase_key_mode') || 'service_role') as 'anon' | 'service_role'
  };
}

