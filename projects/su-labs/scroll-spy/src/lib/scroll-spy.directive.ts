import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { observeSuScrollSpySection } from '@su-labs/core/scroll-spy';
import { SuUnsubscribe } from '@su-labs/core';
import { ScrollSpyService } from './scroll-spy.service';

/**
 * Directive that observes an element's visibility on the screen
 * and updates ScrollSpyService.activeSection when it reaches the vertical center of the viewport.
 *
 * Usage:
 * <section [appScrollSpy]="'home'">...</section>
 */
@Directive({
  selector: '[appScrollSpy]',
  standalone: true,
})
export class ScrollSpyDirective implements OnInit, OnDestroy {
  /** ID of the observed section */
  @Input('appScrollSpy') sectionId!: string;

  private readonly el = inject<ElementRef<Element>>(ElementRef);
  private readonly scrollSpy = inject(ScrollSpyService);

  /** Stops observing the section */
  private stopObserving?: SuUnsubscribe;

  ngOnInit(): void {
    this.stopObserving = observeSuScrollSpySection(this.el.nativeElement, () =>
      this.scrollSpy.setActiveSection(this.sectionId),
    );
  }

  ngOnDestroy(): void {
    this.stopObserving?.();
  }
}
