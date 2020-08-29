import { promisify } from 'util';
const glob = require('glob');

// Core

export class TestInTestFile {
  constructor(
    public readonly testFilePath: string,
    public readonly testName: string,
    public readonly testFunction: TestFunction
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
  public executor?: TestExecutor;

  static new() {
    return new Config()
      .withLocator(new GlobTestFileLocator())
      .withExecutor(new DefaultTestExecutor());
  }

  withLocator(locator: TestFileLocator): this {
    this.locator = locator;
    return this;
  }

  withParser(parser: TestFileParser): this {
    this.parser = parser;
    return this;
  }

  withExecutor(executor: TestExecutor): this {
    this.executor = executor;
    return this;
  }
}

export type TestFunction = () => Promise<void>;

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

export class DefaultTestExecutor extends TestExecutor {
  async executeTest(test: TestInTestFile): Promise<TestResult> {
    try {
      await test.testFunction.apply(null);

      return {
        state: TestResultState.PASS,
      };
    } catch (e) {
      return {
        state: TestResultState.FAIL,
        message: e.message,
      };
    }
  }
}

const globPromise = promisify(glob);

export class GlobTestFileLocator extends TestFileLocator {
  private pattern: string;

  constructor(pattern = '**/*.test.js') {
    super();

    this.pattern = pattern;
  }

  locateTestFilePaths() {
    return globPromise(this.pattern);
  }
}

export class ModuleTestFileParser extends TestFileParser {
  async parseTestFile(path: string) {
    const testFile = require(path);

    return Object.keys(testFile).map(testName => {
      console.log(testFile[testName]);
      return new TestInTestFile(path, testName, testFile[testName]);
    });
  }
}
