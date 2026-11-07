import { SiteMessages } from './site-messages';

export const ES: SiteMessages = {
  languageName: 'Español',
  languageCode: 'ES',

  site: {
    skipToContent: 'Saltar al contenido',
    sites: 'Sitios',
    gamesNav: 'Juegos',
    settings: 'Ajustes',
    textSize: 'Tamaño del texto',
    theme: 'Tema',
    smallerText: 'Texto más pequeño',
    largerText: 'Texto más grande',
    themeNames: { system: 'sistema', light: 'claro', dark: 'oscuro', contrast: 'contraste', custom: 'personalizado' },
    themeSwitch: (current, next) => `Tema: ${current}. Cambiar a ${next}`,
    language: 'Idioma',
    boardColours: 'Colores del juego',
    boardThemes: {
      light: { name: 'Claro', summary: 'Los colores claros de la web' },
      dark: { name: 'Oscuro', summary: 'Los colores oscuros de la web' },
      ocean: { name: 'Océano', summary: 'Azul marino con amarillo sol' },
      party: { name: 'Fiesta', summary: 'Morado oscuro con blanco y amarillo' },
      night: { name: 'Noche', summary: 'Azul marino, menta y rosa' },
    },
    madeBy: 'Hecho con ❤️ por',
    projectLinks: 'Enlaces del proyecto',
    privacyNotice:
      'Usamos cookies solo para guardar tus preferencias, como el tema, el tamaño del texto y el idioma. Nunca vendemos ni compartimos tus datos con nadie. ¡Cuidamos tu privacidad!',
    whatsNew: 'Novedades desde tu última visita:',
    latestChanges: 'Últimas novedades:',
    updatedAt: (moment) => `Actualizado: ${moment}`,
    lastUpdate: (moment) => `Última actualización: ${moment}`,
    noticeOk: 'Vale',
    privacySettings: 'Ajustes de privacidad',
    privacyLink: 'Privacidad',
  },

  seo: {
    locale: 'es_ES',
    siteDescription:
      'Minijuegos gratuitos para que los niños entrenen la lógica, la memoria y la rapidez. Sin registro, para ordenadores, tabletas y móviles.',
    notFoundTitle: 'Página no encontrada',
    notFoundDescription: 'Esta página no existe.',
    previewImageAlt: 'su-labs games: Juegos inteligentes para mentes despiertas',
  },

  games: {
    'math-games': {
      name: 'Juegos de matemáticas',
      summary:
        'Verdadero o falso, marca la respuesta o encuentra los signos que faltan. Con o sin tiempo, desde sumas hasta 20 hasta divisiones de tres cifras. En inglés, español, euskera y ucraniano.',
      subtitle: 'verdadero o falso, teclado numérico y signos que faltan',
      intro: 'Un juego de matemáticas para niños.',
    },
    'sliding-puzzle': {
      name: 'Puzle deslizante',
      summary: 'Desliza las piezas al hueco hasta que las líneas vuelvan a unirse. Un dibujo nuevo en cada partida.',
      subtitle: 'desliza las piezas y une las líneas',
      intro: 'Un puzle para niños.',
    },
    'turn-picture': {
      name: 'Gira la imagen',
      summary:
        'Toca los cuadrados para girarlos hasta que el dibujo vuelva a estar entero. Míralo o reconstrúyelo de memoria.',
      subtitle: 'toca para girar los cuadrados y reconstruir el dibujo',
      intro: 'Un puzle de imágenes para niños.',
    },
    'place-pieces': {
      name: 'Coloca las piezas',
      summary: 'Arrastra las piezas del dibujo a su sitio. Míralo o reconstrúyelo de memoria.',
      subtitle: 'arrastra las piezas y reconstruye el dibujo',
      intro: 'Un puzle de imágenes para niños.',
    },
  },

  categories: { numbers: 'Números', puzzles: 'Puzles' },

  home: {
    title: 'Juegos inteligentes para mentes despiertas',
    lead: 'Minijuegos para entrenar la lógica, la memoria y la rapidez.',
    rule: 'Son gratis, sin registro y funcionan en ordenadores, tabletas y móviles.',
    betaLabel: 'Beta',
    betaText:
      'Los juegos están en fase beta: todavía no es la versión final y seguirán cambiando. Pronto podrás suscribirte por correo para que te avisemos de los juegos nuevos y de cada cambio.',
    madeByTitle: 'Hecho para peques, por peques',
    madeByText: 'Estamos creando más juegos. Los hago junto a mi peque, Lucía, que dibuja las imágenes.',
  },

  slidingPuzzle: {
    lead: 'Toca una pieza junto al hueco para moverla allí. Coloca todas las piezas para que las líneas formen un solo dibujo.',
    rule: '¡El hueco cambia de sitio en cada partida!',
    board: 'Puzle',
    levelGroup: 'Nivel',
    levels: {
      easy: { name: 'Fácil', summary: '2 × 3 · 5 piezas' },
      normal: { name: 'Normal', summary: '3 × 3 · 8 piezas' },
      hard: { name: 'Difícil', summary: '4 × 4 · 15 piezas' },
      expert: { name: 'Experto', summary: '5 × 5 · 24 piezas' },
    },
    goal: 'Objetivo',
    pictureGroup: 'Imagen',
    pictureModes: { lines: 'Líneas', drawing: 'Dibujo' },
    moves: (moves) => `Movimientos ${moves}`,
    tile: (number) => `Pieza ${number}`,
    newPuzzle: 'Nuevo puzle',
    solved: '¡Muy bien!',
    solvedIn: (moves, time) => `Terminado en ${moves} ${moves === 1 ? 'movimiento' : 'movimientos'} y ${time}`,
    best: (moves) => `Récord: ${moves} movimientos`,
    newRecord: '¡Nuevo récord!',
    keys: 'Teclado: las flechas mueven una pieza al hueco',
  },

  pictureGames: {
    modeGroup: 'Modo',
    modes: {
      look: { name: 'Mirar', summary: 'El dibujo se queda debajo del tablero' },
      memory: { name: 'Memoria', summary: 'Míralo primero y luego reconstrúyelo' },
    },
    levelGroup: 'Nivel',
    levels: {
      easy: { name: 'Fácil', summary: '2 × 2 · 4 cuadrados' },
      normal: { name: 'Normal', summary: '3 × 3 · 9 cuadrados' },
      hard: { name: 'Difícil', summary: '4 × 4 · 16 cuadrados' },
      expert: { name: 'Experto', summary: '5 × 5 · 25 cuadrados' },
    },
    picture: 'El dibujo',
    memorize: 'Fíjate bien y pulsa Listo.',
    ready: 'Listo',
    inPlace: (placed, total) => `${placed} de ${total} en su sitio`,
    newGame: 'Nueva partida',
    solved: '¡Muy bien!',
    best: (time) => `Récord: ${time}`,
    newRecord: '¡Nuevo récord!',
  },

  turnPicture: {
    lead: 'Toca un cuadrado para girarlo un cuarto de vuelta. Gira todos hasta que el dibujo esté bien.',
    rule: 'En el modo Memoria, fíjate bien: ¡el dibujo se esconde al pulsar Listo!',
    board: 'Imagen',
    tile: (number) => `Cuadrado ${number}`,
    turns: (turns) => `Giros ${turns}`,
    solvedIn: (turns, time) => `Terminado en ${turns} ${turns === 1 ? 'giro' : 'giros'} y ${time}`,
  },

  placePieces: {
    lead: 'Arrastra una pieza sobre otra para cambiarlas de sitio, o toca dos piezas. Coloca todas para terminar el dibujo.',
    rule: 'En el modo Memoria, fíjate bien: ¡el dibujo se esconde al pulsar Listo!',
    board: 'Imagen',
    piece: (number, picked) => `Pieza ${number}${picked ? ', elegida' : ''}`,
    swaps: (swaps) => `Movimientos ${swaps}`,
    solvedIn: (swaps, time) => `Terminado en ${swaps} ${swaps === 1 ? 'movimiento' : 'movimientos'} y ${time}`,
  },

  pictures: {
    family: 'Dibujo infantil de una madre y su hija de la mano, con el sol, la luna y nubes',
  },

  privacy: {
    title: 'Privacidad',
    lead: 'Esta web es para peques, así que guarda lo mínimo. Aquí tienes exactamente qué guarda, dónde y para qué.',
    savedTitle: 'Qué guardamos',
    columns: { what: 'Qué', where: 'Dónde', why: 'Para qué' },
    saved: [
      {
        what: 'Tema y tamaño del texto',
        where: 'Una cookie de su-labs.dev',
        why: 'Para que su-labs.dev y estos juegos se vean como elegiste',
      },
      {
        what: 'Idioma',
        where: 'El almacenamiento local de este navegador',
        why: 'Para que los juegos se abran en tu idioma',
      },
      {
        what: 'Colores y ajustes de los juegos',
        where: 'Almacenamiento local',
        why: 'Para que los juegos recuerden tus elecciones',
      },
      { what: 'Mejores puntuaciones', where: 'Almacenamiento local', why: 'Para que puedas batir tus récords' },
      { what: 'Avisos ya vistos', where: 'Almacenamiento local', why: 'Para no volver a mostrártelos' },
    ],
    differenceTitle: 'Cookies y almacenamiento local',
    difference:
      'Una cookie se envía a nuestro servidor en cada visita; el almacenamiento local se queda en este navegador y nunca se envía a ningún sitio. Solo usamos una cookie, para compartir tu tema y tamaño de texto con su-labs.dev, y el servidor no la lee.',
    neverTitle: 'Lo que nunca hacemos',
    never: [
      'Ni cuentas ni datos personales',
      'Ni anuncios ni seguimiento',
      'No vendemos ni compartimos nada con nadie',
    ],
    choiceTitle: 'Tu elección',
    choiceLabel: 'Recordar mis preferencias en este dispositivo',
    choiceOn: 'Tus preferencias se guardan en este dispositivo.',
    choiceOff:
      'No se guarda nada: los ajustes vuelven a los de siempre en cada visita. Solo se recuerda esta elección.',
    deleteSaved: 'Borrar mis datos guardados',
    deleted: 'Hecho: se ha borrado todo lo que esta web guardaba en este dispositivo.',
  },

  notFound: {
    title: 'Ups, esta página no existe.',
    lead: 'Puede que el enlace sea antiguo o esté mal escrito.',
    back: 'Volver a los juegos',
    playInstead: 'Juega a esto',
  },

  page: {
    section: 'Juegos inteligentes',
    ages: (age) => `Desde ${age} años`,
    new: 'Nuevo',
    title: 'Juegos de matemáticas',
    lead: 'Di si el resultado es verdadero o falso, marca tú el resultado o encuentra los signos que faltan. Con tiempo, responde antes de que se acabe la barra.',
    rule: '¡No falles, o se acaba la partida!',
    game: 'Juego',
  },

  settings: {
    answerStyleGroup: 'Cómo responder',
    timerGroup: 'Tiempo',
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
