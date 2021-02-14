const assert = require("assert");

describe("globals", () => {
  globalTestValue;
  it("globalTestValue", () => {
    assert.strictEqual(globalTestValue, "globalTestValueValue");
  });
});
