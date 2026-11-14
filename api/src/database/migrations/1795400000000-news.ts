import { MigrationInterface, QueryRunner } from 'typeorm';

const EARLIER_NEWS = [
  {
    "version": 1,
    "published": "2026-11-07T01:45:00+01:00",
    "privacy": true,
    "kind": "game",
    "game": "math-games",
    "feature": null,
    "text": {
      "en": "Math games: true or false, number pad and find the signs",
      "es": "Juegos de matemáticas: verdadero o falso, teclado numérico y encuentra los signos",
      "eu": "Matematika jokoak: egia ala gezurra, zenbaki-teklatua eta aurkitu zeinuak",
      "it": "Giochi di matematica: vero o falso, tastierino numerico e trova i segni",
      "uk": "Математичні ігри: правда чи неправда, цифрова клавіатура й знайди знаки"
    }
  },
  {
    "version": 2,
    "published": "2026-11-07T16:30:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "sliding-puzzle",
    "feature": null,
    "text": {
      "en": "New game: Sliding puzzle, with lines or a drawing",
      "es": "Nuevo juego: Puzle deslizante, con líneas o con un dibujo",
      "eu": "Joko berria: Puzzle irristakorra, lerroekin edo marrazki batekin",
      "it": "Nuovo gioco: Puzzle scorrevole, con linee o con un disegno",
      "uk": "Нова гра: П’ятнашки, з лініями або малюнком"
    }
  },
  {
    "version": 2,
    "published": "2026-11-07T16:30:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "turn-picture",
    "feature": null,
    "text": {
      "en": "New game: Turn the picture",
      "es": "Nuevo juego: Gira la imagen",
      "eu": "Joko berria: Biratu irudia",
      "it": "Nuovo gioco: Gira il disegno",
      "uk": "Нова гра: Поверни малюнок"
    }
  },
  {
    "version": 2,
    "published": "2026-11-07T16:30:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "place-pieces",
    "feature": null,
    "text": {
      "en": "New game: Place the pieces",
      "es": "Nuevo juego: Coloca las piezas",
      "eu": "Joko berria: Kokatu piezak",
      "it": "Nuovo gioco: Metti a posto i pezzi",
      "uk": "Нова гра: Розклади шматочки"
    }
  },
  {
    "version": 2,
    "published": "2026-11-07T16:30:00+01:00",
    "privacy": false,
    "kind": "settings",
    "game": null,
    "feature": null,
    "text": {
      "en": "Game colours for every game, in the settings",
      "es": "Colores del juego para todos los juegos, en los ajustes",
      "eu": "Jokoaren koloreak joko guztietarako, ezarpenetan",
      "it": "Colori del gioco per tutti i giochi, nelle impostazioni",
      "uk": "Кольори гри для всіх ігор, у налаштуваннях"
    }
  },
  {
    "version": 2,
    "published": "2026-11-07T16:30:00+01:00",
    "privacy": false,
    "kind": "language",
    "game": null,
    "feature": null,
    "text": {
      "en": "Play in English, Spanish or Basque, in the settings",
      "es": "Juega en inglés, español o euskera, en los ajustes",
      "eu": "Jokatu ingelesez, gaztelaniaz edo euskaraz, ezarpenetan",
      "it": "Gioca in inglese, spagnolo o basco, nelle impostazioni",
      "uk": "Грай англійською, іспанською чи баскською, у налаштуваннях"
    }
  },
  {
    "version": 3,
    "published": "2026-11-07T17:30:00+01:00",
    "privacy": true,
    "kind": "privacy",
    "game": null,
    "feature": null,
    "text": {
      "en": "New Privacy page: choose whether this device remembers your preferences, or delete what is saved",
      "es": "Nueva página de Privacidad: elige si este dispositivo recuerda tus preferencias o borra lo guardado",
      "eu": "Pribatutasun orri berria: aukeratu gailu honek zure hobespenak gogoratzen dituen, edo ezabatu gordetakoa",
      "it": "Nuova pagina Privacy: scegli se questo dispositivo ricorda le tue preferenze, o elimina ciò che è salvato",
      "uk": "Нова сторінка «Приватність»: обери, чи пам’ятає цей пристрій твої налаштування, або видали збережене"
    }
  },
  {
    "version": 4,
    "published": "2026-11-07T19:00:00+01:00",
    "privacy": false,
    "kind": "language",
    "game": null,
    "feature": null,
    "text": {
      "en": "The games are now in Ukrainian too, in the settings",
      "es": "Los juegos ya están también en ucraniano, en los ajustes",
      "eu": "Jokoak ukraineraz ere badaude, ezarpenetan",
      "it": "I giochi ora sono anche in ucraino, nelle impostazioni",
      "uk": "Ігри тепер є й українською, у налаштуваннях"
    }
  },
  {
    "version": 5,
    "published": "2026-11-07T21:00:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "letter-games",
    "feature": null,
    "text": {
      "en": "New game: Letter games, with vowels, mixed letters and a word builder",
      "es": "Nuevo juego: Juegos de letras, con vocales, letras mezcladas y forma palabras",
      "eu": "Joko berria: Letra jokoak, bokalekin, letra nahasiekin eta hitz-sortzailearekin",
      "it": "Nuovo gioco: Giochi di lettere, con vocali, lettere mescolate e forma parole",
      "uk": "Нова гра: Ігри з буквами — голосні, перемішані букви та складання слів"
    }
  },
  {
    "version": 5,
    "published": "2026-11-07T21:00:00+01:00",
    "privacy": false,
    "kind": "feature",
    "game": null,
    "feature": null,
    "text": {
      "en": "Games are grouped by category, each with its own recommended age",
      "es": "Los juegos están agrupados por categorías, cada uno con su edad recomendada",
      "eu": "Jokoak kategoriatan sailkatuta daude, bakoitza bere adin gomendatuarekin",
      "it": "I giochi sono raggruppati per categorie, ognuna con la sua età consigliata",
      "uk": "Ігри згруповано за категоріями, у кожної — своя рекомендована вікова група"
    }
  },
  {
    "version": 6,
    "published": "2026-11-08T12:00:00+01:00",
    "privacy": true,
    "kind": "feature",
    "game": null,
    "feature": null,
    "text": {
      "en": "Tell us what you think of each game with 👍 or 👎, below the game",
      "es": "Dinos qué te parece cada juego con 👍 o 👎, debajo del juego",
      "eu": "Esaiguzu zer iruditzen zaizun joko bakoitza 👍 edo 👎 erabiliz, jokoaren azpian",
      "it": "Di’ cosa pensi di ogni gioco con 👍 o 👎, sotto il gioco",
      "uk": "Розкажи, як тобі кожна гра, за допомогою 👍 або 👎 під грою"
    }
  },
  {
    "version": 6,
    "published": "2026-11-08T12:00:00+01:00",
    "privacy": true,
    "kind": "feature",
    "game": null,
    "feature": null,
    "text": {
      "en": "New page to suggest ideas, with a drawing if you like",
      "es": "Nueva página para sugerir ideas, con un dibujo si quieres",
      "eu": "Ideiak proposatzeko orri berria, marrazki batekin nahi baduzu",
      "it": "Nuova pagina per suggerire idee, con un disegno se vuoi",
      "uk": "Нова сторінка, щоб запропонувати ідею, за бажанням із малюнком"
    }
  },
  {
    "version": 6,
    "published": "2026-11-08T12:00:00+01:00",
    "privacy": true,
    "kind": "game",
    "game": "letter-games",
    "feature": null,
    "text": {
      "en": "Word builder: any real word counts, and you can report rude ones",
      "es": "Forma palabras: vale cualquier palabra real, y puedes denunciar las groseras",
      "eu": "Hitz-sortzailea: edozein hitz errealek balio du, eta zakarrak sala ditzakezu",
      "it": "Forma parole: vale qualsiasi parola vera, e puoi segnalare quelle volgari",
      "uk": "«Склади слова»: зараховується будь-яке справжнє слово, а на грубі можна поскаржитися"
    }
  },
  {
    "version": 7,
    "published": "2026-11-08T18:00:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "hit-the-note",
    "feature": null,
    "text": {
      "en": "New game: Hit the note, find, compare and sing notes",
      "es": "Nuevo juego: Dando la nota, encuentra, compara y canta notas",
      "eu": "Joko berria: Asmatu nota, aurkitu, alderatu eta abestu notak",
      "it": "Nuovo gioco: Prendi la nota, trova, confronta e canta le note",
      "uk": "Нова гра: Влуч у ноту — знаходь, порівнюй і співай ноти"
    }
  },
  {
    "version": 8,
    "published": "2026-11-08T20:00:00+01:00",
    "privacy": false,
    "kind": "feature",
    "game": null,
    "feature": null,
    "text": {
      "en": "What’s new is now on the home page, so you never miss a change",
      "es": "Las novedades están ahora en la página principal, para que no te pierdas nada",
      "eu": "Berritasunak orri nagusian daude orain, ezer gal ez dezazun",
      "it": "Le novità ora sono nella pagina principale, così non ti perdi niente",
      "uk": "Новини тепер на головній сторінці, щоб ти нічого не пропустив"
    }
  },
  {
    "version": 9,
    "published": "2026-11-08T21:00:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "measure-it",
    "feature": null,
    "text": {
      "en": "New game: Measure it, with angles, glasses of water and number lines",
      "es": "Nuevo juego: A medir, con ángulos, vasos de agua y rectas numéricas",
      "eu": "Joko berria: Neurtu, angeluekin, ur-basoekin eta zenbaki-zuzenekin",
      "it": "Nuovo gioco: Misuralo, con angoli, bicchieri d’acqua e rette numeriche",
      "uk": "Нова гра: Виміряй, з кутами, склянками води і числовими прямими"
    }
  },
  {
    "version": 10,
    "published": "2026-11-08T22:00:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "climb-tower",
    "feature": null,
    "text": {
      "en": "New game: Climb the tower, true or false and which one",
      "es": "Nuevo juego: Sube la torre, verdadero o falso y cuál es",
      "eu": "Joko berria: Igo dorrea, egia ala gezurra eta zein da",
      "it": "Nuovo gioco: Scala la torre, vero o falso e quale",
      "uk": "Нова гра: Піднімись на вежу, правда чи ні та який саме"
    }
  },
  {
    "version": 11,
    "published": "2026-11-08T22:30:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "find-pairs",
    "feature": null,
    "text": {
      "en": "New game: Find the pairs, turn the cards and remember the pictures",
      "es": "Nuevo juego: Encuentra las parejas, gira las cartas y recuerda los dibujos",
      "eu": "Joko berria: Aurkitu bikoteak, biratu kartak eta gogoratu marrazkiak",
      "it": "Nuovo gioco: Trova le coppie, gira le carte e ricorda i disegni",
      "uk": "Нова гра: Знайди пари, перевертай картки й запам’ятовуй картинки"
    }
  },
  {
    "version": 12,
    "published": "2026-11-08T23:00:00+01:00",
    "privacy": false,
    "kind": "language",
    "game": null,
    "feature": null,
    "text": {
      "en": "Italian translation added",
      "es": "Añadida la traducción al italiano",
      "eu": "Italierazko itzulpena gehitu da",
      "it": "Aggiunta la traduzione in italiano",
      "uk": "Додано італійський переклад"
    }
  },
  {
    "version": 13,
    "published": "2026-11-09T12:00:00+01:00",
    "privacy": false,
    "kind": "game",
    "game": "how-many",
    "feature": null,
    "text": {
      "en": "New game: How many?, count from 1 to 5, for the youngest",
      "es": "Nuevo juego: ¿Cuántos hay?, contar del 1 al 5, para los más peques",
      "eu": "Joko berria: Zenbat daude?, 1etik 5era zenbatu, txikienentzat",
      "it": "Nuovo gioco: Quanti sono?, contare da 1 a 5, per i più piccoli",
      "uk": "Нова гра: Скільки?, лічба від 1 до 5, для найменших"
    }
  },
  {
    "version": 14,
    "published": "2026-11-12T12:00:00+01:00",
    "privacy": false,
    "kind": "feature",
    "game": null,
    "feature": "room-reactions",
    "text": {
      "en": "Stickers hand-drawn by Lucia, to send to your friends in rooms",
      "es": "Pegatinas dibujadas a mano por Lucía, para enviar a tus amigos en las salas",
      "eu": "Luciak eskuz marraztutako pegatinak, geletan lagunei bidaltzeko",
      "it": "Adesivi disegnati a mano da Lucia, da inviare agli amici nelle stanze",
      "uk": "Наліпки, які намалювала Луся, щоб надсилати друзям у кімнатах"
    }
  },
  {
    "version": 15,
    "published": "2026-11-14T12:00:00+01:00",
    "privacy": true,
    "kind": "feature",
    "game": null,
    "feature": "offline",
    "text": {
      "en": "The games keep working without internet, and what you send waits until you’re back online",
      "es": "Los juegos siguen funcionando sin internet, y lo que envías espera hasta que vuelva la conexión",
      "eu": "Jokoek internetik gabe ere funtzionatzen dute, eta bidaltzen duzuna konexioa itzuli arte itxaroten du",
      "it": "I giochi funzionano anche senza internet, e ciò che invii aspetta finché torna la connessione",
      "uk": "Ігри працюють і без інтернету, а те, що ти надсилаєш, чекає, доки повернеться зʼєднання"
    }
  }
];

export class News1795400000000 implements MigrationInterface {
  name = 'News1795400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE news (id serial PRIMARY KEY, version integer NOT NULL, published timestamptz NOT NULL, kind varchar(20) NOT NULL, game varchar(40), feature varchar(40), privacy boolean NOT NULL DEFAULT false, text jsonb NOT NULL)',
    );
    for (const item of EARLIER_NEWS) {
      await queryRunner.query(
        'INSERT INTO news (version, published, kind, game, feature, privacy, text) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.version, item.published, item.kind, item.game, item.feature, item.privacy, JSON.stringify(item.text)],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE news');
  }
}
