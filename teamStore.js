/**
 * filename: js/state/teamStore.js
 * purpose: Central state management for team data
 * dependencies: None
 */

/**
 * Team state object with methods for managing team data
 */
const teamStore = {
  /**
   * State object
   * @property {Array} team - Array of Pokémon objects (max 6)
   * @property {string} format - 'single' or 'double'
   * @property {boolean} isLoading - Loading state for async operations
   * @property {Object|null} result - Analysis result data
   * @property {Array} errors - Validation errors
   */
  state: {
    team: [],
    format: 'single',
    isLoading: false,
    result: null,
    errors: []
  },

  /**
   * Initialize the store with optional data
   * @param {Object} initialData - Initial state data
   */
  init(initialData = {}) {
    this.state = {
      team: initialData.team || [],
      format: initialData.format || 'single',
      isLoading: false,
      result: null,
      errors: []
    };

    // Load from localStorage if available
    this.loadFromStorage();
  },

  /**
   * Add a Pokémon to the team
   * @param {Object} pokemon - Pokémon object to add
   * @returns {Object} Result with success flag and message
   */
  addPokemon(pokemon) {
    if (!pokemon || !pokemon.name) {
      return {
        success: false,
        message: 'Invalid Pokémon data'
      };
    }

    if (this.state.team.length >= 6) {
      return {
        success: false,
        message: 'Team is full (maximum 6 Pokémon)'
      };
    }

    // Check for duplicates
    if (this.state.team.some(p => p.name.toLowerCase() === pokemon.name.toLowerCase())) {
      return {
        success: false,
        message: `"${pokemon.name}" is already in the team`
      };
    }

    // Add the Pokémon
    this.state.team.push({
      ...pokemon,
      addedAt: Date.now()
    });

    // Clear any previous results
    this.state.result = null;
    this.state.errors = [];

    // Save to localStorage
    this.saveToStorage();

    return {
      success: true,
      message: `"${pokemon.name}" added to team`
    };
  },

  /**
   * Remove a Pokémon from the team by index
   * @param {number} index - Index of Pokémon to remove
   * @returns {Object} Result with success flag and message
   */
  removePokemon(index) {
    if (index < 0 || index >= this.state.team.length) {
      return {
        success: false,
        message: 'Invalid index'
      };
    }

    const removed = this.state.team[index];
    this.state.team.splice(index, 1);

    // Clear any previous results
    this.state.result = null;
    this.state.errors = [];

    // Save to localStorage
    this.saveToStorage();

    return {
      success: true,
      message: `"${removed.name}" removed from team`
    };
  },

  /**
   * Set the battle format
   * @param {string} format - 'single' or 'double'
   * @returns {Object} Result with success flag and message
   */
  setFormat(format) {
    if (format !== 'single' && format !== 'double') {
      return {
        success: false,
        message: 'Invalid format. Must be "single" or "double"'
      };
    }

    this.state.format = format;
    this.saveToStorage();

    return {
      success: true,
      message: `Format set to "${format}"`
    };
  },

  /**
   * Get the current team
   * @returns {Array} Team array
   */
  getTeam() {
    return [...this.state.team];
  },

  /**
   * Get a specific Pokémon from the team
   * @param {number} index - Index of Pokémon
   * @returns {Object|null} Pokémon object or null if not found
   */
  getPokemon(index) {
    if (index < 0 || index >= this.state.team.length) {
      return null;
    }
    return { ...this.state.team[index] };
  },

  /**
   * Check if the team is ready for analysis
   * @param {number} minSize - Minimum team size (default: 3)
   * @returns {Object} Validation result
   */
  isReadyForAnalysis(minSize = 3) {
    const size = this.state.team.length;

    if (size < minSize) {
      return {
        ready: false,
        message: `Need at least ${minSize} Pokémon to analyze (currently ${size})`
      };
    }

    // Check each Pokémon has required data
    for (const [index, pokemon] of this.state.team.entries()) {
      if (!pokemon.types || !Array.isArray(pokemon.types) || pokemon.types.length === 0) {
        return {
          ready: false,
          message: `Slot ${index + 1}: "${pokemon.name}" missing type data`
        };
      }
    }

    return {
      ready: true,
      message: 'Team is ready for analysis'
    };
  },

  /**
   * Set the analysis result
   * @param {Object} result - Analysis result data
   */
  setResult(result) {
    this.state.result = result;
    this.state.isLoading = false;
    this.state.errors = [];
    this.saveToStorage();
  },

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    this.state.isLoading = isLoading;
  },

  /**
   * Set errors
   * @param {Array} errors - Error messages
   */
  setErrors(errors) {
    this.state.errors = Array.isArray(errors) ? errors : [errors];
    this.state.isLoading = false;
  },

  /**
   * Clear errors
   */
  clearErrors() {
    this.state.errors = [];
  },

  /**
   * Reset the store to initial state
   */
  reset() {
    this.state = {
      team: [],
      format: 'single',
      isLoading: false,
      result: null,
      errors: []
    };
    localStorage.removeItem('poketeam_state');
  },

  /**
   * Clear the team but keep format
   */
  clearTeam() {
    this.state.team = [];
    this.state.result = null;
    this.state.errors = [];
    this.saveToStorage();
  },

  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        team: this.state.team,
        format: this.state.format
      };
      localStorage.setItem('poketeam_state', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  },

  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('poketeam_state');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.team && Array.isArray(data.team)) {
          this.state.team = data.team;
        }
        if (data.format) {
          this.state.format = data.format;
        }
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  },

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    // Simple pub/sub implementation
    this._subscribers = this._subscribers || [];
    this._subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  },

  /**
   * Notify subscribers of state changes
   * @param {Object} changes - Changed properties
   */
  _notify(changes) {
    if (this._subscribers) {
      for (const callback of this._subscribers) {
        try {
          callback({ ...this.state, ...changes });
        } catch (error) {
          console.warn('Subscriber error:', error);
        }
      }
    }
  }
};

// Override methods to notify subscribers on changes
const originalAddPokemon = teamStore.addPokemon.bind(teamStore);
teamStore.addPokemon = function(pokemon) {
  const result = originalAddPokemon(pokemon);
  if (result.success) {
    this._notify({ team: this.state.team });
  }
  return result;
};

const originalRemovePokemon = teamStore.removePokemon.bind(teamStore);
teamStore.removePokemon = function(index) {
  const result = originalRemovePokemon(index);
  if (result.success) {
    this._notify({ team: this.state.team });
  }
  return result;
};

const originalSetFormat = teamStore.setFormat.bind(teamStore);
teamStore.setFormat = function(format) {
  const result = originalSetFormat(format);
  if (result.success) {
    this._notify({ format: this.state.format });
  }
  return result;
};

const originalSetResult = teamStore.setResult.bind(teamStore);
teamStore.setResult = function(result) {
  originalSetResult(result);
  this._notify({ result: this.state.result });
};

const originalSetLoading = teamStore.setLoading.bind(teamStore);
teamStore.setLoading = function(isLoading) {
  originalSetLoading(isLoading);
  this._notify({ isLoading: this.state.isLoading });
};

export default teamStore;