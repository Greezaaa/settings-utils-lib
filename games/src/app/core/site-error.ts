import { SiteError } from './games-api';

/** What to report about an error: its name and message, and the page; never anything about the visitor */
export function siteErrorOf(error: unknown, path: string): SiteError {
  const isError = error instanceof Error;
  return {
    code: 'js',
    title: (isError ? error.name : 'Error').slice(0, 120) || 'Error',
    problem: (isError ? error.message : String(error)).slice(0, 1000),
    path: (path.split(/[?#]/)[0] || '/').slice(0, 200),
  };
}
