import {
  Reporter,
  TestInTestFile,
  TestResult,
  ValidConfig,
  Events,
} from '@testingrequired/bespin-core';

/**
 * Debug your way through a reporter life cycle
 */
export class DebugReporter extends Reporter {
  constructor(private logEvents: Array<Events> = []) {
    super();
  }

  // @ts-ignore: Unused argument/s
  onTestStart(testInTestFile: TestInTestFile): void {
    this.logEvents.includes(Events.testStart) &&
      console.log(Events.testStart, { testInTestFile });

    debugger;
  }

  // @ts-ignore: Unused argument/s
  onTestEnd(testInTestFile: TestInTestFile, testResult: TestResult): void {
    this.logEvents.includes(Events.testEnd) &&
      console.log(Events.testEnd, { testInTestFile, testResult });

    debugger;
  }

  // @ts-ignore: Unused argument/s
  onRuntimeStart(config: ValidConfig) {
    this.logEvents.includes(Events.runtimeStart) &&
      console.log(Events.runtimeStart, { config });

    debugger;
  }
  // @ts-ignore: Unused argument/s
  onRunStart(testsInTestFiles: TestInTestFile[]): void {
    this.logEvents.includes(Events.runStart) &&
      console.log(Events.runStart, { testsInTestFiles });
    debugger;
  }

  // @ts-ignore: Unused argument/s
  onRunEnd(results: [TestInTestFile, TestResult][]): void {
    this.logEvents.includes(Events.runEnd) &&
      console.log(Events.runEnd, { results });
    debugger;
  }
}
