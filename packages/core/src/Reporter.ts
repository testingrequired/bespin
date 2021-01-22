import { TestInTestFile } from './TestInTestFile';
import type { TestResult } from './TestResult';

export abstract class Reporter {
  // @ts-ignore: unused argument/s
  onTestStart(testInTestFile: TestInTestFile): void {}

  // @ts-ignore: unused argument/s
  onTestEnd(testInTestFile: TestInTestFile, testResult: TestResult): void {}

  // @ts-ignore: unused argument/s
  onRunStart(testsInTestFiles: Array<TestInTestFile>): void {}

  // @ts-ignore: unused argument/s
  onRunEnd(results: Array<[TestInTestFile, TestResult]>): void {}
}
