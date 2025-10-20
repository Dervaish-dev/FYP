export const PREFERENCES_KEY = 'neurocompanion-user-preferences';
export const NOTIFICATIONS_KEY = 'neurocompanion-notifications-enabled';

export function getUserPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveUserPreferences(prefs) {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    // ignore
  }
}

export function getNotificationsEnabled() {
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  return raw ? raw === 'true' : true;
}

export function setNotificationsEnabled(enabled) {
  localStorage.setItem(NOTIFICATIONS_KEY, enabled ? 'true' : 'false');
}

export function buildUserContextString() {
  const p = getUserPreferences();
  if (!p) return '';
  const parts = [];
  if (p.fullName) parts.push(`User: ${p.fullName}`);
  if (p.age) parts.push(`Age: ${p.age}`);
  if (p.neurotype) parts.push(`Diagnosis: ${p.neurotype}`);
  if (p.personalGoals) parts.push(`Goals: ${p.personalGoals}`);
  return parts.length ? parts.join(', ') : '';
}


