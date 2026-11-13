import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminApi, Invite, MEMBER_ROLES, MemberRole, TeamMember } from '../../../core/admin-api';
import { ADMIN_INVITE_PATH } from '../../../core/links';

/** A fresh invite link to copy, for whom */
interface ShownInvite {
  readonly email: string;
  readonly url: string;
  readonly expires: Date;
}

/**
 * Super admin tab: the team. Add a moderator or tester with a starting password, or leave the password empty to get an
 * invite link to copy and send (they choose their own password); change their role, turn them on or off, or make a new
 * link for them.
 */
import { saveFailedNotice } from '../save-failed-notice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-admin-team',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-team.html',
  styleUrl: '../admin.scss',
})
export class AdminTeam {
  private readonly admin = inject(AdminApi);
  private readonly document = inject(DOCUMENT);

  protected readonly members = signal<readonly TeamMember[]>([]);
  protected readonly invite = signal<ShownInvite | null>(null);
  protected readonly isCopied = signal(false);
  /** Adding someone already on the team; other failures show as a notification */
  protected readonly isAlreadyOnTeam = signal(false);
  private readonly notifySaveFailed = saveFailedNotice();
  protected readonly isSaving = signal(false);
  protected readonly roles = MEMBER_ROLES;
  /** The role for the next member added */
  protected readonly newRole = signal<MemberRole>('moderator');

  constructor() {
    void this.load();
  }

  protected async add(event: Event, form: HTMLFormElement, email: HTMLInputElement, password: HTMLInputElement) {
    event.preventDefault();
    this.isSaving.set(true);
    this.isAlreadyOnTeam.set(false);
    const added = await this.admin.addMember(email.value.trim(), this.newRole(), password.value || undefined);
    this.isSaving.set(false);
    if (added === 'exists') {
      this.isAlreadyOnTeam.set(true);
      return;
    }
    if (added === 'failed') {
      this.notifySaveFailed();
      return;
    }
    this.show(email.value.trim(), added.invite);
    form.reset();
    await this.load();
  }

  protected async reinvite(member: TeamMember): Promise<void> {
    this.show(member.email, await this.admin.reinvite(member.id));
  }

  /** Moderator ↔ tester */
  protected async switchRole(member: TeamMember): Promise<void> {
    const role: MemberRole = member.role === 'tester' ? 'moderator' : 'tester';
    if (await this.admin.setRole(member.id, role)) {
      await this.load();
    } else {
      this.notifySaveFailed();
    }
  }

  protected async toggle(member: TeamMember): Promise<void> {
    if (await this.admin.setActive(member.id, !member.active)) {
      await this.load();
    } else {
      this.notifySaveFailed();
    }
  }

  protected async copy(url: string): Promise<void> {
    await navigator.clipboard.writeText(url);
    this.isCopied.set(true);
  }

  /** Selects the whole link when its box gets focus, ready to copy by hand */
  protected selectAll(event: FocusEvent): void {
    if (event.target instanceof HTMLInputElement) {
      event.target.select();
    }
  }

  private show(email: string, invite: Invite | null): void {
    this.isCopied.set(false);
    this.invite.set(
      invite && {
        email,
        url: `${this.document.location.origin}/${ADMIN_INVITE_PATH}/${invite.secret}`,
        expires: invite.expires,
      },
    );
  }

  private async load(): Promise<void> {
    this.members.set(await this.admin.team());
  }
}
