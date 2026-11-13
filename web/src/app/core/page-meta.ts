import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SITE_PREVIEW_IMAGE, SITE_PREVIEW_IMAGE_URL, SITE_URL } from './links';
import { getUtility } from './packages';

export interface PageMeta {
  readonly description: string;
  readonly noIndex?: boolean;
}

export const SITE_NAME = 'su-labs';

const SITE_DESCRIPTION =
  'Framework-agnostic browser utilities for theme, font size, notifications, scroll spy and visit tracking. Works with React, Vue, Svelte, Angular, vanilla JavaScript and Node.';

export const SITE_META: PageMeta = { description: SITE_DESCRIPTION };

export function utilityMeta(slug: string): PageMeta {
  const utility = getUtility(slug);
  return {
    description: utility.coreEntry
      ? `${utility.summary} For Angular (${utility.packageName}) and any framework (${utility.coreEntry}).`
      : `${utility.summary} For Angular (${utility.packageName}).`,
  };
}

@Injectable({ providedIn: 'root' })
export class PageMetaStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? SITE_NAME;
    const { description, noIndex } = deepestMeta(snapshot.root);
    const url = canonicalUrl(snapshot.url);

    this.title.setTitle(title);
    if (noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' }, 'name="robots"');
      this.document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      this.meta.removeTag('name="robots"');
      this.setCanonical(url);
    }

    const tags: Record<string, string> = {
      description,
      'og:type': 'website',
      'og:site_name': SITE_NAME,
      'og:title': title,
      'og:description': description,
      'og:url': url,
      'og:image': SITE_PREVIEW_IMAGE_URL,
      'og:image:width': SITE_PREVIEW_IMAGE.width,
      'og:image:height': SITE_PREVIEW_IMAGE.height,
      'og:image:type': SITE_PREVIEW_IMAGE.type,
      'og:image:alt': SITE_PREVIEW_IMAGE.alt,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': SITE_PREVIEW_IMAGE_URL,
      'twitter:image:alt': SITE_PREVIEW_IMAGE.alt,
    };
    for (const [key, content] of Object.entries(tags)) {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      this.meta.updateTag({ [attribute]: key, content }, `${attribute}="${key}"`);
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}

function deepestMeta(route: ActivatedRouteSnapshot): PageMeta {
  let meta: PageMeta = SITE_META;
  for (let current: ActivatedRouteSnapshot | null = route; current; current = current.firstChild) {
    const description: unknown = current.data['description'];
    if (typeof description === 'string') {
      meta = { description, noIndex: current.data['noIndex'] === true };
    }
  }
  return meta;
}

function canonicalUrl(routerUrl: string): string {
  const path = routerUrl.split(/[?#]/)[0].replace(/\/$/, '');
  return `${SITE_URL}${path}/`;
}
