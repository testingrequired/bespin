import {
  Runner,
  TestInTestFile,
  TestResult,
  TestExecutor,
} from "@testingrequired/bespin-core";

export class AsyncRunner extends Runner {
  async run(
    testsInTestFiles: TestInTestFile[],
    testTimeout: number
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const executor = new TestExecutor();

    this.emit("runStart", testsInTestFiles);

    const results: Array<[TestInTestFile, TestResult]> = await Promise.all(
      testsInTestFiles.map(
        async (test): Promise<[TestInTestFile, TestResult]> => {
          this.emit("testStart", test);

          const result = await executor.executeTest(test.testFn, testTimeout);

          this.emit("testEnd", test, result);

          return [test, result];
        }
      )
    );

    this.emit("runEnd", results);

    return results;
  }
}
