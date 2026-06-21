/**
 * filename: js/components/pokemonCard.js
 * purpose: Renders a single Pokémon card with sprite, name, types, and actions
 * dependencies: typeBadge.js, formatters.js
 */

import { TypeBadgeGroup } from './typeBadge.js';
import { formatPokemonName, formatPokemonId } from '../utils/formatters.js';

/**
 * Create a Pokémon card component
 * @param {Object} props - Component props
 * @param {Object} props.pokemon - Pokémon data object
 * @param {number} props.index - Index in team (for remove functionality)
 * @param {boolean} props.slot - Whether this is a slot card (default: false)
 * @param {boolean} props.showRemove - Whether to show remove button (default: true)
 * @param {Function} props.onRemove - Callback when remove is clicked
 * @param {Function} props.onClick - Callback when card is clicked
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Pokémon card element
 */
export function PokemonCard(props = {}) {
  const {
    pokemon,
    index = 0,
    slot = false,
    showRemove = true,
    onRemove = null,
    onClick = null,
    className = ''
  } = props;

  const card = document.createElement('div');
  card.className = `pokemon-slot ${slot ? 'filled' : ''} ${className}`;
  card.dataset.index = index;

  if (!pokemon || !pokemon.name) {
    // Empty slot
    card.classList.add('empty');
    const emptyIcon = document.createElement('span');
    emptyIcon.style.fontSize = 'var(--text-3xl)';
    emptyIcon.style.opacity = '0.3';
    emptyIcon.textContent = '+';

    const emptyText = document.createElement('span');
    emptyText.className = 'text-sm text-muted';
    emptyText.textContent = 'Empty Slot';

    card.appendChild(emptyIcon);
    card.appendChild(emptyText);
    return card;
  }

  // Click handler
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking remove button
      if (e.target.closest('.remove-btn')) return;
      onClick(pokemon, index);
    });
  }

  // Sprite
  const sprite = document.createElement('img');
  sprite.className = 'sprite';
  sprite.src = pokemon.sprite || '';
  sprite.alt = pokemon.name || 'Pokémon';
  sprite.loading = 'lazy';
  sprite.onerror = () => {
    sprite.src = ''; // Clear broken image
    sprite.style.display = 'none';
  };

  // Name
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = pokemon.formattedName || formatPokemonName(pokemon.name);

  // ID
  const id = document.createElement('span');
  id.className = 'text-xs text-muted';
  id.textContent = pokemon.id ? formatPokemonId(pokemon.id) : '';

  // Name container
  const nameContainer = document.createElement('div');
  nameContainer.className = 'flex items-center gap-2';
  nameContainer.appendChild(name);
  if (pokemon.id) {
    nameContainer.appendChild(id);
  }

  // Types
  const types = TypeBadgeGroup({
    types: pokemon.types || [],
    size: 'sm'
  });

  // Remove button
  let removeBtn = null;
  if (showRemove) {
    removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.setAttribute('aria-label', `Remove ${pokemon.name}`);
    removeBtn.title = 'Remove Pokémon';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onRemove) {
        onRemove(index);
      }
    });
  }

  // Build card
  const contentContainer = document.createElement('div');
  contentContainer.className = 'flex flex-col items-center gap-1';
  contentContainer.style.width = '100%';

  // Info row (name + id)
  const infoRow = document.createElement('div');
  infoRow.className = 'flex items-center justify-between w-full';
  infoRow.appendChild(nameContainer);

  // Add sprite and info
  contentContainer.appendChild(sprite);
  contentContainer.appendChild(infoRow);
  contentContainer.appendChild(types);

  card.appendChild(contentContainer);
  if (removeBtn) {
    card.appendChild(removeBtn);
  }

  return card;
}

/**
 * Create a small Pokémon card (for summary/compact views)
 * @param {Object} props - Component props
 * @param {Object} props.pokemon - Pokémon data object
 * @param {string} props.size - Size: 'sm', 'md' (default: 'sm')
 * @param {Function} props.onClick - Click handler
 * @returns {HTMLElement} Small Pokémon card
 */
export function PokemonCardSmall(props = {}) {
  const {
    pokemon,
    size = 'sm',
    onClick = null
  } = props;

  const container = document.createElement('div');
  container.className = 'pokemon-card-small';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = 'var(--space-2)';
  container.style.padding = 'var(--space-2) var(--space-3)';
  container.style.background = 'var(--color-surface)';
  container.style.borderRadius = 'var(--radius-md)';
  container.style.border = '1px solid var(--color-border)';
  container.style.transition = 'all var(--transition-fast)';
  container.style.cursor = onClick ? 'pointer' : 'default';

  if (onClick) {
    container.addEventListener('click', () => onClick(pokemon));
    container.addEventListener('mouseenter', () => {
      container.style.borderColor = 'var(--color-border-hover)';
      container.style.transform = 'translateY(-2px)';
    });
    container.addEventListener('mouseleave', () => {
      container.style.borderColor = 'var(--color-border)';
      container.style.transform = 'translateY(0)';
    });
  }

  // Sprite
  const spriteSize = size === 'sm' ? 40 : 56;
  const sprite = document.createElement('img');
  sprite.src = pokemon.sprite || '';
  sprite.alt = pokemon.name || 'Pokémon';
  sprite.style.width = `${spriteSize}px`;
  sprite.style.height = `${spriteSize}px`;
  sprite.style.imageRendering = 'pixelated';
  sprite.loading = 'lazy';
  sprite.onerror = () => {
    sprite.style.display = 'none';
  };

  // Name
  const name = document.createElement('span');
  name.className = size === 'sm' ? 'text-sm' : 'text-base';
  name.style.fontWeight = 'var(--font-weight-medium)';
  name.textContent = pokemon.formattedName || formatPokemonName(pokemon.name);

  // Types (tiny badges)
  const typesContainer = document.createElement('div');
  typesContainer.style.display = 'flex';
  typesContainer.style.gap = 'var(--space-1)';

  if (pokemon.types && Array.isArray(pokemon.types)) {
    for (const type of pokemon.types) {
      const badge = document.createElement('span');
      badge.className = `type-badge ${type}`;
      badge.style.fontSize = 'var(--text-xs)';
      badge.style.padding = 'var(--space-1) var(--space-2)';
      badge.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      typesContainer.appendChild(badge);
    }
  }

  const info = document.createElement('div');
  info.style.display = 'flex';
  info.style.flexDirection = 'column';
  info.style.gap = 'var(--space-1)';
  info.appendChild(name);
  info.appendChild(typesContainer);

  container.appendChild(sprite);
  container.appendChild(info);

  return container;
}

/**
 * Create a Pokémon sprite only (for team summary)
 * @param {Object} props - Component props
 * @param {Object} props.pokemon - Pokémon data object
 * @param {number} props.size - Size in pixels (default: 64)
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Sprite element
 */
export function PokemonSprite(props = {}) {
  const {
    pokemon,
    size = 64,
    className = ''
  } = props;

  const container = document.createElement('div');
  container.className = `pokemon-sprite-container ${className}`;
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.background = 'var(--color-surface)';
  container.style.borderRadius = 'var(--radius-md)';
  container.style.border = '2px solid var(--color-border)';
  container.style.transition = 'all var(--transition-fast)';
  container.style.position = 'relative';

  if (!pokemon || !pokemon.name) {
    const empty = document.createElement('span');
    empty.textContent = '?';
    empty.style.color = 'var(--color-text-muted)';
    empty.style.fontSize = `${size * 0.4}px`;
    container.appendChild(empty);
    return container;
  }

  const sprite = document.createElement('img');
  sprite.src = pokemon.sprite || '';
  sprite.alt = pokemon.name;
  sprite.style.width = `${size * 0.8}px`;
  sprite.style.height = `${size * 0.8}px`;
  sprite.style.imageRendering = 'pixelated';
  sprite.style.objectFit = 'contain';
  sprite.loading = 'lazy';

  sprite.onerror = () => {
    sprite.style.display = 'none';
    const fallback = document.createElement('span');
    fallback.textContent = pokemon.name.charAt(0).toUpperCase();
    fallback.style.fontSize = `${size * 0.5}px`;
    fallback.style.fontWeight = 'var(--font-weight-bold)';
    fallback.style.color = 'var(--color-text-secondary)';
    container.appendChild(fallback);
  };

  container.appendChild(sprite);
  return container;
}