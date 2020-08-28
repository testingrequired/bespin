import { GluegunCommand } from "gluegun";

const command: GluegunCommand = {
  name: "bespin",
  run: async toolbox => {
    const { print } = toolbox;

    print.info("bespin!");
  }
};

module.exports = command;
