import { PageFeature } from '../../shared/page-feature';

export const NOTIFICATIONS_FEATURES = {
  theming: {
    title: 'Your own look',
    description:
      'Every colour, size, shadow and timing is a CSS variable, for all toasts at once or, with cssClass, for one toast only.',
    code: `.su-notification-themed {
  --su-notification-background-color: #0f3d2e;
  --su-notification-text-color: #d1fae5;
  --su-notification-success-border-color: #10b981;
  --su-notification-icon-color: #10b981;
  --su-notification-box-shadow: rgb(15 61 46 / 0.35);
  --su-notification-close-btn-text-color: #d1fae5;
}

this.notifications.show({
  type: 'success',
  message: 'Saved.',
  cssClass: 'su-notification-themed',
});`,
  },
} satisfies Record<string, PageFeature>;
