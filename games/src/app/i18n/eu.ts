import { SiteMessages } from './site-messages';

export const EU: SiteMessages = {
  languageName: 'Euskara',

  site: {
    skipToContent: 'Joan edukira',
    sites: 'Guneak',
    gamesNav: 'Jokoak',
    settings: 'Ezarpenak',
    textSize: 'Testuaren tamaina',
    smallerText: 'Testu txikiagoa',
    largerText: 'Testu handiagoa',
    themeNames: { system: 'sistema', light: 'argia', dark: 'iluna', contrast: 'kontrastea', custom: 'pertsonalizatua' },
    themeSwitch: (current, next) => `Gaia: ${current}. Aldatu honetara: ${next}`,
    language: 'Hizkuntza',
    madeBy: 'Maitasunez ❤️ egina:',
    projectLinks: 'Proiektuaren estekak',
  },

  games: {
    'math-games': {
      name: 'Matematika jokoak',
      summary:
        'Egia ala gezurra, sakatu erantzuna edo aurkitu falta diren zeinuak. Denborarekin edo gabe, 20 arteko batuketetatik hiru zifrako zatiketetara. Ingelesez, gaztelaniaz eta euskaraz.',
    },
  },

  home: {
    title: 'Joko adimentsuak',
    lead: 'Azkar pentsatzeko joko laburrak.',
    rule: 'Doan, izena eman gabe, eta mugikorretan eta tabletetan dabiltza.',
    games: 'Jokoak',
  },

  notFound: {
    title: 'Ups, orri hau ez dago hemen.',
    lead: 'Esteka zaharra edo gaizki idatzita egon daiteke.',
    back: 'Itzuli jokoetara',
    playInstead: 'Jokatu honetara',
  },

  page: {
    section: 'Joko adimentsuak',
    ages: '6 urtetik aurrera',
    title: 'Matematika jokoak',
    lead: 'Esan emaitza egia ala gezurra den, sakatu zuk emaitza edo aurkitu falta diren zeinuak. Denborarekin, erantzun barra amaitu baino lehen.',
    rule: 'Ez huts egin, bestela jokoa amaitzen da!',
    game: 'Jokoa',
  },

  settings: {
    answerStyleGroup: 'Nola erantzun',
    timerGroup: 'Denbora',
    coloursGroup: 'Koloreak',
    levelGroup: 'Maila',
    answerStyles: {
      'true-or-false': { name: 'Egia ala gezurra', summary: 'Esan emaitza zuzena den' },
      'your-answer': { name: 'Zure erantzuna', summary: 'Sakatu emaitza zenbaki-teklatuan' },
      'find-the-signs': { name: 'Aurkitu zeinuak', summary: 'Aukeratu + − × ÷ berdintza egia izan dadin' },
    },
    timers: {
      timer: { name: 'Denborarekin', summary: 'Erantzun barra amaitu baino lehen' },
      'no-timer': { name: 'Denborarik gabe', summary: 'Hartu behar duzun denbora; akats batek amaitzen du' },
    },
    levels: {
      easy: { name: 'Erraza', summary: 'Batu eta kendu 20 arte' },
      normal: { name: 'Normala', summary: 'Bi zifrako zenbakiak, erlojuan bezala' },
      hard: { name: 'Zaila', summary: 'Bi zifrako zenbakiak eta biderketa-taulak' },
      advanced: { name: 'Aurreratua', summary: 'Biderkatu eta zatitu zifra bateko zenbakiekin' },
      expert: { name: 'Aditua', summary: 'Bi eta hiru zifrako zenbakiak, lau eragiketak' },
    },
    signsLevels: {
      easy: { name: 'Erraza', summary: '+ eta − 20 arteko zenbakiekin' },
      normal: { name: 'Normala', summary: '+ eta − 50 arteko zenbakiekin' },
      hard: { name: 'Zaila', summary: '+, − eta ×; × lehenengo' },
      expert: { name: 'Aditua', summary: 'Lau zeinuak; bi edo hiru falta dira' },
    },
    themes: {
      light: { name: 'Argia', summary: 'Webgunearen kolore argiak' },
      dark: { name: 'Iluna', summary: 'Webgunearen kolore ilunak' },
      ocean: { name: 'Ozeanoa', summary: 'Itsas urdina eta eguzki horia' },
      party: { name: 'Festa', summary: 'More iluna, zuria eta horia' },
      night: { name: 'Gaua', summary: 'Itsas urdina, menda eta arrosa' },
    },
    bestScore: (best) => `Puntuazio onena: ${best}`,
    start: 'Hasi',
  },

  playing: {
    seconds: (seconds) => `${seconds} s`,
    noTimer: 'Denborarik gabe',
    score: (score) => `Puntuak ${score}`,
  },

  over: {
    outOfTime: 'Denbora amaitu da',
    notQuite: 'Ia-ia!',
    correctAnswers: () => 'erantzun zuzen',
    newRecord: 'errekor berria',
    best: (best) => `onena ${best}`,
    youAnswered: 'Zure erantzuna',
    rightAnswer: 'Erantzun zuzena hau zen',
    playAgain: 'Jokatu berriro',
    changeSettings: 'Aldatu aukerak',
  },

  trueOrFalse: {
    true: 'Egia',
    false: 'Gezurra',
    given: (saysTrue) => (saysTrue ? 'egia' : 'gezurra'),
    keys: 'Teklatua: ← gezurra, → egia',
  },

  yourAnswer: {
    answer: 'Zure erantzuna',
    numberPad: 'Zenbaki-teklatua',
    delete: 'Ezabatu',
    check: 'Egiaztatu',
    tapNumberFirst: 'Sakatu zenbaki bat lehenengo',
  },

  findTheSigns: {
    signs: 'Zeinuak',
    gap: (position, sign) => `${position}. zeinua: ${sign ?? 'hutsik'}`,
    deleteSign: 'Ezabatu zeinua',
    check: 'Egiaztatu',
    fillEveryGap: 'Bete hutsune guztiak lehenengo',
    tapGapToChange: 'Sakatu hutsune bat aldatzeko.',
    precedence: '× eta ÷ + eta − baino lehen kalkulatzen dira.',
    notWholeNumber: 'ez da zenbaki osoa',
  },
};
