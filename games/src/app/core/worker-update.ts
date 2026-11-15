import { field } from './api-url';

export type WorkerAnswer = 'ready' | 'no-new-version' | 'failed';

const ANSWERS: Readonly<Record<string, WorkerAnswer>> = {
  VERSION_READY: 'ready',
  NO_NEW_VERSION_DETECTED: 'no-new-version',
  VERSION_INSTALLATION_FAILED: 'failed',
};
const COMPLETED = 'OPERATION_COMPLETED';
export const WORKER_ANSWER_TIMEOUT_MS = 30_000;
const ACTIVATE_TIMEOUT_MS = 5_000;

function ask(
  container: ServiceWorkerContainer,
  action: string,
  timeoutMs: number,
  pick: (data: unknown, nonce: number) => boolean,
): Promise<unknown> {
  const worker = container.controller;
  if (!worker) {
    return Promise.resolve(null);
  }
  const nonce = Date.now() + Math.random();
  return new Promise((resolve) => {
    const done = (data: unknown): void => {
      container.removeEventListener('message', onMessage);
      clearTimeout(timer);
      resolve(data);
    };
    const onMessage = (event: MessageEvent<unknown>): void => {
      if (pick(event.data, nonce)) {
        done(event.data);
      }
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    container.addEventListener('message', onMessage);
    worker.postMessage({ action, nonce });
  });
}

export async function checkWorkerUpdate(
  container: ServiceWorkerContainer,
  timeoutMs = WORKER_ANSWER_TIMEOUT_MS,
): Promise<WorkerAnswer> {
  const type = (data: unknown): unknown => field(data, 'type');
  const answer = await ask(container, 'CHECK_FOR_UPDATES', timeoutMs, (data) => {
    const kind = type(data);
    return typeof kind === 'string' && kind in ANSWERS;
  });
  const kind = type(answer);
  return typeof kind === 'string' ? (ANSWERS[kind] ?? 'failed') : 'failed';
}

export async function activateWorkerUpdate(container: ServiceWorkerContainer): Promise<boolean> {
  const answer = await ask(
    container,
    'ACTIVATE_UPDATE',
    ACTIVATE_TIMEOUT_MS,
    (data, nonce) => field(data, 'type') === COMPLETED && field(data, 'nonce') === nonce,
  );
  return field(answer, 'result') === true;
}

export async function removeWorker(container: ServiceWorkerContainer, cacheStorage: CacheStorage): Promise<void> {
  const registrations = await container.getRegistrations().catch(() => []);
  await Promise.all(registrations.map((registration) => registration.unregister()));
  const names = await cacheStorage.keys().catch(() => []);
  await Promise.all(names.filter((name) => name.startsWith('ngsw:')).map((name) => cacheStorage.delete(name)));
}

export interface SavedFiles {
  readonly saved: number;
  readonly total: number;
}

const APP_GROUP = 'app';
const APP_CACHE_SUFFIX = ':assets:app:cache';

async function appFileUrls(): Promise<readonly string[] | null> {
  try {
    const manifest: unknown = await fetch(`/ngsw.json?ngsw-cache-bust=${Date.now()}`, { cache: 'no-store' }).then(
      (answer) => (answer.ok ? answer.json() : null),
    );
    const groups = field(manifest, 'assetGroups');
    const app = Array.isArray(groups) ? groups.find((group: unknown) => field(group, 'name') === APP_GROUP) : undefined;
    const urls = field(app, 'urls');
    return Array.isArray(urls) ? urls.filter((url: unknown): url is string => typeof url === 'string') : null;
  } catch {
    return null;
  }
}

export async function savedAppFiles(cacheStorage: CacheStorage): Promise<SavedFiles | null> {
  const urls = await appFileUrls();
  if (urls === null) {
    return null;
  }
  const name = (await cacheStorage.keys().catch(() => [])).find((key) => key.endsWith(APP_CACHE_SUFFIX));
  if (name === undefined) {
    return { saved: 0, total: urls.length };
  }
  const cache = await cacheStorage.open(name);
  const answers = await Promise.all(urls.map((url) => cache.match(url)));
  return { saved: answers.filter((answer) => answer !== undefined).length, total: urls.length };
}
