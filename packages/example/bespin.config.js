const {
  Config,
  TestFileLocator,
  TestFileParser,
} = require("@testingrequired/bespin-core");
const { promisify } = require("util");
const glob = require("glob");

const globPromise = promisify(glob);

class GlobTestFileLocator extends TestFileLocator {
  constructor(pattern = "**/*.test.js") {
    super();

    this.pattern = pattern;
  }

  locateTestFilePaths() {
    return globPromise(this.pattern);
  }
}

class EmptyTestFileParser extends TestFileParser {
  async parseTestFile(path) {
    return [];
  }
}

module.exports = Config.new()
  .withLocator(new GlobTestFileLocator())
  .withParser(new EmptyTestFileParser());
