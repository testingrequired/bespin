import { DefaultTestExecutor } from './DefaultTestExecutor';
import { GlobTestFileLocator } from './GlobTestFileLocator';
import { TestFileLocator } from './TestFileLocator';
import { TestExecutor } from './TestExecutor';
import { TestFileParser } from './TestFileParser';

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
