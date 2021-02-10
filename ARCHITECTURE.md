# Architecture

This document describes the high level architecture of bespin.

## High Level

```
CLI
|-> Config ----`config`----> Runtime
    |-> Components           |-> Locate Test Files (TestFileLocator)
    |   - TestFileLocator    |-> Parse Out Tests (TestFileParser)
    |   - TestFileParser     |-> Run Tests (Runner)
    |   - Runner             |-> Report Results (Reporter/s)
    |   - Reporter/s
    |-> Settings
    |-> Globals
```

## CLI

The [CLI](packages/cli) is main consumer entry point for the framework. It's responsible for loading a `Config`, initializing the `Runtime` and reporting results to the terminal using [it's own reporter](packages/cli/src/CLIReporter.ts).

## Runtime

The [`Runtime`](packages/core/src/Runtime.ts) contains all the frameworks core logic and is used by consumer implementations (e.g. cli). The `run` method envokes the runtime and returns an array of `TestResult`.

```typescript
import { Config, Runtime } from "@testingrequired/bespin-core";

const config = await Config.load("bespin.config.js");
const runtime = new Runtime(config);
const results = await runtime.run();
```

## Configuration

The [`Config`](packages/core/src/Config.ts) is where the framework's behavior is defined. It's used by the `Runtime` to drive that behavior.

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

#### Settings

Settings affect core framework functionality.

```typescript
const { Config } = require("@testingrequired/bespin-core");

module.exports = new Config(__filename)
  .withSetting("randomizeTests", true)
  .withSettings({
    testFileFilter: "",
    testNameFilter: "",
  });
```

```typescript
interface Settings {
  randomizeTests?: boolean;
  testFileFilter?: string;
  testNameFilter?: string;
}
```

#### Globals

Globals registered are exposed to test functions at runtime.

```typescript
const { Config } = require("@testingrequired/bespin-core");
const someLib = require("someLib");

module.exports = new Config(__filename).withGlobal("someLib", someLib);
```

#### Load

A config file can be loaded from a path.

```typescript
import { Config } from "@testingrequired/bespin-core";

const config = await Config.load("bespin.config.js");
```

### ValidConfig

A `ValidConfig` is a `Config` with [`TestFileLocator`](packages/core/src/TestFileLocator.ts), [`TestFileParser`](packages/core/src/TestFileParser.ts) and [`Runner`](packages/core/src/Runner.ts) set.

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

There are four types of components that can be configured: `TestFileLocator`, `TestFileParser`, `Runner`, & [`Reporter`](packages/core/src/Reporter.ts).

### TestFileLocator

This component locates test files and returns an array of their paths.

#### Implementations

- [GlobTestFileLocator](packages/glob-test-file-locator)

### TestFileParser

This component parses a test file for tests. It works in two stages: `getTests` and `getTestFunction`.

#### getTests

The `getTests` method accepts a test file path and returns an array of [`TestInTestFile`](packages/core/src/TestInTestFile.ts) which has two properties: `testFilePath` and `testName`.

#### getTestFunction

The `getTestFunction` method accepts a `testFilePath` and `testName` to return a [`TestFunction`](packages/core/src/TestFunction.ts) or `() => Promise<void>;`.

This method also accepts a `Record<string, any>` of global variables exposed to test functions. These globals are configured on the `Config`.

#### Implementations

- [SpecTestFileParser](packages/spec-test-file-parser)

### Runner

This component accepts an array of `TestInTestFile`, runs them using the [`TestExecutor`](packages/core/src/TestExecutor.ts) and returns an array of corresponding [`TestResult`](packages/core/src/TestResult.ts).

#### TestExecutor

The `TestExecutor` is a core framework function that accepts a `TestFunction` and returns a `TestResult`.

#### TestResult

```typescript
interface TestResult {
  state: TestResultState;
  time: number;
  error?: Error;
  message?: string;
}

enum TestResultState {
  PASS = "PASS",
  FAIL = "FAIL",
  ERROR = "ERROR",
}
```

#### Events

##### runStart

##### testStart

##### testEnd

##### runEnd

#### Implementations

- [ParallelRunner](packages/parallel-runner)

### Reporter

One or more reporters can be registered to the config. They expose the following methods to implement reporting: `onRunStart`, `onTestStart`, `onTestEnd`, `onRunEnd`.

#### Run Start

#### Test Start

#### Test End

#### Run End

#### Implementations

- [JUnitReporter](packages/junit-reporter)
- [DebugReporter](packages/debug-reporter)
- [CLIReporter](packages/cli/src/CLIReporter.ts)

## Plugins

A [`Plugin`](packages/core/src/Plugin.ts) is (currently) simply a class that is passed a `Config` in to it's constructor. This allows the plugin to configure components, settings and globals.
