import { startOfDay, endOfDay, addDays, subDays, format } from 'date-fns';

/**
 * Standardized Date Utilities for UTC Business Logic
 *
 * Problem: JavaScript Dates are typically local time, but servers often run in UTC.
 * Using `new Date().setHours(0,0,0,0)` creates a local midnight, which might be
 * 19:00 previous day in UTC. Database queries using UTC ranges will then miss records.
 *
 * Solution: Treat all "Business Dates" (e.g. "2026-01-21") as UTC strings.
 * When we need a range (Start of Day to End of Day), we explicitly construct
 * UTC boundaries.
 */

/**
 * Parses a date input into a pure UTC Date object set to 00:00:00.000 UTC.
 * @param date Input date (string YYYY-MM-DD or Date object)
 */
export function toUtcStartOfDay(date: string | Date): Date {
  const d = new Date(date);
  // Create a UTC date from the components
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

/**
 * Parses a date input into a pure UTC Date object set to 23:59:59.999 UTC.
 * @param date Input date (string YYYY-MM-DD or Date object)
 */
export function toUtcEndOfDay(date: string | Date): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));
}

/**
 * Get "Today" as a UTC Start of Day.
 * This is useful for default values.
 * Note: Uses system local time to determine "Today", then converts to UTC midnight.
 * e.g. If local is Jan 21 10:00 AM, returns 2026-01-21T00:00:00Z.
 */
export function getUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
}

/**
 * Format a date for display (e.g., '2026-01-21') without timezone shifting.
 * This assumes the input Date is already a "Business Date" (UTC midnight).
 */
export function formatUtcDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  // We want to format the UTC components, not the local components.
  // date-fns format() uses local time by default.
  // We can trick it by adding the timezone offset back, or simply extracting UTC components.

  // Actually, simpler approach for standard strings:
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }

  // For complex formatting, we might need date-fns-tz or manual adjustment.
  // For now, let's stick to ISO for data exchange.
  return date.toISOString();
}
