import {
  TestResultState,
  TestResult,
  TestInTestFile,
  TestExecutor,
  TestFileParser
} from "@testingrequired/bespin-core";
import { GluegunPrint } from "gluegun";

export const name = "bespin";

export const run = async ({ print, filesystem }) => {
  const configFilePath = "bespin.config.js";

  print.info("bespin");

  if (!filesystem.exists(configFilePath)) {
    print.error(
      "Config file missing! Please create a 'bespin.config.js' file."
    );

    return;
  }

  const configFile = await import(configFilePath);

  print.info(`Test File Locator: ${configFile.locator.constructor.name}`);
  const testFilePaths = await configFile.locator.locateTestFilePaths();
  print.success(`Test Files: ${JSON.stringify(testFilePaths)}`);

  print.info(`Test File Parser: ${configFile.parser.constructor.name}`);
  const tests = await getTests(testFilePaths, configFile.parser);
  print.success(`Tests: ${JSON.stringify(tests)}`);
  print.info(`Test Executor: ${configFile.executor.constructor.name}`);

  const results = await getResults(tests, configFile.executor);
  const zippedResults = await getZippedResults(tests, results);
  printResults(zippedResults, print);

  const passingRun = results.every(
    result => result.state === TestResultState.PASS
  );

  if (!passingRun) {
    process.exit(1);
  }
};

async function getTests(testFilePaths: Array<string>, parser: TestFileParser) {
  const tests: Array<TestInTestFile> = (
    await Promise.all(testFilePaths.map(path => parser.parseTestFile(path)))
  ).flat();

  return tests;
}

async function getResults(
  tests: Array<TestInTestFile>,
  executor: TestExecutor
) {
  return (
    await Promise.all(tests.map(test => executor.executeTest(test)))
  ).flat();
}

async function getZippedResults(
  tests: Array<TestInTestFile>,
  results: Array<TestResult>
) {
  const zippedResults: Array<[TestInTestFile, TestResult]> = results.map(
    (result, i) => {
      return [tests[i], result];
    }
  );

  return zippedResults;
}

function printResults(
  zippedResults: Array<[TestInTestFile, TestResult]>,
  print: GluegunPrint
): void {
  zippedResults.forEach(zippedResult => {
    const [test, result] = zippedResult;
    const printMessage = `${test.testFilePath}:${test.testName} ${
      result.state
    } (${result.time.toFixed(2)}ms)`;

    if (result.state === TestResultState.PASS) {
      print.success(printMessage);
    } else {
      print.error(`${printMessage}\nMessage:\n${result.message}`);
    }
  });
}
