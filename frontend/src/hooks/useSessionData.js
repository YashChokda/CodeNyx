/**
 * useSessionData.js
 * Lightweight localStorage-based session persistence.
 * Used by Simulation, MainEngines, Refinement, CostAndGovGuide, and Dashboard
 * to share state across page navigations without relying solely on React Router state.
 */

const SESSION_KEY = 'vov_session';

/**
 * Merge new data into the existing session object.
 * @param {object} data - Partial session data to save
 */
export function saveSession(data) {
  try {
    const existing = getSession();
    const merged = { ...existing, ...data };
    localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('saveSession: failed to write to localStorage', err);
  }
}

/**
 * Retrieve the full session object from localStorage.
 * @returns {object} - The session data, or an empty object if none exists
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('getSession: failed to read from localStorage', err);
    return {};
  }
}

/**
 * Clear the entire session (e.g., on logout or new venture start).
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('clearSession: failed to clear localStorage', err);
  }
}
