const {
  Config,
  TestFileLocator,
  TestFileParser,
  TestInTestFile,
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

class SimpleTestFileParser extends TestFileParser {
  async parseTestFile(path) {
    const testFile = require(path);
    console.log(testFile);

    return Object.keys(testFile).map((testName) => {
      console.log(testFile[testName]);
      return new TestInTestFile(path, testName, testFile[testName]);
    });
  }
}

module.exports = Config.new()
  .withLocator(new GlobTestFileLocator())
  .withParser(new SimpleTestFileParser());
