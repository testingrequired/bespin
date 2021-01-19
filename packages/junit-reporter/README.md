# bespin junit reporter

Write test results to a JUnit file.

## Usage

```typescript
const { Config } = require('@testingrequired/bespin-core');
const { JUnitReporter } = require('@testingrequired/bespin-junit-reporter');

module.exports = new Config().withReporter(new JUnitReporter('./junit.xml'));
```
