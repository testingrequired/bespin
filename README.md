# 🌌 bespin

Another test framework.

![CI](https://github.com/testingrequired/bespin/workflows/CI/badge.svg)

## Goals

- Extendable
- Easy to understand
- Parallel test execution

## Packages

- [@testingrequired/bespin-cli](./packages/cli) Command line application to run tests
- [@testingrequired/bespin-core](./packages/core) Core library for framework primitives
- [example](./packages/example) An example integration project

### Addons

- [@testingrequired/bespin-parallel-runner](./packages/parallel-runner) Run tests in parallel using worker threads
- [@testingrequired/bespin-glob-test-file-locator](./packages/glob-test-file-locator) Locate test files using a glob pattern
- [@testingrequired/bespin-spec-test-file-parser](./packages/spec-test-file-parser) Parse test files with describe/it syntax
- [@testingrequired/bespin-junit-reporter](./packages/junit-reporter) Write test results to a JUnit file

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md)
