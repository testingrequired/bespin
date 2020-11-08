const {
  Config,
  GlobTestFileLocator,
  ModuleTestFileParser,
  DefaultTestExecutor,
} = require("@testingrequired/bespin-core");

module.exports = new Config()
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new ModuleTestFileParser())
  .withExecutor(new DefaultTestExecutor());
