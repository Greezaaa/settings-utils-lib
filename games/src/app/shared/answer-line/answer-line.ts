import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AnswerWords } from '../../core/answer-words';
import { TranslatePipe } from '../../i18n/translate-pipe';

@Component({
  selector: 'app-answer-line',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './answer-line.html',
  styleUrl: './answer-line.scss',
})
export class AnswerLine {
  readonly result = input.required<boolean | null>();
  readonly answer = input('');

  protected readonly words = inject(AnswerWords);
}
