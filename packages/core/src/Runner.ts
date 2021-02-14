import { EventEmitter } from 'events';
import { TestInTestFile } from './TestInTestFile';
import type { TestResult } from './TestResult';

export abstract class Runner extends EventEmitter {
  abstract run(
    testsInTestFiles: Array<TestInTestFile>,
    testTimeout: number
  ): Promise<Array<[TestInTestFile, TestResult]>>;
}

export declare interface Runner {
  emit(event: 'runStart', testsInTestFiles: Array<TestInTestFile>): boolean;
  on(
    event: 'runStart',
    listener: (testsInTestFiles: Array<TestInTestFile>) => void
  ): this;

  emit(event: 'testStart', testsInTestFile: TestInTestFile): boolean;
  on(
    event: 'testStart',
    listener: (testsInTestFile: TestInTestFile) => void
  ): this;

  emit(
    event: 'testEnd',
    testInTestFile: TestInTestFile,
    result: TestResult
  ): boolean;
  on(
    event: 'testEnd',
    listener: (testInTestFile: TestInTestFile, result: TestResult) => void
  ): this;

  emit(event: 'runEnd', results: Array<[TestInTestFile, TestResult]>): boolean;
  on(
    event: 'runEnd',
    listener: (results: Array<[TestInTestFile, TestResult]>) => void
  ): this;
}
