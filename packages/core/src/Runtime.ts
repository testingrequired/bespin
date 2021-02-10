import { EventEmitter } from 'events';
import { Reporter } from './Reporter';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';
import { Runner } from './Runner';
import { ValidConfig } from './Config';
import { randomizeArray } from './randomize';
import minimatch from 'minimatch';

export class Runtime {
  public events: EventEmitter = new EventEmitter();

  constructor(private config: ValidConfig) {}

  async run(): Promise<Array<[TestInTestFile, TestResult]>> {
    const { reporters, locator, parser, settings, runner, env } = this.config;

    this.registerReporters(reporters);
    this.registerRunner(runner);

    const oldEnv: Record<string, string | undefined> = {};

    Object.entries(env).forEach(([key, value]) => {
      if (process.env[key]) {
        oldEnv[key] = process.env[key];
      }

      process.env[key] = value;
    });

    let testsInTestFiles = await locator
      .locateTestFilePaths()
      .then(paths => Promise.all(paths.map(path => parser.getTests(path))))
      .then(files => files.flat());

    if (settings.randomizeTests) {
      testsInTestFiles = randomizeArray(testsInTestFiles);
    }

    if (settings.testFileFilter) {
      testsInTestFiles = testsInTestFiles.filter(test =>
        minimatch(test.testFilePath, settings.testFileFilter as string)
      );
    }

    if (settings.testNameFilter) {
      testsInTestFiles = testsInTestFiles.filter(test =>
        test.testName.includes(settings.testNameFilter as string)
      );
    }

    const results = runner.run(testsInTestFiles);

    Object.entries(oldEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });

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
