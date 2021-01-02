import { join } from 'path';
import { Config } from './Config';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';
import { TestInTestFile } from './TestInTestFile';

export class Runner {
  async run(
    config: Required<Config>,
    configFilePath: string
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    return new Promise<Array<[TestInTestFile, TestResult]>>(
      async (resolve, reject) => {
        const testsInTestFiles = await Config.getTestsInTestFiles(config);

        for (const reporter of config.reporters) {
          reporter.onRunStart(testsInTestFiles);
        }

        const workers: Array<Worker> = testsInTestFiles.map(testInTestFile => {
          /**
           * Ensure test worker can import test file
           */
          const testInTestFileForWorker = {
            ...testInTestFile,
            testFilePath: join(process.cwd(), testInTestFile.testFilePath),
          };

          return new Worker(`${__dirname}/TestWorker.js`, {
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

            for (const reporter of config.reporters) {
              reporter.onTestEnd(fixedTestInTestFile, testResult);
            }

            results.push([fixedTestInTestFile, testResult]);
          });

          worker.on('exit', () => {
            if (results.length === testsInTestFiles.length) {
              for (const reporter of config.reporters) {
                reporter.onRunEnd(results);
              }

              resolve(results);
            }
          });
        }
      }
    );
  }
}
