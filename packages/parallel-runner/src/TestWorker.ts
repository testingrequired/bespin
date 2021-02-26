import { isMainThread, parentPort } from "worker_threads";
import { Config, TestExecutor } from "@testingrequired/bespin-core";

if (isMainThread) {
  throw new Error("Test worker can not run on main thread");
}

const executor = new TestExecutor();

declare var global: any;

parentPort?.on("message", async (data: any) => {
  const { testInTestFile, configFilePath } = data;
  const { testFilePath, testName } = testInTestFile;

  const configFile = await Config.load(configFilePath);

  Object.entries(configFile.globals).forEach(([key, value]) => {
    global[key] = value;
  });

  const tests = await configFile.parser.getTests(testFilePath);

  const test = tests.find((t) => t.testName === testName);

  if (test) {
    const result = await executor.executeTest(
      test.testFn,
      configFile.settings.testTimeout
    );

    parentPort?.postMessage([{ testFilePath, testName }, result]);
  }

  Object.entries(configFile.globals).forEach(([key]) => {
    delete global[key];
  });
});
