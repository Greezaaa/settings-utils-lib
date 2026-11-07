import { SiteMessages } from './site-messages';

export const EU: SiteMessages = {
  languageName: 'Euskara',
  languageCode: 'EU',

  site: {
    skipToContent: 'Joan edukira',
    sites: 'Guneak',
    gamesNav: 'Jokoak',
    settings: 'Ezarpenak',
    textSize: 'Testuaren tamaina',
    theme: 'Gaia',
    smallerText: 'Testu txikiagoa',
    largerText: 'Testu handiagoa',
    themeNames: { system: 'sistema', light: 'argia', dark: 'iluna', contrast: 'kontrastea', custom: 'pertsonalizatua' },
    themeSwitch: (current, next) => `Gaia: ${current}. Aldatu honetara: ${next}`,
    language: 'Hizkuntza',
    boardColours: 'Jokoaren koloreak',
    boardThemes: {
      light: { name: 'Argia', summary: 'Webgunearen kolore argiak' },
      dark: { name: 'Iluna', summary: 'Webgunearen kolore ilunak' },
      ocean: { name: 'Ozeanoa', summary: 'Itsas urdina eta eguzki horia' },
      party: { name: 'Festa', summary: 'More iluna, zuria eta horia' },
      night: { name: 'Gaua', summary: 'Itsas urdina, menda eta arrosa' },
    },
    madeBy: 'Maitasunez ❤️ egina:',
    projectLinks: 'Proiektuaren estekak',
    privacyNotice:
      'Cookieak zure hobespenak gordetzeko bakarrik erabiltzen ditugu: gaia, testuaren tamaina eta hizkuntza. Ez ditugu inoiz zure datuak saltzen edo inorekin partekatzen. Zure pribatutasuna zaintzen dugu!',
    whatsNew: 'Zure azken bisitatik dauden berritasunak:',
    latestChanges: 'Azken berritasunak:',
    updatedAt: (moment) => `Eguneratua: ${moment}`,
    lastUpdate: (moment) => `Azken eguneratzea: ${moment}`,
    noticeOk: 'Ados',
    privacySettings: 'Pribatutasun-ezarpenak',
    privacyLink: 'Pribatutasuna',
  },

  seo: {
    locale: 'eu_ES',
    siteDescription:
      'Haurrek logika, oroimena eta azkartasuna lantzeko minijoko doakoak. Izena eman gabe, ordenagailu, tableta eta mugikorretarako.',
    notFoundTitle: 'Orria ez da aurkitu',
    notFoundDescription: 'Orri hau ez dago.',
    previewImageAlt: 'su-labs games: Joko adimentsuak, haur adimentsuentzat',
  },

  games: {
    'math-games': {
      name: 'Matematika jokoak',
      summary:
        'Egia ala gezurra, sakatu erantzuna edo aurkitu falta diren zeinuak. Denborarekin edo gabe, 20 arteko batuketetatik hiru zifrako zatiketetara. Ingelesez, gaztelaniaz, euskaraz eta ukraineraz.',
      subtitle: 'egia ala gezurra, zenbaki-teklatua eta falta diren zeinuak',
      intro: 'Haurrentzako matematika jokoa.',
    },
    'sliding-puzzle': {
      name: 'Puzzle irristakorra',
      summary: 'Irristatu piezak hutsunera lerroak berriro elkartu arte. Marrazki berria partida bakoitzean.',
      subtitle: 'irristatu piezak eta lotu lerroak',
      intro: 'Haurrentzako puzzlea.',
    },
    'turn-picture': {
      name: 'Biratu irudia',
      summary: 'Sakatu karratuak biratzeko marrazkia berriro osorik egon arte. Begiratu edo osatu oroimenez.',
      subtitle: 'sakatu karratuak biratzeko eta marrazkia osatzeko',
      intro: 'Haurrentzako irudi-puzzlea.',
    },
    'place-pieces': {
      name: 'Kokatu piezak',
      summary: 'Arrastatu marrazkiaren piezak beren lekura. Begiratu edo osatu oroimenez.',
      subtitle: 'arrastatu piezak eta osatu marrazkia',
      intro: 'Haurrentzako irudi-puzzlea.',
    },
  },

  home: {
    title: 'Joko adimentsuak, haur adimentsuentzat',
    lead: 'Logika, oroimena eta azkartasuna lantzeko minijokoak.',
    rule: 'Doan dira, ez dute izena ematea eskatzen, eta ordenagailuetan, tabletetan eta mugikorretan dabiltza.',
    games: 'Jokoak',
    betaLabel: 'Beta',
    betaText:
      'Jokoak beta fasean daude: oraindik ez da azken bertsioa, eta aldatzen jarraituko dute. Laster posta elektronikoz harpidetu ahal izango zara joko berrien eta berritasunen berri izateko.',
    madeByTitle: 'Haurrentzat eginak, haurrek eginak',
    madeByText:
      'Joko gehiago prestatzen ari gara. Nire txikiarekin, Lucíarekin, egiten ditut; berak marrazten ditu irudiak.',
  },

  slidingPuzzle: {
    lead: 'Sakatu hutsunearen ondoko pieza bat hara mugitzeko. Jarri pieza guztiak beren lekuan lerroek marrazki bakarra osa dezaten.',
    rule: 'Hutsunea leku berrian dago partida bakoitzean!',
    board: 'Puzzlea',
    levelGroup: 'Maila',
    levels: {
      easy: { name: 'Erraza', summary: '2 × 3 · 5 pieza' },
      normal: { name: 'Normala', summary: '3 × 3 · 8 pieza' },
      hard: { name: 'Zaila', summary: '4 × 4 · 15 pieza' },
      expert: { name: 'Aditua', summary: '5 × 5 · 24 pieza' },
    },
    goal: 'Helburua',
    pictureGroup: 'Irudia',
    pictureModes: { lines: 'Lerroak', drawing: 'Marrazkia' },
    moves: (moves) => `Mugimenduak ${moves}`,
    tile: (number) => `${number}. pieza`,
    newPuzzle: 'Puzzle berria',
    solved: 'Oso ondo!',
    solvedIn: (moves, time) => `${moves} mugimendu eta ${time} behar izan dituzu`,
    best: (moves) => `Errekorra: ${moves} mugimendu`,
    newRecord: 'Errekor berria!',
    keys: 'Teklatua: geziek pieza bat hutsunera mugitzen dute',
  },

  pictureGames: {
    modeGroup: 'Modua',
    modes: {
      look: { name: 'Begiratu', summary: 'Marrazkia taularen azpian geratzen da' },
      memory: { name: 'Oroimena', summary: 'Ikusi lehenengo, gero osatu' },
    },
    levelGroup: 'Maila',
    levels: {
      easy: { name: 'Erraza', summary: '2 × 2 · 4 karratu' },
      normal: { name: 'Normala', summary: '3 × 3 · 9 karratu' },
      hard: { name: 'Zaila', summary: '4 × 4 · 16 karratu' },
      expert: { name: 'Aditua', summary: '5 × 5 · 25 karratu' },
    },
    picture: 'Marrazkia',
    memorize: 'Begiratu ondo eta sakatu Prest.',
    ready: 'Prest',
    inPlace: (placed, total) => `${placed}/${total} bere lekuan`,
    newGame: 'Partida berria',
    solved: 'Oso ondo!',
    best: (time) => `Errekorra: ${time}`,
    newRecord: 'Errekor berria!',
  },

  turnPicture: {
    lead: 'Sakatu karratu bat laurden bat biratzeko. Biratu guztiak marrazkia ondo egon arte.',
    rule: 'Oroimen moduan, begiratu ondo: marrazkia ezkutatu egiten da Prest sakatzean!',
    board: 'Irudia',
    tile: (number) => `${number}. karratua`,
    turns: (turns) => `Birak ${turns}`,
    solvedIn: (turns, time) => `${turns} bira eta ${time} behar izan dituzu`,
  },

  placePieces: {
    lead: 'Arrastatu pieza bat beste baten gainera lekuz aldatzeko, edo sakatu bi pieza. Jarri guztiak beren lekuan marrazkia osatzeko.',
    rule: 'Oroimen moduan, begiratu ondo: marrazkia ezkutatu egiten da Prest sakatzean!',
    board: 'Irudia',
    piece: (number, picked) => `${number}. pieza${picked ? ', hautatuta' : ''}`,
    swaps: (swaps) => `Mugimenduak ${swaps}`,
    solvedIn: (swaps, time) => `${swaps} mugimendu eta ${time} behar izan dituzu`,
  },

  pictures: {
    family: 'Ama eta alaba eskutik helduta, eguzkia, ilargia eta hodeiekin, haur-marrazki batean',
  },

  privacy: {
    title: 'Pribatutasuna',
    lead: 'Webgune hau haurrentzat da, beraz ahalik eta gutxien gordetzen du. Hemen duzu zehazki zer gordetzen duen, non eta zertarako.',
    savedTitle: 'Zer gordetzen dugun',
    columns: { what: 'Zer', where: 'Non', why: 'Zertarako' },
    saved: [
      {
        what: 'Gaia eta testuaren tamaina',
        where: 'su-labs.dev-en cookie bat',
        why: 'su-labs.dev eta joko hauek zuk aukeratu bezala ikus daitezen',
      },
      {
        what: 'Hizkuntza',
        where: 'Nabigatzaile honen biltegiratze lokala',
        why: 'Jokoak zure hizkuntzan ireki daitezen',
      },
      {
        what: 'Jokoen koloreak eta ezarpenak',
        where: 'Biltegiratze lokala',
        why: 'Jokoek zure aukerak gogora ditzaten',
      },
      { what: 'Puntuazio onenak', where: 'Biltegiratze lokala', why: 'Zure errekorrak hautsi ahal izateko' },
      { what: 'Ikusitako oharrak', where: 'Biltegiratze lokala', why: 'Berriro ez erakusteko' },
    ],
    differenceTitle: 'Cookieak eta biltegiratze lokala',
    difference:
      'Cookie bat gure zerbitzarira bidaltzen da bisita bakoitzean; biltegiratze lokala nabigatzaile honetan geratzen da eta ez da inora bidaltzen. Cookie bakarra erabiltzen dugu, zure gaia eta testuaren tamaina su-labs.dev-ekin partekatzeko, eta zerbitzariak ez du irakurtzen.',
    neverTitle: 'Inoiz egiten ez duguna',
    never: [
      'Ez kontua, ez datu pertsonalik',
      'Ez iragarkirik, ez jarraipenik',
      'Ez dugu ezer saltzen edo inorekin partekatzen',
    ],
    choiceTitle: 'Zure aukera',
    choiceLabel: 'Gogoratu nire hobespenak gailu honetan',
    choiceOn: 'Zure hobespenak gailu honetan gordetzen dira.',
    choiceOff:
      'Ez da ezer gordetzen: ezarpenak hasierakoetara itzultzen dira bisita bakoitzean. Aukera hau bakarrik gogoratzen da.',
    deleteSaved: 'Ezabatu gordetako datuak',
    deleted: 'Eginda: webgune honek gailu honetan gordetako guztia ezabatu da.',
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
