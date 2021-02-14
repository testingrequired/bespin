import {
  Runner,
  RuntimeEventEmitter,
  TestExecutor,
  TestInTestFile,
  TestResult,
} from "@testingrequired/bespin-core";

export class SerialRunner extends Runner {
  async run(
    testsInTestFiles: TestInTestFile[],
    testTimeout: number,
    events: RuntimeEventEmitter
  ): Promise<[TestInTestFile, TestResult][]> {
    const executor = new TestExecutor();

    events.emit("runStart", testsInTestFiles);

    const results: Array<[TestInTestFile, TestResult]> = [];

    for (const test of testsInTestFiles) {
      events.emit("testStart", test);

      const result = await executor.executeTest(test.testFn, testTimeout);

      events.emit("testEnd", test, result);

      results.push([test, result]);
    }

    events.emit("runEnd", results);

    return results;
  }
}
