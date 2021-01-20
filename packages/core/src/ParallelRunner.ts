import { join } from 'path';
import { TestResult } from './TestResult';
import { TestInTestFile } from './TestInTestFile';
import { WorkerPool } from './WorkerPool';
import { Runner } from './Runner';
import { workerPath } from './workerPath';

export class ParallelRunner extends Runner {
  private pool: WorkerPool<
    { testInTestFile: TestInTestFile; configFilePath: string },
    [TestInTestFile, TestResult]
  >;

  constructor(private configFilePath: string, numberOfWorkers: number) {
    super();

    this.pool = new WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >(workerPath, numberOfWorkers);
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
