import { LanguageId } from '../i18n/site-messages';
import { GameSlug } from './games';

/**
 * Big changes to the games site, oldest first, listed on the home page under "What's new"; changes newer than a
 * visitor's last visit get a "New" badge.
 *
 * Add an entry for changes players would want to know about (a new game, a new setting, a new language),
 * never for small fixes. Give it the next version number and the time it goes live, write each change in
 * every language with its `kind` (a tag says what it's about, so the text can be short; `game` when it is about a
 * game, so the list links to it), and set `privacy: true`
 * when the update changes what the site saves, so the privacy notice is shown again.
 */
/** What a change is about, shown as a tag beside it */
export const UPDATE_KINDS = [
  'game',
  'language',
  'settings',
  'feature',
  'privacy',
] as const;
export type UpdateKind = (typeof UPDATE_KINDS)[number];

export interface UpdateChange {
  readonly kind: UpdateKind;
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
        kind: 'game',
        text: {
          en: 'Math games: true or false, number pad and find the signs',
          es: 'Juegos de matemáticas: verdadero o falso, teclado numérico y encuentra los signos',
          eu: 'Matematika jokoak: egia ala gezurra, zenbaki-teklatua eta aurkitu zeinuak',
          it: 'Giochi di matematica: vero o falso, tastierino numerico e trova i segni',
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
        kind: 'game',
        text: {
          en: 'New game: Sliding puzzle, with lines or a drawing',
          es: 'Nuevo juego: Puzle deslizante, con líneas o con un dibujo',
          eu: 'Joko berria: Puzzle irristakorra, lerroekin edo marrazki batekin',
          it: 'Nuovo gioco: Puzzle scorrevole, con linee o con un disegno',
          uk: 'Нова гра: П’ятнашки, з лініями або малюнком',
        },
      },
      {
        game: 'turn-picture',
        kind: 'game',
        text: {
          en: 'New game: Turn the picture',
          es: 'Nuevo juego: Gira la imagen',
          eu: 'Joko berria: Biratu irudia',
          it: 'Nuovo gioco: Gira il disegno',
          uk: 'Нова гра: Поверни малюнок',
        },
      },
      {
        game: 'place-pieces',
        kind: 'game',
        text: {
          en: 'New game: Place the pieces',
          es: 'Nuevo juego: Coloca las piezas',
          eu: 'Joko berria: Kokatu piezak',
          it: 'Nuovo gioco: Metti a posto i pezzi',
          uk: 'Нова гра: Розклади шматочки',
        },
      },
      {
        kind: 'settings',
        text: {
          en: 'Game colours for every game, in the settings',
          es: 'Colores del juego para todos los juegos, en los ajustes',
          eu: 'Jokoaren koloreak joko guztietarako, ezarpenetan',
          it: 'Colori del gioco per tutti i giochi, nelle impostazioni',
          uk: 'Кольори гри для всіх ігор, у налаштуваннях',
        },
      },
      {
        kind: 'language',
        text: {
          en: 'Play in English, Spanish or Basque, in the settings',
          es: 'Juega en inglés, español o euskera, en los ajustes',
          eu: 'Jokatu ingelesez, gaztelaniaz edo euskaraz, ezarpenetan',
          it: 'Gioca in inglese, spagnolo o basco, nelle impostazioni',
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
        kind: 'privacy',
        text: {
          en: 'New Privacy page: choose whether this device remembers your preferences, or delete what is saved',
          es: 'Nueva página de Privacidad: elige si este dispositivo recuerda tus preferencias o borra lo guardado',
          eu: 'Pribatutasun orri berria: aukeratu gailu honek zure hobespenak gogoratzen dituen, edo ezabatu gordetakoa',
          it: 'Nuova pagina Privacy: scegli se questo dispositivo ricorda le tue preferenze, o elimina ciò che è salvato',
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
        kind: 'language',
        text: {
          en: 'The games are now in Ukrainian too, in the settings',
          es: 'Los juegos ya están también en ucraniano, en los ajustes',
          eu: 'Jokoak ukraineraz ere badaude, ezarpenetan',
          it: 'I giochi ora sono anche in ucraino, nelle impostazioni',
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
        kind: 'game',
        text: {
          en: 'New game: Letter games, with vowels, mixed letters and a word builder',
          es: 'Nuevo juego: Juegos de letras, con vocales, letras mezcladas y forma palabras',
          eu: 'Joko berria: Letra jokoak, bokalekin, letra nahasiekin eta hitz-sortzailearekin',
          it: 'Nuovo gioco: Giochi di lettere, con vocali, lettere mescolate e forma parole',
          uk: 'Нова гра: Ігри з буквами — голосні, перемішані букви та складання слів',
        },
      },
      {
        kind: 'feature',
        text: {
          en: 'Games are grouped by category, each with its own recommended age',
          es: 'Los juegos están agrupados por categorías, cada uno con su edad recomendada',
          eu: 'Jokoak kategoriatan sailkatuta daude, bakoitza bere adin gomendatuarekin',
          it: 'I giochi sono raggruppati per categorie, ognuna con la sua età consigliata',
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
        kind: 'feature',
        text: {
          en: 'Tell us what you think of each game with 👍 or 👎, below the game',
          es: 'Dinos qué te parece cada juego con 👍 o 👎, debajo del juego',
          eu: 'Esaiguzu zer iruditzen zaizun joko bakoitza 👍 edo 👎 erabiliz, jokoaren azpian',
          it: 'Di’ cosa pensi di ogni gioco con 👍 o 👎, sotto il gioco',
          uk: 'Розкажи, як тобі кожна гра, за допомогою 👍 або 👎 під грою',
        },
      },
      {
        kind: 'feature',
        text: {
          en: 'New page to suggest ideas, with a drawing if you like',
          es: 'Nueva página para sugerir ideas, con un dibujo si quieres',
          eu: 'Ideiak proposatzeko orri berria, marrazki batekin nahi baduzu',
          it: 'Nuova pagina per suggerire idee, con un disegno se vuoi',
          uk: 'Нова сторінка, щоб запропонувати ідею, за бажанням із малюнком',
        },
      },
      {
        game: 'letter-games',
        kind: 'game',
        text: {
          en: 'Word builder: any real word counts, and you can report rude ones',
          es: 'Forma palabras: vale cualquier palabra real, y puedes denunciar las groseras',
          eu: 'Hitz-sortzailea: edozein hitz errealek balio du, eta zakarrak sala ditzakezu',
          it: 'Forma parole: vale qualsiasi parola vera, e puoi segnalare quelle volgari',
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
        kind: 'game',
        text: {
          en: 'New game: Hit the note, find, compare and sing notes',
          es: 'Nuevo juego: Dando la nota, encuentra, compara y canta notas',
          eu: 'Joko berria: Asmatu nota, aurkitu, alderatu eta abestu notak',
          it: 'Nuovo gioco: Prendi la nota, trova, confronta e canta le note',
          uk: 'Нова гра: Влуч у ноту — знаходь, порівнюй і співай ноти',
        },
      },
    ],
  },
  {
    version: 8,
    published: '2026-11-08T20:00:00+01:00',
    changes: [
      {
        kind: 'feature',
        text: {
          en: 'What’s new is now on the home page, so you never miss a change',
          es: 'Las novedades están ahora en la página principal, para que no te pierdas nada',
          eu: 'Berritasunak orri nagusian daude orain, ezer gal ez dezazun',
          it: 'Le novità ora sono nella pagina principale, così non ti perdi niente',
          uk: 'Новини тепер на головній сторінці, щоб ти нічого не пропустив',
        },
      },
    ],
  },
  {
    version: 9,
    published: '2026-11-08T21:00:00+01:00',
    changes: [
      {
        game: 'measure-it',
        kind: 'game',
        text: {
          en: 'New game: Measure it, with angles, glasses of water and number lines',
          es: 'Nuevo juego: A medir, con ángulos, vasos de agua y rectas numéricas',
          eu: 'Joko berria: Neurtu, angeluekin, ur-basoekin eta zenbaki-zuzenekin',
          it: 'Nuovo gioco: Misuralo, con angoli, bicchieri d’acqua e rette numeriche',
          uk: 'Нова гра: Виміряй, з кутами, склянками води і числовими прямими',
        },
      },
    ],
  },
  {
    version: 10,
    published: '2026-11-08T22:00:00+01:00',
    changes: [
      {
        game: 'climb-tower',
        kind: 'game',
        text: {
          en: 'New game: Climb the tower, true or false and which one',
          es: 'Nuevo juego: Sube la torre, verdadero o falso y cuál es',
          eu: 'Joko berria: Igo dorrea, egia ala gezurra eta zein da',
          it: 'Nuovo gioco: Scala la torre, vero o falso e quale',
          uk: 'Нова гра: Піднімись на вежу, правда чи ні та який саме',
        },
      },
    ],
  },
  {
    version: 11,
    published: '2026-11-08T22:30:00+01:00',
    changes: [
      {
        game: 'find-pairs',
        kind: 'game',
        text: {
          en: 'New game: Find the pairs, turn the cards and remember the pictures',
          es: 'Nuevo juego: Encuentra las parejas, gira las cartas y recuerda los dibujos',
          eu: 'Joko berria: Aurkitu bikoteak, biratu kartak eta gogoratu marrazkiak',
          it: 'Nuovo gioco: Trova le coppie, gira le carte e ricorda i disegni',
          uk: 'Нова гра: Знайди пари, перевертай картки й запам’ятовуй картинки',
        },
      },
    ],
  },
  {
    version: 12,
    published: '2026-11-08T23:00:00+01:00',
    changes: [
      {
        kind: 'language',
        text: {
          en: 'Italian translation added',
          es: 'Añadida la traducción al italiano',
          eu: 'Italierazko itzulpena gehitu da',
          it: 'Aggiunta la traduzione in italiano',
          uk: 'Додано італійський переклад',
        },
      },
    ],
  },
];

/** The site's current version */
export const LATEST_VERSION = Math.max(
  ...SITE_UPDATES.map(({ version }) => version)
);

/** When the current version went live */
export const LATEST_PUBLISHED = SITE_UPDATES.reduce((latest, update) =>
  update.version > latest.version ? update : latest
).published;

/** The site version the visitor last saw (in the browser's storage) */
export const LAST_SEEN_STORAGE = 'last-seen-version';

/** The newest version that changed what the site saves */
export const LATEST_PRIVACY_VERSION = Math.max(
  0,
  ...SITE_UPDATES.filter(({ privacy }) => privacy).map(({ version }) => version)
);

/** A change with the update it came in */
export interface DatedChange {
  readonly change: UpdateChange;
  readonly version: number;
  /** When its update went live, as an ISO date and time */
  readonly published: string;
}

/** Every change, newest update first (keeping each update's own order), for the home page's "What's new" */
export function recentChanges(
  updates: readonly SiteUpdate[] = SITE_UPDATES
): DatedChange[] {
  return [...updates]
    .sort((first, second) => second.version - first.version)
    .flatMap(({ version, published, changes }) =>
      changes.map(change => ({ change, version, published }))
    );
}

/** A day as a short local date in a language, e.g. `7 Nov 2026` */
export function formatDay(iso: string, language: LanguageId): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(
    new Date(iso)
  );
}

/** A moment as a short local date and time in a language, e.g. `7 Nov 2026, 16:30` */
export function formatMoment(iso: string, language: LanguageId): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}
