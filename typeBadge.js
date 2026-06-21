/**
 * filename: js/components/typeBadge.js
 * purpose: Type pill/badge component for Pokémon types
 * dependencies: None
 */

/**
 * Create a type badge component
 * @param {Object} props - Component props
 * @param {string} props.type - Pokémon type (e.g., 'fire', 'water')
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} props.showLabel - Whether to show the type name (default: true)
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Type badge element
 */
export function TypeBadge(props = {}) {
  const {
    type,
    size = 'md',
    showLabel = true,
    className = ''
  } = props;

  if (!type) {
    const fallback = document.createElement('span');
    fallback.className = 'type-badge';
    fallback.textContent = '???';
    return fallback;
  }

  const typeName = type.toLowerCase();
  const badge = document.createElement('span');
  badge.className = `type-badge ${typeName} ${className}`;

  // Apply size
  if (size === 'sm') {
    badge.style.fontSize = 'var(--text-xs)';
    badge.style.padding = 'var(--space-1) var(--space-2)';
  } else if (size === 'lg') {
    badge.style.fontSize = 'var(--text-base)';
    badge.style.padding = 'var(--space-2) var(--space-4)';
  }

  // Add icon or label
  const displayName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
  badge.textContent = showLabel ? displayName : '';

  return badge;
}

/**
 * Create multiple type badges for a Pokémon
 * @param {Object} props - Component props
 * @param {string[]} props.types - Array of Pokémon types
 * @param {string} props.size - Size for badges
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.separator - Separator between badges (default: space)
 * @returns {HTMLElement} Container with type badges
 */
export function TypeBadgeGroup(props = {}) {
  const {
    types,
    size = 'md',
    className = '',
    separator = ' '
  } = props;

  const container = document.createElement('div');
  container.className = `type-badge-group ${className}`;
  container.style.display = 'flex';
  container.style.gap = 'var(--space-2)';
  container.style.flexWrap = 'wrap';
  container.style.alignItems = 'center';

  if (!types || !Array.isArray(types) || types.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'text-sm text-muted';
    empty.textContent = 'No types';
    container.appendChild(empty);
    return container;
  }

  for (const type of types) {
    const badge = TypeBadge({
      type,
      size,
      showLabel: true
    });
    container.appendChild(badge);
  }

  return container;
}

/**
 * Create a type effectiveness badge (shows multiplier)
 * @param {Object} props - Component props
 * @param {string} props.type - Pokémon type
 * @param {number} props.multiplier - Effectiveness multiplier (0, 0.5, 1, 2)
 * @param {string} props.size - Badge size
 * @returns {HTMLElement} Effectiveness badge element
 */
export function EffectivenessBadge(props = {}) {
  const {
    type,
    multiplier = 1,
    size = 'md'
  } = props;

  const container = document.createElement('div');
  container.className = 'effectiveness-badge';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = 'var(--space-2)';

  // Type badge
  const badge = TypeBadge({
    type,
    size,
    showLabel: true
  });

  // Multiplier indicator
  const indicator = document.createElement('span');
  indicator.className = 'multiplier-indicator';
  indicator.style.fontSize = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)';
  indicator.style.fontWeight = 'var(--font-weight-bold)';

  let multiplierText = '';
  let color = '';

  if (multiplier === 0) {
    multiplierText = '0x (Immune)';
    color = 'var(--color-text-muted)';
  } else if (multiplier === 0.5) {
    multiplierText = '½x (Resist)';
    color = 'var(--color-warning)';
  } else if (multiplier === 1) {
    multiplierText = '1x (Neutral)';
    color = 'var(--color-text-secondary)';
  } else if (multiplier === 2) {
    multiplierText = '2x (Weak)';
    color = 'var(--color-danger)';
  } else {
    multiplierText = `${multiplier}x`;
    color = 'var(--color-text-secondary)';
  }

  indicator.textContent = multiplierText;
  indicator.style.color = color;

  container.appendChild(badge);
  container.appendChild(indicator);

  return container;
}

/**
 * Create a simple type icon (without text)
 * @param {Object} props - Component props
 * @param {string} props.type - Pokémon type
 * @param {string} props.size - Size in pixels (default: 24)
 * @returns {HTMLElement} Type icon element
 */
export function TypeIcon(props = {}) {
  const {
    type,
    size = 24
  } = props;

  if (!type) {
    const fallback = document.createElement('div');
    fallback.style.width = `${size}px`;
    fallback.style.height = `${size}px`;
    fallback.style.borderRadius = 'var(--radius-sm)';
    fallback.style.background = 'var(--color-text-muted)';
    return fallback;
  }

  const typeName = type.toLowerCase();
  const icon = document.createElement('div');
  icon.className = `type-icon ${typeName}`;
  icon.style.width = `${size}px`;
  icon.style.height = `${size}px`;
  icon.style.borderRadius = 'var(--radius-sm)';
  icon.style.background = `var(--type-${typeName})`;
  icon.style.display = 'flex';
  icon.style.alignItems = 'center';
  icon.style.justifyContent = 'center';
  icon.style.color = '#fff';
  icon.style.fontSize = `${size * 0.5}px`;
  icon.style.fontWeight = 'var(--font-weight-bold)';
  icon.style.textTransform = 'uppercase';
  icon.textContent = typeName.charAt(0);

  return icon;
}