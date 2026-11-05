/** A piece of inline text: plain, `code`, **strong** or a [link](https://...) */
export interface ChangelogInline {
  readonly kind: 'text' | 'code' | 'strong' | 'link';
  readonly text: string;
  /** Only for links; always http(s) */
  readonly href?: string;
}

/** One line of text, split into inline pieces */
export type ChangelogLine = readonly ChangelogInline[];

/** A group of changes such as "Added" or "Fixed" */
export interface ChangelogSection {
  readonly title: string;
  readonly items: ChangelogLine[];
}

/** One version, e.g. `## [1.0.0] - 2026-11-05` */
export interface ChangelogRelease {
  /** Version number, or `Unreleased` */
  readonly version: string;
  /** Release date as written in the file, or null */
  readonly date: string | null;
  /** Paragraphs written before the first section */
  readonly notes: ChangelogLine[];
  readonly sections: ChangelogSection[];
}

const RELEASE_HEADING = /^##\s+\[?([^\]\s]+)\]?(?:\s+-\s+(.+))?\s*$/;
const SECTION_HEADING = /^###\s+(.+?)\s*$/;
const LIST_ITEM = /^[-*]\s+(.*)$/;
const INLINE_TOKEN = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Mutable versions of the public types, used only while parsing */
interface ReleaseDraft {
  version: string;
  date: string | null;
  notes: string[];
  sections: { title: string; items: string[] }[];
}

/**
 * Parse a changelog written in the Keep a Changelog format
 * (https://keepachangelog.com) into releases, newest first as in the file.
 * Text before the first `##` heading (title and introduction) is ignored.
 */
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
      // Wrapped list item: continue the previous item
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

/** Split a line into plain text, inline code, bold text and links */
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

/** The newest published release (skips `Unreleased`), or null */
export function latestRelease(releases: readonly ChangelogRelease[]): ChangelogRelease | null {
  return releases.find((release) => release.version.toLowerCase() !== 'unreleased') ?? null;
}

/** Add an untitled section for list items that appear before any `###` heading */
function addSection(release: ReleaseDraft): { title: string; items: string[] } {
  const section = { title: '', items: [] };
  release.sections.push(section);
  return section;
}
