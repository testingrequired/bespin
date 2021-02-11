import { TestInTestFile } from './TestInTestFile';

export abstract class TestFileParser {
  abstract getTests(
    testFilePath: string,
    globals: Record<string, any>
  ): Promise<Array<TestInTestFile>>;
}
