import { performance } from "perf_hooks";
import { GluegunToolbox } from "gluegun";
import {
  TestResultState,
  Reporter,
  TestInTestFile,
  TestResult,
  ValidConfig
} from "@testingrequired/bespin-core";

export class CLIReporter extends Reporter {
  private startTime: number;

  constructor(private toolbox: GluegunToolbox) {
    super();
  }

  onRunStart(config: ValidConfig, testsInTestFiles: Array<TestInTestFile>) {
    const { print } = this.toolbox;

    print.info("bespin");

    print.info(`Locator: ${config.locator.constructor.name}`);
    print.info(`Parser: ${config.parser.constructor.name}`);
    print.info(`Runner: ${config.runner.constructor.name}`);
    print.info(
      `Reporters: ${config.reporters.map(x => x.constructor.name).join(", ")}`
    );

    this.startTime = performance.now();

    const testFiles = Array.from(
      new Set(testsInTestFiles.map(x => x.testFilePath))
    );

    print.info(`Test Files: ${testFiles.length}`);
    print.info(`Tests: ${testsInTestFiles.length}`);
  }

  onRunEnd(results: [TestInTestFile, TestResult][]): void {
    const { print } = this.toolbox;

    results.forEach(([testInTestFile, { state, time, message }]) => {
      const formattedTime = `${time.toFixed(2)}ms`;
      const printMessage = `${testInTestFile.testFilePath}:${testInTestFile.testName} ${state} (${formattedTime})`;

      if (state === TestResultState.PASS) {
        print.success(printMessage);
      } else {
        print.error(`${printMessage}\nMessage:\n${message}`);
      }
    });

    const passingRun = results
      .map(([_, result]) => result)
      .every(({ state }) => state === TestResultState.PASS);

    const endTime = performance.now();

    const time = endTime - this.startTime;

    print.info(`Run time: ${time.toFixed(0)}ms`);

    if (passingRun) {
      print.success("PASS");
    } else {
      print.error(`FAIL`);
    }
  }
}
