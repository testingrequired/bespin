const {
  Config,
  GlobTestFileLocator,
  SpecTestFileParse,
  DefaultTestExecutor,
  DebugReporter,
} = require("@testingrequired/bespin-core");
const { JUnitReporter } = require("@testingrequired/bespin-junit-reporter");

module.exports = new Config()
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withExecutor(new DefaultTestExecutor())
  .withReporter(new DebugReporter())
  .withReporter(new JUnitReporter("./junit.xml"))
  .withSettings({
    workers: 10,
  });
