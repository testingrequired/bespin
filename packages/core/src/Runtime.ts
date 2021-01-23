import { EventEmitter } from 'events';
import { Reporter } from './Reporter';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';
import { Runner } from './Runner';
import { ValidConfig } from './Config';

export class Runtime {
  public events: EventEmitter = new EventEmitter();

  constructor(
    private config: ValidConfig,
    private runTimeReporters: Array<Reporter> = []
  ) {}

  async run(): Promise<Array<[TestInTestFile, TestResult]>> {
    const testFilePaths = await this.config.locator.locateTestFilePaths();

    const testsInTestFiles = (
      await Promise.all(
        testFilePaths.map(path => this.config.parser.getTests(path))
      )
    ).flat();

    const reporters = [...this.config.reporters, ...this.runTimeReporters];
    this.registerReporters(reporters);

    this.registerRunner(this.config.runner);
    const results = await this.config.runner.run(testsInTestFiles);

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
        reporter.onRunStart(this.config, testsInTestFiles);
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
