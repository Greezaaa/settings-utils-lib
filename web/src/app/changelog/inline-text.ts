import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChangelogLine } from './changelog.parser';

@Component({
  selector: 'app-inline-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (part of parts(); track $index) {
    @switch (part.kind) {
      @case ('code') {
        <code>{{ part.text }}</code>
      }
      @case ('strong') {
        <strong>{{ part.text }}</strong>
      }
      @case ('link') {
        <a [href]="part.href" target="_blank" rel="noopener">{{ part.text }}</a>
      }
      @default {
        <ng-container>{{ part.text }}</ng-container>
      }
    }
  }`,
})
export class InlineText {
  readonly parts = input.required<ChangelogLine>();
}
