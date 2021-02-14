import { TestInTestFile } from "./TestInTestFile";

export abstract class TestFileParser {
  abstract getTests(testFilePath: string): Promise<Array<TestInTestFile>>;
}
