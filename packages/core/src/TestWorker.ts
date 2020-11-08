import path from 'path';
import { isMainThread, parentPort, workerData } from 'worker_threads';
import { Config } from './Config';

if (isMainThread) {
  throw new Error('Test worker can not run on main thread');
}

async function worker() {
  const { testInTestFile, configFilePath } = workerData;
  const { testFilePath, testName } = testInTestFile;

  const configFileCwd = path.join(process.cwd(), configFilePath);
  const configFile = await Config.load(configFileCwd);

  const test = await configFile.parser.getTestFunction(testFilePath, testName);

  const result = await configFile.executor.executeTest(test);

  parentPort?.postMessage([testInTestFile, result]);
}

worker();
