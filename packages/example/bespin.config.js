const { Config } = require("@testingrequired/bespin-core");
const {
  GlobTestFileLocator,
} = require("@testingrequired/bespin-glob-test-file-locator");
const {
  SpecTestFileParser,
} = require("@testingrequired/bespin-spec-test-file-parser");
const { AsyncRunner } = require("@testingrequired/bespin-async-runner");
const { JUnitReporter } = require("@testingrequired/bespin-junit-reporter");
const { HtmlReporter } = require("@testingrequired/bespin-html-report");

const { GlobalTestValuePlugin } = require("./src/GlobalTestValuePlugin");

module.exports = new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParser())
  .withRunner(new AsyncRunner())
  .withReporters([
    new JUnitReporter("./junit.xml"),
    new HtmlReporter("./report.html"),
  ])
  .withSetting("randomizeTests", true)
  .withPlugin(GlobalTestValuePlugin);
