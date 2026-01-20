import { format, parseISO, subDays } from 'date-fns';

/**
 * Get current date in YYYY-MM-DD format.
 * Standard calendar date behavior (midnight rollover).
 */
export const getBusinessDate = (timestamp: Date = new Date()): string => {
  return format(timestamp, 'yyyy-MM-dd');
};

/**
 * Check if given date is today (business date aware)
 */
export const isBusinessToday = (date: string): boolean => {
  return date === getBusinessDate();
};

/**
 * Get display label for date
 */
export const getDateLabel = (date: string): string => {
  const today = getBusinessDate();
  const yesterday = getYesterdayBusinessDate();

  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return format(parseISO(date), 'dd MMM');
};

/**
 * Get business date for yesterday
 */
/**
 * Get business date for yesterday
 * IMPORTANT: Derives from business date, not wall clock time
 */
export const getYesterdayBusinessDate = (): string => {
  const todayStr = getBusinessDate(); // e.g. "2024-01-20"
  const todayDate = parseISO(todayStr); // Date object for 2024-01-20
  return format(subDays(todayDate, 1), 'yyyy-MM-dd'); // "2024-01-19"
};
