import { EventEmitter } from "events";
import { Reporter } from "./Reporter";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";
import { Runner } from "./Runner";
import { ValidConfig } from "./Config";
import { randomizeArray } from "./randomize";
import minimatch from "minimatch";

declare var global: any;

export class Runtime {
  public events: EventEmitter = new EventEmitter();

  constructor(private config: ValidConfig) {}

  async run(): Promise<Array<[TestInTestFile, TestResult]>> {
    const {
      reporters,
      locator,
      parser,
      settings,
      runner,
      globals,
    } = this.config;

    this.registerReporters(reporters);
    this.registerRunner(runner);

    let testFilePaths = await locator.locateTestFilePaths();

    if (settings.testFileFilter) {
      testFilePaths = testFilePaths.filter((testFilePath) =>
        minimatch(testFilePath, settings.testFileFilter as string)
      );
    }

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

    Object.entries(globals).forEach(([key, value]) => {
      global[key] = value;
    });

    const results = runner.run(testsInTestFiles, settings.testTimeout);

    Object.entries(globals).forEach(([key]) => {
      delete global[key];
    });

    return results;
  }

  private registerRunner(runner: Runner) {
    runner.on("runStart", (testsInTestFiles) => {
      this.events.emit("runStart", testsInTestFiles);
    });

    runner.on("testStart", (testsInTestFile) => {
      this.events.emit("testStart", testsInTestFile);
    });

    runner.on("testEnd", (testsInTestFile, result) => {
      this.events.emit("testEnd", testsInTestFile, result);
    });

    runner.on("runEnd", (results) => {
      this.events.emit("runEnd", results);
    });
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
