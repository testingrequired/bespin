const {
  Config,
  ModuleTestFileParser,
} = require("@testingrequired/bespin-core");

module.exports = Config.new().withParser(new ModuleTestFileParser());
