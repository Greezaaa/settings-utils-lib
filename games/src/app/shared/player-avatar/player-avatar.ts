import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Nickname } from '../../core/room-view';
import { SiteLanguage } from '../../i18n/site-language';

export const AVATAR_COLORS = ['#ff8a65', '#4fc3f7', '#81c784', '#ffd54f', '#ba68c8', '#f06292', '#4db6ac', '#9575cd'];

@Component({
  selector: 'app-player-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-avatar.html',
  styleUrl: './player-avatar.scss',
  host: { '[style.--avatar-color]': 'background()', 'aria-hidden': 'true' },
})
export class PlayerAvatar {
  readonly nickname = input.required<Nickname>();
  readonly color = input.required<number>();

  private readonly t = inject(SiteLanguage).messages;
  protected readonly initial = computed(() => this.t().rooms.animals[this.nickname().animal]?.charAt(0) ?? '?');
  protected readonly background = computed(() => AVATAR_COLORS[this.color() % AVATAR_COLORS.length]);
}
