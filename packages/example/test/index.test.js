const assert = require("assert");
const { sum } = require("../src/index");

module.exports = {
  "sum should work": () => {
    assert.strictEqual(sum(1, 1), 2);
  },
};
