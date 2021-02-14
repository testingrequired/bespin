import { TestFileParser, TestInTestFile } from "@testingrequired/bespin-core";
import { Spec } from "./Spec";

declare var global: any;

export class SpecTestFileParser extends TestFileParser {
  async getTests(path: string): Promise<Array<TestInTestFile>> {
    const spec = new Spec(global);

    delete require.cache[require.resolve(path)];
    spec.load(() => require(path));

    const tests = spec.getTests();

    return tests.map(
      ([testName, testfn]) => new TestInTestFile(path, testName, testfn)
    );
  }
}
