import { SuTablePageSize } from './table.types';

/** Where a page starts and ends among the rows */
export interface SuTablePageBounds {
  /** The page, from 0, kept within the pages there are */
  readonly page: number;
  readonly count: number;
  readonly start: number;
  readonly end: number;
}

/** A whole number of rows from 1, or every row */
export function suNormalizePageSize(
  pageSize: SuTablePageSize
): SuTablePageSize {
  return pageSize === 'all' ? pageSize : Math.max(1, Math.floor(pageSize));
}

/** The bounds of a page of `total` rows */
export function suPageBounds(
  total: number,
  pageSize: SuTablePageSize,
  page: number
): SuTablePageBounds {
  const size = pageSize === 'all' ? Math.max(total, 1) : pageSize;
  const count = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, count - 1);
  const start = current * size;
  return { page: current, count, start, end: Math.min(start + size, total) };
}
