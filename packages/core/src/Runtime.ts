import { EventEmitter } from "events";
import { Reporter } from "./Reporter";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";
import { ValidConfig } from "./Config";
import { randomizeArray } from "./randomize";
import minimatch from "minimatch";
import { RuntimeEventEmitter } from "./RuntimeEventEmitter";

declare var global: any;

export class Runtime {
  public events: EventEmitter = new RuntimeEventEmitter();

  constructor(private config: ValidConfig) {
    this.registerReporters(config.reporters);
  }

  async run(): Promise<Array<[TestInTestFile, TestResult]>> {
    const { locator, parser, settings, runner, globals } = this.config;

    let testFilePaths = await locator.locateTestFilePaths();

    if (settings.testFileFilter) {
      testFilePaths = testFilePaths.filter((testFilePath) =>
        minimatch(testFilePath, settings.testFileFilter as string)
      );
    }

    Object.entries(globals).forEach(([key, value]) => {
      global[key] = value;
    });

    let testsInTestFiles = await Promise.all(
      testFilePaths.map((path) => parser.getTests(path))
    ).then((files) => files.flat());

    if (settings.testNameFilter) {
      testsInTestFiles = testsInTestFiles.filter((test) =>
        test.testName.includes(settings.testNameFilter as string)
      );
    }

    if (settings.randomizeTests) {
      testsInTestFiles = randomizeArray(testsInTestFiles);
    }

    const results = runner.run(
      testsInTestFiles,
      settings.testTimeout,
      this.events
    );

    Object.entries(globals).forEach(([key]) => {
      delete global[key];
    });

    return results;
  }

  private registerReporters(reporters: Array<Reporter>) {
    this.events.on("runStart", (testsInTestFiles) => {
      for (const reporter of reporters) {
        reporter.onRunStart(this.config, testsInTestFiles);
      }
    });

    this.events.on("testStart", (testsInTestFile) => {
      for (const reporter of reporters) {
        reporter.onTestStart(testsInTestFile);
      }
    });

    this.events.on("testEnd", (testsInTestFile, result) => {
      for (const reporter of reporters) {
        reporter.onTestEnd(testsInTestFile, result);
      }
    });

    this.events.on("runEnd", (results) => {
      for (const reporter of reporters) {
        reporter.onRunEnd(results);
      }
    });
  }
}
