import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { ES } from '../i18n/es';
import { SiteMessages } from '../i18n/site-messages';
import { SITE_PREVIEW_IMAGE, SITE_PREVIEW_IMAGE_URL, SITE_URL } from './links';

/** Search and link-preview data of a page, set as route `data` */
export interface PageMeta {
  readonly description: string;
  /** Keep the page out of search results, e.g. the not-found page */
  readonly noIndex?: boolean;
}

export const SITE_NAME = 'su-labs games';

/**
 * Language of search results and link previews (page titles, descriptions, preview image text).
 * Spanish for now, as most players are Spanish kids; the site itself still opens in each visitor's language.
 * The preview image (public/og-image.png) is drawn in this language too.
 */
export const PREVIEW_MESSAGES: SiteMessages = ES;

const SITE_DESCRIPTION = PREVIEW_MESSAGES.seo.siteDescription;

/** Route data for the home page and any page without its own description */
export const SITE_META: PageMeta = { description: SITE_DESCRIPTION };

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
      'og:locale': PREVIEW_MESSAGES.seo.locale,
      'og:site_name': SITE_NAME,
      'og:title': title,
      'og:description': description,
      'og:url': url,
      'og:image': SITE_PREVIEW_IMAGE_URL,
      'og:image:width': SITE_PREVIEW_IMAGE.width,
      'og:image:height': SITE_PREVIEW_IMAGE.height,
      'og:image:type': SITE_PREVIEW_IMAGE.type,
      'og:image:alt': PREVIEW_MESSAGES.seo.previewImageAlt,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': SITE_PREVIEW_IMAGE_URL,
      'twitter:image:alt': PREVIEW_MESSAGES.seo.previewImageAlt,
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
