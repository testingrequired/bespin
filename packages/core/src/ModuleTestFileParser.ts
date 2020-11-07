import { TestInTestFile } from './TestInTestFile';
import { TestFileParser } from './TestFileParser';
import { TestFunction } from './TestFunction';

export class ModuleTestFileParser extends TestFileParser {
  async getTests(path: string): Promise<Array<TestInTestFile>> {
    const testFile = require(path);

    return Object.keys(testFile).map(testName => {
      return new TestInTestFile(path, testName);
    });
  }

  async getTestFunction(path: string, name: string): Promise<TestFunction> {
    const testFile = require(path);

    if (!testFile.hasOwnProperty(name)) {
      throw new Error(`No test could be loaded for ${name} from ${path}`);
    }

    return testFile[name];
  }
}
