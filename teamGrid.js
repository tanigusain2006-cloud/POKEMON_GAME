/**
 * filename: js/components/teamGrid.js
 * purpose: Renders 6-slot team grid with Pokémon cards and interaction
 * dependencies: pokemonCard.js
 */

import { PokemonCard } from './pokemonCard.js';

/**
 * Create the team grid component with 6 slots
 * @param {Object} props - Component props
 * @param {Array} props.team - Array of Pokémon objects (max 6)
 * @param {Function} props.onRemove - Callback when a Pokémon is removed
 * @param {Function} props.onSlotClick - Callback when a slot is clicked
 * @param {Function} props.onPokemonClick - Callback when a Pokémon card is clicked
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Team grid element
 */
export function TeamGrid(props = {}) {
  const {
    team = [],
    onRemove = null,
    onSlotClick = null,
    onPokemonClick = null,
    className = ''
  } = props;

  const grid = document.createElement('div');
  grid.className = `grid grid-cols-3 gap-4 ${className}`;
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Team grid with 6 Pokémon slots');

  // Create 6 slots
  for (let i = 0; i < 6; i++) {
    const pokemon = team[i] || null;
    const slot = document.createElement('div');
    slot.className = 'team-slot';
    slot.setAttribute('role', 'listitem');
    slot.dataset.index = i;

    if (pokemon) {
      // Filled slot
      const card = PokemonCard({
        pokemon,
        index: i,
        slot: true,
        showRemove: true,
        onRemove: (idx) => {
          if (onRemove) onRemove(idx);
        },
        onClick: (p, idx) => {
          if (onPokemonClick) onPokemonClick(p, idx);
        }
      });
      slot.appendChild(card);
    } else {
      // Empty slot
      const emptySlot = document.createElement('div');
      emptySlot.className = 'pokemon-slot empty';
      emptySlot.dataset.index = i;
      emptySlot.style.cursor = 'pointer';
      emptySlot.addEventListener('click', () => {
        if (onSlotClick) onSlotClick(i);
      });

      const icon = document.createElement('span');
      icon.style.fontSize = 'var(--text-3xl)';
      icon.style.opacity = '0.3';
      icon.textContent = '+';

      const text = document.createElement('span');
      text.className = 'text-sm text-muted';
      text.textContent = `Slot ${i + 1}`;

      emptySlot.appendChild(icon);
      emptySlot.appendChild(text);
      slot.appendChild(emptySlot);
    }

    grid.appendChild(slot);
  }

  return grid;
}

/**
 * Create a compact team summary (horizontal row of sprites)
 * @param {Object} props - Component props
 * @param {Array} props.team - Array of Pokémon objects
 * @param {number} props.size - Size of sprites in pixels (default: 48)
 * @param {Function} props.onPokemonClick - Click handler for Pokémon
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Team summary element
 */
export function TeamSummary(props = {}) {
  const {
    team = [],
    size = 48,
    onPokemonClick = null,
    className = ''
  } = props;

  const container = document.createElement('div');
  container.className = `team-summary ${className}`;
  container.style.display = 'flex';
  container.style.gap = 'var(--space-2)';
  container.style.flexWrap = 'wrap';
  container.style.alignItems = 'center';

  if (!team || team.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'text-sm text-muted';
    empty.textContent = 'No Pokémon in team';
    container.appendChild(empty);
    return container;
  }

  for (const pokemon of team) {
    const wrapper = document.createElement('div');
    wrapper.className = 'team-summary-item';
    wrapper.style.display = 'inline-flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = 'var(--space-1)';
    wrapper.style.cursor = onPokemonClick ? 'pointer' : 'default';

    // Sprite
    const spriteContainer = document.createElement('div');
    spriteContainer.style.width = `${size}px`;
    spriteContainer.style.height = `${size}px`;
    spriteContainer.style.display = 'flex';
    spriteContainer.style.alignItems = 'center';
    spriteContainer.style.justifyContent = 'center';
    spriteContainer.style.background = 'var(--color-surface)';
    spriteContainer.style.borderRadius = 'var(--radius-md)';
    spriteContainer.style.border = '2px solid var(--color-border)';
    spriteContainer.style.overflow = 'hidden';

    const sprite = document.createElement('img');
    sprite.src = pokemon.sprite || '';
    sprite.alt = pokemon.name || 'Pokémon';
    sprite.style.width = `${size * 0.7}px`;
    sprite.style.height = `${size * 0.7}px`;
    sprite.style.imageRendering = 'pixelated';
    sprite.style.objectFit = 'contain';
    sprite.loading = 'lazy';

    sprite.onerror = () => {
      sprite.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.textContent = (pokemon.name || '?').charAt(0).toUpperCase();
      fallback.style.fontSize = `${size * 0.4}px`;
      fallback.style.fontWeight = 'var(--font-weight-bold)';
      fallback.style.color = 'var(--color-text-secondary)';
      spriteContainer.appendChild(fallback);
    };

    spriteContainer.appendChild(sprite);
    wrapper.appendChild(spriteContainer);

    // Small type indicators
    if (pokemon.types && pokemon.types.length > 0) {
      const typesContainer = document.createElement('div');
      typesContainer.style.display = 'flex';
      typesContainer.style.gap = 'var(--space-1)';

      for (const type of pokemon.types.slice(0, 2)) {
        const dot = document.createElement('span');
        dot.className = `type-badge ${type}`;
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = 'var(--radius-full)';
        dot.style.display = 'inline-block';
        dot.style.padding = '0';
        dot.setAttribute('title', type);
        typesContainer.appendChild(dot);
      }

      wrapper.appendChild(typesContainer);
    }

    // Click handler
    if (onPokemonClick) {
      wrapper.addEventListener('click', () => onPokemonClick(pokemon));
      wrapper.addEventListener('mouseenter', () => {
        wrapper.style.transform = 'scale(1.05)';
        wrapper.style.transition = 'transform var(--transition-fast)';
      });
      wrapper.addEventListener('mouseleave', () => {
        wrapper.style.transform = 'scale(1)';
      });
    }

    container.appendChild(wrapper);
  }

  return container;
}

/**
 * Create a team size indicator
 * @param {Object} props - Component props
 * @param {Array} props.team - Team array
 * @param {number} props.maxSize - Maximum team size (default: 6)
 * @param {number} props.minSize - Minimum size for analysis (default: 3)
 * @returns {HTMLElement} Size indicator element
 */
export function TeamSizeIndicator(props = {}) {
  const {
    team = [],
    maxSize = 6,
    minSize = 3
  } = props;

  const container = document.createElement('div');
  container.className = 'team-size-indicator';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = 'var(--space-3)';
  container.style.padding = 'var(--space-2) var(--space-3)';
  container.style.background = 'var(--color-surface)';
  container.style.borderRadius = 'var(--radius-md)';
  container.style.border = '1px solid var(--color-border)';

  const currentSize = team.length;
  const isReady = currentSize >= minSize;

  // Size text
  const sizeText = document.createElement('span');
  sizeText.className = 'text-sm';
  sizeText.innerHTML = `Team: <strong>${currentSize}</strong> / ${maxSize}`;
  container.appendChild(sizeText);

  // Status indicator
  const status = document.createElement('span');
  status.className = `status-dot ${isReady ? 'active' : 'warning'}`;
  status.style.display = 'inline-block';
  status.style.width = '10px';
  status.style.height = '10px';
  status.style.borderRadius = 'var(--radius-full)';
  status.style.marginRight = 'var(--space-2)';
  container.appendChild(status);

  const statusText = document.createElement('span');
  statusText.className = 'text-sm text-muted';
  statusText.textContent = isReady
    ? `✓ Ready for analysis (${minSize}+ Pokémon)`
    : `⚠ Need ${minSize - currentSize} more Pokémon`;

  container.appendChild(statusText);

  // Progress bar
  const progressContainer = document.createElement('div');
  progressContainer.style.width = '100%';
  progressContainer.style.height = '4px';
  progressContainer.style.background = 'var(--color-border)';
  progressContainer.style.borderRadius = 'var(--radius-full)';
  progressContainer.style.marginTop = 'var(--space-2)';

  const progressBar = document.createElement('div');
  progressBar.style.width = `${(currentSize / maxSize) * 100}%`;
  progressBar.style.height = '100%';
  progressBar.style.background = isReady
    ? 'var(--color-success)'
    : 'var(--color-warning)';
  progressBar.style.borderRadius = 'var(--radius-full)';
  progressBar.style.transition = 'width var(--transition-base)';

  progressContainer.appendChild(progressBar);
  container.appendChild(progressContainer);

  return container;
}