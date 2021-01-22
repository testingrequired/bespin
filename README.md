# 🌌 bespin

Another test framework.

![CI](https://github.com/testingrequired/bespin/workflows/CI/badge.svg)

## Goals

- Extendable
- Easy to understand
- Parallel test execution

## Usage

### Install

The first step is installing the core library and cli application

```bash
$ npm install -D @testingrequired/bespin-core @testingrequired/bespin-cli
```

### Config File

This provides the foundation for the framework but it still needs to know how to locate test files, parse them and run them.

```bash
$ npm install -D @testingrequired/bespin-glob-test-file-locator @testingrequired/bespin-spec-test-file-parser @testingrequired/bespin-parallel-runner
```

These will provide finding test files using a glob pattern (e.g. `**/*.test.js`), parse test files with a `describe`/`it`/`beforeEach` syntax and execute the tests in parallel.

Now create a configuration file called `bespin.config.js` at your project root:

```javascript
const { Config } = require("@testingrequired/bespin-core");
const {
  GlobTestFileLocator,
} = require("@testingrequired/bespin-glob-test-file-locator");
const {
  SpecTestFileParse,
} = require("@testingrequired/bespin-spec-test-file-parser");
const { ParallelRunner } = require("@testingrequired/bespin-parallel-runner");

module.exports = new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withRunner(new ParallelRunner(__filename, 10));
```

## Packages

- [@testingrequired/bespin-core](./packages/core) Core library for framework primitives
- [@testingrequired/bespin-cli](./packages/cli) Command line application to run tests
- [example](./packages/example) An example integration project

### Addons

- [@testingrequired/bespin-parallel-runner](./packages/parallel-runner) Run tests in parallel using worker threads
- [@testingrequired/bespin-glob-test-file-locator](./packages/glob-test-file-locator) Locate test files using a glob pattern
- [@testingrequired/bespin-spec-test-file-parser](./packages/spec-test-file-parser) Parse test files with describe/it syntax
- [@testingrequired/bespin-junit-reporter](./packages/junit-reporter) Write test results to a JUnit file

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md)
