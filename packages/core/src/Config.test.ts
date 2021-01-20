import { Config } from './Config';
import { TestExecutor } from './TestExecutor';
import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';

describe('Config', () => {
  const expectedConfigPath = 'expectedConfigPath';

  let locator: TestFileLocator;
  let parser: TestFileParser;
  let executor: TestExecutor;

  beforeEach(() => {
    locator = {
      locateTestFilePaths: jest.fn(),
    };

    parser = {
      getTests: jest.fn(),
      getTestFunction: jest.fn(),
    };

    executor = {
      executeTest: jest.fn(),
    };
  });

  describe('isValidConfig', () => {
    it('should return true if all are defined', () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath)
            .withLocator(locator)
            .withParser(parser)
            .withExecutor(executor)
        )
      ).toBe(true);
    });

    it('should return false if locator not defined', () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath)
            .withParser(parser)
            .withExecutor(executor)
        )
      ).toBe(false);
    });

    it('should return false if parser not defined', () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath)
            .withLocator(locator)
            .withExecutor(executor)
        )
      ).toBe(false);
    });

    it('should return false if executor not defined', () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath).withParser(parser).withLocator(locator)
        )
      ).toBe(false);
    });
  });
});
