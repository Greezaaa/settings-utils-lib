import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SITE_PREVIEW_IMAGE_URL, SITE_URL } from './links';
import { getUtility } from './packages';

/** Search and link-preview data of a page, set as route `data` */
export interface PageMeta {
  readonly description: string;
  /** Keep the page out of search results, e.g. the not-found page */
  readonly noIndex?: boolean;
}

export const SITE_NAME = 'su-labs';

const SITE_DESCRIPTION =
  'Theme, font size, notifications, scroll spy and visit tracking utilities for Angular, React, Svelte, vanilla JavaScript and Node.';

/** Route data for the home page and any page without its own description */
export const SITE_META: PageMeta = { description: SITE_DESCRIPTION };

/** Route data for a utility page, built from its entry in packages.ts */
export function utilityMeta(slug: string): PageMeta {
  const utility = getUtility(slug);
  return { description: `${utility.summary} For Angular (${utility.packageName}) and any framework (${utility.coreEntry}).` };
}

/**
 * Sets the title, description, canonical URL and Open Graph / Twitter tags on every navigation.
 * Runs during prerendering too, so the static HTML of each page carries its own tags.
 */
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
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': SITE_PREVIEW_IMAGE_URL,
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

/** The most specific page data in the active route tree */
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

/** Public URL of a router path, with the trailing slash the server uses for folders */
function canonicalUrl(routerUrl: string): string {
  const path = routerUrl.split(/[?#]/)[0].replace(/\/$/, '');
  return `${SITE_URL}${path}/`;
}
