import { GluegunToolbox } from "gluegun";
import { TestResultState, Runner, Config } from "@testingrequired/bespin-core";
import { CLIReporter } from "../CLIReporter";

export const name = "bespin";

export const run = async (toolbox: GluegunToolbox) => {
  const { print, filesystem } = toolbox;

  const configFilePath = toolbox.parameters.options?.c || "bespin.config.js";

  if (!filesystem.exists(configFilePath)) {
    print.error(`bespin could not find config file: ${configFilePath}`);

    return;
  }

  const config = await Config.load(configFilePath);
  config.reporters.push(new CLIReporter(toolbox));

  const runner = initializeRunner(config);
  const testsInTestFiles = await Config.getTestsInTestFiles(config);
  const results = await runner.run(testsInTestFiles, configFilePath);

  const passingRun = results
    .map(([_, result]) => result)
    .every(({ state }) => state === TestResultState.PASS);

  process.exit(passingRun ? 0 : 1);
};

function initializeRunner(config: Required<Config>): Runner {
  const runner = new Runner();

  runner.on("runStart", testsInTestFiles => {
    for (const reporter of config.reporters) {
      reporter.onRunStart(testsInTestFiles);
    }
  });

  runner.on("testStart", testsInTestFile => {
    for (const reporter of config.reporters) {
      reporter.onTestStart(testsInTestFile);
    }
  });

  runner.on("testEnd", (testsInTestFile, result) => {
    for (const reporter of config.reporters) {
      reporter.onTestEnd(testsInTestFile, result);
    }
  });

  runner.on("runEnd", results => {
    for (const reporter of config.reporters) {
      reporter.onRunEnd(results);
    }
  });

  return runner;
}
