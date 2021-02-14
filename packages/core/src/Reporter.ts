import { ValidConfig } from "./Config";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";

export abstract class Reporter {
  // @ts-ignore: unused argument/s
  onTestStart(testInTestFile: TestInTestFile): void {}

  // @ts-ignore: unused argument/s
  onTestEnd(testInTestFile: TestInTestFile, testResult: TestResult): void {}

  onRunStart(
    // @ts-ignore: unused argument/s
    config: ValidConfig,
    // @ts-ignore: unused argument/s
    testsInTestFiles: Array<TestInTestFile>
  ): void {}

  // @ts-ignore: unused argument/s
  onRunEnd(results: Array<[TestInTestFile, TestResult]>): void {}
}
