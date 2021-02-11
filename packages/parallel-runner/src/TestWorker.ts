import { isMainThread, parentPort } from 'worker_threads';
import { Config, TestExecutor } from '@testingrequired/bespin-core';

if (isMainThread) {
  throw new Error('Test worker can not run on main thread');
}

const executor = new TestExecutor();

parentPort?.on('message', async (data: any) => {
  const { testInTestFile, configFilePath } = data;
  const { testFilePath, testName } = testInTestFile;

  const configFile = await Config.load(configFilePath);

  const tests = await configFile.parser.getTests(
    testFilePath,
    configFile.globals
  );

  const test = tests.find(t => t.testName === testName);

  if (test) {
    const result = await executor.executeTest(test.testFn);

    parentPort?.postMessage([testInTestFile, result]);
  }
});
