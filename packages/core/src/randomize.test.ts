import { randomizeArray } from "./randomize";

describe("randomize", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("should have the same length randomized", () => {
    expect(randomizeArray(arr).length).toBe(arr.length);
  });
});
