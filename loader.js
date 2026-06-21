/**
 * filename: js/components/loader.js
 * purpose: Loading spinner component with optional text
 * dependencies: None
 */

/**
 * Create a loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.text - Optional loading text
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Loader element
 */
export function Loader(props = {}) {
  const {
    text = 'Loading...',
    size = 'md',
    className = ''
  } = props;

  const container = document.createElement('div');
  container.className = `loader-container ${className}`;

  // Determine spinner size
  let spinnerSize = 48;
  let textSize = 'text-sm';
  if (size === 'sm') {
    spinnerSize = 32;
    textSize = 'text-xs';
  } else if (size === 'lg') {
    spinnerSize = 64;
    textSize = 'text-base';
  }

  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'loader-spinner animate-spin';
  spinner.style.width = `${spinnerSize}px`;
  spinner.style.height = `${spinnerSize}px`;
  spinner.style.borderWidth = size === 'sm' ? '3px' : '4px';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', 'Loading');

  // Create text
  const textEl = document.createElement('p');
  textEl.className = `loader-text ${textSize}`;
  textEl.textContent = text;

  container.appendChild(spinner);
  container.appendChild(textEl);

  return container;
}

/**
 * Create a skeleton loader (for content placeholders)
 * @param {Object} props - Component props
 * @param {string} props.type - 'card', 'text', 'avatar' (default: 'text')
 * @param {number} props.lines - Number of skeleton lines (for text type)
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Skeleton element
 */
export function Skeleton(props = {}) {
  const {
    type = 'text',
    lines = 3,
    className = ''
  } = props;

  const container = document.createElement('div');
  container.className = `skeleton-container ${className}`;

  if (type === 'card') {
    // Card skeleton
    const card = document.createElement('div');
    card.className = 'card skeleton';
    card.style.height = '200px';
    card.style.width = '100%';
    container.appendChild(card);
  } else if (type === 'avatar') {
    // Avatar skeleton (circle)
    const avatar = document.createElement('div');
    avatar.className = 'skeleton';
    avatar.style.width = '80px';
    avatar.style.height = '80px';
    avatar.style.borderRadius = 'var(--radius-full)';
    container.appendChild(avatar);
  } else {
    // Text skeleton (multiple lines)
    for (let i = 0; i < lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton';
      line.style.height = '16px';
      line.style.width = i === lines - 1 ? '60%' : '100%';
      line.style.marginBottom = i === lines - 1 ? '0' : 'var(--space-2)';
      line.style.borderRadius = 'var(--radius-sm)';
      container.appendChild(line);
    }
  }

  return container;
}

/**
 * Create an overlay loader (full screen or container overlay)
 * @param {Object} props - Component props
 * @param {string} props.text - Loading text
 * @param {boolean} props.transparent - Whether background is transparent
 * @returns {HTMLElement} Overlay loader element
 */
export function OverlayLoader(props = {}) {
  const {
    text = 'Loading...',
    transparent = false
  } = props;

  const overlay = document.createElement('div');
  overlay.className = 'overlay-loader';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${transparent ? 'rgba(0,0,0,0.3)' : 'var(--color-backdrop)'};
    z-index: var(--z-overlay);
    border-radius: inherit;
  `;

  const loader = Loader({
    text,
    size: 'lg'
  });

  // Override container style for overlay
  loader.style.cssText = `
    background: var(--color-surface-raised);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
  `;

  overlay.appendChild(loader);
  return overlay;
}

/**
 * Create a loading button state
 * @param {HTMLElement} button - Button element to convert to loading state
 * @param {string} loadingText - Text to show while loading
 * @returns {Function} Function to restore original button state
 */
export function loadingButton(button, loadingText = 'Loading...') {
  // Save original content
  const originalContent = button.innerHTML;
  const originalDisabled = button.disabled;

  // Disable button
  button.disabled = true;

  // Create loading spinner (small)
  const spinner = document.createElement('span');
  spinner.className = 'loader-spinner';
  spinner.style.cssText = `
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: currentColor;
    border-radius: var(--radius-full);
    animation: spin 0.8s linear infinite;
    margin-right: var(--space-2);
    vertical-align: middle;
  `;

  // Set loading content
  button.innerHTML = '';
  button.appendChild(spinner);
  button.appendChild(document.createTextNode(loadingText));

  // Return restore function
  return function restore() {
    button.innerHTML = originalContent;
    button.disabled = originalDisabled;
  };
}