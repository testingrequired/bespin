const {
  Config,
  GlobTestFileLocator,
  DefaultTestExecutor,
  DebugReporter,
} = require("@testingrequired/bespin-core");
const {
  SpecTestFileParse,
} = require("@testingrequired/bespin-spec-test-file-parser");
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
