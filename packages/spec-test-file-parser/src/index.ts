import {
  TestFileParser,
  TestInTestFile,
  TestFunction,
} from '@testingrequired/bespin-core';

declare var global: any;

export class SpecTestFileParse extends TestFileParser {
  async getTests(path: string): Promise<Array<TestInTestFile>> {
    const tests: Array<TestInTestFile> = [];
    const descriptions: Array<string> = [];
    const beforeEachs: Array<Function> = [];
    const afterEachs: Array<Function> = [];

    let beforeEachDelta = 0;
    let afterEachDelta = 0;

    function describe(description: string, fn: any) {
      beforeDescribe(description);
      fn();
      afterDescribe();
    }

    function beforeDescribe(description: string) {
      descriptions.push(description);
      beforeEachDelta = 0;
      afterEachDelta = 0;
    }

    function afterDescribe() {
      descriptions.pop();
      beforeEachs.splice(beforeEachDelta * -1, beforeEachDelta);
      beforeEachDelta = 0;
      afterEachs.splice(afterEachDelta * -1, afterEachDelta);
      afterEachDelta = 0;
    }

    global.describe = global.with = global.context = describe;

    global.beforeEach = global.setup = (fn: () => void) => {
      beforeEachDelta++;
      beforeEachs.push(fn);
    };

    global.afterEach = global.teardown = (fn: () => void) => {
      afterEachDelta++;
      afterEachs.push(fn);
    };

    function test(testDescription: string) {
      tests.push(
        new TestInTestFile(path, [...descriptions, testDescription].join(' '))
      );
    }

    global.test = global.it = test;

    require(path);

    delete global.describe;
    delete global.beforeEach;
    delete global.afterEach;
    delete global.test;

    return tests;
  }

  async getTestFunction(
    path: string,
    name: string,
    globals: Record<string, any>
  ): Promise<TestFunction> {
    const tests: Map<string, TestFunction> = new Map();
    const descriptions: Array<string> = [];
    const beforeEachs: Array<Function> = [];
    const afterEachs: Array<Function> = [];

    let beforeEachDelta = 0;
    let afterEachDelta = 0;

    function describe(description: string, fn: any) {
      beforeDescribe(description);
      fn();
      afterDescribe();
    }

    function beforeDescribe(description: string) {
      descriptions.push(description);
      beforeEachDelta = 0;
      afterEachDelta = 0;
    }

    function afterDescribe() {
      descriptions.pop();
      beforeEachs.splice(beforeEachDelta * -1, beforeEachDelta);
      beforeEachDelta = 0;
      afterEachs.splice(afterEachDelta * -1, afterEachDelta);
      afterEachDelta = 0;
    }

    global.describe = global.with = global.context = describe;

    global.beforeEach = global.setup = (fn: () => void) => {
      beforeEachDelta++;
      beforeEachs.push(fn);
    };

    global.afterEach = global.teardown = (fn: () => void) => {
      afterEachDelta++;
      afterEachs.push(fn);
    };

    function test(testDescription: string, testFn: TestFunction) {
      const describeDepth = descriptions.length;

      const sliceEnd = describeDepth + 1;
      const testsBeforeEachs = beforeEachs.slice(0, sliceEnd);
      const testsAfterEachs = afterEachs.slice(0, sliceEnd);

      const fn: TestFunction = async () => {
        await Promise.all(testsBeforeEachs.map(fn => fn()));
        global.globals = globals;

        Object.entries(globals).forEach(([key, value]) => {
          global[key] = value;
        });

        await testFn();

        Object.entries(globals).forEach(([key]) => {
          delete global[key];
        });

        await Promise.all(testsAfterEachs.map(fn => fn()));
      };

      tests.set(path + [...descriptions, testDescription].join(' '), fn);
    }

    global.test = global.it = test;

    delete require.cache[require.resolve(path)];
    require(path);

    delete global.describe;
    delete global.beforeEach;
    delete global.afterEach;
    delete global.test;

    const foundTest = tests.get(path + [...descriptions, name].join(' '));

    if (!foundTest) {
      throw new Error(`Test not found: ${name} in ${path}`);
    }

    return foundTest;
  }
}
