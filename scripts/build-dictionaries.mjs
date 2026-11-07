// Builds the word builder's dictionaries for games.su-labs.dev: `npm run build:dictionaries`.
//
// Writes games/public/dictionaries/<language>.txt, one word per line, which the site downloads on demand (only the
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
 * Whether a word looks like a real word, not an abbreviation (bbc, cctv) or text broken in the subtitles
 * (бкьмб, бксйвют): it has a vowel, never 5 consonants in a row, and doesn't start with 4.
 */
function looksLikeWord(word, vowels) {
  const consonantRuns = word.split(new RegExp(`[${vowels}]+`));
  return (
    consonantRuns.length > 1 &&
    consonantRuns.every((run) => Array.from(run).length < 5) &&
    Array.from(consonantRuns[0]).length < 4
  );
}

/**
 * Per language: the letters a word may have (as in the game's word banks), its vowels, how to write words without the accent
 * marks the game has no buttons for, the LDNOOBW lists to block, and rude words of our own:
 * `words` are blocked as they are, `roots` wherever they appear in a word (only roots that are never part of a
 * harmless word).
 */
const LANGUAGES = {
  en: {
    alphabet: /^[a-z]+$/,
    vowels: 'aeiouy',
    blocklists: ['en'],
    words: ['crap', 'damn', 'hell', 'poop', 'kill', 'killer', 'killing', 'murder', 'suicide', 'drug', 'drugs'],
    roots: ['fuck', 'shit', 'bitch', 'whore', 'slut', 'cunt', 'nigg', 'faggot', 'dildo', 'porn', 'pussy'],
  },
  es: {
    alphabet: /^[a-zñ]+$/,
    vowels: 'aeiou',
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
    vowels: 'aeiou',
    blocklists: ['es'],
    words: ['puta', 'putak', 'kaka', 'hostia', 'ostia', 'joder', 'kabroi', 'kabroia', 'zakila', 'potorro', 'sexu'],
    roots: ['putakum', 'puttakum', 'mierda'],
  },
  uk: {
    alphabet: /^[абвгґдеєжзиіїйклмнопрстуфхцчшщьюя]+$/,
    vowels: 'аеиіоуєюяї',
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

async function build(language, { alphabet, vowels, plain = (word) => word, blocklists, words, roots }) {
  const blocked = new Set(words);
  for (const list of blocklists) {
    linesOf(await download(BLOCKLIST_URL(list))).forEach((entry) => blocked.add(plain(entry)));
  }
  // Plurals and simple endings of blocked words are blocked too
  const isBlocked = (word) =>
    blocked.has(word) ||
    blocked.has(word.replace(/e?s$/, '')) ||
    blocked.has(word.replace(/k$/, '')) ||
    roots.some((rootWord) => word.includes(rootWord));

  const source = linesOf(await download(FREQUENCY_URL(language))).map((line) => plain(line.split(' ')[0]));
  const dictionary = [...new Set(source)]
    .filter((word) => alphabet.test(word) && looksLikeWord(word, vowels))
    .filter((word) => Array.from(word).length >= MIN_LENGTH && Array.from(word).length <= MAX_LENGTH)
    .filter((word) => !isBlocked(word))
    .sort((first, second) => first.localeCompare(second, language));

  await writeFile(join(outputDir, `${language}.txt`), `${dictionary.join('\n')}\n`);
  console.log(`${language}: ${dictionary.length} words`);
}

await mkdir(outputDir, { recursive: true });
for (const [language, settings] of Object.entries(LANGUAGES)) {
  await build(language, settings);
}
