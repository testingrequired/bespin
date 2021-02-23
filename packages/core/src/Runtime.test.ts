import { when } from "jest-when";
import { Config, ValidConfig } from "./Config";
import { Reporter } from "./Reporter";
import { Runner } from "./Runner";
import { Runtime } from "./Runtime";
import { TestFileLocator } from "./TestFileLocator";
import { TestFileParser } from "./TestFileParser";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult, TestResultState } from "./TestResult";
import { randomizeArray } from "./randomize";
import { RuntimeEventEmitter } from "./RuntimeEventEmitter";

jest.mock("./randomize");

type TestTestInTestFile = {
  -readonly [K in keyof TestInTestFile]: TestInTestFile[K];
};

declare var global: any;

describe("Runtime", () => {
  const expectedPath = "example/test/path.test.js";
  const expectedPaths = [expectedPath];
  const expectedTestName = "expectedTestName";
  const expectedTestInTestFile: TestTestInTestFile = {
    testFilePath: expectedPath,
    testName: expectedTestName,
    testFn: jest.fn(),
  };
  const expectedTestResult: TestResult = {
    state: TestResultState.PASS,
    time: 1,
  };
  const expectedTestTimeout = 1000;

  let config: Config;
  let runtime: Runtime;
  let locator: TestFileLocator;
  let parser: TestFileParser;
  let runner: Runner;

  beforeEach(() => {
    locator = {
      locateTestFilePaths: jest.fn(),
    };

    parser = {
      getTests: jest.fn(),
    };

    runner = {
      run: jest.fn(),
    };

    config = new Config("")
      .withLocator(locator)
      .withParser(parser)
      .withRunner(runner)
      .withSetting("testTimeout", expectedTestTimeout);

    runtime = new Runtime(config as ValidConfig);

    when(locator.locateTestFilePaths as jest.Mock)
      .calledWith()
      .mockResolvedValueOnce(expectedPaths);

    when(parser.getTests as jest.Mock)
      .calledWith(expectedPath)
      .mockResolvedValue([expectedTestInTestFile]);
  });

  it("should locate, parse, run and report test results", async () => {
    when(runner.run as jest.Mock)
      .calledWith([expectedTestInTestFile], expectedTestTimeout, runtime.events)
      .mockResolvedValueOnce([expectedTestResult]);

    const results = await runtime.run();

    expect(results).toStrictEqual([expectedTestResult]);
  });

  it("should not randomize tests if setting is false", async () => {
    config.settings.randomizeTests = false;
    await runtime.run();
    expect(randomizeArray).not.toHaveBeenCalled();
  });

  it("should randomize tests if setting is true", async () => {
    config.settings.randomizeTests = true;
    await runtime.run();
    expect(randomizeArray).toHaveBeenCalledWith([expectedTestInTestFile]);
  });

  describe("globals", () => {
    it("should set globals during test parsing", async () => {
      const expectedValue = "testGlobalValue";
      config.globals.testGlobal = expectedValue;

      when(parser.getTests as jest.Mock)
        .calledWith(expectedPath)
        .mockImplementation(() => {
          expect(global.testGlobal).toEqual(expectedValue);
        });

      await runtime.run();
    });

    it("should set globals during test execution", async () => {
      const expectedValue = "testGlobalValue";
      config.globals.testGlobal = expectedValue;

      when(runner.run as jest.Mock)
        .calledWith(
          [expectedTestInTestFile],
          expectedTestTimeout,
          runtime.events
        )
        .mockImplementation(() => {
          expect(global.testGlobal).toEqual(expectedValue);
        });

      await runtime.run();
    });
  });

  describe("settings.testFileFilter", () => {
    const expectedTestInTestFileB: TestInTestFile = {
      testFilePath: "other/test/path.test.js",
      testName: "Other test",
      testFn: jest.fn(),
    };

    beforeEach(() => {
      config.settings.testFileFilter = "example/**/*.test.js";

      when(locator.locateTestFilePaths as jest.Mock)
        .calledWith()
        .mockResolvedValueOnce([
          ...expectedPaths,
          expectedTestInTestFileB.testFilePath,
        ]);

      when(parser.getTests as jest.Mock)
        .calledWith(expectedPath)
        .mockResolvedValueOnce([expectedTestInTestFile])
        .calledWith(expectedTestInTestFileB.testFilePath)
        .mockResolvedValueOnce([expectedTestInTestFileB]);
    });

    it("should filter test paths", async () => {
      await runtime.run();

      expect(runner.run).toBeCalledWith(
        [expectedTestInTestFile],
        expectedTestTimeout,
        runtime.events
      );
    });
  });

  describe("settings.testNameFilter", () => {
    const expectedTestInTestFileB: TestInTestFile = {
      testFilePath: "other/test/path.test.js",
      testName: "Other test",
      testFn: jest.fn(),
    };

    beforeEach(() => {
      config.settings.testNameFilter = "Example";

      expectedTestInTestFile.testName = "Example";

      when(locator.locateTestFilePaths as jest.Mock)
        .calledWith()
        .mockResolvedValueOnce([
          ...expectedPaths,
          expectedTestInTestFileB.testFilePath,
        ]);

      when(parser.getTests as jest.Mock)
        .calledWith(expectedPath)
        .mockResolvedValueOnce([expectedTestInTestFile])
        .calledWith(expectedTestInTestFileB.testFilePath)
        .mockResolvedValueOnce([expectedTestInTestFileB]);
    });

    it("should filter test names", async () => {
      await runtime.run();

      expect(runner.run).toBeCalledWith(
        [expectedTestInTestFile],
        expectedTestTimeout,
        runtime.events
      );
    });
  });

  describe("Runner Events", () => {
    beforeEach(() => {
      runner = new TestTestRunner();
      config.withRunner(runner);

      jest.spyOn(runner, "run");

      (runner.run as jest.Mock).mockImplementation(
        (_: any, __: any, events: RuntimeEventEmitter) => {
          events.emit("runStart", [expectedTestInTestFile]);
          events.emit("testStart", expectedTestInTestFile);
          events.emit("testEnd", expectedTestInTestFile, expectedTestResult);
          events.emit("runEnd", [[expectedTestInTestFile, expectedTestResult]]);
        }
      );
    });

    it("reemits runner runStart event", async () => {
      const runStartListener = jest.fn();

      runtime.events.on("runStart", runStartListener);

      await runtime.run();

      expect(runStartListener).toBeCalledWith([expectedTestInTestFile]);
    });

    it("reemits runner startStart events", async () => {
      const testStartListener = jest.fn();

      runtime.events.on("testStart", testStartListener);

      await runtime.run();

      expect(testStartListener).toBeCalledWith(expectedTestInTestFile);
    });

    it("reemits runner testEnd events", async () => {
      const testEndListener = jest.fn();

      runtime.events.on("testEnd", testEndListener);

      await runtime.run();

      expect(testEndListener).toBeCalledWith(
        expectedTestInTestFile,
        expectedTestResult
      );
    });

    it("reemits runner events", async () => {
      const runEndListener = jest.fn();

      runtime.events.on("runEnd", runEndListener);

      await runtime.run();

      expect(runEndListener).toBeCalledWith([
        [expectedTestInTestFile, expectedTestResult],
      ]);
    });
  });

  describe("Reporters", () => {
    let reporterA: Reporter;
    let reporterB: Reporter;

    beforeEach(() => {
      runner = new TestTestRunner();
      config.withRunner(runner);
      jest.spyOn(runner, "run");

      reporterA = testReporter();
      reporterB = testReporter();

      runtime = new Runtime(config as ValidConfig);

      runtime.events.emit("runStart", config, [expectedTestInTestFile]);
      runtime.events.emit("testStart", expectedTestInTestFile);
      runtime.events.emit(
        "testEnd",
        expectedTestInTestFile,
        expectedTestResult
      );
      runtime.events.emit("runEnd", [
        [expectedTestInTestFile, expectedTestResult],
      ]);
    });

    it("should call onRunStart", async () => {
      await runtime.run();
      expect(reporterA.onRunStart).toBeCalledWith(config, [
        expectedTestInTestFile,
      ]);

      expect(reporterB.onRunStart).toBeCalledWith(config, [
        expectedTestInTestFile,
      ]);
    });

    it("should call onTestStart", async () => {
      await runtime.run();
      expect(reporterA.onTestStart).toBeCalledWith(expectedTestInTestFile);
      expect(reporterB.onTestStart).toBeCalledWith(expectedTestInTestFile);
    });

    it("should call onTestEnd", async () => {
      await runtime.run();
      expect(reporterA.onTestEnd).toBeCalledWith(
        expectedTestInTestFile,
        expectedTestResult
      );
    });

    it("should call onRunEnd", async () => {
      await runtime.run();
      expect(reporterA.onRunEnd).toBeCalledWith([
        [expectedTestInTestFile, expectedTestResult],
      ]);
      expect(reporterB.onRunEnd).toBeCalledWith([
        [expectedTestInTestFile, expectedTestResult],
      ]);
    });

    class TestReporter extends Reporter {}

    function testReporter() {
      const reporter = new TestReporter();
      config.withReporter(reporter);
      jest.spyOn(reporter, "onRunStart");
      jest.spyOn(reporter, "onTestStart");
      jest.spyOn(reporter, "onTestEnd");
      jest.spyOn(reporter, "onRunEnd");
      return reporter;
    }
  });
});

class TestTestRunner extends Runner {
  async run(): Promise<[TestInTestFile, TestResult][]> {
    return [];
  }
}
