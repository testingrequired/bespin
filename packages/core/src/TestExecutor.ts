import { Middleware } from './Middleware';
import { TestResult } from './TestResult';
import { TestInTestFile } from './TestInTestFile';

export abstract class TestExecutor extends Middleware {
  abstract executeTest(test: TestInTestFile): Promise<TestResult>;
}
