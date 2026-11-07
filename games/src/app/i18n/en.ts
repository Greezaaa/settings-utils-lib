import { SiteMessages } from './site-messages';

export const EN: SiteMessages = {
  languageName: 'English',

  site: {
    skipToContent: 'Skip to content',
    sites: 'Sites',
    gamesNav: 'Games',
    settings: 'Settings',
    textSize: 'Text size',
    smallerText: 'Smaller text',
    largerText: 'Larger text',
    themeNames: { system: 'system', light: 'light', dark: 'dark', contrast: 'contrast', custom: 'custom' },
    themeSwitch: (current, next) => `Theme: ${current}. Switch to ${next}`,
    language: 'Language',
    madeBy: 'Made with ❤️ by',
    projectLinks: 'Project links',
  },

  games: {
    'math-games': {
      name: 'Math games',
      summary:
        'True or false, tap the answer, or find the missing signs. With or without a timer, from sums up to 20 to three-digit division. In English, Spanish and Basque.',
    },
  },

  home: {
    title: 'Smart games',
    lead: 'Short games that train quick thinking.',
    rule: 'Free, no sign-up, and they work on phones and tablets.',
    games: 'Games',
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
    coloursGroup: 'Colours',
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
    themes: {
      light: { name: 'Light', summary: 'The site’s light colours' },
      dark: { name: 'Dark', summary: 'The site’s dark colours' },
      ocean: { name: 'Ocean', summary: 'Deep blue with sunny yellow' },
      party: { name: 'Party', summary: 'Deep purple with white and yellow' },
      night: { name: 'Night', summary: 'Deep blue, mint and pink' },
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
