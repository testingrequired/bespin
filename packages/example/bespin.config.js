const { Config, DebugReporter } = require("@testingrequired/bespin-core");
const {
  GlobTestFileLocator,
} = require("@testingrequired/bespin-glob-test-file-locator");
const {
  SpecTestFileParse,
} = require("@testingrequired/bespin-spec-test-file-parser");
const { ParallelRunner } = require("@testingrequired/bespin-parallel-runner");
const { AsyncRunner } = require("@testingrequired/bespin-async-runner");
const { JUnitReporter } = require("@testingrequired/bespin-junit-reporter");
const { GlobalTestValuePlugin } = require("./src/GlobalTestValuePlugin");

const config = new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withRunner(new AsyncRunner(__filename))
  .withReporter(new DebugReporter())
  .withReporter(new JUnitReporter("./junit.xml"))
  .withSetting("randomizeTests", false)
  .withPlugin(GlobalTestValuePlugin);

module.exports = config;
