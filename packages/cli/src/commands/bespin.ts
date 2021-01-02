import { GluegunToolbox } from "gluegun";
import {
  TestResultState,
  Runner,
  Config,
  Reporter,
  TestInTestFile,
  TestResult,
} from "@testingrequired/bespin-core";

export const name = "bespin";

export const run = async (toolbox: GluegunToolbox) => {
  const { print, filesystem } = toolbox;

  const configFilePath = toolbox.parameters.options?.c || "bespin.config.js";

  print.info("bespin");

  if (!filesystem.exists(configFilePath)) {
    print.error(
      "Config file missing! Please create a 'bespin.config.js' file."
    );

    return;
  }

  const config = await Config.load(configFilePath);

  config.reporters.push(new TerminalReporter(toolbox));

  const runner = new Runner();

  const results = await runner.run(config, configFilePath);

  const passingRun = results
    .map(([_, result]) => result)
    .every(({ state }) => state === TestResultState.PASS);

  process.exit(passingRun ? 0 : 1);
};

class TerminalReporter extends Reporter {
  constructor(private toolbox: GluegunToolbox) {
    super();
  }

  // @ts-ignore: Unused argument/s
  onTestStart(testInTestFile: TestInTestFile): void {
    // @ts-ignore
  }

  // @ts-ignore: Unused argument/s
  onTestEnd(testInTestFile: TestInTestFile, testResult: TestResult): void {
    // @ts-ignore
  }

  // @ts-ignore: Unused argument/s
  onRunStart(testsInTestFiles: TestInTestFile[]): void {
    // @ts-ignore
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
