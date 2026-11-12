import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { PRERENDER_MESSAGES } from '../i18n/site-language';
import { SiteMessages } from '../i18n/site-messages';
import { GameSlug } from './games';
import { isGameSlug } from './games-api';
import { SITE_PREVIEW_IMAGE, SITE_PREVIEW_IMAGE_URL, SITE_URL } from './links';
import { structuredData } from './structured-data';

/** Search and link-preview data of a page, set as route `data` */
export interface PageMeta {
  readonly description: string;
  /** Keep the page out of search results, e.g. the not-found page */
  readonly noIndex?: boolean;
  /** A game's own page */
  readonly game?: GameSlug;
}

export const SITE_NAME = 'su-labs games';

/**
 * Language of search results and link previews (page titles, descriptions, preview image text): the prerendered
 * pages' language. The preview image (public/og-image.png) is drawn in this language too.
 */
export const PREVIEW_MESSAGES: SiteMessages = PRERENDER_MESSAGES;

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
    const { description, noIndex, game } = deepestMeta(snapshot.root);
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
    this.setStructuredData(structuredData(PREVIEW_MESSAGES, SITE_NAME, game));
  }

  private setStructuredData(data: object): void {
    let script = this.document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
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
    const game: unknown = current.data['game'];
    if (typeof description === 'string') {
      meta = {
        description,
        noIndex: current.data['noIndex'] === true,
        game: typeof game === 'string' && isGameSlug(game) ? game : undefined,
      };
    }
  }
  return meta;
}

/** Public URL of a router path, with the trailing slash the server uses for folders */
function canonicalUrl(routerUrl: string): string {
  const path = routerUrl.split(/[?#]/)[0].replace(/\/$/, '');
  return `${SITE_URL}${path}/`;
}
