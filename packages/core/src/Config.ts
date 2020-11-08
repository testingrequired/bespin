import { TestFileLocator } from './TestFileLocator';
import { TestExecutor } from './TestExecutor';
import { TestFileParser } from './TestFileParser';

export class Config {
  public locator?: TestFileLocator;
  public parser?: TestFileParser;
  public executor?: TestExecutor;

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

  static async load(configFilePath: string): Promise<Required<Config>> {
    const configFile: Config = await import(configFilePath);

    if (!Config.isValidConfig(configFile)) {
      throw new Error('Invalid config file');
    }

    return configFile;
  }

  static isValidConfig(configFile: Config): configFile is Required<Config> {
    if (!configFile.locator || !configFile.parser || !configFile.executor) {
      return false;
    }

    return true;
  }
}
