import { performance } from 'perf_hooks';
import { DefaultTestExecutor } from './DefaultTestExecutor';
import { TestFunction } from './TestFunction';
import { TestResultState } from './TestResult';

jest.mock('perf_hooks');

describe('DefaultTestExecutor', () => {
  const expectedStartTime = 1;
  const expectedEndTime = 5;
  const expectedTimeDelta = expectedEndTime - expectedStartTime;

  let testFunction: jest.MockedFunction<TestFunction>;
  let executor: DefaultTestExecutor;

  beforeEach(() => {
    testFunction = jest.fn();
    executor = new DefaultTestExecutor();

    (performance.now as jest.Mock).mockReturnValueOnce(expectedStartTime);
    (performance.now as jest.Mock).mockReturnValueOnce(expectedEndTime);
  });

  it('should call test function', async () => {
    await executor.executeTest(testFunction);

    expect(testFunction).toHaveBeenCalledWith();
  });

  it('should return passing test result when test function does not throw error', async () => {
    const testResult = await executor.executeTest(testFunction);

    expect(testResult).toStrictEqual({
      state: TestResultState.PASS,
      time: expectedTimeDelta,
    });
  });

  it('should return failing test result when test function throws error', async () => {
    const expectedErrorMessage = 'expectedErrorMessage';

    (testFunction as jest.Mock).mockImplementation(() => {
      throw new Error(expectedErrorMessage);
    });

    const testResult = await executor.executeTest(testFunction);

    expect(testResult).toStrictEqual({
      state: TestResultState.FAIL,
      message: expectedErrorMessage,
      time: expectedTimeDelta,
    });
  });
});
