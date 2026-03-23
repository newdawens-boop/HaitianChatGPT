import { createClient } from '@supabase/supabase-js';

/* =========================
   1. CONFIG
========================= */

const configs = [
  {
    name: 'primary',
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  {
    name: 'secondary',
    url: import.meta.env.VITE_SUPABASE_URL_2,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY_2,
  },
];

const clients = configs
  .filter(c => c.url && c.key)
  .map(c => ({
    name: c.name,
    client: createClient(c.url, c.key, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }),
    healthy: true,
    lastChecked: 0,
  }));

if (clients.length === 0) {
  throw new Error('❌ No Supabase configs available');
}

/* =========================
   2. HEALTH CHECK
========================= */

const HEALTH_TTL = 30_000; // 30 seconds cache

async function checkHealth() {
  const now = Date.now();

  await Promise.all(
    clients.map(async (entry) => {
      if (now - entry.lastChecked < HEALTH_TTL) return;

      try {
        // OPTION A (recommended): lightweight table
        const { error } = await entry.client
          .from('_health')
          .select('*')
          .limit(1);

        // OPTION B (faster fallback)
        // const { error } = await entry.client.auth.getSession();

        entry.healthy = !error;

      } catch (err) {
        entry.healthy = false;
      }

      entry.lastChecked = now;
    })
  );
}

/* =========================
   3. RETRY + FALLBACK
========================= */

let lastGoodClientIndex = 0;

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export async function supabaseRequest(fn, options = {}) {
  const {
    retries = 2,
    retryDelay = 300,
  } = options;

  await checkHealth();

  // prioritize last working client
  const orderedClients = [
    clients[lastGoodClientIndex],
    ...clients.filter((_, i) => i !== lastGoodClientIndex),
  ];

  let lastError;

  for (const entry of orderedClients) {
    if (!entry.healthy) continue;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await fn(entry.client);

        if (!result.error) {
          lastGoodClientIndex = clients.indexOf(entry);
          return result;
        }

        lastError = result.error;

      } catch (err) {
        lastError = err;
      }

      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1));
      }
    }

    console.warn(`⚠️ Supabase (${entry.name}) failed`);
  }

  throw lastError || new Error('❌ All Supabase clients failed');
}

/* =========================
   4. OPTIONAL DIRECT CLIENT
========================= */

export const supabase = clients[0].client;

/* =========================
   5. DEBUG (OPTIONAL)
========================= */

export function getSupabaseStatus() {
  return clients.map(c => ({
    name: c.name,
    healthy: c.healthy,
    lastChecked: c.lastChecked,
  }));
}