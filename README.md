# 🌌 bespin

Another test framework.

![CI](https://github.com/testingrequired/bespin/workflows/CI/badge.svg)

## Goals

- Extendable
- Easy to understand
- Parallel test execution

## Packages

- [cli](./packages/cli) Command line application to run tests
- [core](./packages/core) Core library for framework primitives
- [example](./packages/example) An example integration project

### Addons

- [glob-test-file-locator](./packages/glob-test-file-locator) Locate test files using a glob pattern
- [spec-test-file-parser](./packages/spec-test-file-parser) Parse test files with describe/it syntax
- [junit-reporter](./packages/junit-reporter) Write test results to a JUnit file

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md)
