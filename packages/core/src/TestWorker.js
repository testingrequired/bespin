const path = require('path');
const { isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  throw new Error('Test worker can not run on main thread');
}

async function worker() {
  const { testInTestFile, configFilePath } = workerData;
  const { testFilePath, testName } = testInTestFile;

  const configFile = require(path.join(process.cwd(), configFilePath));

  if (!configFile.locator || !configFile.parser || !configFile.executor) {
    throw new Error('Incomplete config file');
  }

  const test = await configFile.parser.getTestFunction(testFilePath, testName);

  const result = await configFile.executor.executeTest(test);

  parentPort.postMessage([testInTestFile, result]);
}

worker();
