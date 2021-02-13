import { when } from 'jest-when';
import { Config, ValidConfig } from './Config';
import { Reporter } from './Reporter';
import { Runner } from './Runner';
import { Runtime } from './Runtime';
import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';
import { TestInTestFile } from './TestInTestFile';
import { TestResult, TestResultState } from './TestResult';
import { randomizeArray } from './randomize';

jest.mock('./randomize');

type TestTestInTestFile = {
  -readonly [K in keyof TestInTestFile]: TestInTestFile[K];
};

describe('Runtime', () => {
  const expectedPath = 'expectedPath';
  const expectedPaths = [expectedPath];
  const expectedTestName = 'expectedTestName';
  const expectedTestInTestFile: TestTestInTestFile = {
    testFilePath: expectedPath,
    testName: expectedTestName,
    testFn: jest.fn(),
  };
  const expectedTestResult: TestResult = {
    state: TestResultState.PASS,
    time: 1,
  };

  let config: Config;
  let runtime: Runtime;
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
      off: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      setMaxListeners: jest.fn(),
      getMaxListeners: jest.fn(),
      listeners: jest.fn(),
      rawListeners: jest.fn(),
      listenerCount: jest.fn(),
      prependListener: jest.fn(),
      prependOnceListener: jest.fn(),
      eventNames: jest.fn(),
    };

    config = new Config('')
      .withLocator(locator)
      .withParser(parser)
      .withRunner(runner);

    runtime = new Runtime(config as ValidConfig);

    when(locator.locateTestFilePaths as jest.Mock)
      .calledWith()
      .mockResolvedValueOnce(expectedPaths);

    when(parser.getTests as jest.Mock)
      .calledWith(expectedPath, config.globals)
      .mockResolvedValue([expectedTestInTestFile]);

    when(runner.run as jest.Mock)
      .calledWith([expectedTestInTestFile])
      .mockResolvedValueOnce([expectedTestResult]);
  });

  it(`should error if any test files have no tests`, () => {
    when(parser.getTests as jest.Mock)
      .calledWith(expectedPath, config.globals)
      .mockResolvedValue([]);

    expect(() => runtime.run()).toThrowError(
      `Test files without tests: ${expectedPath}`
    );
  });

  it('should locate, parse, run and report test results', async () => {
    const results = await runtime.run();

    expect(results).toStrictEqual([expectedTestResult]);
  });

  it('should not randomize tests if setting is false', async () => {
    config.settings.randomizeTests = false;
    await runtime.run();
    expect(randomizeArray).not.toHaveBeenCalled();
  });

  it('should randomize tests if setting is true', async () => {
    config.settings.randomizeTests = true;
    await runtime.run();
    expect(randomizeArray).toHaveBeenCalledWith([expectedTestInTestFile]);
  });

  describe('settings.testFileFilter', () => {
    const expectedTestInTestFileB: TestInTestFile = {
      testFilePath: 'other/test/path.test.js',
      testName: 'Other test',
      testFn: jest.fn(),
    };

    beforeEach(() => {
      config.settings.testFileFilter = 'example/**/*.test.js';

      expectedTestInTestFile.testFilePath = 'example/test/path.test.js';

      when(locator.locateTestFilePaths as jest.Mock)
        .calledWith()
        .mockResolvedValueOnce([
          ...expectedPaths,
          expectedTestInTestFileB.testFilePath,
        ]);

      when(parser.getTests as jest.Mock)
        .calledWith(expectedPath)
        .mockResolvedValueOnce([expectedTestInTestFile])
        .calledWith(expectedTestInTestFileB.testFilePath)
        .mockResolvedValueOnce([expectedTestInTestFileB]);
    });

    it('should filter test paths', async () => {
      await runtime.run();

      expect(runner.run).toBeCalledWith([expectedTestInTestFile]);
    });
  });

  describe('settings.testNameFilter', () => {
    const expectedTestInTestFileB: TestInTestFile = {
      testFilePath: 'other/test/path.test.js',
      testName: 'Other test',
      testFn: jest.fn(),
    };

    beforeEach(() => {
      config.settings.testNameFilter = 'Example';

      expectedTestInTestFile.testName = 'Example';

      when(locator.locateTestFilePaths as jest.Mock)
        .calledWith()
        .mockResolvedValueOnce([
          ...expectedPaths,
          expectedTestInTestFileB.testFilePath,
        ]);

      when(parser.getTests as jest.Mock)
        .calledWith(expectedPath)
        .mockResolvedValueOnce([expectedTestInTestFile])
        .calledWith(expectedTestInTestFileB.testFilePath)
        .mockResolvedValueOnce([expectedTestInTestFileB]);
    });

    it('should filter test paths', async () => {
      await runtime.run();

      expect(runner.run).toBeCalledWith([expectedTestInTestFile]);
    });
  });

  describe('Runner Events', () => {
    beforeEach(() => {
      runner = new TestTestRunner();
      config.withRunner(runner);

      jest.spyOn(runner, 'run');

      (runner.run as jest.Mock).mockImplementation(() => {
        runner.emit('runStart', [expectedTestInTestFile]);
        runner.emit('testStart', expectedTestInTestFile);
        runner.emit('testEnd', expectedTestInTestFile, expectedTestResult);
        runner.emit('runEnd', [[expectedTestInTestFile, expectedTestResult]]);
      });
    });

    it('reemits runner runStart event', async () => {
      const runStartListener = jest.fn();

      runtime.events.on('runStart', runStartListener);

      await runtime.run();

      expect(runStartListener).toBeCalledWith([expectedTestInTestFile]);
    });

    it('reemits runner startStart events', async () => {
      const testStartListener = jest.fn();

      runtime.events.on('testStart', testStartListener);

      await runtime.run();

      expect(testStartListener).toBeCalledWith(expectedTestInTestFile);
    });

    it('reemits runner testEnd events', async () => {
      const testEndListener = jest.fn();

      runtime.events.on('testEnd', testEndListener);

      await runtime.run();

      expect(testEndListener).toBeCalledWith(
        expectedTestInTestFile,
        expectedTestResult
      );
    });

    it('reemits runner events', async () => {
      const runEndListener = jest.fn();

      runtime.events.on('runEnd', runEndListener);

      await runtime.run();

      expect(runEndListener).toBeCalledWith([
        [expectedTestInTestFile, expectedTestResult],
      ]);
    });
  });

  describe('Reporters', () => {
    class TestReporter extends Reporter {}

    let reporterA: Reporter;
    let reporterB: Reporter;

    beforeEach(() => {
      runner = new TestTestRunner();
      config.withRunner(runner);
      jest.spyOn(runner, 'run');
      (runner.run as jest.Mock).mockImplementation(() => {
        runner.emit('runStart', [expectedTestInTestFile]);
        runner.emit('testStart', expectedTestInTestFile);
        runner.emit('testEnd', expectedTestInTestFile, expectedTestResult);
        runner.emit('runEnd', [[expectedTestInTestFile, expectedTestResult]]);
      });

      reporterA = new TestReporter();
      config.withReporter(reporterA);
      jest.spyOn(reporterA, 'onRunStart');
      jest.spyOn(reporterA, 'onTestStart');
      jest.spyOn(reporterA, 'onTestEnd');
      jest.spyOn(reporterA, 'onRunEnd');

      reporterB = new TestReporter();
      config.withReporter(reporterB);
      jest.spyOn(reporterB, 'onRunStart');
      jest.spyOn(reporterB, 'onTestStart');
      jest.spyOn(reporterB, 'onTestEnd');
      jest.spyOn(reporterB, 'onRunEnd');

      runtime = new Runtime(config as ValidConfig);
    });

    it('should call onRunStart', async () => {
      await runtime.run();
      expect(reporterA.onRunStart).toBeCalledWith(config, [
        expectedTestInTestFile,
      ]);

      expect(reporterB.onRunStart).toBeCalledWith(config, [
        expectedTestInTestFile,
      ]);
    });

    it('should call onTestStart', async () => {
      await runtime.run();
      expect(reporterA.onTestStart).toBeCalledWith(expectedTestInTestFile);
      expect(reporterB.onTestStart).toBeCalledWith(expectedTestInTestFile);
    });

    it('should call onTestEnd', async () => {
      await runtime.run();
      expect(reporterA.onTestEnd).toBeCalledWith(
        expectedTestInTestFile,
        expectedTestResult
      );
    });

    it('should call onRunEnd', async () => {
      await runtime.run();
      expect(reporterA.onRunEnd).toBeCalledWith([
        [expectedTestInTestFile, expectedTestResult],
      ]);
      expect(reporterB.onRunEnd).toBeCalledWith([
        [expectedTestInTestFile, expectedTestResult],
      ]);
    });
  });
});

class TestTestRunner extends Runner {
  run(_: TestInTestFile[]): Promise<[TestInTestFile, TestResult][]> {
    throw new Error('Method not implemented.');
  }
}
