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

  const runner = new Runner();

  const results = await runner.run(config, configFilePath);

  const passingRun = results
    .map(([_, result]) => result)
    .every(({ state }) => state === TestResultState.PASS);

  process.exit(passingRun ? 0 : 1);
};
