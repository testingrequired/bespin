import { Config } from './Config';
import { TestExecutor } from './TestExecutor';
import { TestFileParser } from './TestFileParser';
import { TestInTestFile } from './TestInTestFile';
import { TestResult } from './TestResult';

export class Runner {
  async run(configFile: Config): Promise<Array<[TestInTestFile, TestResult]>> {
    if (!configFile.locator || !configFile.parser || !configFile.executor) {
      throw new Error('');
    }

    const testFilePaths = await configFile.locator.locateTestFilePaths();
    const tests = await TestFileParser.getTests(
      testFilePaths,
      configFile.parser
    );
    const results = await TestExecutor.getResults(tests, configFile.executor);
    const zippedResults = await TestExecutor.getZippedResults(tests, results);

    return zippedResults;
  }
}
