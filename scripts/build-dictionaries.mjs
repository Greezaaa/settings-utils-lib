// Builds the word builder's dictionaries for games.su-labs.dev: `npm run build:dictionaries`.
//
// Writes games/public/dictionaries/<language>.txt, one word per line, most common first (the game takes the first
// ones as the words to find), which the site downloads on demand (only the
// visitor's language, the first time they open the word builder) to tell whether a word they made is real.
// The words to find and the words shown to the player still come from the checked lists in
// games/src/app/games/words/, so the game never shows a dictionary word by itself.
//
// Source: FrequencyWords by Hermit Dave (https://github.com/hermitdave/FrequencyWords), the 50,000 most common words
// of each language in OpenSubtitles, content licensed CC BY-SA 4.0; the built lists are shared under the same licence
// and credited on the privacy page. Rude words are removed with the LDNOOBW lists (CC BY 4.0) and the lists below.
//
// After changing the output, bump DICTIONARY_VERSION in games/src/app/core/word-dictionaries.ts so browsers fetch it again.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'games', 'public', 'dictionaries');

const FREQUENCY_URL = (language) =>
  `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/${language}/${language}_50k.txt`;
const BLOCKLIST_URL = (language) =>
  `https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/${language}`;

/** Word lengths the word builder can use: at least 3 letters, at most the 10 letters of its hardest level */
const MIN_LENGTH = 3;
const MAX_LENGTH = 10;

/**
 * Whether a word has the shape of a real word of its language, not an abbreviation (bbc, cctv) or text broken in the
 * subtitles (бкьмб, бксйвют): it has a vowel, at most `maxRun` consonants in a row anywhere, and at most
 * `maxLeading` before its first vowel (each language allows different clusters: str- in English, never in Spanish).
 */
function looksLikeWord(word, { vowels, maxRun, maxLeading }) {
  const consonantRuns = word.split(new RegExp(`[${vowels}]+`));
  return (
    consonantRuns.length > 1 &&
    consonantRuns.every((run) => Array.from(run).length <= maxRun) &&
    Array.from(consonantRuns[0]).length <= maxLeading
  );
}

/**
 * Every filter, per language, as one rule for all languages breaks words in some and lets junk through in others:
 * - `alphabet`: the letters a word may have (as in the game's word banks)
 * - `shape`: its vowels and the consonant clusters it allows (see looksLikeWord)
 * - `plain`: how to write words without the accent marks the game has no buttons for
 * - `blockedEndings`: endings that make a blocked word's other forms (plurals and the like) blocked too
 * - `nameHints`: languages to compare with, as a word more common in one of them is probably a film name or a
 *   borrowed word (it still counts, but is never asked for)
 * - `blocklists`: the LDNOOBW lists to block; `words` are blocked as they are, `roots` wherever they appear in a word
 *   (only roots that are never part of a harmless word)
 */
const LANGUAGES = {
  en: {
    alphabet: /^[a-z]+$/,
    // str-, spl-, -ngths…
    shape: { vowels: 'aeiouy', maxRun: 4, maxLeading: 3 },
    blockedEndings: ['s', 'es'],
    nameHints: ['es'],
    blocklists: ['en'],
    words: ['crap', 'damn', 'hell', 'poop', 'kill', 'killer', 'killing', 'murder', 'suicide', 'drug', 'drugs'],
    roots: ['fuck', 'shit', 'bitch', 'whore', 'slut', 'cunt', 'nigg', 'faggot', 'dildo', 'porn', 'pussy'],
  },
  es: {
    alphabet: /^[a-zñ]+$/,
    // At most two consonants start a word (tr-, pl-, ps-); inside, up to four (instrumento)
    shape: { vowels: 'aeiou', maxRun: 4, maxLeading: 2 },
    blockedEndings: ['s', 'es'],
    nameHints: ['en'],
    // á é í ó ú ü → a e i o u u; ñ stays, it is its own letter
    plain: (word) =>
      word
        .normalize('NFD')
        .replace(/(?<=[aeiou])[́̈]/g, '')
        .normalize('NFC'),
    blocklists: ['es'],
    words: [
      'puta',
      'putas',
      'puto',
      'putos',
      'mierda',
      'mierdas',
      'joder',
      'jodido',
      'jodida',
      'jodidos',
      'jodidas',
      'follar',
      'follando',
      'polla',
      'pollas',
      'coño',
      'coños',
      'cabron',
      'cabrona',
      'cabrones',
      'gilipollas',
      'capullo',
      'zorra',
      'zorras',
      'maricon',
      'maricones',
      'culo',
      'culos',
      'cojones',
      'hostia',
      'hostias',
      'matar',
      'muerto',
      'muerte',
      'droga',
      'drogas',
      'pene',
      'tetas',
      'sexo',
      'pajas',
      'puticlub',
    ],
    roots: ['putita', 'hijoputa', 'mamada', 'chingad', 'pendej', 'gilipoll', 'follad', 'joput'],
  },
  eu: {
    alphabet: /^[a-zñ]+$/,
    // tx-, tz-, tr- at most at the start
    shape: { vowels: 'aeiou', maxRun: 4, maxLeading: 2 },
    // Basque adds -a (the), -k and -ak (plural, or the doer)
    blockedEndings: ['a', 'k', 'ak'],
    nameHints: ['en', 'es'],
    blocklists: ['es'],
    words: ['puta', 'putak', 'kaka', 'hostia', 'ostia', 'joder', 'kabroi', 'kabroia', 'zakila', 'potorro', 'sexu'],
    roots: ['putakum', 'puttakum', 'mierda'],
  },
  it: {
    alphabet: /^[a-z]+$/,
    // str-, spr-, sfr- at the start; inside, up to four (mostro, inglese)
    shape: { vowels: 'aeiou', maxRun: 4, maxLeading: 3 },
    // Italian changes the last vowel for plurals and genders (cazzo, cazzi), so its own words and roots cover them
    blockedEndings: [],
    nameHints: ['en', 'es'],
    // à è é ì ò ù → a e e i o u
    plain: (word) => word.normalize('NFD').replace(/[̀́]/g, '').normalize('NFC'),
    blocklists: ['it'],
    words: [
      'culo',
      'culi',
      'figa',
      'fighe',
      'troia',
      'troie',
      'porca',
      'sesso',
      'droga',
      'droghe',
      'morte',
      'morto',
      'uccidere',
      'suicidio',
      'pene',
      'tette',
      'bastardo',
      'bastarda',
      'bastardi',
      'scopare',
      'scopata',
      'scopato',
      'porco',
      'porci',
      'negro',
      'negri',
    ],
    roots: [
      'cazz',
      'merd',
      'stronz',
      'puttan',
      'fancul',
      'fott',
      'minchi',
      'coglion',
      'incul',
      'mignott',
      'zoccol',
      'pompin',
      'sborr',
      'segaiol',
      'ricchion',
      'frocio',
      'froci',
      'porcod',
      'dioporc',
      'diocan',
    ],
  },
  uk: {
    alphabet: /^[абвгґдеєжзиіїйклмнопрстуфхцчшщьюя]+$/,
    // вст-, взд- (the soft sign counts as a consonant here)
    shape: { vowels: 'аеиіоуєюяї', maxRun: 4, maxLeading: 3 },
    // Ukrainian forms change inside the word too, so its own list of words and roots covers them
    blockedEndings: [],
    nameHints: [],
    blocklists: ['ru'],
    words: [
      'сука',
      'суки',
      'суку',
      'сучка',
      'курва',
      'курви',
      'срака',
      'гівно',
      'лайно',
      'жопа',
      'дупа',
      'повія',
      'повії',
      'секс',
      'член',
      'трахати',
      'вбити',
      'вбивця',
      'смерть',
      'наркотик',
      'наркотики',
    ],
    roots: [
      'хуй',
      'хуя',
      'хує',
      'хую',
      'хуї',
      'пизд',
      'бляд',
      'блят',
      'їба',
      'єба',
      'ебат',
      'ебан',
      'мудак',
      'мудил',
      'гандон',
      'підор',
      'підар',
      'педик',
      'залуп',
      'дроч',
      'шльондр',
    ],
  },
};

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`);
  }
  return response.text();
}

/** A word list file: one entry per line, lowercase */
const linesOf = (text) =>
  text
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);

async function build(language, settings, sources) {
  const { alphabet, shape, plain = (word) => word, blockedEndings, nameHints, blocklists, words, roots } = settings;
  const blocked = new Set(words);
  for (const list of blocklists) {
    linesOf(await download(BLOCKLIST_URL(list))).forEach((entry) => blocked.add(plain(entry)));
  }
  // A blocked word's forms with the language's endings are blocked too
  const isBlocked = (word) =>
    blocked.has(word) ||
    blockedEndings.some((ending) => word.endsWith(ending) && blocked.has(word.slice(0, -ending.length))) ||
    roots.some((rootWord) => word.includes(rootWord));

  const original = sources.get(language);
  const rankHere = new Map(original.map((word, rank) => [word, rank]).reverse());
  const ranksElsewhere = nameHints.map(
    (other) =>
      new Map(
        sources
          .get(other)
          .map((word, rank) => [word, rank])
          .reverse(),
      ),
  );
  const isMoreCommonElsewhere = (word) =>
    ranksElsewhere.some((ranks) => (ranks.get(word) ?? Infinity) < (rankHere.get(word) ?? Infinity));
  const usable = [...new Set(original.map(plain))]
    .filter((word) => alphabet.test(word) && looksLikeWord(word, shape))
    .filter((word) => Array.from(word).length >= MIN_LENGTH && Array.from(word).length <= MAX_LENGTH)
    .filter((word) => !isBlocked(word));
  // Words that lost a written accent (ahí → ahi) or look like names still count when typed, but go last, after the
  // common words the game asks for
  const written = new Set(original);
  const isOdd = (word) => !written.has(word) || isMoreCommonElsewhere(word);
  const dictionary = [...usable.filter((word) => !isOdd(word)), ...usable.filter(isOdd)];

  await writeFile(join(outputDir, `${language}.txt`), `${dictionary.join('\n')}\n`);
  console.log(`${language}: ${dictionary.length} words`);
}

await mkdir(outputDir, { recursive: true });
/** Each language's words as written, most common first */
const sources = new Map();
for (const language of Object.keys(LANGUAGES)) {
  sources.set(
    language,
    linesOf(await download(FREQUENCY_URL(language))).map((line) => line.split(' ')[0]),
  );
}
for (const [language, settings] of Object.entries(LANGUAGES)) {
  await build(language, settings, sources);
}
