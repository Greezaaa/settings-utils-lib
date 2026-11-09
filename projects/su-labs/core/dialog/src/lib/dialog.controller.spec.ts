import { describe, expect, it } from 'vitest';
import { suDialogBackdropColor, SuDialogController } from './dialog.controller';

describe('SuDialogController', () => {
  it('shows a dialog and resolves with the answer', async () => {
    const controller = new SuDialogController();
    const answer = controller.confirm({ title: 'Delete?', danger: true });

    const dialog = controller.current.get();
    expect(dialog).toMatchObject({ title: 'Delete?', kind: 'confirm', danger: true, acceptLabel: 'OK' });

    controller.close(true);
    expect(await answer).toBe(true);
    expect(controller.current.get()).toBeNull();
  });

  it('queues dialogs, one at a time', async () => {
    const controller = new SuDialogController();
    const first = controller.confirm({ title: 'One' });
    const second = controller.alert({ title: 'Two' });

    expect(controller.current.get()?.title).toBe('One');
    controller.close(false);
    expect(await first).toBe(false);
    expect(controller.current.get()).toMatchObject({ title: 'Two', kind: 'ok' });
    controller.close(true);
    await second;
    expect(controller.current.get()).toBeNull();
  });

  it('uses the configured defaults, and each dialog’s own options over them', () => {
    const controller = new SuDialogController();
    controller.configure({ acceptLabel: 'Aceptar', cancelLabel: 'Cancelar', width: '20rem' });
    void controller.confirm({ title: 'A', width: '30rem', backdrop: 'none' });

    expect(controller.current.get()).toMatchObject({
      acceptLabel: 'Aceptar',
      cancelLabel: 'Cancelar',
      width: '30rem',
      size: 'small',
      height: null,
      backdropColor: 'transparent',
      dismissible: true,
    });
  });

  it('is small unless a size is chosen, here or in the defaults', () => {
    const controller = new SuDialogController();
    void controller.alert({ title: 'A', size: 'large' });
    expect(controller.current.get()?.size).toBe('large');
    controller.close(true);
    controller.configure({ size: 'medium' });
    void controller.alert({ title: 'B' });
    expect(controller.current.get()?.size).toBe('medium');
  });

  it('closes every dialog as cancelled', async () => {
    const controller = new SuDialogController();
    const answers = [controller.confirm({ title: 'A' }), controller.confirm({ title: 'B' })];
    controller.destroy();
    expect(await Promise.all(answers)).toEqual([false, false]);
  });
});

describe('suDialogBackdropColor', () => {
  it('mixes the colour by its opacity, kept between 0 and 1, or leaves it to the stylesheet', () => {
    expect(suDialogBackdropColor({ backdropOpacity: 0.3 })).toBe('color-mix(in srgb, #000 30%, transparent)');
    expect(suDialogBackdropColor({ backdropColor: 'navy', backdropOpacity: 3 })).toBe(
      'color-mix(in srgb, navy 100%, transparent)',
    );
    expect(suDialogBackdropColor({ backdrop: 'none', backdropOpacity: 0.5 })).toBe('transparent');
    expect(suDialogBackdropColor({})).toBeNull();
  });
});
