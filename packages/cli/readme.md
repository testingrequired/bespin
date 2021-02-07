# bespin cli

The CLI for the bespin test framework.

## Entry Point

[src/commands/bespin.ts](./src/commands/bespin.ts)

## Usage

```bash
$ bespin
```

### Filtering Tests

```bash
$ bespin --testFileFilter="**/example/path/specific.test.js"
```

```bash
$ bespin --testNameFilter="test name substring"
```

## Configuration

```javascript
// bespin.config.js
const { Config } = require("@testingrequired/bespin-core");
const {
  GlobTestFileLocator,
} = require("@testingrequired/bespin-glob-test-file-locator");
const {
  SpecTestFileParse,
} = require("@testingrequired/bespin-spec-test-file-parser");
const { ParallelRunner } = require("@testingrequired/bespin-parallel-runner");
const { JUnitReporter } = require("@testingrequired/bespin-junit-reporter");

module.exports = new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new SpecTestFileParse())
  .withRunner(new ParallelRunner(__filename, 10))
  .withReporter(new JUnitReporter("./junit.xml"));
```

```bash
$ bespin -c bespin.config.js
```
