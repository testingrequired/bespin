import { Middleware } from './Middleware';
import { TestInTestFile } from './TestInTestFile';

/**
 * Parse test names out of test file
 */

export abstract class TestFileParser extends Middleware {
  abstract parseTestFile(testFilePath: string): Promise<Array<TestInTestFile>>;

  static async getTests(
    testFilePaths: Array<string>,
    parser: TestFileParser
  ): Promise<Array<TestInTestFile>> {
    return (
      await Promise.all(testFilePaths.map(path => parser.parseTestFile(path)))
    ).flat();
  }
}
