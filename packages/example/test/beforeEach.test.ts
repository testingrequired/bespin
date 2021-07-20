import * as assert from "assert";
import { sum } from "../src/index";

describe("beforeEach", () => {
  let baseValue;

  beforeEach(() => {
    baseValue = 7;
  });

  it("should sum with base value", async () => {
    assert.strictEqual(sum(1, baseValue), 8);
  });

  describe("nesting", () => {
    beforeEach(() => {
      baseValue++;
    });

    it("should sum with incremented base value", async () => {
      assert.strictEqual(sum(1, baseValue), 9);
    });
  });
});
