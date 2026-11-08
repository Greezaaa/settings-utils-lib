import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChangelogRelease } from './changelog.parser';
import { InlineText } from './inline-text';

/** Pastel tag color for each Keep a Changelog section */
const SECTION_TAGS: Readonly<Record<string, string>> = {
  added: 'tag-green',
  changed: 'tag-blue',
  fixed: 'tag-yellow',
  deprecated: 'tag-red',
  removed: 'tag-red',
  security: 'tag-red',
};

/** Renders parsed changelog releases as a timeline */
@Component({
  selector: 'app-release-list',
  imports: [InlineText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="releases">
      @for (release of releases(); track release.version) {
        <li class="release">
          <header class="release-head">
            <h3 class="mono">{{ release.version }}</h3>
            @if (release.date) {
              <time class="muted mono" [attr.datetime]="release.date">{{ release.date }}</time>
            }
          </header>

          @for (note of release.notes; track $index) {
            <p class="release-note"><app-inline-text [parts]="note" /></p>
          }

          @for (section of release.sections; track $index) {
            <div class="release-section">
              @if (section.title) {
                <span [class]="sectionTag(section.title)">{{ section.title }}</span>
              }
              <ul>
                @for (item of section.items; track $index) {
                  <li><app-inline-text [parts]="item" /></li>
                }
              </ul>
            </div>
          }
        </li>
      }
    </ol>
  `,
  styles: `
    .releases {
      display: grid;
      gap: 2.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .release {
      border-left: 1px solid var(--border);
      display: grid;
      gap: 1rem;
      padding-left: 1.25rem;
    }

    .release-head {
      align-items: baseline;
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 0.75rem;
    }

    .release-head h3 {
      font-size: 1.125rem;
    }

    .release-section {
      display: grid;
      gap: 0.5rem;
      justify-items: start;
    }

    ul {
      display: grid;
      gap: 0.375rem;
      margin: 0;
      padding-left: 1.125rem;
    }
  `,
})
export class ReleaseList {
  readonly releases = input.required<readonly ChangelogRelease[]>();

  /** Tag class for a section title, neutral when unknown */
  protected sectionTag(title: string): string {
    return `tag ${SECTION_TAGS[title.toLowerCase()] ?? ''}`;
  }
}
