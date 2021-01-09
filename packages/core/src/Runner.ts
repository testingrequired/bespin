import { EventEmitter } from 'events';
import { join } from 'path';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';
import { TestInTestFile } from './TestInTestFile';

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

export class Runner extends EventEmitter {
  async run(
    testsInTestFiles: Array<TestInTestFile>,
    configFilePath: string
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    return new Promise<Array<[TestInTestFile, TestResult]>>(
      async (resolve, reject) => {
        this.emit('runStart', testsInTestFiles);

        const workers: Array<Worker> = testsInTestFiles.map(testInTestFile => {
          /**
           * Ensure test worker can import test file.
           */
          const testInTestFileForWorker = {
            ...testInTestFile,
            testFilePath: join(process.cwd(), testInTestFile.testFilePath),
          };

          this.emit('testStart', testInTestFile);

          return new Worker(__dirname + `/TestWorker.js`, {
            workerData: {
              testInTestFile: testInTestFileForWorker,
              configFilePath,
            },
          });
        });

        const results: Array<[TestInTestFile, TestResult]> = [];

        for (const worker of workers) {
          worker.on('error', err => {
            reject(err);
          });

          worker.on('message', (result: [TestInTestFile, TestResult]) => {
            const [testInTestFile, testResult] = result;
            const { testFilePath, testName } = testInTestFile;

            /**
             * Provide a cleaner test name in results
             */
            const fixedTestFilePath = testFilePath
              .replace(process.cwd(), '')
              .slice(1);

            const fixedTestInTestFile = {
              testFilePath: fixedTestFilePath,
              testName,
            };

            this.emit('testEnd', fixedTestInTestFile, testResult);

            results.push([fixedTestInTestFile, testResult]);
          });

          worker.on('exit', () => {
            if (results.length === testsInTestFiles.length) {
              this.emit('runEnd', results);

              resolve(results);
            }
          });
        }
      }
    );
  }
}
