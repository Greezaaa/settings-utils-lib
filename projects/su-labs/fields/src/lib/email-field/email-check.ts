/** What's wrong with an email address, in the order it's checked */
export type SuEmailProblem = 'empty' | 'spaces' | 'at' | 'name' | 'domain' | 'dot' | 'ending';

/** The outcome of `suCheckEmail` */
export interface SuEmailCheck {
  readonly valid: boolean;
  readonly problem: SuEmailProblem | null;
  /** The address with a common domain in place of a likely typo, e.g. `jo@gmail.com` for `jo@gmial.com`, or null */
  readonly suggestion: string | null;
}

/** Domains `suCheckEmail` suggests when one is mistyped */
export const SU_COMMON_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'yandex.com',
  'hotmail.es',
  'yahoo.es',
];

/** How far a typed domain may be from a common one, in single-letter edits, to suggest it */
const MAX_TYPO_DISTANCE = 2;

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

/** The common domain a typed one most likely meant, or null when it's already common or nothing is close */
function closestDomain(domain: string, domains: readonly string[]): string | null {
  if (!domain || domains.includes(domain)) {
    return null;
  }
  let best: { readonly domain: string; readonly distance: number } | null = null;
  for (const candidate of domains) {
    const distance = editDistance(domain, candidate);
    if (distance <= MAX_TYPO_DISTANCE && (!best || distance < best.distance)) {
      best = { domain: candidate, distance };
    }
  }
  return best?.domain ?? null;
}

function problemOf(email: string): SuEmailProblem | null {
  if (email === '') {
    return 'empty';
  }
  if (/\s/.test(email)) {
    return 'spaces';
  }
  const parts = email.split('@');
  if (parts.length !== 2) {
    return 'at';
  }
  const [name, domain] = parts;
  if (!name) {
    return 'name';
  }
  if (!domain) {
    return 'domain';
  }
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some((label) => label === '')) {
    return 'dot';
  }
  return /^\p{L}{2,}$/u.test(labels[labels.length - 1]) ? null : 'ending';
}

/**
 * Checks an email address the way people mistype them: empty, spaces, not exactly one @, nothing before or after it,
 * a domain without a proper dot, or an ending shorter than two letters. It also suggests a common domain for a
 * likely typo (`gmial.com` → `gmail.com`), even when the address is otherwise valid.
 */
export function suCheckEmail(value: string, domains: readonly string[] = SU_COMMON_EMAIL_DOMAINS): SuEmailCheck {
  const email = value.trim();
  const problem = problemOf(email);
  const [name = '', domain = ''] = email.split('@');
  const fixable = problem === null || problem === 'dot' || problem === 'ending';
  const fix = fixable && name ? closestDomain(domain.toLowerCase(), domains) : null;
  return { valid: problem === null, problem, suggestion: fix ? `${name}@${fix}` : null };
}
