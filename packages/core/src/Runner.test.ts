import { Config } from './Config';
import { TestFileLocator } from './TestFileLocator';
import { TestFileParser } from './TestFileParser';
import { TestFunction } from './TestFunction';
import { TestInTestFile } from './TestInTestFile';
import { Worker } from 'worker_threads';
import { Runner } from './Runner';
import { TestResultState } from './TestResult';

jest.mock('./Config');
jest.mock('worker_threads');

describe('Runner', () => {
  const expectedConfigFilePath = 'expectedConfigFilePath';
  const expectedTestFilePaths = ['path1', 'path2'];

  let runner: Runner;

  beforeEach(() => {
    const config = new Config();
    config.locator = new TestTestFileLocator();
    config.parser = new TestTestFileParser();

    (Config.load as jest.Mock).mockResolvedValue(config);

    runner = new Runner();
  });

  it.skip('should load config from config file path', async () => {
    await runner.run(expectedConfigFilePath);

    expect(Config.load).toBeCalledWith(expectedConfigFilePath);
  });

  it.skip('should initialize test worker', async () => {
    await runner.run(expectedConfigFilePath);

    expect(Worker).toHaveBeenCalledWith(`${__dirname}/TestWorker.js`, {
      workerData: {
        testInTestFile: {
          testFilePath: expectedTestFilePaths[0],
          testName: 'test1',
        },
        configFilePath: expectedConfigFilePath,
      },
    });

    expect(Worker).toHaveBeenCalledWith(`${__dirname}/TestWorker.js`, {
      workerData: {
        testInTestFile: {
          testFilePath: expectedTestFilePaths[0],
          testName: 'test2',
        },
        configFilePath: expectedConfigFilePath,
      },
    });

    expect(Worker).toHaveBeenCalledWith(`${__dirname}/TestWorker.js`, {
      workerData: {
        testInTestFile: {
          testFilePath: expectedTestFilePaths[1],
          testName: 'test1',
        },
        configFilePath: expectedConfigFilePath,
      },
    });

    expect(Worker).toHaveBeenCalledWith(`${__dirname}/TestWorker.js`, {
      workerData: {
        testInTestFile: {
          testFilePath: expectedTestFilePaths[1],
          testName: 'test2',
        },
        configFilePath: expectedConfigFilePath,
      },
    });
  });

  it('should reject on test worker error', () => {});

  it.skip('should resolve test results on test worker exit', async () => {
    runner.run(expectedConfigFilePath).then(results => {
      expect(results).toStrictEqual([
        [
          {
            testFilePath: 'path1',
            testName: 'test1',
          },
          TestResultState.PASS,
        ],
        [
          {
            testFilePath: 'path1',
            testName: 'test2',
          },
          TestResultState.PASS,
        ],
        [
          {
            testFilePath: 'path2',
            testName: 'test1',
          },
          TestResultState.PASS,
        ],
        [
          {
            testFilePath: 'path2',
            testName: 'test2',
          },
          TestResultState.PASS,
        ],
      ]);
    });

    const workers: Array<Worker> = (Worker as any).mock.instances;

    debugger;

    processWorker(workers[0], {
      testFilePath: 'path1',
      testName: 'test1',
    });

    processWorker(workers[1], {
      testFilePath: 'path1',
      testName: 'test2',
    });

    processWorker(workers[2], {
      testFilePath: 'path2',
      testName: 'test1',
    });

    processWorker(workers[3], {
      testFilePath: 'path2',
      testName: 'test2',
    });
  });

  function processWorker(
    worker: Worker,
    testInTestFile: TestInTestFile,
    state: TestResultState = TestResultState.PASS
  ) {
    worker.emit('message', [
      testInTestFile,
      {
        state,
        time: 0,
      },
    ]);

    worker.emit('exit', 0);
  }

  class TestTestFileLocator extends TestFileLocator {
    async locateTestFilePaths(): Promise<Array<string>> {
      return expectedTestFilePaths;
    }
  }

  class TestTestFileParser extends TestFileParser {
    async getTests(testFilePath: string): Promise<TestInTestFile[]> {
      return [
        { testFilePath, testName: 'test1' },
        { testFilePath, testName: 'test2' },
      ];
    }

    getTestFunction(_: string, __: string): Promise<TestFunction> {
      throw new Error('Method not implemented.');
    }
  }
});
