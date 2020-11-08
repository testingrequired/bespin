# bespin cli

The CLI for the bespin test framework.

## Entry Point

[src/commands/bespin.ts](./src/commands/bespin.ts)

## Usage

```bash
$ bespin
```

## Configuration

```javascript
// bespin.config.js
const {
  Config,
  GlobTestFileLocator,
  ModuleTestFileParser,
  DefaultTestExecutor,
} = require("@testingrequired/bespin-core");

module.exports = new Config()
  .withLocator(new GlobTestFileLocator("**/*.test.js"))
  .withParser(new ModuleTestFileParser())
  .withExecutor(new DefaultTestExecutor());
```

```bash
$ bespin -c bespin.config.js
```
