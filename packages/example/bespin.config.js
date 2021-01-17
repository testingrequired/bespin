const {
  Config,
  GlobTestFileLocator,
  SpecTestFileParse,
  DefaultTestExecutor,
  DebugReporter,
} = require("@testingrequired/bespin-core");

module.exports = new Config()
  .withReporter(new DebugReporter())
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withExecutor(new DefaultTestExecutor())
  .withSettings({
    workers: 10,
  });
