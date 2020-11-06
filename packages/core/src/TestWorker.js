const { isMainThread, parentPort, workerData } = require('worker_threads');
const { TestExecutor, TestFileParser } = require('./index');

if (isMainThread) {
  throw new Error('Test worker can not run on main thread');
}

async function worker() {
  const configFile = require(`${process.cwd()}/bespin.config.js`);

  if (!configFile.parser || !configFile.executor) {
    return;
  }

  const [testFilePath, testName] = workerData;

  const tests = await TestFileParser.getTests(
    [testFilePath],
    configFile.parser
  );

  const test = tests.find(
    t => t.testFilePath === testFilePath && t.testName === testName
  );

  if (!test) {
    return;
  }

  const results = await TestExecutor.getResults([test], configFile.executor);

  parentPort.postMessage([workerData, results[0]]);
}

worker();
