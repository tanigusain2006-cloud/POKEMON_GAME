/**
 * filename: js/utils/validators.js
 * purpose: Input validation helper functions
 * dependencies: None
 */

/**
 * Check if a string is empty or whitespace only
 * @param {string} str - String to check
 * @returns {boolean} True if string is empty or whitespace
 */
export function isEmptyString(str) {
  if (str === undefined || str === null) return true;
  return str.trim().length === 0;
}

/**
 * Validate a Pokémon name (alphanumeric, hyphens, apostrophes)
 * @param {string} name - Pokémon name to validate
 * @returns {boolean} True if valid
 */
export function isValidPokemonName(name) {
  if (isEmptyString(name)) return false;
  // Pokémon names can contain letters, hyphens, apostrophes, and spaces
  const regex = /^[a-zA-Z'\- ]+$/;
  return regex.test(name.trim());
}

/**
 * Validate a Pokémon ID (positive integer)
 * @param {number|string} id - Pokémon ID to validate
 * @returns {boolean} True if valid
 */
export function isValidPokemonId(id) {
  const num = Number(id);
  if (isNaN(num)) return false;
  if (!Number.isInteger(num)) return false;
  if (num <= 0) return false;
  if (num > 1025) return false; // Current max Pokémon as of gen 9
  return true;
}

/**
 * Validate team size
 * @param {Array} team - Team array
 * @param {number} maxSize - Maximum team size (default: 6)
 * @param {number} minSize - Minimum team size for analysis (default: 3)
 * @returns {Object} Validation result with valid flag and message
 */
export function validateTeamSize(team, maxSize = 6, minSize = 3) {
  if (!team || !Array.isArray(team)) {
    return {
      valid: false,
      message: 'Team must be an array'
    };
  }

  const size = team.length;

  if (size > maxSize) {
    return {
      valid: false,
      message: `Team cannot exceed ${maxSize} Pokémon`
    };
  }

  if (size < minSize) {
    return {
      valid: false,
      message: `Need at least ${minSize} Pokémon to analyze (currently ${size})`
    };
  }

  return {
    valid: true,
    message: `Team size: ${size}/${maxSize}`
  };
}

/**
 * Validate a battle format
 * @param {string} format - Format to validate ('single' or 'double')
 * @returns {boolean} True if valid
 */
export function isValidFormat(format) {
  return format === 'single' || format === 'double';
}

/**
 * Validate a type string
 * @param {string} type - Type to validate
 * @returns {boolean} True if valid
 */
export function isValidType(type) {
  if (isEmptyString(type)) return false;
  const validTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel',
    'fairy'
  ];
  return validTypes.includes(type.toLowerCase());
}

/**
 * Validate types array
 * @param {Array} types - Types array to validate
 * @returns {boolean} True if valid
 */
export function isValidTypes(types) {
  if (!Array.isArray(types)) return false;
  if (types.length === 0 || types.length > 2) return false;
  return types.every(type => isValidType(type));
}

/**
 * Validate a move name
 * @param {string} move - Move name to validate
 * @returns {boolean} True if valid
 */
export function isValidMoveName(move) {
  if (isEmptyString(move)) return false;
  // Move names can contain letters, hyphens, apostrophes, spaces, and numbers
  const regex = /^[a-zA-Z0-9'\- ]+$/;
  return regex.test(move.trim());
}

/**
 * Validate an ability name
 * @param {string} ability - Ability name to validate
 * @returns {boolean} True if valid
 */
export function isValidAbilityName(ability) {
  return isValidMoveName(ability);
}

/**
 * Validate an item name
 * @param {string} item - Item name to validate
 * @returns {boolean} True if valid
 */
export function isValidItemName(item) {
  if (isEmptyString(item)) return true; // Items are optional
  const regex = /^[a-zA-Z0-9'\- ]+$/;
  return regex.test(item.trim());
}

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (isEmptyString(email)) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidUrl(url) {
  if (isEmptyString(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate a search query (minimum length)
 * @param {string} query - Search query
 * @param {number} minLength - Minimum length (default: 2)
 * @returns {boolean} True if valid
 */
export function isValidSearchQuery(query, minLength = 2) {
  if (isEmptyString(query)) return false;
  return query.trim().length >= minLength;
}

/**
 * Sanitize a string (remove dangerous characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (isEmptyString(str)) return '';
  return str.trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate that a value is a number within a range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if valid
 */
export function isNumberInRange(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

/**
 * Validate that a value is an integer within a range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if valid
 */
export function isIntegerInRange(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (!Number.isInteger(num)) return false;
  return num >= min && num <= max;
}

/**
 * Check if a team has duplicate Pokémon
 * @param {Array} team - Team array
 * @returns {Object} Validation result with valid flag and duplicates info
 */
export function hasDuplicatePokemon(team) {
  if (!team || !Array.isArray(team) || team.length === 0) {
    return {
      hasDuplicates: false,
      duplicates: []
    };
  }

  const seen = new Map();
  const duplicates = [];

  for (const pokemon of team) {
    if (!pokemon || !pokemon.name) continue;
    const name = pokemon.name.toLowerCase();
    if (seen.has(name)) {
      duplicates.push({
        name: pokemon.name,
        firstIndex: seen.get(name),
        currentIndex: team.indexOf(pokemon)
      });
    } else {
      seen.set(name, team.indexOf(pokemon));
    }
  }

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates
  };
}

/**
 * Validate a complete team for analysis
 * @param {Array} team - Team array
 * @param {string} format - Battle format
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateTeamForAnalysis(team, format) {
  const errors = [];

  // Check team size
  const sizeCheck = validateTeamSize(team);
  if (!sizeCheck.valid) {
    errors.push(sizeCheck.message);
  }

  // Check format
  if (!isValidFormat(format)) {
    errors.push(`Invalid battle format: ${format}`);
  }

  // Check for duplicates
  const duplicateCheck = hasDuplicatePokemon(team);
  if (duplicateCheck.hasDuplicates) {
    errors.push(
      `Duplicate Pokémon found: ${duplicateCheck.duplicates.map(d => d.name).join(', ')}`
    );
  }

  // Check each Pokémon has required data
  for (const [index, pokemon] of team.entries()) {
    if (!pokemon || !pokemon.name) {
      errors.push(`Slot ${index + 1}: Missing Pokémon name`);
      continue;
    }

    if (!pokemon.types || !Array.isArray(pokemon.types) || pokemon.types.length === 0) {
      errors.push(`${pokemon.name}: Missing type data`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}