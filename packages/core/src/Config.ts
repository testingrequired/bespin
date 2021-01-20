import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';
import { Reporter } from './Reporter';
import { TestInTestFile } from './TestInTestFile';
import { Settings } from './Settings';
import { Runner } from './Runner';

export class Config {
  public locator?: TestFileLocator;
  public parser?: TestFileParser;
  public runner?: Runner;
  public reporters: Array<Reporter> = [];
  public settings: Settings = {
    workers: 1,
  };

  constructor(public readonly path: string) {}

  withSettings(settings: Settings): this {
    this.settings = settings;
    return this;
  }

  withLocator(locator: TestFileLocator): this {
    this.locator = locator;
    return this;
  }

  withParser(parser: TestFileParser): this {
    this.parser = parser;
    return this;
  }

  withRunner(runner: Runner): this {
    this.runner = runner;
    return this;
  }

  withReporter(reporter: Reporter): this {
    this.reporters?.push(reporter);
    return this;
  }

  withReporters(reporters: Array<Reporter>): this {
    this.reporters = reporters;
    return this;
  }

  static async load(configFilePath: string): Promise<Required<Config>> {
    const configFile: Config = await import(configFilePath);

    if (!Config.isValidConfig(configFile)) {
      throw new Error('Invalid config file');
    }

    return configFile;
  }

  static isValidConfig(configFile: Config): configFile is Required<Config> {
    if (
      !configFile.path ||
      !configFile.locator ||
      !configFile.parser ||
      !configFile.runner
    ) {
      return false;
    }

    return true;
  }

  static async getTestsInTestFiles(
    config: Required<Config>
  ): Promise<Array<TestInTestFile>> {
    const testFilePaths = await config.locator.locateTestFilePaths();

    const testsInTestFiles = (
      await Promise.all(testFilePaths.map(path => config.parser.getTests(path)))
    ).flat();

    return testsInTestFiles;
  }
}
