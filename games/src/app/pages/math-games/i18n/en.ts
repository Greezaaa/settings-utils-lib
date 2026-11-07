import { GameMessages } from './game-messages';

export const EN: GameMessages = {
  languageName: 'English',

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
    languageGroup: 'Language',
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
