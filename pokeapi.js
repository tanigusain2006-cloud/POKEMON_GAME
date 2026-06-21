/**
 * filename: js/api/pokeapi.js
 * purpose: All PokéAPI fetch calls with caching
 * dependencies: cache.js
 */

import cache, {
  pokemonCacheKey,
  searchCacheKey,
  moveCacheKey,
  abilityCacheKey
} from './cache.js';

// Base URL for PokéAPI
const API_BASE = 'https://pokeapi.co/api/v2';

// TTL for different types of data (in seconds)
const TTL = {
  POKEMON: 3600, // 1 hour
  SEARCH: 600, // 10 minutes
  MOVE: 3600,
  ABILITY: 3600
};

/**
 * Fetch a Pokémon by name or ID
 * @param {string|number} nameOrId - Pokémon name or ID
 * @returns {Promise<Object>} Enriched Pokémon object
 */
export async function fetchPokemon(nameOrId) {
  const cacheKey = pokemonCacheKey(nameOrId);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/pokemon/${String(nameOrId).toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Pokémon "${nameOrId}" not found (${response.status})`);
    }

    const data = await response.json();

    // Enrich the Pokémon data
    const enriched = enrichPokemonData(data);

    // Cache the result
    cache.set(cacheKey, enriched, TTL.POKEMON);

    return enriched;
  } catch (error) {
    console.error('fetchPokemon error:', error);
    throw error;
  }
}

/**
 * Enrich Pokémon data with formatted fields
 * @param {Object} data - Raw Pokémon data from API
 * @returns {Object} Enriched Pokémon object
 */
function enrichPokemonData(data) {
  return {
    id: data.id,
    name: data.name,
    formattedName: formatName(data.name),
    sprite: data.sprites.other['official-artwork'].front_default ||
            data.sprites.front_default,
    types: data.types.map(t => t.type.name),
    abilities: data.abilities.map(a => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot
    })),
    stats: data.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {}),
    baseTotal: data.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
    height: data.height / 10, // Convert to meters
    weight: data.weight / 10, // Convert to kg
    moves: data.moves.map(m => m.move.name),
    species: data.species.name
  };
}

/**
 * Format Pokémon name for display
 * @param {string} name - Raw name from API
 * @returns {string} Formatted name
 */
function formatName(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

/**
 * Search for Pokémon by name (autocomplete)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching Pokémon names
 */
export async function searchPokemon(query) {
  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = searchCacheKey(query);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // First, try to get a list of all Pokémon (limited to first 1000)
    // In a production app, we'd use a search endpoint, but PokeAPI doesn't have one
    // So we fetch a list and filter client-side
    const url = `${API_BASE}/pokemon?limit=1000`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Search failed (${response.status})`);
    }

    const data = await response.json();

    // Filter results by query
    const results = data.results
      .map(p => p.name)
      .filter(name => name.includes(query.toLowerCase()))
      .slice(0, 20); // Limit to 20 results

    // Cache the results
    cache.set(cacheKey, results, TTL.SEARCH);

    return results;
  } catch (error) {
    console.error('searchPokemon error:', error);
    return [];
  }
}

/**
 * Fetch details for multiple moves
 * @param {string[]} moveNameList - Array of move names
 * @returns {Promise<Object[]>} Array of move details
 */
export async function fetchMoves(moveNameList) {
  if (!moveNameList || moveNameList.length === 0) {
    return [];
  }

  const promises = moveNameList.map(name => fetchMove(name));
  return Promise.all(promises);
}

/**
 * Fetch a single move by name
 * @param {string} moveName - Move name
 * @returns {Promise<Object>} Move details
 */
export async function fetchMove(moveName) {
  const cacheKey = moveCacheKey(moveName);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/move/${moveName.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Move "${moveName}" not found (${response.status})`);
    }

    const data = await response.json();

    const enriched = {
      name: data.name,
      formattedName: formatName(data.name),
      type: data.type.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      category: data.damage_class.name,
      description: data.effect_entries.find(e => e.language.name === 'en')?.effect ||
                   data.effect_entries.find(e => e.language.name === 'en')?.short_effect ||
                   'No description available'
    };

    // Cache the result
    cache.set(cacheKey, enriched, TTL.MOVE);

    return enriched;
  } catch (error) {
    console.error('fetchMove error:', error);
    throw error;
  }
}

/**
 * Fetch an ability by name
 * @param {string} abilityName - Ability name
 * @returns {Promise<Object>} Ability details
 */
export async function fetchAbility(abilityName) {
  const cacheKey = abilityCacheKey(abilityName);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/ability/${abilityName.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ability "${abilityName}" not found (${response.status})`);
    }

    const data = await response.json();

    const enriched = {
      name: data.name,
      formattedName: formatName(data.name),
      description: data.effect_entries.find(e => e.language.name === 'en')?.effect ||
                   data.effect_entries.find(e => e.language.name === 'en')?.short_effect ||
                   'No description available',
      generation: data.generation.name,
      pokemon: data.pokemon.map(p => p.pokemon.name)
    };

    // Cache the result
    cache.set(cacheKey, enriched, TTL.ABILITY);

    return enriched;
  } catch (error) {
    console.error('fetchAbility error:', error);
    throw error;
  }
}

/**
 * Fetch multiple Pokémon at once
 * @param {string[]} names - Array of Pokémon names or IDs
 * @returns {Promise<Object[]>} Array of Pokémon objects
 */
export async function fetchPokemonBatch(names) {
  if (!names || names.length === 0) {
    return [];
  }

  const promises = names.map(name => fetchPokemon(name));
  return Promise.all(promises);
}

/**
 * Get the type chart from the API
 * @returns {Promise<Object>} Type effectiveness data
 */
export async function fetchTypeChart() {
  try {
    const url = `${API_BASE}/type`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Type chart fetch failed (${response.status})`);
    }

    const data = await response.json();

    // Build a simplified type chart
    const chart = {};
    const typeUrls = data.results.map(t => t.url);

    for (const url of typeUrls) {
      const typeResponse = await fetch(url);
      const typeData = await typeResponse.json();
      const typeName = typeData.name;

      chart[typeName] = {};

      // Damage relations
      const relations = typeData.damage_relations;

      // Double damage to (2x)
      for (const target of relations.double_damage_to) {
        chart[typeName][target.name] = 2;
      }

      // Half damage to (0.5x)
      for (const target of relations.half_damage_to) {
        chart[typeName][target.name] = 0.5;
      }

      // No damage to (0x)
      for (const target of relations.no_damage_to) {
        chart[typeName][target.name] = 0;
      }

      // Default to 1x for all other types
      for (const otherType of typeUrls.map(t => t.name.split('/').pop())) {
        if (!chart[typeName][otherType]) {
          chart[typeName][otherType] = 1;
        }
      }
    }

    return chart;
  } catch (error) {
    console.error('fetchTypeChart error:', error);
    throw error;
  }
}