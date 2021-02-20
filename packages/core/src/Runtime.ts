import { EventEmitter } from "events";
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
    this.config.reporters.forEach((reporter) => {
      this.events.on("runStart", reporter.onRunStart);
      this.events.on("testStart", reporter.onTestStart);
      this.events.on("testEnd", reporter.onTestEnd);
      this.events.on("runEnd", reporter.onRunEnd);
    });
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
}
