import { TestFunction } from "./TestFunction";

export class TestInTestFile {
  constructor(
    public readonly testFilePath: string,
    public readonly testName: string,
    public readonly testFn: TestFunction
  ) {}
}
