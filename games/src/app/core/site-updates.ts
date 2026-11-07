import { LanguageId } from '../i18n/site-messages';

/**
 * Big changes to the games site, oldest first, shown to returning visitors as "New since your last visit".
 *
 * Add an entry for changes players would want to know about (a new game, a new setting, a new language),
 * never for small fixes. Give it the next version number and today's date, write each change in every
 * language, and set `privacy: true` when the update changes what the site stores, so the privacy notice is
 * shown again.
 */
export interface SiteUpdate {
  /** Counts up by one per update */
  readonly version: number;
  /** When it went live, as YYYY-MM-DD */
  readonly date: string;
  /** The update changes what the site stores; visitors see the privacy notice again */
  readonly privacy?: boolean;
  /** Short lines, one per change */
  readonly changes: Readonly<Record<LanguageId, readonly string[]>>;
}

export const SITE_UPDATES: readonly SiteUpdate[] = [
  {
    version: 1,
    date: '2026-11-06',
    privacy: true,
    changes: {
      en: ['Math games: true or false, number pad and find the signs'],
      es: ['Juegos de matemáticas: verdadero o falso, teclado numérico y encuentra los signos'],
      eu: ['Matematika jokoak: egia ala gezurra, zenbaki-teklatua eta aurkitu zeinuak'],
    },
  },
  {
    version: 2,
    date: '2026-11-07',
    changes: {
      en: [
        'New game: Sliding puzzle, with lines or a drawing',
        'New game: Turn the picture',
        'New game: Place the pieces',
        'Game colours for every game, in the settings',
        'Play in English, Spanish or Basque, in the settings',
      ],
      es: [
        'Nuevo juego: Puzle deslizante, con líneas o con un dibujo',
        'Nuevo juego: Gira la imagen',
        'Nuevo juego: Coloca las piezas',
        'Colores del juego para todos los juegos, en los ajustes',
        'Juega en inglés, español o euskera, en los ajustes',
      ],
      eu: [
        'Joko berria: Puzzle irristakorra, lerroekin edo marrazki batekin',
        'Joko berria: Biratu irudia',
        'Joko berria: Kokatu piezak',
        'Jokoaren koloreak joko guztietarako, ezarpenetan',
        'Jokatu ingelesez, gaztelaniaz edo euskaraz, ezarpenetan',
      ],
    },
  },
];

/** The site's current version */
export const LATEST_VERSION = Math.max(...SITE_UPDATES.map(({ version }) => version));

/** The newest version that changed what the site stores */
export const LATEST_PRIVACY_VERSION = Math.max(
  0,
  ...SITE_UPDATES.filter(({ privacy }) => privacy).map(({ version }) => version),
);

/** Updates newer than `version`, oldest first */
export function updatesSince(version: number, updates: readonly SiteUpdate[] = SITE_UPDATES): SiteUpdate[] {
  return updates.filter((update) => update.version > version);
}

/** Every change in those updates, in one language, oldest first */
export function changesIn(updates: readonly SiteUpdate[], language: LanguageId): string[] {
  return updates.flatMap(({ changes }) => changes[language]);
}
