import path from 'path';
import { Config } from './Config';
import { TestFileParser } from './TestFileParser';
import { TestResult } from './TestResult';
import { Worker } from 'worker_threads';

export class Runner {
  async run(
    configFile: Config
  ): Promise<Array<[[string, string], TestResult]>> {
    if (!configFile.locator || !configFile.parser || !configFile.executor) {
      throw new Error('');
    }

    const testFilePaths = await configFile.locator.locateTestFilePaths();
    const tests = await TestFileParser.getTests(
      testFilePaths,
      configFile.parser
    );

    const threads: Array<Worker> = [];

    for (let test of tests) {
      threads.push(
        new Worker(`${__dirname}/TestWorker.js`, {
          workerData: [
            path.join(process.cwd(), test.testFilePath),
            test.testName,
          ],
        })
      );
    }

    const returnPromise = new Promise<Array<[[string, string], TestResult]>>(
      (resolve, reject) => {
        const results: Array<[[string, string], TestResult]> = [];

        for (let worker of threads) {
          worker.on('error', err => {
            reject(err);
          });

          worker.on('message', (result: [[string, string], TestResult]) => {
            results.push(result);
          });

          worker.on('exit', () => {
            if (results.length === tests.length) {
              resolve(results);
            }
          });
        }
      }
    );

    return returnPromise;
  }
}
