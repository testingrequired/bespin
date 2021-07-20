/// <reference path="../global.d.ts" />


import * as assert from "assert";

describe("globals", () => {
  globalTestValue;
  it("globalTestValue", () => {
    assert.strictEqual(globalTestValue, "globalTestValueValue");
  });
});
