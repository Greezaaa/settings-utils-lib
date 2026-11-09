import { SiteMessages } from './site-messages';

/** Room nicknames: an adjective and an animal, by number */
const ADJECTIVES = [
  'valiente',
  'feliz',
  'veloz',
  'genial',
  'amable',
  'brillante',
  'alegre',
  'sonriente',
  'elegante',
  'fuerte',
  'ágil',
  'audaz',
  'tenaz',
  'dulce',
  'libre',
  'capaz',
];
const ANIMALS = [
  'Zorro',
  'Oso',
  'Panda',
  'Tigre',
  'León',
  'Búho',
  'Pingüino',
  'Delfín',
  'Conejo',
  'Tortuga',
  'Koala',
  'Nutria',
  'Erizo',
  'Ardilla',
  'Elefante',
  'Jirafa',
];

export const ES: SiteMessages = {
  languageName: 'Español',
  languageCode: 'ES',

  answers: {
    right: '¡Correcto!',
    wrong: 'Casi',
    wrongWith: answer => `Casi: era ${answer}`,
  },

  site: {
    skipToContent: 'Saltar al contenido',
    gamesNav: 'Juegos',
    settings: 'Ajustes',
    textSize: 'Tamaño del texto',
    theme: 'Tema',
    smallerText: 'Texto más pequeño',
    largerText: 'Texto más grande',
    themeNames: {
      system: 'sistema',
      light: 'claro',
      dark: 'oscuro',
      contrast: 'contraste',
      custom: 'personalizado',
    },
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
    answerStyle: 'Respuestas',
    answerStyles: {
      colours: {
        name: 'Colores',
        summary: 'Las respuestas se ven en verde o rojo',
      },
      words: {
        name: 'Con palabras',
        summary: 'Las respuestas se ven en color y también con palabras',
      },
    },
    madeBy: 'Hecho con ❤️ por',
    projectLinks: 'Enlaces del proyecto',
    privacyNotice:
      'Usamos cookies solo para guardar tus preferencias, como el tema, el tamaño del texto y el idioma. Nunca vendemos ni compartimos tus datos con nadie. ¡Cuidamos tu privacidad!',
    lastUpdate: moment => `Última actualización: ${moment}`,
    noticeOk: 'Vale',
    cancel: 'Cancelar',
    privacySettings: 'Ajustes de privacidad',
    privacyLink: 'Privacidad',
    suggestionsLink: 'Buzón de sugerencias',
    loading: 'Cargando…',
  },

  seo: {
    locale: 'es_ES',
    siteDescription:
      'Minijuegos gratuitos para que los niños entrenen la lógica, la memoria y la rapidez. Sin registro, para ordenadores, tabletas y móviles.',
    notFoundTitle: 'Página no encontrada',
    notFoundDescription: 'Esta página no existe.',
    previewImageAlt:
      'su-labs games: Juegos inteligentes para mentes despiertas',
  },

  games: {
    'math-games': {
      name: 'Juegos de matemáticas',
      summary:
        'Verdadero o falso, marca la respuesta o encuentra los signos que faltan. Con o sin tiempo, desde sumas hasta 20 hasta divisiones de tres cifras. En inglés, español, euskera, ucraniano e italiano.',
      subtitle: 'verdadero o falso, teclado numérico y signos que faltan',
      intro: 'Un juego de matemáticas para niños.',
    },
    'measure-it': {
      name: 'A medir',
      summary:
        'Lee y forma ángulos en un transportador, di cuánta agua tiene el vaso y encuentra el número en la recta.',
      subtitle: 'ángulos, fracciones y rectas numéricas',
      intro: 'Un juego de medir para niños.',
    },
    'climb-tower': {
      name: 'Sube la torre',
      summary:
        'Cada respuesta correcta te sube un piso; si fallas, te caes. ¿Hasta dónde llegarás?',
      subtitle: 'verdadero o falso, o elige la operación correcta, piso a piso',
      intro: 'Un juego de matemáticas para niños.',
    },
    'find-pairs': {
      name: 'Encuentra las parejas',
      summary:
        'Gira las cartas de dos en dos y recuerda dónde está cada dibujo. Encuentra todas las parejas en el menor número de movimientos.',
      subtitle: 'gira dos cartas y encuentra los dibujos iguales',
      intro: 'Un juego de memoria para niños.',
    },
    'how-many': {
      name: '¿Cuántos hay?',
      summary:
        'Cuenta los delfines, patitos o estrellas y toca cuántos hay, del 1 al 5. Toca cada uno para oír su número.',
      subtitle: 'contar del 1 al 5',
      intro: 'Un juego para contar para los más peques.',
    },
    'letter-games': {
      name: 'Juegos de letras',
      summary:
        'Aprende las vocales, completa las que faltan, ordena letras mezcladas o forma todas las palabras que puedas con 5 a 10 letras.',
      subtitle: 'vocales, letras mezcladas y forma palabras',
      intro: 'Un juego de letras y palabras para niños.',
    },
    'hit-the-note': {
      name: 'Dando la nota',
      summary:
        'Encuentra la nota que oyes, di si la melodía sube o baja, o canta la nota al micrófono. Entrena el oído y la voz.',
      subtitle: 'encuentra la nota, sube o baja, y cántala',
      intro: 'Un juego de música para niños.',
    },
    'sliding-puzzle': {
      name: 'Puzle deslizante',
      summary:
        'Desliza las piezas al hueco hasta que las líneas vuelvan a unirse. Un dibujo nuevo en cada partida.',
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
      summary:
        'Arrastra las piezas del dibujo a su sitio. Míralo o reconstrúyelo de memoria.',
      subtitle: 'arrastra las piezas y reconstruye el dibujo',
      intro: 'Un puzle de imágenes para niños.',
    },
  },

  categoryIntros: {
    numbers: 'Contar, sumar, medir y escalar: juegos que hacen divertidos los números.',
    letters: 'Vocales, letras que faltan y palabras nuevas.',
    music: 'Escuchar, comparar y cantar notas.',
    puzzles: 'Deslizar, girar, colocar y recordar dibujos.',
  },

  categories: {
    numbers: 'Números',
    letters: 'Letras',
    music: 'Música',
    puzzles: 'Puzles',
  },

  home: {
    title: 'Juegos inteligentes para mentes despiertas',
    lead: 'Minijuegos para entrenar la lógica, la memoria y la rapidez.',
    rule: 'Son gratis, sin registro y funcionan en ordenadores, tabletas y móviles.',
    betaLabel: 'Beta',
    betaText:
      'Los juegos están en fase beta: todavía no es la versión final y seguirán cambiando. Pronto podrás suscribirte por correo para que te avisemos de los juegos nuevos y de cada cambio.',
    whatsNewTitle: 'Novedades',
    updateKinds: { game: 'Juegos', language: 'Idiomas', settings: 'Ajustes', feature: 'Funciones', privacy: 'Privacidad' },
    showMore: 'Ver más novedades',
    showFewer: 'Ver menos',
    madeByTitle: 'Hecho para peques, por peques',
    madeByText:
      'Estamos creando más juegos. Los hago junto a mi peque, Lucía, que dibuja las imágenes.',
    favoritesTitle: 'Tus favoritos',
    popularTitle: 'Los más jugados',
    recentTitle: 'Recién añadidos',
    categoriesTitle: 'Todos los juegos',
    categoryGames: games => (games === 1 ? '1 juego' : `${games} juegos`),
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
    moves: moves => `Movimientos ${moves}`,
    tile: number => `Pieza ${number}`,
    newPuzzle: 'Nuevo puzle',
    solved: '¡Muy bien!',
    solvedIn: (moves, time) =>
      `Terminado en ${moves} ${moves === 1 ? 'movimiento' : 'movimientos'} y ${time}`,
    best: moves => `Récord: ${moves} movimientos`,
    newRecord: '¡Nuevo récord!',
    keys: 'Teclado: las flechas mueven una pieza al hueco',
  },

  pictureGames: {
    modeGroup: 'Modo',
    modes: {
      look: { name: 'Mirar', summary: 'El dibujo se queda debajo del tablero' },
      memory: {
        name: 'Memoria',
        summary: 'Míralo primero y luego reconstrúyelo',
      },
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
    best: time => `Récord: ${time}`,
    newRecord: '¡Nuevo récord!',
  },

  turnPicture: {
    lead: 'Toca un cuadrado para girarlo un cuarto de vuelta. Gira todos hasta que el dibujo esté bien.',
    rule: 'En el modo Memoria, fíjate bien: ¡el dibujo se esconde al pulsar Listo!',
    board: 'Imagen',
    tile: number => `Cuadrado ${number}`,
    turns: turns => `Giros ${turns}`,
    solvedIn: (turns, time) =>
      `Terminado en ${turns} ${turns === 1 ? 'giro' : 'giros'} y ${time}`,
  },

  placePieces: {
    lead: 'Arrastra una pieza sobre otra para cambiarlas de sitio, o toca dos piezas. Coloca todas para terminar el dibujo.',
    rule: 'En el modo Memoria, fíjate bien: ¡el dibujo se esconde al pulsar Listo!',
    board: 'Imagen',
    piece: (number, picked) => `Pieza ${number}${picked ? ', elegida' : ''}`,
    swaps: swaps => `Movimientos ${swaps}`,
    solvedIn: (swaps, time) =>
      `Terminado en ${swaps} ${swaps === 1 ? 'movimiento' : 'movimientos'} y ${time}`,
  },

  pictures: {
    family:
      'Dibujo infantil de una madre y su hija de la mano, con el sol, la luna y nubes',
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
      {
        what: 'Mejores puntuaciones',
        where: 'Almacenamiento local',
        why: 'Para que puedas batir tus récords',
      },
      {
        what: 'Avisos y novedades ya vistos',
        where: 'Almacenamiento local',
        why: 'Para no repetirte los avisos y marcar lo nuevo',
      },
      {
        what: 'Juegos que has valorado',
        where: 'Almacenamiento local',
        why: 'Para no volver a preguntarte',
      },
      {
        what: 'Sesión de administración (solo el equipo)',
        where: 'Una cookie de nuestros servidores',
        why: 'Para que el equipo siga con la sesión iniciada 30 días; los visitantes nunca la reciben',
      },
      {
        what: 'Tu sitio en una sala',
        where: 'Solo esta pestaña (almacenamiento de sesión)',
        why: 'Para que al recargar vuelvas a la sala; se borra al cerrar la pestaña',
      },
    ],
    differenceTitle: 'Cookies y almacenamiento local',
    difference:
      'Una cookie se envía a nuestro servidor en cada visita; el almacenamiento local se queda en este navegador y nunca se envía a ningún sitio. Solo usamos una cookie, para compartir tu tema y tamaño de texto con su-labs.dev, y el servidor no la lee.',
    sentTitle: 'Qué envían los juegos',
    sentLead:
      'Para mostrar qué es popular y mejorar los juegos, envían unas pocas cosas a nuestros servidores. Nada de ello dice quién eres.',
    sent: [
      'Cuántas partidas se juegan, por juego y día',
      'Tu 👍 o 👎 de un juego y su motivo, si eliges uno',
      'Las palabras que denuncias como groseras en Forma palabras',
      'Las sugerencias que envías, con su imagen (sin información oculta)',
      'Si algo falla: el mensaje del error y la página donde pasó, para poder arreglarlo; nada sobre ti',
      'Tu dirección de internet solo se usa unos minutos para frenar el spam y nunca se guarda',
      'En una sala: solo tus jugadas (listo, ajustes, puntuación) van a nuestros servidores, con un nombre inventado; no se guarda nada cuando la sala se cierra',
    ],
    neverTitle: 'Lo que nunca hacemos',
    never: [
      'No hace falta una cuenta para jugar: las cuentas son opcionales',
      'Ni anuncios ni seguimiento',
      'No vendemos ni compartimos nada con nadie',
    ],
    microphone:
      'El micrófono solo se usa mientras juegas a Cántala, y el sonido nunca se graba ni se envía',
    inDevelopment: '(en desarrollo)',
    accountsTitle: 'Cuentas',
    accountsLead:
      'Una cuenta es opcional. Te permite tener tus favoritos y mejores resultados en cualquier dispositivo y ver las clasificaciones. Solo guarda esto:',
    accounts: [
      'Un nombre de usuario y una contraseña (guardada cifrada, nunca legible), para entrar en tu cuenta',
      'Un nombre visible, lo único que ven los demás jugadores, en las clasificaciones. No tiene que ser tu nombre real',
      'Tus juegos favoritos, y cuántas veces has jugado a cada juego y tu mejor resultado',
      'Al borrar la cuenta, en la página de la cuenta, se borra todo al instante: no se guarda desactivada y no se puede recuperar',
      'En la página de la cuenta puedes borrar solo tus resultados (partidas, mejores resultados y puestos en las clasificaciones) y mantener la cuenta',
      'Tú eliges si apareces en las clasificaciones: no apareces hasta que lo activas en tu cuenta',
    ],
    accountsEmail:
      'Un correo solo si lo añades, que solo se usa para enviarte un enlace si olvidas la contraseña. Sin correo, una contraseña olvidada no se puede recuperar',
    emailUnavailable: 'Temporalmente no disponible (en desarrollo)',
    choiceTitle: 'Tu elección',
    choiceLabel: 'Recordar mis preferencias en este dispositivo',
    choiceOn: 'Tus preferencias se guardan en este dispositivo.',
    choiceOff:
      'No se guarda nada: los ajustes vuelven a los de siempre en cada visita. Solo se recuerda esta elección.',
    deleteSaved: 'Borrar mis datos guardados',
    deleted:
      'Hecho: se ha borrado todo lo que esta web guardaba en este dispositivo.',
  },

  notFound: {
    title: 'Ups, esta página no existe.',
    lead: 'Puede que el enlace sea antiguo o esté mal escrito.',
    back: 'Volver a los juegos',
    playInstead: 'Juega a esto',
  },

  page: {
    section: 'Juegos inteligentes',
    ages: age => `Desde ${age} años`,
    new: 'Nuevo',
    popular: 'Popular',
    hidden: 'Oculto',
    addFavorite: game => `Añadir ${game} a favoritos`,
    removeFavorite: game => `Quitar ${game} de favoritos`,
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
      'true-or-false': {
        name: 'Verdadero o falso',
        summary: 'Di si el resultado es correcto',
      },
      'your-answer': {
        name: 'Tu respuesta',
        summary: 'Marca el resultado en el teclado numérico',
      },
      'find-the-signs': {
        name: 'Encuentra los signos',
        summary: 'Elige + − × ÷ para que la igualdad sea cierta',
      },
    },
    timers: {
      timer: {
        name: 'Con tiempo',
        summary: 'Responde antes de que se acabe la barra',
      },
      'no-timer': {
        name: 'Sin tiempo',
        summary: 'Tómate tu tiempo; un fallo y se acaba',
      },
    },
    levels: {
      easy: { name: 'Fácil', summary: 'Suma y resta hasta 20' },
      normal: {
        name: 'Normal',
        summary: 'Números de dos cifras, como en el reloj',
      },
      hard: {
        name: 'Difícil',
        summary: 'Números de dos cifras y tablas de multiplicar',
      },
      advanced: {
        name: 'Avanzado',
        summary: 'Multiplica y divide con números de una cifra',
      },
      expert: {
        name: 'Experto',
        summary: 'Números de dos y tres cifras, las cuatro operaciones',
      },
    },
    signsLevels: {
      easy: { name: 'Fácil', summary: '+ y − con números hasta 20' },
      normal: { name: 'Normal', summary: '+ y − con números hasta 50' },
      hard: { name: 'Difícil', summary: '+, − y ×; la × va primero' },
      expert: {
        name: 'Experto',
        summary: 'Los cuatro signos; faltan dos o tres',
      },
    },
    bestScore: best => `Mejor puntuación: ${best}`,
    start: 'Empezar',
  },

  playing: {
    seconds: seconds => `${seconds} s`,
    noTimer: 'Sin tiempo',
    score: score => `Puntos ${score}`,
  },

  over: {
    outOfTime: 'Se acabó el tiempo',
    notQuite: '¡Casi!',
    correctAnswers: score => (score === 1 ? 'acierto' : 'aciertos'),
    newRecord: 'nuevo récord',
    best: best => `récord ${best}`,
    youAnswered: 'Tu respuesta',
    rightAnswer: 'La respuesta correcta era',
    playAgain: 'Jugar otra vez',
    changeSettings: 'Cambiar opciones',
  },

  trueOrFalse: {
    true: 'Verdadero',
    false: 'Falso',
    given: saysTrue => (saysTrue ? 'verdadero' : 'falso'),
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

  suggestions: {
    title: 'Buzón de sugerencias',
    lead: '¿Tienes en mente un juego que te gustaría ver aquí, quieres compartir tus dibujos o has visto un error?',
    rule: 'Cuéntanoslo: tu opinión nos importa y nos ayuda a mejorar.',
    noPersonalData:
      'No escribas tu nombre, tu dirección, tu colegio ni nada sobre ti. Si quieres, pide ayuda a un adulto.',
    categoryLabel: '¿De qué se trata?',
    categories: {
      'new-game': 'Un juego nuevo',
      improvement: 'Una mejora',
      drawing: 'Un dibujo',
      problem: 'Un problema',
      other: 'Otra cosa',
    },
    textLabel: 'Tu idea',
    imageLabel: 'Una imagen (opcional)',
    imageHint:
      'Tu privacidad nos importa: antes de enviar la imagen, tu navegador le quita los metadatos (como dónde y cuándo se hizo o el modelo de cámara) y la comprime.',
    chooseImage: 'Arrastra una imagen aquí o haz clic para elegirla',
    dropHere: 'Suéltala aquí',
    imageTypes: 'Fotos y dibujos del móvil o del ordenador (JPG, PNG, HEIC…)',
    imageAlt: 'La imagen que has elegido',
    imageError: 'Esa imagen no se puede usar. Prueba con otra.',
    removeImage: 'Quitar',
    send: 'Enviar',
    sending: 'Enviando…',
    sent: '¡Gracias! Tu idea se ha enviado.',
    failed: 'No se ha enviado. Inténtalo más tarde.',
  },

  feedback: {
    question: '¿Te gusta este juego?',
    votes: { up: 'Me gusta', down: 'No me gusta' },
    why: '¿Por qué? (opcional)',
    reasons: {
      fun: 'Es divertido',
      learned: 'He aprendido algo',
      'too-easy': 'Muy fácil',
      'too-hard': 'Muy difícil',
      boring: 'Aburrido',
      confusing: 'Difícil de entender',
      bug: 'Algo no funciona',
    },
    justSend: 'Enviar sin más',
    sending: 'Enviando…',
    thanks: '¡Gracias por contárnoslo!',
    failed: 'No se ha enviado. Inténtalo más tarde.',
  },

  letterGames: {
    lead: 'Aprende las vocales, completa las que faltan, ordena letras mezcladas o forma todas las palabras que puedas.',
    rule: 'En Forma palabras vale cualquier palabra real: la comprobamos con un diccionario que se descarga solo cuando juegas.',
    board: 'Juego de letras',
    modeGroup: 'Juego',
    modes: {
      'first-vowel': {
        name: 'Primera vocal',
        summary: 'Toca la vocal con la que empieza la palabra',
      },
      'missing-vowels': {
        name: 'Vocales perdidas',
        summary: 'Completa todas las vocales de la palabra',
      },
      'mixed-letters': {
        name: 'Letras mezcladas',
        summary: 'Ordena las letras; las palabras son cada vez más largas',
      },
      'word-builder': {
        name: 'Forma palabras',
        summary: 'Forma todas las palabras que puedas',
      },
    },
    levelGroup: 'Letras',
    builderLevels: {
      easy: { name: 'Fácil', summary: '5 letras' },
      normal: { name: 'Normal', summary: '7 letras' },
      hard: { name: 'Difícil', summary: '10 letras' },
    },
    timers: {
      timer:
        'Termina cada palabra antes de que se acabe la barra; en Forma palabras, busca hasta que se acabe',
      'no-timer': 'Sin prisa',
    },
    hintsGroup: 'Pistas',
    hints: {
      hints: {
        name: 'Con pistas',
        summary:
          'Tras 2 fallos se ilumina la siguiente letra; tras 5 y 10, se colocan las primeras letras',
      },
      'no-hints': { name: 'Sin pistas', summary: 'Resuélvelo tú solo' },
    },
    instructions: {
      'first-vowel': '¿Con qué vocal empieza?',
      'missing-vowels': 'Toca las vocales que faltan, en orden',
      'mixed-letters': 'Toca las letras en el orden correcto',
      'word-builder': 'Toca letras para formar una palabra y pulsa Comprobar',
    },
    progress: (word, total) => `Palabra ${word} de ${total}`,
    mistakes: mistakes => `Fallos ${mistakes}`,
    gap: 'Letra que falta',
    letters: 'Letras',
    answer: 'Tu palabra',
    delete: 'Borrar',
    check: 'Comprobar',
    keys: 'También puedes escribir las letras con el teclado; Retroceso quita la última',
    builderKeys:
      'Escribe letras con el teclado: Retroceso borra, Intro comprueba',
    found: (found, total) => `${found} de ${total} encontradas`,
    checks: {
      found: '¡Bien encontrada!',
      'already-found': 'Esa ya la tienes',
      'too-short': 'Usa al menos 3 letras',
      unknown: 'No conocemos esa palabra',
    },
    showWords: 'Ver las palabras',
    wordsShown: 'Aquí tienes todas las palabras',
    dictionary: {
      loading: 'Descargando el diccionario…',
      why: 'La primera vez que juegas descargamos el diccionario de tu idioma (unos 100 KB) para comprobar tus palabras. Tu navegador lo guarda para la próxima vez.',
      failed:
        'El diccionario no se ha descargado, así que solo cuentan las palabras ocultas.',
      credit: 'Diccionario: FrequencyWords (Hermit Dave), CC BY-SA 4.0',
    },
    report: 'Denunciar esta palabra',
    reportThanks: '¡Gracias! Revisaremos esa palabra.',
    newLetters: 'Otras letras',
    allFound: '¡Las has encontrado todas!',
    solved: '¡Muy bien!',
    summary: (words, mistakes) =>
      `${words} palabras · ${mistakes} ${mistakes === 1 ? 'fallo' : 'fallos'}`,
  },

  measureIt: {
    lead: 'Ángulos en un transportador, vasos de agua y rectas numéricas.',
    rule: 'Mira bien, responde y pulsa Comprobar. Diez seguidos.',
    board: 'A medir',
    modeGroup: 'Qué medir',
    modes: {
      'read-angle': {
        name: 'Lee el ángulo',
        summary: '¿Cuántos grados tiene el ángulo?',
      },
      'set-angle': {
        name: 'Forma el ángulo',
        summary: 'Gira la línea hasta formar el ángulo pedido.',
      },
      'fill-glass': {
        name: 'Vaso de agua',
        summary: '¿Cuánto está lleno el vaso: 1/2, 1/3, 3/4…?',
      },
      'number-line': {
        name: 'Recta numérica',
        summary: '¿Qué número está en la x?',
      },
    },
    levels: {
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil',
      expert: 'Experto',
    },
    levelSummaries: {
      'read-angle': {
        easy: 'De 30° en 30°, con números',
        normal: 'De 10° en 10°, marcas sin números',
        hard: 'De 5° en 5°, solo el ángulo recto marcado',
        expert: 'Cualquier ángulo, sin marcas',
      },
      'set-angle': {
        easy: 'De 30° en 30°, con números',
        normal: 'De 10° en 10°, marcas sin números',
        hard: 'De 5° en 5°, solo el ángulo recto marcado',
        expert: 'Cualquier ángulo, sin marcas',
      },
      'fill-glass': {
        easy: 'Medios y cuartos',
        normal: 'Medios, tercios y cuartos',
        hard: 'Hasta octavos',
        expert: 'Hasta 10 vasos, fracciones como 7/2',
      },
      'number-line': {
        easy: 'De 1 en 1',
        normal: 'De 2 en 2 y de 5 en 5',
        hard: 'De 10, 25 y 50',
        expert: 'Medios, cuartos y números bajo cero',
      },
    },
    hintsGroup: 'Pistas',
    hintOptions: {
      hints: {
        name: 'Con pistas',
        summary: 'Si fallas, recibes una pista y otro intento',
      },
      'no-hints': { name: 'Sin pistas', summary: 'Un intento por ejercicio' },
    },
    aim: { more: 'Un poco más ↑', less: 'Un poco menos ↓' },
    whichAngle: '¿Cuántos grados?',
    makeAngle: angle => `Forma ${angle}°`,
    howFull: '¿Cuánto está lleno?',
    whichNumber: '¿Qué número es x?',
    yourAnswer: 'Tu respuesta',
    check: 'Comprobar',
    progress: (exercise, total) => `${exercise} de ${total}`,
    done: 'Terminado',
    summary: (right, total) => `${right} de ${total} bien`,
  },

  climbTower: {
    lead: 'Cada respuesta correcta te sube un piso. Si fallas, te caes.',
    rule: '¿Hasta dónde puedes subir?',
    board: 'Sube la torre',
    modeGroup: 'Juego',
    modes: {
      'true-or-false': {
        name: 'Verdadero o falso',
        summary: '¿Está bien el resultado? Responde para saltar.',
      },
      'which-one': {
        name: '¿Cuál es?',
        summary:
          'Salta a la plataforma cuya operación da el número de la caja.',
      },
    },
    answers: 'Respuestas',
    floors: floors => `Piso ${floors}`,
    best: floors => `Récord: piso ${floors}`,
    fell: '¡Te caíste!',
    summary: floors =>
      floors === 1 ? '1 piso subido' : `${floors} pisos subidos`,
  },

  howMany: {
    lead: 'Cuenta las cosas del tablero y toca cuántas hay.',
    rule: '¡Toca cada una para contarla en voz alta!',
    board: 'Juego de contar',
    levels: {
      easy: { name: 'Del 1 al 3', summary: 'Hasta tres cosas' },
      normal: { name: 'Del 1 al 5', summary: 'Hasta cinco cosas' },
    },
    question: '¿Cuántos hay?',
    tapHint: 'Toca cada uno para contar',
    countThis: 'Cuenta este',
    great: '¡Muy bien!',
    tryAgain: '¡Prueba otra vez!',
    done: '¡Lo has conseguido!',
    summary: (stars, total) => `${stars} ${stars === 1 ? 'estrella' : 'estrellas'} de ${total}`,
    progress: (done, total) => `Ronda ${Math.min(done + 1, total)} de ${total}`,
    soundOn: 'Sonido activado: toca para silenciar',
    soundOff: 'Sonido desactivado: toca para oír los números',
  },

  findPairs: {
    lead: 'Gira dos cartas. ¿El mismo dibujo? Se quedan boca arriba. Si no, se vuelven a girar.',
    rule: 'Recuerda dónde está cada dibujo y encuentra todas las parejas con los menos movimientos posibles.',
    board: 'Cartas',
    levels: {
      easy: { name: 'Fácil', summary: '12 cartas · 6 parejas' },
      normal: { name: 'Normal', summary: '24 cartas · 12 parejas' },
      hard: { name: 'Difícil', summary: '30 cartas · 15 parejas' },
      expert: { name: 'Experto', summary: '36 cartas · 18 parejas' },
    },
    moves: moves => `Movimientos ${moves}`,
    pairs: (found, total) => `Parejas ${found}/${total}`,
    card: number => `Carta ${number}, boca abajo`,
    done: '¡Todas las parejas encontradas!',
    summary: (moves, time) =>
      `En ${moves} ${moves === 1 ? 'movimiento' : 'movimientos'} y ${time}`,
    best: moves => `Récord: ${moves} movimientos`,
    newGame: 'Nueva partida',
  },

  hitTheNote: {
    lead: 'Encuentra la nota que oyes, di si la segunda nota es más aguda o más grave, o cántala al micrófono.',
    rule: 'Cántala usa el micrófono solo mientras juegas: el sonido no sale de tu dispositivo y nunca se graba.',
    board: 'Juego de música',
    modeGroup: 'Juego',
    modes: {
      'find-the-note': {
        name: 'Encuentra la nota',
        summary: 'Escucha una nota y toca su nombre',
      },
      'higher-or-lower': {
        name: '¿Sube o baja?',
        summary: 'Escucha dos notas: ¿la segunda sube o baja?',
      },
      'sing-it': { name: 'Cántala', summary: 'Escucha una nota y cántala' },
    },
    levelGroup: 'Nivel',
    levels: {
      easy: {
        name: 'Fácil',
        summary: 'Do, Re y Mi · saltos grandes · fácil de afinar',
      },
      normal: { name: 'Normal', summary: 'De Do a Sol · saltos más pequeños' },
      hard: {
        name: 'Difícil',
        summary: 'Toda la escala, de Do a Si · notas cercanas',
      },
      expert: {
        name: 'Experto',
        summary:
          'Las 12 notas, también los sostenidos · de una en una · afina con mucha precisión',
      },
    },
    instructions: {
      'find-the-note': '¿Qué nota es?',
      'higher-or-lower': '¿La segunda nota es más aguda o más grave?',
      'sing-it': 'Escucha y luego canta la nota y mantenla',
    },
    progress: (round, total) => `Ronda ${round} de ${total}`,
    mistakes: mistakes => `Fallos ${mistakes}`,
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
    notes: 'Notas',
    listen: 'Escuchar otra vez',
    listenTwo: 'Escuchar las dos otra vez',
    directions: {
      higher: 'Más aguda',
      lower: 'Más grave',
    },
    startSinging: 'Empezar a cantar',
    micPrivacy:
      'Tu navegador pedirá permiso para usar el micrófono. El sonido no sale de este dispositivo: nunca se graba ni se envía.',
    micAsking: 'Esperando al micrófono…',
    micDenied:
      'El micrófono está bloqueado. Permítelo en tu navegador o salta esta ronda.',
    micUnavailable:
      'No hay micrófono en este dispositivo. Puedes saltar las rondas.',
    meter: 'Lo cerca que está tu voz de la nota',
    singHints: {
      done: '¡Afinado! ¡Muy bien!',
      silent: 'Canta ahora: «aaah»…',
      hold: '¡Eso es, mantenla…!',
      low: 'Un poco más agudo ⬆',
      high: 'Un poco más grave ⬇',
    },
    skip: 'Saltar',
    solved: '¡Muy bien!',
    summary: (right, total) => `${right} de ${total} a la primera`,
  },

  admin: {
    title: 'Administración',
    lead: 'Activa o desactiva juegos, mira qué se juega y modera sugerencias y palabras denunciadas.',
    email: 'Correo electrónico',
    password: 'Contraseña',
    wrongCredentials: 'Correo o contraseña incorrectos.',
    tooManyTries: 'Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.',
    offline: 'Ahora no se puede conectar con la API. Inténtalo más tarde.',
    checking: 'Comprobando…',
    signIn: 'Entrar',
    signOut: 'Salir',
    tabs: {
      games: 'Juegos',
      plays: 'Partidas y valoraciones',
      suggestions: 'Sugerencias',
      words: 'Palabras denunciadas',
      errors: 'Errores',
      team: 'Equipo',
      account: 'Cuenta',
    },
    saveFailed:
      'El cambio no se ha guardado. Revisa la API e inténtalo de nuevo.',
    errorsHelp: 'Errores de la API y de los navegadores de los visitantes, los últimos primero. Quita uno cuando esté arreglado.',
    noErrors: 'Sin errores. ¡Todo bien!',
    clearErrors: 'Borrar todos',
    confirmClearErrors: '¿Borrar todos los errores del registro?',
    resolveError: 'Arreglado',
    firstSeen: moment => `Primero: ${moment}`,
    errorSources: { api: 'API', site: 'Web' },
    errorColumns: { when: 'Último', code: 'Código', title: 'Título', problem: 'Problema', page: 'Página', count: 'Veces', actions: 'Acciones' },
    loading: 'Cargando…',
    previewTitle: 'Modo vista previa',
    previewHelp: hiddenBadge =>
      `Este navegador muestra todos los juegos, abiertos o no, marcados como «${hiddenBadge}» si están ocultos.`,
    gamesTitle: 'Juegos',
    open: 'Abierto para todos',
    hidden: 'Oculto al público',
    byDefault: open => `por defecto: ${open ? 'abierto' : 'oculto'}`,
    periodGroup: 'Periodo',
    periods: { all: 'Siempre', day: 'Hoy', week: 'Esta semana', month: 'Este mes', year: 'Este año' },
    resetStats: 'Reiniciar estadísticas',
    confirmResetStats: '¿Borrar todas las partidas y los 👍/👎 contados hasta ahora, para que las estadísticas empiecen de nuevo hoy? No se puede deshacer.',
    statsReset: 'Las estadísticas empiezan de nuevo desde hoy.',
    playsTotal: total => `${total} partidas en total`,
    refresh: 'Actualizar',
    playsColumns: { game: 'Juego', plays: 'Partidas', reasons: 'Motivos' },
    suggestionStatuses: {
      new: 'Nuevas',
      read: 'Leídas',
      archived: 'Archivadas',
    },
    showPicture: 'Ver imagen',
    pictureAlt: 'Imagen enviada con la sugerencia',
    moveTo: status => `Mover a ${status}`,
    delete: 'Borrar',
    confirmDelete: '¿Borrar esta sugerencia y su imagen para siempre?',
    noSuggestions: 'No hay sugerencias aquí.',
    reportStatuses: {
      pending: 'Pendientes',
      approved: 'Bloqueadas',
      rejected: 'Permitidas',
    },
    reportsHelp:
      'Una palabra denunciada 3 veces deja de contar en Forma palabras hasta que decidas.',
    reportColumns: {
      word: 'Palabra',
      language: 'Idioma',
      reports: 'Denuncias',
      firstReported: 'Primera denuncia',
    },
    keepOut: 'Bloquear',
    letCount: 'Permitir',
    noWords: 'No hay palabras aquí.',
    featuresTitle: 'Funciones',
    featuresHelp:
      'Las funciones nuevas empiezan desactivadas: pruébalas en vista previa y luego ábrelas a todos.',
    featureNames: {
      rooms: 'Jugar juntos (salas)',
      'rooms-math-games': 'Matemáticas en salas',
      'rooms-measure-it': 'A medir en salas',
      'rooms-letter-games': 'Juegos de letras en salas',
      'rooms-sliding-puzzle': 'Puzle deslizante en salas',
      'rooms-turn-picture': 'Gira la imagen en salas',
      'rooms-place-pieces': 'Coloca las piezas en salas',
      'answer-words': 'Respuestas con palabras (ajuste)',
      'category-menu': 'Menú de categorías',
      accounts: 'Cuentas de jugador',
      leaderboard: 'Clasificación',
    },
    multiplayerTitle: 'Juegos multijugador',
    multiplayerHelp:
      'Cada juego tiene su propio interruptor para las salas, aparte del de jugar solo: un juego puede estar abierto y seguir cerrado en las salas.',
    addMember: 'Añadir a alguien al equipo',
    roleLabel: 'Rol',
    roleHelp: {
      moderator:
        'Lee sugerencias, decide sobre las palabras denunciadas y ve partidas y valoraciones.',
      tester:
        'Como un moderador, y además ve en vista previa todos los juegos y funciones, incluso los desactivados.',
    },
    makeTester: 'Hacer tester',
    makeModerator: 'Hacer moderador',
    startingPassword: 'Contraseña inicial (opcional)',
    startingPasswordHelp:
      'Déjala vacía para obtener un enlace de invitación: elegirá su propia contraseña.',
    add: 'Añadir',
    alreadyOnTeam: 'Ya hay alguien en el equipo con ese correo.',
    inviteFor: email =>
      `Enlace de invitación para ${email}: cópialo y envíaselo.`,
    copy: 'Copiar',
    copied: 'Copiado',
    inviteExpires: day => `Funciona una sola vez, hasta el ${day}.`,
    roles: {
      super: 'Superadministrador',
      moderator: 'Moderador',
      tester: 'Tester',
    },
    invited: 'Invitado, aún sin contraseña',
    active: 'Activo',
    inactive: 'Desactivado',
    newLink: 'Nuevo enlace de invitación',
    activate: 'Activar',
    deactivate: 'Desactivar',
    changePassword: 'Cambiar contraseña',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    repeatPassword: 'Repite la nueva contraseña',
    passwordRule: min => `Al menos ${min} caracteres.`,
    passwordChanged:
      'Contraseña cambiada. Se ha cerrado la sesión en los demás navegadores con tu cuenta.',
    wrongPassword: 'La contraseña actual no es correcta.',
    passwordsDiffer: 'Las dos contraseñas no coinciden.',
    inviteTitle: 'Únete al equipo de administración',
    inviteLead: email => `Elige una contraseña para ${email}.`,
    acceptInvite: 'Guardar y entrar',
    inviteInvalid: 'Este enlace de invitación ya no funciona. Pide uno nuevo.',
  },

  rooms: {
    navLink: 'Jugar juntos',
    title: 'Jugar juntos',
    lead: 'Jugad al mismo juego a la vez, hasta 4 jugadores, cada uno en su dispositivo.',
    rule: 'Crea una sala y comparte su código, o entra en una con un código.',
    create: 'Crear una sala',
    joinTitle: 'Entrar en una sala',
    codeLabel: 'Código de la sala',
    join: 'Entrar',
    homeTitle: 'Jugar juntos',
    homeText:
      'Hasta 4 jugadores, los mismos ejercicios a la vez. ¿Quién acierta más?',
    errors: {
      'not-found':
        'No hay ninguna sala con ese código. Revísalo o pide uno nuevo.',
      full: 'Esa sala está llena: ya tiene 4 jugadores.',
      'in-game':
        'En esa sala se está jugando ahora. Vuelve a probar cuando acabe la ronda.',
      'not-host': 'Solo el anfitrión de la sala puede hacerlo.',
      'not-ready':
        'Primero tiene que estar todo el mundo listo, con al menos 2 jugadores.',
      'wrong-phase': 'Ahora no se puede hacer eso.',
      invalid: 'Ese código no parece correcto: tiene 6 letras y números.',
      'too-many': 'Demasiados intentos. Espera un minuto y vuelve a probar.',
      offline:
        'Ahora no se puede conectar con las salas. Revisa tu conexión y vuelve a probar.',
    },
    connecting: 'Conectando…',
    reconnecting: 'Reconectando…',
    roomCode: 'Código de la sala',
    copyLink: 'Copiar enlace',
    copied: 'Copiado',
    players: (count, max) => `Jugadores ${count}/${max}`,
    host: 'Anfitrión',
    you: 'Tú',
    ready: 'Listo',
    notReady: 'No está listo',
    away: 'Fuera',
    imReady: 'Estoy listo',
    notReadyYet: 'Aún no estoy listo',
    start: 'Empezar',
    needPlayers: min => `Hacen falta al menos ${min} jugadores.`,
    waitingForReady: 'Esperando a que todos estén listos…',
    waitingForHost: 'Esperando a que el anfitrión empiece…',
    settingsTitle: 'Ajustes del juego',
    gameGroup: 'Juego',
    roundLength: 'Duración de la ronda',
    showScores: 'Puntuación durante la ronda',
    scoresShown: 'Ver la puntuación',
    scoresHidden: 'Puntuación solo al final',
    seconds: seconds => `${seconds} s`,
    getReady: '¡Preparados!',
    timeLeft: seconds => `Quedan ${seconds} s`,
    yourScore: score => `Tu puntuación: ${score}`,
    resultsTitle: 'Resultados',
    place: place => `${place}.º`,
    points: points => `${points} ${points === 1 ? 'punto' : 'puntos'}`,
    playAgain: 'Jugar otra vez',
    leave: 'Salir de la sala',
    kick: 'Quitar',
    kicked: 'El anfitrión te ha quitado de la sala.',
    gameUnavailable: 'Este juego no está abierto en las salas ahora mismo.',
    animals: ANIMALS,
    nickname: (adjective, animal) =>
      `${ANIMALS[animal]} ${ADJECTIVES[adjective]}`,
  },

  account: {
    navLink: 'Cuenta',
    title: 'Tu cuenta',
    lead: 'Con una cuenta, tus favoritos y mejores resultados te acompañan en cualquier dispositivo, y puedes ver las clasificaciones.',
    rule: 'Entra o crea una cuenta: se tarda un minuto y es opcional.',
    loading: 'Cargando…',
    signInTab: 'Entrar',
    signUpTab: 'Crear una cuenta',
    forgotTab: 'He olvidado la contraseña',
    loginName: 'Nombre de usuario',
    loginNameHint: 'De 3 a 30 letras (a–z), números, puntos, guiones o guiones bajos. Solo lo ves tú, para entrar.',
    loginOrEmail: 'Nombre de usuario o correo',
    password: 'Contraseña',
    passwordRule: min => `Al menos ${min} caracteres.`,
    repeatPassword: 'Repite la contraseña',
    passwordsDiffer: 'Las contraseñas no son iguales.',
    screenName: 'Nombre visible',
    screenNameHint: 'De 3 a 20 letras, números o espacios. Los demás jugadores lo ven en las clasificaciones.',
    screenNameTip:
      'Tu nombre visible es lo que ven los demás jugadores. No tiene que ser tu nombre real: invéntate uno, como «Cohete Azul». Si prefieres, puedes usar tu nombre real. Puedes cambiarlo después.',
    screenNameTipLabel: 'Sobre el nombre visible',
    showOnLeaderboard: 'Mostrarme en las clasificaciones',
    showOnLeaderboardHint:
      'Los demás jugadores ven tu nombre visible y tus mejores resultados. Desactivado hasta que lo actives; puedes cambiarlo cuando quieras.',
    email: 'Correo (opcional)',
    emailHint: 'Solo se usa para enviarte un enlace si olvidas la contraseña. Nadie más lo ve.',
    noEmailWarning: 'Sin correo, una contraseña olvidada no se puede recuperar: apúntala en un lugar seguro.',
    signIn: 'Entrar',
    signUp: 'Crear mi cuenta',
    syncNote: 'Los favoritos y mejores resultados de este dispositivo se añaden a tu cuenta.',
    forgotLead: 'Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva.',
    sendLink: 'Enviar el enlace',
    linkSent: 'Si alguna cuenta tiene este correo, el enlace va de camino. Funciona durante una hora.',
    sending: 'Enviando…',
    signedInAs: screenName => `Has entrado como ${screenName}`,
    loginNameIs: loginName => `Nombre de usuario: ${loginName}`,
    signOut: 'Salir',
    detailsTitle: 'Tus datos',
    emailNeedsPassword: 'Para cambiar o quitar el correo, escribe también tu contraseña.',
    currentPassword: 'Tu contraseña',
    save: 'Guardar',
    saved: 'Guardado.',
    passwordTitle: 'Cambiar la contraseña',
    newPassword: 'Contraseña nueva',
    changePassword: 'Cambiar la contraseña',
    passwordChanged: 'La contraseña se ha cambiado.',
    resultsTitle: 'Borrar mis resultados',
    resultsLead:
      'Esto borra tus partidas y mejores resultados en tu cuenta y en este dispositivo, y te quita de las clasificaciones. Tu cuenta y tus favoritos se quedan.',
    deleteResults: 'Borrar mis resultados',
    confirmDeleteResults: '¿Borrar todos tus resultados para siempre?',
    resultsDeleted: 'Tus resultados se han borrado.',
    deleteTitle: 'Borrar la cuenta',
    deleteLead: 'Esto borra para siempre tu cuenta, tus favoritos y resultados guardados en ella, y tu puesto en las clasificaciones.',
    deleteAccount: 'Borrar mi cuenta',
    confirmDelete: '¿Borrar tu cuenta para siempre?',
    deleted: 'Tu cuenta se ha borrado.',
    problems: {
      invalid: 'Algo no está bien: revisa lo que has escrito.',
      'wrong-login': 'El nombre de usuario o la contraseña no son correctos.',
      'wrong-password': 'La contraseña no es correcta.',
      'login-taken': 'Este nombre de usuario ya existe: prueba otro.',
      'screen-name-taken': 'Este nombre visible ya existe: prueba otro.',
      'email-taken': 'Otra cuenta tiene este correo.',
      'email-unavailable': 'Ahora no se pueden enviar correos, así que la cuenta aún no puede tener uno.',
      'not-found': 'Este enlace ya no funciona: pide uno nuevo.',
      'too-many': 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
      offline: 'No se puede conectar con el servidor de los juegos. Inténtalo de nuevo en un momento.',
    },
    resetTitle: 'Elige una contraseña nueva',
    resetLead: 'Escribe tu contraseña nueva dos veces. Después entrarás en tu cuenta.',
    resetSave: 'Guardar la contraseña',
    resetDone: 'Tu contraseña se ha cambiado y has entrado en tu cuenta.',
  },

  leaderboard: {
    navLink: 'Clasificación',
    title: 'Clasificación',
    lead: 'Los mejores resultados de los jugadores con cuenta, para cada juego y ajuste. Solo se muestran los nombres visibles.',
    rule: 'Elige un juego para ver sus tablas.',
    signInFirst: 'Las clasificaciones son para jugadores con cuenta.',
    signInLink: 'Entra o crea una cuenta',
    gameGroup: 'Juego',
    loading: 'Cargando…',
    failed: 'Ahora no se puede cargar la clasificación. Inténtalo de nuevo en un momento.',
    empty: 'Nadie ha jugado aún a este juego con cuenta. ¡Sé el primero!',
    columns: { place: 'Puesto', name: 'Nombre visible', plays: 'Partidas', best: 'Mejor' },
    you: 'tú',
    youreHidden: 'No apareces en las clasificaciones.',
    changeInAccount: 'Cámbialo en tu cuenta',
  },
};
