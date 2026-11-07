import { LanguageId } from '../i18n/site-messages';
import { GameSlug } from './games';

/**
 * Big changes to the games site, oldest first, shown to returning visitors as "New since your last visit".
 *
 * Add an entry for changes players would want to know about (a new game, a new setting, a new language),
 * never for small fixes. Give it the next version number and the time it goes live, write each change in
 * every language (with `game` when it is a new game, so the notice links to it), and set `privacy: true`
 * when the update changes what the site saves, so the privacy notice is shown again.
 */
export interface UpdateChange {
  readonly text: Readonly<Record<LanguageId, string>>;
  /** The game this change is about, linked from the notice */
  readonly game?: GameSlug;
}

export interface SiteUpdate {
  /** Counts up by one per update */
  readonly version: number;
  /** When it went live, as an ISO date and time with its offset; shown in the visitor's local time */
  readonly published: string;
  /** The update changes what the site saves; visitors see the privacy notice again */
  readonly privacy?: boolean;
  readonly changes: readonly UpdateChange[];
}

export const SITE_UPDATES: readonly SiteUpdate[] = [
  {
    version: 1,
    published: '2026-11-07T01:45:00+01:00',
    privacy: true,
    changes: [
      {
        game: 'math-games',
        text: {
          en: 'Math games: true or false, number pad and find the signs',
          es: 'Juegos de matemáticas: verdadero o falso, teclado numérico y encuentra los signos',
          eu: 'Matematika jokoak: egia ala gezurra, zenbaki-teklatua eta aurkitu zeinuak',
        },
      },
    ],
  },
  {
    version: 2,
    published: '2026-11-07T16:30:00+01:00',
    changes: [
      {
        game: 'sliding-puzzle',
        text: {
          en: 'New game: Sliding puzzle, with lines or a drawing',
          es: 'Nuevo juego: Puzle deslizante, con líneas o con un dibujo',
          eu: 'Joko berria: Puzzle irristakorra, lerroekin edo marrazki batekin',
        },
      },
      {
        game: 'turn-picture',
        text: { en: 'New game: Turn the picture', es: 'Nuevo juego: Gira la imagen', eu: 'Joko berria: Biratu irudia' },
      },
      {
        game: 'place-pieces',
        text: {
          en: 'New game: Place the pieces',
          es: 'Nuevo juego: Coloca las piezas',
          eu: 'Joko berria: Kokatu piezak',
        },
      },
      {
        text: {
          en: 'Game colours for every game, in the settings',
          es: 'Colores del juego para todos los juegos, en los ajustes',
          eu: 'Jokoaren koloreak joko guztietarako, ezarpenetan',
        },
      },
      {
        text: {
          en: 'Play in English, Spanish or Basque, in the settings',
          es: 'Juega en inglés, español o euskera, en los ajustes',
          eu: 'Jokatu ingelesez, gaztelaniaz edo euskaraz, ezarpenetan',
        },
      },
    ],
  },
  {
    version: 3,
    published: '2026-11-07T17:30:00+01:00',
    privacy: true,
    changes: [
      {
        text: {
          en: 'New Privacy page: choose whether this device remembers your preferences, or delete what is saved',
          es: 'Nueva página de Privacidad: elige si este dispositivo recuerda tus preferencias o borra lo guardado',
          eu: 'Pribatutasun orri berria: aukeratu gailu honek zure hobespenak gogoratzen dituen, edo ezabatu gordetakoa',
        },
      },
    ],
  },
];

/** The site's current version */
export const LATEST_VERSION = Math.max(...SITE_UPDATES.map(({ version }) => version));

/** When the current version went live */
export const LATEST_PUBLISHED = SITE_UPDATES.reduce((latest, update) =>
  update.version > latest.version ? update : latest,
).published;

/** The newest version that changed what the site saves */
export const LATEST_PRIVACY_VERSION = Math.max(
  0,
  ...SITE_UPDATES.filter(({ privacy }) => privacy).map(({ version }) => version),
);

/** Updates newer than `version`, oldest first */
export function updatesSince(version: number, updates: readonly SiteUpdate[] = SITE_UPDATES): SiteUpdate[] {
  return updates.filter((update) => update.version > version);
}

/** Every change in those updates, oldest first */
export function changesIn(updates: readonly SiteUpdate[]): UpdateChange[] {
  return updates.flatMap(({ changes }) => changes);
}

/** A moment as a short local date and time in a language, e.g. `7 Nov 2026, 16:30` */
export function formatMoment(iso: string, language: LanguageId): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
