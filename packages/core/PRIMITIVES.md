# Primitives

## Config

The `Config` is central for configuring how the framework behaves: locating & parsing test files, executing tests and reporting results.

## TestFileLocator

The `TestFileLocator` returns a list of test file paths to parse for tests.

## TestFileParser

The `TestFileParser` loads test files and parses out test names and functions.

## TestFunction

All tests parsed from test files end up as a `TestFunction` the underlying type: `() => Promise<void>`.

## TestExecutor

The `TestExecutor` runs an input `TestFunction` and return a `TestResult`.

## TestResult

```typescript
export enum TestResultState {
  PASS = 'PASS',
  FAIL = 'FAIL',
  ERROR = 'ERROR',
}

export interface TestResult {
  state: TestResultState;
  time: number;
  message?: string;
}
```

## Runner

The `Runner` uses the `Config` to run the tests and report the results.
