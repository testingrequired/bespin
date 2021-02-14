import { Config } from "./Config";
import { Runner } from "./Runner";
import { TestFileLocator } from "./TestFileLocator";
import { TestFileParser } from "./TestFileParser";

describe("Config", () => {
  const expectedConfigPath = "expectedConfigPath";

  let locator: TestFileLocator;
  let parser: TestFileParser;
  let runner: Runner;

  beforeEach(() => {
    locator = {
      locateTestFilePaths: jest.fn(),
    };

    parser = {
      getTests: jest.fn(),
    };

    runner = {
      run: jest.fn(),
    };
  });

  describe("isValidConfig", () => {
    it("should return true if all are defined", () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath)
            .withLocator(locator)
            .withParser(parser)
            .withRunner(runner)
        )
      ).toBe(true);
    });

    it("should return false if locator not defined", () => {
      expect(
        Config.isValidConfig(new Config(expectedConfigPath).withParser(parser))
      ).toBe(false);
    });

    it("should return false if parser not defined", () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath).withLocator(locator)
        )
      ).toBe(false);
    });

    it("should return false if runner not defined", () => {
      expect(
        Config.isValidConfig(
          new Config(expectedConfigPath).withLocator(locator).withParser(parser)
        )
      ).toBe(false);
    });
  });
});
