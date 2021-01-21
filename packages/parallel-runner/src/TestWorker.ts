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

  delete require.cache[require.resolve(testFilePath)];
  const test = await configFile.parser.getTestFunction(testFilePath, testName);

  const result = await executor.executeTest(test);

  parentPort?.postMessage([testInTestFile, result]);
});
