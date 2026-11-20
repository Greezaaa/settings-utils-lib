export type UploadStatus = 'uploading' | 'done' | 'failed';

export interface UploadLane {
  readonly id: number;
  readonly name: string;
  readonly size: number;
  readonly previewUrl: string | null;
  readonly sent: number;
  readonly speed: number;
  readonly status: UploadStatus;
  readonly attempt: number;
}

export const TICK_MS = 200;
const UPLOAD_SECONDS = 4;
const FAIL_AT = 0.6;

export const advance = (lane: UploadLane): UploadLane => {
  const speed = (lane.size / UPLOAD_SECONDS) * (0.6 + Math.random() * 0.8);
  const sent = Math.min(lane.size, lane.sent + (speed * TICK_MS) / 1000);
  const failsNow = lane.attempt === 1 && lane.id % 3 === 0 && sent / lane.size >= FAIL_AT;
  if (failsNow) {
    return { ...lane, sent, speed: 0, status: 'failed' };
  }
  return { ...lane, sent, speed, status: sent >= lane.size ? 'done' : 'uploading' };
};

export const percentOf = (lane: UploadLane): number => Math.round((lane.sent / lane.size) * 100);

export const secondsLeft = (lane: UploadLane): number =>
  lane.speed > 0 ? Math.ceil((lane.size - lane.sent) / lane.speed) : 0;

export const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
