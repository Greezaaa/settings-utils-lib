// font-size.service.ts
import { signal, computed } from '@angular/core';

export class FontSizeService {
  private static readonly DEFAULT_SIZE = 14;
  private static readonly MAX_SIZE = 22;
  private static readonly MIN_SIZE = 10;

  static fontSize = signal<number>(FontSizeService.getStoredSize());
  static isDefault = computed(() => FontSizeService.fontSize() === FontSizeService.DEFAULT_SIZE);
  static isMax = computed(() => FontSizeService.fontSize() === FontSizeService.MAX_SIZE);
  static isMin = computed(() => FontSizeService.fontSize() === FontSizeService.MIN_SIZE);

  private static getStoredSize(): number {
    const stored = localStorage.getItem('fontSize');
    const size = stored ? parseInt(stored, 10) : FontSizeService.DEFAULT_SIZE;
    return Math.min(Math.max(size, FontSizeService.MIN_SIZE), FontSizeService.MAX_SIZE);
  }

  private static applyToDom(size: number) {
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
  }

  private static persist(size: number) {
    localStorage.setItem('fontSize', size.toString());
  }

  static setFontSize(size: number) {
    const clamped = Math.min(Math.max(size, this.MIN_SIZE), this.MAX_SIZE);
    this.fontSize.set(clamped);
    this.applyToDom(clamped);
    this.persist(clamped);
  }

  static increase(step = 2) {
    if (this.fontSize() < this.MAX_SIZE) this.setFontSize(this.fontSize() + step);
  }

  static decrease(step = 2) {
    if (this.fontSize() > this.MIN_SIZE) this.setFontSize(this.fontSize() - step);
  }

  static reset() {
    this.fontSize.set(this.DEFAULT_SIZE);
    this.applyToDom(this.DEFAULT_SIZE);
    localStorage.removeItem('fontSize');
  }

  static init() {
    const size = this.getStoredSize();
    this.fontSize.set(size);
    this.applyToDom(size);
  }
}
