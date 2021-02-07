import os from 'os';
import { join } from 'path';
import {
  Runner,
  TestInTestFile,
  TestResult,
} from '@testingrequired/bespin-core';
import { WorkerPool } from './WorkerPool';
import { workerPath } from './workerPath';

export class ParallelRunner extends Runner {
  constructor(private configFilePath: string, private numberOfWorkers: number) {
    super();
  }

  async run(
    testsInTestFiles: Array<TestInTestFile>
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const pool = new WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >(
      workerPath,
      Math.min(testsInTestFiles.length, os.cpus().length, this.numberOfWorkers)
    );

    this.emit('runStart', testsInTestFiles);

    const workers = testsInTestFiles.map(testInTestFile =>
      this.runTestInTestFile(pool, testInTestFile)
    );

    const results = await Promise.all(workers);

    this.emit('runEnd', results);

    return results;
  }

  private runTestInTestFile(
    pool: WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >,
    testInTestFile: TestInTestFile
  ) {
    return pool
      .run(() => {
        this.emit('testStart', testInTestFile);

        const testFilePath = join(process.cwd(), testInTestFile.testFilePath);

        const testInTestFileForWorker = {
          ...testInTestFile,
          testFilePath,
        };

        const workerData = {
          testInTestFile: testInTestFileForWorker,
          configFilePath: this.configFilePath,
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
      });
  }
}
