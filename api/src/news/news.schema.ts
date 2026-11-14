import { z } from 'zod';
import { featureSchema, gameSchema, updateKindSchema } from '../shared/catalog.js';

const MAX_TEXT = 300;
const optionalText = z.string().trim().max(MAX_TEXT).optional();

export const newsSchema = z.object({
  kind: updateKindSchema,
  game: gameSchema.nullable().default(null),
  feature: featureSchema.nullable().default(null),
  privacy: z.boolean().default(false),
  published: z.iso.datetime({ offset: true }),
  text: z.object({
    es: z.string().trim().min(1).max(MAX_TEXT),
    en: optionalText,
    eu: optionalText,
    it: optionalText,
    uk: optionalText,
  }),
});
export type NewsInput = z.infer<typeof newsSchema>;

export const newsIdSchema = z.coerce.number().int().positive();
