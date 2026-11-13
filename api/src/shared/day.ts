export const today = (now = new Date()): string =>
  now.toISOString().slice(0, 10);
