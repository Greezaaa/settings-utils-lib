import { SiteMessages } from './site-messages';

/** Room nicknames: an adjective and an animal, by number */
const ADJECTIVES = [
  'ausarta',
  'zoriontsua',
  'azkarra',
  'argia',
  'atsegina',
  'distiratsua',
  'lasaia',
  'barregarria',
  'goxoa',
  'zortekoa',
  'indartsua',
  'dirdiratsua',
  'eguzkitsua',
  'jakintsua',
  'alaia',
  'bikaina',
];
const ANIMALS = [
  'Azeri',
  'Hartz',
  'Panda',
  'Tigre',
  'Lehoi',
  'Hontz',
  'Pinguino',
  'Izurde',
  'Untxi',
  'Dortoka',
  'Koala',
  'Igaraba',
  'Triku',
  'Urtxintxa',
  'Elefante',
  'Jirafa',
];

export const EU: SiteMessages = {
  languageName: 'Euskara',
  languageCode: 'EU',

  answers: {
    right: 'Ondo!',
    wrong: 'Ia',
    wrongWith: answer => `Ia: ${answer} zen`,
  },

  site: {
    skipToContent: 'Joan edukira',
    sites: 'Guneak',
    gamesNav: 'Jokoak',
    settings: 'Ezarpenak',
    textSize: 'Testuaren tamaina',
    theme: 'Gaia',
    smallerText: 'Testu txikiagoa',
    largerText: 'Testu handiagoa',
    themeNames: {
      system: 'sistema',
      light: 'argia',
      dark: 'iluna',
      contrast: 'kontrastea',
      custom: 'pertsonalizatua',
    },
    themeSwitch: (current, next) =>
      `Gaia: ${current}. Aldatu honetara: ${next}`,
    language: 'Hizkuntza',
    boardColours: 'Jokoaren koloreak',
    boardThemes: {
      light: { name: 'Argia', summary: 'Webgunearen kolore argiak' },
      dark: { name: 'Iluna', summary: 'Webgunearen kolore ilunak' },
      ocean: { name: 'Ozeanoa', summary: 'Itsas urdina eta eguzki horia' },
      party: { name: 'Festa', summary: 'More iluna, zuria eta horia' },
      night: { name: 'Gaua', summary: 'Itsas urdina, menda eta arrosa' },
    },
    answerStyle: 'Erantzunak',
    answerStyles: {
      colours: {
        name: 'Koloreak',
        summary: 'Erantzunak berdez edo gorriz ikusten dira',
      },
      words: {
        name: 'Hitzekin',
        summary: 'Erantzunak koloretan eta hitzekin ere ikusten dira',
      },
    },
    madeBy: 'Maitasunez ❤️ egina:',
    projectLinks: 'Proiektuaren estekak',
    privacyNotice:
      'Cookieak zure hobespenak gordetzeko bakarrik erabiltzen ditugu: gaia, testuaren tamaina eta hizkuntza. Ez ditugu inoiz zure datuak saltzen edo inorekin partekatzen. Zure pribatutasuna zaintzen dugu!',
    lastUpdate: moment => `Azken eguneratzea: ${moment}`,
    noticeOk: 'Ados',
    privacySettings: 'Pribatutasun-ezarpenak',
    privacyLink: 'Pribatutasuna',
    suggestionsLink: 'Iradokizunen postontzia',
    loading: 'Kargatzen…',
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
    'measure-it': {
      name: 'Neurtu',
      summary:
        'Irakurri eta egin angeluak garraiagailuan, esan basoa zenbat beteta dagoen eta aurkitu zenbakia zuzenean.',
      subtitle: 'angeluak, zatikiak eta zenbaki-zuzenak',
      intro: 'Neurtzeko joko bat haurrentzat.',
    },
    'climb-tower': {
      name: 'Igo dorrea',
      summary:
        'Erantzun zuzen bakoitzak solairu bat igotzen zaitu; huts egiten baduzu, erori egingo zara. Noraino igoko zara?',
      subtitle:
        'egia ala gezurra, edo aukeratu eragiketa zuzena, solairuz solairu',
      intro: 'Matematika joko bat haurrentzat.',
    },
    'find-pairs': {
      name: 'Aurkitu bikoteak',
      summary:
        'Biratu kartak binaka eta gogoratu marrazki bakoitza non dagoen. Aurkitu bikote guztiak ahalik eta mugimendu gutxienekin.',
      subtitle: 'biratu bi karta eta aurkitu marrazki berdinak',
      intro: 'Memoria joko bat haurrentzat.',
    },
    'letter-games': {
      name: 'Letra jokoak',
      summary:
        'Ikasi bokalak, osatu falta direnak, ordenatu letra nahasiak edo osatu ahal dituzun hitz guztiak 5 eta 10 letra artean.',
      subtitle: 'bokalak, letra nahasiak eta hitz-sortzailea',
      intro: 'Letra eta hitz joko bat haurrentzat.',
    },
    'hit-the-note': {
      name: 'Asmatu nota',
      summary:
        'Aurkitu entzuten duzun nota, esan doinua igotzen ala jaisten den, edo abestu nota mikrofonoan. Entrenatu belarria eta ahotsa.',
      subtitle: 'aurkitu nota, gora ala behera, eta abestu',
      intro: 'Musika joko bat haurrentzat.',
    },
    'sliding-puzzle': {
      name: 'Puzzle irristakorra',
      summary:
        'Irristatu piezak hutsunera lerroak berriro elkartu arte. Marrazki berria partida bakoitzean.',
      subtitle: 'irristatu piezak eta lotu lerroak',
      intro: 'Haurrentzako puzzlea.',
    },
    'turn-picture': {
      name: 'Biratu irudia',
      summary:
        'Sakatu karratuak biratzeko marrazkia berriro osorik egon arte. Begiratu edo osatu oroimenez.',
      subtitle: 'sakatu karratuak biratzeko eta marrazkia osatzeko',
      intro: 'Haurrentzako irudi-puzzlea.',
    },
    'place-pieces': {
      name: 'Kokatu piezak',
      summary:
        'Arrastatu marrazkiaren piezak beren lekura. Begiratu edo osatu oroimenez.',
      subtitle: 'arrastatu piezak eta osatu marrazkia',
      intro: 'Haurrentzako irudi-puzzlea.',
    },
  },

  categoryIntros: {
    numbers: 'Zenbatu, batu, neurtu eta igo: zenbakiak dibertigarri bihurtzen dituzten jokoak.',
    letters: 'Bokalak, falta diren letrak eta hitz berriak.',
    music: 'Entzun, alderatu eta abestu notak.',
    puzzles: 'Irristatu, biratu, kokatu eta gogoratu marrazkiak.',
  },

  categories: {
    numbers: 'Zenbakiak',
    letters: 'Letrak',
    music: 'Musika',
    puzzles: 'Puzzleak',
  },

  home: {
    title: 'Joko adimentsuak, haur adimentsuentzat',
    lead: 'Logika, oroimena eta azkartasuna lantzeko minijokoak.',
    rule: 'Doan dira, ez dute izena ematea eskatzen, eta ordenagailuetan, tabletetan eta mugikorretan dabiltza.',
    betaLabel: 'Beta',
    betaText:
      'Jokoak beta fasean daude: oraindik ez da azken bertsioa, eta aldatzen jarraituko dute. Laster posta elektronikoz harpidetu ahal izango zara joko berrien eta berritasunen berri izateko.',
    whatsNewTitle: 'Berritasunak',
    showMore: 'Ikusi berritasun gehiago',
    showFewer: 'Ikusi gutxiago',
    madeByTitle: 'Haurrentzat eginak, haurrek eginak',
    madeByText:
      'Joko gehiago prestatzen ari gara. Nire txikiarekin, Lucíarekin, egiten ditut; berak marrazten ditu irudiak.',
    favoritesTitle: 'Zure gogokoak',
    popularTitle: 'Jokatuenak',
    recentTitle: 'Azken gehitutakoak',
    categoriesTitle: 'Joko guztiak',
    categoryGames: games => `${games} joko`,
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
    moves: moves => `Mugimenduak ${moves}`,
    tile: number => `${number}. pieza`,
    newPuzzle: 'Puzzle berria',
    solved: 'Oso ondo!',
    solvedIn: (moves, time) =>
      `${moves} mugimendu eta ${time} behar izan dituzu`,
    best: moves => `Errekorra: ${moves} mugimendu`,
    newRecord: 'Errekor berria!',
    keys: 'Teklatua: geziek pieza bat hutsunera mugitzen dute',
  },

  pictureGames: {
    modeGroup: 'Modua',
    modes: {
      look: {
        name: 'Begiratu',
        summary: 'Marrazkia taularen azpian geratzen da',
      },
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
    best: time => `Errekorra: ${time}`,
    newRecord: 'Errekor berria!',
  },

  turnPicture: {
    lead: 'Sakatu karratu bat laurden bat biratzeko. Biratu guztiak marrazkia ondo egon arte.',
    rule: 'Oroimen moduan, begiratu ondo: marrazkia ezkutatu egiten da Prest sakatzean!',
    board: 'Irudia',
    tile: number => `${number}. karratua`,
    turns: turns => `Birak ${turns}`,
    solvedIn: (turns, time) => `${turns} bira eta ${time} behar izan dituzu`,
  },

  placePieces: {
    lead: 'Arrastatu pieza bat beste baten gainera lekuz aldatzeko, edo sakatu bi pieza. Jarri guztiak beren lekuan marrazkia osatzeko.',
    rule: 'Oroimen moduan, begiratu ondo: marrazkia ezkutatu egiten da Prest sakatzean!',
    board: 'Irudia',
    piece: (number, picked) => `${number}. pieza${picked ? ', hautatuta' : ''}`,
    swaps: swaps => `Mugimenduak ${swaps}`,
    solvedIn: (swaps, time) =>
      `${swaps} mugimendu eta ${time} behar izan dituzu`,
  },

  pictures: {
    family:
      'Ama eta alaba eskutik helduta, eguzkia, ilargia eta hodeiekin, haur-marrazki batean',
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
      {
        what: 'Puntuazio onenak',
        where: 'Biltegiratze lokala',
        why: 'Zure errekorrak hautsi ahal izateko',
      },
      {
        what: 'Ikusitako oharrak eta berritasunak',
        where: 'Biltegiratze lokala',
        why: 'Oharrak berriro ez erakusteko eta berria markatzeko',
      },
      {
        what: 'Baloratu dituzun jokoak',
        where: 'Tokiko biltegiratzea',
        why: 'Berriro ez galdetzeko',
      },
      {
        what: 'Administrazio saioa (taldea bakarrik)',
        where: 'api.su-labs.dev-ren cookie bat',
        why: 'Taldeak saioa 30 egunez irekita izan dezan; bisitariek ez dute inoiz jasotzen',
      },
      {
        what: 'Zure lekua gela batean',
        where: 'Fitxa hau bakarrik (saioko biltegiratzea)',
        why: 'Kargatzean gelara itzul zaitezen; fitxa ixtean ezabatzen da',
      },
    ],
    differenceTitle: 'Cookieak eta biltegiratze lokala',
    difference:
      'Cookie bat gure zerbitzarira bidaltzen da bisita bakoitzean; biltegiratze lokala nabigatzaile honetan geratzen da eta ez da inora bidaltzen. Cookie bakarra erabiltzen dugu, zure gaia eta testuaren tamaina su-labs.dev-ekin partekatzeko, eta zerbitzariak ez du irakurtzen.',
    sentTitle: 'Zer bidaltzen duten jokoek',
    sentLead:
      'Zer den ezaguna erakusteko eta jokoak hobetzeko, gauza gutxi batzuk bidaltzen dituzte gure zerbitzarira, api.su-labs.dev. Horietako ezerk ez du esaten nor zaren.',
    sent: [
      'Zenbat partida jokatzen diren, joko eta egun bakoitzeko',
      'Joko baten zure 👍 edo 👎 eta arrazoia, bat aukeratzen baduzu',
      'Hitz-sortzailean zakartzat salatzen dituzun hitzak',
      'Bidaltzen dituzun proposamenak, beren irudiarekin (ezkutuko informaziorik gabe)',
      'Zure interneteko helbidea minutu batzuetan bakarrik erabiltzen da spama geldiarazteko, eta ez da inoiz gordetzen',
      'Gela batean: zure mugimenduak bakarrik (prest, ezarpenak, puntuazioa) doaz rooms.su-labs.dev-era, asmatutako izen batekin; ez da ezer gordetzen gela ixtean',
    ],
    neverTitle: 'Inoiz egiten ez duguna',
    never: [
      'Ez kontua, ez datu pertsonalik',
      'Ez iragarkirik, ez jarraipenik',
      'Ez dugu ezer saltzen edo inorekin partekatzen',
      'Mikrofonoa Abestu moduan jokatzean bakarrik erabiltzen da, eta soinua ez da inoiz grabatzen ezta bidaltzen ere',
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
    ages: age => `${age} urtetik aurrera`,
    new: 'Berria',
    popular: 'Ezaguna',
    hidden: 'Ezkutuan',
    addFavorite: game => `Gehitu ${game} gogokoetara`,
    removeFavorite: game => `Kendu ${game} gogokoetatik`,
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
      'true-or-false': {
        name: 'Egia ala gezurra',
        summary: 'Esan emaitza zuzena den',
      },
      'your-answer': {
        name: 'Zure erantzuna',
        summary: 'Sakatu emaitza zenbaki-teklatuan',
      },
      'find-the-signs': {
        name: 'Aurkitu zeinuak',
        summary: 'Aukeratu + − × ÷ berdintza egia izan dadin',
      },
    },
    timers: {
      timer: {
        name: 'Denborarekin',
        summary: 'Erantzun barra amaitu baino lehen',
      },
      'no-timer': {
        name: 'Denborarik gabe',
        summary: 'Hartu behar duzun denbora; akats batek amaitzen du',
      },
    },
    levels: {
      easy: { name: 'Erraza', summary: 'Batu eta kendu 20 arte' },
      normal: {
        name: 'Normala',
        summary: 'Bi zifrako zenbakiak, erlojuan bezala',
      },
      hard: {
        name: 'Zaila',
        summary: 'Bi zifrako zenbakiak eta biderketa-taulak',
      },
      advanced: {
        name: 'Aurreratua',
        summary: 'Biderkatu eta zatitu zifra bateko zenbakiekin',
      },
      expert: {
        name: 'Aditua',
        summary: 'Bi eta hiru zifrako zenbakiak, lau eragiketak',
      },
    },
    signsLevels: {
      easy: { name: 'Erraza', summary: '+ eta − 20 arteko zenbakiekin' },
      normal: { name: 'Normala', summary: '+ eta − 50 arteko zenbakiekin' },
      hard: { name: 'Zaila', summary: '+, − eta ×; × lehenengo' },
      expert: {
        name: 'Aditua',
        summary: 'Lau zeinuak; bi edo hiru falta dira',
      },
    },
    bestScore: best => `Puntuazio onena: ${best}`,
    start: 'Hasi',
  },

  playing: {
    seconds: seconds => `${seconds} s`,
    noTimer: 'Denborarik gabe',
    score: score => `Puntuak ${score}`,
  },

  over: {
    outOfTime: 'Denbora amaitu da',
    notQuite: 'Ia-ia!',
    correctAnswers: () => 'erantzun zuzen',
    newRecord: 'errekor berria',
    best: best => `onena ${best}`,
    youAnswered: 'Zure erantzuna',
    rightAnswer: 'Erantzun zuzena hau zen',
    playAgain: 'Jokatu berriro',
    changeSettings: 'Aldatu aukerak',
  },

  trueOrFalse: {
    true: 'Egia',
    false: 'Gezurra',
    given: saysTrue => (saysTrue ? 'egia' : 'gezurra'),
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

  suggestions: {
    title: 'Iradokizunen postontzia',
    lead: 'Hemen ikusi nahiko zenukeen jokoren bat duzu buruan, zure marrazkiak partekatu nahi dituzu edo akatsen bat ikusi duzu?',
    rule: 'Kontaiguzu: zure iritzia garrantzitsua da eta hobetzen laguntzen digu.',
    noPersonalData:
      'Ez idatzi zure izena, helbidea, ikastetxea edo zuri buruzko ezer. Nahi baduzu, eskatu laguntza heldu bati.',
    categoryLabel: 'Zeri buruzkoa da?',
    categories: {
      'new-game': 'Joko berri bat',
      improvement: 'Hobekuntza bat',
      drawing: 'Marrazki bat',
      problem: 'Arazo bat',
      other: 'Beste zerbait',
    },
    textLabel: 'Zure ideia',
    imageLabel: 'Irudi bat (aukerakoa)',
    imageHint:
      'Zure pribatutasuna garrantzitsua da guretzat: irudia bidali aurretik, zure nabigatzaileak metadatuak kentzen dizkio (non eta noiz egin zen edo kameraren modeloa, adibidez) eta konprimatu egiten du.',
    chooseImage: 'Ekarri irudi bat hona, edo egin klik bat aukeratzeko',
    dropHere: 'Utzi hemen',
    imageTypes:
      'Mugikorreko edo ordenagailuko argazkiak eta marrazkiak (JPG, PNG, HEIC…)',
    imageAlt: 'Aukeratu duzun irudia',
    imageError: 'Irudi hori ezin da erabili. Saiatu beste batekin.',
    removeImage: 'Kendu',
    send: 'Bidali',
    sending: 'Bidaltzen…',
    sent: 'Eskerrik asko! Zure ideia bidali da.',
    failed: 'Ez da bidali. Saiatu geroago.',
  },

  feedback: {
    question: 'Gustatzen zaizu joko hau?',
    votes: { up: 'Gustatzen zait', down: 'Ez zait gustatzen' },
    why: 'Zergatik? (aukerakoa)',
    reasons: {
      fun: 'Dibertigarria da',
      learned: 'Zerbait ikasi dut',
      'too-easy': 'Errazegia',
      'too-hard': 'Zailegia',
      boring: 'Aspergarria',
      confusing: 'Ulertzen zaila',
      bug: 'Zerbaitek ez du funtzionatzen',
    },
    justSend: 'Bidali besterik gabe',
    sending: 'Bidaltzen…',
    thanks: 'Eskerrik asko esateagatik!',
    failed: 'Ez da bidali. Saiatu geroago.',
  },

  letterGames: {
    lead: 'Ikasi bokalak, osatu falta direnak, ordenatu letra nahasiak edo osatu ahal dituzun hitz guztiak.',
    rule: 'Hitz-sortzailean edozein hitz errealek balio du: jokatzen duzunean bakarrik deskargatzen den hiztegi batekin egiaztatzen dugu.',
    board: 'Letra jokoa',
    modeGroup: 'Jokoa',
    modes: {
      'first-vowel': {
        name: 'Lehen bokala',
        summary: 'Sakatu hitza zein bokalekin hasten den',
      },
      'missing-vowels': {
        name: 'Falta diren bokalak',
        summary: 'Osatu hitzaren bokal guztiak',
      },
      'mixed-letters': {
        name: 'Letra nahasiak',
        summary: 'Ordenatu letrak; hitzak gero eta luzeagoak dira',
      },
      'word-builder': {
        name: 'Hitz-sortzailea',
        summary: 'Osatu ahal dituzun hitz guztiak',
      },
    },
    levelGroup: 'Letrak',
    builderLevels: {
      easy: { name: 'Erraza', summary: '5 letra' },
      normal: { name: 'Normala', summary: '7 letra' },
      hard: { name: 'Zaila', summary: '10 letra' },
    },
    timers: {
      timer:
        'Amaitu hitz bakoitza barra amaitu baino lehen; hitz-sortzailean, bilatu amaitu arte',
      'no-timer': 'Lasai, presarik gabe',
    },
    hintsGroup: 'Pistak',
    hints: {
      hints: {
        name: 'Pistekin',
        summary:
          '2 akatsen ondoren hurrengo letra argitzen da; 5 eta 10en ondoren, lehen letrak jartzen dira',
      },
      'no-hints': { name: 'Pistarik gabe', summary: 'Ebatzi zuk bakarrik' },
    },
    instructions: {
      'first-vowel': 'Zein bokalekin hasten da?',
      'missing-vowels': 'Sakatu falta diren bokalak, ordenan',
      'mixed-letters': 'Sakatu letrak ordena egokian',
      'word-builder': 'Sakatu letrak hitz bat osatzeko, eta gero Egiaztatu',
    },
    progress: (word, total) => `Hitza: ${word}/${total}`,
    mistakes: mistakes => `Akatsak: ${mistakes}`,
    gap: 'Falta den letra',
    letters: 'Letrak',
    answer: 'Zure hitza',
    delete: 'Ezabatu',
    check: 'Egiaztatu',
    keys: 'Letrak teklatuarekin ere idatz ditzakezu; Atzera teklak azkena kentzen du',
    builderKeys:
      'Idatzi letrak teklatuarekin: Atzera teklak ezabatzen du, Sartu teklak egiaztatzen du',
    found: (found, total) => `Aurkituta: ${found}/${total}`,
    checks: {
      found: 'Ondo aurkitua!',
      'already-found': 'Hori badaukazu jada',
      'too-short': 'Erabili gutxienez 3 letra',
      unknown: 'Ez dugu hitz hori ezagutzen',
    },
    showWords: 'Ikusi hitzak',
    wordsShown: 'Hona hemen hitz guztiak',
    dictionary: {
      loading: 'Hiztegia deskargatzen…',
      why: 'Lehen aldiz jokatzean zure hizkuntzako hiztegia deskargatzen dugu (100 KB inguru) zure hitzak egiaztatzeko. Zure nabigatzaileak hurrengorako gordetzen du.',
      failed:
        'Hiztegia ez da deskargatu, beraz ezkutuko hitzek bakarrik balio dute.',
      credit: 'Hiztegia: FrequencyWords (Hermit Dave), CC BY-SA 4.0',
    },
    report: 'Salatu hitz hau',
    reportThanks: 'Eskerrik asko! Hitz hori berrikusiko dugu.',
    newLetters: 'Beste letra batzuk',
    allFound: 'Denak aurkitu dituzu!',
    solved: 'Oso ondo!',
    summary: (words, mistakes) => `${words} hitz · ${mistakes} akats`,
  },

  measureIt: {
    lead: 'Angeluak garraiagailuan, ur-basoak eta zenbaki-zuzenak.',
    rule: 'Begiratu ondo, erantzun eta sakatu Egiaztatu. Hamar jarraian.',
    board: 'Neurtu',
    modeGroup: 'Zer neurtu',
    modes: {
      'read-angle': {
        name: 'Irakurri angelua',
        summary: 'Zenbat gradu ditu angeluak?',
      },
      'set-angle': {
        name: 'Egin angelua',
        summary: 'Biratu lerroa eskatutako angelua egin arte.',
      },
      'fill-glass': {
        name: 'Ur-basoa',
        summary: 'Zenbat beteta dago basoa: 1/2, 1/3, 3/4…?',
      },
      'number-line': {
        name: 'Zenbaki-zuzena',
        summary: 'Zein zenbaki dago x-n?',
      },
    },
    levels: {
      easy: 'Erraza',
      normal: 'Normala',
      hard: 'Zaila',
      expert: 'Aditua',
    },
    levelSummaries: {
      'read-angle': {
        easy: '30°-z 30°, zenbakiekin',
        normal: '10°-z 10°, markak zenbakirik gabe',
        hard: '5°-z 5°, angelu zuzena bakarrik markatuta',
        expert: 'Edozein angelu, markarik gabe',
      },
      'set-angle': {
        easy: '30°-z 30°, zenbakiekin',
        normal: '10°-z 10°, markak zenbakirik gabe',
        hard: '5°-z 5°, angelu zuzena bakarrik markatuta',
        expert: 'Edozein angelu, markarik gabe',
      },
      'fill-glass': {
        easy: 'Erdiak eta laurdenak',
        normal: 'Erdiak, herenak eta laurdenak',
        hard: 'Zortzirenetaraino',
        expert: '10 basoraino, 7/2 bezalako zatikiak',
      },
      'number-line': {
        easy: '1etik 1era',
        normal: '2tik 2ra eta 5etik 5era',
        hard: '10, 25 eta 50eko pausoak',
        expert: 'Erdiak, laurdenak eta zero azpiko zenbakiak',
      },
    },
    hintsGroup: 'Pistak',
    hintOptions: {
      hints: {
        name: 'Pistekin',
        summary: 'Huts egiten baduzu, pista bat eta beste saiakera bat',
      },
      'no-hints': {
        name: 'Pistarik gabe',
        summary: 'Saiakera bat ariketa bakoitzeko',
      },
    },
    aim: { more: 'Pixka bat gehiago ↑', less: 'Pixka bat gutxiago ↓' },
    whichAngle: 'Zenbat gradu?',
    makeAngle: angle => `Egin ${angle}°`,
    howFull: 'Zenbat beteta dago?',
    whichNumber: 'Zein zenbaki da x?',
    yourAnswer: 'Zure erantzuna',
    check: 'Egiaztatu',
    progress: (exercise, total) => `${exercise} / ${total}`,
    done: 'Amaituta',
    summary: (right, total) => `Ondo: ${right} / ${total}`,
  },

  climbTower: {
    lead: 'Erantzun zuzen bakoitzak solairu bat igotzen zaitu. Huts egiten baduzu, erori egiten zara.',
    rule: 'Noraino igo zaitezke?',
    board: 'Igo dorrea',
    modeGroup: 'Jokoa',
    modes: {
      'true-or-false': {
        name: 'Egia ala gezurra',
        summary: 'Emaitza zuzena da? Erantzun salto egiteko.',
      },
      'which-one': {
        name: 'Zein da?',
        summary:
          'Egin salto kutxako zenbakia ematen duen eragiketaren plataformara.',
      },
    },
    answers: 'Erantzunak',
    floors: floors => `${floors}. solairua`,
    best: floors => `Errekorra: ${floors}. solairua`,
    fell: 'Erori zara!',
    summary: floors => `${floors} solairu igota`,
  },

  findPairs: {
    lead: 'Biratu bi karta. Marrazki bera? Gora geratzen dira. Bestela, berriro biratzen dira.',
    rule: 'Gogoratu marrazki bakoitza non dagoen eta aurkitu bikote guztiak ahalik eta mugimendu gutxienekin.',
    board: 'Kartak',
    levels: {
      easy: { name: 'Erraza', summary: '12 karta · 6 bikote' },
      normal: { name: 'Normala', summary: '24 karta · 12 bikote' },
      hard: { name: 'Zaila', summary: '30 karta · 15 bikote' },
      expert: { name: 'Aditua', summary: '36 karta · 18 bikote' },
    },
    moves: moves => `Mugimenduak ${moves}`,
    pairs: (found, total) => `Bikoteak ${found}/${total}`,
    card: number => `${number}. karta, buruz behera`,
    done: 'Bikote guztiak aurkitu dituzu!',
    summary: (moves, time) => `${moves} mugimendu eta ${time}`,
    best: moves => `Errekorra: ${moves} mugimendu`,
    newGame: 'Partida berria',
  },

  hitTheNote: {
    lead: 'Aurkitu entzuten duzun nota, esan bigarren nota altuagoa ala baxuagoa den, edo abestu mikrofonoan.',
    rule: 'Abestu moduak jokatzen duzun bitartean bakarrik erabiltzen du mikrofonoa: soinua zure gailuan geratzen da eta ez da inoiz grabatzen.',
    board: 'Musika jokoa',
    modeGroup: 'Jokoa',
    modes: {
      'find-the-note': {
        name: 'Aurkitu nota',
        summary: 'Entzun nota bat eta sakatu bere izena',
      },
      'higher-or-lower': {
        name: 'Gora ala behera?',
        summary: 'Entzun bi nota: bigarrena igotzen ala jaisten da?',
      },
      'sing-it': { name: 'Abestu', summary: 'Entzun nota bat eta abestu' },
    },
    levelGroup: 'Maila',
    levels: {
      easy: {
        name: 'Erraza',
        summary: 'Do, Re eta Mi · jauzi handiak · afinatzeko erraza',
      },
      normal: { name: 'Normala', summary: 'Dotik Solera · jauzi txikiagoak' },
      hard: {
        name: 'Zaila',
        summary: 'Eskala osoa, Dotik Sira · nota hurbilak',
      },
      expert: {
        name: 'Aditua',
        summary: '12 notak, diesak ere bai · banan-banan · oso zehatz afinatu',
      },
    },
    instructions: {
      'find-the-note': 'Zein nota da?',
      'higher-or-lower': 'Bigarren nota altuagoa ala baxuagoa da?',
      'sing-it': 'Entzun, gero abestu nota eta eutsi',
    },
    progress: (round, total) => `Txanda: ${round}/${total}`,
    mistakes: mistakes => `Akatsak: ${mistakes}`,
    noteNames: {
      C: 'Do',
      'C#': 'Do♯',
      D: 'Re',
      'D#': 'Re♯',
      E: 'Mi',
      F: 'Fa',
      'F#': 'Fa♯',
      G: 'Sol',
      'G#': 'Sol♯',
      A: 'La',
      'A#': 'La♯',
      B: 'Si',
    },
    notes: 'Notak',
    listen: 'Entzun berriro',
    listenTwo: 'Entzun biak berriro',
    directions: {
      higher: 'Altuagoa',
      lower: 'Baxuagoa',
    },
    startSinging: 'Hasi abesten',
    micPrivacy:
      'Zure nabigatzaileak mikrofonoa erabiltzeko baimena eskatuko du. Soinua gailu honetan geratzen da: ez da inoiz grabatzen ezta bidaltzen ere.',
    micAsking: 'Mikrofonoaren zain…',
    micDenied:
      'Mikrofonoa blokeatuta dago. Baimendu zure nabigatzailean, edo saltatu txanda hau.',
    micUnavailable: 'Gailu honek ez du mikrofonorik. Txandak salta ditzakezu.',
    meter: 'Zure ahotsa notatik zein hurbil dagoen',
    singHints: {
      done: 'Afinatuta! Oso ondo!',
      silent: 'Abestu orain: «aaah»…',
      hold: 'Hori da, eutsi…',
      low: 'Pixka bat altuago ⬆',
      high: 'Pixka bat baxuago ⬇',
    },
    skip: 'Saltatu',
    solved: 'Oso ondo!',
    summary: (right, total) => `${right}/${total} lehen saiakeran`,
  },

  admin: {
    title: 'Administrazioa',
    lead: 'Aktibatu edo desaktibatu jokoak, ikusi zer jokatzen den, eta moderatu proposamenak eta salatutako hitzak.',
    email: 'Helbide elektronikoa',
    password: 'Pasahitza',
    wrongCredentials: 'Helbidea edo pasahitza okerra.',
    offline: 'Orain ezin da APIarekin konektatu. Saiatu geroago.',
    checking: 'Egiaztatzen…',
    signIn: 'Sartu',
    signOut: 'Irten',
    tabs: {
      games: 'Jokoak',
      plays: 'Partidak eta balorazioak',
      suggestions: 'Proposamenak',
      words: 'Salatutako hitzak',
      team: 'Taldea',
      account: 'Kontua',
    },
    saveFailed: 'Aldaketa ez da gorde. Begiratu APIa eta saiatu berriro.',
    loading: 'Kargatzen…',
    previewTitle: 'Aurrebista modua',
    previewHelp: hiddenBadge =>
      `Nabigatzaile honek joko guztiak erakusten ditu, irekiak izan ala ez, «${hiddenBadge}» markarekin ezkutuan daudenean.`,
    gamesTitle: 'Jokoak',
    open: 'Denentzat irekita',
    hidden: 'Publikoari ezkutatuta',
    byDefault: open => `berez: ${open ? 'irekita' : 'ezkutuan'}`,
    periodGroup: 'Epea',
    periods: { all: 'Beti', day: 'Gaur', week: 'Azken 7 egunak', month: 'Azken 30 egunak', year: 'Aurten' },
    playsTotal: total => `${total} partida guztira`,
    refresh: 'Freskatu',
    playsColumns: { game: 'Jokoa', plays: 'Partidak', reasons: 'Arrazoiak' },
    suggestionStatuses: {
      new: 'Berriak',
      read: 'Irakurriak',
      archived: 'Artxibatuak',
    },
    showPicture: 'Ikusi irudia',
    pictureAlt: 'Proposamenarekin bidalitako irudia',
    moveTo: status => `Eraman hona: ${status}`,
    delete: 'Ezabatu',
    confirmDelete: 'Proposamen hau eta bere irudia betiko ezabatu?',
    noSuggestions: 'Ez dago proposamenik hemen.',
    reportStatuses: {
      pending: 'Zain',
      approved: 'Blokeatuak',
      rejected: 'Baimenduak',
    },
    reportsHelp:
      '3 aldiz salatutako hitzak ez du balio hitz-sortzailean zuk erabaki arte.',
    reportColumns: {
      word: 'Hitza',
      language: 'Hizkuntza',
      reports: 'Salaketak',
      firstReported: 'Lehen salaketa',
    },
    keepOut: 'Blokeatu',
    letCount: 'Baimendu',
    noWords: 'Ez dago hitzik hemen.',
    featuresTitle: 'Funtzioak',
    featuresHelp:
      'Funtzio berriak desaktibatuta hasten dira: probatu aurrebistan, eta gero ireki denentzat.',
    featureNames: {
      rooms: 'Elkarrekin jokatu (gelak)',
      'rooms-math-games': 'Matematika geletan',
      'rooms-measure-it': 'Neurtu geletan',
      'answer-words': 'Erantzunak hitzekin (ezarpena)',
      'category-menu': 'Kategorien menua',
      accounts: 'Jokalarien kontuak',
      leaderboard: 'Sailkapena',
    },
    multiplayerTitle: 'Jokalari anitzeko jokoak',
    multiplayerHelp:
      'Joko bakoitzak bere etengailua du geletarako, bakarka jokatzekoaz gain: joko bat irekita egon daiteke eta geletan itxita.',
    addMember: 'Gehitu norbait taldera',
    roleLabel: 'Rola',
    roleHelp: {
      moderator:
        'Proposamenak irakurtzen ditu, salatutako hitzei buruz erabakitzen du, eta partidak eta balorazioak ikusten ditu.',
      tester:
        'Moderatzaile bat bezala, eta gainera joko eta funtzio guztiak ikusten ditu aurrebistan, desaktibatuak ere bai.',
    },
    makeTester: 'Egin tester',
    makeModerator: 'Egin moderatzaile',
    startingPassword: 'Hasierako pasahitza (aukerakoa)',
    startingPasswordHelp:
      'Utzi hutsik gonbidapen-esteka bat lortzeko: berak aukeratuko du pasahitza.',
    add: 'Gehitu',
    alreadyOnTeam: 'Badago norbait taldean helbide horrekin.',
    inviteFor: email =>
      `Gonbidapen-esteka ${email} helbiderako: kopiatu eta bidali.`,
    copy: 'Kopiatu',
    copied: 'Kopiatuta',
    inviteExpires: day => `Behin bakarrik balio du, ${day} arte.`,
    roles: {
      super: 'Superadministratzailea',
      moderator: 'Moderatzailea',
      tester: 'Testerra',
    },
    invited: 'Gonbidatuta, oraindik pasahitzik gabe',
    active: 'Aktibo',
    inactive: 'Desaktibatuta',
    newLink: 'Gonbidapen-esteka berria',
    activate: 'Aktibatu',
    deactivate: 'Desaktibatu',
    changePassword: 'Aldatu pasahitza',
    currentPassword: 'Oraingo pasahitza',
    newPassword: 'Pasahitz berria',
    repeatPassword: 'Errepikatu pasahitz berria',
    passwordRule: min => `Gutxienez ${min} karaktere.`,
    passwordChanged:
      'Pasahitza aldatu da. Zure kontuarekin zeuden beste nabigatzaileetan saioa itxi da.',
    wrongPassword: 'Oraingo pasahitza ez da zuzena.',
    passwordsDiffer: 'Bi pasahitzak ez datoz bat.',
    inviteTitle: 'Batu administrazio taldera',
    inviteLead: email => `Aukeratu pasahitz bat ${email} helbiderako.`,
    acceptInvite: 'Gorde eta sartu',
    inviteInvalid:
      'Gonbidapen-esteka honek ez du balio jada. Eskatu berri bat.',
  },

  rooms: {
    navLink: 'Elkarrekin jokatu',
    title: 'Elkarrekin jokatu',
    lead: 'Jokatu joko bera aldi berean, 4 jokalari arte, bakoitza bere gailuan.',
    rule: 'Sortu gela bat eta partekatu bere kodea, edo sartu batean kode batekin.',
    create: 'Sortu gela bat',
    joinTitle: 'Sartu gela batean',
    codeLabel: 'Gelaren kodea',
    join: 'Sartu',
    homeTitle: 'Elkarrekin jokatu',
    homeText:
      '4 jokalari arte, ariketa berak aldi berean. Nork asmatzen du gehien?',
    errors: {
      'not-found':
        'Ez dago gelarik kode horrekin. Begiratu edo eskatu berri bat.',
      full: 'Gela hori beteta dago: 4 jokalari ditu jada.',
      'in-game':
        'Gela horretan jokatzen ari dira orain. Saiatu berriro txanda amaitzean.',
      'not-host': 'Gelako anfitrioiak bakarrik egin dezake hori.',
      'not-ready':
        'Lehenik denek prest egon behar dute, gutxienez 2 jokalarirekin.',
      'wrong-phase': 'Orain ezin da hori egin.',
      invalid: 'Kode hori ez dirudi zuzena: 6 letra eta zenbaki ditu.',
      'too-many': 'Saiakera gehiegi. Itxaron minutu bat eta saiatu berriro.',
      offline:
        'Orain ezin da geletara konektatu. Begiratu zure konexioa eta saiatu berriro.',
    },
    connecting: 'Konektatzen…',
    reconnecting: 'Berriro konektatzen…',
    roomCode: 'Gelaren kodea',
    copyLink: 'Kopiatu esteka',
    copied: 'Kopiatuta',
    players: (count, max) => `Jokalariak ${count}/${max}`,
    host: 'Anfitrioia',
    you: 'Zu',
    ready: 'Prest',
    notReady: 'Ez dago prest',
    away: 'Kanpoan',
    imReady: 'Prest nago',
    notReadyYet: 'Oraindik ez nago prest',
    start: 'Hasi',
    needPlayers: min => `Gutxienez ${min} jokalari behar dira.`,
    waitingForReady: 'Denak prest egon arte itxaroten…',
    waitingForHost: 'Anfitrioiak hasi arte itxaroten…',
    settingsTitle: 'Jokoaren ezarpenak',
    gameGroup: 'Jokoa',
    roundLength: 'Txandaren iraupena',
    showScores: 'Puntuazioa txandan zehar',
    scoresShown: 'Erakutsi puntuazioa',
    scoresHidden: 'Puntuazioa amaieran bakarrik',
    seconds: seconds => `${seconds} s`,
    getReady: 'Prest!',
    timeLeft: seconds => `${seconds} s falta dira`,
    yourScore: score => `Zure puntuazioa: ${score}`,
    resultsTitle: 'Emaitzak',
    place: place => `${place}.`,
    points: points => `${points} puntu`,
    playAgain: 'Jokatu berriro',
    leave: 'Irten gelatik',
    kick: 'Kendu',
    kicked: 'Anfitrioiak gelatik kendu zaitu.',
    gameUnavailable: 'Joko hau ez dago irekita geletan oraintxe.',
    animals: ANIMALS,
    nickname: (adjective, animal) =>
      `${ANIMALS[animal]} ${ADJECTIVES[adjective]}`,
  },
};
