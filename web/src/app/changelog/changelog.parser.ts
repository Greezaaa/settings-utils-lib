export interface ChangelogInline {
  readonly kind: 'text' | 'code' | 'strong' | 'link';
  readonly text: string;
  readonly href?: string;
}

export type ChangelogLine = readonly ChangelogInline[];

export interface ChangelogSection {
  readonly title: string;
  readonly items: ChangelogLine[];
}

export interface ChangelogRelease {
  readonly version: string;
  readonly date: string | null;
  readonly notes: ChangelogLine[];
  readonly sections: ChangelogSection[];
}

const RELEASE_HEADING = /^##\s+\[?([^\]\s]+)\]?(?:\s+-\s+(.+))?\s*$/;
const SECTION_HEADING = /^###\s+(.+?)\s*$/;
const LIST_ITEM = /^[-*]\s+(.*)$/;
const INLINE_TOKEN = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

interface ReleaseDraft {
  version: string;
  date: string | null;
  notes: string[];
  sections: { title: string; items: string[] }[];
}

export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ReleaseDraft[] = [];

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const release = releases.at(-1);
    const releaseMatch = RELEASE_HEADING.exec(line);

    if (releaseMatch) {
      releases.push({ version: releaseMatch[1], date: releaseMatch[2]?.trim() ?? null, notes: [], sections: [] });
      continue;
    }
    if (!release || !line) {
      continue;
    }

    const sectionMatch = SECTION_HEADING.exec(line);
    if (sectionMatch) {
      release.sections.push({ title: sectionMatch[1], items: [] });
      continue;
    }

    const section = release.sections.at(-1);
    const itemMatch = LIST_ITEM.exec(line);
    if (itemMatch) {
      const target = section ?? addSection(release);
      target.items.push(itemMatch[1]);
    } else if (section?.items.length) {
      section.items[section.items.length - 1] += ` ${line}`;
    } else {
      release.notes.push(line);
    }
  }

  return releases.map((release) => ({
    version: release.version,
    date: release.date,
    notes: release.notes.map(parseInline),
    sections: release.sections
      .filter((section) => section.items.length > 0)
      .map((section) => ({ title: section.title, items: section.items.map(parseInline) })),
  }));
}

export function parseInline(text: string): ChangelogLine {
  const parts: ChangelogInline[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN)) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
    }
    const [whole, code, strong, linkText, href] = match;
    if (code !== undefined) {
      parts.push({ kind: 'code', text: code });
    } else if (strong !== undefined) {
      parts.push({ kind: 'strong', text: strong });
    } else if (/^https?:\/\//.test(href)) {
      parts.push({ kind: 'link', text: linkText, href });
    } else {
      parts.push({ kind: 'text', text: whole });
    }
    lastIndex = match.index + whole.length;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: 'text', text: text.slice(lastIndex) });
  }
  return parts;
}

export function latestRelease(releases: readonly ChangelogRelease[]): ChangelogRelease | null {
  return releases.find((release) => release.version.toLowerCase() !== 'unreleased') ?? null;
}

function addSection(release: ReleaseDraft): { title: string; items: string[] } {
  const section = { title: '', items: [] };
  release.sections.push(section);
  return section;
}
