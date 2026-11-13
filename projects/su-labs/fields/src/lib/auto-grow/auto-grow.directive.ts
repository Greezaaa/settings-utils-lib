import { afterNextRender, booleanAttribute, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/** A soft spring that overshoots a little, as the box settles on its new height */
const SPRING = 'height 240ms cubic-bezier(0.34, 1.56, 0.64, 1)';

/**
 * A text box that grows a line at a time as the text gets longer, and shrinks back when it is emptied, with a soft
 * spring (none for visitors who asked their device for less motion). `[suAutoGrow]="false"` leaves it as it is.
 */
@Directive({
  selector: 'textarea[suAutoGrow]',
  host: { '(input)': 'fit()' },
})
export class SuAutoGrowDirective {
  readonly isOn = input(true, { alias: 'suAutoGrow', transform: booleanAttribute });

  private readonly box: HTMLTextAreaElement = inject(ElementRef).nativeElement;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onReset = () => setTimeout(() => this.fit());
      this.box.form?.addEventListener('reset', onReset);
      destroyRef.onDestroy(() =>
        this.box.form?.removeEventListener('reset', onReset)
      );
    });
  }

  protected fit(): void {
    if (!this.isOn()) {
      return;
    }
    const box = this.box;
    const from = box.offsetHeight;
    box.style.transition = 'none';
    box.style.height = 'auto';
    const to = box.scrollHeight + box.offsetHeight - box.clientHeight;
    box.style.height = `${from}px`;
    void box.offsetHeight;
    box.style.overflowY = 'hidden';
    box.style.transition = matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 'none'
      : SPRING;
    box.style.height = `${to}px`;
  }
}
