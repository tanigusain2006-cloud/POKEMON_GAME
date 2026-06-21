/**
 * filename: js/components/searchBar.js
 * purpose: Pokémon search with live autocomplete dropdown
 * dependencies: api/pokeapi.js, utils/validators.js
 */

import { searchPokemon, fetchPokemon } from '../api/pokeapi.js';
import { isValidSearchQuery } from '../utils/validators.js';

/**
 * Create a search bar component with autocomplete
 * @param {Object} props - Component props
 * @param {Function} props.onSelect - Callback when a Pokémon is selected
 * @param {Function} props.onSearch - Callback on search input
 * @param {string} props.placeholder - Input placeholder text
 * @param {number} props.debounceDelay - Debounce delay in ms (default: 300)
 * @param {string} props.className - Additional CSS classes
 * @returns {HTMLElement} Search bar element
 */
export function SearchBar(props = {}) {
  const {
    onSelect = null,
    onSearch = null,
    placeholder = 'Search for a Pokémon...',
    debounceDelay = 300,
    className = ''
  } = props;

  const container = document.createElement('div');
  container.className = `search-container ${className}`;

  // Input field
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Search for Pokémon');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-autocomplete', 'list');

  // Dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  dropdown.style.display = 'none';
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Search results');

  // Loading indicator (hidden initially)
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loader-container';
  loadingIndicator.style.padding = 'var(--space-4)';
  loadingIndicator.style.display = 'none';

  const spinner = document.createElement('div');
  spinner.className = 'loader-spinner animate-spin';
  spinner.style.width = '24px';
  spinner.style.height = '24px';
  spinner.style.borderWidth = '3px';
  loadingIndicator.appendChild(spinner);

  const loadingText = document.createElement('p');
  loadingText.className = 'loader-text';
  loadingText.textContent = 'Searching...';
  loadingIndicator.appendChild(loadingText);

  dropdown.appendChild(loadingIndicator);

  // State
  let currentResults = [];
  let selectedIndex = -1;
  let debounceTimer = null;
  let isOpen = false;

  // Append to container
  container.appendChild(input);
  container.appendChild(dropdown);

  /**
   * Show dropdown with results
   */
  function showDropdown() {
    dropdown.style.display = 'block';
    isOpen = true;
    input.setAttribute('aria-expanded', 'true');
  }

  /**
   * Hide dropdown
   */
  function hideDropdown() {
    dropdown.style.display = 'none';
    isOpen = false;
    input.setAttribute('aria-expanded', 'false');
    selectedIndex = -1;
  }

  /**
   * Render search results in dropdown
   */
  function renderResults(results) {
    // Remove old results (keep loading indicator)
    const items = dropdown.querySelectorAll('.search-dropdown-item');
    for (const item of items) {
      item.remove();
    }

    if (!results || results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'search-dropdown-item';
      noResults.style.padding = 'var(--space-4)';
      noResults.style.color = 'var(--color-text-muted)';
      noResults.style.textAlign = 'center';
      noResults.textContent = 'No Pokémon found';
      dropdown.appendChild(noResults);
      showDropdown();
      return;
    }

    for (const name of results) {
      const item = document.createElement('div');
      item.className = 'search-dropdown-item';
      item.setAttribute('role', 'option');
      item.dataset.name = name;

      // Format name
      const formattedName = name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      // Add a small Pokémon icon (emoji placeholder)
      const icon = document.createElement('span');
      icon.textContent = '🔹';
      icon.style.marginRight = 'var(--space-2)';

      const text = document.createElement('span');
      text.textContent = formattedName;

      item.appendChild(icon);
      item.appendChild(text);

      // Click handler
      item.addEventListener('click', () => {
        selectPokemon(name);
      });

      // Hover handler
      item.addEventListener('mouseenter', () => {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        items.forEach((el, idx) => {
          if (el.dataset.name === name) {
            el.style.background = 'var(--color-surface)';
            selectedIndex = idx;
          } else {
            el.style.background = '';
          }
        });
      });

      dropdown.appendChild(item);
    }

    selectedIndex = -1;
    showDropdown();
  }

  /**
   * Select a Pokémon and trigger onSelect callback
   */
  async function selectPokemon(name) {
    try {
      // Show loading state
      input.disabled = true;
      input.placeholder = 'Loading...';

      const pokemon = await fetchPokemon(name);
      hideDropdown();
      input.value = '';
      input.focus();

      if (onSelect) {
        onSelect(pokemon);
      }
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      // Show error feedback
      input.placeholder = 'Error loading Pokémon';
      setTimeout(() => {
        input.placeholder = placeholder;
      }, 2000);
    } finally {
      input.disabled = false;
    }
  }

  /**
   * Handle input changes with debounce
   */
  function handleInput(value) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const query = value.trim();

    if (onSearch) {
      onSearch(query);
    }

    if (!isValidSearchQuery(query, 1)) {
      hideDropdown();
      return;
    }

    // Show loading
    loadingIndicator.style.display = 'flex';
    // Remove old results
    const items = dropdown.querySelectorAll('.search-dropdown-item');
    for (const item of items) {
      item.remove();
    }
    showDropdown();

    debounceTimer = setTimeout(async () => {
      try {
        const results = await searchPokemon(query);
        loadingIndicator.style.display = 'none';
        currentResults = results;
        renderResults(results);
      } catch (error) {
        console.error('Search error:', error);
        loadingIndicator.style.display = 'none';
        // Show error in dropdown
        const errorMsg = document.createElement('div');
        errorMsg.className = 'search-dropdown-item';
        errorMsg.style.color = 'var(--color-danger)';
        errorMsg.textContent = 'Error searching. Please try again.';
        dropdown.appendChild(errorMsg);
        showDropdown();
      }
    }, debounceDelay);
  }

  // Event listeners
  input.addEventListener('input', (e) => {
    handleInput(e.target.value);
  });

  input.addEventListener('focus', () => {
    if (currentResults.length > 0) {
      renderResults(currentResults);
    }
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.search-dropdown-item:not([style*="display: none"])');
    const totalItems = items.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalItems > 0) {
        selectedIndex = (selectedIndex + 1) % totalItems;
        items.forEach((el, idx) => {
          el.style.background = idx === selectedIndex ? 'var(--color-surface)' : '';
        });
        if (selectedIndex < totalItems) {
          items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalItems > 0) {
        selectedIndex = (selectedIndex - 1 + totalItems) % totalItems;
        items.forEach((el, idx) => {
          el.style.background = idx === selectedIndex ? 'var(--color-surface)' : '';
        });
        if (selectedIndex < totalItems) {
          items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < totalItems) {
        const selectedItem = items[selectedIndex];
        const name = selectedItem.dataset.name;
        if (name) {
          selectPokemon(name);
        }
      } else if (currentResults.length > 0) {
        // Select first result
        const firstName = currentResults[0];
        if (firstName) {
          selectPokemon(firstName);
        }
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
      input.blur();
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      hideDropdown();
    }
  });

  return container;
}

/**
 * Create a simple search input without dropdown (for use in other contexts)
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback on search
 * @param {string} props.placeholder - Placeholder text
 * @returns {HTMLElement} Search input element
 */
export function SimpleSearch(props = {}) {
  const {
    onSearch = null,
    placeholder = 'Search...'
  } = props;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = placeholder;

  let debounceTimer = null;

  input.addEventListener('input', (e) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      if (onSearch) {
        onSearch(e.target.value.trim());
      }
    }, 300);
  });

  return input;
}