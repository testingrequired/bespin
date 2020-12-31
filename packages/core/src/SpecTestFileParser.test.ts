import { SpecTestFileParse } from './SpecTestFileParser';
import { TestInTestFile } from './TestInTestFile';

const expectedTestPath = './testUtils/test.js';
const mockTestPath = './testUtils/test.js';

describe('SpecTestFileParse', () => {
  let beforeEachMockFn: () => void;
  let afterEachMockFn: () => void;
  let testMockFn: () => void;

  let parser: SpecTestFileParse;

  beforeEach(() => {
    beforeEachMockFn = jest.fn();
    afterEachMockFn = jest.fn();
    testMockFn = jest.fn();

    parser = new SpecTestFileParse();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('describe', () => {
    let describeMockFn: () => void;

    beforeEach(() => {
      describeMockFn = jest.fn();

      jest.mock(mockTestPath, () => {
        describe('describe', describeMockFn);
      });

      parser.getTests(expectedTestPath);
    });

    it('should call describe function', () => {
      expect(describeMockFn).toBeCalledTimes(1);
    });
  });

  describe('it', () => {
    let tests: Array<TestInTestFile>;

    describe('when defined at top level', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          it('test', testMockFn);
        });

        tests = await parser.getTests(expectedTestPath);
      });

      it('should define a test', () => {
        expect(tests).toHaveLength(1);
      });

      it('should set test description', () => {
        expect(tests[0].testName).toEqual('test');
      });

      it('should set test path', () => {
        expect(tests[0].testFilePath).toEqual(expectedTestPath);
      });
    });

    describe('when defined in a describe', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('describe', () => {
            it('test', testMockFn);
          });

          it('test 2', testMockFn);
        });

        tests = await parser.getTests(expectedTestPath);
      });

      it('should prepend the describe description to test description', () => {
        expect(tests[0].testName).toEqual('describe test');
        expect(tests[1].testName).toEqual('test 2');
      });
    });

    describe('when defined with a describe inside', () => {
      beforeEach(() => {
        jest.mock(mockTestPath, () => {
          describe('describe', () => {
            it('test', () => {
              describe('', () => {});
            });
          });
        });
      });

      it.skip('should throw reference error', async () => {
        expect(parser.getTests(expectedTestPath)).rejects.toThrow(
          ReferenceError
        );
      });
    });
  });

  describe('beforeEach', () => {
    describe('when defined at top level', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          beforeEach(beforeEachMockFn);

          it('', testMockFn);
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook once', () => {
        expect(beforeEachMockFn).toBeCalledTimes(1);
      });
    });

    describe('when defined at top level outside of a describe', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          beforeEach(beforeEachMockFn);

          describe('', () => {
            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook once', () => {
        expect(beforeEachMockFn).toBeCalledTimes(1);
      });
    });

    describe('when no tests defined', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            beforeEach(beforeEachMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook zero times', () => {
        expect(beforeEachMockFn).toBeCalledTimes(0);
      });
    });

    describe('when defined after test', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          it('', testMockFn);

          beforeEach(beforeEachMockFn);
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should not run before each hook for test', () => {
        expect(beforeEachMockFn).toBeCalledTimes(0);
      });
    });

    describe('when defined in a describe', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            beforeEach(beforeEachMockFn);

            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook once', () => {
        expect(beforeEachMockFn).toBeCalledTimes(1);
      });
    });

    describe('when defined multiple times as same level', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            beforeEach(beforeEachMockFn);
            beforeEach(beforeEachMockFn);

            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook twice', () => {
        expect(beforeEachMockFn).toBeCalledTimes(2);
      });
    });

    describe('when defined at multiple levels', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            beforeEach(beforeEachMockFn);

            describe('', () => {
              beforeEach(beforeEachMockFn);

              it('', testMockFn);
            });
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook twice', () => {
        expect(beforeEachMockFn).toBeCalledTimes(2);
      });
    });

    describe('when defined at multiple levels with multiple tests', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            beforeEach(beforeEachMockFn);

            it('', testMockFn);

            describe('', () => {
              beforeEach(beforeEachMockFn);

              it('', testMockFn);
            });
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook three times', () => {
        expect(beforeEachMockFn).toBeCalledTimes(3);
      });
    });

    describe('when defined after a describe', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            beforeEach(beforeEachMockFn);

            it('', testMockFn);

            describe('', () => {
              beforeEach(beforeEachMockFn);

              it('', testMockFn);
            });

            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook four times', () => {
        expect(beforeEachMockFn).toBeCalledTimes(4);
      });
    });
  });

  describe('afterEach', () => {
    describe('when defined at top level', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          afterEach(afterEachMockFn);

          it('', testMockFn);
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call after each hook once', () => {
        expect(afterEachMockFn).toBeCalledTimes(1);
      });
    });

    describe('when no tests defined', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          afterEach(afterEachMockFn);
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call after each hook zero times', () => {
        expect(afterEachMockFn).toBeCalledTimes(0);
      });
    });

    describe('when defined after test', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          it('', testMockFn);

          afterEach(afterEachMockFn);
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should not run after each hook for test', () => {
        expect(afterEachMockFn).toBeCalledTimes(0);
      });
    });

    describe('when defined in a describe', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            afterEach(afterEachMockFn);

            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call after each hook once', () => {
        expect(afterEachMockFn).toBeCalledTimes(1);
      });
    });

    describe('when defined multiple times as same level', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            afterEach(afterEachMockFn);
            afterEach(afterEachMockFn);

            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call after each hook twice', () => {
        expect(afterEachMockFn).toBeCalledTimes(2);
      });
    });

    describe('when defined at multiple levels', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            afterEach(afterEachMockFn);

            describe('', () => {
              afterEach(afterEachMockFn);

              it('', testMockFn);
            });
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call after each hook twice', () => {
        expect(afterEachMockFn).toBeCalledTimes(2);
      });
    });

    describe('when defined at multiple levels with multiple tests', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            afterEach(afterEachMockFn);

            it('', testMockFn);

            describe('', () => {
              afterEach(afterEachMockFn);

              it('', testMockFn);
            });
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook three times', () => {
        expect(afterEachMockFn).toBeCalledTimes(3);
      });
    });

    describe('when defined after a describe', () => {
      beforeEach(async () => {
        jest.mock(mockTestPath, () => {
          describe('', () => {
            afterEach(afterEachMockFn);

            it('', testMockFn);

            describe('', () => {
              afterEach(afterEachMockFn);

              it('', testMockFn);
            });

            it('', testMockFn);
          });
        });

        const tests = await parser.getTests(expectedTestPath);

        for (const test of tests) {
          const fn = await parser.getTestFunction(
            test.testFilePath,
            test.testName
          );

          fn();
        }
      });

      it('should call before each hook four times', () => {
        expect(afterEachMockFn).toBeCalledTimes(4);
      });
    });
  });
});
