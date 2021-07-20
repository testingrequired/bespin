const { Plugin } = require("@testingrequired/bespin-core");

class GlobalTestValuePlugin extends Plugin {
  constructor(config) {
    super(config);

    this.config.globals.globalTestValue = "globalTestValueValue";
  }
}

module.exports = { GlobalTestValuePlugin };
