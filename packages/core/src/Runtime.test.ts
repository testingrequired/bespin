import { when } from 'jest-when';
import { Config, ValidConfig } from './Config';
import { Reporter } from './Reporter';
import { Runner } from './Runner';
import { Runtime } from './Runtime';
import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';
import { TestInTestFile } from './TestInTestFile';
import { TestResult, TestResultState } from './TestResult';

describe('Runtime', () => {
  const expectedPath = 'expectedPath';
  const expectedPaths = [expectedPath];
  const expectedTestName = 'expectedTestName';
  const expectedTestInTestFile: TestInTestFile = {
    testFilePath: expectedPath,
    testName: expectedTestName,
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
      getTestFunction: jest.fn(),
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
      .calledWith(expectedPath)
      .mockResolvedValue([expectedTestInTestFile]);

    when(runner.run as jest.Mock)
      .calledWith([expectedTestInTestFile])
      .mockResolvedValueOnce([expectedTestResult]);
  });

  it('should locate, parse, run and report test results', async () => {
    const results = await runtime.run();

    expect(results).toStrictEqual([expectedTestResult]);
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

    let reporter: Reporter;

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

      reporter = new TestReporter();
      config.withReporter(reporter);
      jest.spyOn(reporter, 'onRunStart');
      jest.spyOn(reporter, 'onTestStart');
      jest.spyOn(reporter, 'onTestEnd');
      jest.spyOn(reporter, 'onRunEnd');
    });

    it('should call onRunStart', async () => {
      await runtime.run();
      expect(reporter.onRunStart).toBeCalledWith(config, [
        expectedTestInTestFile,
      ]);
    });

    it('should call onTestStart', async () => {
      await runtime.run();
      expect(reporter.onTestStart).toBeCalledWith(expectedTestInTestFile);
    });

    it('should call onTestEnd', async () => {
      await runtime.run();
      expect(reporter.onTestEnd).toBeCalledWith(
        expectedTestInTestFile,
        expectedTestResult
      );
    });

    it('should call onRunEnd', async () => {
      await runtime.run();
      expect(reporter.onRunEnd).toBeCalledWith([
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
