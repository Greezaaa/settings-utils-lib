import { inject, Pipe, PipeTransform } from '@angular/core';
import { SiteLanguage } from './site-language';
import { SiteMessages } from './site-messages';

type MessageFn = (...args: never[]) => unknown;

export type MessagePath<T = SiteMessages> = {
  [K in keyof T & string]: T[K] extends MessageFn | readonly unknown[]
    ? K
    : T[K] extends object
      ? K | `${K}.${MessagePath<T[K]>}`
      : K;
}[keyof T & string];

export type MessageAt<P extends string, T = SiteMessages> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? MessageAt<Rest, T[Head]>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type MessageArgs<P extends MessagePath> = MessageAt<P> extends (...args: infer A) => unknown ? A : [];

export type MessageResult<P extends MessagePath> =
  MessageAt<P> extends (...args: never[]) => infer R ? R : MessageAt<P>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null;

const isFunction = (value: unknown): value is (...args: readonly unknown[]) => unknown =>
  typeof value === 'function';

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

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly messages = inject(SiteLanguage).messages;

  transform<P extends MessagePath>(path: P, ...args: MessageArgs<P>): MessageResult<P> {
    return translate(this.messages(), path, ...args);
  }
}
