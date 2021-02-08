import { Config, Runtime, TestResultState } from "@testingrequired/bespin-core";
import { CLIReporter } from "./CLIReporter.js";

export const run_cli = async () => {
  const config = await Config.load("bespin.config.js");

  config.reporters.push(new CLIReporter());

  // if (toolbox.parameters.options?.testFileFilter) {
  //   config.settings.testFileFilter = toolbox.parameters.options?.testFileFilter;
  // }

  // if (toolbox.parameters.options?.testNameFilter) {
  //   config.settings.testNameFilter = toolbox.parameters.options?.testNameFilter;
  // }

  const runtime = new Runtime(config);

  const results = await runtime.run();

  const passingRun = results
    .map(([_, result]) => result)
    .every(({ state }) => state === TestResultState.PASS);

  process.exit(passingRun ? 0 : 1);
};
