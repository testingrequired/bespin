// Core

export class TestInTestFile {
  constructor(
    public readonly testFilePath: string,
    public readonly testName: string
  ) {}
}

export enum TestResultState {
  PASS = 'PASS',
  FAIL = 'FAIL',
  ERROR = 'ERROR',
}

export interface TestResult {
  state: TestResultState;
  message?: string;
}

export class Config {
  public locator?: TestFileLocator;
  public parser?: TestFileParser;

  static new() {
    return new Config();
  }

  withLocator(locator: TestFileLocator): this {
    this.locator = locator;
    return this;
  }

  withParser(parser: TestFileParser): this {
    this.parser = parser;
    return this;
  }
}

// CLI

export class Main {}

export class Worker {}

// Middleware

export class Middleware {
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export abstract class TestFileLocator extends Middleware {
  abstract locateTestFilePaths(): Promise<Array<string>>;
}

/**
 * Parse test names out of test file
 */
export abstract class TestFileParser extends Middleware {
  abstract parseTestFile(testFilePath: string): Promise<Array<TestInTestFile>>;
}

export abstract class TestExecutor extends Middleware {
  abstract executeTest(test: TestInTestFile): Promise<TestResult>;
}
