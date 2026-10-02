const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Turns a backend timestamp like "2026-07-23T11:09:14.536118" into
 * "23 Jul 2026, 11:09" - no "T", no seconds, no fractions.
 *
 * The string is read piece by piece (not passed through `new Date()`), so the
 * time shown is exactly the time the backend sent, with no timezone shifting.
 * Anything that doesn't look like a timestamp is returned unchanged.
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value);
  if (!m) return value;
  const [, year, month, day, hour, minute] = m;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return value;
  return `${Number(day)} ${monthName} ${year}, ${hour}:${minute}`;
}
