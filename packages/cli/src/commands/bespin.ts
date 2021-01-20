import { GluegunToolbox } from "gluegun";
import { TestResultState, Runtime } from "@testingrequired/bespin-core";
import { CLIReporter } from "../CLIReporter";

export const name = "bespin";

export const run = async (toolbox: GluegunToolbox) => {
  const { print, filesystem } = toolbox;

  const configFilePath = toolbox.parameters.options?.c || "bespin.config.js";

  if (!filesystem.exists(configFilePath)) {
    print.error(`bespin could not find config file: ${configFilePath}`);

    return;
  }

  const runtime = new Runtime([new CLIReporter(toolbox)]);

  const results = await runtime.run(configFilePath);

  const passingRun = results
    .map(([_, result]) => result)
    .every(({ state }) => state === TestResultState.PASS);

  process.exit(passingRun ? 0 : 1);
};
