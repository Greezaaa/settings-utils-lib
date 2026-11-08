import { SiteMessages } from './site-messages';

/** Room nicknames: an adjective and an animal, by number */
const ADJECTIVES = [
  'Brave',
  'Happy',
  'Quick',
  'Clever',
  'Kind',
  'Bright',
  'Calm',
  'Funny',
  'Gentle',
  'Lucky',
  'Mighty',
  'Shiny',
  'Sunny',
  'Smart',
  'Jolly',
  'Cool',
];
const ANIMALS = [
  'Fox',
  'Bear',
  'Panda',
  'Tiger',
  'Lion',
  'Owl',
  'Penguin',
  'Dolphin',
  'Rabbit',
  'Turtle',
  'Koala',
  'Otter',
  'Hedgehog',
  'Squirrel',
  'Elephant',
  'Giraffe',
];

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
    themeNames: {
      system: 'system',
      light: 'light',
      dark: 'dark',
      contrast: 'contrast',
      custom: 'custom',
    },
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
    lastUpdate: moment => `Last update: ${moment}`,
    noticeOk: 'OK',
    privacySettings: 'Privacy settings',
    privacyLink: 'Privacy',
    suggestionsLink: 'Suggestion box',
    loading: 'Loading…',
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
    'measure-it': {
      name: 'Measure it',
      summary:
        'Read and make angles on a protractor, tell how full the glass is, and find the number on a line.',
      subtitle: 'angles, fractions and number lines',
      intro: 'A measuring game for kids.',
    },
    'letter-games': {
      name: 'Letter games',
      summary:
        'Learn the vowels, fill in the missing ones, put mixed letters in order, or make as many words as you can from 5 to 10 letters.',
      subtitle: 'vowels, mixed letters and word builder',
      intro: 'A letter and word game for kids.',
    },
    'hit-the-note': {
      name: 'Hit the note',
      summary:
        'Find the note you hear, tell whether the tune goes higher or lower, or sing the note into the microphone. Train your ear and your voice.',
      subtitle: 'find the note, higher or lower, and sing it',
      intro: 'A music game for kids.',
    },
    'sliding-puzzle': {
      name: 'Sliding puzzle',
      summary:
        'Slide the tiles into the gap until the lines join up again. A new picture every game.',
      subtitle: 'slide the tiles and join the lines',
      intro: 'A puzzle game for kids.',
    },
    'turn-picture': {
      name: 'Turn the picture',
      summary:
        'Tap the squares to turn them until the drawing is whole again. Look at it, or rebuild it from memory.',
      subtitle: 'tap to turn the squares and rebuild the drawing',
      intro: 'A picture puzzle for kids.',
    },
    'place-pieces': {
      name: 'Place the pieces',
      summary:
        'Drag the pieces of the drawing back to their places. Look at it, or rebuild it from memory.',
      subtitle: 'drag the pieces and rebuild the drawing',
      intro: 'A picture puzzle for kids.',
    },
  },

  categories: {
    numbers: 'Numbers',
    letters: 'Letters',
    music: 'Music',
    puzzles: 'Puzzles',
  },

  home: {
    title: 'Smart games, for smart kids',
    lead: 'Mini games that train logic, memory and quick thinking.',
    rule: 'They’re free, need no sign-up, and work on computers, tablets and phones.',
    betaLabel: 'Beta',
    betaText:
      'These games are in beta: this isn’t the final version yet, and things will keep changing. Soon you’ll be able to subscribe by email to hear about new games and updates.',
    whatsNewTitle: 'What’s new',
    showMore: 'Show more updates',
    showFewer: 'Show fewer',
    madeByTitle: 'Made for kids, by kids',
    madeByText:
      'More games are on the way. I make them together with my little one, Lucía, who draws the pictures.',
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
    moves: moves => `Moves ${moves}`,
    tile: number => `Tile ${number}`,
    newPuzzle: 'New puzzle',
    solved: 'Well done!',
    solvedIn: (moves, time) =>
      `Finished in ${moves} ${moves === 1 ? 'move' : 'moves'} and ${time}`,
    best: moves => `Best: ${moves} moves`,
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
    best: time => `Best: ${time}`,
    newRecord: 'New record!',
  },

  turnPicture: {
    lead: 'Tap a square to turn it a quarter. Turn every square until the drawing is right.',
    rule: 'In Memory mode, look carefully: the drawing hides once you press Ready!',
    board: 'Picture',
    tile: number => `Square ${number}`,
    turns: turns => `Turns ${turns}`,
    solvedIn: (turns, time) =>
      `Finished in ${turns} ${turns === 1 ? 'turn' : 'turns'} and ${time}`,
  },

  placePieces: {
    lead: 'Drag a piece onto another to swap them, or tap two pieces. Put every piece in its place to finish the drawing.',
    rule: 'In Memory mode, look carefully: the drawing hides once you press Ready!',
    board: 'Picture',
    piece: (number, picked) => `Piece ${number}${picked ? ', picked up' : ''}`,
    swaps: swaps => `Moves ${swaps}`,
    solvedIn: (swaps, time) =>
      `Finished in ${swaps} ${swaps === 1 ? 'move' : 'moves'} and ${time}`,
  },

  pictures: {
    family:
      'A child’s drawing of a mother and daughter holding hands, with the sun, the moon and clouds',
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
      {
        what: 'Language',
        where: 'This browser’s local storage',
        why: 'So the games open in your language',
      },
      {
        what: 'Game colours and settings',
        where: 'Local storage',
        why: 'So the games remember your choices',
      },
      {
        what: 'Best scores',
        where: 'Local storage',
        why: 'So you can beat your records',
      },
      {
        what: 'Notices and news you’ve seen',
        where: 'Local storage',
        why: 'So we don’t show notices again, and can mark what’s new',
      },
      {
        what: 'Games you rated',
        where: 'Local storage',
        why: 'So we don’t ask again',
      },
      {
        what: 'Admin sign-in (the admin team only)',
        where: 'A cookie for api.su-labs.dev',
        why: 'To keep admins signed in for 30 days; visitors never get it',
      },
      {
        what: 'Your seat in a room',
        where: 'This tab only (session storage)',
        why: 'So a reload brings you back to the room; it’s gone when the tab closes',
      },
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
      'In a room: only your moves (ready, settings, score) go to rooms.su-labs.dev, under a made-up name; nothing is kept once the room closes',
    ],
    neverTitle: 'What we never do',
    never: [
      'No accounts and no personal data',
      'No ads and no tracking',
      'Nothing is sold or shared with anyone',
      'The microphone is only used while you play Sing it, and the sound is never recorded or sent',
    ],
    choiceTitle: 'Your choice',
    choiceLabel: 'Remember my preferences on this device',
    choiceOn: 'Your preferences are saved on this device.',
    choiceOff:
      'Nothing is saved: settings go back to their defaults on every visit. Only this choice is remembered.',
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
    ages: age => `Ages ${age}+`,
    new: 'New',
    popular: 'Popular',
    hidden: 'Hidden',
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
      'true-or-false': {
        name: 'True or false',
        summary: 'Say whether the result shown is right',
      },
      'your-answer': {
        name: 'Your answer',
        summary: 'Tap the result on the number pad',
      },
      'find-the-signs': {
        name: 'Find the signs',
        summary: 'Pick + − × ÷ to make the equation true',
      },
    },
    timers: {
      timer: { name: 'Timer', summary: 'Answer before the bar runs out' },
      'no-timer': {
        name: 'No timer',
        summary: 'Take your time, one mistake ends it',
      },
    },
    levels: {
      easy: { name: 'Easy', summary: 'Add and subtract up to 20' },
      normal: { name: 'Normal', summary: 'Two-digit numbers, like the watch' },
      hard: { name: 'Hard', summary: 'Two-digit numbers and times tables' },
      advanced: {
        name: 'Advanced',
        summary: 'Multiply and divide with one-digit numbers',
      },
      expert: {
        name: 'Expert',
        summary: 'Two- and three-digit numbers, all four operations',
      },
    },
    signsLevels: {
      easy: { name: 'Easy', summary: '+ and − with numbers up to 20' },
      normal: { name: 'Normal', summary: '+ and − with numbers up to 50' },
      hard: { name: 'Hard', summary: '+, − and ×, with × done first' },
      expert: {
        name: 'Expert',
        summary: 'All four signs, two or three missing',
      },
    },
    bestScore: best => `Best score: ${best}`,
    start: 'Start',
  },

  playing: {
    seconds: seconds => `${seconds}s`,
    noTimer: 'No timer',
    score: score => `Score ${score}`,
  },

  over: {
    outOfTime: 'Out of time',
    notQuite: 'Not quite',
    correctAnswers: score =>
      score === 1 ? 'correct answer' : 'correct answers',
    newRecord: 'new record',
    best: best => `best ${best}`,
    youAnswered: 'You answered',
    rightAnswer: 'The right answer was',
    playAgain: 'Play again',
    changeSettings: 'Change settings',
  },

  trueOrFalse: {
    true: 'True',
    false: 'False',
    given: saysTrue => (saysTrue ? 'true' : 'false'),
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
    title: 'Suggestion box',
    lead: 'Got a game in mind you’d like to see here, want to share your drawings, or spotted a mistake?',
    rule: 'Tell us: your opinion matters and helps us improve.',
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
    imageHint:
      'Your privacy matters to us: before sending the picture, your browser removes its metadata (like where and when it was taken, or the camera model) and makes it smaller.',
    chooseImage: 'Drag a picture here, or click to choose one',
    dropHere: 'Drop it here',
    imageTypes:
      'Photos and drawings from your phone or computer (JPG, PNG, HEIC…)',
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
      'first-vowel': {
        name: 'First vowel',
        summary: 'Tap the vowel the word starts with',
      },
      'missing-vowels': {
        name: 'Missing vowels',
        summary: 'Fill in every vowel of the word',
      },
      'mixed-letters': {
        name: 'Mixed letters',
        summary: 'Put the letters in order; the words get longer',
      },
      'word-builder': {
        name: 'Word builder',
        summary: 'Make as many words as you can',
      },
    },
    levelGroup: 'Letters',
    builderLevels: {
      easy: { name: 'Easy', summary: '5 letters' },
      normal: { name: 'Normal', summary: '7 letters' },
      hard: { name: 'Hard', summary: '10 letters' },
    },
    timers: {
      timer:
        'Finish each word before the bar runs out; in the word builder, find words until it does',
      'no-timer': 'Take your time',
    },
    hintsGroup: 'Hints',
    hints: {
      hints: {
        name: 'With hints',
        summary:
          'After 2 mistakes the next letter lights up; after 5 and 10, the first letters are placed for you',
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
    mistakes: mistakes => `Mistakes ${mistakes}`,
    gap: 'Missing letter',
    letters: 'Letters',
    answer: 'Your word',
    delete: 'Delete',
    check: 'Check',
    keys: 'You can type the letters on your keyboard too; Backspace takes one back',
    builderKeys:
      'Type letters on your keyboard: Backspace deletes, Enter checks',
    found: (found, total) => `Found ${found} of ${total}`,
    checks: {
      found: 'Well found!',
      'already-found': 'You already have that one',
      'too-short': 'Use at least 3 letters',
      unknown: 'We don’t know that word',
    },
    showWords: 'Show the words',
    wordsShown: 'Here are all the words',
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
    summary: (words, mistakes) =>
      `${words} words · ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}`,
  },

  measureIt: {
    lead: 'Angles on a protractor, glasses of water and number lines.',
    rule: 'Look closely, answer, and press Check. Ten in a row.',
    board: 'Measure it',
    modeGroup: 'What to measure',
    modes: {
      'read-angle': {
        name: 'Read the angle',
        summary: 'How many degrees does the angle have?',
      },
      'set-angle': {
        name: 'Make the angle',
        summary: 'Turn the line until it makes the angle asked.',
      },
      'fill-glass': {
        name: 'Glass of water',
        summary: 'How full is the glass: 1/2, 1/3, 3/4…?',
      },
      'number-line': {
        name: 'Number line',
        summary: 'Which number is at the x?',
      },
    },
    levels: { easy: 'Easy', normal: 'Normal', hard: 'Hard', expert: 'Expert' },
    levelSummaries: {
      'read-angle': {
        easy: 'Every 30°',
        normal: 'Every 10°',
        hard: 'Every 5°',
        expert: 'Any angle, 2° off at most',
      },
      'set-angle': {
        easy: 'Every 30°, with numbers',
        normal: 'Every 10°, marks without numbers',
        hard: 'Every 5°, only the right angle marked',
        expert: 'Any angle, no marks',
      },
      'fill-glass': {
        easy: 'Halves and quarters',
        normal: 'Halves, thirds and quarters',
        hard: 'Up to eighths',
        expert: 'More than one glass',
      },
      'number-line': {
        easy: 'Steps of 1',
        normal: 'Steps of 2 and 5',
        hard: 'Steps of 10, 25 and 50',
        expert: 'Halves, quarters and numbers below zero',
      },
    },
    whichAngle: 'How many degrees?',
    makeAngle: angle => `Make ${angle}°`,
    howFull: 'How full is it?',
    whichNumber: 'Which number is x?',
    yourAnswer: 'Your answer',
    check: 'Check',
    right: 'Right!',
    wrong: answer => `Not quite: it was ${answer}`,
    progress: (exercise, total) => `${exercise} of ${total}`,
    done: 'All done',
    summary: (right, total) => `${right} of ${total} right`,
  },

  hitTheNote: {
    lead: 'Find the note you hear, say whether the second note is higher or lower, or sing it into the microphone.',
    rule: 'Sing it uses the microphone only while you play: the sound stays on your device and is never recorded.',
    board: 'Music game',
    modeGroup: 'Game',
    modes: {
      'find-the-note': {
        name: 'Find the note',
        summary: 'Hear a note and tap its name',
      },
      'higher-or-lower': {
        name: 'Higher or lower',
        summary: 'Hear two notes: does the second go up or down?',
      },
      'sing-it': { name: 'Sing it', summary: 'Hear a note and sing it back' },
    },
    levelGroup: 'Level',
    levels: {
      easy: {
        name: 'Easy',
        summary: 'C, D and E · big jumps · easy to sing in tune',
      },
      normal: { name: 'Normal', summary: 'C to G · smaller jumps' },
      hard: { name: 'Hard', summary: 'The whole scale, C to B · close notes' },
      expert: {
        name: 'Expert',
        summary:
          'All 12 notes, sharps too · one step apart · sing very precisely',
      },
    },
    instructions: {
      'find-the-note': 'Which note is it?',
      'higher-or-lower': 'Is the second note higher or lower?',
      'sing-it': 'Listen, then sing the note and hold it',
    },
    progress: (round, total) => `Round ${round} of ${total}`,
    mistakes: mistakes => `Mistakes ${mistakes}`,
    noteNames: {
      C: 'C',
      'C#': 'C♯',
      D: 'D',
      'D#': 'D♯',
      E: 'E',
      F: 'F',
      'F#': 'F♯',
      G: 'G',
      'G#': 'G♯',
      A: 'A',
      'A#': 'A♯',
      B: 'B',
    },
    notes: 'Notes',
    listen: 'Listen again',
    listenTwo: 'Listen to both again',
    directions: {
      higher: 'Higher',
      lower: 'Lower',
    },
    startSinging: 'Start singing',
    micPrivacy:
      'Your browser will ask to use the microphone. The sound stays on this device: it is never recorded or sent.',
    micAsking: 'Waiting for the microphone…',
    micDenied:
      'The microphone is blocked. Allow it in your browser, or skip this round.',
    micUnavailable:
      'No microphone found on this device. You can skip the rounds.',
    meter: 'How close your voice is to the note',
    singHints: {
      done: 'In tune! Well done!',
      silent: 'Sing now: “aaah”…',
      hold: 'That’s it, hold it…',
      low: 'A little higher ⬆',
      high: 'A little lower ⬇',
    },
    skip: 'Skip',
    solved: 'Well done!',
    summary: (right, total) => `${right} of ${total} right at the first try`,
  },

  admin: {
    title: 'Admin',
    lead: 'Switch games on or off, see what’s played, and moderate suggestions and reported words.',
    email: 'Email',
    password: 'Password',
    wrongCredentials: 'Wrong email or password.',
    offline: 'The API can’t be reached right now. Try again later.',
    checking: 'Checking…',
    signIn: 'Sign in',
    signOut: 'Sign out',
    tabs: {
      games: 'Games',
      plays: 'Plays and feedback',
      suggestions: 'Suggestions',
      words: 'Reported words',
      team: 'Team',
      account: 'Account',
    },
    saveFailed: 'That change didn’t save. Check the API and try again.',
    loading: 'Loading…',
    previewTitle: 'Preview mode',
    previewHelp: hiddenBadge =>
      `This browser shows every game, open or not, marked “${hiddenBadge}” when hidden.`,
    gamesTitle: 'Games',
    open: 'Open to everyone',
    hidden: 'Hidden from the public',
    byDefault: open => `default: ${open ? 'open' : 'hidden'}`,
    playsPeriod: total => `Last 30 days · ${total} plays in all`,
    refresh: 'Refresh',
    playsColumns: { game: 'Game', plays: 'Plays', reasons: 'Reasons' },
    suggestionStatuses: { new: 'New', read: 'Read', archived: 'Archived' },
    showPicture: 'Show picture',
    pictureAlt: 'Picture sent with the suggestion',
    moveTo: status => `Move to ${status}`,
    delete: 'Delete',
    confirmDelete: 'Delete this suggestion and its picture for good?',
    noSuggestions: 'No suggestions here.',
    reportStatuses: {
      pending: 'Waiting',
      approved: 'Kept out',
      rejected: 'Counting again',
    },
    reportsHelp:
      'A word reported 3 times stops counting in the word builder until you decide.',
    reportColumns: {
      word: 'Word',
      language: 'Language',
      reports: 'Reports',
      firstReported: 'First reported',
    },
    keepOut: 'Keep out',
    letCount: 'Let it count',
    noWords: 'No words here.',
    featuresTitle: 'Features',
    featuresHelp:
      'New features start switched off: try them in preview, then open them to everyone.',
    featureNames: {
      rooms: 'Play together (rooms)',
      'rooms-math-games': 'Math games in rooms',
      'rooms-measure-it': 'Measure it in rooms',
    },
    multiplayerTitle: 'Multiplayer games',
    multiplayerHelp:
      'Each game has its own switch for rooms, apart from playing alone: a game can be open on its own and still closed in rooms.',
    addMember: 'Add a team member',
    roleLabel: 'Role',
    roleHelp: {
      moderator:
        'Reads suggestions, decides on reported words, and sees plays and feedback.',
      tester:
        'Like a moderator, and also sees every game and feature in preview, even those switched off.',
    },
    makeTester: 'Make tester',
    makeModerator: 'Make moderator',
    startingPassword: 'Starting password (optional)',
    startingPasswordHelp:
      'Leave it empty to get an invite link instead: they choose their own password.',
    add: 'Add',
    alreadyOnTeam: 'Someone with that email is already on the team.',
    inviteFor: email =>
      `Invite link for ${email}: copy it and send it to them.`,
    copy: 'Copy',
    copied: 'Copied',
    inviteExpires: day => `Works once, until ${day}.`,
    roles: { super: 'Super admin', moderator: 'Moderator', tester: 'Tester' },
    invited: 'Invited, no password yet',
    active: 'Active',
    inactive: 'Deactivated',
    newLink: 'New invite link',
    activate: 'Activate',
    deactivate: 'Deactivate',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    repeatPassword: 'Repeat the new password',
    passwordRule: min => `At least ${min} characters.`,
    passwordChanged:
      'Password changed. Other browsers signed in with your account were signed out.',
    wrongPassword: 'The current password is wrong.',
    passwordsDiffer: 'The two passwords are different.',
    inviteTitle: 'Join the admin team',
    inviteLead: email => `Choose a password for ${email}.`,
    acceptInvite: 'Save and sign in',
    inviteInvalid: 'This invite link doesn’t work any more. Ask for a new one.',
  },

  rooms: {
    navLink: 'Play together',
    title: 'Play together',
    lead: 'Play the same game at the same time with up to 3 friends, each on their own device.',
    rule: 'Create a room and share its code, or join one with a code.',
    create: 'Create a room',
    joinTitle: 'Join a room',
    codeLabel: 'Room code',
    join: 'Join',
    homeTitle: 'Play together',
    homeText:
      'Up to 4 players, the same exercises at the same time. Who gets the most right?',
    errors: {
      'not-found':
        'There’s no room with that code. Check it, or ask for a new one.',
      full: 'That room is full: it already has 4 players.',
      'in-game':
        'That room is playing right now. Try again when the round ends.',
      'not-host': 'Only the room’s host can do that.',
      'not-ready': 'Everyone has to be ready first, with at least 2 players.',
      'wrong-phase': 'That can’t be done right now.',
      invalid: 'That code doesn’t look right: it has 6 letters and numbers.',
      'too-many': 'Too many tries. Wait a minute and try again.',
      offline:
        'Can’t reach the rooms right now. Check your connection and try again.',
    },
    connecting: 'Connecting…',
    reconnecting: 'Reconnecting…',
    roomCode: 'Room code',
    copyLink: 'Copy link',
    copied: 'Copied',
    players: (count, max) => `Players ${count}/${max}`,
    host: 'Host',
    you: 'You',
    ready: 'Ready',
    notReady: 'Not ready',
    away: 'Away',
    imReady: 'I’m ready',
    notReadyYet: 'Not ready yet',
    start: 'Start',
    needPlayers: min => `At least ${min} players are needed.`,
    waitingForReady: 'Waiting for everyone to be ready…',
    waitingForHost: 'Waiting for the host to start…',
    settingsTitle: 'Game settings',
    gameGroup: 'Game',
    roundLength: 'Round length',
    showScores: 'Scores during the round',
    scoresShown: 'Show scores',
    scoresHidden: 'Scores only at the end',
    seconds: seconds => `${seconds} s`,
    getReady: 'Get ready!',
    timeLeft: seconds => `${seconds} s left`,
    yourScore: score => `Your score: ${score}`,
    resultsTitle: 'Results',
    place: place => `#${place}`,
    points: points => `${points} ${points === 1 ? 'point' : 'points'}`,
    playAgain: 'Play again',
    leave: 'Leave the room',
    kick: 'Remove',
    kicked: 'The host removed you from the room.',
    gameUnavailable: 'This game isn’t open for rooms right now.',
    animals: ANIMALS,
    nickname: (adjective, animal) =>
      `${ADJECTIVES[adjective]} ${ANIMALS[animal]}`,
  },
};
