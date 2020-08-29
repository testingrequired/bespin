import {
  TestResultState,
  TestResult,
  TestInTestFile,
} from "@testingrequired/bespin-core";

export const name = "bespin";

export const run = async ({ print, filesystem }) => {
  const configFilePath = "bespin.config.js";

  print.info("bespin!");
  print.info(TestResultState.PASS);

  if (!filesystem.exists(configFilePath)) {
    print.error(
      "Config file missing! Please create a 'bespin.config.js' file."
    );
  }

  const configFile = await import(configFilePath);

  print.info(`Test File Locator: ${configFile.locator.constructor.name}`);

  const testFilePaths = await configFile.locator.locateTestFilePaths();
  print.success(`Test Files: ${JSON.stringify(testFilePaths)}`);

  print.info(`Test File Parser: ${configFile.parser.constructor.name}`);

  const tests: Array<TestInTestFile> = (
    await Promise.all(
      testFilePaths.map((path) => configFile.parser.parseTestFile(path))
    )
  ).flat() as Array<TestInTestFile>;

  print.success(`Tests: ${JSON.stringify(tests)}`);

  print.info(`Test Executor: ${configFile.executor.constructor.name}`);

  const results: Array<TestResult> = (
    await Promise.all(
      tests.map((test) => configFile.executor.executeTest(test))
    )
  ).flat();

  const zippedResults: Array<[TestInTestFile, TestResult]> = results.map(
    (result, i) => {
      return [tests[i], result];
    }
  );

  zippedResults.forEach((zippedResult) => {
    const [test, result] = zippedResult;
    const printMessage = `${test.testFilePath}:${test.testName} ${result.state}`;

    if (result.state === TestResultState.PASS) {
      print.success(printMessage);
    } else {
      print.error(`${printMessage}\nMessage:\n${result.message}`);
    }
  });

  const passingRun = results.every(
    (result) => result.state === TestResultState.PASS
  );

  if (!passingRun) {
    process.exit(1);
  }
};
