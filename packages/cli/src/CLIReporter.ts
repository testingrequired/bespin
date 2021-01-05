import { GluegunToolbox } from "gluegun";
import {
  TestResultState,
  Reporter,
  TestInTestFile,
  TestResult
} from "@testingrequired/bespin-core";

export class CLIReporter extends Reporter {
  constructor(private toolbox: GluegunToolbox) {
    super();
  }

  onRunStart(testsInTestFiles: Array<TestInTestFile>) {
    const { print } = this.toolbox;

    print.info("bespin");

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

    if (passingRun) {
      print.success("PASS");
    } else {
      print.error(`FAIL`);
    }
  }
}
