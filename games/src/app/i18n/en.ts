import { SiteMessages } from './site-messages';

export const EN: SiteMessages = {
  languageName: 'English',

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
        'True or false, tap the answer, or find the missing signs. With or without a timer, from sums up to 20 to three-digit division. In English, Spanish and Basque.',
      subtitle: 'true or false, number pad and missing signs',
      intro: 'A math game for kids.',
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
  },

  home: {
    title: 'Smart games, for smart kids',
    lead: 'Mini games that train logic, memory and quick thinking.',
    rule: 'They’re free, need no sign-up, and work on computers, tablets and phones.',
    games: 'Games',
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

  turnPicture: {
    lead: 'Tap a square to turn it a quarter. Turn every square until the drawing is right.',
    rule: 'In Memory mode, look carefully: the drawing hides once you press Ready!',
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
    board: 'Picture',
    tile: (number) => `Square ${number}`,
    picture: 'The drawing',
    memorize: 'Look carefully, then press Ready.',
    ready: 'Ready',
    turns: (turns) => `Turns ${turns}`,
    newGame: 'New game',
    solved: 'Well done!',
    solvedIn: (turns, time) => `Finished in ${turns} ${turns === 1 ? 'turn' : 'turns'} and ${time}`,
    best: (time) => `Best: ${time}`,
    newRecord: 'New record!',
  },

  pictures: {
    family: 'A child’s drawing of a mother and daughter holding hands, with the sun, the moon and clouds',
  },

  notFound: {
    title: 'Oops, this page isn’t here.',
    lead: 'The link may be old or mistyped.',
    back: 'Back to the games',
    playInstead: 'Play instead',
  },

  page: {
    section: 'Smart games',
    ages: 'Ages 6+',
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
};
