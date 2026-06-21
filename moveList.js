/**
 * filename: js/components/moveList.js
 * purpose: Renders recommended moves list with type badges and details
 * dependencies: typeBadge.js, formatters.js
 */

import { TypeBadge } from './typeBadge.js';
import { formatMoveName, truncateString } from '../utils/formatters.js';

/**
 * Create a move list component
 * @param {Object} props - Component props
 * @param {Array} props.moves - Array of move objects
 * @param {string} props.title - Optional title for the list
 * @param {boolean} props.showDetails - Whether to show move details (power, accuracy, etc.)
 * @param {boolean} props.showType - Whether to show type badges
 * @param {Function} props.onMoveClick - Click handler for moves
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Move list element
 */
export function MoveList(props = {}) {
  const {
    moves = [],
    title = '',
    showDetails = true,
    showType = true,
    onMoveClick = null,
    className = ''
  } = props;

  const container = document.createElement('div');
  container.className = `move-list ${className}`;

  // Title
  if (title) {
    const titleEl = document.createElement('h5');
    titleEl.className = 'move-list-title';
    titleEl.textContent = title;
    titleEl.style.marginBottom = 'var(--space-3)';
    container.appendChild(titleEl);
  }

  if (!moves || moves.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-sm text-muted';
    empty.textContent = 'No moves available';
    container.appendChild(empty);
    return container;
  }

  // Move list container
  const list = document.createElement('div');
  list.className = 'move-list-items';
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-2)';

  for (const [index, move] of moves.entries()) {
    const item = createMoveItem(move, index, {
      showDetails,
      showType,
      onMoveClick
    });
    list.appendChild(item);
  }

  container.appendChild(list);
  return container;
}

/**
 * Create a single move item
 * @param {Object} move - Move data
 * @param {number} index - Index for key
 * @param {Object} options - Options
 * @returns {HTMLElement} Move item element
 */
function createMoveItem(move, index, options = {}) {
  const {
    showDetails = true,
    showType = true,
    onMoveClick = null
  } = options;

  const item = document.createElement('div');
  item.className = 'move-item';
  item.style.display = 'flex';
  item.style.alignItems = 'center';
  item.style.justifyContent = 'space-between';
  item.style.padding = 'var(--space-2) var(--space-3)';
  item.style.background = 'var(--color-surface-raised)';
  item.style.borderRadius = 'var(--radius-md)';
  item.style.transition = 'all var(--transition-fast)';
  item.style.cursor = onMoveClick ? 'pointer' : 'default';

  if (onMoveClick) {
    item.addEventListener('click', () => onMoveClick(move, index));
    item.addEventListener('mouseenter', () => {
      item.style.background = 'var(--color-surface-light)';
      item.style.transform = 'translateX(4px)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'var(--color-surface-raised)';
      item.style.transform = 'translateX(0)';
    });
  }

  // Left side: move name and type
  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.alignItems = 'center';
  left.style.gap = 'var(--space-3)';
  left.style.flex = '1';

  // Move number (small)
  const number = document.createElement('span');
  number.className = 'text-xs text-muted';
  number.textContent = `${index + 1}`;
  number.style.minWidth = '20px';
  left.appendChild(number);

  // Move name
  const name = document.createElement('span');
  name.className = 'move-name';
  name.textContent = move.formattedName || formatMoveName(move.name);
  name.style.fontWeight = 'var(--font-weight-medium)';
  left.appendChild(name);

  // Type badge
  if (showType && move.type) {
    const badge = TypeBadge({
      type: move.type,
      size: 'sm'
    });
    left.appendChild(badge);
  }

  item.appendChild(left);

  // Right side: move details
  if (showDetails) {
    const details = document.createElement('div');
    details.style.display = 'flex';
    details.style.alignItems = 'center';
    details.style.gap = 'var(--space-3)';
    details.style.fontSize = 'var(--text-xs)';
    details.style.color = 'var(--color-text-secondary)';

    // Category (Physical/Special/Status)
    if (move.category) {
      const category = document.createElement('span');
      category.className = 'move-category';
      const icon = move.category === 'physical' ? '⚔️' :
                   move.category === 'special' ? '🔮' : '🛡️';
      category.textContent = `${icon} ${move.category}`;
      details.appendChild(category);
    }

    // Power
    if (move.power !== undefined && move.power !== null) {
      const power = document.createElement('span');
      power.textContent = `Power: ${move.power || '—'}`;
      details.appendChild(power);
    }

    // Accuracy
    if (move.accuracy !== undefined && move.accuracy !== null) {
      const accuracy = document.createElement('span');
      accuracy.textContent = `Acc: ${move.accuracy || '—'}%`;
      details.appendChild(accuracy);
    }

    // PP
    if (move.pp !== undefined && move.pp !== null) {
      const pp = document.createElement('span');
      pp.textContent = `PP: ${move.pp}`;
      details.appendChild(pp);
    }

    item.appendChild(details);
  }

  return item;
}

/**
 * Create a grid of moves (for compact display)
 * @param {Object} props - Component props
 * @param {Array} props.moves - Array of move objects
 * @param {number} props.columns - Number of columns (default: 2)
 * @param {Function} props.onMoveClick - Click handler
 * @returns {HTMLElement} Move grid element
 */
export function MoveGrid(props = {}) {
  const {
    moves = [],
    columns = 2,
    onMoveClick = null
  } = props;

  const container = document.createElement('div');
  container.className = 'move-grid';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  container.style.gap = 'var(--space-2)';

  if (!moves || moves.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-sm text-muted';
    empty.textContent = 'No moves available';
    empty.style.gridColumn = `1 / -1`;
    container.appendChild(empty);
    return container;
  }

  for (const [index, move] of moves.entries()) {
    const item = document.createElement('div');
    item.className = 'move-grid-item';
    item.style.padding = 'var(--space-2) var(--space-3)';
    item.style.background = 'var(--color-surface-raised)';
    item.style.borderRadius = 'var(--radius-md)';
    item.style.border = '1px solid var(--color-border)';
    item.style.transition = 'all var(--transition-fast)';
    item.style.cursor = onMoveClick ? 'pointer' : 'default';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = 'var(--space-2)';

    if (onMoveClick) {
      item.addEventListener('click', () => onMoveClick(move, index));
      item.addEventListener('mouseenter', () => {
        item.style.borderColor = 'var(--color-border-hover)';
        item.style.transform = 'scale(1.02)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.borderColor = 'var(--color-border)';
        item.style.transform = 'scale(1)';
      });
    }

    // Type badge (small color dot)
    if (move.type) {
      const dot = document.createElement('span');
      dot.className = `type-badge ${move.type}`;
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.borderRadius = 'var(--radius-full)';
      dot.style.display = 'inline-block';
      dot.style.padding = '0';
      dot.style.flexShrink = '0';
      item.appendChild(dot);
    }

    // Move name
    const name = document.createElement('span');
    name.className = 'text-sm';
    name.textContent = move.formattedName || formatMoveName(move.name);
    name.style.fontWeight = 'var(--font-weight-medium)';
    item.appendChild(name);

    container.appendChild(item);
  }

  return container;
}

/**
 * Create a recommended moveset with labels (for strategy display)
 * @param {Object} props - Component props
 * @param {Array} props.moves - Array of move objects
 * @param {string} props.label - Label for the moveset (e.g., "Recommended Moves")
 * @param {string} props.description - Optional description
 * @param {Function} props.onMoveClick - Click handler
 * @returns {HTMLElement} Moveset element
 */
export function MoveSet(props = {}) {
  const {
    moves = [],
    label = 'Recommended Moves',
    description = '',
    onMoveClick = null
  } = props;

  const container = document.createElement('div');
  container.className = 'move-set';
  container.style.background = 'var(--color-surface)';
  container.style.borderRadius = 'var(--radius-lg)';
  container.style.padding = 'var(--space-4)';
  container.style.border = '1px solid var(--color-border)';

  // Header
  const header = document.createElement('div');
  header.style.marginBottom = 'var(--space-3)';

  const labelEl = document.createElement('h6');
  labelEl.textContent = label;
  labelEl.style.marginBottom = '0';
  header.appendChild(labelEl);

  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'text-sm text-secondary';
    descEl.textContent = description;
    descEl.style.marginBottom = '0';
    header.appendChild(descEl);
  }

  container.appendChild(header);

  // Moves
  const moveList = MoveList({
    moves,
    showDetails: true,
    showType: true,
    onMoveClick
  });
  container.appendChild(moveList);

  return container;
}