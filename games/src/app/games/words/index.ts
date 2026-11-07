import { LanguageId } from '../../i18n/site-messages';
import { WordBank } from '../letter-games';
import { EN_WORDS } from './en';
import { ES_WORDS } from './es';
import { EU_WORDS } from './eu';
import { UK_WORDS } from './uk';

/** The letter games' words in each language of the site */
export const WORD_BANKS: Readonly<Record<LanguageId, WordBank>> = {
  en: EN_WORDS,
  es: ES_WORDS,
  eu: EU_WORDS,
  uk: UK_WORDS,
};
