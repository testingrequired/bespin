import { TestFunction } from './TestFunction';

// Core

export class TestInTestFile {
  constructor(
    public readonly testFilePath: string,
    public readonly testName: string,
    public readonly testFunction: TestFunction
  ) {}
}
