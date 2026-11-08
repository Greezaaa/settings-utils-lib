import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AnswerWords } from '../core/answer-words';
import { SiteLanguage } from '../i18n/site-language';

/**
 * The words under a round that say whether the answer was right ("Right!", "Not quite: 60°"). Seen only when the
 * visitor chose words in the settings; otherwise only screen readers hear it, as games show answers in colour.
 */
@Component({
  selector: 'app-answer-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './answer-line.html',
  styleUrl: './answer-line.scss',
})
export class AnswerLine {
  /** Right, wrong, or null while there is nothing to say */
  readonly result = input.required<boolean | null>();
  /** The right answer, said after a wrong one; empty when it must not be given away */
  readonly answer = input('');

  protected readonly words = inject(AnswerWords);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
}
