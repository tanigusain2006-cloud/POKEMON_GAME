/**
 * filename: js/api/backend.js
 * purpose: All FastAPI backend fetch calls for team analysis and type data
 * dependencies: cache.js
 */

import cache, { teamAnalysisCacheKey } from './cache.js';

// Base URL for the FastAPI backend
// In production, this would be your actual backend URL
const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

// TTL for different types of data (in seconds)
const TTL = {
  ANALYSIS: 300, // 5 minutes
  TYPE_CHART: 3600 // 1 hour
};

/**
 * Analyze a team using the backend
 * @param {Object} teamPayload - Team data payload
 * @param {Array} teamPayload.team - Array of Pokémon objects
 * @param {string} teamPayload.format - 'single' or 'double'
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeTeam(teamPayload) {
  if (!teamPayload || !teamPayload.team || teamPayload.team.length === 0) {
    throw new Error('Team payload is required and must have at least one Pokémon');
  }

  // Generate cache key
  const cacheKey = teamAnalysisCacheKey(
    teamPayload.team,
    teamPayload.format || 'single'
  );

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/analyze`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        team: teamPayload.team,
        format: teamPayload.format || 'single'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Analysis failed (${response.status})`
      );
    }

    const data = await response.json();

    // Cache the result
    cache.set(cacheKey, data, TTL.ANALYSIS);

    return data;
  } catch (error) {
    console.error('analyzeTeam error:', error);
    throw error;
  }
}

/**
 * Get type chart data from the backend
 * @param {string[]} types - Array of types to get effectiveness for
 * @returns {Promise<Object>} Type chart data
 */
export async function getTypeChart(types) {
  if (!types || !Array.isArray(types) || types.length === 0) {
    throw new Error('At least one type is required');
  }

  const cacheKey = `typechart:${types.sort().join(',')}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/types?types=${types.join(',')}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Type chart fetch failed (${response.status})`
      );
    }

    const data = await response.json();

    // Cache the result
    cache.set(cacheKey, data, TTL.TYPE_CHART);

    return data;
  } catch (error) {
    console.error('getTypeChart error:', error);
    throw error;
  }
}

/**
 * Save a team to the backend
 * @param {Object} teamData - Team data to save
 * @param {string} teamData.name - Team name
 * @param {Array} teamData.team - Array of Pokémon objects
 * @param {string} teamData.format - 'single' or 'double'
 * @returns {Promise<Object>} Saved team data with ID
 */
export async function saveTeam(teamData) {
  if (!teamData || !teamData.team || teamData.team.length === 0) {
    throw new Error('Team data is required and must have at least one Pokémon');
  }

  try {
    const url = `${API_BASE}/teams`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: teamData.name || 'Unnamed Team',
        team: teamData.team,
        format: teamData.format || 'single',
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to save team (${response.status})`
      );
    }

    const data = await response.json();

    // Invalidate any cached analyses for this team
    const cacheKey = teamAnalysisCacheKey(teamData.team, teamData.format || 'single');
    cache.remove(cacheKey);

    return data;
  } catch (error) {
    console.error('saveTeam error:', error);
    throw error;
  }
}

/**
 * Get saved teams from the backend
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of teams to return
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Array of saved teams
 */
export async function getSavedTeams(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));

    const url = `${API_BASE}/teams?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch teams (${response.status})`
      );
    }

    const data = await response.json();
    return data.teams || [];
  } catch (error) {
    console.error('getSavedTeams error:', error);
    throw error;
  }
}

/**
 * Get a specific saved team by ID
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} Team data
 */
export async function getSavedTeam(teamId) {
  if (!teamId) {
    throw new Error('Team ID is required');
  }

  try {
    const url = `${API_BASE}/teams/${teamId}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Team with ID "${teamId}" not found`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch team (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getSavedTeam error:', error);
    throw error;
  }
}

/**
 * Delete a saved team by ID
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteSavedTeam(teamId) {
  if (!teamId) {
    throw new Error('Team ID is required');
  }

  try {
    const url = `${API_BASE}/teams/${teamId}`;
    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Team with ID "${teamId}" not found`);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete team (${response.status})`
      );
    }

    return true;
  } catch (error) {
    console.error('deleteSavedTeam error:', error);
    throw error;
  }
}

/**
 * Check backend health
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
  try {
    const url = `${API_BASE}/health`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('healthCheck error:', error);
    throw error;
  }
}