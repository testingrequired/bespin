import path from 'path';
import { isMainThread, parentPort } from 'worker_threads';
import { Config } from './Config';
import { DefaultTestExecutor } from './DefaultTestExecutor';

if (isMainThread) {
  throw new Error('Test worker can not run on main thread');
}

parentPort?.on('message', async (data: any) => {
  const { testInTestFile, configFilePath } = data;
  const { testFilePath, testName } = testInTestFile;

  const configFileCwd = path.join(process.cwd(), configFilePath);
  const configFile = await Config.load(configFileCwd);

  delete require.cache[require.resolve(testFilePath)];

  const test = await configFile.parser.getTestFunction(testFilePath, testName);

  const executor = new DefaultTestExecutor();
  const result = await executor.executeTest(test);

  parentPort?.postMessage([testInTestFile, result]);
});
