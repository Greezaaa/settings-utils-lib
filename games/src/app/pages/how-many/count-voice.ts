import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from '../../core/feature-flags';
import { readStored, writeStored } from '../../core/site-storage';
import { LanguageId } from '../../i18n/site-messages';

const SOUND_STORAGE = 'how-many:sound';

const VOICE_LANGUAGES: Readonly<Record<LanguageId, string>> = {
  en: 'en-GB',
  es: 'es-ES',
  eu: 'eu-ES',
  it: 'it-IT',
  uk: 'uk-UA',
};

@Injectable({ providedIn: 'root' })
export class CountVoice {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly features = inject(FeatureFlags);
  private readonly soundOn = signal(readStored(SOUND_STORAGE) !== false);

  readonly isAvailable = computed(() => this.features.canUse('how-many-sound'));
  readonly isOn = computed(() => this.isAvailable() && this.soundOn());

  toggle(): void {
    this.soundOn.update((on) => !on);
    writeStored(SOUND_STORAGE, this.soundOn());
    this.stop();
  }

  say(text: string, language: LanguageId): void {
    const speech = this.window?.speechSynthesis;
    if (!this.isOn() || !speech) {
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
