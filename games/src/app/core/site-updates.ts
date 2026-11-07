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
          uk: 'Математичні ігри: правда чи неправда, цифрова клавіатура й знайди знаки',
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
          uk: 'Нова гра: П’ятнашки, з лініями або малюнком',
        },
      },
      {
        game: 'turn-picture',
        text: {
          en: 'New game: Turn the picture',
          es: 'Nuevo juego: Gira la imagen',
          eu: 'Joko berria: Biratu irudia',
          uk: 'Нова гра: Поверни малюнок',
        },
      },
      {
        game: 'place-pieces',
        text: {
          en: 'New game: Place the pieces',
          es: 'Nuevo juego: Coloca las piezas',
          eu: 'Joko berria: Kokatu piezak',
          uk: 'Нова гра: Розклади шматочки',
        },
      },
      {
        text: {
          en: 'Game colours for every game, in the settings',
          es: 'Colores del juego para todos los juegos, en los ajustes',
          eu: 'Jokoaren koloreak joko guztietarako, ezarpenetan',
          uk: 'Кольори гри для всіх ігор, у налаштуваннях',
        },
      },
      {
        text: {
          en: 'Play in English, Spanish or Basque, in the settings',
          es: 'Juega en inglés, español o euskera, en los ajustes',
          eu: 'Jokatu ingelesez, gaztelaniaz edo euskaraz, ezarpenetan',
          uk: 'Грай англійською, іспанською чи баскською, у налаштуваннях',
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
          uk: 'Нова сторінка «Приватність»: обери, чи пам’ятає цей пристрій твої налаштування, або видали збережене',
        },
      },
    ],
  },
  {
    version: 4,
    published: '2026-11-07T19:00:00+01:00',
    changes: [
      {
        text: {
          en: 'The games are now in Ukrainian too, in the settings',
          es: 'Los juegos ya están también en ucraniano, en los ajustes',
          eu: 'Jokoak ukraineraz ere badaude, ezarpenetan',
          uk: 'Ігри тепер є й українською, у налаштуваннях',
        },
      },
    ],
  },
  {
    version: 5,
    published: '2026-11-07T21:00:00+01:00',
    changes: [
      {
        game: 'letter-games',
        text: {
          en: 'New game: Letter games, with vowels, mixed letters and a word builder',
          es: 'Nuevo juego: Juegos de letras, con vocales, letras mezcladas y forma palabras',
          eu: 'Joko berria: Letra jokoak, bokalekin, letra nahasiekin eta hitz-sortzailearekin',
          uk: 'Нова гра: Ігри з буквами — голосні, перемішані букви та складання слів',
        },
      },
      {
        text: {
          en: 'Games are grouped by category, each with its own recommended age',
          es: 'Los juegos están agrupados por categorías, cada uno con su edad recomendada',
          eu: 'Jokoak kategoriatan sailkatuta daude, bakoitza bere adin gomendatuarekin',
          uk: 'Ігри згруповано за категоріями, у кожної — своя рекомендована вікова група',
        },
      },
    ],
  },
  {
    version: 6,
    published: '2026-11-08T12:00:00+01:00',
    privacy: true,
    changes: [
      {
        text: {
          en: 'Tell us what you think of each game with 👍 or 👎, below the game',
          es: 'Dinos qué te parece cada juego con 👍 o 👎, debajo del juego',
          eu: 'Esaiguzu zer iruditzen zaizun joko bakoitza 👍 edo 👎 erabiliz, jokoaren azpian',
          uk: 'Розкажи, як тобі кожна гра, за допомогою 👍 або 👎 під грою',
        },
      },
      {
        text: {
          en: 'New page to suggest ideas, with a drawing if you like',
          es: 'Nueva página para sugerir ideas, con un dibujo si quieres',
          eu: 'Ideiak proposatzeko orri berria, marrazki batekin nahi baduzu',
          uk: 'Нова сторінка, щоб запропонувати ідею, за бажанням із малюнком',
        },
      },
      {
        game: 'letter-games',
        text: {
          en: 'Word builder: any real word counts, and you can report rude ones',
          es: 'Forma palabras: vale cualquier palabra real, y puedes denunciar las groseras',
          eu: 'Hitz-sortzailea: edozein hitz errealek balio du, eta zakarrak sala ditzakezu',
          uk: '«Склади слова»: зараховується будь-яке справжнє слово, а на грубі можна поскаржитися',
        },
      },
    ],
  },
  {
    version: 7,
    published: '2026-11-08T18:00:00+01:00',
    changes: [
      {
        game: 'hit-the-note',
        text: {
          en: 'New game: Hit the note, find, compare and sing notes',
          es: 'Nuevo juego: Dando la nota, encuentra, compara y canta notas',
          eu: 'Joko berria: Asmatu nota, aurkitu, alderatu eta abestu notak',
          uk: 'Нова гра: Влуч у ноту — знаходь, порівнюй і співай ноти',
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

/** The last `count` changes, oldest first */
export function latestChanges(count: number, updates: readonly SiteUpdate[] = SITE_UPDATES): UpdateChange[] {
  return changesIn(updates).slice(-count);
}

/** A moment as a short local date and time in a language, e.g. `7 Nov 2026, 16:30` */
export function formatMoment(iso: string, language: LanguageId): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
