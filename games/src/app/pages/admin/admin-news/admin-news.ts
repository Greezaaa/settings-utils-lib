import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { AdminApi, AdminNews, NewsDraft } from '../../../core/admin-api';
import { FEATURES, FeatureId } from '../../../core/features';
import { GAME_SLUGS } from '../../../core/games';
import { isFeatureId, isGameSlug, isUpdateKind } from '../../../core/games-api';
import { SiteNews } from '../../../core/site-news';
import { formatMoment, UPDATE_KINDS } from '../../../core/site-updates';
import { SiteLanguage } from '../../../i18n/site-language';
import { LANGUAGE_IDS, LanguageId } from '../../../i18n/site-messages';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { saveFailedNotice } from '../save-failed-notice';

type Editing = { readonly id: number | null; readonly draft: NewsDraft };

const EDIT_LANGUAGES: readonly LanguageId[] = ['es', ...LANGUAGE_IDS.filter((language) => language !== 'es')];

const emptyDraft = (): NewsDraft => ({
  kind: 'game',
  game: null,
  feature: null,
  privacy: false,
  published: new Date().toISOString(),
  text: {},
});

@Component({
  selector: 'app-admin-news',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-news.html',
  styleUrl: '../admin.scss',
})
export class AdminNewsTab {
  private readonly admin = inject(AdminApi);
  private readonly dialog = inject(SuDialogService);
  private readonly siteNews = inject(SiteNews);
  protected readonly language = inject(SiteLanguage);
  protected readonly kinds = UPDATE_KINDS;
  protected readonly games = GAME_SLUGS;
  protected readonly features: readonly FeatureId[] = FEATURES.map(({ id }) => id);
  protected readonly languages = EDIT_LANGUAGES;
  protected readonly items = signal<readonly AdminNews[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly editing = signal<Editing | null>(null);
  protected readonly isSaving = signal(false);
  private readonly notifySaveFailed = saveFailedNotice();

  constructor() {
    afterNextRender(() => this.reload());
  }

  protected moment(iso: string): string {
    return formatMoment(iso, this.language.language());
  }

  protected localTime(iso: string): string {
    const date = new Date(iso);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  protected startNew(): void {
    this.editing.set({ id: null, draft: emptyDraft() });
  }

  protected startEdit(item: AdminNews): void {
    this.editing.set({ id: item.id, draft: item });
  }

  protected cancel(): void {
    this.editing.set(null);
  }

  protected async save(event: Event, form: HTMLFormElement): Promise<void> {
    event.preventDefault();
    const editing = this.editing();
    const draft = draftFrom(new FormData(form));
    if (!editing || !draft || this.isSaving()) {
      return;
    }
    this.isSaving.set(true);
    const saved = editing.id === null ? await this.admin.addNews(draft) : await this.admin.changeNews(editing.id, draft);
    this.isSaving.set(false);
    if (!saved) {
      this.notifySaveFailed();
      return;
    }
    this.editing.set(null);
    await this.reload();
  }

  protected async remove(item: AdminNews): Promise<void> {
    const { confirmDeleteNews, deleteNews } = this.language.messages().admin;
    if (!(await this.dialog.confirm({ title: confirmDeleteNews, acceptLabel: deleteNews, danger: true }))) {
      return;
    }
    if (await this.admin.removeNews(item.id)) {
      await this.reload();
    } else {
      this.notifySaveFailed();
    }
  }

  private async reload(): Promise<void> {
    this.items.set(await this.admin.news());
    this.isLoading.set(false);
    await this.siteNews.refresh();
  }
}

function draftFrom(form: FormData): NewsDraft | null {
  const kind = form.get('kind');
  const game = form.get('game');
  const feature = form.get('feature');
  const published = form.get('published');
  const text: Partial<Record<LanguageId, string>> = {};
  for (const language of LANGUAGE_IDS) {
    const value = form.get(`text-${language}`);
    if (typeof value === 'string' && value.trim()) {
      text[language] = value.trim();
    }
  }
  if (!isUpdateKind(kind) || typeof published !== 'string' || !published || !text.es) {
    return null;
  }
  return {
    kind,
    game: isGameSlug(game) ? game : null,
    feature: isFeatureId(feature) ? feature : null,
    privacy: form.get('privacy') === 'on',
    published: new Date(published).toISOString(),
    text,
  };
}
