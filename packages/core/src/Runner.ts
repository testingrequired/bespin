import { RuntimeEventEmitter } from './RuntimeEventEmitter';
import { TestInTestFile } from './TestInTestFile';
import type { TestResult } from './TestResult';

export abstract class Runner {
  abstract run(
    testsInTestFiles: Array<TestInTestFile>,
    testTimeout: number,
    events: RuntimeEventEmitter
  ): Promise<Array<[TestInTestFile, TestResult]>>;
}
