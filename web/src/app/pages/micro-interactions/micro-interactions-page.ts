import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoBlock } from '../../shared/demo-block/demo-block';
import { CardDetail } from './card-detail/card-detail';
import { CopyButton } from './copy-button/copy-button';
import { DeleteList } from './delete-list/delete-list';
import { PinButton } from './pin-button/pin-button';

@Component({
  selector: 'app-micro-interactions-page',
  imports: [CardDetail, CopyButton, DeleteList, DemoBlock, PinButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './micro-interactions-page.html',
  styleUrl: '../../shared/utility-page.scss',
})
export class MicroInteractionsPage {}
