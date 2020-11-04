import { Middleware } from './Middleware';
import { TestInTestFile } from './TestInTestFile';

/**
 * Parse test names out of test file
 */

export abstract class TestFileParser extends Middleware {
  abstract parseTestFile(testFilePath: string): Promise<Array<TestInTestFile>>;
}
