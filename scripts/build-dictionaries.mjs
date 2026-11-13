// and credited on the privacy page. Rude words are removed with the LDNOOBW lists (CC BY 4.0) and the lists below.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'games', 'public', 'dictionaries');

const FREQUENCY_URL = (language) =>
  `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/${language}/${language}_50k.txt`;
const BLOCKLIST_URL = (language) =>
  `https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/${language}`;

const MIN_LENGTH = 3;
const MAX_LENGTH = 10;

function looksLikeWord(word, { vowels, maxRun, maxLeading }) {
  const consonantRuns = word.split(new RegExp(`[${vowels}]+`));
  return (
    consonantRuns.length > 1 &&
    consonantRuns.every((run) => Array.from(run).length <= maxRun) &&
    Array.from(consonantRuns[0]).length <= maxLeading
  );
}

const LANGUAGES = {
  en: {
    alphabet: /^[a-z]+$/,
    shape: { vowels: 'aeiouy', maxRun: 4, maxLeading: 3 },
    blockedEndings: ['s', 'es'],
    nameHints: ['es'],
    blocklists: ['en'],
    words: ['crap', 'damn', 'hell', 'poop', 'kill', 'killer', 'killing', 'murder', 'suicide', 'drug', 'drugs'],
    roots: ['fuck', 'shit', 'bitch', 'whore', 'slut', 'cunt', 'nigg', 'faggot', 'dildo', 'porn', 'pussy'],
  },
  es: {
    alphabet: /^[a-zñ]+$/,
    shape: { vowels: 'aeiou', maxRun: 4, maxLeading: 2 },
    blockedEndings: ['s', 'es'],
    nameHints: ['en'],
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
    shape: { vowels: 'aeiou', maxRun: 4, maxLeading: 2 },
    blockedEndings: ['a', 'k', 'ak'],
    nameHints: ['en', 'es'],
    blocklists: ['es'],
    words: ['puta', 'putak', 'kaka', 'hostia', 'ostia', 'joder', 'kabroi', 'kabroia', 'zakila', 'potorro', 'sexu'],
    roots: ['putakum', 'puttakum', 'mierda'],
  },
  it: {
    alphabet: /^[a-z]+$/,
    shape: { vowels: 'aeiou', maxRun: 4, maxLeading: 3 },
    blockedEndings: [],
    nameHints: ['en', 'es'],
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
    shape: { vowels: 'аеиіоуєюяї', maxRun: 4, maxLeading: 3 },
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
  const written = new Set(original);
  const isOdd = (word) => !written.has(word) || isMoreCommonElsewhere(word);
  const dictionary = [...usable.filter((word) => !isOdd(word)), ...usable.filter(isOdd)];

  await writeFile(join(outputDir, `${language}.txt`), `${dictionary.join('\n')}\n`);
  console.log(`${language}: ${dictionary.length} words`);
}

await mkdir(outputDir, { recursive: true });
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
