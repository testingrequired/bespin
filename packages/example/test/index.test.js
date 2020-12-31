const assert = require("assert");
const { sum } = require("../src/index");

it("should sum", async () => {
  assert.strictEqual(sum(1, 1), 2);
});

it("should sum 2", async () => {
  assert.strictEqual(sum(1, 2), 3);
});

describe("with describe", () => {
  it("should sum 3", async () => {
    assert.strictEqual(sum(1, 3), 4);
  });

  it("should sum 4", async () => {
    assert.strictEqual(sum(1, 4), 5);
  });
});
