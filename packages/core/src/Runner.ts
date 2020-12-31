import { join } from 'path';
import { Config } from './Config';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';
import { TestInTestFile } from './TestInTestFile';

export class Runner {
  async run(configFilePath: string): Promise<[TestInTestFile, TestResult][]> {
    const { locator, parser } = await Config.load(configFilePath);

    const testFilePaths = await locator.locateTestFilePaths();

    const testsInTestFiles = (
      await Promise.all(testFilePaths.map(path => parser.getTests(path)))
    ).flat();

    return new Promise<[TestInTestFile, TestResult][]>((resolve, reject) => {
      const results: Array<[TestInTestFile, TestResult]> = [];

      const workers: Array<Worker> = testsInTestFiles.map(
        testInTestFile =>
          new Worker(`${__dirname}/TestWorker.js`, {
            workerData: {
              testInTestFile: {
                ...testInTestFile,
                testFilePath: join(process.cwd(), testInTestFile.testFilePath),
              },
              configFilePath,
            },
          })
      );

      for (const worker of workers) {
        worker.on('error', err => {
          reject(err);
        });

        worker.on('message', (result: [TestInTestFile, TestResult]) => {
          const [testInTestFile, testResult] = result;
          const { testFilePath, testName } = testInTestFile;

          const fixedTestFilePath = testFilePath
            .replace(process.cwd(), '')
            .slice(1);

          results.push([
            {
              testFilePath: fixedTestFilePath,
              testName,
            },
            testResult,
          ]);
        });

        worker.on('exit', () => {
          if (results.length === testsInTestFiles.length) {
            resolve(results);
          }
        });
      }
    });
  }
}
