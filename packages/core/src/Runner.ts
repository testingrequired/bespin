import { join } from 'path';
import { Config } from './Config';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';
import { TestInTestFile } from './TestInTestFile';

export class Runner {
  run(configFilePath: string): Promise<[TestInTestFile, TestResult][]> {
    return new Promise<Array<[TestInTestFile, TestResult]>>(
      async (resolve, reject) => {
        const config = await Config.load(configFilePath);

        const results: Array<[TestInTestFile, TestResult]> = [];

        const testFilePaths = await config.locator.locateTestFilePaths();

        const testsInTestFiles = (
          await Promise.all(
            testFilePaths.map(path => config.parser.getTests(path))
          )
        ).flat();

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

            results.push([fixedTestInTestFile, testResult]);
          });

          worker.on('exit', () => {
            if (results.length === testsInTestFiles.length) {
              resolve(results);
            }
          });
        }
      }
    );
  }
}
