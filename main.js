/**
 * filename: js/main.js
 * purpose: Application entry point - handles routing, initialization, and event coordination
 * dependencies: state/teamStore.js, all components, api modules
 */

import teamStore from './state/teamStore.js';
import { fetchPokemon } from './api/pokeapi.js';
import { analyzeTeam } from './api/backend.js';
import { SearchBar } from './components/searchBar.js';
import { TeamGrid, TeamSummary, TeamSizeIndicator } from './components/teamGrid.js';
import { PokemonCard } from './components/pokemonCard.js';
import { StrategyPanel } from './components/strategyPanel.js';
import { Loader, OverlayLoader } from './components/loader.js';
import { validateTeamForAnalysis } from './utils/validators.js';
import { formatTeamForExport, formatBattleFormat } from './utils/formatters.js';

/**
 * Main application class
 */
class App {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.initialized = false;
  }

  /**
   * Get the current page from the URL
   */
  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('team-builder')) return 'builder';
    if (path.includes('strategy')) return 'strategy';
    return 'home';
  }

  /**
   * Initialize the application
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Initialize team store
    teamStore.init();

    // Route to the appropriate page
    switch (this.currentPage) {
      case 'builder':
        this.initBuilderPage();
        break;
      case 'strategy':
        this.initStrategyPage();
        break;
      case 'home':
      default:
        this.initHomePage();
        break;
    }

    // Handle format from URL params
    this.handleUrlParams();

    console.log('PokéTeam Strategist initialized');
  }

  /**
   * Handle URL parameters
   */
  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const format = params.get('format');
    if (format && (format === 'single' || format === 'double')) {
      teamStore.setFormat(format);
    }
  }

  /**
   * Initialize the home page
   */
  initHomePage() {
    // Home page is static HTML - nothing to initialize
    console.log('Home page loaded');
  }

  /**
   * Initialize the team builder page
   */
  initBuilderPage() {
    const gridContainer = document.getElementById('teamGrid');
    const searchContainer = document.getElementById('searchContainer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const teamSizeEl = document.getElementById('teamSize');
    const minSlotsMsg = document.getElementById('minSlotsMsg');
    const weaknessSummary = document.getElementById('weaknessSummary');
    const weaknessCount = document.getElementById('weaknessCount');
    const formatToggle = document.getElementById('formatToggle');

    if (!gridContainer) {
      console.warn('Team grid container not found');
      return;
    }

    // Render initial team grid
    this.renderTeamGrid(gridContainer);

    // Initialize search bar
    if (searchContainer) {
      const searchBar = SearchBar({
        placeholder: 'Search for a Pokémon by name...',
        onSelect: (pokemon) => {
          const result = teamStore.addPokemon(pokemon);
          if (result.success) {
            this.renderTeamGrid(gridContainer);
            this.updateTeamStats(teamSizeEl, minSlotsMsg, analyzeBtn);
            this.updateWeaknessSummary(weaknessSummary, weaknessCount);
          } else {
            this.showNotification(result.message, 'warning');
          }
        }
      });
      searchContainer.innerHTML = '';
      searchContainer.appendChild(searchBar);
    }

    // Format toggle
    if (formatToggle) {
      const options = formatToggle.querySelectorAll('.toggle-option');
      const currentFormat = teamStore.state.format;
      options.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.format === currentFormat);
        opt.addEventListener('click', () => {
          const format = opt.dataset.format;
          if (format !== teamStore.state.format) {
            teamStore.setFormat(format);
            options.forEach(o => o.classList.toggle('active', o === opt));
            this.showNotification(`Switched to ${formatBattleFormat(format)}`, 'info');
          }
        });
      });
    }

    // Analyze button
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        await this.handleAnalyze(analyzeBtn);
      });
    }

    // Update initial stats
    this.updateTeamStats(teamSizeEl, minSlotsMsg, analyzeBtn);
    this.updateWeaknessSummary(weaknessSummary, weaknessCount);

    // Subscribe to team changes
    teamStore.subscribe(() => {
      this.renderTeamGrid(gridContainer);
      this.updateTeamStats(teamSizeEl, minSlotsMsg, analyzeBtn);
      this.updateWeaknessSummary(weaknessSummary, weaknessCount);
    });

    console.log('Team builder initialized');
  }

  /**
   * Render the team grid
   */
  renderTeamGrid(container) {
    const team = teamStore.getTeam();
    const grid = TeamGrid({
      team,
      onRemove: (index) => {
        teamStore.removePokemon(index);
        this.showNotification('Pokémon removed from team', 'info');
      },
      onSlotClick: (index) => {
        // Focus the search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      },
      onPokemonClick: (pokemon, index) => {
        console.log('Pokémon clicked:', pokemon.name);
        // Could show details modal here
      }
    });
    container.innerHTML = '';
    container.appendChild(grid);
  }

  /**
   * Update team statistics
   */
  updateTeamStats(sizeEl, msgEl, btnEl) {
    const team = teamStore.getTeam();
    const size = team.length;

    if (sizeEl) {
      sizeEl.textContent = size;
    }

    const isReady = size >= 3;
    if (msgEl) {
      if (size === 0) {
        msgEl.textContent = '⚠️ Add at least 3 Pokémon to analyze';
        msgEl.style.color = 'var(--color-warning)';
      } else if (size < 3) {
        msgEl.textContent = `⚠️ Need ${3 - size} more Pokémon to analyze`;
        msgEl.style.color = 'var(--color-warning)';
      } else {
        msgEl.textContent = '✅ Team ready for analysis!';
        msgEl.style.color = 'var(--color-success)';
      }
    }

    if (btnEl) {
      btnEl.disabled = !isReady;
    }
  }

  /**
   * Update weakness summary
   */
  updateWeaknessSummary(container, countEl) {
    if (!container) return;

    const team = teamStore.getTeam();
    if (team.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="text-sm text-muted" style="margin-bottom: 0;">
            Add Pokémon to see type weaknesses
          </p>
        </div>
      `;
      if (countEl) countEl.textContent = '0 weaknesses';
      return;
    }

    // Import type chart utilities dynamically
    import('./utils/typeChart.js').then(({ getTeamTypeSummary }) => {
      const summary = getTeamTypeSummary(team);
      const weaknesses = summary.weaknesses || [];

      if (countEl) {
        countEl.textContent = `${weaknesses.length} weaknesses`;
      }

      if (weaknesses.length === 0) {
        container.innerHTML = `
          <div class="text-sm text-success">
            ✅ No major weaknesses found!
          </div>
        `;
        return;
      }

      // Show top weaknesses
      const html = weaknesses.slice(0, 5).map(w => {
        const count = w.count || 1;
        const label = count > 1 ? ` ×${count}` : '';
        return `<span class="type-badge ${w.type}">${w.type}${label}</span>`;
      }).join(' ');

      container.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
          ${html}
          ${weaknesses.length > 5 ? `<span class="text-xs text-muted">+${weaknesses.length - 5} more</span>` : ''}
        </div>
      `;
    }).catch(err => {
      console.error('Error loading type chart:', err);
      container.innerHTML = `
        <div class="text-sm text-muted">
          Unable to load type data
        </div>
      `;
    });
  }

  /**
   * Handle team analysis
   */
  async handleAnalyze(btn) {
    const team = teamStore.getTeam();
    const format = teamStore.state.format;

    // Validate team
    const validation = validateTeamForAnalysis(team, format);
    if (!validation.valid) {
      this.showNotification(validation.errors.join(', '), 'error');
      return;
    }

    // Disable button and show loading
    btn.disabled = true;
    btn.textContent = '⏳ Analyzing...';
    teamStore.setLoading(true);

    try {
      // Build payload
      const payload = {
        team: team.map(p => ({
          name: p.name,
          types: p.types,
          stats: p.stats || {}
        })),
        format: format
      };

      // Call backend
      const result = await analyzeTeam(payload);

      // Store result
      teamStore.setResult(result);

      // Navigate to strategy page
      this.showNotification('Analysis complete!', 'success');
      window.location.href = '/strategy.html';

    } catch (error) {
      console.error('Analysis error:', error);
      this.showNotification(`Analysis failed: ${error.message}`, 'error');
      teamStore.setErrors([error.message]);
      teamStore.setLoading(false);
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 Analyze Team';
    }
  }

  /**
   * Initialize the strategy page
   */
  initStrategyPage() {
    const team = teamStore.getTeam();
    const result = teamStore.state.result;

    // If no team data, redirect to builder
    if (team.length === 0) {
      this.showNotification('No team data found. Please build a team first.', 'warning');
      setTimeout(() => {
        window.location.href = '/team-builder.html';
      }, 2000);
      return;
    }

    // Update team format label
    const formatLabel = document.getElementById('teamFormatLabel');
    if (formatLabel) {
      formatLabel.textContent = formatBattleFormat(teamStore.state.format);
    }

    // Render team summary
    const summaryContainer = document.getElementById('teamSummarySprites');
    if (summaryContainer) {
      const summary = TeamSummary({
        team,
        size: 48,
        onPokemonClick: (pokemon) => {
          console.log('Pokémon clicked:', pokemon.name);
        }
      });
      summaryContainer.innerHTML = '';
      summaryContainer.appendChild(summary);
    }

    // If we have results, render them
    const overviewContent = document.getElementById('overviewContent');
    if (result && overviewContent) {
      const panel = StrategyPanel({
        result,
        team,
        format: teamStore.state.format
      });
      overviewContent.innerHTML = '';
      overviewContent.appendChild(panel);
    } else if (overviewContent && !result) {
      // Show loading or empty state
      overviewContent.innerHTML = `
        <div class="empty-state">
          <div class="loader-container">
            <div class="loader-spinner"></div>
            <p class="loader-text">Loading strategy data...</p>
          </div>
        </div>
      `;

      // Try to analyze if we have team but no result
      if (team.length >= 3) {
        this.analyzeAndRenderResults(overviewContent);
      }
    }

    // Setup tabs
    this.setupTabs();

    // Setup export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.handleExport(team);
      });
    }

    console.log('Strategy page initialized');
  }

  /**
   * Analyze team and render results on strategy page
   */
  async analyzeAndRenderResults(container) {
    const team = teamStore.getTeam();
    const format = teamStore.state.format;

    try {
      const payload = {
        team: team.map(p => ({
          name: p.name,
          types: p.types,
          stats: p.stats || {}
        })),
        format: format
      };

      const result = await analyzeTeam(payload);
      teamStore.setResult(result);

      // Re-render
      const panel = StrategyPanel({
        result,
        team,
        format
      });
      container.innerHTML = '';
      container.appendChild(panel);

    } catch (error) {
      console.error('Analysis error:', error);
      container.innerHTML = `
        <div class="empty-state">
          <p class="text-danger">Failed to analyze team: ${error.message}</p>
          <a href="/team-builder.html" class="btn btn-primary">Back to Team Builder</a>
        </div>
      `;
    }
  }

  /**
   * Setup tab navigation
   */
  setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = {
      overview: document.getElementById('overviewContent'),
      single: document.getElementById('singleContent'),
      double: document.getElementById('doubleContent'),
      typechart: document.getElementById('typeChartContent')
    };

    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding panel
        const tabName = tab.dataset.tab;
        Object.keys(panels).forEach(key => {
          const panel = panels[key];
          if (panel) {
            panel.style.display = key === tabName ? 'block' : 'none';
          }
        });

        // Load content for tab if needed
        this.loadTabContent(tabName);
      });
    });

    // Show initial tab
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      const tabName = activeTab.dataset.tab;
      Object.keys(panels).forEach(key => {
        const panel = panels[key];
        if (panel) {
          panel.style.display = key === tabName ? 'block' : 'none';
        }
      });
    }
  }

  /**
   * Load content for a tab
   */
  loadTabContent(tabName) {
    const team = teamStore.getTeam();
    const result = teamStore.state.result;

    if (tabName === 'typechart') {
      const container = document.getElementById('typeChartContent');
      if (container && result?.typeChart) {
        this.renderTypeChart(container, result.typeChart);
      }
    } else if (tabName === 'single' || tabName === 'double') {
      const container = document.getElementById(`${tabName}Content`);
      if (container && result) {
        this.renderBattleStrategy(container, result, tabName);
      }
    }
  }

  /**
   * Render type chart
   */
  renderTypeChart(container, chartData) {
    if (!chartData) {
      container.innerHTML = '<p class="text-muted">No type chart data available</p>';
      return;
    }

    // Simple type chart rendering
    let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">';

    // Header
    html += '<thead><tr><th style="padding: var(--space-2); border: 1px solid var(--color-border);">Type</th>';
    for (const type of Object.keys(chartData)) {
      html += `<th style="padding: var(--space-2); border: 1px solid var(--color-border);">${type}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Rows
    for (const [attacker, defenses] of Object.entries(chartData)) {
      html += `<tr><td style="padding: var(--space-2); border: 1px solid var(--color-border); font-weight: var(--font-weight-bold);">${attacker}</td>`;
      for (const defender of Object.keys(chartData)) {
        const value = defenses[defender] || 1;
        let color = 'var(--color-text-secondary)';
        if (value === 2) color = 'var(--color-danger)';
        else if (value === 0.5) color = 'var(--color-warning)';
        else if (value === 0) color = 'var(--color-text-muted)';

        html += `<td style="padding: var(--space-2); border: 1px solid var(--color-border); text-align: center; color: ${color};">${value}</td>`;
      }
      html += '</tr>';
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  /**
   * Render battle strategy
   */
  renderBattleStrategy(container, result, format) {
    const strategy = result[`${format}Strategy`] || result.strategy;
    if (!strategy) {
      container.innerHTML = '<p class="text-muted">No strategy data available</p>';
      return;
    }

    let html = '<div class="stack">';

    // Strategy summary
    html += `
      <div class="card">
        <h6>${format === 'single' ? '⚔️' : '🎯'} ${format === 'single' ? 'Single' : 'Double'} Battle Strategy</h6>
        <p class="text-secondary">${strategy.summary || 'Strategy recommendations for this battle format.'}</p>
      </div>
    `;

    // Recommendations
    if (strategy.recommendations && strategy.recommendations.length > 0) {
      html += '<div class="card"><h6>Key Recommendations</h6><ul style="list-style: disc; padding-left: var(--space-4);">';
      for (const rec of strategy.recommendations) {
        html += `<li class="text-secondary">${rec}</li>`;
      }
      html += '</ul></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Handle export
   */
  handleExport(team) {
    const exportText = formatTeamForExport(team);
    if (!exportText) {
      this.showNotification('No team data to export', 'warning');
      return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
      this.showNotification('Team exported to clipboard!', 'success');

      // Show tooltip
      const tooltip = document.getElementById('exportTooltip');
      if (tooltip) {
        tooltip.classList.add('show');
        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 2000);
      }
    }).catch(() => {
      // Fallback: create text file download
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'team_export.txt';
      a.click();
      URL.revokeObjectURL(url);
      this.showNotification('Team exported as file!', 'success');
    });
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Simple notification implementation
    const existing = document.querySelector('.notification-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: var(--space-5);
      right: var(--space-5);
      padding: var(--space-3) var(--space-5);
      background: var(--color-surface-raised);
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--color-primary);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-toast);
      max-width: 400px;
      animation: slideUp var(--transition-base) ease-out forwards;
      color: var(--color-text-primary);
    `;

    if (type === 'success') {
      toast.style.borderLeftColor = 'var(--color-success)';
    } else if (type === 'error') {
      toast.style.borderLeftColor = 'var(--color-danger)';
    } else if (type === 'warning') {
      toast.style.borderLeftColor = 'var(--color-warning)';
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity var(--transition-fast)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Expose for debugging
  window.__app = app;
});

// Handle page navigation with state preservation
window.addEventListener('popstate', () => {
  const app = new App();
  app.init();
});

console.log('PokéTeam Strategist - Main entry point loaded');