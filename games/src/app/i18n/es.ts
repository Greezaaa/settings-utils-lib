import { SiteMessages } from './site-messages';

export const ES: SiteMessages = {
  languageName: 'Español',

  site: {
    skipToContent: 'Saltar al contenido',
    sites: 'Sitios',
    gamesNav: 'Juegos',
    settings: 'Ajustes',
    textSize: 'Tamaño del texto',
    smallerText: 'Texto más pequeño',
    largerText: 'Texto más grande',
    themeNames: { system: 'sistema', light: 'claro', dark: 'oscuro', contrast: 'contraste', custom: 'personalizado' },
    themeSwitch: (current, next) => `Tema: ${current}. Cambiar a ${next}`,
    language: 'Idioma',
    madeBy: 'Hecho con ❤️ por',
    projectLinks: 'Enlaces del proyecto',
  },

  seo: {
    locale: 'es_ES',
    siteDescription:
      'Juegos cortos y gratuitos para que los niños piensen rápido. Sin registro, para tabletas, móviles y ordenadores.',
    mathGamesSubtitle: 'verdadero o falso, teclado numérico y signos que faltan',
    mathGamesIntro: 'Un juego de matemáticas para niños.',
    notFoundTitle: 'Página no encontrada',
    notFoundDescription: 'Esta página no existe.',
    previewImageAlt: 'su-labs games: Juegos inteligentes para mentes despiertas',
  },

  games: {
    'math-games': {
      name: 'Juegos de matemáticas',
      summary:
        'Verdadero o falso, marca la respuesta o encuentra los signos que faltan. Con o sin tiempo, desde sumas hasta 20 hasta divisiones de tres cifras. En inglés, español y euskera.',
    },
  },

  home: {
    title: 'Juegos inteligentes para mentes despiertas',
    lead: 'Juegos cortos para pensar rápido.',
    rule: 'Gratis, sin registro, y funcionan en móviles y tabletas.',
    games: 'Juegos',
  },

  notFound: {
    title: 'Ups, esta página no existe.',
    lead: 'Puede que el enlace sea antiguo o esté mal escrito.',
    back: 'Volver a los juegos',
    playInstead: 'Juega a esto',
  },

  page: {
    section: 'Juegos inteligentes',
    ages: 'Desde 6 años',
    title: 'Juegos de matemáticas',
    lead: 'Di si el resultado es verdadero o falso, marca tú el resultado o encuentra los signos que faltan. Con tiempo, responde antes de que se acabe la barra.',
    rule: '¡No falles, o se acaba la partida!',
    game: 'Juego',
  },

  settings: {
    answerStyleGroup: 'Cómo responder',
    timerGroup: 'Tiempo',
    coloursGroup: 'Colores',
    levelGroup: 'Nivel',
    answerStyles: {
      'true-or-false': { name: 'Verdadero o falso', summary: 'Di si el resultado es correcto' },
      'your-answer': { name: 'Tu respuesta', summary: 'Marca el resultado en el teclado numérico' },
      'find-the-signs': { name: 'Encuentra los signos', summary: 'Elige + − × ÷ para que la igualdad sea cierta' },
    },
    timers: {
      timer: { name: 'Con tiempo', summary: 'Responde antes de que se acabe la barra' },
      'no-timer': { name: 'Sin tiempo', summary: 'Tómate tu tiempo; un fallo y se acaba' },
    },
    levels: {
      easy: { name: 'Fácil', summary: 'Suma y resta hasta 20' },
      normal: { name: 'Normal', summary: 'Números de dos cifras, como en el reloj' },
      hard: { name: 'Difícil', summary: 'Números de dos cifras y tablas de multiplicar' },
      advanced: { name: 'Avanzado', summary: 'Multiplica y divide con números de una cifra' },
      expert: { name: 'Experto', summary: 'Números de dos y tres cifras, las cuatro operaciones' },
    },
    signsLevels: {
      easy: { name: 'Fácil', summary: '+ y − con números hasta 20' },
      normal: { name: 'Normal', summary: '+ y − con números hasta 50' },
      hard: { name: 'Difícil', summary: '+, − y ×; la × va primero' },
      expert: { name: 'Experto', summary: 'Los cuatro signos; faltan dos o tres' },
    },
    themes: {
      light: { name: 'Claro', summary: 'Los colores claros de la web' },
      dark: { name: 'Oscuro', summary: 'Los colores oscuros de la web' },
      ocean: { name: 'Océano', summary: 'Azul marino con amarillo sol' },
      party: { name: 'Fiesta', summary: 'Morado oscuro con blanco y amarillo' },
      night: { name: 'Noche', summary: 'Azul marino, menta y rosa' },
    },
    bestScore: (best) => `Mejor puntuación: ${best}`,
    start: 'Empezar',
  },

  playing: {
    seconds: (seconds) => `${seconds} s`,
    noTimer: 'Sin tiempo',
    score: (score) => `Puntos ${score}`,
  },

  over: {
    outOfTime: 'Se acabó el tiempo',
    notQuite: '¡Casi!',
    correctAnswers: (score) => (score === 1 ? 'acierto' : 'aciertos'),
    newRecord: 'nuevo récord',
    best: (best) => `récord ${best}`,
    youAnswered: 'Tu respuesta',
    rightAnswer: 'La respuesta correcta era',
    playAgain: 'Jugar otra vez',
    changeSettings: 'Cambiar opciones',
  },

  trueOrFalse: {
    true: 'Verdadero',
    false: 'Falso',
    given: (saysTrue) => (saysTrue ? 'verdadero' : 'falso'),
    keys: 'Teclado: ← falso, → verdadero',
  },

  yourAnswer: {
    answer: 'Tu respuesta',
    numberPad: 'Teclado numérico',
    delete: 'Borrar',
    check: 'Comprobar',
    tapNumberFirst: 'Marca un número primero',
  },

  findTheSigns: {
    signs: 'Signos',
    gap: (position, sign) => `Signo ${position}: ${sign ?? 'vacío'}`,
    deleteSign: 'Borrar signo',
    check: 'Comprobar',
    fillEveryGap: 'Rellena todos los huecos primero',
    tapGapToChange: 'Toca un hueco para cambiarlo.',
    precedence: '× y ÷ se calculan antes que + y −.',
    notWholeNumber: 'no da un número entero',
  },
};
