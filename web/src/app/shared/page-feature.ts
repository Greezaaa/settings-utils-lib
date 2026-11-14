import { Directive, inject, input, TemplateRef } from '@angular/core';

/** One feature of a package: what it does, and the code that turns it on */
export interface PageFeature {
  readonly title: string;
  readonly description: string;
  readonly code: string;
}

/** A live example of a feature, shown beside its description on a package page */
@Directive({ selector: 'ng-template[appPageFeature]' })
export class PageFeatureExample {
  readonly feature = input.required<PageFeature>({ alias: 'appPageFeature' });
  readonly template: TemplateRef<unknown> = inject(TemplateRef);
}
