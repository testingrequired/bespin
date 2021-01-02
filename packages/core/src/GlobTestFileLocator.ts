import { promisify } from 'util';
const glob = require('glob');
import { TestFileLocator } from './TestFileLocator';

export class GlobTestFileLocator extends TestFileLocator {
  private pattern: string;

  constructor(pattern = '**/*.test.js') {
    super();

    this.pattern = pattern;
  }

  locateTestFilePaths() {
    const globPromise = promisify(glob);
    return globPromise(this.pattern);
  }
}
