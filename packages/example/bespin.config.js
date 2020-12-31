const {
  Config,
  GlobTestFileLocator,
  SpecTestFileParse,
  DefaultTestExecutor,
} = require("@testingrequired/bespin-core");

module.exports = new Config()
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withExecutor(new DefaultTestExecutor());
