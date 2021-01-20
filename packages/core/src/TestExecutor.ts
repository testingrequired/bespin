import { performance } from 'perf_hooks';
import { TestResult, TestResultState } from './TestResult';
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

      return {
        state: TestResultState.FAIL,
        time,
        message: e.message,
      };
    }
  }
}
