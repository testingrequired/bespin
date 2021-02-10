const assert = require("assert");

describe("env", () => {
  it("ENV_TEST_VALUE", () => {
    assert.strictEqual(process.env.ENV_TEST_VALUE, "ENV_TEST_VALUE_VALUE");
  });
});
