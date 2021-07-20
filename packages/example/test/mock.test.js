const assert = require("assert");
const { mockFunction } = require("@testingrequired/bespin-mock");

describe("Mock", () => {
  it("mocking works", () => {
    function fn(input) {
      return input.toString(10);
    }

    const mockFn = mockFunction(fn);

    mockFn.mock.whenCalledWithThenReturn([10], "100");

    assert.strictEqual(mockFn(10), "100");

    mockFn.mock.verify([10]);
    mockFn.mock.verifyAll();
  });
});
