import { z } from 'zod';

export const PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

export const offsetSchema = z.coerce.number().int().min(0).default(0);
export const limitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_PAGE_SIZE)
  .default(PAGE_SIZE);

export interface Page {
  readonly offset: number;
  readonly limit: number;
}
