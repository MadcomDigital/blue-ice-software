import { format, parseISO, subDays } from 'date-fns';

/**
 * Business date logic for late-night deliveries:
 * - 12 AM to 6 AM = Previous day (late night delivery session)
 * - 6 AM onwards = Current day
 *
 * This handles scenarios where drivers work past midnight
 * but are still fulfilling orders for the previous business day.
 */
export const getBusinessDate = (timestamp: Date = new Date()): string => {
  const hour = timestamp.getHours();

  // If between midnight (12 AM) and 6 AM, consider it previous day
  if (hour >= 0 && hour < 6) {
    const yesterday = new Date(timestamp);
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, 'yyyy-MM-dd');
  }

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
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return format(parseISO(date), 'dd MMM');
};

/**
 * Get business date for yesterday
 */
export const getYesterdayBusinessDate = (): string => {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
};
