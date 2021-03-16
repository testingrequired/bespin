const assert = require("assert");
const { Mock, mockObject } = require("@testingrequired/bespin-mock");

describe("Mock", () => {
  it("mocking works", () => {
    function fn(input) {
      return input.toString(10);
    }

    const mock = Mock.of(fn);

    mock.whenCalledWithThenReturn([10], "100");

    assert.strictEqual(mock.fn(10), "100");

    mock.verify([10]);
    mock.verifyAll();
  });
});
