import { Middleware } from './Middleware';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';

export abstract class Reporter extends Middleware {
  abstract onTestStart(testInTestFile: TestInTestFile): void;

  abstract onTestEnd(
    testInTestFile: TestInTestFile,
    testResult: TestResult
  ): void;

  abstract onRunStart(testsInTestFiles: Array<TestInTestFile>): void;

  abstract onRunEnd(results: Array<[TestInTestFile, TestResult]>): void;
}
