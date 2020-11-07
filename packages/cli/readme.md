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
  ModuleTestFileParser,
} = require("@testingrequired/bespin-core");

module.exports = Config.new().withParser(new ModuleTestFileParser());
```

```bash
$ bespin -c bespin.config.js
```
