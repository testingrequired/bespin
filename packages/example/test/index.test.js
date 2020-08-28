import assert from "assert";
import { sum } from "../src/index";

test("sum should work", () => {
  assert.strictEqual(sum(1 + 1), 2);
});
