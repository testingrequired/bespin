import { GluegunCommand } from "gluegun";
import { TestResultState } from "@testingrequired/bespin-core";

const command: GluegunCommand = {
  name: "bespin",
  run: async (toolbox) => {
    const { print } = toolbox;

    print.info("bespin!");

    print.info(TestResultState.PASS);
  },
};

module.exports = command;
