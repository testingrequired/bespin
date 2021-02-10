import {
  Runner,
  TestInTestFile,
  TestResult,
  TestExecutor,
  Config,
} from '@testingrequired/bespin-core';

export class AsyncRunner extends Runner {
  constructor(private configFilePath: string) {
    super();
  }

  async run(
    testsInTestFiles: TestInTestFile[]
  ): Promise<Array<[TestInTestFile, TestResult]>> {
    const executor = new TestExecutor();

    this.emit('runStart', testsInTestFiles);

    const config = await Config.load(this.configFilePath);

    const results: Array<[TestInTestFile, TestResult]> = await Promise.all(
      testsInTestFiles.map(
        async (test): Promise<[TestInTestFile, TestResult]> => {
          this.emit('testStart', test);

          const fn = await config.parser.getTestFunction(
            test.testFilePath,
            test.testName,
            config.globals
          );

          const result = await executor.executeTest(fn);

          this.emit('testEnd', test, result);

          return [test, result];
        }
      )
    );

    this.emit('runEnd', results);

    return results;
  }
}
