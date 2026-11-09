import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../../core/site-storage';
import { LanguageId } from '../../i18n/site-messages';

/** Where the choice to hear the numbers is kept */
const SOUND_STORAGE = 'how-many:sound';

/** The voice each site language asks the browser for */
const VOICE_LANGUAGES: Readonly<Record<LanguageId, string>> = {
  en: 'en-GB',
  es: 'es-ES',
  eu: 'eu-ES',
  it: 'it-IT',
  uk: 'uk-UA',
};

/**
 * Says numbers out loud with the browser's own voice, for kids who can't read them yet. Nothing is recorded or sent;
 * it's silent where the browser has no voice, or when the player turned the sound off (remembered in this browser).
 */
@Injectable({ providedIn: 'root' })
export class CountVoice {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly soundOn = signal(readStored(SOUND_STORAGE) !== false);

  readonly isOn = this.soundOn.asReadonly();

  toggle(): void {
    this.soundOn.update((on) => !on);
    writeStored(SOUND_STORAGE, this.soundOn());
    this.stop();
  }

  say(text: string, language: LanguageId): void {
    const speech = this.window?.speechSynthesis;
    if (!this.soundOn() || !speech) {
      return;
    }
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANGUAGES[language];
    utterance.rate = 0.9;
    utterance.pitch = 1.15;
    speech.speak(utterance);
  }

  stop(): void {
    this.window?.speechSynthesis?.cancel();
  }
}
