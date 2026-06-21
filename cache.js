/**
 * filename: js/api/cache.js
 * purpose: sessionStorage cache layer with TTL support
 * dependencies: None
 */

/**
 * Cache object with TTL support using sessionStorage
 */
const cache = {
  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const data = JSON.parse(item);
      const now = Date.now();

      // Check if expired
      if (data.expiresAt && data.expiresAt < now) {
        sessionStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.warn(`Cache get error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 300)
   * @returns {boolean} True if successful
   */
  set(key, value, ttlSeconds = 300) {
    try {
      const data = {
        value: value,
        expiresAt: Date.now() + (ttlSeconds * 1000)
      };
      sessionStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Cache set error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove a value from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if successful
   */
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Cache remove error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all cache
   * @returns {boolean} True if successful
   */
  clear() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.warn('Cache clear error:', error);
      return false;
    }
  },

  /**
   * Check if a key exists in cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  },

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    let totalItems = 0;
    let validItems = 0;
    const keys = [];

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          totalItems++;
          keys.push(key);
          if (this.has(key)) {
            validItems++;
          }
        }
      }
    } catch (error) {
      console.warn('Cache stats error:', error);
    }

    return {
      totalItems,
      validItems,
      keys,
      usage: `${(JSON.stringify(sessionStorage).length / 1024).toFixed(2)} KB`
    };
  },

  /**
   * Generate a cache key from arguments
   * @param {...any} args - Arguments to combine into a key
   * @returns {string} Cache key
   */
  key(...args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    }).join(':');
  },

  /**
   * Get or set a value with a factory function
   * @param {string} key - Cache key
   * @param {Function} factory - Function that returns the value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {any} Cached or freshly computed value
   */
  async getOrSet(key, factory, ttlSeconds = 300) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await factory();
      this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      console.warn(`Cache getOrSet error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of cache keys
   * @returns {Object} Object with key-value pairs
   */
  getMany(keys) {
    const result = {};
    for (const key of keys) {
      result[key] = this.get(key);
    }
    return result;
  },

  /**
   * Set multiple keys at once
   * @param {Object} items - Object with key-value pairs
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {boolean} True if all successful
   */
  setMany(items, ttlSeconds = 300) {
    let success = true;
    for (const [key, value] of Object.entries(items)) {
      if (!this.set(key, value, ttlSeconds)) {
        success = false;
      }
    }
    return success;
  }
};

/**
 * Cache key generator for Pokémon data
 * @param {string} nameOrId - Pokémon name or ID
 * @returns {string} Cache key
 */
export function pokemonCacheKey(nameOrId) {
  return cache.key('pokemon', String(nameOrId).toLowerCase());
}

/**
 * Cache key generator for search results
 * @param {string} query - Search query
 * @returns {string} Cache key
 */
export function searchCacheKey(query) {
  return cache.key('search', query.toLowerCase());
}

/**
 * Cache key generator for move data
 * @param {string} moveName - Move name
 * @returns {string} Cache key
 */
export function moveCacheKey(moveName) {
  return cache.key('move', moveName.toLowerCase());
}

/**
 * Cache key generator for ability data
 * @param {string} abilityName - Ability name
 * @returns {string} Cache key
 */
export function abilityCacheKey(abilityName) {
  return cache.key('ability', abilityName.toLowerCase());
}

/**
 * Cache key generator for team analysis
 * @param {Array} team - Team array
 * @param {string} format - Battle format
 * @returns {string} Cache key
 */
export function teamAnalysisCacheKey(team, format) {
  const teamHash = team.map(p => p.name).sort().join(',');
  return cache.key('analysis', teamHash, format);
}

// Export the cache object as default
export default cache;