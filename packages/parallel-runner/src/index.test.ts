import {
  RuntimeEventEmitter,
  TestInTestFile,
  TestResult,
  TestResultState,
  Events,
} from "@testingrequired/bespin-core";
import { ParallelRunner } from ".";

const poolRunMockPromise = jest.fn();

const poolRunMock = jest.fn().mockImplementation(async (fn) => {
  fn();

  return poolRunMockPromise();
});

jest.mock("./WorkerPool", () => {
  return {
    WorkerPool: function() {
      return {
        run: poolRunMock,
      };
    },
  };
});

describe("ParallelRunner", () => {
  const expectedConfigFilePath = "expectedConfigFilePath";

  const events = new RuntimeEventEmitter();

  let runner: ParallelRunner;

  beforeEach(() => {
    runner = new ParallelRunner(expectedConfigFilePath, 1);
  });

  describe("constructor", () => {
    it("should error if passing zero workers", () => {
      expect(() => {
        new ParallelRunner(expectedConfigFilePath, 0);
      }).toThrowError("Number of workers must be 1 or more");
    });

    it("should error if passing negative workers", () => {
      expect(() => {
        new ParallelRunner(expectedConfigFilePath, -5);
      }).toThrowError("Number of workers must be 1 or more");
    });
  });

  describe("run", () => {
    const expectedTestInTestFile = {
      testFilePath: "expectedFilePath",
      testName: "expectedTestName",
      testFn: jest.fn(),
    };

    const expectedTestInTestFiles: Array<TestInTestFile> = [
      expectedTestInTestFile,
    ];

    const expectedTestResult: TestResult = {
      state: TestResultState.PASS,
      time: 1,
    };

    beforeEach(() => {
      poolRunMockPromise.mockImplementation(async () => {
        return [expectedTestInTestFile, expectedTestResult];
      });
    });

    it("should emit runStart event", async () => {
      const event = jest.fn();
      events.on(Events.runStart, event);

      await runner.run(expectedTestInTestFiles, 1000, events);

      expect(event).toBeCalledWith(expectedTestInTestFiles);
    });

    it("should emit testStart event", async () => {
      const event = jest.fn();
      events.on(Events.testStart, event);

      await runner.run(expectedTestInTestFiles, 1000, events);

      expect(event).toBeCalledWith(expectedTestInTestFile);
    });

    it("should emit testEnd event", async () => {
      const event = jest.fn();
      events.on(Events.testEnd, event);

      await runner.run(expectedTestInTestFiles, 1000, events);

      expect(event).toBeCalledWith(
        {
          ...expectedTestInTestFile,
          testFilePath: expectedTestInTestFile.testFilePath.slice(1),
        },
        expectedTestResult
      );
    });

    it("should emit runEnd event", async () => {
      const event = jest.fn();
      events.on(Events.runEnd, event);

      await runner.run(expectedTestInTestFiles, 1000, events);

      expect(event).toBeCalledWith([
        [
          {
            ...expectedTestInTestFile,
            testFilePath: expectedTestInTestFile.testFilePath.slice(1),
          },
          expectedTestResult,
        ],
      ]);
    });

    it("should return results", async () => {
      const results = await runner.run(expectedTestInTestFiles, 1000, events);

      expect(results).toStrictEqual([
        [
          {
            ...expectedTestInTestFile,
            testFilePath: expectedTestInTestFile.testFilePath.slice(1),
          },
          expectedTestResult,
        ],
      ]);
    });
  });
});
