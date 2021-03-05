import {
  Runner,
  RuntimeEventEmitter,
  TestExecutor,
  TestInTestFile,
  TestResult,
  Events,
} from "@testingrequired/bespin-core";

export class SerialRunner extends Runner {
  async run(
    testsInTestFiles: TestInTestFile[],
    testTimeout: number,
    events: RuntimeEventEmitter
  ): Promise<[TestInTestFile, TestResult][]> {
    const executor = new TestExecutor();

    events.emit(Events.runStart, testsInTestFiles);

    const results: Array<[TestInTestFile, TestResult]> = [];

    for (const test of testsInTestFiles) {
      events.emit(Events.testStart, test);

      const result = await executor.executeTest(test.testFn, testTimeout);

      events.emit(Events.testEnd, test, result);

      results.push([test, result]);
    }

    events.emit(Events.runEnd, results);

    return results;
  }
}
