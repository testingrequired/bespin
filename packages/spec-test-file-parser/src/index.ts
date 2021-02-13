import {
  TestFileParser,
  TestInTestFile,
  TestFunction,
} from '@testingrequired/bespin-core';

declare var global: any;

export class SpecTestFileParser extends TestFileParser {
  async getTests(
    path: string,
    globals: Record<string, any>
  ): Promise<Array<TestInTestFile>> {
    const tests: Array<TestInTestFile> = [];
    const descriptions: Array<string> = [];
    const beforeEachs: Array<Function> = [];
    const afterEachs: Array<Function> = [];

    let beforeEachDelta = 0;
    let afterEachDelta = 0;

    function describe(description: string, fn: any) {
      descriptions.push(description);

      beforeEachDelta = 0;
      afterEachDelta = 0;

      fn();

      descriptions.pop();

      beforeEachs.splice(beforeEachDelta * -1, beforeEachDelta);
      beforeEachDelta = 0;

      afterEachs.splice(afterEachDelta * -1, afterEachDelta);
      afterEachDelta = 0;
    }

    function beforeEach(fn: () => void) {
      beforeEachDelta++;
      beforeEachs.push(fn);
    }

    function afterEach(fn: () => void) {
      afterEachDelta++;
      afterEachs.push(fn);
    }

    function test(testDescription: string, fn: () => void) {
      const sliceEnd = descriptions.length + 1;
      const testsBeforeEachs = beforeEachs.slice(0, sliceEnd);
      const testsAfterEachs = afterEachs.slice(0, sliceEnd);

      const testFn: TestFunction = async () => {
        for (const fn of testsBeforeEachs) {
          await fn();
        }

        Object.entries(globals).forEach(([key, value]) => {
          global[key] = value;
        });

        await fn();

        Object.entries(globals).forEach(([key]) => {
          delete global[key];
        });

        for (const fn of testsAfterEachs) {
          await fn();
        }
      };

      const description = [...descriptions, testDescription].join(' ');

      tests.push(new TestInTestFile(path, description, testFn));
    }

    global.describe = global.with = global.context = describe;
    global.beforeEach = global.setup = beforeEach;
    global.afterEach = global.teardown = afterEach;
    global.test = global.it = test;

    delete require.cache[require.resolve(path)];
    require(path);

    delete global.describe;
    delete global.beforeEach;
    delete global.afterEach;
    delete global.test;

    return tests;
  }
}
