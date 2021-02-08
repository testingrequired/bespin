# Architecture

## Stages

The framework executes the following stages:

> Locate Test Files -> Parse Out Tests -> Run Tests -> Report Results

These stages are executed in core framework functions calling configurable components.

## Entry Point

The `Runtime` is the entry point to the framework.

```typescript
import { Config, Runtime } from "@testingrequired/bespin-core";

const config = await Config.load("bespin.config.js");
const runtime = new Runtime(config);
await runtime.run();
```

## Configuration

The `Config` is where the framework's behaviour is defined.

### Config File

A javascript file exporting a config. Used by the cli during execution.

```typescript
const { Config } = require("@testingrequired/bespin-core");

module.exports = new Config(__filename);
```

#### \_\_filename

The `Config` constructor requires `__filename` to be passed to have a reference to it's own location.

#### Components

Components for locating, parsing, running and reporting are set here.

```typescript
const { Config } = require("@testingrequired/bespin-core");

module.exports = new Config(__filename)
  .withLocator(new SomeLocator())
  .withParser(new SomeParser())
  .withRunner(new SomeRunner())
  .withReporter(new SomeReporter())
  .withReporter(new AnotherReporter());
```

#### Load

A config file can be loaded from a path.

```typescript
import { Config } from "@testingrequired/bespin-core";

const config = await Config.load("bespin.config.js");
```

### ValidConfig

A `ValidConfig` is a `Config` with `TestFileLocator`, `TestFileParser` and `Runner` set.

```typescript
import { Config } from "@testingrequired/bespin-core";

const config = new Config()
  .withLocator(new SomeLocator())
  .withParser(new SomeParser())
  .withRunner(new SomeRunner());

if (Config.isValid(config)) {
  // config is a ValidConfig in this if block
}
```

An error will be thrown if the loaded config is not valid.

## Components

There are four types of components that can be configured: `TestFileLocator`, `TestFileParser`, `Runner`, & `Reporter`.

### TestFileLocator

This component locates test files and returns an array of their paths.

Example:

```typescript
import { promisify } from "util";
import glob from "glob";
import { TestFileLocator } from "@testingrequired/bespin-core";

class GlobTestFileLocator extends TestFileLocator {
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
```

### TestFileParser

#### TestInTestFile

### Runner

#### TestResult

#### Events

### Reporter

#### Run Start

#### Test Start

#### Test End

#### Run End
