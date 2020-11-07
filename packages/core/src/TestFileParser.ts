import { Middleware } from './Middleware';
import { TestFunction } from './TestFunction';
import { TestInTestFile } from './TestInTestFile';

export abstract class TestFileParser extends Middleware {
  abstract getTests(testFilePath: string): Promise<Array<TestInTestFile>>;
  abstract getTestFunction(
    testFilePath: string,
    testName: string
  ): Promise<TestFunction>;
}
