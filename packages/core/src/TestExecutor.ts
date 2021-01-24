import { AssertionError } from 'assert';
import { performance } from 'perf_hooks';
import { TestResult } from './TestResult';
import { TestResultState } from './TestResult';
import { TestFunction } from './TestFunction';

export class TestExecutor {
  async executeTest(test: TestFunction): Promise<TestResult> {
    let t0;

    try {
      t0 = performance.now();
      await test.apply(null);
      const t1 = performance.now();
      const time = t1 - t0;

      return {
        state: TestResultState.PASS,
        time,
      };
    } catch (e) {
      const t1 = performance.now();
      const time = t1 - (t0 as number);

      const isAssertionError = e instanceof AssertionError;

      const state = isAssertionError
        ? TestResultState.FAIL
        : TestResultState.ERROR;

      const result: TestResult = {
        state,
        time,
        message: e.message,
      };

      if (!isAssertionError) {
        result.error = e;
      }

      return result;
    }
  }
}
