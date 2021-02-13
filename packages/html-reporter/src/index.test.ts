//@ts-ignore
import {
  TestInTestFile,
  TestResult,
  TestResultState,
} from '@testingrequired/bespin-core';
// @ts-ignore
import pug from 'pug';
import { HtmlReporter } from '../src/index';

jest.mock('pug');
jest.mock('fs');

describe('HtmlReporter', () => {
  const expectedFilePath = 'expected file path';
  const expectedTestName = 'expectedTestName';
  const expectedTestInTestFile: TestInTestFile = {
    testFilePath: expectedFilePath,
    testName: expectedTestName,
    testFn: jest.fn(),
  };
  const expectedTestResult: TestResult = {
    state: TestResultState.PASS,
    time: 1,
  };
  const expectedResults: Array<[TestInTestFile, TestResult]> = [
    [expectedTestInTestFile, expectedTestResult],
  ];

  let reporter: HtmlReporter;

  beforeEach(() => {
    reporter = new HtmlReporter(expectedFilePath);
  });

  it('should pass results to pug render', () => {
    reporter.onRunEnd(expectedResults);

    expect(
      pug.compileFile('template.pug', {
        results: expectedResults,
      } as any)
    );
  });
});
