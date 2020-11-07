import path from 'path';
import { Config } from './Config';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';
import { TestInTestFile } from './TestInTestFile';

export class Runner {
  async run(configFilePath: string): Promise<[TestInTestFile, TestResult][]> {
    const configFile: Config = await import(configFilePath);

    if (!configFile.locator || !configFile.parser || !configFile.executor) {
      throw new Error('Incomplete config file');
    }

    const { parser } = configFile;

    const testFilePaths = await configFile.locator.locateTestFilePaths();
    const testsInTestFiles = (
      await Promise.all(
        testFilePaths.map(testFilePath => parser.getTests(testFilePath))
      )
    ).flat();

    const threads: Array<Worker> = testsInTestFiles.map(
      testInTestFile =>
        new Worker(`${__dirname}/TestWorker.js`, {
          workerData: {
            testInTestFile: {
              ...testInTestFile,
              testFilePath: path.join(
                process.cwd(),
                testInTestFile.testFilePath
              ),
            },
            configFilePath,
          },
        })
    );

    return new Promise<[TestInTestFile, TestResult][]>((resolve, reject) => {
      const results: [TestInTestFile, TestResult][] = [];

      for (let worker of threads) {
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
