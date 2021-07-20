# 🌌 bespin

Another test framework.

<a href="https://github.com/testingrequired/bespin/actions?query=workflow%3ACI">![CI](https://github.com/testingrequired/bespin/workflows/CI/badge.svg)</a>

## Goals

- Extendable
- Easy to understand
- Parallel test execution

## Architecture

- [ARCHITECTURE.md](./ARCHITECTURE.md)

## Usage

### Install

The first step is installing the core library and cli application

```bash
$ npm install -D @testingrequired/bespin-cli
```

### Config File

This provides the foundation for the framework but it still needs to know how to locate test files, parse them and run them.

```bash
$ npm install -D @testingrequired/bespin-glob-test-file-locator @testingrequired/bespin-spec-test-file-parser @testingrequired/bespin-serial-runner
```

These will provide finding test files using a glob pattern (e.g. `**/*.test.ts`), parse test files with a `describe`/`it`/`beforeEach` syntax and execute the tests in parallel.

Now create a configuration file called `bespin.config.ts` at your project root:

```typescript
import { Config } from "@testingrequired/bespin-core";
import { GlobTestFileLocator } from "@testingrequired/bespin-glob-test-file-locator";
import { SpecTestFileParser } from "@testingrequired/bespin-spec-test-file-parser";
import { AsyncRunner } from "@testingrequired/bespin-async-runner";
import { JUnitReporter } from "@testingrequired/bespin-junit-reporter";
import { GlobalTestValuePlugin } from "./src/GlobalTestValuePlugin";

export default new Config(__filename)
  .withLocator(new GlobTestFileLocator("**/*.test.ts"))
  .withParser(new SpecTestFileParser())
  .withRunner(new AsyncRunner())
  .withReporters([
    new JUnitReporter("./junit.xml"),
  ]);
```

### Write Tests

```javascript
import * as assert from 'assert';

describe("beforeEach", () => {
  let baseValue;

  beforeEach(() => {
    baseValue = 7;
  });

  it("should sum with base value", async () => {
    assert.strictEqual(baseValue, 8);
  });

  describe("nesting", () => {
    beforeEach(() => {
      baseValue++;
    });

    it("should sum with incremented base value", async () => {
      assert.strictEqual(baseValue, 9);
    });
  });
});
```

### Run

```bash
$ bespin
```

### Typescript

The examples shown are written in typescript which currently supported only when using `@testingrequired/bespin-cli` but will eventually be supported through code transforms at the runtime level.

## Packages

- [@testingrequired/bespin-core](./packages/core) Core library for framework primitives
- [@testingrequired/bespin-cli](./packages/cli) Command line application to run tests
- [example](./packages/example) An example integration project
- [@testingrequired/bespin-mock](./packages/mock) Mocking library

### Addons

- [@testingrequired/bespin-async-runner](./packages/async-runner) Run tests asynchronously using promises
- [@testingrequired/bespin-serial-runner](./packages/async-runner) Run tests in serial order
- [@testingrequired/bespin-parallel-runner](./packages/parallel-runner) Run tests asynchronously using worker threads
- [@testingrequired/bespin-glob-test-file-locator](./packages/glob-test-file-locator) Locate test files using a glob pattern
- [@testingrequired/bespin-spec-test-file-parser](./packages/spec-test-file-parser) Parse test files with describe/it syntax
- [@testingrequired/bespin-junit-reporter](./packages/junit-reporter) Write test results to a JUnit file
- [@testingrequired/bespin-html-reporter](./packages/html-reporter) Write test results to a HTML file
- [@testingrequired/bespin-debug-reporter](./packages/debug-reporter) Debug breakpoints and logging reporter events

## Development

- [DEVELOPMENT.md](./DEVELOPMENT.md)
