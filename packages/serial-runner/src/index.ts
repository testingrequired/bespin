import {
  Runner,
  TestExecutor,
  TestInTestFile,
  TestResult,
} from "@testingrequired/bespin-core";

export class SerialRunner extends Runner {
  async run(
    testsInTestFiles: TestInTestFile[]
  ): Promise<[TestInTestFile, TestResult][]> {
    const executor = new TestExecutor();

    this.emit("runStart", testsInTestFiles);

    const results: Array<[TestInTestFile, TestResult]> = [];

    for (const test of testsInTestFiles) {
      this.emit("testStart", test);

      const result = await executor.executeTest(test.testFn);

      this.emit("testEnd", test, result);

      results.push([test, result]);
    }

    this.emit("runEnd", results);

    return results;
  }
}
