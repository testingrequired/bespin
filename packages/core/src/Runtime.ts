import { Config } from './Config';
import { Reporter } from './Reporter';
import { ParallelRunner } from './ParallelRunner';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';
import { workerPath } from './workerPath';
import { WorkerPool } from './WorkerPool';
import { Runner } from './Runner';

export class Runtime {
  constructor(private runTimeReporters: Array<Reporter> = []) {}

  async run(
    configFilePath: string,
    numberOfWorkers?: number
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const config = await Config.load(configFilePath);

    const testsInTestFiles = await Config.getTestsInTestFiles(config);

    const pool = new WorkerPool<
      { testInTestFile: TestInTestFile; configFilePath: string },
      [TestInTestFile, TestResult]
    >(workerPath, numberOfWorkers ?? config.settings.workers);

    const runner = new ParallelRunner(configFilePath, pool);
    const reporters = [...config.reporters, ...this.runTimeReporters];
    this.registerReporters(runner, reporters);

    const results = await runner.run(testsInTestFiles);

    return results;
  }

  private registerReporters(runner: Runner, reporters: Array<Reporter>) {
    runner.on('runStart', testsInTestFiles => {
      for (const reporter of reporters) {
        reporter.onRunStart(testsInTestFiles);
      }
    });

    runner.on('testStart', testsInTestFile => {
      for (const reporter of reporters) {
        reporter.onTestStart(testsInTestFile);
      }
    });

    runner.on('testEnd', (testsInTestFile, result) => {
      for (const reporter of reporters) {
        reporter.onTestEnd(testsInTestFile, result);
      }
    });

    runner.on('runEnd', results => {
      for (const reporter of reporters) {
        reporter.onRunEnd(results);
      }
    });
  }
}
