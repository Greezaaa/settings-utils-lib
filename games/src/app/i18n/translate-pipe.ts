import { inject, Pipe, PipeTransform } from '@angular/core';
import { SiteLanguage } from './site-language';
import { SiteMessages } from './site-messages';

type MessageFn = (...args: never[]) => unknown;

/** Every dotted path into the site's messages, e.g. `rooms.showScores` or `games` */
export type MessagePath<T = SiteMessages> = {
  [K in keyof T & string]: T[K] extends MessageFn | readonly unknown[]
    ? K
    : T[K] extends object
      ? K | `${K}.${MessagePath<T[K]>}`
      : K;
}[keyof T & string];

/** The message found at a path */
export type MessageAt<P extends string, T = SiteMessages> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? MessageAt<Rest, T[Head]>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** What a message at a path needs: a function's arguments, or nothing */
export type MessageArgs<P extends MessagePath> = MessageAt<P> extends (...args: infer A) => unknown ? A : [];

/** What a message at a path shows: a function's text, or the message itself */
export type MessageResult<P extends MessagePath> =
  MessageAt<P> extends (...args: never[]) => infer R ? R : MessageAt<P>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null;

const isFunction = (value: unknown): value is (...args: readonly unknown[]) => unknown =>
  typeof value === 'function';

/** The message at a path, called with the arguments when it is a function */
export function translate<P extends MessagePath>(
  messages: SiteMessages,
  path: P,
  ...args: MessageArgs<P>
): MessageResult<P>;
export function translate(messages: SiteMessages, path: string, ...args: readonly unknown[]): unknown {
  const message = path
    .split('.')
    .reduce<unknown>((value, key) => (isRecord(value) ? value[key] : undefined), messages);
  return isFunction(message) ? message(...args) : message;
}

/**
 * A text in the site's language: `{{ 'rooms.showScores' | translate }}`,
 * with a function message's arguments after it: `{{ 'rooms.points' | translate: score }}`.
 * Impure, so it follows the language signal; a lookup is a few property reads.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly messages = inject(SiteLanguage).messages;

  transform<P extends MessagePath>(path: P, ...args: MessageArgs<P>): MessageResult<P> {
    return translate(this.messages(), path, ...args);
  }
}
