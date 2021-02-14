import {
  Runner,
  TestInTestFile,
  TestResult,
  TestExecutor,
  RuntimeEventEmitter,
} from "@testingrequired/bespin-core";

export class AsyncRunner extends Runner {
  async run(
    testsInTestFiles: TestInTestFile[],
    testTimeout: number,
    events: RuntimeEventEmitter
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const executor = new TestExecutor();

    events.emit("runStart", testsInTestFiles);

    const results: Array<[TestInTestFile, TestResult]> = await Promise.all(
      testsInTestFiles.map(
        async (test): Promise<[TestInTestFile, TestResult]> => {
          events.emit("testStart", test);

          const result = await executor.executeTest(test.testFn, testTimeout);

          events.emit("testEnd", test, result);

          return [test, result];
        }
      )
    );

    events.emit("runEnd", results);

    return results;
  }
}
