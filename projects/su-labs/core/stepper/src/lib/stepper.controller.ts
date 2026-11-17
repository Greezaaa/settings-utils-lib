import { createSuStore, SuReadableStore, SuWritableStore } from '@su-labs/core';
import { SuStepOptions, SuStepperOptions, SuStepperState, SuStepStatus, SuStepView } from './stepper.types';

/**
 * Framework-agnostic stepper: content split into steps shown one at a time. It keeps the current step, the steps
 * visited and completed, and checks each move against the steps' rules: leaving a step forward needs its `canNext`,
 * leaving it back its `canBack`, and a jump checks every step it passes. Rendering is left to the app, or to a
 * framework package such as `@su-labs/stepper` for Angular.
 */
export class SuStepperController {
  private steps: readonly SuStepOptions[];
  private linear: boolean;
  private current: number;
  private readonly visited = new Set<number>();
  /** Steps left forward at least once */
  private readonly passed = new Set<number>();
  private readonly stateStore: SuWritableStore<SuStepperState>;

  /** The steps and where the user stands */
  readonly state: SuReadableStore<SuStepperState>;

  constructor({
    steps = [],
    start = 0,
    linear = false,
  }: SuStepperOptions = {}) {
    this.steps = steps;
    this.linear = linear;
    this.current = this.clamp(start);
    this.visited.add(this.current);
    this.stateStore = createSuStore(this.buildState());
    this.state = this.stateStore.asReadonly();
  }

  /** Replaces the steps, e.g. when a form's validity changes; the current step stays, within the new count */
  setSteps(steps: readonly SuStepOptions[]): void {
    this.steps = steps;
    this.current = this.clamp(this.current);
    this.forgetBeyond(steps.length);
    this.visited.add(this.current);
    this.publish();
  }

  /** Whether going forward by more than one step only reaches steps already visited */
  setLinear(linear: boolean): void {
    this.linear = linear;
    this.publish();
  }

  /** Whether the rules let the user go from the current step to this one */
  canGoTo(index: number): boolean {
    if (!this.isEnabled(index) || index === this.current) {
      return false;
    }
    if (index < this.current) {
      return this.enabledBetween(index + 1, this.current + 1).every(
        step => this.steps[step]?.canBack !== false
      );
    }
    if (
      this.linear &&
      !this.visited.has(index) &&
      index !== this.nextEnabled()
    ) {
      return false;
    }
    return this.enabledBetween(this.current, index).every(
      step => this.steps[step]?.canNext !== false
    );
  }

  /**
   * Goes to a step, if the rules allow it.
   * @returns Whether it moved
   */
  goTo(index: number): boolean {
    if (!this.canGoTo(index)) {
      return false;
    }
    this.moveTo(index);
    return true;
  }

  /** Goes to the next step that isn't disabled, if the current one allows going forward */
  next(): boolean {
    return this.goTo(this.nextEnabled());
  }

  /** Goes to the previous step that isn't disabled, if the current one allows going back */
  back(): boolean {
    return this.goTo(this.previousEnabled());
  }

  /** Shows a step without checking the rules, e.g. when the app restores where the user was */
  select(index: number): void {
    const target = this.clamp(index);
    if (target !== this.current) {
      this.moveTo(target);
    }
  }

  /** Starts over: back to a step (the first by default) with nothing visited or completed */
  reset(start = 0): void {
    this.visited.clear();
    this.passed.clear();
    this.current = this.clamp(start);
    this.visited.add(this.current);
    this.publish();
  }

  private moveTo(index: number): void {
    if (index > this.current) {
      this.enabledBetween(this.current, index).forEach(step =>
        this.passed.add(step)
      );
    }
    this.current = index;
    this.visited.add(index);
    this.publish();
  }

  private publish(): void {
    this.stateStore.set(this.buildState());
  }

  private buildState(): SuStepperState {
    const count = this.steps.length;
    const steps = this.steps.map((step, index) => this.stepView(step, index));
    return {
      steps,
      current: this.current,
      count,
      isFirst: this.current === 0,
      isLast: this.current >= count - 1,
      canNext: this.canGoTo(this.nextEnabled()),
      canBack: this.canGoTo(this.previousEnabled()),
    };
  }

  private stepView(step: SuStepOptions, index: number): SuStepView {
    const current = index === this.current;
    const canNext = step.canNext !== false;
    const completed = step.completed === true || (this.passed.has(index) && canNext);
    const visited = this.visited.has(index);
    return {
      index,
      number: index + 1,
      label: step.label ?? null,
      status: this.status(current, completed, visited),
      current,
      completed,
      visited,
      disabled: step.disabled === true,
      canNext,
      canBack: step.canBack !== false,
      reachable: this.canGoTo(index),
    };
  }

  private status(
    current: boolean,
    completed: boolean,
    visited: boolean
  ): SuStepStatus {
    if (current) {
      return 'current';
    }
    if (completed) {
      return 'completed';
    }
    return visited ? 'visited' : 'upcoming';
  }

  private isEnabled(index: number): boolean {
    return (
      index >= 0 &&
      index < this.steps.length &&
      this.steps[index]?.disabled !== true
    );
  }

  /** The enabled steps from `start` up to, not including, `end` */
  private enabledBetween(start: number, end: number): number[] {
    const indexes: number[] = [];
    for (let index = start; index < end; index++) {
      if (this.isEnabled(index)) {
        indexes.push(index);
      }
    }
    return indexes;
  }

  private nextEnabled(): number {
    for (let index = this.current + 1; index < this.steps.length; index++) {
      if (this.isEnabled(index)) {
        return index;
      }
    }
    return -1;
  }

  private previousEnabled(): number {
    for (let index = this.current - 1; index >= 0; index--) {
      if (this.isEnabled(index)) {
        return index;
      }
    }
    return -1;
  }

  private clamp(index: number): number {
    return Math.max(0, Math.min(index, this.steps.length - 1));
  }

  private forgetBeyond(count: number): void {
    [this.visited, this.passed].forEach(indexes =>
      indexes.forEach(index => {
        if (index >= count) {
          indexes.delete(index);
        }
      })
    );
  }
}
