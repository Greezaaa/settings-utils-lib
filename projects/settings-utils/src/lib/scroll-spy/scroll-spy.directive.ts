import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { ScrollSpyService } from './scroll-spy.service';

@Directive({
  selector: '[appScrollSpy]',
  standalone: true,
})
export class ScrollSpyDirective implements OnInit {
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
        root: null,
        threshold: 0,
        rootMargin: '-50% 0px -50% 0px',
      }
    );
    observer.observe(this.el.nativeElement);
  }
}
