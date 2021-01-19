//@ts-ignore
import {
  TestInTestFile,
  TestResult,
  TestResultState,
} from '@testingrequired/bespin-core';
// @ts-ignore
import junit from 'junit-report-builder';
import { JUnitReporter } from '../src/index';

jest.mock('junit-report-builder');

describe('junit', () => {
  const expectedFilePath = 'expected file path';
  const expectedTestName = 'expectedTestName';
  const expectedTestInTestFile: TestInTestFile = {
    testFilePath: expectedFilePath,
    testName: expectedTestName,
  };
  const expectedTestResult: TestResult = {
    state: TestResultState.PASS,
    time: 1,
  };
  const expectedResults: Array<[TestInTestFile, TestResult]> = [
    [expectedTestInTestFile, expectedTestResult],
  ];

  let junitReporter: JUnitReporter;

  let testSuite: any;
  let testCase: any;

  beforeEach(() => {
    testCase = {
      name: jest.fn(() => testCase),
      time: jest.fn(),
      failure: jest.fn(),
      stacktrace: jest.fn(),
      skipped: jest.fn(),
    };

    testSuite = {
      name: jest.fn(() => testSuite),
      testCase: () => testCase,
    };

    junit.testSuite.mockReturnValue(testSuite);

    junitReporter = new JUnitReporter(expectedFilePath);
  });

  afterEach(() => {
    junit.testSuite.mockReset();
  });

  describe('when state is passing', () => {
    beforeEach(() => {
      junitReporter.onRunEnd(expectedResults);
    });

    it('should set test suite name to test file path', () => {
      expect(testSuite.name).toBeCalledWith(expectedFilePath);
    });

    it('should set test case to test description', () => {
      expect(testCase.name).toBeCalledWith(expectedTestName);
    });

    it('should set test case time to test time', () => {
      expect(testCase.time).toBeCalledWith(expectedTestResult.time);
    });

    it('should write to file', () => {
      expect(junit.writeTo).toBeCalledWith(expectedFilePath);
    });
  });

  describe('when state is failed', () => {
    const expectedErrorMessage = 'expected error message';

    beforeEach(() => {
      expectedTestResult.state = TestResultState.FAIL;
      expectedTestResult.message = expectedErrorMessage;

      junitReporter.onRunEnd(expectedResults);
    });

    it('should set test case failure to test case error message', () => {
      expect(testCase.failure).toBeCalledWith(expectedErrorMessage);
    });
  });

  describe('when multiple results in same test suite', () => {
    beforeEach(() => {
      const testResult: TestResult = {
        state: TestResultState.PASS,
        time: 1,
      };

      expectedResults.push([expectedTestInTestFile, testResult]);

      junitReporter.onRunEnd(expectedResults);
    });

    it('should not create test suites', () => {
      expect(junit.testSuite).toBeCalledTimes(1);
    });
  });
});
