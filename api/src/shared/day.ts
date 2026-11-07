/** Today's date in UTC as `YYYY-MM-DD`; the API stores days, not exact times, so nothing can be tied to a visit */
export const today = (now = new Date()): string =>
  now.toISOString().slice(0, 10);
