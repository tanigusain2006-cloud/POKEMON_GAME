/**
 * filename: js/utils/typeChart.js
 * purpose: Type effectiveness data and calculation utilities
 * dependencies: None
 */

/**
 * Type effectiveness chart (2x damage = 2, 0.5x = 0.5, 0 = immune)
 * Format: attackingType: { defendingType: multiplier }
 */
export const TYPE_CHART = {
  normal: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 0,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1
  },
  fire: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 1,
    grass: 2,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 2,
    rock: 0.5,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 2,
    fairy: 1
  },
  water: {
    normal: 1,
    fire: 2,
    water: 0.5,
    electric: 1,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 2,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 2,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 1,
    fairy: 1
  },
  electric: {
    normal: 1,
    fire: 1,
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 0,
    flying: 2,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 1,
    fairy: 1
  },
  grass: {
    normal: 1,
    fire: 0.5,
    water: 2,
    electric: 1,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    psychic: 1,
    bug: 0.5,
    rock: 2,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 0.5,
    fairy: 1
  },
  ice: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 1,
    grass: 2,
    ice: 0.5,
    fighting: 1,
    poison: 1,
    ground: 2,
    flying: 2,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 1,
    steel: 0.5,
    fairy: 1
  },
  fighting: {
    normal: 2,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 2,
    fighting: 1,
    poison: 0.5,
    ground: 1,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dragon: 1,
    dark: 2,
    steel: 2,
    fairy: 0.5
  },
  poison: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 2,
    ice: 1,
    fighting: 1,
    poison: 0.5,
    ground: 0.5,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 0.5,
    dragon: 1,
    dark: 1,
    steel: 0,
    fairy: 2
  },
  ground: {
    normal: 1,
    fire: 2,
    water: 1,
    electric: 2,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 2,
    ground: 1,
    flying: 0,
    psychic: 1,
    bug: 0.5,
    rock: 2,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 2,
    fairy: 1
  },
  flying: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 0.5,
    grass: 2,
    ice: 1,
    fighting: 2,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 2,
    rock: 0.5,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1
  },
  psychic: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 2,
    poison: 2,
    ground: 1,
    flying: 1,
    psychic: 0.5,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 1,
    dark: 0,
    steel: 0.5,
    fairy: 1
  },
  bug: {
    normal: 1,
    fire: 0.5,
    water: 1,
    electric: 1,
    grass: 2,
    ice: 1,
    fighting: 0.5,
    poison: 0.5,
    ground: 1,
    flying: 0.5,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 0.5,
    dragon: 1,
    dark: 2,
    steel: 0.5,
    fairy: 0.5
  },
  rock: {
    normal: 1,
    fire: 2,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 2,
    fighting: 0.5,
    poison: 1,
    ground: 0.5,
    flying: 2,
    psychic: 1,
    bug: 2,
    rock: 1,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1
  },
  ghost: {
    normal: 0,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 2,
    dragon: 1,
    dark: 0.5,
    steel: 1,
    fairy: 1
  },
  dragon: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 1,
    steel: 0.5,
    fairy: 0
  },
  dark: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 0.5,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 2,
    dragon: 1,
    dark: 0.5,
    steel: 0.5,
    fairy: 0.5
  },
  steel: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    grass: 1,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 2,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 2
  },
  fairy: {
    normal: 1,
    fire: 0.5,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 2,
    poison: 0.5,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 2,
    steel: 0.5,
    fairy: 1
  }
};

/**
 * All valid Pokémon types
 */
export const POKEMON_TYPES = Object.keys(TYPE_CHART);

/**
 * Calculate effectiveness of a move against a defending Pokémon
 * @param {string} attackingType - The type of the move
 * @param {string[]} defendingTypes - Array of the defending Pokémon's types
 * @returns {number} Effectiveness multiplier (0, 0.5, 1, or 2)
 */
export function calculateEffectiveness(attackingType, defendingTypes) {
  if (!attackingType || !defendingTypes || defendingTypes.length === 0) {
    return 1;
  }

  const attackChart = TYPE_CHART[attackingType];
  if (!attackChart) {
    return 1;
  }

  let multiplier = 1;
  for (const defType of defendingTypes) {
    const effectiveness = attackChart[defType];
    if (effectiveness !== undefined) {
      multiplier *= effectiveness;
    }
  }

  return multiplier;
}

/**
 * Get all weaknesses (effectiveness > 1) for a Pokémon
 * @param {string[]} types - Array of the Pokémon's types
 * @returns {Array<{type: string, multiplier: number}>} Array of weaknesses
 */
export function getWeaknesses(types) {
  const weaknesses = [];
  const seenTypes = new Set();

  for (const attackType of POKEMON_TYPES) {
    const multiplier = calculateEffectiveness(attackType, types);
    if (multiplier > 1 && !seenTypes.has(attackType)) {
      weaknesses.push({ type: attackType, multiplier });
      seenTypes.add(attackType);
    }
  }

  return weaknesses.sort((a, b) => b.multiplier - a.multiplier);
}

/**
 * Get all resistances (effectiveness < 1) for a Pokémon
 * @param {string[]} types - Array of the Pokémon's types
 * @returns {Array<{type: string, multiplier: number}>} Array of resistances
 */
export function getResistances(types) {
  const resistances = [];
  const seenTypes = new Set();

  for (const attackType of POKEMON_TYPES) {
    const multiplier = calculateEffectiveness(attackType, types);
    if (multiplier < 1 && multiplier > 0 && !seenTypes.has(attackType)) {
      resistances.push({ type: attackType, multiplier });
      seenTypes.add(attackType);
    }
  }

  return resistances.sort((a, b) => a.multiplier - b.multiplier);
}

/**
 * Get immunities (effectiveness = 0) for a Pokémon
 * @param {string[]} types - Array of the Pokémon's types
 * @returns {string[]} Array of types the Pokémon is immune to
 */
export function getImmunities(types) {
  const immunities = [];

  for (const attackType of POKEMON_TYPES) {
    const multiplier = calculateEffectiveness(attackType, types);
    if (multiplier === 0) {
      immunities.push(attackType);
    }
  }

  return immunities;
}

/**
 * Get combined type effectiveness for a team
 * @param {Array<{types: string[]}>} team - Array of Pokémon objects with types
 * @returns {Object} Combined weaknesses and resistances
 */
export function getTeamTypeSummary(team) {
  const weaknessMap = new Map();
  const resistanceMap = new Map();
  const immunityMap = new Map();

  for (const pokemon of team) {
    if (!pokemon.types) continue;

    const weaknesses = getWeaknesses(pokemon.types);
    const resistances = getResistances(pokemon.types);
    const immunities = getImmunities(pokemon.types);

    for (const weak of weaknesses) {
      const current = weaknessMap.get(weak.type) || 0;
      weaknessMap.set(weak.type, current + 1);
    }

    for (const res of resistances) {
      const current = resistanceMap.get(res.type) || 0;
      resistanceMap.set(res.type, current + 1);
    }

    for (const immune of immunities) {
      const current = immunityMap.get(immune) || 0;
      immunityMap.set(immune, current + 1);
    }
  }

  return {
    weaknesses: Array.from(weaknessMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    resistances: Array.from(resistanceMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    immunities: Array.from(immunityMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  };
}