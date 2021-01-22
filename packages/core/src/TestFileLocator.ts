export abstract class TestFileLocator {
  abstract locateTestFilePaths(): Promise<Array<string>>;
}
