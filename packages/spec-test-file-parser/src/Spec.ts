import { TestFunction } from '@testingrequired/bespin-core';

export class Spec {
  private tests: Array<[string, TestFunction]> = [];
  private descriptions: Array<string> = [];
  private beforeEachs: Array<Function> = [];
  private afterEachs: Array<Function> = [];
  private beforeEachDelta: number = 0;
  private afterEachDelta: number = 0;

  constructor(private global: Record<string, any>) {
    this.describe = this.describe.bind(this);
    this.it = this.it.bind(this);
    this.beforeEach = this.beforeEach.bind(this);
    this.afterEach = this.afterEach.bind(this);
  }

  load(fn: () => void) {
    this.enableGlobals();
    fn();
    this.disableGlobals();
  }

  enableGlobals() {
    this.global.describe = this.global.with = this.global.context = this.describe;
    this.global.test = this.global.it = this.it;
    this.global.beforeEach = this.global.setup = this.beforeEach;
    this.global.afterEach = this.global.teardown = this.afterEach;
  }

  disableGlobals() {
    delete this.global.describe;
    delete this.global.with;
    delete this.global.context;
    delete this.global.it;
    delete this.global.test;
    delete this.global.beforeEach;
    delete this.global.setup;
    delete this.global.afterEach;
    delete this.global.teardown;
  }

  getTests(): Array<[string, TestFunction]> {
    return this.tests;
  }

  describe(description: string, fn: () => void) {
    this.descriptions.push(description);

    this.beforeEachDelta = 0;
    this.afterEachDelta = 0;

    fn();

    this.descriptions.pop();

    this.beforeEachs.splice(this.beforeEachDelta * -1, this.beforeEachDelta);
    this.beforeEachDelta = 0;

    this.afterEachs.splice(this.afterEachDelta * -1, this.afterEachDelta);
    this.afterEachDelta = 0;
  }

  it(should: string, fn: () => Promise<void>) {
    const sliceEnd = this.descriptions.length + 1;
    const testsBeforeEachs = this.beforeEachs.slice(0, sliceEnd);
    const testsAfterEachs = this.afterEachs.slice(0, sliceEnd);

    const testFn: TestFunction = async () => {
      for (const fn of testsBeforeEachs) {
        await fn();
      }

      await fn();

      for (const fn of testsAfterEachs) {
        await fn();
      }
    };

    const description = [...this.descriptions, should].join(' ');

    this.tests.push([description, testFn]);
  }

  beforeEach(fn: () => void) {
    this.beforeEachDelta++;
    this.beforeEachs.push(fn);
  }

  afterEach(fn: () => void) {
    this.afterEachDelta++;
    this.afterEachs.push(fn);
  }
}
