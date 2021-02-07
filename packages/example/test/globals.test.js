const assert = require("assert");

describe("globals", () => {
  it("globalTestValue", () => {
    assert.strictEqual(globalTestValue, "globalTestValueValue");
  });
});
