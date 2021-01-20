const {
  Config,
  DebugReporter,
  ParallelRunner,
} = require("@testingrequired/bespin-core");
const {
  GlobTestFileLocator,
} = require("@testingrequired/bespin-glob-test-file-locator");
const {
  SpecTestFileParse,
} = require("@testingrequired/bespin-spec-test-file-parser");

const { JUnitReporter } = require("@testingrequired/bespin-junit-reporter");

module.exports = new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withRunner(new ParallelRunner(__filename, 10))
  .withReporter(new DebugReporter())
  .withReporter(new JUnitReporter("./junit.xml"));
