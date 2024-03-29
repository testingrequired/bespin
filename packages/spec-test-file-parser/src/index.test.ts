import { TestInTestFile } from "@testingrequired/bespin-core";
import { SpecTestFileParser } from ".";

const expectedTestPath = "./testUtils/test.js";

describe("SpecTestFileParser", () => {
  let describeMockFn: () => void;
  let beforeEachMockFn: () => void;
  let afterEachMockFn: () => void;
  let testMockFn: () => void;

  let parser: SpecTestFileParser;

  beforeEach(() => {
    describeMockFn = jest.fn();
    beforeEachMockFn = jest.fn();
    afterEachMockFn = jest.fn();
    testMockFn = jest.fn();

    parser = new SpecTestFileParser();
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("should parse a test at top level", async () => {
    const expectedTestName = "expectedTestName";

    jest.mock(expectedTestPath, () => {
      it(expectedTestName, testMockFn);
    });

    const tests = await parser.getTests(expectedTestPath);

    expect(tests).toStrictEqual([
      new TestInTestFile(
        expectedTestPath,
        expectedTestName,
        expect.any(Function)
      ),
    ]);

    await tests[0].testFn();

    expect(testMockFn).toBeCalledTimes(1);
  });

  it("should parse a test in a describe", async () => {
    const expectedDescribe = "expectedDescribe";
    const expectedTestName = "expectedTestName";

    jest.mock(expectedTestPath, () => {
      describe(expectedDescribe, () => {
        it(expectedTestName, testMockFn);
      });
    });

    const tests = await parser.getTests(expectedTestPath);

    expect(tests).toStrictEqual([
      new TestInTestFile(
        expectedTestPath,
        `${expectedDescribe} ${expectedTestName}`,
        expect.any(Function)
      ),
    ]);

    await tests[0].testFn();

    expect(testMockFn).toBeCalledTimes(1);
  });

  it("should parse a test at the top level with beforeEach/afterEach", async () => {
    const expectedTestName = "expectedTestName";

    jest.mock(expectedTestPath, () => {
      beforeEach(beforeEachMockFn);
      afterEach(afterEachMockFn);
      it(expectedTestName, testMockFn);
    });

    const tests = await parser.getTests(expectedTestPath);

    expect(tests).toStrictEqual([
      new TestInTestFile(
        expectedTestPath,
        expectedTestName,
        expect.any(Function)
      ),
    ]);

    await tests[0].testFn();

    expect(testMockFn).toBeCalledTimes(1);
    expect(beforeEachMockFn).toBeCalledTimes(1);
    expect(afterEachMockFn).toBeCalledTimes(1);
  });

  it("should parse a test in a describe with beforeEach/afterEach", async () => {
    const expectedDescribe = "expectedDescribe";
    const expectedTestName = "expectedTestName";

    jest.mock(expectedTestPath, () => {
      describe(expectedDescribe, () => {
        beforeEach(beforeEachMockFn);
        afterEach(afterEachMockFn);
        it(expectedTestName, testMockFn);
      });
    });

    const tests = await parser.getTests(expectedTestPath);

    expect(tests).toStrictEqual([
      new TestInTestFile(
        expectedTestPath,
        `${expectedDescribe} ${expectedTestName}`,
        expect.any(Function)
      ),
    ]);

    await tests[0].testFn();

    expect(testMockFn).toBeCalledTimes(1);
    expect(beforeEachMockFn).toBeCalledTimes(1);
    expect(afterEachMockFn).toBeCalledTimes(1);
  });

  it("should parse a test in a nested describe with beforeEach/afterEach", async () => {
    const expectedDescribeA = "expectedDescribeA";
    const expectedDescribeB = "expectedDescribeB";
    const expectedTestNameA = "expectedTestNameA";
    const expectedTestNameB = "expectedTestNameB";

    let beforeEachMockFnB = jest.fn();
    let afterEachMockFnB = jest.fn();

    jest.mock(expectedTestPath, () => {
      describe(expectedDescribeA, () => {
        beforeEach(beforeEachMockFn);
        afterEach(afterEachMockFn);
        it(expectedTestNameA, testMockFn);

        describe(expectedDescribeB, () => {
          beforeEach(beforeEachMockFnB);
          afterEach(afterEachMockFnB);
          it(expectedTestNameB, testMockFn);
        });
      });
    });

    const tests = await parser.getTests(expectedTestPath);

    expect(tests).toStrictEqual([
      new TestInTestFile(
        expectedTestPath,
        `${expectedDescribeA} ${expectedTestNameA}`,
        expect.any(Function)
      ),
      new TestInTestFile(
        expectedTestPath,
        `${expectedDescribeA} ${expectedDescribeB} ${expectedTestNameB}`,
        expect.any(Function)
      ),
    ]);

    await tests[0].testFn();
    await tests[1].testFn();

    expect(testMockFn).toBeCalledTimes(2);
    expect(beforeEachMockFn).toBeCalledTimes(2);
    expect(afterEachMockFn).toBeCalledTimes(2);
    expect(beforeEachMockFnB).toBeCalledTimes(1);
    expect(afterEachMockFnB).toBeCalledTimes(1);
  });

  it("should not run beforeEach or afterEach if defined after a test", async () => {
    const expectedDescribe = "expectedDescribe";
    const expectedTestName = "expectedTestName";

    jest.mock(expectedTestPath, () => {
      describe(expectedDescribe, () => {
        it(expectedTestName, testMockFn);
        beforeEach(beforeEachMockFn);
        afterEach(afterEachMockFn);
      });
    });

    const tests = await parser.getTests(expectedTestPath);

    await tests[0].testFn();

    expect(beforeEachMockFn).toBeCalledTimes(0);
    expect(afterEachMockFn).toBeCalledTimes(0);
  });

  it("should parse a test in a describe with multiple beforeEach/afterEach", async () => {
    const expectedDescribe = "expectedDescribe";
    const expectedTestName = "expectedTestName";

    const beforeEachMockFnB = jest.fn();
    const afterEachMockFnB = jest.fn();

    jest.mock(expectedTestPath, () => {
      describe(expectedDescribe, () => {
        beforeEach(beforeEachMockFn);
        beforeEach(beforeEachMockFnB);
        afterEach(afterEachMockFn);
        afterEach(afterEachMockFnB);
        it(expectedTestName, testMockFn);
      });
    });

    const tests = await parser.getTests(expectedTestPath);

    await tests[0].testFn();

    expect(beforeEachMockFn).toBeCalledTimes(1);
    expect(beforeEachMockFnB).toBeCalledTimes(1);
    expect(afterEachMockFn).toBeCalledTimes(1);
    expect(afterEachMockFnB).toBeCalledTimes(1);
  });

  it("should correctly set and increment value using beforeEach", async () => {
    let baseValue: number = 0;

    jest.mock(expectedTestPath, () => {
      describe("", () => {
        beforeEach(() => {
          baseValue = 7;
        });

        it("", testMockFn);

        describe("", () => {
          beforeEach(() => {
            baseValue++;
          });

          it("", testMockFn);
        });
      });
    });

    const tests = await parser.getTests(expectedTestPath);

    await tests[0].testFn();

    expect(baseValue).toBe(7);

    await tests[1].testFn();

    expect(baseValue).toBe(8);
  });

  it("should parse nested describes describe without tests", async () => {
    const expectedDescribe = "expectedDescribe";

    const describeMockFnB = jest.fn();

    jest.mock(expectedTestPath, () => {
      describe(
        expectedDescribe,
        (describeMockFn as jest.Mock).mockImplementation(() => {
          describe(expectedDescribe, describeMockFnB);
        })
      );
    });

    await parser.getTests(expectedTestPath);

    expect(describeMockFn).toBeCalledTimes(1);
    expect(describeMockFnB).toBeCalledTimes(1);
  });

  describe("Errors", () => {
    it.skip("should throw when describe defined inside a test", async () => {
      jest.mock(expectedTestPath, () => {
        describe("describe", () => {
          it("test", () => {
            describe("", () => {});
          });
        });
      });

      expect(parser.getTests(expectedTestPath)).rejects.toThrow(ReferenceError);
    });
  });
});
