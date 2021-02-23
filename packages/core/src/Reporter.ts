import { ValidConfig } from "./Config";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";

export abstract class Reporter {
  constructor() {
    this.onRuntimeStart = this.onRuntimeStart.bind(this);
    this.onRunStart = this.onRunStart.bind(this);
    this.onTestStart = this.onTestStart.bind(this);
    this.onTestEnd = this.onTestEnd.bind(this);
    this.onRunEnd = this.onRunEnd.bind(this);
  }

  // @ts-ignore: unused argument/s
  onRuntimeStart(config: ValidConfig): void {}

  // @ts-ignore: unused argument/s
  onRunStart(testsInTestFiles: Array<TestInTestFile>): void {}

  // @ts-ignore: unused argument/s
  onTestStart(testInTestFile: TestInTestFile): void {}

  // @ts-ignore: unused argument/s
  onTestEnd(testInTestFile: TestInTestFile, testResult: TestResult): void {}

  // @ts-ignore: unused argument/s
  onRunEnd(results: Array<[TestInTestFile, TestResult]>): void {}
}
