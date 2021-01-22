import { EventEmitter } from 'events';
import { Config } from './Config';
import { Reporter } from './Reporter';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';
import { Runner } from './Runner';

export class Runtime {
  public events: EventEmitter = new EventEmitter();

  constructor(private runTimeReporters: Array<Reporter> = []) {}

  async run(
    configFilePath: string
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const config = await Config.load(configFilePath);

    const testsInTestFiles = await Config.getTestsInTestFiles(config);

    const reporters = [...config.reporters, ...this.runTimeReporters];
    this.registerReporters(reporters);

    this.registerRunner(config.runner);
    const results = await config.runner.run(testsInTestFiles);

    return results;
  }

  private registerRunner(runner: Runner) {
    runner.on('runStart', testsInTestFiles => {
      this.events.emit('runStart', testsInTestFiles);
    });

    runner.on('testStart', testsInTestFile => {
      this.events.emit('testStart', testsInTestFile);
    });

    runner.on('testEnd', (testsInTestFile, result) => {
      this.events.emit('testEnd', testsInTestFile, result);
    });

    runner.on('runEnd', results => {
      this.events.emit('runEnd', results);
    });
  }

  private registerReporters(reporters: Array<Reporter>) {
    this.events.on('runStart', testsInTestFiles => {
      for (const reporter of reporters) {
        reporter.onRunStart(testsInTestFiles);
      }
    });

    this.events.on('testStart', testsInTestFile => {
      for (const reporter of reporters) {
        reporter.onTestStart(testsInTestFile);
      }
    });

    this.events.on('testEnd', (testsInTestFile, result) => {
      for (const reporter of reporters) {
        reporter.onTestEnd(testsInTestFile, result);
      }
    });

    this.events.on('runEnd', results => {
      for (const reporter of reporters) {
        reporter.onRunEnd(results);
      }
    });
  }
}
