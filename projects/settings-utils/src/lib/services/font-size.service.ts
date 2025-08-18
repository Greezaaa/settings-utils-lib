import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FontSizeService {
  readonly DEFAULT_SIZE = 14;
  readonly MAX_SIZE = 22;
  readonly MIN_SIZE = 10;

  fontSize = signal<number>(this.getStoredSize());
  isDefault = computed(() => this.fontSize() === this.DEFAULT_SIZE);
  isMax = computed(() => this.fontSize() === this.MAX_SIZE);
  isMin = computed(() => this.fontSize() === this.MIN_SIZE);

  private getStoredSize(): number {
    const stored = localStorage.getItem('fontSize');
    const size = stored ? parseInt(stored, 10) : this.DEFAULT_SIZE;
    return Math.min(Math.max(size, this.MIN_SIZE), this.MAX_SIZE);
  }

  private applyToDom(size: number) {
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
  }

  private persist(size: number) {
    localStorage.setItem('fontSize', size.toString());
  }

  init() {
    const size = this.getStoredSize();
    this.fontSize.set(size);
    this.applyToDom(size);
  }

  setFontSize(size: number) {
    const clamped = Math.min(Math.max(size, this.MIN_SIZE), this.MAX_SIZE);
    this.fontSize.set(clamped);
    this.applyToDom(clamped);
    this.persist(clamped);
  }

  increase(step = 2) {
    if (this.fontSize() < this.MAX_SIZE) this.setFontSize(this.fontSize() + step);
  }

  decrease(step = 2) {
    if (this.fontSize() > this.MIN_SIZE) this.setFontSize(this.fontSize() - step);
  }

  reset() {
    this.fontSize.set(this.DEFAULT_SIZE);
    this.applyToDom(this.DEFAULT_SIZE);
    localStorage.removeItem('fontSize');
  }
}