const { Plugin } = require("@testingrequired/bespin-core");

class EnvTestValuePlugin extends Plugin {
  constructor(config) {
    super(config);

    this.config.env.ENV_TEST_VALUE = "ENV_TEST_VALUE_VALUE";
  }
}

module.exports = { EnvTestValuePlugin };
