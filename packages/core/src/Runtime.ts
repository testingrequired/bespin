import { Config } from './Config';
import { Reporter } from './Reporter';
import { Runner } from './Runner';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';
import { workerPath } from './workerPath';
import { WorkerPool } from './WorkerPool';

export class Runtime {
  constructor(private runTimeReporters: Array<Reporter> = []) {}

  async run(
    configFilePath: string,
    numberOfWorkers?: number
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const config = await Config.load(configFilePath);

    config.reporters.push(...this.runTimeReporters);

    const pool = new WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >(workerPath, numberOfWorkers ?? config.settings.workers);

    const runner = this.initializeRunner(config);
    const testsInTestFiles = await Config.getTestsInTestFiles(config);
    const results = await runner.run(configFilePath, testsInTestFiles, pool);

    return results;
  }

  private initializeRunner(config: Required<Config>): Runner {
    const runner = new Runner();

    runner.on('runStart', testsInTestFiles => {
      for (const reporter of config.reporters) {
        reporter.onRunStart(testsInTestFiles);
      }
    });

    runner.on('testStart', testsInTestFile => {
      for (const reporter of config.reporters) {
        reporter.onTestStart(testsInTestFile);
      }
    });

    runner.on('testEnd', (testsInTestFile, result) => {
      for (const reporter of config.reporters) {
        reporter.onTestEnd(testsInTestFile, result);
      }
    });

    runner.on('runEnd', results => {
      for (const reporter of config.reporters) {
        reporter.onRunEnd(results);
      }
    });

    return runner;
  }
}
