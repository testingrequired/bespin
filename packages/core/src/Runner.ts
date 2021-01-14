import { EventEmitter } from 'events';
import { join } from 'path';
import { TestResult } from './TestResult';
import { TestInTestFile } from './TestInTestFile';
import { WorkerPool } from './WorkerPool';

export class Runner extends EventEmitter {
  async run(
    configFilePath: string,
    testsInTestFiles: Array<TestInTestFile>,
    pool: WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    this.emit('runStart', testsInTestFiles);

    const workers = testsInTestFiles.map(testInTestFile =>
      pool
        .run(() => {
          this.emit('testStart', testInTestFile);

          const testFilePath = join(process.cwd(), testInTestFile.testFilePath);

          const testInTestFileForWorker = {
            ...testInTestFile,
            testFilePath,
          };

          const workerData = {
            testInTestFile: testInTestFileForWorker,
            configFilePath,
          };

          return workerData;
        })
        .then(testInTestFileResult => {
          const [testInTestFile, result] = testInTestFileResult;

          /**
           * Provide a cleaner test name in results
           */
          const fixedTestFilePath = testInTestFile.testFilePath
            .replace(process.cwd(), '')
            .slice(1);

          const fixedTestInTestFile = {
            testFilePath: fixedTestFilePath,
            testName: testInTestFile.testName,
          };

          this.emit('testEnd', fixedTestInTestFile, result);
          return testInTestFileResult;
        })
    );

    const results = await Promise.all(workers);

    this.emit('runEnd', results);

    return results;
  }
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
