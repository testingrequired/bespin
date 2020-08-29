import { TestResultState } from "@testingrequired/bespin-core";

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

  const tests = await Promise.all(
    testFilePaths.map((path) => configFile.parser.parseTestFile(path))
  );

  print.success(`Tests: ${JSON.stringify(tests)}`);
};
