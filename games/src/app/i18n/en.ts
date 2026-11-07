import { SiteMessages } from './site-messages';

export const EN: SiteMessages = {
  languageName: 'English',
  languageCode: 'EN',

  site: {
    skipToContent: 'Skip to content',
    sites: 'Sites',
    gamesNav: 'Games',
    settings: 'Settings',
    textSize: 'Text size',
    theme: 'Theme',
    smallerText: 'Smaller text',
    largerText: 'Larger text',
    themeNames: { system: 'system', light: 'light', dark: 'dark', contrast: 'contrast', custom: 'custom' },
    themeSwitch: (current, next) => `Theme: ${current}. Switch to ${next}`,
    language: 'Language',
    boardColours: 'Game colours',
    boardThemes: {
      light: { name: 'Light', summary: 'The site’s light colours' },
      dark: { name: 'Dark', summary: 'The site’s dark colours' },
      ocean: { name: 'Ocean', summary: 'Deep blue with sunny yellow' },
      party: { name: 'Party', summary: 'Deep purple with white and yellow' },
      night: { name: 'Night', summary: 'Deep blue, mint and pink' },
    },
    madeBy: 'Made with ❤️ by',
    projectLinks: 'Project links',
    privacyNotice:
      'We use cookies only to save your preferences, like theme, text size and language. We never sell or share your data with anyone. We love your privacy!',
    whatsNew: 'New since your last visit:',
    latestChanges: 'Latest updates:',
    updatedAt: (moment) => `Updated ${moment}`,
    lastUpdate: (moment) => `Last update: ${moment}`,
    noticeOk: 'OK',
    privacySettings: 'Privacy settings',
    privacyLink: 'Privacy',
    suggestionsLink: 'Suggest an idea',
  },

  seo: {
    locale: 'en_US',
    siteDescription:
      'Free mini games for kids that train logic, memory and quick thinking. No sign-up, for computers, tablets and phones.',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This page doesn’t exist.',
    previewImageAlt: 'su-labs games: Smart games, for smart kids',
  },

  games: {
    'math-games': {
      name: 'Math games',
      summary:
        'True or false, tap the answer, or find the missing signs. With or without a timer, from sums up to 20 to three-digit division. In English, Spanish, Basque and Ukrainian.',
      subtitle: 'true or false, number pad and missing signs',
      intro: 'A math game for kids.',
    },
    'letter-games': {
      name: 'Letter games',
      summary:
        'Learn the vowels, fill in the missing ones, put mixed letters in order, or make as many words as you can from 5 to 10 letters.',
      subtitle: 'vowels, mixed letters and word builder',
      intro: 'A letter and word game for kids.',
    },
    'sliding-puzzle': {
      name: 'Sliding puzzle',
      summary: 'Slide the tiles into the gap until the lines join up again. A new picture every game.',
      subtitle: 'slide the tiles and join the lines',
      intro: 'A puzzle game for kids.',
    },
    'turn-picture': {
      name: 'Turn the picture',
      summary: 'Tap the squares to turn them until the drawing is whole again. Look at it, or rebuild it from memory.',
      subtitle: 'tap to turn the squares and rebuild the drawing',
      intro: 'A picture puzzle for kids.',
    },
    'place-pieces': {
      name: 'Place the pieces',
      summary: 'Drag the pieces of the drawing back to their places. Look at it, or rebuild it from memory.',
      subtitle: 'drag the pieces and rebuild the drawing',
      intro: 'A picture puzzle for kids.',
    },
  },

  categories: { numbers: 'Numbers', letters: 'Letters', puzzles: 'Puzzles' },

  home: {
    title: 'Smart games, for smart kids',
    lead: 'Mini games that train logic, memory and quick thinking.',
    rule: 'They’re free, need no sign-up, and work on computers, tablets and phones.',
    betaLabel: 'Beta',
    betaText:
      'These games are in beta: this isn’t the final version yet, and things will keep changing. Soon you’ll be able to subscribe by email to hear about new games and updates.',
    madeByTitle: 'Made for kids, by kids',
    madeByText: 'More games are on the way. I make them together with my little one, Lucía, who draws the pictures.',
  },

  slidingPuzzle: {
    lead: 'Tap a tile next to the gap to slide it there. Put every tile back so the lines join into one picture.',
    rule: 'The gap is somewhere new every game!',
    board: 'Puzzle',
    levelGroup: 'Level',
    levels: {
      easy: { name: 'Easy', summary: '2 × 3 · 5 tiles' },
      normal: { name: 'Normal', summary: '3 × 3 · 8 tiles' },
      hard: { name: 'Hard', summary: '4 × 4 · 15 tiles' },
      expert: { name: 'Expert', summary: '5 × 5 · 24 tiles' },
    },
    goal: 'Goal',
    pictureGroup: 'Picture',
    pictureModes: { lines: 'Lines', drawing: 'Drawing' },
    moves: (moves) => `Moves ${moves}`,
    tile: (number) => `Tile ${number}`,
    newPuzzle: 'New puzzle',
    solved: 'Well done!',
    solvedIn: (moves, time) => `Finished in ${moves} ${moves === 1 ? 'move' : 'moves'} and ${time}`,
    best: (moves) => `Best: ${moves} moves`,
    newRecord: 'New record!',
    keys: 'Keyboard: the arrow keys slide a tile into the gap',
  },

  pictureGames: {
    modeGroup: 'Mode',
    modes: {
      look: { name: 'Look', summary: 'The drawing stays under the board' },
      memory: { name: 'Memory', summary: 'See it first, then rebuild it' },
    },
    levelGroup: 'Level',
    levels: {
      easy: { name: 'Easy', summary: '2 × 2 · 4 squares' },
      normal: { name: 'Normal', summary: '3 × 3 · 9 squares' },
      hard: { name: 'Hard', summary: '4 × 4 · 16 squares' },
      expert: { name: 'Expert', summary: '5 × 5 · 25 squares' },
    },
    picture: 'The drawing',
    memorize: 'Look carefully, then press Ready.',
    ready: 'Ready',
    inPlace: (placed, total) => `${placed} of ${total} in place`,
    newGame: 'New game',
    solved: 'Well done!',
    best: (time) => `Best: ${time}`,
    newRecord: 'New record!',
  },

  turnPicture: {
    lead: 'Tap a square to turn it a quarter. Turn every square until the drawing is right.',
    rule: 'In Memory mode, look carefully: the drawing hides once you press Ready!',
    board: 'Picture',
    tile: (number) => `Square ${number}`,
    turns: (turns) => `Turns ${turns}`,
    solvedIn: (turns, time) => `Finished in ${turns} ${turns === 1 ? 'turn' : 'turns'} and ${time}`,
  },

  placePieces: {
    lead: 'Drag a piece onto another to swap them, or tap two pieces. Put every piece in its place to finish the drawing.',
    rule: 'In Memory mode, look carefully: the drawing hides once you press Ready!',
    board: 'Picture',
    piece: (number, picked) => `Piece ${number}${picked ? ', picked up' : ''}`,
    swaps: (swaps) => `Moves ${swaps}`,
    solvedIn: (swaps, time) => `Finished in ${swaps} ${swaps === 1 ? 'move' : 'moves'} and ${time}`,
  },

  pictures: {
    family: 'A child’s drawing of a mother and daughter holding hands, with the sun, the moon and clouds',
  },

  privacy: {
    title: 'Privacy',
    lead: 'This site is for kids, so it saves as little as possible. Here’s exactly what it saves, where, and why.',
    savedTitle: 'What we save',
    columns: { what: 'What', where: 'Where', why: 'Why' },
    saved: [
      {
        what: 'Theme and text size',
        where: 'A cookie for su-labs.dev',
        why: 'So su-labs.dev and these games look the way you chose',
      },
      { what: 'Language', where: 'This browser’s local storage', why: 'So the games open in your language' },
      { what: 'Game colours and settings', where: 'Local storage', why: 'So the games remember your choices' },
      { what: 'Best scores', where: 'Local storage', why: 'So you can beat your records' },
      { what: 'Notices you’ve seen', where: 'Local storage', why: 'So we don’t show them again' },
      { what: 'Games you rated', where: 'Local storage', why: 'So we don’t ask again' },
    ],
    differenceTitle: 'Cookies and local storage',
    difference:
      'A cookie is sent to our server with every visit; local storage stays in this browser and is never sent anywhere. We use one cookie, only to share your theme and text size with su-labs.dev, and the server doesn’t read it.',
    sentTitle: 'What the games send',
    sentLead:
      'To show what’s popular and to improve the games, they send a few things to our server, api.su-labs.dev. None of it says who you are.',
    sent: [
      'A count of games played, per game and day',
      'Your 👍 or 👎 for a game and its reason, if you choose one',
      'Words you report as rude in the word builder',
      'Suggestions you send, with their picture (cleaned of hidden information)',
      'Your internet address is only used for a few minutes to stop spam, and is never saved',
    ],
    neverTitle: 'What we never do',
    never: ['No accounts and no personal data', 'No ads and no tracking', 'Nothing is sold or shared with anyone'],
    choiceTitle: 'Your choice',
    choiceLabel: 'Remember my preferences on this device',
    choiceOn: 'Your preferences are saved on this device.',
    choiceOff: 'Nothing is saved: settings go back to their defaults on every visit. Only this choice is remembered.',
    deleteSaved: 'Delete my saved data',
    deleted: 'Done: everything this site saved on this device is deleted.',
  },

  notFound: {
    title: 'Oops, this page isn’t here.',
    lead: 'The link may be old or mistyped.',
    back: 'Back to the games',
    playInstead: 'Play instead',
  },

  page: {
    section: 'Smart games',
    ages: (age) => `Ages ${age}+`,
    new: 'New',
    popular: 'Popular',
    title: 'Math games',
    lead: 'Say whether the result is true or false, tap the result yourself, or find the missing signs. With the timer on, answer before the bar runs out.',
    rule: 'Don’t miss one, or the game is over!',
    game: 'Game',
  },

  settings: {
    answerStyleGroup: 'How to answer',
    timerGroup: 'Timer',
    levelGroup: 'Level',
    answerStyles: {
      'true-or-false': { name: 'True or false', summary: 'Say whether the result shown is right' },
      'your-answer': { name: 'Your answer', summary: 'Tap the result on the number pad' },
      'find-the-signs': { name: 'Find the signs', summary: 'Pick + − × ÷ to make the equation true' },
    },
    timers: {
      timer: { name: 'Timer', summary: 'Answer before the bar runs out' },
      'no-timer': { name: 'No timer', summary: 'Take your time, one mistake ends it' },
    },
    levels: {
      easy: { name: 'Easy', summary: 'Add and subtract up to 20' },
      normal: { name: 'Normal', summary: 'Two-digit numbers, like the watch' },
      hard: { name: 'Hard', summary: 'Two-digit numbers and times tables' },
      advanced: { name: 'Advanced', summary: 'Multiply and divide with one-digit numbers' },
      expert: { name: 'Expert', summary: 'Two- and three-digit numbers, all four operations' },
    },
    signsLevels: {
      easy: { name: 'Easy', summary: '+ and − with numbers up to 20' },
      normal: { name: 'Normal', summary: '+ and − with numbers up to 50' },
      hard: { name: 'Hard', summary: '+, − and ×, with × done first' },
      expert: { name: 'Expert', summary: 'All four signs, two or three missing' },
    },
    bestScore: (best) => `Best score: ${best}`,
    start: 'Start',
  },

  playing: {
    seconds: (seconds) => `${seconds}s`,
    noTimer: 'No timer',
    score: (score) => `Score ${score}`,
  },

  over: {
    outOfTime: 'Out of time',
    notQuite: 'Not quite',
    correctAnswers: (score) => (score === 1 ? 'correct answer' : 'correct answers'),
    newRecord: 'new record',
    best: (best) => `best ${best}`,
    youAnswered: 'You answered',
    rightAnswer: 'The right answer was',
    playAgain: 'Play again',
    changeSettings: 'Change settings',
  },

  trueOrFalse: {
    true: 'True',
    false: 'False',
    given: (saysTrue) => (saysTrue ? 'true' : 'false'),
    keys: 'Keyboard: ← for false, → for true',
  },

  yourAnswer: {
    answer: 'Your answer',
    numberPad: 'Number pad',
    delete: 'Delete',
    check: 'Check',
    tapNumberFirst: 'Tap a number first',
  },

  findTheSigns: {
    signs: 'Signs',
    gap: (position, sign) => `Sign ${position}: ${sign ?? 'empty'}`,
    deleteSign: 'Delete sign',
    check: 'Check',
    fillEveryGap: 'Fill every gap first',
    tapGapToChange: 'Tap a gap to change it.',
    precedence: '× and ÷ are worked out before + and −.',
    notWholeNumber: 'not a whole number',
  },

  suggestions: {
    title: 'Suggest an idea',
    lead: 'Tell us about a game you’d like, something to improve, or send a drawing for the games. We read every message.',
    noPersonalData:
      'Don’t write your name, address, school or anything else about you. Ask a grown-up to help if you like.',
    categoryLabel: 'What is it about?',
    categories: {
      'new-game': 'A new game',
      improvement: 'An improvement',
      drawing: 'A drawing',
      problem: 'A problem',
      other: 'Something else',
    },
    textLabel: 'Your idea',
    imageLabel: 'A picture (optional)',
    imageHint: 'It is made smaller and cleaned of hidden information (like where it was taken) before it’s sent.',
    imageAlt: 'The picture you chose',
    imageError: 'That picture can’t be used. Try another one.',
    removeImage: 'Remove',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Thanks! Your idea was sent.',
    failed: 'It didn’t send. Try again later.',
  },

  feedback: {
    question: 'Do you like this game?',
    votes: { up: 'I like it', down: 'I don’t like it' },
    why: 'Why? (optional)',
    reasons: {
      fun: 'It’s fun',
      learned: 'I learned something',
      'too-easy': 'Too easy',
      'too-hard': 'Too hard',
      boring: 'Boring',
      confusing: 'Hard to understand',
      bug: 'Something doesn’t work',
    },
    justSend: 'Just send',
    sending: 'Sending…',
    thanks: 'Thanks for telling us!',
    failed: 'It didn’t send. Try again later.',
  },

  letterGames: {
    lead: 'Learn the vowels, fill in the missing ones, put mixed letters in order, or make as many words as you can.',
    rule: 'In the word builder, any real word counts, checked with a dictionary that downloads only when you play it.',
    board: 'Letter game',
    modeGroup: 'Game',
    modes: {
      'first-vowel': { name: 'First vowel', summary: 'Tap the vowel the word starts with' },
      'missing-vowels': { name: 'Missing vowels', summary: 'Fill in every vowel of the word' },
      'mixed-letters': { name: 'Mixed letters', summary: 'Put the letters in order; the words get longer' },
      'word-builder': { name: 'Word builder', summary: 'Make as many words as you can' },
    },
    levelGroup: 'Letters',
    builderLevels: {
      easy: { name: 'Easy', summary: '5 letters' },
      normal: { name: 'Normal', summary: '7 letters' },
      hard: { name: 'Hard', summary: '10 letters' },
    },
    timers: {
      timer: 'Finish each word before the bar runs out; in the word builder, find words until it does',
      'no-timer': 'Take your time',
    },
    hintsGroup: 'Hints',
    hints: {
      hints: {
        name: 'With hints',
        summary: 'After 2 mistakes the next letter lights up; after 5 and 10, the first letters are placed for you',
      },
      'no-hints': { name: 'No hints', summary: 'Work it out on your own' },
    },
    instructions: {
      'first-vowel': 'Which vowel does it start with?',
      'missing-vowels': 'Tap the missing vowels, in order',
      'mixed-letters': 'Tap the letters in the right order',
      'word-builder': 'Tap letters to make a word, then Check',
    },
    progress: (word, total) => `Word ${word} of ${total}`,
    mistakes: (mistakes) => `Mistakes ${mistakes}`,
    gap: 'Missing letter',
    letters: 'Letters',
    answer: 'Your word',
    delete: 'Delete',
    check: 'Check',
    found: (found, total) => `Found ${found} of ${total}`,
    checks: {
      found: 'Well found!',
      'already-found': 'You already have that one',
      'too-short': 'Use at least 3 letters',
      bonus: 'A real word! Bonus',
      unknown: 'We don’t know that word',
    },
    bonusWords: (count) => `Bonus words: ${count}`,
    dictionary: {
      loading: 'Downloading the dictionary…',
      why: 'The first time you play, we download the dictionary of your language (about 100 KB) to check your words. Your browser keeps it for next time.',
      failed: 'The dictionary didn’t download, so only the hidden words count.',
      credit: 'Dictionary: FrequencyWords (Hermit Dave), CC BY-SA 4.0',
    },
    report: 'Report this word',
    reportThanks: 'Thanks! We’ll check that word.',
    newLetters: 'New letters',
    allFound: 'You found them all!',
    solved: 'Well done!',
    summary: (words, mistakes) => `${words} words · ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}`,
  },
};
