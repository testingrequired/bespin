export enum TestResultState {
  PASS = 'PASS',
  FAIL = 'FAIL',
  ERROR = 'ERROR',
}

export interface TestResult {
  state: TestResultState;
  time: number;
  message?: string;
}
