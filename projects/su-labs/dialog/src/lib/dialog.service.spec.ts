import { describe, expect, it } from 'vitest';
import { SuDialogService } from './dialog.service';

describe('SuDialogService', () => {
  it('exposes the dialog on screen as a signal and resolves with the answer', async () => {
    const service = new SuDialogService();
    service.configure({ acceptLabel: 'Sí' });
    const answer = service.confirm({ title: '¿Borrar?' });

    expect(service.current()).toMatchObject({ title: '¿Borrar?', acceptLabel: 'Sí', kind: 'confirm' });
    service.close(true);
    expect(await answer).toBe(true);
    expect(service.current()).toBeNull();
  });

  it('closes open dialogs as cancelled when destroyed', async () => {
    const service = new SuDialogService();
    const answer = service.confirm({ title: 'A' });
    service.ngOnDestroy();
    expect(await answer).toBe(false);
  });
});
