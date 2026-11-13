import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ readonly outcome: 'accepted' | 'dismissed' }>;
}

const isInstallPrompt = (event: Event): event is InstallPrompt =>
  typeof Reflect.get(event, 'prompt') === 'function' && Reflect.get(event, 'userChoice') instanceof Promise;

@Injectable({ providedIn: 'root' })
export class AppInstall {
  private readonly features = inject(FeatureFlags);
  private readonly prompt = signal<InstallPrompt | null>(null);
  private readonly isInstalled = signal(false);
  private readonly needsSteps = signal(false);

  readonly canPrompt = computed(() => this.prompt() !== null);
  readonly needsManualSteps = computed(() => !this.canPrompt() && this.needsSteps());
  readonly isAvailable = computed(
    () => this.features.canUse('install-app') && !this.isInstalled() && (this.canPrompt() || this.needsSteps()),
  );

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    afterNextRender(() => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches || Reflect.get(navigator, 'standalone') === true;
      const isAppleTouch =
        /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
      this.isInstalled.set(isStandalone);
      this.needsSteps.set(isAppleTouch);
    });
    window.addEventListener('beforeinstallprompt', (event) => {
      if (isInstallPrompt(event)) {
        event.preventDefault();
        this.prompt.set(event);
      }
    });
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.prompt.set(null);
    });
  }

  async install(): Promise<void> {
    const prompt = this.prompt();
    if (!prompt) {
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    this.prompt.set(null);
    this.isInstalled.set(outcome === 'accepted');
  }
}
