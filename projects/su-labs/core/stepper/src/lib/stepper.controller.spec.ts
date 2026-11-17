import { describe, expect, it } from 'vitest';
import { SuStepperController } from './stepper.controller';
import { SuStepOptions } from './stepper.types';

const THREE: readonly SuStepOptions[] = [
  { label: 'Account' },
  {},
  { label: 'Done' },
];

describe('SuStepperController', () => {
  it('starts on the first step with its label or only its number', () => {
    const stepper = new SuStepperController({ steps: THREE });
    const state = stepper.state.get();

    expect(state).toMatchObject({
      current: 0,
      count: 3,
      isFirst: true,
      isLast: false,
      canNext: true,
      canBack: false,
    });
    expect(
      state.steps.map(step => [step.number, step.label, step.status])
    ).toEqual([
      [1, 'Account', 'current'],
      [2, null, 'upcoming'],
      [3, 'Done', 'upcoming'],
    ]);
  });

  it('moves forward and back, completing the steps it leaves forward', () => {
    const stepper = new SuStepperController({ steps: THREE });

    expect(stepper.next()).toBe(true);
    expect(stepper.next()).toBe(true);
    expect(stepper.next()).toBe(false);
    expect(stepper.state.get()).toMatchObject({
      current: 2,
      isLast: true,
      canNext: false,
    });

    expect(stepper.back()).toBe(true);
    expect(stepper.state.get().steps.map(step => step.status)).toEqual([
      'completed',
      'current',
      'visited',
    ]);
  });

  it('stays on a step that doesn’t allow going forward, and the step stops being completed', () => {
    const stepper = new SuStepperController({ steps: THREE });
    stepper.next();
    stepper.back();
    stepper.setSteps([{ canNext: false }, {}, {}]);

    expect(stepper.next()).toBe(false);
    expect(stepper.state.get()).toMatchObject({ current: 0, canNext: false });
    expect(stepper.state.get().steps[0]?.completed).toBe(false);

    stepper.setSteps([{ canNext: true }, {}, {}]);
    expect(stepper.state.get().steps[0]?.completed).toBe(true);
    expect(stepper.next()).toBe(true);
  });

  it('stays on a step that doesn’t allow going back', () => {
    const stepper = new SuStepperController({
      steps: [{}, { canBack: false }, {}],
    });
    stepper.next();

    expect(stepper.state.get().canBack).toBe(false);
    expect(stepper.back()).toBe(false);
    expect(stepper.state.get().current).toBe(1);
  });

  it('checks every step a jump passes', () => {
    const stepper = new SuStepperController({
      steps: [{}, { canNext: false }, {}, { canBack: false }, {}],
    });

    expect(stepper.canGoTo(1)).toBe(true);
    expect(stepper.canGoTo(2)).toBe(false);
    expect(stepper.goTo(4)).toBe(false);

    stepper.select(4);
    expect(stepper.canGoTo(3)).toBe(true);
    expect(stepper.goTo(2)).toBe(false);
    expect(stepper.state.get().steps.map(step => step.reachable)).toEqual([
      false,
      false,
      false,
      true,
      false,
    ]);
  });

  it('skips disabled steps and never goes to one', () => {
    const stepper = new SuStepperController({
      steps: [{}, { disabled: true }, {}],
    });

    expect(stepper.canGoTo(1)).toBe(false);
    expect(stepper.next()).toBe(true);
    expect(stepper.state.get().current).toBe(2);
    expect(stepper.back()).toBe(true);
    expect(stepper.state.get().current).toBe(0);
  });

  it('only reaches visited steps and the next one when linear', () => {
    const stepper = new SuStepperController({
      steps: [{}, {}, {}, {}],
      linear: true,
    });

    expect(stepper.canGoTo(1)).toBe(true);
    expect(stepper.canGoTo(2)).toBe(false);
    stepper.next();
    stepper.next();
    stepper.goTo(0);
    expect(stepper.canGoTo(2)).toBe(true);
    expect(stepper.canGoTo(3)).toBe(false);

    stepper.setLinear(false);
    expect(stepper.canGoTo(3)).toBe(true);
  });

  it('selects a step without the rules, and resets', () => {
    const stepper = new SuStepperController({
      steps: [{ canNext: false }, {}, {}],
    });

    stepper.select(9);
    expect(stepper.state.get().current).toBe(2);

    stepper.reset();
    expect(stepper.state.get().current).toBe(0);
    expect(
      stepper.state
        .get()
        .steps.every(step => step.current || step.status === 'upcoming')
    ).toBe(true);
  });

  it('keeps the current step within fewer steps and forgets the removed ones', () => {
    const stepper = new SuStepperController({ steps: THREE, start: 2 });
    stepper.setSteps([{}, {}]);

    expect(stepper.state.get()).toMatchObject({
      current: 1,
      count: 2,
      isLast: true,
    });
    stepper.setSteps(THREE);
    expect(stepper.state.get().steps[2]?.visited).toBe(false);
  });

  it('notifies subscribers of each move', () => {
    const stepper = new SuStepperController({ steps: THREE });
    const seen: number[] = [];
    const unsubscribe = stepper.state.subscribe(state =>
      seen.push(state.current)
    );

    stepper.next();
    stepper.next();
    unsubscribe();
    stepper.back();
    expect(seen).toEqual([0, 1, 2]);
  });
});
