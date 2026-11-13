import { z } from 'zod';
import { languageSchema } from '../shared/catalog.js';

export const SUGGESTION_CATEGORIES = [
  'new-game',
  'improvement',
  'drawing',
  'problem',
  'other',
] as const;
export const SUGGESTION_STATUSES = ['new', 'read', 'archived'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const suggestionSchema = z.object({
  category: z.enum(SUGGESTION_CATEGORIES),
  text: z.string().trim().min(3).max(500),
  language: languageSchema,
  turnstileToken: z.string().max(2048).optional(),
});
export type SuggestionInput = z.infer<typeof suggestionSchema>;

export const statusSchema = z.object({ status: z.enum(SUGGESTION_STATUSES) });
export type StatusInput = z.infer<typeof statusSchema>;
