#!/usr/bin/env node

const { run_cli } = require("../dist/index");

(async () => {
  await run_cli();
})();
