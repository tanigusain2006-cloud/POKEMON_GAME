/**
 * filename: js/utils/formatters.js
 * purpose: String, number, and data formatting utilities
 * dependencies: None
 */

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format a Pokémon name (remove hyphens, capitalize)
 * @param {string} name - Pokémon name
 * @returns {string} Formatted name
 */
export function formatPokemonName(name) {
  if (!name) return '';
  // Handle special forms like 'pikachu-alola' -> 'Pikachu-Alola'
  return name
    .split('-')
    .map(part => capitalize(part))
    .join('-');
}

/**
 * Format a move name (capitalize, handle special cases)
 * @param {string} name - Move name
 * @returns {string} Formatted move name
 */
export function formatMoveName(name) {
  if (!name) return '';
  // Replace hyphens with spaces and capitalize
  return name
    .split('-')
    .map(part => capitalize(part))
    .join(' ');
}

/**
 * Format an ability name
 * @param {string} name - Ability name
 * @returns {string} Formatted ability name
 */
export function formatAbilityName(name) {
  return formatMoveName(name);
}

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a stat name (e.g., 'special-attack' -> 'Special Attack')
 * @param {string} stat - Stat name
 * @returns {string} Formatted stat name
 */
export function formatStatName(stat) {
  if (!stat) return '';
  return stat
    .split('-')
    .map(part => capitalize(part))
    .join(' ');
}

/**
 * Format base stat total (sum of all stats)
 * @param {Object} stats - Stats object
 * @returns {number} Base stat total
 */
export function getBaseStatTotal(stats) {
  if (!stats) return 0;
  return Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Format a type name for display
 * @param {string} type - Type name
 * @returns {string} Capitalized type name
 */
export function formatTypeName(type) {
  return capitalize(type);
}

/**
 * Format an ID to be 3-4 digits (e.g., 1 -> '#0001')
 * @param {number} id - Pokémon ID
 * @returns {string} Formatted ID
 */
export function formatPokemonId(id) {
  if (!id) return '#0000';
  return `#${String(id).padStart(4, '0')}`;
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength = 50, suffix = '...') {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Format a percentage (0-1 to 0-100%)
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (value === undefined || value === null) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a multiplier (e.g., 2 -> '2x', 0.5 -> '½x')
 * @param {number} multiplier - Effectiveness multiplier
 * @returns {string} Formatted multiplier
 */
export function formatMultiplier(multiplier) {
  if (multiplier === 0) return '0x';
  if (multiplier === 0.5) return '½x';
  if (multiplier === 1) return '1x';
  if (multiplier === 2) return '2x';
  if (Number.isInteger(multiplier)) return `${multiplier}x`;
  return `${multiplier.toFixed(1)}x`;
}

/**
 * Format a date to locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Create a Showdown-style team paste format
 * @param {Array} team - Array of Pokémon objects
 * @returns {string} Showdown paste format
 */
export function formatTeamForExport(team) {
  if (!team || team.length === 0) return '';

  const lines = [];
  for (const pokemon of team) {
    const name = formatPokemonName(pokemon.name);
    let line = name;

    // Add item if available
    if (pokemon.item) {
      line += ` @ ${formatMoveName(pokemon.item)}`;
    }

    lines.push(line);

    // Add ability
    if (pokemon.ability) {
      lines.push(`Ability: ${formatAbilityName(pokemon.ability)}`);
    }

    // Add moves
    if (pokemon.moves && pokemon.moves.length > 0) {
      lines.push('- ' + pokemon.moves.map(m => formatMoveName(m)).join('\n- '));
    }

    // Add EVs if available
    if (pokemon.evs) {
      const evParts = [];
      for (const [stat, value] of Object.entries(pokemon.evs)) {
        if (value > 0) {
          evParts.push(`${formatStatName(stat)} ${value}`);
        }
      }
      if (evParts.length > 0) {
        lines.push(`EVs: ${evParts.join(' / ')}`);
      }
    }

    // Add nature if available
    if (pokemon.nature) {
      lines.push(`${capitalize(pokemon.nature)} Nature`);
    }

    lines.push(''); // Blank line between Pokémon
  }

  return lines.join('\n').trim();
}

/**
 * Generate a slug from a string
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format a battle format name
 * @param {string} format - 'single' or 'double'
 * @returns {string} Formatted format name
 */
export function formatBattleFormat(format) {
  if (format === 'single') return 'Single Battle';
  if (format === 'double') return 'Double Battle';
  return 'Unknown';
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}