import { TestInTestFile } from '@testingrequired/bespin-core';
import { SpecTestFileParse } from '.';

const expectedTestPath = './testUtils/test.js';
const mockTestPath = './testUtils/test.js';

describe('SpecTestFileParse', () => {
  // let describeMockFn: () => void;
  let beforeEachMockFn: () => void;
  let afterEachMockFn: () => void;
  let testMockFn: () => void;

  const expectedGlobals: Record<string, any> = {};

  let parser: SpecTestFileParse;

  beforeEach(() => {
    // describeMockFn = jest.fn();
    beforeEachMockFn = jest.fn();
    afterEachMockFn = jest.fn();
    testMockFn = jest.fn();

    parser = new SpecTestFileParse();
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should parse a test at top level', async () => {
    const expectedTestName = 'expectedTestName';

    jest.mock(mockTestPath, () => {
      it(expectedTestName, testMockFn);
    });

    const tests = await parser.getTests(expectedTestPath, expectedGlobals);

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

  it('should parse a test in a describe', async () => {
    const expectedDescribe = 'expectedDescribe';
    const expectedTestName = 'expectedTestName';

    jest.mock(mockTestPath, () => {
      describe(expectedDescribe, () => {
        it(expectedTestName, testMockFn);
      });
    });

    const tests = await parser.getTests(expectedTestPath, expectedGlobals);

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

  it('should parse a test at the top level with beforeEach/afterEach', async () => {
    const expectedTestName = 'expectedTestName';

    jest.mock(mockTestPath, () => {
      beforeEach(beforeEachMockFn);
      afterEach(afterEachMockFn);
      it(expectedTestName, testMockFn);
    });

    const tests = await parser.getTests(expectedTestPath, expectedGlobals);

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

  it('should parse a test in a describe with beforeEach/afterEach', async () => {
    const expectedDescribe = 'expectedDescribe';
    const expectedTestName = 'expectedTestName';

    jest.mock(mockTestPath, () => {
      describe(expectedDescribe, () => {
        beforeEach(beforeEachMockFn);
        afterEach(afterEachMockFn);
        it(expectedTestName, testMockFn);
      });
    });

    const tests = await parser.getTests(expectedTestPath, expectedGlobals);

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

  it('should parse a test in a nested describe with beforeEach/afterEach', async () => {
    const expectedDescribeA = 'expectedDescribeA';
    const expectedDescribeB = 'expectedDescribeB';
    const expectedTestNameA = 'expectedTestNameA';
    const expectedTestNameB = 'expectedTestNameB';

    let beforeEachMockFnB = jest.fn();
    let afterEachMockFnB = jest.fn();

    jest.mock(mockTestPath, () => {
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

    const tests = await parser.getTests(expectedTestPath, expectedGlobals);

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

  it('should correctly set and increment value using beforeEach', async () => {
    let baseValue: number = 0;

    jest.mock(mockTestPath, () => {
      describe('', () => {
        beforeEach(() => {
          baseValue = 7;
        });

        it('', testMockFn);

        describe('', () => {
          beforeEach(() => {
            baseValue++;
          });

          it('', testMockFn);
        });
      });
    });

    const tests = await parser.getTests(expectedTestPath, expectedGlobals);

    await tests[0].testFn();

    expect(baseValue).toBe(7);

    await tests[1].testFn();

    expect(baseValue).toBe(8);
  });
});
