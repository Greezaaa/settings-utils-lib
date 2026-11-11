import { LANGUAGE_IDS } from '../i18n/site-language';
import { SiteMessages } from '../i18n/site-messages';
import { gameInfo, GameSlug } from './games';
import { AUTHOR_NAME, SITE_URL } from './links';

/**
 * Schema.org data for search engines: the site on every page, and the game on a game's page. Built from the same texts
 * as the page's title and description, so it is always in their language and lists only real games.
 */
export function structuredData(messages: SiteMessages, siteName: string, game?: GameSlug): object {
  const site = {
    '@type': 'WebSite',
    name: siteName,
    url: `${SITE_URL}/`,
    description: messages.seo.siteDescription,
    inLanguage: LANGUAGE_IDS,
  };
  if (!game) {
    return { '@context': 'https://schema.org', '@graph': [site] };
  }
  const { name, intro, summary } = messages.games[game];
  const { category, minAge } = gameInfo(game);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      site,
      {
        '@type': 'VideoGame',
        name,
        url: `${SITE_URL}/${game}/`,
        description: `${intro} ${summary}`,
        genre: category === 'puzzles' ? 'Puzzle' : 'Educational',
        audience: { '@type': 'PeopleAudience', suggestedMinAge: minAge },
        inLanguage: LANGUAGE_IDS,
        isAccessibleForFree: true,
        author: { '@type': 'Person', name: AUTHOR_NAME },
      },
    ],
  };
}
