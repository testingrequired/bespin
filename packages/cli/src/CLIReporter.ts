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
  private spinner: any;

  constructor(private toolbox: GluegunToolbox) {
    super();
  }

  onRuntimeStart(config: ValidConfig) {
    const { print, meta } = this.toolbox;

    const { bold, underline, italic } = print.colors;

    print.divider();

    print.info(`${bold(italic("bespin"))} v${meta.version()}`);

    print.divider();

    print.info(`${underline("Config")}\n`);

    print.table(
      [
        ["Field", "Value"],
        ["Locator", config.locator.constructor.name],
        ["Parser", config.parser.constructor.name],
        ["Runner", config.runner.constructor.name],
        ["Reporters", config.reporters.map(x => x.constructor.name).join(", ")]
      ],
      {
        format: "markdown"
      }
    );

    print.divider();

    this.spinner = print.spin("Loading tests...");
  }

  onRunStart(testsInTestFiles: Array<TestInTestFile>) {
    this.spinner.stop();

    const { print } = this.toolbox;

    const { underline } = print.colors;

    print.divider();

    print.info(`${underline("Tests")}\n`);

    const testFiles = Array.from(
      new Set(testsInTestFiles.map(x => x.testFilePath))
    );

    print.table(
      [
        ["Field", "Value"],
        ["Test Files", testFiles.length.toString()],
        ["Tests", testsInTestFiles.length.toString()]
      ],
      {
        format: "markdown"
      }
    );

    print.divider();

    this.spinner = print.spin("Running tests...");
  }

  onRunEnd(results: Array<[TestInTestFile, TestResult]>): void {
    this.spinner.stop();

    const { print } = this.toolbox;

    const { bold, underline, italic } = print.colors;

    print.info(`${underline("Results")}\n`);

    const groups = groupBy(results, "testFilePath");

    Object.entries(groups).forEach(entry => {
      const [testFilePath, results] = entry;

      print.info(testFilePath);

      results.forEach(([testInTestFile, { state, time, message, error }]) => {
        const formattedTime = `${time.toFixed(2)}ms`;
        const printMessage = `- ${testInTestFile.testName} ${state} (${formattedTime})`;

        if (state === TestResultState.PASS) {
          print.success(printMessage);
        } else {
          print.error(
            `${printMessage}\n\nMessage:\n\n${message ?? ""}\n${error}`
          );
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
