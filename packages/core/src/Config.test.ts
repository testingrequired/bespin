import { Config } from './Config';
import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';

describe('Config', () => {
  const expectedConfigPath = 'expectedConfigPath';

  let locator: TestFileLocator;
  let parser: TestFileParser;

  beforeEach(() => {
    locator = {
      locateTestFilePaths: jest.fn(),
    };

    parser = {
      getTests: jest.fn(),
      getTestFunction: jest.fn(),
    };
  });

  describe('isValidConfig', () => {
    it('should return true if all are defined', () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath).withLocator(locator).withParser(parser)
        )
      ).toBe(true);
    });

    it('should return false if locator not defined', () => {
      expect(
        Config.isValidConfig(new Config(expectedConfigPath).withParser(parser))
      ).toBe(false);
    });

    it('should return false if parser not defined', () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath).withLocator(locator)
        )
      ).toBe(false);
    });
  });
});
