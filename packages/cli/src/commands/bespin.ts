import { GluegunToolbox } from "gluegun";
import { TestResultState, Runtime, Config } from "@testingrequired/bespin-core";
import { CLIReporter } from "../CLIReporter";

export const name = "bespin";

export const run = async (toolbox: GluegunToolbox) => {
  const { print, filesystem } = toolbox;

  const possibleConfigPaths = ["bespin.config.ts", "bespin.config.js"].filter(
    x => x
  );

  let configFilePath;

  for (const possiblePath of possibleConfigPaths) {
    if (filesystem.exists(possiblePath)) {
      configFilePath = possiblePath;
    }
  }

  if (toolbox.parameters.options?.c) {
    if (filesystem.exists(toolbox.parameters.options?.c)) {
      configFilePath = toolbox.parameters.options?.c;
    }

    print.error(
      `bespin could not find config file: ${toolbox.parameters.options?.c}`
    );

    return;
  }

  if (!configFilePath) {
    print.error(
      `bespin could not find config file: ${possibleConfigPaths.join(", ")}`
    );

    return;
  }

  const config = await Config.load(configFilePath);

  config.reporters.push(new CLIReporter(toolbox));

  if (toolbox.parameters.options?.testFileFilter) {
    config.settings.testFileFilter = toolbox.parameters.options?.testFileFilter;
  }

  if (toolbox.parameters.options?.testNameFilter) {
    config.settings.testNameFilter = toolbox.parameters.options?.testNameFilter;
  }

  const runtime = new Runtime(config);

  const results = await runtime.run();

  const passingRun = results
    .map(([_, result]) => result)
    .every(({ state }) => state === TestResultState.PASS);

  process.exit(passingRun ? 0 : 1);
};
