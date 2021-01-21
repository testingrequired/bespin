import { Reporter } from './Reporter';
import { TestInTestFile } from './TestInTestFile';
import type { TestResult } from './TestResult';

/**
 * Debug your way through a reporter life cycle
 */
export class DebugReporter extends Reporter {
  // @ts-ignore: Unused argument/s
  onTestStart(testInTestFile: TestInTestFile): void {
    debugger;
  }

  // @ts-ignore: Unused argument/s
  onTestEnd(testInTestFile: TestInTestFile, testResult: TestResult): void {
    debugger;
  }

  // @ts-ignore: Unused argument/s
  onRunStart(testsInTestFiles: TestInTestFile[]): void {
    debugger;
  }

  // @ts-ignore: Unused argument/s
  onRunEnd(results: [TestInTestFile, TestResult][]): void {
    debugger;
  }
}
