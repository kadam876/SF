const cache = new Map();
const inFlight = new Map(); // deduplicates parallel identical requests
const TTL = 2 * 60 * 1000; // 2 minutes

export async function cachedFetch(url, options = {}) {
  // Return cached response if still fresh
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < TTL) {
    return cached.data;
  }

  // If a request for this URL is already in-flight, wait for it
  if (inFlight.has(url)) {
    return inFlight.get(url);
  }

  const promise = fetch(url, options)
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cache.set(url, { data, ts: Date.now() });
      inFlight.delete(url);
      return data;
    })
    .catch((err) => {
      inFlight.delete(url);
      throw err;
    });

  inFlight.set(url, promise);
  return promise;
}

export function invalidateCache(urlPattern) {
  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) cache.delete(key);
  }
}
