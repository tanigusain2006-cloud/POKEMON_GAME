/**
 * filename: js/components/strategyPanel.js
 * purpose: Renders strategy output with tabs, recommendations, and weather/terrain
 * dependencies: pokemonCard.js, moveList.js, typeBadge.js, formatters.js
 */

import { PokemonCardSmall, PokemonSprite } from './pokemonCard.js';
import { MoveList, MoveSet } from './moveList.js';
import { TypeBadgeGroup, EffectivenessBadge } from './typeBadge.js';
import { formatBattleFormat, formatPokemonName } from '../utils/formatters.js';

/**
 * Create the main strategy panel
 * @param {Object} props - Component props
 * @param {Object} props.result - Analysis result data
 * @param {Array} props.team - Team array
 * @param {string} props.format - Battle format
 * @param {Function} props.onPokemonClick - Click handler for Pokémon
 * @returns {HTMLElement} Strategy panel element
 */
export function StrategyPanel(props = {}) {
  const {
    result = null,
    team = [],
    format = 'single',
    onPokemonClick = null
  } = props;

  const container = document.createElement('div');
  container.className = 'strategy-panel';

  if (!result || !team || team.length === 0) {
    container.appendChild(createEmptyState());
    return container;
  }

  // Overview section
  const overview = createOverviewSection(result, team, format);
  container.appendChild(overview);

  // Strategy cards for each Pokémon
  const strategies = createStrategyCards(result, team, onPokemonClick);
  container.appendChild(strategies);

  // Weather & Terrain recommendations
  if (result.weather || result.terrain) {
    const weatherSection = createWeatherSection(result);
    container.appendChild(weatherSection);
  }

  return container;
}

/**
 * Create empty state
 * @returns {HTMLElement} Empty state element
 */
function createEmptyState() {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.style.padding = 'var(--space-7)';
  empty.style.textAlign = 'center';

  const icon = document.createElement('span');
  icon.className = 'empty-icon';
  icon.textContent = '📊';
  icon.style.fontSize = 'var(--text-5xl)';
  icon.style.opacity = '0.3';
  icon.style.display = 'block';
  icon.style.marginBottom = 'var(--space-4)';

  const title = document.createElement('h5');
  title.textContent = 'No Strategy Data';
  title.style.marginBottom = 'var(--space-2)';

  const desc = document.createElement('p');
  desc.className = 'text-sm text-secondary';
  desc.textContent = 'Analyze your team to see strategy recommendations.';

  empty.appendChild(icon);
  empty.appendChild(title);
  empty.appendChild(desc);

  return empty;
}

/**
 * Create overview section
 */
function createOverviewSection(result, team, format) {
  const section = document.createElement('div');
  section.className = 'strategy-overview';
  section.style.marginBottom = 'var(--space-6)';

  // Team summary
  const summary = document.createElement('div');
  summary.className = 'card';
  summary.style.display = 'flex';
  summary.style.flexWrap = 'wrap';
  summary.style.alignItems = 'center';
  summary.style.gap = 'var(--space-4)';
  summary.style.padding = 'var(--space-4)';

  // Format badge
  const formatBadge = document.createElement('span');
  formatBadge.className = 'btn btn-sm btn-primary';
  formatBadge.textContent = formatBattleFormat(format);
  formatBadge.style.pointerEvents = 'none';
  summary.appendChild(formatBadge);

  // Team sprites
  const sprites = document.createElement('div');
  sprites.style.display = 'flex';
  sprites.style.gap = 'var(--space-2)';
  sprites.style.flexWrap = 'wrap';

  for (const pokemon of team) {
    const sprite = PokemonSprite({
      pokemon,
      size: 48
    });
    sprites.appendChild(sprite);
  }
  summary.appendChild(sprites);

  // Stats
  if (result.stats) {
    const stats = document.createElement('div');
    stats.style.display = 'flex';
    stats.style.gap = 'var(--space-4)';
    stats.style.marginLeft = 'auto';
    stats.style.fontSize = 'var(--text-sm)';

    const statItems = [
      { label: 'Type Coverage', value: result.stats.coverage || 'N/A' },
      { label: 'Weaknesses', value: result.stats.weaknessCount || 0 },
      { label: 'Resistances', value: result.stats.resistanceCount || 0 }
    ];

    for (const stat of statItems) {
      const item = document.createElement('div');
      item.style.textAlign = 'center';
      const value = document.createElement('div');
      value.style.fontWeight = 'var(--font-weight-bold)';
      value.textContent = stat.value;
      const label = document.createElement('div');
      label.className = 'text-xs text-muted';
      label.textContent = stat.label;
      item.appendChild(value);
      item.appendChild(label);
      stats.appendChild(item);
    }

    summary.appendChild(stats);
  }

  section.appendChild(summary);

  // Quick type summary
  if (result.typeSummary) {
    const typeSummary = createTypeSummary(result.typeSummary);
    section.appendChild(typeSummary);
  }

  return section;
}

/**
 * Create type summary section
 */
function createTypeSummary(typeSummary) {
  const container = document.createElement('div');
  container.className = 'card';
  container.style.marginTop = 'var(--space-3)';
  container.style.padding = 'var(--space-4)';

  const title = document.createElement('h6');
  title.textContent = '🛡️ Type Coverage Summary';
  title.style.marginBottom = 'var(--space-3)';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  grid.style.gap = 'var(--space-3)';

  // Weaknesses
  if (typeSummary.weaknesses && typeSummary.weaknesses.length > 0) {
    const weakSection = createTypeList('Weaknesses', typeSummary.weaknesses, 'danger');
    grid.appendChild(weakSection);
  }

  // Resistances
  if (typeSummary.resistances && typeSummary.resistances.length > 0) {
    const resistSection = createTypeList('Resistances', typeSummary.resistances, 'success');
    grid.appendChild(resistSection);
  }

  // Immunities
  if (typeSummary.immunities && typeSummary.immunities.length > 0) {
    const immuneSection = createTypeList('Immunities', typeSummary.immunities, 'warning');
    grid.appendChild(immuneSection);
  }

  container.appendChild(grid);
  return container;
}

/**
 * Create a type list for summary
 */
function createTypeList(label, types, variant) {
  const section = document.createElement('div');

  const labelEl = document.createElement('span');
  labelEl.className = 'text-sm text-secondary';
  labelEl.textContent = label;
  labelEl.style.display = 'block';
  labelEl.style.marginBottom = 'var(--space-2)';
  section.appendChild(labelEl);

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.gap = 'var(--space-1)';

  for (const item of types) {
    const badge = document.createElement('span');
    const typeName = typeof item === 'string' ? item : item.type;
    badge.className = `type-badge ${typeName}`;
    badge.textContent = typeName;
    badge.style.fontSize = 'var(--text-xs)';

    // Add count if available
    if (item.count && item.count > 1) {
      const count = document.createElement('span');
      count.textContent = ` ×${item.count}`;
      count.style.opacity = '0.7';
      badge.appendChild(count);
    }

    container.appendChild(badge);
  }

  section.appendChild(container);
  return section;
}

/**
 * Create strategy cards for each Pokémon
 */
function createStrategyCards(result, team, onPokemonClick) {
  const container = document.createElement('div');
  container.className = 'strategy-cards';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
  container.style.gap = 'var(--space-4)';
  container.style.marginTop = 'var(--space-4)';

  if (!result.pokemonStrategies || result.pokemonStrategies.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-sm text-muted';
    empty.textContent = 'No strategy data available for individual Pokémon';
    empty.style.gridColumn = '1 / -1';
    container.appendChild(empty);
    return container;
  }

  for (const [index, strategy] of result.pokemonStrategies.entries()) {
    const pokemon = team[index] || {};
    const card = createStrategyCard(pokemon, strategy, index, onPokemonClick);
    container.appendChild(card);
  }

  return container;
}

/**
 * Create a single strategy card
 */
function createStrategyCard(pokemon, strategy, index, onPokemonClick) {
  const card = document.createElement('div');
  card.className = 'card strategy-card';
  card.style.animationDelay = `${index * 0.1}s`;
  card.style.borderLeftColor = 'var(--color-primary)';

  // Header with Pokémon info
  const header = document.createElement('div');
  header.className = 'card-header';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = 'var(--space-3)';

  // Small sprite
  const sprite = PokemonSprite({
    pokemon,
    size: 48
  });
  header.appendChild(sprite);

  // Name and role
  const info = document.createElement('div');
  info.style.flex = '1';

  const name = document.createElement('div');
  name.className = 'font-semibold';
  name.textContent = pokemon.formattedName || formatPokemonName(pokemon.name);
  info.appendChild(name);

  if (strategy.role) {
    const role = document.createElement('div');
    role.className = 'text-xs text-secondary';
    role.textContent = `Role: ${strategy.role}`;
    info.appendChild(role);
  }

  header.appendChild(info);

  // Types
  if (pokemon.types) {
    const types = TypeBadgeGroup({
      types: pokemon.types,
      size: 'sm'
    });
    header.appendChild(types);
  }

  card.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'card-body';

  // Moves
  if (strategy.moves && strategy.moves.length > 0) {
    const moves = MoveSet({
      moves: strategy.moves,
      label: 'Recommended Moves',
      description: strategy.moveDescription || ''
    });
    body.appendChild(moves);
  }

  // Ability
  if (strategy.ability) {
    const abilitySection = createAbilitySection(strategy.ability);
    body.appendChild(abilitySection);
  }

  // Held item
  if (strategy.item) {
    const itemSection = createItemSection(strategy.item);
    body.appendChild(itemSection);
  }

  card.appendChild(body);

  // Footer with additional info
  if (strategy.notes || strategy.strategy) {
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const notes = document.createElement('p');
    notes.className = 'text-sm text-secondary';
    notes.textContent = strategy.notes || strategy.strategy;
    footer.appendChild(notes);

    card.appendChild(footer);
  }

  // Click handler
  if (onPokemonClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onPokemonClick(pokemon, index));
  }

  return card;
}

/**
 * Create ability section
 */
function createAbilitySection(ability) {
  const container = document.createElement('div');
  container.className = 'ability-section';
  container.style.marginTop = 'var(--space-3)';
  container.style.padding = 'var(--space-3)';
  container.style.background = 'var(--color-surface-raised)';
  container.style.borderRadius = 'var(--radius-md)';

  const label = document.createElement('div');
  label.className = 'text-xs text-muted';
  label.textContent = 'Recommended Ability';
  container.appendChild(label);

  const name = document.createElement('div');
  name.className = 'font-semibold';
  name.textContent = typeof ability === 'string' ? ability : ability.name;
  container.appendChild(name);

  if (ability.description) {
    const desc = document.createElement('p');
    desc.className = 'text-sm text-secondary';
    desc.textContent = ability.description;
    desc.style.marginTop = 'var(--space-1)';
    desc.style.marginBottom = '0';
    container.appendChild(desc);
  }

  return container;
}

/**
 * Create item section
 */
function createItemSection(item) {
  const container = document.createElement('div');
  container.className = 'item-section';
  container.style.marginTop = 'var(--space-3)';
  container.style.padding = 'var(--space-3)';
  container.style.background = 'var(--color-surface-raised)';
  container.style.borderRadius = 'var(--radius-md)';

  const label = document.createElement('div');
  label.className = 'text-xs text-muted';
  label.textContent = 'Suggested Held Item';
  container.appendChild(label);

  const name = document.createElement('div');
  name.className = 'font-semibold';
  name.textContent = typeof item === 'string' ? item : item.name;
  container.appendChild(name);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'text-sm text-secondary';
    desc.textContent = item.description;
    desc.style.marginTop = 'var(--space-1)';
    desc.style.marginBottom = '0';
    container.appendChild(desc);
  }

  return container;
}

/**
 * Create weather and terrain section
 */
function createWeatherSection(result) {
  const container = document.createElement('div');
  container.className = 'weather-section';
  container.style.marginTop = 'var(--space-5)';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  container.style.gap = 'var(--space-4)';

  // Weather
  if (result.weather) {
    const weatherCard = createConditionCard('🌤️ Weather', result.weather);
    container.appendChild(weatherCard);
  }

  // Terrain
  if (result.terrain) {
    const terrainCard = createConditionCard('🌿 Terrain', result.terrain);
    container.appendChild(terrainCard);
  }

  return container;
}

/**
 * Create a condition card (weather or terrain)
 */
function createConditionCard(icon, data) {
  const card = document.createElement('div');
  card.className = 'card strategy-card weather';
  card.style.borderLeftColor = 'var(--color-accent)';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = 'var(--space-3)';

  const iconEl = document.createElement('span');
  iconEl.textContent = icon;
  iconEl.style.fontSize = 'var(--text-2xl)';
  header.appendChild(iconEl);

  const title = document.createElement('h6');
  title.textContent = typeof data === 'string' ? data : data.name;
  title.style.marginBottom = '0';
  header.appendChild(title);

  card.appendChild(header);

  if (data.description) {
    const desc = document.createElement('p');
    desc.className = 'text-sm text-secondary';
    desc.textContent = data.description;
    desc.style.marginTop = 'var(--space-2)';
    desc.style.marginBottom = '0';
    card.appendChild(desc);
  }

  if (data.recommendation) {
    const rec = document.createElement('div');
    rec.className = 'text-sm';
    rec.style.marginTop = 'var(--space-2)';
    rec.style.padding = 'var(--space-2) var(--space-3)';
    rec.style.background = 'var(--color-surface-raised)';
    rec.style.borderRadius = 'var(--radius-md)';
    rec.textContent = `💡 ${data.recommendation}`;
    card.appendChild(rec);
  }

  return card;
}