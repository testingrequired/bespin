import { Config } from "@testingrequired/bespin-core";
import { GlobTestFileLocator } from "@testingrequired/bespin-glob-test-file-locator";
import { SpecTestFileParser } from "@testingrequired/bespin-spec-test-file-parser";
import { AsyncRunner } from "@testingrequired/bespin-async-runner";
import { JUnitReporter } from "@testingrequired/bespin-junit-reporter";
import { HtmlReporter } from "@testingrequired/bespin-html-report";

import { GlobalTestValuePlugin } from "./src/GlobalTestValuePlugin";

export default new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.ts"))
  .withParser(new SpecTestFileParser())
  .withRunner(new AsyncRunner())
  .withReporters([
    new JUnitReporter("./junit.xml"),
    new HtmlReporter("./report.html"),
  ])
  .withSetting("randomizeTests", true)
  .withPlugin(GlobalTestValuePlugin);
