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

    const { bold, underline, italic } = print.colors;

    print.divider();

    print.info(`${bold(italic("bespin"))}`);

    print.divider();

    print.info(`${underline("Config")}\n`);

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

  onRunEnd(results: Array<[TestInTestFile, TestResult]>): void {
    const { print } = this.toolbox;

    const { bold, underline, italic } = print.colors;

    print.divider();

    print.info(`${underline("Results")}\n`);

    const groups = groupBy(results, "testFilePath");

    Object.entries(groups).forEach(entry => {
      const [testFilePath, results] = entry;

      print.info(testFilePath);

      results.forEach(([testInTestFile, { state, time, message }]) => {
        const formattedTime = `${time.toFixed(2)}ms`;
        const printMessage = `- ${testInTestFile.testName} ${state} (${formattedTime})`;

        if (state === TestResultState.PASS) {
          print.success(printMessage);
        } else {
          print.error(`${printMessage}\n\nMessage:\n\n${message}`);
        }
      });
    });

    print.divider();

    const passingRun = results
      .map(([_, result]) => result)
      .every(({ state }) => state === TestResultState.PASS);

    if (passingRun) {
      print.success(bold(italic("PASS")));
    } else {
      print.error(bold(italic(`FAIL`)));
    }

    const endTime = performance.now();
    const time = (endTime - this.startTime) / 1000;
    print.info(`Done in ${time.toFixed(2)}s`);

    print.divider();
  }
}

function groupBy(
  arr: Array<[TestInTestFile, TestResult]>,
  key: number | string
): Record<string, Array<[TestInTestFile, TestResult]>> {
  return arr.reduce(function(
    groups: Record<string, Array<[TestInTestFile, TestResult]>>,
    item: [TestInTestFile, TestResult]
  ) {
    const [testInTestFile] = item as [TestInTestFile, TestResult];

    if (!Array.isArray(groups[testInTestFile[key]])) {
      groups[testInTestFile[key]] = [];
    }

    groups[testInTestFile[key]].push(item);

    return groups;
  },
  {});
}
