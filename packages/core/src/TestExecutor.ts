import { Middleware } from './Middleware';
import { TestResult } from './TestResult';
import { TestInTestFile } from './TestInTestFile';

export abstract class TestExecutor extends Middleware {
  abstract executeTest(test: TestInTestFile): Promise<TestResult>;

  static async getResults(
    tests: Array<TestInTestFile>,
    executor: TestExecutor
  ): Promise<Array<TestResult>> {
    return (
      await Promise.all(tests.map(test => executor.executeTest(test)))
    ).flat();
  }

  static async getZippedResults(
    tests: Array<TestInTestFile>,
    results: Array<TestResult>
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    return results.map((result, i) => [tests[i], result]);
  }
}
