/**
 * The buttons a dialog has:
 * - `ok`: one button, to close a message (`alert`)
 * - `confirm`: accept and cancel, to confirm an action (`confirm`)
 */
export type SuDialogKind = 'ok' | 'confirm';

/**
 * What sits behind the dialog:
 * - `dim`: a tinted layer over the page, so the dialog stands out (its colour and opacity can be set)
 * - `none`: nothing, the page stays as it is
 */
export type SuDialogBackdrop = 'dim' | 'none';

/**
 * How tall the dialog is at least, growing with its content (up to the screen):
 * - `small`: 20% of the screen's height
 * - `medium`: half of it
 * - `large`: 80% of it
 */
export type SuDialogSize = 'small' | 'medium' | 'large';

/** A picture shown above the dialog's text */
export interface SuDialogImage {
  readonly src: string;
  /** Text for screen readers; empty for a purely decorative picture */
  readonly alt: string;
}

/** Defaults for every dialog, set once with `configure` (e.g. the button labels in the page's language) */
export interface SuDialogConfig {
  /** Label of the accept button (and of the only button of an `ok` dialog) @default 'OK' */
  readonly acceptLabel?: string;
  /** Label of the cancel button @default 'Cancel' */
  readonly cancelLabel?: string;
  /** Any CSS width, e.g. `28rem` or `90vw`; by default the stylesheet's `--su-dialog-width` (28rem), kept inside the screen */
  readonly width?: string;
  /** How tall the dialog is at least, growing with its content @default 'small' */
  readonly size?: SuDialogSize;
  /** Any CSS height, instead of a `size` */
  readonly height?: string;
  /** @default 'dim' */
  readonly backdrop?: SuDialogBackdrop;
  /** The colour of the dimmed layer, any CSS colour; by default the stylesheet's `--su-dialog-backdrop` (black at 50%) */
  readonly backdropColor?: string;
  /** How much the dimmed layer covers the page, from 0 (not at all) to 1 (fully) @default 0.5 when a colour is given */
  readonly backdropOpacity?: number;
  /** Whether Escape and a click outside the dialog close it (as cancel) @default true */
  readonly dismissible?: boolean;
}

/** One dialog: its text, buttons and look; anything left out comes from the defaults */
export interface SuDialogOptions extends SuDialogConfig {
  /** The heading */
  readonly title: string;
  /**
   * The text under the heading. It may be HTML (lists, `<small>`, `<strong>`, links, images); the framework
   * package removes anything unsafe, like scripts.
   */
  readonly body?: string;
  readonly image?: SuDialogImage;
  /** @default 'confirm' */
  readonly kind?: SuDialogKind;
  /** The accept button warns of something that can't be undone, e.g. deleting @default false */
  readonly danger?: boolean;
  /** Extra CSS class on the dialog, to style one dialog its own way */
  readonly cssClass?: string;
}

/** The dialog on screen, with every option resolved */
export interface SuDialog {
  readonly id: string;
  readonly title: string;
  readonly body: string | null;
  readonly image: SuDialogImage | null;
  readonly kind: SuDialogKind;
  readonly acceptLabel: string;
  readonly cancelLabel: string;
  /** Set only when given, so the stylesheet's variables (and a theme) decide otherwise */
  readonly width: string | null;
  readonly size: SuDialogSize;
  readonly height: string | null;
  readonly backdrop: SuDialogBackdrop;
  /**
   * The dimmed layer's colour with its opacity, ready for CSS: `transparent` without a backdrop, null to leave it to
   * the stylesheet
   */
  readonly backdropColor: string | null;
  readonly dismissible: boolean;
  readonly danger: boolean;
  readonly cssClass: string | null;
}
