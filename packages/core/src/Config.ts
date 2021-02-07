import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';
import { Reporter } from './Reporter';
import { Runner } from './Runner';
import { Settings } from './Settings';
import { Plugin } from './Plugin';

export class Config {
  public locator?: TestFileLocator;
  public parser?: TestFileParser;
  public runner?: Runner;
  public reporters: Array<Reporter> = [];
  public settings: Settings = {
    randomizeTests: false,
  };
  public globals: Record<string, any> = {};
  public plugins: Array<Plugin> = [];

  constructor(public readonly path: string) {}

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

  withSetting<K extends keyof Settings>(key: K, value: Settings[K]): this {
    this.settings[key] = value;
    return this;
  }

  withSettings(settings: Settings): this {
    this.settings = Object.assign({}, this.settings, settings);
    return this;
  }

  withPlugin(pluginClass: new (config: this) => Plugin): this {
    this.plugins.push(new pluginClass(this));
    return this;
  }

  static async load(configFilePath: string): Promise<ValidConfig> {
    const configFile: Config = await import(configFilePath);

    if (!Config.isValidConfig(configFile)) {
      let missing = [];

      if (!configFile.path) {
        missing.push('path');
      }

      if (!configFile.locator) {
        missing.push('locator');
      }

      if (!configFile.parser) {
        missing.push('parser');
      }

      if (!configFile.runner) {
        missing.push('runner');
      }

      throw new Error(`Invalid config file. Missing: ${missing.join(', ')}`);
    }

    return configFile;
  }

  static isValidConfig(configFile: Config): configFile is ValidConfig {
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
}

export type ValidConfig = Required<Config>;
