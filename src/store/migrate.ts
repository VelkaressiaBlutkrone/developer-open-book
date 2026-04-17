/**
 * Migrate legacy localStorage keys to the v2 progress format.
 * Currently no legacy format exists, but this is the designated
 * migration point for future schema changes.
 */

const STORAGE_KEY = 'dev-open-book-progress'

export function migrateIfNeeded(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)

    // v1 → v2 migration placeholder
    // If we ever ship a v1, add conversion logic here.
    if (parsed.version && parsed.version < 2) {
      // Future: convert v1 schema to v2
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Corrupted data — clear it
    localStorage.removeItem(STORAGE_KEY)
  }
}
