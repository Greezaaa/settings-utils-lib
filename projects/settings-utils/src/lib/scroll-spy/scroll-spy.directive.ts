import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { ScrollSpyService } from './scroll-spy.service';

/**
 * Directive that observes an element's visibility on the screen
 * and updates ScrollSpyService.activeSection when it enters the viewport.
 *
 * Usage:
 * <section [appScrollSpy]="'home'">...</section>
 */
@Directive({
  selector: '[appScrollSpy]',
  standalone: true,
})
export class ScrollSpyDirective implements OnInit {
  /** ID of the observed section */
  @Input('appScrollSpy') sectionId!: string;

  private readonly el = inject(ElementRef);
  private readonly scrollSpy = inject(ScrollSpyService);

  ngOnInit() {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.scrollSpy.activeSection.set(this.sectionId);
          }
        }
      },
      {
        // The viewport used to check visibility. 
        // `null` means the browser viewport is used.
        root: null,
        // How much of the element needs to be visible to trigger the observer. 
        // `0` means it triggers as soon as even one pixel is visible within the root + rootMargin.
        threshold: 0,
        // rootMargin defines an offset around the viewport that affects when the observer triggers.
        // Format: 'top right bottom left'
        // In this case:
        //   - top: -50%
        //   - right: 0px
        //   - bottom: -50%
        //   - left: 0px
        //
        // This means the observer will consider the element "intersecting" only when
        // it is roughly in the vertical center of the viewport.
        // It's perfect for scroll-spy behavior, because it triggers when the section
        // is the main focus on the screen, rather than just appearing at the top.
        rootMargin: '-50% 0px -50% 0px',
      }
    );
    observer.observe(this.el.nativeElement);
  }
}
