import { z } from 'zod';
import { languageSchema } from '../shared/catalog.js';

/** Reports after which a word stops counting for everyone, until a moderator decides */
export const REPORTS_TO_HIDE = 3;

export const REPORT_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** A word as the word builder makes it: lowercase letters only, 3 to 10 of them */
export const reportSchema = z.object({
  word: z
    .string()
    .min(3)
    .max(20)
    .regex(/^\p{Ll}+$/u),
  language: languageSchema,
});
export type ReportInput = z.infer<typeof reportSchema>;

export const decisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});
export type DecisionInput = z.infer<typeof decisionSchema>;
