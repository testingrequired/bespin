import { Middleware } from './Middleware';
import { TestResult } from './TestResult';
import { TestFunction } from './TestFunction';

export abstract class TestExecutor extends Middleware {
  abstract executeTest(test: TestFunction): Promise<TestResult>;
}
