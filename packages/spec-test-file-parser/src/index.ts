import { TestFileParser, TestInTestFile } from "@testingrequired/bespin-core";
import { Spec } from "./Spec";

declare var global: any;

export class SpecTestFileParser extends TestFileParser {
  async getTests(path: string): Promise<Array<TestInTestFile>> {
    const spec = new Spec(global);

    delete require.cache[require.resolve(path)];
    spec.load(() => require(path));

    const testsInTestFiles = spec.getTests().map(([testName]) => {
      const spec = new Spec(global);

      delete require.cache[require.resolve(path)];
      spec.load(() => require(path));

      const foundTest = spec
        .getTests()
        .find(([testName2]) => testName2 === testName);

      const testFn = foundTest?.[1] ?? (async () => {});

      return new TestInTestFile(path, testName, testFn);
    });

    return testsInTestFiles;
  }
}
