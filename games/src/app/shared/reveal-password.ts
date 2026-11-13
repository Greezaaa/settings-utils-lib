import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject, Injector, signal } from '@angular/core';
import { SiteLanguage } from '../i18n/site-language';

const SVG = 'http://www.w3.org/2000/svg';
const EYE = ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'];
const EYE_OFF = [...EYE, 'M3 3l18 18'];

@Directive({
  selector: 'input[type="password"]',
  host: { 'data-password': '' },
})
export class RevealPassword {
  private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly messages = inject(SiteLanguage).messages;
  private readonly injector = inject(Injector);
  private readonly isShown = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const button = this.addButton();
      const hideWhenCleared = (): void => {
        if (this.input.value === '') {
          this.isShown.set(false);
        }
      };
      this.input.addEventListener('input', hideWhenCleared);
      const watcher = effect(
        () => {
          const isShown = this.isShown();
          const { site } = this.messages();
          this.input.type = isShown ? 'text' : 'password';
          button.setAttribute('aria-pressed', String(isShown));
          button.setAttribute('aria-label', isShown ? site.hidePassword : site.showPassword);
          button.replaceChildren(icon(this.input.ownerDocument, isShown ? EYE_OFF : EYE));
        },
        { injector: this.injector },
      );
      destroyRef.onDestroy(() => {
        watcher.destroy();
        this.input.removeEventListener('input', hideWhenCleared);
      });
    });
  }

  private addButton(): HTMLButtonElement {
    const document = this.input.ownerDocument;
    const wrapper = document.createElement('span');
    wrapper.className = 'password-field';
    this.input.replaceWith(wrapper);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reveal-password';
    button.addEventListener('click', () => this.isShown.update((isShown) => !isShown));
    wrapper.append(this.input, button);
    return button;
  }
}

function icon(document: Document, paths: readonly string[]): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of paths) {
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}
