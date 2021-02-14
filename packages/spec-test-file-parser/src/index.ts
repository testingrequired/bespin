import { TestFileParser, TestInTestFile } from "@testingrequired/bespin-core";
import { Spec } from "./Spec";

declare var global: any;

export class SpecTestFileParser extends TestFileParser {
  async getTests(path: string): Promise<Array<TestInTestFile>> {
    const spec = new Spec(global);

    spec.load(() => {
      delete require.cache[require.resolve(path)];
      require(path);
    });

    return spec
      .getTests()
      .map(([testName, testfn]) => new TestInTestFile(path, testName, testfn));
  }
}
