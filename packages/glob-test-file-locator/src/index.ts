import { promisify } from "util";
import { TestFileLocator } from "@testingrequired/bespin-core";

const glob = require("glob");

export class GlobTestFileLocator extends TestFileLocator {
  private pattern: string;

  constructor(pattern = "**/*.test.js") {
    super();

    this.pattern = pattern;
  }

  locateTestFilePaths() {
    const globPromise = promisify(glob);
    return globPromise(this.pattern);
  }
}
