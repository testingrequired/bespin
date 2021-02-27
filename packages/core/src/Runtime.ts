import { EventEmitter } from "events";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";
import { ValidConfig } from "./Config";
import { randomizeArray } from "./randomize";
import minimatch from "minimatch";
import { RuntimeEventEmitter } from "./RuntimeEventEmitter";
import { withGlobals } from "./withGlobals";

export class Runtime {
  public events: EventEmitter = new RuntimeEventEmitter();

  constructor(private config: ValidConfig) {
    this.config.reporters.forEach((reporter) => {
      this.events.on("runtimeStart", reporter.onRuntimeStart);
      this.events.on("runStart", reporter.onRunStart);
      this.events.on("testStart", reporter.onTestStart);
      this.events.on("testEnd", reporter.onTestEnd);
      this.events.on("runEnd", reporter.onRunEnd);
    });
  }

  async run(): Promise<Array<[TestInTestFile, TestResult]>> {
    const { locator, parser, settings, runner, globals } = this.config;

    this.events.emit("runtimeStart", this.config);

    let testFilePaths = await locator.locateTestFilePaths();

    if (settings.testFileFilter) {
      testFilePaths = testFilePaths.filter((testFilePath) =>
        minimatch(testFilePath, settings.testFileFilter as string)
      );
    }

    return withGlobals(globals, async () => {
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

      return runner.run(testsInTestFiles, settings.testTimeout, this.events);
    });
  }
}
