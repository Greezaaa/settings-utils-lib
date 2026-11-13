import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollSpyDirective, ScrollSpyService } from '@su-labs/scroll-spy';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

const SECTIONS: readonly { id: string; title: string; text: string }[] = [
  {
    id: 'spy-install',
    title: 'Install',
    text: 'Add the package and import the directive into the component that holds your sections.',
  },
  {
    id: 'spy-mark',
    title: 'Mark sections',
    text: 'Put appScrollSpy on each section with its id. The directive observes it with IntersectionObserver, so there are no scroll listeners.',
  },
  {
    id: 'spy-highlight',
    title: 'Highlight the link',
    text: 'Read activeSection() in your navigation and add an active class to the matching link.',
  },
  {
    id: 'spy-clean-up',
    title: 'Clean up',
    text: 'When a section leaves the page, its observer is disconnected automatically.',
  },
];

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `<nav>
  <a [class.active]="scrollSpy.activeSection() === 'about'">About</a>
</nav>

<section id="about" appScrollSpy="about">...</section>

// component
protected readonly scrollSpy = inject(ScrollSpyService);`,
  },
  {
    label: 'Any framework',
    code: `import { SuScrollSpyController } from '@su-labs/core/scroll-spy';

const scrollSpy = new SuScrollSpyController();
document.querySelectorAll('section[id]').forEach((section) => scrollSpy.observe(section, section.id));

scrollSpy.activeSection.subscribe((id) => highlight(id));`,
  },
];

@Component({
  selector: 'app-scroll-spy-page',
  imports: [ScrollSpyDirective, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-spy-page.html',
  styleUrl: './scroll-spy-page.scss',
})
export class ScrollSpyPage {
  protected readonly utility = getUtility('scroll-spy');
  protected readonly usage = USAGE;
  protected readonly sections = SECTIONS;
  protected readonly scrollSpy = inject(ScrollSpyService);

  protected goTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.scrollSpy.setActiveSection(id);
  }
}
