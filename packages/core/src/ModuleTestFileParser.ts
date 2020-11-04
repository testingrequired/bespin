import { TestInTestFile } from './TestInTestFile';
import { TestFileParser } from './TestFileParser';

export class ModuleTestFileParser extends TestFileParser {
  async parseTestFile(path: string) {
    const testFile = require(path);

    return Object.keys(testFile).map(testName => {
      console.log(testFile[testName]);
      return new TestInTestFile(path, testName, testFile[testName]);
    });
  }
}
