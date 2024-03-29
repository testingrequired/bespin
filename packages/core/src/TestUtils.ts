import { Runner } from "./Runner";
import { Events, RuntimeEventEmitter } from "./RuntimeEventEmitter";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult, TestResultState } from "./TestResult";

export function createTestInTestFile(
  testFilePath: string,
  testName: string,
  testFn: () => Promise<void> = jest.fn()
): TestInTestFile {
  return new TestInTestFile(testFilePath, testName, testFn);
}

export function testRunner<T extends Runner>(
  runnerClass: new (...args: Array<unknown>) => T,
  ...args: Array<unknown>
) {
  describe(runnerClass.prototype.name, () => {
    const events = new RuntimeEventEmitter();

    let runner: T;

    let testsInTestFiles: Array<TestInTestFile>;

    beforeEach(() => {
      testsInTestFiles = [
        createTestInTestFile("tests/1", "Test 1 A"),
        createTestInTestFile("tests/1", "Test 1 B"),
        createTestInTestFile("tests/2", "Test 2 A"),
        createTestInTestFile("tests/2", "Test 2 B"),
        createTestInTestFile("tests/3", "Test 3 A"),
      ];

      runner = new runnerClass(...args);
    });

    it("should not throw an error", () => {
      expect(() =>
        runner.run(testsInTestFiles, 1000, events)
      ).not.toThrowError();
    });

    it("should execute all test functions", async () => {
      await runner.run(testsInTestFiles, 1000, events);

      for (const testInTestFile of testsInTestFiles) {
        expect(testInTestFile.testFn).toHaveBeenCalledTimes(1);
      }
    });

    it("should emit runStart event", async () => {
      const event = jest.fn();

      events.on(Events.runStart, event);

      await runner.run(testsInTestFiles, 1000, events);

      expect(event).toHaveBeenCalledTimes(1);
      expect(event).toHaveBeenCalledWith(testsInTestFiles);
    });

    it("should emit testStart events", async () => {
      const event = jest.fn();

      events.on(Events.testStart, event);

      await runner.run(testsInTestFiles, 1000, events);

      expect(event).toHaveBeenCalledTimes(testsInTestFiles.length);

      for (const testInTestFile of testsInTestFiles) {
        expect(event).toHaveBeenCalledWith(testInTestFile);
      }
    });

    it("should emit testEnd events", async () => {
      const event = jest.fn();

      events.on(Events.testEnd, event);

      await runner.run(testsInTestFiles, 1000, events);

      expect(event).toHaveBeenCalledTimes(testsInTestFiles.length);

      for (const testInTestFile of testsInTestFiles) {
        expect(event).toHaveBeenCalledWith(testInTestFile, {
          state: TestResultState.PASS,
          time: expect.any(Number),
        } as TestResult);
      }
    });

    it("should emit runEnd emit", async () => {
      const event = jest.fn();

      events.on(Events.runEnd, event);

      await runner.run(testsInTestFiles, 1000, events);

      expect(event).toHaveBeenCalledTimes(1);
      expect(event).toHaveBeenCalledWith([
        [
          testsInTestFiles[0],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[1],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[2],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[3],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[4],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
      ]);
    });
  });
}
