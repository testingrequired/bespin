import { TestFileParser, TestInTestFile } from "@testingrequired/bespin-core";
import { Spec } from "./Spec";

declare var global: any;

export class SpecTestFileParser extends TestFileParser {
  async getTests(testFilePath: string): Promise<Array<TestInTestFile>> {
    const spec = new Spec(global);

    delete require.cache[require.resolve(testFilePath)];
    spec.load(() => require(testFilePath));

    const testsInTestFiles = spec.getTests().map(([testName]) => {
      const spec = new Spec(global);

      delete require.cache[require.resolve(testFilePath)];
      spec.load(() => require(testFilePath));

      const foundTest = spec
        .getTests()
        .find(([testName2]) => testName2 === testName);

      if (!foundTest) {
        throw new Error(
          `Unable to find test ${testName} in file: ${testFilePath} on second pass of parsing`
        );
      }

      const testFn = foundTest[1];

      return new TestInTestFile(testFilePath, testName, testFn);
    });

    return testsInTestFiles;
  }
}
