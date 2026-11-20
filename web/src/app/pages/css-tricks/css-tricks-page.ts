import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoBlock } from '../../shared/demo-block/demo-block';
import { CssTricks } from './css-tricks/css-tricks';

@Component({
  selector: 'app-css-tricks-page',
  imports: [CssTricks, DemoBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './css-tricks-page.html',
  styleUrl: '../../shared/utility-page.scss',
})
export class CssTricksPage {}
