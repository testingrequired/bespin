import {
  Reporter,
  TestInTestFile,
  TestResult,
  TestResultState,
} from '@testingrequired/bespin-core';

//@ts-ignore
import junit from 'junit-report-builder';

export class JUnitReporter extends Reporter {
  constructor(private filePath: string) {
    super();
  }

  onRunEnd(results: Array<[TestInTestFile, TestResult]>) {
    const suites: Record<string, any> = {};

    results.forEach(result => {
      const [testInTestFile, testResult] = result;
      const { testFilePath, testName } = testInTestFile;
      const { time, state, message } = testResult;

      let suite;

      if (suites[testFilePath]) {
        suite = suites[testFilePath];
      } else {
        suite = junit.testSuite().name(testFilePath);
        suites[testFilePath] = suite;
      }

      const testCase = suite.testCase().name(testName);
      testCase.time(time);

      if (state === TestResultState.FAIL) {
        testCase.failure(message);
        // testCase.stacktrace(result.error && result.error.stack);
      }
    });

    junit.writeTo(this.filePath);
  }
}
