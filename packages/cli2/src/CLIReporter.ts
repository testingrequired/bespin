import {
  TestResultState,
  Reporter,
  TestInTestFile,
  TestResult,
  ValidConfig,
} from '@testingrequired/bespin-core';

export class CLIReporter extends Reporter {
  private startTime: number = 0;

  onRunStart(config: ValidConfig, testsInTestFiles: Array<TestInTestFile>) {
    console.log('bespin');

    console.log(`Locator: ${config.locator.constructor.name}`);
    console.log(`Parser: ${config.parser.constructor.name}`);
    console.log(`Runner: ${config.runner.constructor.name}`);
    console.log(
      `Reporters: ${config.reporters.map(x => x.constructor.name).join(', ')}`
    );

    this.startTime = performance.now();

    const testFiles = Array.from(
      new Set(testsInTestFiles.map(x => x.testFilePath))
    );

    console.log(`Test Files: ${testFiles.length}`);
    console.log(`Tests: ${testsInTestFiles.length}`);
  }

  onRunEnd(results: [TestInTestFile, TestResult][]): void {
    results.forEach(([testInTestFile, { state, time, message }]) => {
      const formattedTime = `${time.toFixed(2)}ms`;
      const printMessage = `${testInTestFile.testFilePath}:${testInTestFile.testName} ${state} (${formattedTime})`;

      if (state === TestResultState.PASS) {
        console.log(printMessage);
      } else {
        console.log(`${printMessage}\nMessage:\n${message}`);
      }
    });

    const passingRun = results
      .map(([_, result]) => result)
      .every(({ state }) => state === TestResultState.PASS);

    const endTime = performance.now();

    const time = endTime - this.startTime;

    console.log(`Run time: ${time.toFixed(0)}ms`);

    if (passingRun) {
      console.log('PASS');
    } else {
      console.log(`FAIL`);
    }
  }
}
