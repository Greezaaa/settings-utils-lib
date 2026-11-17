import { PageFeature } from '../../shared/page-feature';

export const DIALOG_FEATURES = {
  theming: {
    title: 'Your own look',
    description:
      'Every colour, border, radius, button and size is a CSS variable, for every dialog at once or, with cssClass, for one dialog only.',
    code: `.su-dialog-themed {
  --su-dialog-background: #0f3d2e;
  --su-dialog-text-color: #d1fae5;
  --su-dialog-title-color: #ecfdf5;
  --su-dialog-border: 1px solid #10b98155;
  --su-dialog-radius: 20px;
  --su-dialog-accept-background: #10b981;
  --su-dialog-accept-color: #0f3d2e;
  --su-dialog-cancel-color: #d1fae5;
  --su-dialog-cancel-border: 1px solid #10b98166;
}

this.dialog.confirm({
  title: 'Plant the seeds?',
  cssClass: 'su-dialog-themed',
});`,
  },
} satisfies Record<string, PageFeature>;
