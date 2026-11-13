import { z } from 'zod';
import { gameSchema, languageSchema } from '../shared/catalog.js';

export const VOTES = ['up', 'down'] as const;
export const FEEDBACK_REASONS = [
  'fun',
  'learned',
  'too-easy',
  'too-hard',
  'boring',
  'confusing',
  'bug',
] as const;

export const feedbackSchema = z.object({
  game: gameSchema,
  vote: z.enum(VOTES),
  reason: z.enum(FEEDBACK_REASONS).optional(),
  language: languageSchema,
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
