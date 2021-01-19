import { join } from 'path';
import { TestResult } from './TestResult';
import { TestInTestFile } from './TestInTestFile';
import { WorkerPool } from './WorkerPool';
import { Runner } from './Runner';

export class ParallelRunner extends Runner {
  constructor(
    private configFilePath: string,
    private pool: WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >
  ) {
    super();
  }

  async run(
    testsInTestFiles: Array<TestInTestFile>
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    this.emit('runStart', testsInTestFiles);

    const workers = testsInTestFiles.map(testInTestFile =>
      this.pool
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
        })
    );

    const results = await Promise.all(workers);

    this.emit('runEnd', results);

    return results;
  }
}
