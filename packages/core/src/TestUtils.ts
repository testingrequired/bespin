import { Runner } from './Runner';
import { TestInTestFile } from './TestInTestFile';
import { TestResult, TestResultState } from './TestResult';

export function createTestInTestFile(
  testFilePath: string,
  testName: string,
  testFn: () => Promise<void> = jest.fn()
): TestInTestFile {
  return new TestInTestFile(testFilePath, testName, testFn);
}

export function testRunner<T extends Runner>(
  runnerClass: new (...args: Array<any>) => T,
  ...args: Array<any>
) {
  describe(runnerClass.prototype.name, () => {
    let runner: T;

    let testsInTestFiles: Array<TestInTestFile>;

    beforeEach(() => {
      testsInTestFiles = [
        createTestInTestFile('tests/1', 'Test 1 A'),
        createTestInTestFile('tests/1', 'Test 1 B'),
        createTestInTestFile('tests/2', 'Test 2 A'),
        createTestInTestFile('tests/2', 'Test 2 B'),
        createTestInTestFile('tests/3', 'Test 3 A'),
      ];

      runner = new runnerClass(...args);
    });

    it('should not throw an error', () => {
      expect(() => runner.run(testsInTestFiles)).not.toThrowError();
    });

    it('should execute all test functions', async () => {
      await runner.run(testsInTestFiles);

      for (const testInTestFile of testsInTestFiles) {
        expect(testInTestFile.testFn).toHaveBeenCalledTimes(1);
      }
    });

    it('should emit runStart event', async () => {
      const event = jest.fn();

      runner.on('runStart', event);

      await runner.run(testsInTestFiles);

      expect(event).toHaveBeenCalledTimes(1);
      expect(event).toHaveBeenCalledWith(testsInTestFiles);
    });

    it('should emit testStart events', async () => {
      const event = jest.fn();

      runner.on('testStart', event);

      await runner.run(testsInTestFiles);

      expect(event).toHaveBeenCalledTimes(testsInTestFiles.length);

      for (const testInTestFile of testsInTestFiles) {
        expect(event).toHaveBeenCalledWith(testInTestFile);
      }
    });

    it('should emit runEnd emit', async () => {
      const event = jest.fn();

      runner.on('runEnd', event);

      await runner.run(testsInTestFiles);

      expect(event).toHaveBeenCalledTimes(1);
      expect(event).toHaveBeenCalledWith([
        [
          testsInTestFiles[0],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[1],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[2],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[3],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
        [
          testsInTestFiles[4],
          {
            state: TestResultState.PASS,
            time: expect.any(Number),
          } as TestResult,
        ],
      ]);
    });
  });
}
