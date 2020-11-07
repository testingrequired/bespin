import { GluegunToolbox } from "gluegun";
import { TestResultState, Runner } from "@testingrequired/bespin-core";

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

  const runner = new Runner();

  const results = await runner.run(configFilePath);

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

  process.exit(passingRun ? 0 : 1);
};
