import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, input, model, numberAttribute, signal, TemplateRef, untracked, viewChild } from '@angular/core';
import { SU_TOOLTIP_LABELS, suTooltipIconClip, suTooltipIconPosition, SuTooltipLabels, SuTooltipOpenOn, SuTooltipPlacement, suTooltipPosition, SuTooltipSize, SuTooltipTrigger, SuTooltipController } from '@su-labs/core/tooltip';

let nextTooltipId = 0;

const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const DEFAULT_DURATION = 200;

/**
 * A tooltip over `SuTooltipController` from `@su-labs/core/tooltip`. Its content is the trigger, `text` is what the
 * tooltip shows. It opens on hover and focus or on click (`openOn`), beside the trigger with an arrow, and grows out
 * of it. With `trigger="icon"` a "?" button follows the content and the tooltip grows out of that icon, which turns
 * into its close button.
 */
@Component({
  selector: 'su-lib-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  host: {
    class: 'su-tooltip',
    '[class.su-tooltip-open]': 'open()',
    '[style.--su-tooltip-width]': 'width()',
    '[style.--su-tooltip-offset.px]': 'offset()',
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class SuTooltipComponent {
  /** What the tooltip shows: a text, or an `<ng-template>` for links, formatting or any other markup */
  readonly text = input<string | TemplateRef<unknown>>('');
  /** The trigger: the content between the tags, or a "?" icon after it that grows into the tooltip @default 'content' */
  readonly trigger = input<SuTooltipTrigger>('content');
  /** The icon instead of the "?": a short text such as `i` or `!`, or an `<ng-template>` with your own SVG */
  readonly icon = input<string | TemplateRef<unknown>>('');
  /** The side the tooltip opens on, lined up with the trigger's start or end with `-start` and `-end` @default 'top' */
  readonly placement = input<SuTooltipPlacement>('top');
  /** What opens it: `hover` (and keyboard focus) or `click` @default 'hover', 'click' for the icon */
  readonly openOn = input<SuTooltipOpenOn>();
  /**
   * The pointer can move onto the tooltip, e.g. to click a link in it; otherwise the pointer goes through it and
   * it closes as soon as the pointer leaves the trigger. Always on with `click` @default false
   */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Grows out of the trigger when it opens and back into it when it closes; off when the user prefers less motion @default true */
  readonly animated = input(true, { transform: booleanAttribute });
  /** The tooltip's width, any CSS length; without it, it fits its text up to `--su-tooltip-max-width` (`16rem` for the icon) */
  readonly width = input<string>();
  /** The arrow pointing at the trigger, beside content triggers @default true */
  readonly arrow = input(true, { transform: booleanAttribute });
  /** Pixels between the trigger and the tooltip @default 8 */
  readonly offset = input(8, { transform: numberAttribute });
  /** Milliseconds the pointer rests on the trigger before it opens @default 300 */
  readonly showDelay = input(300, { transform: numberAttribute });
  /** Milliseconds before it closes once the pointer leaves @default 100 */
  readonly hideDelay = input(100, { transform: numberAttribute });
  /** Doesn't open, and closes if open @default false */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The icon's name for screen readers @default labels.more */
  readonly label = input<string>();
  /** Texts to replace, e.g. in the page's language */
  readonly labels = input<Partial<SuTooltipLabels>>({});
  /** Whether the tooltip is open; setting it opens or closes it at once */
  readonly open = model(false);

  protected readonly panelId = `su-tooltip-${nextTooltipId++}`;
  protected readonly isIcon = computed(() => this.trigger() === 'icon');
  protected readonly opensOn = computed<SuTooltipOpenOn>(
    () => this.openOn() ?? (this.isIcon() ? 'click' : 'hover')
  );
  protected readonly isInteractive = computed(
    () => this.interactive() || this.opensOn() === 'click'
  );
  /** A hover tooltip describes its trigger; the others are shown and hidden by a button */
  protected readonly describes = computed(
    () => !this.isIcon() && this.opensOn() === 'hover'
  );
  protected readonly template = computed(() => {
    const text = this.text();
    return text instanceof TemplateRef ? text : null;
  });
  protected readonly plainText = computed(() => {
    const text = this.text();
    return typeof text === 'string' ? text : '';
  });
  protected readonly iconTemplate = computed(() => {
    const icon = this.icon();
    return icon instanceof TemplateRef ? icon : null;
  });
  protected readonly iconText = computed(() => {
    const icon = this.icon();
    return typeof icon === 'string' ? icon : '';
  });
  protected readonly texts = computed<SuTooltipLabels>(() => ({
    ...SU_TOOLTIP_LABELS,
    ...this.labels(),
  }));
  /** The close button shows the "×" once the icon has opened, so the "?" turns into it */
  protected readonly morphed = signal(false);

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly panel =
    viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly iconButton =
    viewChild<ElementRef<HTMLButtonElement>>('iconButton');
  private readonly closeButton =
    viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly controller = new SuTooltipController();
  private animation: Animation | null = null;
  private iconClip: { readonly from: string; readonly to: string } | null =
    null;
  private shown = false;
  /** The close button takes focus once the icon tooltip opens, after the user opened it with the icon */
  private focusOnOpen = false;
  private leftWhileGrowing = false;
  /** Focus coming back to the trigger after the tooltip closed doesn't open it again */
  private returningFocus = false;
  private linkedTrigger: HTMLElement | null = null;

  constructor() {
    const unsubscribe = this.controller.state.subscribe(state =>
      this.open.set(state.open)
    );
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      unsubscribe();
      this.controller.cancel();
      this.animation?.cancel();
    });

    effect(() => {
      const delays = {
        showDelay: this.showDelay(),
        hideDelay: this.hideDelay(),
      };
      untracked(() => this.controller.setDelays(delays));
    });

    effect(() => {
      const open = this.open() && !this.disabled();
      untracked(() => {
        this.controller.setOpen(open);
        this.open.set(open);
      });
    });

    effect(onCleanup => {
      if (!this.open()) {
        return;
      }
      const onKeydown = (event: KeyboardEvent) => this.onDocumentKeydown(event);
      const onPointerDown = (event: PointerEvent) =>
        this.onDocumentPointerDown(event);
      const onMove = () => this.place();
      const view = this.document.defaultView;
      this.document.addEventListener('keydown', onKeydown);
      this.document.addEventListener('pointerdown', onPointerDown);
      view?.addEventListener('scroll', onMove, true);
      view?.addEventListener('resize', onMove);
      onCleanup(() => {
        this.document.removeEventListener('keydown', onKeydown);
        this.document.removeEventListener('pointerdown', onPointerDown);
        view?.removeEventListener('scroll', onMove, true);
        view?.removeEventListener('resize', onMove);
      });
    });

    afterRenderEffect(() => {
      const open = this.open();
      untracked(() => (open ? this.reveal() : this.conceal()));
    });

    afterRenderEffect(() => {
      const trigger = this.isIcon() ? null : this.contentTrigger();
      const describes = this.describes();
      const open = this.open();
      untracked(() => this.linkTrigger(trigger, describes, open));
    });
  }

  /** Opens the tooltip now */
  show(): void {
    this.controller.open();
  }

  /** Closes the tooltip now */
  hide(): void {
    this.controller.close();
  }

  /** Opens or closes the tooltip now */
  toggle(): void {
    this.controller.toggle();
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (
      this.disabled() ||
      event.pointerType === 'touch' ||
      this.opensOn() !== 'hover'
    ) {
      return;
    }
    this.controller.show();
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === 'touch' || this.opensOn() !== 'hover') {
      return;
    }
    if (this.isGrowing()) {
      this.leftWhileGrowing = true;
      return;
    }
    this.controller.hide();
  }

  protected onFocusIn(event: FocusEvent): void {
    if (this.inPanel(event.target)) {
      this.controller.cancel();
      return;
    }
    if (
      !this.disabled() &&
      !this.returningFocus &&
      this.opensOn() === 'hover'
    ) {
      this.controller.open();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = this.asNode(event.relatedTarget);
    if (!next || this.host.nativeElement.contains(next)) {
      return;
    }
    this.controller.close();
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.inPanel(event.target)) {
      return;
    }
    if (this.isIcon()) {
      if (!this.iconButton()?.nativeElement.contains(this.asNode(event.target))) {
        return;
      }
      this.focusOnOpen = !this.open();
      this.controller.toggle();
      return;
    }
    if (this.opensOn() === 'click') {
      this.controller.toggle();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.stopPropagation();
      this.closeAndRefocus();
      return;
    }
    const isHostButton =
      !this.isIcon() &&
      this.opensOn() === 'click' &&
      event.target === this.host.nativeElement &&
      this.contentTrigger() === this.host.nativeElement;
    if (isHostButton && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.controller.toggle();
    }
  }

  protected onClose(): void {
    this.closeAndRefocus();
  }

  private onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      this.closeAndRefocus();
    }
  }

  private onDocumentPointerDown(event: PointerEvent): void {
    const target = this.asNode(event.target);
    if (!target || !this.host.nativeElement.contains(target)) {
      this.controller.close();
    }
  }

  private closeAndRefocus(): void {
    const hadFocus = this.host.nativeElement.contains(
      this.document.activeElement
    );
    this.controller.close();
    if (hadFocus) {
      this.returningFocus = true;
      this.triggerElement()?.focus({ preventScroll: true });
      this.returningFocus = false;
    }
  }

  private reveal(): void {
    const panel = this.panel().nativeElement;
    this.animation?.cancel();
    this.leftWhileGrowing = false;
    if (!this.shown) {
      this.shown = true;
      panel.classList.add('su-tooltip-shown');
      if (typeof panel.showPopover === 'function' && !panel.matches(':popover-open')) {
        panel.showPopover();
      }
    }
    this.place();
    if (this.focusOnOpen) {
      this.focusOnOpen = false;
      this.closeButton()?.nativeElement.focus({ preventScroll: true });
    }
    requestFrame(this.document, () => this.morphed.set(true));
    if (this.moves(panel)) {
      this.animation = this.isIcon()
        ? this.growFromIcon(panel)
        : panel.animate(
            [
              { opacity: 0, transform: 'scale(0.6)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: this.duration(panel), easing: this.easing(panel) }
          );
      if (this.animation) {
        this.animation.onfinish = () => this.hideIfLeftWhileGrowing();
      }
    }
  }

  /** While it grows, only its visible part counts as under the pointer, so a pointer on the rest seems to leave it */
  private isGrowing(): boolean {
    return this.open() && this.animation?.playState === 'running';
  }

  private hideIfLeftWhileGrowing(): void {
    this.animation = null;
    if (this.leftWhileGrowing && !this.host.nativeElement.matches(':hover')) {
      this.controller.hide();
    }
  }

  private conceal(): void {
    this.morphed.set(false);
    if (!this.shown) {
      return;
    }
    const panel = this.panel().nativeElement;
    this.animation?.cancel();
    if (!this.moves(panel)) {
      this.removePanel(panel);
      return;
    }
    const duration = this.duration(panel) * 0.75;
    const animation =
      this.isIcon() && this.iconClip
        ? panel.animate(
            [{ clipPath: this.iconClip.to }, { clipPath: this.iconClip.from }],
            { duration, easing: 'ease-in' }
          )
        : panel.animate(
            [
              { opacity: 1, transform: 'none' },
              { opacity: 0, transform: 'scale(0.6)' },
            ],
            { duration, easing: 'ease-in' }
          );
    animation.onfinish = () => this.removePanel(panel);
    this.animation = animation;
  }

  private removePanel(panel: HTMLElement): void {
    this.shown = false;
    this.animation = null;
    panel.classList.remove('su-tooltip-shown');
    if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
  }

  private growFromIcon(panel: HTMLElement): Animation | null {
    if (!this.iconClip) {
      return null;
    }
    const duration = this.duration(panel);
    panel
      .querySelector('.su-tooltip-body')
      ?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], {
        duration,
      });
    return panel.animate(
      [{ clipPath: this.iconClip.from }, { clipPath: this.iconClip.to }],
      { duration, easing: this.easing(panel) }
    );
  }

  private place(): void {
    if (!this.shown) {
      return;
    }
    const panel = this.panel().nativeElement;
    const view = this.document.defaultView;
    const viewport = {
      width: this.document.documentElement.clientWidth,
      height: view?.innerHeight ?? 0,
    };
    const rtl = view?.getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const size: SuTooltipSize = {
      width: panel.offsetWidth,
      height: panel.offsetHeight,
    };
    const icon = this.iconButton()?.nativeElement;
    if (this.isIcon() && icon) {
      const iconRect = icon.getBoundingClientRect();
      const position = suTooltipIconPosition(iconRect, size, {
        placement: this.placement(),
        viewport,
        rtl,
      });
      panel.dataset['inline'] = position.inline;
      panel.dataset['block'] = position.block;
      panel.style.left = `${position.x}px`;
      panel.style.top = `${position.y}px`;
      panel.style.setProperty('--su-tooltip-icon-x', `${position.icon.x}px`);
      panel.style.setProperty('--su-tooltip-icon-y', `${position.icon.y}px`);
      const radius = parseFloat(view?.getComputedStyle(panel).borderTopLeftRadius ?? '') || 0;
      this.iconClip = suTooltipIconClip(position, size, iconRect.width, radius);
      return;
    }
    const position = suTooltipPosition(
      this.content().nativeElement.getBoundingClientRect(),
      size,
      { placement: this.placement(), offset: this.offset(), viewport, rtl }
    );
    panel.dataset['side'] = position.side;
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
    panel.style.transformOrigin = `${position.origin.x}px ${position.origin.y}px`;
    panel.style.setProperty('--su-tooltip-arrow-offset', `${position.arrow}px`);
  }

  private moves(panel: HTMLElement): boolean {
    const view = this.document.defaultView;
    return (
      this.animated() &&
      typeof panel.animate === 'function' &&
      !view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
  }

  private duration(panel: HTMLElement): number {
    const value = this.document.defaultView
      ?.getComputedStyle(panel)
      .getPropertyValue('--su-tooltip-duration')
      .trim();
    return toMilliseconds(value) ?? DEFAULT_DURATION;
  }

  private easing(panel: HTMLElement): string {
    const value = this.document.defaultView
      ?.getComputedStyle(panel)
      .getPropertyValue('--su-tooltip-easing')
      .trim();
    return value || 'cubic-bezier(0.2, 0.9, 0.3, 1.1)';
  }

  /** The element that takes focus for the tooltip: the icon, the content's first focusable element, or the host */
  private triggerElement(): HTMLElement | null {
    return this.isIcon()
      ? (this.iconButton()?.nativeElement ?? null)
      : this.contentTrigger();
  }

  private contentTrigger(): HTMLElement {
    return (
      this.content().nativeElement.querySelector<HTMLElement>(FOCUSABLE) ??
      this.host.nativeElement
    );
  }

  private linkTrigger(
    trigger: HTMLElement | null,
    describes: boolean,
    open: boolean
  ): void {
    if (this.linkedTrigger && this.linkedTrigger !== trigger) {
      this.unlink(this.linkedTrigger);
    }
    this.linkedTrigger = trigger;
    if (!trigger) {
      return;
    }
    const isHost = trigger === this.host.nativeElement;
    if (describes) {
      setToken(trigger, 'aria-describedby', this.panelId, true);
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-controls');
    } else {
      setToken(trigger, 'aria-describedby', this.panelId, false);
      trigger.setAttribute('aria-expanded', String(open));
      trigger.setAttribute('aria-controls', this.panelId);
    }
    toggleAttribute(trigger, 'role', 'button', isHost && !describes);
    toggleAttribute(trigger, 'tabindex', '0', isHost);
  }

  private unlink(trigger: HTMLElement): void {
    setToken(trigger, 'aria-describedby', this.panelId, false);
    trigger.removeAttribute('aria-expanded');
    trigger.removeAttribute('aria-controls');
    if (trigger === this.host.nativeElement) {
      trigger.removeAttribute('role');
      trigger.removeAttribute('tabindex');
    }
  }

  private inPanel(target: EventTarget | null): boolean {
    const node = this.asNode(target);
    return !!node && this.panel().nativeElement.contains(node);
  }

  private asNode(target: EventTarget | null): Node | null {
    return target instanceof Node ? target : null;
  }
}

function setToken(
  element: HTMLElement,
  name: string,
  token: string,
  present: boolean
): void {
  const tokens = (element.getAttribute(name) ?? '')
    .split(/\s+/)
    .filter(item => item && item !== token);
  const next = present ? [...tokens, token] : tokens;
  if (next.length) {
    element.setAttribute(name, next.join(' '));
  } else {
    element.removeAttribute(name);
  }
}

function toggleAttribute(
  element: HTMLElement,
  name: string,
  value: string,
  present: boolean
): void {
  if (present) {
    element.setAttribute(name, value);
  } else {
    element.removeAttribute(name);
  }
}

function toMilliseconds(value: string | undefined): number | null {
  const match = value?.match(/^([\d.]+)(ms|s)$/);
  if (!match) {
    return null;
  }
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

function requestFrame(document: Document, callback: () => void): void {
  const view = document.defaultView;
  if (view?.requestAnimationFrame) {
    view.requestAnimationFrame(callback);
  } else {
    callback();
  }
}
