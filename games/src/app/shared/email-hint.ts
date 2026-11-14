import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject, Injector, signal } from '@angular/core';
import { suCheckEmail } from '@su-labs/fields';
import { FeatureFlags } from '../core/feature-flags';
import { SiteLanguage } from '../i18n/site-language';

@Directive({ selector: 'input[type="email"]:not([hidden])' })
export class EmailHint {
  private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly messages = inject(SiteLanguage).messages;
  private readonly features = inject(FeatureFlags);
  private readonly injector = inject(Injector);
  private readonly suggestion = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const hint = this.addHint();
      const check = (): void => this.suggestion.set(suCheckEmail(this.input.value).suggestion);
      const clear = (): void => this.suggestion.set(null);
      this.input.addEventListener('blur', check);
      this.input.addEventListener('input', clear);
      const watcher = effect(
        () => {
          const suggestion = this.features.canUse('email-hints') ? this.suggestion() : null;
          hint.hidden = suggestion === null;
          hint.replaceChildren();
          if (suggestion !== null) {
            hint.append(`${this.messages().site.emailSuggestion} `, this.fixButton(suggestion), '?');
          }
        },
        { injector: this.injector },
      );
      destroyRef.onDestroy(() => {
        watcher.destroy();
        this.input.removeEventListener('blur', check);
        this.input.removeEventListener('input', clear);
        hint.remove();
      });
    });
  }

  private addHint(): HTMLElement {
    const hint = this.input.ownerDocument.createElement('small');
    hint.className = 'email-hint';
    hint.setAttribute('aria-live', 'polite');
    hint.hidden = true;
    this.input.after(hint);
    return hint;
  }

  private fixButton(suggestion: string): HTMLButtonElement {
    const button = this.input.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'email-hint-fix';
    button.textContent = suggestion;
    button.addEventListener('click', () => {
      this.input.value = suggestion;
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
      this.input.focus();
    });
    return button;
  }
}
