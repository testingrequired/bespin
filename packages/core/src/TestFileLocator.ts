import { Middleware } from './Middleware';

export abstract class TestFileLocator extends Middleware {
  abstract locateTestFilePaths(): Promise<Array<string>>;
}
