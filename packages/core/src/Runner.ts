import { join } from 'path';
import { Config } from './Config';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';
import { TestInTestFile } from './TestInTestFile';

export class Runner {
  async run(
    configFilePath: string
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    return new Promise<Array<[TestInTestFile, TestResult]>>(
      async (resolve, reject) => {
        const config = await Config.load(configFilePath);

        const testFilePaths = await config.locator.locateTestFilePaths();

        const testsInTestFiles = (
          await Promise.all(
            testFilePaths.map(path => config.parser.getTests(path))
          )
        ).flat();

        debugger;

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
        debugger;

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
